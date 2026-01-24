import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// 1. Initialize the API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

async function getRepoAnalysis(fileList) {
  const prompt = `
    Analyze this list of files from a GitHub repository:
    ${fileList}

    Output the following format:
    System type: [Type]
    Entry file: [File]
    Flow: [Simplified Flow]
    Start here: [Main files]
    Ignore: [Utility/Config files]
  `;

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (error) {
    console.error("Error analyzing repo:", error);
  }
}

async function getManifestFromAI(rawFileList) {
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
  const fileNames = rawFileList.map((file) => file.split("/").pop());

  const foundManifest = COMMON_MANIFESTS.find((manifest) =>
    fileNames.includes(manifest),
  );

  if (foundManifest) {
    return foundManifest;
  }

  const prompt = `
I have a list of files from a software repository.

Identify the SINGLE most important manifest or configuration file
that defines the project's dependencies and tech stack
(e.g., package.json, requirements.txt, go.mod, Cargo.toml).

FILE LIST:
${rawFileList.join("\n")}

INSTRUCTIONS:
- Return ONLY the filename.
- If no manifest is found, return "NULL".
- Do not provide explanations.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const manifestFile = result.response.text().trim();

    return manifestFile !== "NULL" ? manifestFile : null;
  } catch (error) {
    console.error("AI Manifest Picking Error:", error);
    return null;
  }
}

// Example usage
const myFiles =
  ".github/workflows/ci.yml, .gitignore, README.md, app/api/auth/route.ts, app/ji/login/route.js, app/api/preference/route.ts, app/api/recipe/route.ts, app/api/register/route.ts, app/api/test/route.ts, app/favicon.ico, app/globals.css, app/layout.tsx, app/login/page.tsx, app/page.tsx, app/signup/page.tsx, eslint.config.mjs, lib/cache/preference.ts, lib/jwt.ts, lib/middleware.ts, lib/mongo.ts, models/Note.ts, models/Preference.ts, models/User.ts, next.config.ts, package-lock.json, package.json, postcss.config.mjs, public/file.svg, public/globe.svg, public/next.svg, public/vercel.svg, public/window.svg, recipe.json, tsconfig.json";
let result = await getRepoAnalysis(myFiles);
console.log("resutl--", result);
// let myRepoFiles = [
//   "app/api/auth/route.ts",
//   "app/api/login/route.js",
//   "app/api/preference/route.ts",
//   "app/api/recipe/route.ts",
//   "app/api/register/route.ts",
//   "app/api/test/route.ts",
//   "app/favicon.ico",
//   "app/layout.tsx",
//   "app/login/page.tsx",
//   "app/page.tsx",
//   "app/signup/page.tsx",
//   "eslint.config.mjs",
//   "lib/cache/preference.ts",
//   "lib/jwt.ts",
//   "lib/middleware.ts",
//   "lib/mongo.ts",
//   "models/Note.ts",
//   "models/Preference.ts",
//   "models/User.ts",
//   "next.config.ts",
//   "package-lock.json",
//   "package.json",
//   "postcss.config.mjs",
//   "recipe.json",
//   "tsconfig.json",
// ];
// const manifest = await getManifestFromAI(myRepoFiles);
// console.log("The manifest file is:", manifest);
