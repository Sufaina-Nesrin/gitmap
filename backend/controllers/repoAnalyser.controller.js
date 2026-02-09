const {
  fetchAllFiles,
  getAllManifests,
  getRepoAnalysis,
  groupFilesByRoot,
  fetchFileContent,
  getRankedFiles,
  getRepoAnalysisMultiple
} = require("../services/repoAnalyser.services");


const analyzerepo = async (req, reply) => {
  try {
    const { url } = req.body;

    if (!url) {
      return reply.status(400).send({
        success: false,
        message: "Repository URL is required",
      });
    }

    const res = await fetchAllFiles(url);

    if (!res || !res.rawFileList) {
      return reply.status(400).send({
        success: false,
        message: "Unable to fetch repository files",
      });
    }

    let aiResult = "";
    const manifests = getAllManifests(res.rawFileList);


    if (manifests.length <= 1) {
      const manifestContent = manifests[0]
        ? await fetchFileContent(res.owner, res.repo, manifests[0])
        : null;

      aiResult = await getRepoAnalysis(
        res.rawFileList.join("\n"),
        manifestContent
      );
  let rankedfiles = await getRankedFiles(url , topN = 10)
   aiResult = aiResult + "\n\n"+rankedfiles
      return reply.send({
        success: true,
        analysis: aiResult,
      });
    }

  
    const projects = groupFilesByRoot(res.rawFileList, manifests);

    for (const [projectName, files] of Object.entries(projects)) {
      const manifestPath = manifests.find((m) =>
        m.startsWith(projectName + "/")
      );

      const manifestContent = await fetchFileContent(
        res.owner,
        res.repo,
        manifestPath
      );

      aiResult = aiResult+ "\n\n"+ await getRepoAnalysisMultiple(
        files.join("\n"),
        manifestContent
      );
    }
   let rankedfiles = await getRankedFiles(url , topN = 10)
   aiResult = aiResult + "\n\n"+rankedfiles
    return reply.send({
      success: true,
      analysis: aiResult,
      rank: rankedfiles
    });

  } catch (error) {
    console.error("Repo analysis error:", error);

    return reply.status(500).send({
      success: false,
      message: "Internal server error during repo analysis",
    });
  }
};

module.exports = { analyzerepo };
