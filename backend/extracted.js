const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const axios = require("axios");

const {
  parseGithubRepo,
  fileArrayToString,
  getRepoFilePaths,
  filterNonCodeFiles,
} = require("./helper");

//1 GET ALL FILES FROM GIT REPO URL
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

module.exports = { fetchAllFiles, fetchFileContent };
