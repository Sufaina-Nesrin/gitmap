import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-4">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <h1 className="text-7xl font-extrabold text-emerald-400 mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold mb-2">
          Page not found
        </h2>
        <p className="text-slate-400 mb-8">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
          >
            Go to Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition"
          >
            Go Back
          </button>
        </div>

        {/* Branding */}
        <p className="mt-10 text-sm text-slate-500">
          Git<span className="text-emerald-400">map</span> · Visualize repositories
        </p>
      </div>
    </div>
  );
}

export default NotFound;
