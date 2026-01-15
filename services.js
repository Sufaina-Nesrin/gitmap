const crypto = require("crypto");

const GITHUB_API = "https://api.github.com";

async function fetchRepoDetails(owner, repo) {
  const headers = {
    Accept: "application/vnd.github+json",
  };

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}

async function fetchRepoLanguages(owner, repo) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch repo languages");
  }

  return res.json();
}
function parseGithubRepo(repoUrl) {
  try {
    const url = new URL(repoUrl);

    if (url.hostname !== "github.com") {
      throw new Error("Not a GitHub URL");
    }

    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      throw new Error("Invalid GitHub repository URL");
    }

    const [owner, repo] = parts;

    return { owner, repo };
  } catch (err) {
    throw new Error("Invalid repository URL format");
  }
}

async function analyzeRepository(repoUrl) {
  const { owner, repo } = parseGithubRepo(repoUrl);
  const analysisId = crypto.randomBytes(4).toString("hex");

  // 1. Fetch metadata
  const repoDetails = await fetchRepoDetails(owner, repo);
  const languages = await fetchRepoLanguages(owner, repo);

  // 2. Simple classification logic
  const primaryLanguage = repoDetails.language;
  const isFrontend =
    primaryLanguage === "JavaScript" &&
    ("HTML" in languages || "CSS" in languages);

  const repoType = isFrontend ? "frontend" : "backend/library";

  return {
    analysisId,
    repo: `${owner}/${repo}`,
    repoType,
    primaryLanguage,
    stars: repoDetails.stargazers_count,
    forks: repoDetails.forks_count,
    sizeKB: repoDetails.size,
    topics: repoDetails.topics,
    message: "Repository metadata analyzed",
  };
}

module.exports = { analyzeRepository, fetchRepoLanguages, fetchRepoDetails };
