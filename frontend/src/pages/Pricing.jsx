import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-6 py-16">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition"
      >
        <XMarkIcon className="w-6 h-6 text-slate-400 hover:text-white" />
      </button>
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-slate-400">
          Analyze repositories faster. No hidden charges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 flex flex-col">
          <h3 className="text-xl font-semibold mb-2">Free</h3>
          <p className="text-slate-400 mb-6">Perfect for trying out Gitmap</p>

          <div className="text-4xl font-bold mb-6">
            ₹0 <span className="text-sm text-slate-400">/month</span>
          </div>

          <ul className="space-y-3 text-sm text-slate-300 flex-1">
            <li>✓ 5 repository analyses / day</li>
            <li>✓ Basic project structure</li>
            <li>✓ Entry point detection</li>
            <li>✓ Beginner-friendly output</li>
          </ul>

          <button
            onClick={() => navigate("/signup")}
            className="mt-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
          >
            Get started
          </button>
        </div>

        <div className="rounded-2xl border border-emerald-400 bg-slate-900 p-8 flex flex-col relative">
          <span className="absolute -top-3 right-6 bg-emerald-500 text-black text-xs px-3 py-1 rounded-full font-semibold">
            Most Popular
          </span>

          <h3 className="text-xl font-semibold mb-2">Pro</h3>
          <p className="text-slate-400 mb-6">
            For serious developers & learners
          </p>

          <div className="text-4xl font-bold mb-6 text-emerald-400">
            ₹499 <span className="text-sm text-slate-400">/month</span>
          </div>

          <ul className="space-y-3 text-sm text-slate-300 flex-1">
            <li>✓ Unlimited repository analysis</li>
            <li>✓ Full-stack & monorepo detection</li>
            <li>✓ Architecture summary</li>
            <li>✓ History & quick reload</li>
            <li>✓ Faster analysis</li>
          </ul>

          <button
            onClick={() => navigate("/signup")}
            className="mt-8 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
          >
            Upgrade to Pro
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 flex flex-col">
          <h3 className="text-xl font-semibold mb-2">Team</h3>
          <p className="text-slate-400 mb-6">For teams & organizations</p>

          <div className="text-4xl font-bold mb-6">Custom</div>

          <ul className="space-y-3 text-sm text-slate-300 flex-1">
            <li>✓ Everything in Pro</li>
            <li>✓ Team workspaces</li>
            <li>✓ Shared analysis history</li>
            <li>✓ Priority support</li>
            <li>✓ Custom integrations</li>
          </ul>

          <button className="mt-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition">
            Contact us
          </button>
        </div>
      </div>

      <p className="text-center text-slate-500 text-sm mt-16">
        No credit card required for Free plan.
      </p>
    </div>
  );
}

export default Pricing;
