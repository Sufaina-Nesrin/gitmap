import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-4">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 backdrop-blur">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back to <span className="text-emerald-400">Gitmap</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Login to analyze repositories
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
          />

          <button className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition">
            Login
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="px-3 text-xs text-slate-500">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <div className="g_id_signin"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don’t have an account?{" "}
          <span className="text-emerald-400 cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
