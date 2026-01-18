const { fetchRepoLanguages } = require("../services");

const GLOBAL_KEYWORDS = {
  "readme.md": 80,
  "dockerfile": 40,
  "docker-compose.yml": 35,
  ".env.example": 25,
  "makefile": 20
};

const NODE_KEYWORDS = {
  "server.js": 90,
  "index.js": 85,
  "app.js": 85,
  "main.js": 75,
  "routes": 40,
  "controllers": 35,
  "middleware": 30,
  "services": 25,
  "package.json": 60
};

const PYTHON_KEYWORDS = {
  "main.py": 90,
  "app.py": 85,
  "__main__.py": 80,
  "wsgi.py": 70,
  "asgi.py": 70,
  "manage.py": 75,
  "requirements.txt": 60,
  "pyproject.toml": 55
};

const JAVA_KEYWORDS = {
  "src/main/java": 70,
  "pom.xml": 60,
  "build.gradle": 60,
  "application.properties": 50,
  "application.yml": 50
};




function scoreFile(path, primaryLanguage) {
  const p = path.toLowerCase();

  const depth = p.split("/").length - 1;

  let score = 0;

  for (const key in GLOBAL_KEYWORDS) {
    if (p.endsWith(key)) score += GLOBAL_KEYWORDS[key];
  }

  const langRules =
    primaryLanguage === "JavaScript" ? NODE_KEYWORDS :
    primaryLanguage === "TypeScript" ? NODE_KEYWORDS :
    primaryLanguage === "Python" ? PYTHON_KEYWORDS :
    primaryLanguage === "Java" ? JAVA_KEYWORDS :
    {};

  for (const key in langRules) {
    if (p.includes(key)) score += langRules[key];
  }
  score += Math.max(0, 30 - depth * 6);


  if (primaryLanguage === "Python" && p.endsWith(".py")) score += 8;
  if ((primaryLanguage === "JavaScript" || primaryLanguage === "TypeScript") && (p.endsWith(".js") || p.endsWith(".ts"))) score += 8;
  if (primaryLanguage === "Java" && p.endsWith(".java")) score += 8;


  if (p.includes("node_modules")) score -= 100;
  if (p.includes("dist") || p.includes("build")) score -= 20;
  if (p.includes("test") || p.includes("__tests__")) score -= 15;

  return score;
}

function rankImportantFiles(filePaths, primaryLanguage, topN = 10) {
  return filePaths
    .map((path) => ({
      path,
      score: scoreFile(path, primaryLanguage),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

module.exports = {rankImportantFiles}



