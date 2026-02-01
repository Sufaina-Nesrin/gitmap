const { fetchRepoLanguages } = require("../services");
const { GLOBAL_KEYWORDS, FRAMEWORK_KEYWORDS } = require("./signal");

function detectFramework(filePaths = []) {
  const paths = filePaths?.map((p) => p.toLowerCase());

  const hasEnd = (name) => paths?.some((p) => p.endsWith(name));
  const hasAnyEnd = (names) => names?.some((n) => hasEnd(n));
  const hasIncludes = (part) => paths?.some((p) => p.includes(part));
  const hasAnyIncludes = (parts) => parts?.some((x) => hasIncludes(x));

  // ---------- TOOLING DETECTION ----------
  const tooling = [];

  if (
    hasEnd("dockerfile") ||
    hasEnd("docker-compose.yml") ||
    hasAnyIncludes(["/dockerfile"])
  ) {
    tooling.push("Docker");
  }
  if (hasAnyEnd(["webpack.config.js", "webpack.config.ts"]))
    tooling.push("Webpack");
  if (hasAnyEnd(["vite.config.js", "vite.config.ts"])) tooling.push("Vite");
  if (hasEnd("pyproject.toml")) tooling.push("Poetry");
  if (hasEnd("requirements.txt")) tooling.push("pip");
  if (hasEnd("pnpm-lock.yaml")) tooling.push("pnpm");
  if (hasEnd("yarn.lock")) tooling.push("yarn");
  if (hasEnd("package-lock.json")) tooling.push("npm");

  // ---------- BACKEND DETECTION (SCORING) ----------
  const backendCandidates = [
    {
      name: "Django",
      score: () => {
        let s = 0;
        if (hasAnyEnd(["manage.py"])) s += 4;
        if (hasAnyIncludes(["/settings.py", "/settings/"])) s += 3;
        if (hasAnyEnd(["urls.py"])) s += 3;
        if (hasAnyEnd(["wsgi.py", "asgi.py"])) s += 1;
        return s;
      },
    },
    {
      name: "FastAPI",
      score: () => {
        let s = 0;
        if (hasAnyEnd(["main.py", "app.py"])) s += 2;
        if (hasAnyEnd(["requirements.txt", "pyproject.toml"])) s += 1;
        // better detection with content, but path-only still ok
        if (hasAnyIncludes(["fastapi"])) s += 2; // folder naming sometimes
        return s;
      },
    },
    {
      name: "Flask",
      score: () => {
        let s = 0;
        if (hasAnyEnd(["app.py", "wsgi.py"])) s += 2;
        if (hasAnyEnd(["requirements.txt", "pyproject.toml"])) s += 1;
        if (hasAnyIncludes(["flask"])) s += 1;
        return s;
      },
    },
    {
      name: "Spring Boot",
      score: () => {
        let s = 0;
        if (hasAnyEnd(["pom.xml"])) s += 4;
        if (hasAnyEnd(["build.gradle", "build.gradle.kts"])) s += 4;
        if (hasAnyIncludes(["src/main/java", "src/main/kotlin"])) s += 3;
        if (
          hasAnyEnd([
            "application.yml",
            "application.yaml",
            "application.properties",
          ])
        )
          s += 2;
        return s;
      },
    },
    {
      name: "Rails",
      score: () => {
        let s = 0;
        if (hasEnd("gemfile")) s += 4;
        if (hasAnyIncludes(["config/routes.rb"])) s += 3;
        if (hasAnyIncludes(["app/controllers"])) s += 2;
        return s;
      },
    },
    {
      name: "Laravel",
      score: () => {
        let s = 0;
        if (hasEnd("artisan")) s += 4;
        if (hasEnd("composer.json")) s += 3;
        if (hasAnyIncludes(["routes/web.php", "routes/api.php"])) s += 2;
        return s;
      },
    },
    {
      name: "Next.js",
      score: () => {
        const hasNextConfig = hasAnyEnd([
          "next.config.js",
          "next.config.ts",
          "next.config.mjs",
        ]);

        if (!hasNextConfig) return 0;

        const hasRealNextStructure =
          paths.some((p) => p.startsWith("pages/_app.")) ||
          paths.some((p) => p.startsWith("pages/_document.")) ||
          paths.some((p) => p.startsWith("app/layout.")) ||
          paths.some((p) => p.startsWith("app/page."));

        if (!hasRealNextStructure) return 0;
        console.log(
          "NEXT CONFIG MATCHES:",
          paths.filter((p) => p.includes("next.config")),
        );

        return 10;
      },
    },

    {
      name: "Express/Node",
      score: () => {
        let s = 0;
        if (hasEnd("package.json")) s += 2;
        if (
          hasAnyEnd([
            "server.js",
            "server.ts",
            "app.js",
            "app.ts",
            "index.js",
            "index.ts",
          ])
        )
          s += 3;
        if (hasAnyIncludes(["routes/", "/routes/"])) s += 2;
        return s;
      },
    },
    {
      name: ".NET",
      score: () => {
        let s = 0;
        if (paths.some((p) => p.endsWith(".csproj"))) s += 4;
        if (hasAnyEnd(["program.cs"])) s += 3;
        if (hasAnyIncludes(["controllers/"])) s += 2;
        return s;
      },
    },
    {
      name: "Go",
      score: () => {
        let s = 0;
        if (hasEnd("go.mod")) s += 4;
        if (hasAnyEnd(["main.go"])) s += 3;
        return s;
      },
    },
    {
      name: "Rust",
      score: () => {
        let s = 0;
        if (hasEnd("cargo.toml")) s += 4;
        if (hasAnyIncludes(["src/main.rs"])) s += 3;
        return s;
      },
    },
  ];

  const backendScores = backendCandidates
    .map((c) => ({ framework: c.name, score: c.score() }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const backend = backendScores[0]?.framework || "None";
  const frontendPaths = paths.filter(
    (p) =>
      !p.includes("documentation/") &&
      !p.includes("docs/") &&
      !p.includes("antora/") &&
      !p.includes("samples/") &&
      !p.includes("example/"),
  );

  const fHasEnd = (name) => frontendPaths.some((p) => p.endsWith(name));
  const fHasAnyEnd = (names) => names.some((n) => fHasEnd(n));
  const fHasIncludes = (part) => frontendPaths.some((p) => p.includes(part));
  const fHasAnyIncludes = (parts) => parts.some((x) => fHasIncludes(x));

  const frontendCandidates = [
    {
      name: "Next.js",
      score: () => {
        const hasNextConfig = fHasAnyEnd([
          "next.config.js",
          "next.config.ts",
          "next.config.mjs",
        ]);

        if (!hasNextConfig) return 0;

        const hasRealNextStructure =
          frontendPaths.some((p) => p.startsWith("pages/_app.")) ||
          frontendPaths.some((p) => p.startsWith("pages/_document.")) ||
          frontendPaths.some((p) => p.startsWith("app/layout.")) ||
          frontendPaths.some((p) => p.startsWith("app/page."));

        if (!hasRealNextStructure) return 0;

        return 10;
      },
    },

    {
      name: "React",
      score: () => {
        let s = 0;
        if (hasEnd("package.json")) s += 2;
        if (
          hasAnyIncludes([
            "src/index.tsx",
            "src/main.tsx",
            "src/index.jsx",
            "src/main.jsx",
          ])
        )
          s += 4;
        if (hasAnyIncludes(["src/app.tsx", "src/app.jsx"])) s += 2;
        if (hasAnyIncludes(["frontend/src", "frontend/js"])) s += 2;
        return s;
      },
    },
    {
      name: "Vue",
      score: () => {
        let s = 0;
        if (hasEnd("package.json")) s += 2;
        if (hasAnyEnd(["vue.config.js", "vite.config.js", "vite.config.ts"]))
          s += 1;
        if (hasAnyIncludes(["src/main.js", "src/main.ts"])) s += 3;
        return s;
      },
    },
    {
      name: "Angular",
      score: () => {
        let s = 0;
        if (hasEnd("angular.json")) s += 5;
        if (hasEnd("package.json")) s += 1;
        if (hasAnyIncludes(["src/main.ts"])) s += 2;
        return s;
      },
    },
  ];

  const frontendScores = frontendCandidates
    .map((c) => ({ framework: c.name, score: c.score() }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const frontend = frontendScores[0]?.framework || "Unknown";

  const detected = {
    backend: backendScores.slice(0, 3),
    frontend: frontendScores.slice(0, 3),
    tooling,
  };

  return {
    backend,
    frontend,
    tooling: [...new Set(tooling)],
  };
}

function scoreFile(path, framework) {
  const p = path?.toLowerCase();
  const depth = p.split("/").length - 1;
  let score = 0;

  for (const key in GLOBAL_KEYWORDS) {
    if (p.endsWith(key)) score += GLOBAL_KEYWORDS[key];
  }

  const backendRules = FRAMEWORK_KEYWORDS[framework?.backend] || {};
  const frontendRules = FRAMEWORK_KEYWORDS[framework?.frontend] || {};

  for (const key in backendRules) {
    if (p.includes(key)) score += backendRules[key];
  }

  for (const key in frontendRules) {
    if (p.includes(key)) score += frontendRules[key];
  }

  if (Array.isArray(framework?.tooling)) {
    for (const tool of framework.tooling) {
      const toolRules = FRAMEWORK_KEYWORDS[tool] || {};
      for (const key in toolRules) {
        if (p.includes(key)) score += toolRules[key];
      }
    }
  }

  const entryBoostFiles = [
    "manage.py",
    "main.py",
    "main.ts",
    "main.js",
    "index.tsx",
    "index.jsx",
    "index.ts",
    "index.js",
    "app.tsx",
    "app.jsx",
    "app.ts",
    "app.js",
    "server.ts",
    "server.js",
    "program.cs",
    "main.go",
    "src/main.rs",
  ];

  if (framework?.backend === "Spring Boot") {
    if (p.includes("src/main/java")) score += 80;
    if (p.includes("src/main/kotlin")) score += 80;
    if (p.includes("src/main/resources")) score += 50;
  }

  if (framework?.backend === "Rust") {
    if (p.includes("src/main.rs")) score += 80;
    if (p.includes("src/lib.rs")) score += 60;
    if (p.endsWith("cargo.toml")) score += 60;
  }

  if (framework?.backend === "C/C++") {
    if (p.endsWith("cmakelists.txt")) score += 70;
    if (p.includes("/src/")) score += 30;
    if (p.endsWith("main.c") || p.endsWith("main.cpp")) score += 80;
    if (p.includes("/include/")) score += 25;
  }

  if (framework?.backend === ".NET") {
    if (p.endsWith(".csproj")) score += 80;
    if (p.endsWith("program.cs")) score += 70;
    if (p.includes("/controllers/")) score += 35;
    if (p.includes("/startup.cs")) score += 40;
  }

  const frontendPaths = paths.filter(
    (p) =>
      !p.includes("documentation/") &&
      !p.includes("docs/") &&
      !p.includes("antora/"),
  );

  if (entryBoostFiles.some((f) => p.endsWith(f))) score += 40;

  score += Math.max(0, 30 - depth * 6);

  if (p.includes("node_modules")) score -= 100;
  if (p.includes("dist") || p.includes("build")) score -= 20;
  if (p.includes("test") || p.includes("__tests__")) score -= 15;
  if (p.includes(".vscode/")) score -= 50;
  if (p.split("/").pop().startsWith(".")) score -= 40;
  if (p.includes(".github/")) score -= 80;
  if (p.includes("pnpm-lock")) score -= 50;
  if (p.includes("poetry.lock")) score -= 50;
  if (p.includes("yarn.lock")) score -= 50;
  if (p.includes("package-lock")) score -= 50;
  if (p.includes(".gitignore")) score -= 200;
  if (p.includes(".dockerignore")) score -= 40;
  if (p.includes(".editorconfig")) score -= 40;
  if (p.includes(".prettierrc")) score -= 40;
  if (p.includes("documentation/")) score -= 200;
  if (p.includes("docs/")) score -= 200;
  if (p.includes("examples/")) score -= 200;
  if (p.includes(".adoc")) score -= 200;
  if (p.includes("site/")) score -= 200;
  if (p.includes("storybook/")) score -= 200;
  if (p.includes("antora/")) score -= 200;
  if (p.includes(".rst")) score -= 200;
  if (p.includes(".mdx")) score -= 200;
  if (p.split("/").pop().startsWith(".")) score -= 80;
  if (p.includes("integration-test/")) score -= 300;
  if (p.includes("smoke-test/")) score -= 300;
  if (p.includes("system-test/")) score -= 300;
  if (p.includes("test/")) score -= 120;

  if (p.startsWith("src/")) score += 30;
  if (p.startsWith("app/")) score += 25;
  if (p.includes("/backend/") || p.startsWith("backend/")) score += 25;
  if (p.includes("/frontend/") || p.startsWith("frontend/")) score += 25;
  if (p.includes("/server/") || p.startsWith("server/")) score += 20;
  if (p.includes("/api/")) score += 20;
  if (p.includes("/lib/")) score += 15;
  if (p.includes("/packages/")) score += 15;
  if (p.includes("spring-boot-project/")) score += 120;
  if (p.includes("module/")) score += 80;

  if (!p.endsWith("readme.md")) {
    if (p.includes("docs/") || p.includes("documentation/")) score -= 80;
    if (p.endsWith(".adoc") || p.endsWith(".mdx") || p.endsWith(".rst"))
      score -= 80;
  }

  return score;
}

function bucketFiles(rankedFiles) {
  const onlyPaths = rankedFiles.map((x) => x.path);

  const whatToReadFirst = onlyPaths.slice(0, 10);
  const readNext = onlyPaths.slice(10, 22);
  const skipForNow = onlyPaths.slice(22, 60);

  const readmeIndex = whatToReadFirst.findIndex((p) =>
    p.toLowerCase().endsWith("readme.md"),
  );
  if (readmeIndex === -1) {
    const readme = onlyPaths.find((p) => p.toLowerCase().endsWith("readme.md"));
    if (readme) {
      whatToReadFirst.unshift(readme);
      if (whatToReadFirst.length > 10) whatToReadFirst.pop();
    }
  }

  return { whatToReadFirst, readNext, skipForNow };
}

module.exports = { bucketFiles, detectFramework, scoreFile };
