import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2C4A3E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-[#57534E]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Access Restricted</h2>
        <p className="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
          You don't have permission to perform this action or view this management portal. Current role: <span className="font-semibold capitalize text-stone-900">{role || "Guest"}</span>.
        </p>
        <div className="pt-4">
          <Link
            to={role === "guest" ? "/dashboard" : "/"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C4A3E] text-white rounded-xl font-semibold text-sm hover:bg-[#3D6454] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
