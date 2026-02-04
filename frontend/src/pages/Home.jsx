import { useState } from "react";
import api from "../api/axios";
function Home() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [repoUrl, setRepoUrl] = useState("")

  // TEMP history (replace later with backend / context)
  const history = [
    "facebook/react",
    "vercel/next.js",
    "nodejs/node",
    "vitejs/vite",
  ];
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
        setAnalysis(res.data.analysis);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 backdrop-blur">
        {/* Left */}
        <div className="flex items-center gap-3">
          <img src="/vite.svg" alt="Gitmap Logo" className="h-8 w-8" />
          <span className="text-xl font-bold tracking-wide">
            Git<span className="text-emerald-400">map</span>
          </span>
        </div>

        {/* Right */}
        <ul className="flex items-center gap-8 text-sm font-medium">
          <li className="cursor-pointer hover:text-emerald-400 transition">
            Home
          </li>
          <li className="cursor-pointer hover:text-emerald-400 transition">
            Pricing
          </li>
          <li className="cursor-pointer hover:text-emerald-400 transition">
            Login
          </li>
          <li className="px-4 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer">
            Logout
          </li>
        </ul>
      </nav>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-white/10 bg-slate-950/60 backdrop-blur">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
              History
            </h2>

            <ul className="space-y-2">
              {history.map((repo, index) => (
                <li
                  key={index}
                  className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400 cursor-pointer transition"
                >
                  {repo}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center px-4 mt-28">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Visualize Any GitHub Repository
          </h1>
          <p className="text-slate-400 text-center max-w-xl mb-10">
            Paste a GitHub repository URL and instantly analyze its structure,
            dependencies, and architecture.
          </p>

          {/* Input Section */}
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

          {/* Output Section */}
          <div className="w-full max-w-4xl mt-16 p-6 rounded-xl bg-slate-900 border border-white/10">
            <h2 className="text-lg font-semibold mb-3 text-emerald-400">
              Analysis Output
            </h2>

            {loading && (
              <p className="text-slate-400 text-sm">Analyzing repository...</p>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {analysis && (
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                {analysis}
              </pre>
            )}
          </div>

          {/* User Profile (Bottom Right) */}
          <div className="fixed bottom-6 left-6 z-50">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur border border-white/10 shadow-lg hover:bg-slate-900 transition cursor-pointer">
              <img
                src="https://avatars.githubusercontent.com/u/9919?v=4"
                alt="User Avatar"
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-white">Sufaina</span>
                <span className="text-xs text-slate-400">View profile</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
