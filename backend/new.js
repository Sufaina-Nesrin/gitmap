//1
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv/config");

// 1. Initialize the API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
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

//2 group files by subproject
function groupFilesByRoot(rawFileList, manifestPaths) {
  const projects = {};

  for (const manifestPath of manifestPaths) {
    const root = manifestPath.split("/")[0]; // frontend, backend

    projects[root] = rawFileList.filter((file) => file.startsWith(root + "/"));
  }

  return projects;
}

async function getRepoAnalysis(fileList, manifestContent) {
  const prompt = `
Analyze the following SUBPROJECT from a GitHub repository.

Files:
${fileList}

Manifest:
${manifestContent}

Output strictly in this format:
System type:
Entry file:
Flow:
Start here:
Ignore:
`;

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing repo:", error);
  }
}

module.exports = { getAllManifests, getRepoAnalysis, groupFilesByRoot };
