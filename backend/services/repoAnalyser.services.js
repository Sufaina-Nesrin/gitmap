const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv/config");

// 1. Initialize the API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
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
function fileArrayToString(files) {
  return `"${files.join(", ")}"`;
}

/////////////////////////////////////////////////
async function fetchAllFiles(repoUrl) {
  try {
    const { owner, repo } = parseGithubRepo(repoUrl);
    const repoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!repoRes.ok) {
      throw new Error("Failed to fetch repository info");
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;
    const files = await getRepoFilePaths(owner, repo, defaultBranch);
    const result = filterNonCodeFiles(files);
    const finalResult = fileArrayToString(result);
    console.log("result--", result);
    return { result: finalResult, rawFileList: result, owner, repo };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch repository info");
    // return err;
  }
}

function getAllManifests(rawFileList) {
  const COMMON_MANIFESTS = [
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "Cargo.toml",
    "composer.json",
    "pubspec.yaml",
    "Gemfile",
    "mix.exs",
  ];

  return rawFileList.filter((file) =>
    COMMON_MANIFESTS.includes(file.split("/").pop()),
  );
}
async function getRepoAnalysis(fileList, manifestContent) {
  const prompt = `
Analyze the following subproject from a GitHub repository.

Files:
${fileList}

Manifest:
${manifestContent}

Output STRICTLY in this format.
Keep explanations short and beginner-friendly.
Use one line per bullet.

📦 Project Type:
(Short description of the project.)

🚀 Entry Point:
(Main file to start reading.)

🔄 Code Flow:
(Simple file flow using arrows or bullets.)

🧩 Key Files:
(List important files with one-line purpose.)

🚫 Ignore Files:
(List files beginners can skip initially.)
`;

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing repo:", error);
  }
}
function groupFilesByRoot(rawFileList, manifestPaths) {
  const projects = {};

  for (const manifestPath of manifestPaths) {
    const root = manifestPath.split("/")[0]; // frontend, backend

    projects[root] = rawFileList.filter((file) => file.startsWith(root + "/"));
  }

  return projects;
}

async function fetchFileContent(owner, repo, filePath) {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // 'Authorization': `token YOUR_GITHUB_TOKEN` // Uncomment if using a token
      },
    });

    const base64Content = response.data.content;
    const textContent = Buffer.from(base64Content, "base64").toString("utf-8");
    const singleLine = textContent.replace(/\n/g, "");

    console.log("textContent=", singleLine);

    return singleLine;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn(`File not found: ${filePath}`);
    } else {
      console.error(`Error fetching ${filePath}:`, error.message);
    }
    return null;
  }
}

module.exports = {
  fetchAllFiles,
  getAllManifests,
  getRepoAnalysis,
  groupFilesByRoot,
  fetchFileContent,
};
