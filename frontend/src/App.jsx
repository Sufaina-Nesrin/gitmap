import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RequireAuth from "./components/RequireAuth";
import RequireGuest from "./components/RequireGuest";
import { AuthProvider } from "./context/AuthContext";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />

        <Route
          path="/signup"
          element={
            <RequireGuest>
              <Signup />
            </RequireGuest>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/pricing"
          element={
            <RequireAuth>
              <Pricing />
            </RequireAuth>
          }
        />
         <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}



export default App;
