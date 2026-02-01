import { useState } from "react";


function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  
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

      {/* Main */}
      <main className="flex flex-col items-center justify-center px-4 mt-28">
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
          <button className="px-6 py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition">
            Analyze
          </button>
        </div>

        {/* Output Section */}
        <div className="w-full max-w-4xl mt-16 p-6 rounded-xl bg-slate-900 border border-white/10">
          <h2 className="text-lg font-semibold mb-3 text-emerald-400">
            Analysis Output
          </h2>
          <p className="text-slate-400 text-sm">
            Repository analysis results will appear here after processing.
          </p>
        </div>
        

        <div class="g_id_signin"></div>
      </main>
    </div>
  );
}

export default Home;  