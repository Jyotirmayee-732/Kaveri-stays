import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Building2, Mail, Lock, LogIn, Key, UserCheck, ShieldCheck } from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.full_name || user.email}!`);
      
      // Navigate based on role or redirect path
      if (user.role === "owner") {
        navigate("/owner");
      } else if (user.role === "manager") {
        navigate("/manager");
      } else if (user.role === "staff") {
        navigate("/staff");
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      showError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo convenience
  const fillDemo = (demoEmail, demoPass = "Password123!") => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-2xl space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2C4A3E] text-[#C59B27] flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Welcome Back</h1>
          <p className="text-xs text-[#57534E]">
            Sign in to access your guest dashboard, manage stays, or view reservation payments.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57534E] uppercase">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57534E] uppercase">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#57534E]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#E8DFD1] text-[#2C4A3E] focus:ring-[#2C4A3E]"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#2C4A3E] hover:bg-[#3D6454] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
          </button>
        </form>

        {/* Demo Account Fill Bar */}
        <div className="pt-4 border-t border-[#E8DFD1] space-y-2">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider text-center">
            Quick Test Credentials
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => fillDemo("testguest@example.com")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] rounded-lg border border-stone-200 flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-[#2C4A3E]" /> Guest
            </button>
            <button
              onClick={() => fillDemo("statemachine_staff_2026@example.com")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] rounded-lg border border-stone-200 flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600" /> Staff
            </button>
            <button
              onClick={() => fillDemo("manager@example.com")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] rounded-lg border border-stone-200 flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-indigo-600" /> Manager
            </button>
            <button
              onClick={() => fillDemo("owner@example.com")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] rounded-lg border border-stone-200 flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-rose-600" /> Owner
            </button>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center text-xs text-[#57534E]">
          Don't have a guest account?{" "}
          <Link to="/register" className="font-semibold text-[#2C4A3E] hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};
