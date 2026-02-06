import { useState } from "react";
import api from "../api/axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [analysedUrl, setAnalysedUrl] = useState("");
  const { user, setUser } = useAuth();
  console.log(user);

  useEffect(() => {
    const getHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const res = await api.get("/api/history");

        if (res.data?.success) {
          console.log(res?.data);
          setHistory(res.data.history);
        } else {
          setHistoryError("Failed to load history");
        }
      } catch (err) {
        console.error(err);
        setHistoryError(
          err.response?.data?.message ||
            "Something went wrong while fetching history",
        );
      } finally {
        setHistoryLoading(false);
      }
    };
    getHistory();
  }, [analysis]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      setUser(null);
      setAnalysis("");
      setHistory([]);

      // redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const saveToHistory = (repoUrl, analysis) => {
    api.post("/api/history", { repoUrl, analysis }).catch((err) => {
      console.warn("Failed to save history:", err);
    });
  };

  const handleSubmit = async () => {
    if (!repoUrl.trim()) return;

    try {
      setLoading(true);
      setError("");
      setAnalysis("");

      const res = await api.post(
        "/api/analyze-repo",
        { url: repoUrl },
        { withCredentials: true },
      );

      if (res.data?.success) {
        const analysisResult = res.data.analysis;

        setAnalysis(analysisResult);
        setAnalysedUrl(repoUrl);
        setRepoUrl("");

        saveToHistory(repoUrl, analysisResult);
      } else {
        setError("Analysis failed");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Something went wrong while analyzing the repository",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSelectHistory = (repo) => {
    setSelectedRepoId(repo._id);
    setAnalysis(repo.analysis);
    setAnalysedUrl(repo.repoUrl);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4 border-b border-white/10 backdrop-blur bg-slate-950/80">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Gitmap Logo" style={{ width: "40px", height: "40px" }} />
          <span className="text-xl font-bold tracking-wide">
            Git<span className="text-emerald-400">map</span>
          </span>
        </div>

        {/* Right */}
        <ul className="flex items-center gap-8 text-sm font-medium">
          {/* <li
            onClick={() => navigate("/")}
            className="cursor-pointer hover:text-emerald-400 transition"
          >

            Home
          </li> */}
          <li
            onClick={() => navigate("/pricing")}
            className="cursor-pointer hover:text-emerald-400 transition"
          >
            Pricing
          </li>
          {/* <li
            onClick={() => navigate("/login")}
            className="cursor-pointer hover:text-emerald-400 transition"
          >
            Login
          </li> */}
          <li
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
          >
            Logout
          </li>
        </ul>
      </nav>

      <div className="flex pt-[64px]">
        <aside className="fixed top-[64px] left-0 w-64 h-[calc(100vh-64px)] border-r border-white/10 bg-slate-950/60 backdrop-blur z-30">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
              History
            </h2>

            <ul className="space-y-2">
              {history.map((repo, index) => (
                <li
                  onClick={() => handleSelectHistory(repo)}
                  key={repo._id}
                  className={`
    px-1 py-2 rounded-lg text-sm cursor-pointer transition
    ${
      selectedRepoId === repo._id
        ? "bg-white/5 text-emerald-400"
        : "text-slate-300 hover:bg-white/5 hover:text-emerald-400"
    }
  `}
                >
                  {repo?.repoUrl?.replace("https://github.com/", "")}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="ml-64 flex-1 h-[calc(100vh-64px)] overflow-y-auto flex flex-col items-center px-4 pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Visualize Any GitHub Repository
          </h1>
          <p className="text-slate-400 text-center max-w-xl mb-10">
            Paste a GitHub repository URL and instantly analyze its structure,
            dependencies, and architecture.
          </p>

          <div className="flex w-full max-w-3xl gap-3">
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 px-5 py-4 rounded-xl bg-slate-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {analysis && (
            <div className="w-full max-w-3xl mt-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
              <p className="text-xs text-slate-400 mb-1">Analyzed Repository</p>
              <p className="text-sm text-emerald-400 font-medium">
                {analysedUrl}
              </p>
            </div>
          )}
          {(analysis || error || loading) && (
            <div className="w-full max-w-4xl mt-7 p-6 rounded-xl bg-slate-900 border border-white/10">
              <h2 className="text-lg font-semibold mb-3 text-emerald-400">
                Analysis Output
              </h2>

              {loading && (
                <p className="text-slate-400 text-sm">
                  Analyzing repository...
                </p>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              {analysis && (
                <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                  {analysis}
                </pre>
              )}
            </div>
          )}

          <div className="fixed bottom-6 left-6 z-50">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur border border-white/10 shadow-lg hover:bg-slate-900 transition cursor-pointer">
              <img
                src="https://avatars.githubusercontent.com/u/9919?v=4"
                alt="User Avatar"
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-white">
                  {user?.username}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
