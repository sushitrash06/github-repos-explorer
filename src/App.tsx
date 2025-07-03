import { useState, useEffect, type JSX } from "react";
import axios from "axios";
import { Card, CardContent, Input, Skeleton, Badge } from "./components";
import { useDebounce } from "use-debounce";
import {
  FaArrowDown,
  FaArrowUp,
  FaBug,
  FaBuilding,
  FaCodeBranch,
  FaComments,
  FaRegCommentDots,
  FaStar,
  FaUser,
  FaUsers,
} from "react-icons/fa6";
import { GoIssueOpened } from "react-icons/go";
import { PiGitForkBold } from "react-icons/pi";
import { LuDot } from "react-icons/lu";
import type { GitHubUser, Repo } from "./type/types";
import { RepoPopup } from "./components/pop-up-more-repo";

export default function GitHubExplorer() {
  const [query, setQuery] = useState("");
  const [debouncedQuickSearch] = useDebounce(query, 400);
  const [suggestions, setSuggestions] = useState<Repo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sort, setSort] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userRepos, setUserRepos] = useState<Record<string, Repo[]>>({});
  const [loadingUserRepos, setLoadingUserRepos] = useState<string | null>(null);
  const [allUserRepos, setAllUserRepos] = useState<Repo[]>([]);
  const [hasMoreRepos, setHasMoreRepos] = useState(true);
  const [repoPage, setRepoPage] = useState(1);
  const [showMoreRepos, setShowMoreRepos] = useState(false);

  const tabs = ["Users", "Repositories", "Issues", "Discussions"];
  const [activeTab, setActiveTab] = useState("Users");

  const tabIcons: Record<string, JSX.Element> = {
    Repositories: <FaCodeBranch className="text-blue-500" />,
    Users: <FaUsers className="text-green-600" />,
    Issues: <FaBug className="text-yellow-500" />,
    Discussions: <FaComments className="text-purple-500" />,
  };
  const fetchReposPage = async (username: string, pageNum: number) => {
    const res = await axios.get<Repo[]>(
      `https://api.github.com/users/${username}/repos`,
      { params: { per_page: 5, page: pageNum, sort: "updated" } }
    );
    return res.data;
  };

  const loadMoreRepos = async () => {
    if (!expandedUser) return;
    const nextPage = repoPage + 1;
    const newRepos = await fetchReposPage(expandedUser, nextPage);
    setAllUserRepos((prev) => [...prev, ...newRepos]);
    setRepoPage(nextPage);
    if (newRepos.length < 5) setHasMoreRepos(false);
  };
  useEffect(() => {
    if (!query) return;
    axios
      .get(`https://api.github.com/search/repositories?q=${query}&per_page=5`)
      .then((res) => setSuggestions(res.data.items))
      .catch(() => setSuggestions([]));
  }, [debouncedQuickSearch]);

  const fetchUserRepos = async (username: string) => {
    setLoadingUserRepos(username);
    try {
      const res = await axios.get(
        `https://api.github.com/users/${username}/repos?per_page=5`
      );
      setUserRepos((prev) => ({ ...prev, [username]: res.data }));
    } catch {
      setUserRepos((prev) => ({ ...prev, [username]: [] }));
    } finally {
      setLoadingUserRepos(null);
    }
  };

  useEffect(() => {
    if (!query) return;
    fetchByTab();
  }, [page, perPage, sort, sortDir, activeTab]);

  const handleSearch = () => {
    setPage(1);
    fetchByTab(1);
    fetchTabCounts();
    setShowSuggestions(false);
  };

  const fetchByTab = async (forcedPage?: number) => {
    if (!query) return;
    setLoading(true);
    setError("");
    const pageToFetch = forcedPage || page;
    const sortQuery = sort ? `&sort=${sort}&order=${sortDir}` : "";
    const urlMap: Record<string, string> = {
      Repositories: `https://api.github.com/search/repositories?q=${query}&page=${pageToFetch}&per_page=${perPage}${sortQuery}`,
      Users: `https://api.github.com/search/users?q=${query}&page=${pageToFetch}&per_page=${perPage}`,
      Issues: `https://api.github.com/search/issues?q=${query}+type:issue&page=${pageToFetch}&per_page=${perPage}`,
      Discussions: `https://api.github.com/search/issues?q=${query}+type:discussion&page=${pageToFetch}&per_page=${perPage}`,
    };

    try {
      const res = await axios.get(urlMap[activeTab]);
      activeTab === "Users"
        ? setUsers(res.data.items)
        : setRepos(res.data.items);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTabCounts = async () => {
    const urls = {
      Repositories: `https://api.github.com/search/repositories?q=${query}`,
      Users: `https://api.github.com/search/users?q=${query}`,
      Issues: `https://api.github.com/search/issues?q=${query}+type:issue`,
      Discussions: `https://api.github.com/search/issues?q=${query}+type:discussion`,
    };
    try {
      const results = await Promise.all(
        Object.entries(urls).map(([k, u]) =>
          axios.get(u).then((r) => [k, r.data.total_count])
        )
      );
      setTabCounts(Object.fromEntries(results));
    } catch {
      setTabCounts({});
    }
  };

  const formatDateDiff = (isoDate?: string) => {
    if (!isoDate) return "";
    const updated = new Date(isoDate);
    return `Updated on ${updated.toLocaleString("default", {
      month: "short",
    })} ${updated.getDate()}`;
  };

  const extractRepoPath = (url?: string) =>
    url?.replace("https://api.github.com/repos/", "") || "";

  const totalItems = tabCounts[activeTab] || 0;
  const totalPages = Math.ceil(totalItems / perPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);

      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex justify-center items-center gap-1 mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={i} className="px-3 py-1">
              {p}
            </span>
          ) : (
            <button
              key={i}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded border ${
                page === p
                  ? "bg-blue-500 text-blue-400"
                  : "bg-white text-gray-800"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub Explorer</h1>

      <div className="relative mb-4">
        <Input
          placeholder="Search GitHub..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setQuery(s.name);
                  setShowSuggestions(false);
                  handleSearch();
                }}
              >
                {s.full_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSearch} className="btn btn-primary mb-4">
        Search
      </button>

      <div className="flex gap-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
              fetchByTab(1);
            }}
            className={`pb-2 flex items-center gap-2 border-b-2 transition-colors duration-200 ${
              activeTab === tab
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {tabIcons[tab]} {tab}
            {tabCounts[tab] !== undefined && (
              <span className="text-xs text-gray-400 ml-1">
                ({Intl.NumberFormat().format(tabCounts[tab])})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between mb-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border ${
              sort === "stars" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              setSort("stars");
              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            }}
          >
            <FaStar /> Stars{" "}
            {sort === "stars" &&
              (sortDir === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Per page:</label>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border p-1 rounded"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : activeTab === "Users" ? (
        <div className="flex flex-col gap-4 mb-4">
          {users.map((user) => {
            const isExpanded = expandedUser === user.login;
            const repos = userRepos[user.login] || [];

            return (
              <div key={user.id}>
                <Card
                  onClick={() => {
                    const willExpand = expandedUser !== user.login;
                    setExpandedUser(willExpand ? user.login : null);
                    if (willExpand && !userRepos[user.login]) {
                      fetchUserRepos(user.login);
                    }
                  }}
                >
                  <div className="p-4 flex items-center gap-4 cursor-pointer">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-14 h-14 rounded-full"
                    />
                    <div>
                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {user.login}
                      </a>
                      <div className="flex items-center text-sm text-gray-600 mt-1 gap-4">
                        {user.user_view_type === "public" ? (
                          <span className="flex items-center gap-1">
                            🌐 Public
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            🔒 Private
                          </span>
                        )}
                        <Badge className="flex items-center gap-1">
                          {user.type === "Organization" ? (
                            <>
                              <FaBuilding className="text-gray-500" />{" "}
                              Organization
                            </>
                          ) : (
                            <>
                              <FaUser className="text-gray-500" /> User
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                {isExpanded && (
                  <div className="ml-6 mt-2">
                    {loadingUserRepos === user.login ? (
                      <Skeleton className="h-20 w-full" />
                    ) : repos.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No repositories found.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {repos.map((repo) => (
                          <Card key={repo.id}>
                            <CardContent>
                              <p className="text-blue-600 font-semibold hover:underline">
                                <a
                                  href={repo.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {repo.full_name}
                                </a>
                              </p>
                              <p className="text-sm text-gray-700">
                                {repo.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <span className="flex items-center gap-1">
                                  <FaStar /> {repo.stargazers_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <PiGitForkBold /> {repo.forks_count}
                                </span>
                                <span>{formatDateDiff(repo.updated_at)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <span
                          onClick={async () => {
                            setHasMoreRepos(true);
                            setRepoPage(1);
                            const firstPage = await fetchReposPage(
                              user.login,
                              1
                            );
                            setAllUserRepos(firstPage);
                            setExpandedUser(user.login); // optional
                            setShowMoreRepos(true); // ← ini penting!
                          }}
                          className="cursor-pointer text-blue-600 hover:underline text-sm"
                        >
                          See More
                        </span>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="space-y-2">
          {repos.map((repo) => (
            <li key={repo.id}>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                <Card>
                  <CardContent>
                    {activeTab === "Discussions" ? (
                      <>
                        <p className="text-sm text-gray-500">
                          {extractRepoPath(repo.repository_url)}
                        </p>
                        <p className="text-blue-600 font-semibold hover:underline">
                          {repo.title}
                        </p>
                        <p className="line-clamp-2 text-sm text-gray-700">
                          {repo.body}
                        </p>
                        <div className="flex items-center text-sm text-gray-600 gap-2 mt-1">
                          <img
                            src={repo.user?.avatar_url}
                            alt={repo.user?.login}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="font-medium">
                            {repo.user?.login}
                          </span>
                          <span>{formatDateDiff(repo.created_at)}</span>
                          <LuDot />
                          <FaRegCommentDots className="text-gray-400" />
                          <span>{repo.comments}</span>
                        </div>
                      </>
                    ) : activeTab === "Issues" ? (
                      <>
                        <p className="text-sm text-gray-500">
                          {extractRepoPath(repo.repository_url)}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <GoIssueOpened className="text-green-600" />
                          <span className="font-medium text-blue-600 hover:underline">
                            {repo.title}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-1">
                          <img
                            src={repo.user?.avatar_url}
                            alt={repo.user?.login}
                            className="w-5 h-5 rounded-full"
                          />
                          {repo.user?.login}
                          <LuDot />
                          {formatDateDiff(repo.created_at)}
                          <LuDot />#{repo.number}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={repo.owner?.avatar_url}
                            alt={repo.owner?.login}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-blue-600 font-medium hover:underline">
                            {repo.full_name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">
                          {repo.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {repo.topics?.map((topic) => (
                            <Badge key={topic}>{topic}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-yellow-800"></span>
                            {repo.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar /> {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <PiGitForkBold /> {repo.forks_count}
                          </span>
                          <span>{formatDateDiff(repo.updated_at)}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      )}
      {!loading && renderPagination()}
      {showMoreRepos && (
        <RepoPopup
          title="More Repositories"
          repos={allUserRepos}
          loadMore={loadMoreRepos}
          hasMore={hasMoreRepos}
          onClose={() => setShowMoreRepos(false)}
        />
      )}
    </div>
  );
}
