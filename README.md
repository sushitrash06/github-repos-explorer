# 🐱‍💻 GitHub Explorer

GitHub Explorer is a React + TypeScript application for searching and exploring GitHub users, repositories, issues, and discussions. It features live search suggestions, pagination, sorting, and expandable user sections.

---

## 📋 Table of Contents

- [✨ Features](#-features)  
- [🧱 Tech Stack](#-tech-stack)  
- [📋 Prerequisites](#-prerequisites)  
- [🚀 Installation & Setup](#-installation--setup)  
- [▶️ Usage](#-usage)  
- [🤝 Contributing](#-contributing)  
- [📄 License](#-license)

---

## ✨ Features

- 🔍 Search for **Users**, **Repositories**, **Issues**, **Discussions**  
- ✅ Live suggestion dropdown using `debounce`  
- 📄 Pagination with adjustable page size  
- ⭐ Sort repositories by star count  
- 📂 Click on a user to expand and view their repositories  
- 🧵 Loading skeletons and error handling for smooth UX  

---

## 🧱 Tech Stack

- **React** & **TypeScript** – UI framework and type safety  
- **Axios** – HTTP client for GitHub API calls  
- **use-debounce** – Debounce input for suggestions  
- **Tailwind CSS** – Utility-first CSS framework  
- **react-icons** – Displaying icons & visuals  

---

## 📋 Prerequisites

- **Node.js** v14 or newer  
- **npm** or **yarn** package manager  

---

## 🚀 Installation & Setup

```bash
# Clone the repo
git clone https://github.com/your-username/github-explorer.git
cd github-explorer

# Install dependencies
npm install      # or yarn install

# Start the development server
npm start        # or yarn start
