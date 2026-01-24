const IGNORE_FOLDERS = [
  "/images/",
  "/image/",
  "/assets/",
  "/public/",
  "/node_modules/",
  "/dist/",
  "/build/",
];
const IGNORE_FILES = ["package-lock.json", ".gitignore"];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const IGNORE_EXTENSIONS = [".css", ".svg"];

const IGNORE_PATTERNS = [
  ".test.", // test files
  "__tests__", // test folders
];

function filterNonCodeFiles(rawFileList) {
  return rawFileList.filter((file) => {
    const lower = file.toLowerCase();

    // ❌ ignore folders
    if (IGNORE_FOLDERS.some((folder) => lower.includes(folder))) {
      return false;
    }

    // ❌ ignore image extensions
    if (IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return false;
    }

    // ❌ ignore other extensions (css, svg)
    if (IGNORE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return false;
    }

    // ❌ ignore test files / folders
    if (IGNORE_PATTERNS.some((pattern) => lower.includes(pattern))) {
      return false;
    }
    if (IGNORE_FILES.some((f) => lower.endsWith(f))) {
      return false;
    }

    return true; // ✅ keep only relevant code/config files
  });
}

async function getRepoFilePaths(owner, repo, branch) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();

  return data.tree
    .filter((item) => item.type === "blob") // only files
    .map((item) => item.path); // extract file path
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

function fileArrayToString(files) {
  return `"${files.join(", ")}"`;
}

module.exports = {
  parseGithubRepo,
  getRepoFilePaths,
  fileArrayToString,
  filterNonCodeFiles,
};
