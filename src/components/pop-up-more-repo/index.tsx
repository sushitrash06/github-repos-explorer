import { useRef, useCallback } from "react";
import { FaStar, FaUsers, FaBuilding } from "react-icons/fa6";
import { PiGitForkBold } from "react-icons/pi";
import type { GitHubUserDetail, Repo } from "../../type/types";
import { Card } from "../ui/card";
import { CardContent } from "../ui/card-component";
import { FaMapMarkerAlt } from "react-icons/fa";

interface RepoPopupProps {
  title: string;
  repos: Repo[];
  detail: GitHubUserDetail | null;
  loadMore: () => void;
  hasMore: boolean;
  onClose: () => void;
}

export const RepoPopup = ({
  title,
  repos,
  loadMore,
  detail,
  hasMore,
  onClose,
}: RepoPopupProps) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastRepoRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMore]
  );

  const formatDateDiff = (isoDate?: string) => {
    if (!isoDate) return "";
    const updated = new Date(isoDate);
    return `Updated on ${updated.toLocaleString("default", {
      month: "short",
    })} ${updated.getDate()}`;
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[480px] max-h-[80vh] flex flex-col overflow-hidden">

        {/* Sticky Header with Detail */}
        <div className="sticky top-0 z-10 bg-white p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-4">
              <img
                src={detail?.avatar_url}
                alt={detail?.login}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h2 className="font-bold text-lg">{detail?.name || title}</h2>
                <a
                  href={detail?.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline"
                >
                  @{detail?.login}
                </a>
                {detail?.bio && (
                  <p className="text-sm text-gray-600 mt-1">{detail?.bio}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-sm text-gray-600">
              Close
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FaUsers /> {detail?.followers} followers
            </span>
            <span className="flex items-center gap-1">
              • {detail?.following} following
            </span>
            {detail?.location && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt /> {detail?.location}
              </span>
            )}
            {detail?.company && (
              <span className="flex items-center gap-1">
                <FaBuilding /> {detail?.company}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Repo List */}
        <div className="p-6 overflow-y-auto">
          {repos.length === 0 ? (
            <p className="text-gray-500 text-sm">No repositories found.</p>
          ) : (
            <ul className="space-y-4">
              {repos.map((repo, idx) => {
                const isLast = idx === repos.length - 1;
                return (
                  <div key={repo.id} ref={isLast ? lastRepoRef : null}>
                    <Card>
                      <CardContent>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          {repo.full_name}
                        </a>
                        <p className="text-sm text-gray-700">{repo.description}</p>
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
                  </div>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
