const { getExecutionFlow } = require("./signal");
const { bucketFiles } = require("./utils");
const { fetchAllFiles, fetchFileContent } = require("../extracted");
const {getAllManifests,getRepoAnalysis, groupFilesByRoot,} = require("../new");
const { getRankedFiles } = require("../services/repoAnalyser.services");





async function gitRoutes(fastify, options) {
  fastify.get("/analyze", async (req, reply) => {
    const { url } = request.query;

    if (!url) return reply.code(400).send({ error: "url is required" });
    const ranked = await getRankedFiles(url, 300);

    const { whatToReadFirst, readNext, skipForNow } = bucketFiles(
      ranked.rankedFiles,
    );

    if (!whatToReadFirst.some((p) => p.toLowerCase().endsWith("readme.md"))) {
      const readme = ranked.rankedFiles.find((f) =>
        f.path.toLowerCase().endsWith("readme.md"),
      );
      if (readme) whatToReadFirst.unshift(readme.path);
    }
    return {
      repo: ranked.repo,
      primaryLanguage: ranked.primaryLanguage,
      framework: ranked.framework,
      whatToReadFirst,
      readNext,
      skipForNow,
      executionFlow: getExecutionFlow(ranked.framework),
    };
  });







  fastify.post("/analyze-repo", async (req, reply) => {
    try {
      const { url } = req.body;
      const res = await fetchAllFiles(url);
      let aiResult = "";
      // console.log(res);
      if (res && res.rawFileList) {
        const manifests = getAllManifests(res?.rawFileList || []);
        // console.log(manifests);
        if (manifests.length <= 1) {
          const manifestContent = manifests[0]
            ? await fetchFileContent(res?.owner, res?.repo, manifests[0])
            : null;

          aiResult = await getRepoAnalysis(
            res?.rawFileList.join("\n"),
            manifestContent,
          );
          return;
        }

        const projects = groupFilesByRoot(res?.rawFileList, manifests);

        for (const [projectName, files] of Object.entries(projects)) {
          const manifestPath = manifests.find((m) =>
            m.startsWith(projectName + "/"),
          );

          const manifestContent = await fetchFileContent(
            res?.owner,
            res?.repo,
            manifestPath,
          );

          console.log(`\n📦 Subproject: ${projectName}\n`);
          aiResult += await getRepoAnalysis(files.join("\n"), manifestContent);
        }
      }
      return aiResult;
    } catch (error) {
      console.log(error);
      return error;
    }
  });
}

module.exports = gitRoutes;
