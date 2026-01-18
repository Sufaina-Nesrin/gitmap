const crypto = require("crypto");
const axios = require("axios");
const { rankImportantFiles } = require("./routes/utils");

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
  const files = await getRepoFilePaths(owner, repo);

  const result = filterCodeFiles(files);
  console.log("result--", result);
  const finalResult = fileArrayToString(result);

  console.log(finalResult);
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

function fileArrayToString(files) {
  return `"${files.join(", ")}"`;
}

async function getRepoFilePaths(owner, repo, branch = "master") {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();

  return data.tree
    .filter((item) => item.type === "blob") // only files
    .map((item) => item.path); // extract file path
}

async function fetchGitHubFile(repoUrl, filePath = "package.json") {
  try {
    const { owner, repo } = parseGithubRepo(repoUrl);

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // 'Authorization': `token YOUR_GITHUB_TOKEN` // Uncomment if using a token
      },
    });

    const base64Content = response.data.content;
    const textContent = Buffer.from(base64Content, "base64").toString("utf-8");

    return textContent;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn(`File not found: ${filePath}`);
    } else {
      console.error(`Error fetching ${filePath}:`, error.message);
    }
    return null;
  }
}

const IGNORE_EXTENSIONS = [".css", ".svg"];

const IGNORE_PATTERNS = [
  ".test.", // test files
  "__tests__", // test folders
];

const IGNORE_FOLDERS = [
  "README.md",
  ".gitignore",
  ".git",
  ".github",
  "node_modules",
  "public",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  "assets",
];

function filterCodeFiles(files) {
  return files.filter((file) => {
    // ignore by extension
    if (IGNORE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
      return false;
    }

    // ignore by pattern
    if (IGNORE_PATTERNS.some((pattern) => file.includes(pattern))) {
      return false;
    }

    // ignore exact files or folders
    if (
      IGNORE_FOLDERS.some(
        (ignore) => file === ignore || file.startsWith(ignore + "/")
      )
    ) {
      return false;
    }

    return true;
  });
}
//---------------------Day-02----------------------------//
function getNodeEntrypointFromPackageJson(pkg, files) {
  const fileSet = new Set(files);

  // 1. main
  if (pkg.main && fileSet.has(pkg.main)) {
    return pkg.main;
  }

  // 2. exports (string only)
  if (typeof pkg.exports === "string" && fileSet.has(pkg.exports)) {
    return pkg.exports;
  }

  // 3. bin
  if (typeof pkg.bin === "string" && fileSet.has(pkg.bin)) {
    return pkg.bin;
  }

  if (typeof pkg.bin === "object") {
    const binPath = Object.values(pkg.bin)[0];
    if (fileSet.has(binPath)) {
      return binPath;
    }
  }

  // 4. start script
  if (pkg.scripts?.start) {
    const match = pkg.scripts.start.match(/node\s+([^\s]+)/);
    if (match && fileSet.has(match[1])) {
      return match[1];
    }
  }

  return null;
}

function getEntrypointFromManifest(manifestName, manifestContent, files) {
  const fileSet = new Set(files);

  switch (manifestName) {
    // ---------------- PYTHON ----------------
    case "pyproject.toml": {
      // Look for [project.scripts] or [tool.poetry.scripts]
      const scripts =
        manifestContent?.project?.scripts ||
        manifestContent?.tool?.poetry?.scripts;

      if (scripts && typeof scripts === "object") {
        const entry = Object.values(scripts)[0]; // e.g. "mypkg.cli:main"
        if (typeof entry === "string") {
          const filePath = entry.split(":")[0].replace(/\./g, "/") + ".py";
          if (fileSet.has(filePath)) {
            return filePath;
          }
        }
      }

      return null;
    }

    case "requirements.txt":
      // Python apps rarely define entrypoints here
      return null;

    // ---------------- GO ----------------
    case "go.mod": {
      // Go entrypoint is ALWAYS a main package
      // but not declared in go.mod
      const mainGo = files.find((f) => f.endsWith("main.go"));
      return mainGo || null;
    }

    // ---------------- DOTNET / C# ----------------
    case ".csproj": {
      // .NET entrypoint is implicit (Program.cs / top-level statements)
      if (fileSet.has("Program.cs")) return "Program.cs";

      const programFile = files.find((f) => f.endsWith("/Program.cs"));
      return programFile || null;
    }

    // ---------------- JAVA ----------------
    case "pom.xml":
    case "build.gradle": {
      // Java entrypoint is defined by `public static void main`
      // NOT safely extractable from manifest
      return null;
    }

    // ---------------- C / C++ ----------------
    case "Makefile":
    case "CMakeLists.txt": {
      // Entry is any file with main()
      // Not declared in manifest
      return null;
    }

    // ---------------- RUBY ----------------
    case "Gemfile": {
      // Ruby apps may use bin/ scripts
      const binFile = files.find((f) => f.startsWith("bin/"));
      return binFile || null;
    }

    default:
      return null;
  }
}

function getHeuristicEntrypoint(files) {
  const candidates = [];

  for (const file of files) {
    let score = 0;

    const base = file.split("/").pop();

    // ---- filename-based signals ----
    if (base.startsWith("main.")) score += 5;
    if (base.startsWith("index.")) score += 4;
    if (base.startsWith("app.")) score += 3;
    if (base.startsWith("server.")) score += 3;

    // ---- path-based signals ----
    if (file.startsWith("src/")) score += 2;
    if (!file.includes("/")) score += 2; // root-level file

    // ---- penalties (noise) ----
    if (file.includes("test")) score -= 3;
    if (file.includes("config")) score -= 2;

    if (score > 0) {
      candidates.push({ file, score });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // pick highest scoring file
  candidates.sort((a, b) => b.score - a.score);

  // if top score is weak or ambiguous → return null
  if (candidates.length > 1 && candidates[0].score === candidates[1].score) {
    return null;
  }

  return candidates[0].file;
}
async function fetchRepoTree(owner, repo) {
  const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!repoRes.ok) throw new Error("Failed to fetch repo details for branch");

  const repoDetails = await repoRes.json();
  const branch = repoDetails.default_branch;

  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: { Accept: "application/vnd.github+json" },
    }
  );

  if (!treeRes.ok) throw new Error("Failed to fetch repo tree");

  const treeData = await treeRes.json();
  return treeData.tree
    .filter((item) => item.type === "blob")
    .map((item) => item.path);
}


async function getRankedFiles(repoUrl, topN = 10) {
  const { owner, repo } = parseGithubRepo(repoUrl);

  const repoDetails = await fetchRepoDetails(owner, repo);
  const primaryLanguage = repoDetails.language;

  const filePaths = await fetchRepoTree(owner, repo);

  const ranked = rankImportantFiles(filePaths, primaryLanguage, topN);

  return {
    repo: `${owner}/${repo}`,
    primaryLanguage,
    totalFiles: filePaths.length,
    rankedFiles: ranked,
  };
}

module.exports = {
  analyzeRepository,
  fetchRepoLanguages,
  fetchRepoDetails,
  getRankedFiles,
};

// STEP 1A: Node
async function getTheMainFile() {
  try {
    let manifestName = "requirements.txt";
    let repoUrl = "https://github.com/Sufaina-Nesrin/FastAPI-Project";
    let manifestContent = await fetchGitHubFile(repoUrl);

    function parsePackageJson(rawContent) {
      try {
        return JSON.parse(rawContent);
      } catch (err) {
        console.error("Invalid package.json");
        return null;
      }
    }
    manifestContent = parsePackageJson(manifestContent);

    const { owner, repo } = parseGithubRepo(repoUrl);
    const response = await getRepoFilePaths(owner, repo);
    const files = filterCodeFiles(response);
    let nodeEntry;
    if (manifestName == "package.json") {
      nodeEntry = getNodeEntrypointFromPackageJson(manifestContent, files);
      if (nodeEntry) {
        console.log("entry:", nodeEntry);
        return nodeEntry;
      }
    }

    // STEP 1B: Other ecosystems
    const manifestEntry = getEntrypointFromManifest(
      manifestName,
      manifestContent,
      files
    );
    if (manifestEntry) {
      console.log("entry:", manifestEntry);
      return manifestEntry;
    }

    // STEP 2: Heuristic
    const heuristicEntry = getHeuristicEntrypoint(files);
    if (heuristicEntry) {
      console.log("entry:", heuristicEntry);
      return heuristicEntry;
    }
    //else ai
    console.log("");
  } catch (err) {
    console.log("err", err.message);
  }
}

// getTheMainFile();
module.exports = {
  analyzeRepository,
  fetchRepoLanguages,
  fetchRepoDetails,
  fetchGitHubFile,
};
