const GITHUB_API = "https://api.github.com";

const Parser = require("tree-sitter");

function safeRequire(name, prop) {
  try {
    const mod = require(name);
    return prop ? mod[prop] : mod;
  } catch {
    return null;
  }
}


const Java = safeRequire("tree-sitter-java");
const JavaScript = require("tree-sitter-javascript");
const Python = require("tree-sitter-python");
const TypeScript = require("tree-sitter-typescript").typescript;
const Go = require("tree-sitter-go");

const C = require("tree-sitter-c");
const Cpp = require("tree-sitter-cpp");
const Rust = require("tree-sitter-rust");
const Ruby = require("tree-sitter-ruby");
const PHP = require("tree-sitter-php").php;
const Kotlin = require("tree-sitter-kotlin");
const CSharp = require("tree-sitter-c-sharp");
const Bash = require("tree-sitter-bash");

const languageMap = {
  ".js": JavaScript && { name: "js", lang: JavaScript },
  ".jsx": JavaScript && { name: "js", lang: JavaScript },

  ".ts": TypeScript && { name: "ts", lang: TypeScript },
  ".tsx": TypeScript && { name: "ts", lang: TypeScript },

  ".py": Python && { name: "python", lang: Python },
  ".go": Go && { name: "go", lang: Go },

  ".java": Java && { name: "java", lang: Java },
  ".cs": CSharp && { name: "csharp", lang: CSharp },
  ".rs": Rust && { name: "rust", lang: Rust },
  ".rb": Ruby && { name: "ruby", lang: Ruby },
  ".php": PHP && { name: "php", lang: PHP },
  ".kt": Kotlin && { name: "kotlin", lang: Kotlin },
  ".c": C && { name: "c", lang: C },
  ".cpp": Cpp && { name: "cpp", lang: Cpp },
  ".sh": Bash && { name: "bash", lang: Bash },
};


function getLanguageByExtension(file) {
  const ext = file.slice(file.lastIndexOf("."));
  return languageMap[ext];
}

function extractImportsWithTreeSitter(content, language) {
  const parser = new Parser();
  parser.setLanguage(language);

  const tree = parser.parse(content);
  const imports = [];

  function walk(node) {
    if (
      node.type.includes("import") ||
      node.type.includes("include") ||
      node.type.includes("require") ||
      node.type.includes("use") ||
      node.type.includes("namespace")
    ) {
      const text = content.slice(node.startIndex, node.endIndex);
      const matches = text.match(/['"]([^'"]+)['"]|<([^>]+)>/g);

      if (matches) {
        matches.forEach((m) => {
          const cleaned = m.replace(/['"<>\s]/g, "");
          imports.push(cleaned);
        });
      }
    }

    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i));
    }
  }
  walk(tree.rootNode);
  return [...new Set(imports)];
}

function normalize(map) {
  const values = Object.values(map);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const result = {};
  for (const key in map) {
    result[key] = (map[key] - min) / (max - min || 1);
  }
  return result;
}



function detectEntry(files) {
  const patterns = [
    /main\.(js|ts|py|go|java|cs|rs|php|kt|c|cpp)$/,
    /index\.(js|ts|jsx|tsx)$/,
    /__main__\.py$/,
    /server\.(js|ts)$/,
  ];

  for (const pattern of patterns) {
    const match = files.find((f) => pattern.test(f));
    if (match) return [match];
  }

  return [files.sort((a, b) => a.split("/").length - b.split("/").length)[0]];
}

async function buildGraph(owner, repo, files, repoRoot) {
  const graph = {};
  const reverse = {};

  files.forEach((f) => {
    graph[f] = [];
    reverse[f] = [];
  });

  for (const file of files) {
    const language = getLanguageByExtension(file);
    if (!language) continue;

    try {
      const res = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${file}`,
      );
      if (!res.ok) continue;

      const data = await res.json();
      const content = Buffer.from(data.content, "base64").toString("utf-8");

      const imports = extractImportsWithTreeSitter(content, language.lang);

      for (const imp of imports) {
        resolveImport(file, imp, files, graph, reverse);
      }
    } catch {
      continue;
    }
  }

  return { graph, reverse };
}

function resolveImport(currentFile, rawImport, files, graph, reverse, repoRoot) {
  if (!rawImport) return;

  if (
    !rawImport.startsWith(".") &&
    !rawImport.includes("/") &&
    !rawImport.includes(".")
  )
    return;

  const currentDir = currentFile.split("/").slice(0, -1).join("/");

  let cleaned = rawImport;

  if (repoRoot && cleaned.includes(repoRoot)) {
    cleaned = cleaned.replace(repoRoot + "/", "");
  }

  cleaned = cleaned.replace(/\./g, "/");

  if (cleaned.startsWith(".")) {
    cleaned = require("path").normalize(
      require("path").join(currentDir, cleaned),
    );
  }

  cleaned = cleaned.replace(/^\.\//, "");
  cleaned = cleaned.replace(/\.[^/.]+$/, "");

  const candidates = [
    cleaned,
    cleaned + ".js",
    cleaned + ".ts",
    cleaned + ".py",
    cleaned + ".go",
    cleaned + ".java",
    cleaned + ".cs",
    cleaned + ".rs",
    cleaned + ".rb",
    cleaned + ".php",
    cleaned + ".kt",
    cleaned + ".c",
    cleaned + ".cpp",
    cleaned + "/index",
  ];

  const found = files.find((f) => candidates.some((c) => f.startsWith(c)));

  if (found) {
    graph[currentFile].push(found);
    reverse[found].push(currentFile);
  }
}

function pageRank(graph, iterations = 20, d = 0.85) {
  const nodes = Object.keys(graph);
  const N = nodes.length;
  const rank = {};

  nodes.forEach((n) => (rank[n] = 1 / N));

  for (let i = 0; i < iterations; i++) {
    const newRank = {};
    nodes.forEach((n) => (newRank[n] = (1 - d) / N));

    for (const node of nodes) {
      const neighbors = graph[node];
      if (!neighbors.length) continue;

      const share = rank[node] / neighbors.length;
      neighbors.forEach((n) => {
        newRank[n] += d * share;
      });
    }

    Object.assign(rank, newRank);
  }

  return normalize(rank);
}

function flowProximity(entryFiles, graph) {
  const distance = {};
  const queue = [];

  const entries = Array.isArray(entryFiles)
    ? entryFiles
    : entryFiles
      ? [entryFiles]
      : [];

  entries.forEach((e) => {
    if (graph[e]) {
      distance[e] = 0;
      queue.push(e);
    }
  });

  while (queue.length) {
    const current = queue.shift();
    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (distance[neighbor] === undefined) {
        distance[neighbor] = distance[current] + 1;
        queue.push(neighbor);
      }
    }
  }

  const score = {};
  for (const file in graph) {
    const d = distance[file];
    score[file] = d !== undefined ? 1 / (d + 1) : 0;
  }

  return normalize(score);
}

function structuralPenalty(file) {
  let penalty = 0;

  if (file.startsWith(".")) penalty += 1;
  if (file.endsWith(".md")) penalty += 0.8;
  if (file.includes("test")) penalty += 0.6;
  if (file.includes("docs")) penalty += 0.8;
  if (file.includes("dist") || file.includes("build")) penalty += 0.8;

  return penalty;
}

async function rankRepository(owner, repo, filePaths) {
  const entryFiles = detectEntry(filePaths);
  const repoRoot = `${owner}/${repo}`;

  const { graph, reverse } = await buildGraph(owner, repo, filePaths, repoRoot);

  const reverseScore = {};
  for (const file in reverse) {
    reverseScore[file] = reverse[file].length;
  }
  const normalizedReverse = normalize(reverseScore);

  const centralityScore = pageRank(graph);

  const flowScore = flowProximity(entryFiles, graph);

  const results = filePaths.map((file) => {
    const score =
      0.5 * (centralityScore[file] || 0) +
      0.3 * (flowScore[file] || 0) +
      0.2 * (normalizedReverse[file] || 0) -
      structuralPenalty(file);

    return { path: file, score };
  });

  return results.sort((a, b) => b.score - a.score);
}

module.exports = { rankRepository };
