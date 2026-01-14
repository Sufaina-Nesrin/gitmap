import fetch from "node-fetch";
import crypto from "crypto";

const GITHUB_API = "https://api.github.com";

export async function fetchRepoDetails(owner, repo) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch repo details");
  }

  return res.json();
}

export async function fetchRepoLanguages(owner, repo) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch repo languages");
  }

  return res.json();
}

export async function analyzeRepository(repoUrl) {
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
