import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  Building2, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Calendar, 
  Compass, 
  Sparkles 
} from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showSuccess("Successfully logged out");
    navigate("/");
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Determine dashboard link based on role
  const getDashboardPath = () => {
    if (role === "owner") return "/owner";
    if (role === "manager") return "/manager";
    if (role === "staff") return "/staff";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8DFD1]/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#2C4A3E] text-[#C59B27] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1917] block leading-tight">
                Kaveri Stays
              </span>
              <span className="text-[11px] font-medium tracking-widest text-[#C59B27] uppercase block">
                Luxury Hospitality
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
              }`}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className={`text-sm font-medium transition-colors ${
                isActive("/properties") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
              }`}
            >
              Properties
            </Link>

            {/* Elevated Role Navigation (Owner / Manager / Staff) */}
            {isAuthenticated && role && role !== "guest" && (
              <>
                {(role === "owner" || role === "manager") && (
                  <Link
                    to="/manager"
                    className={`text-sm font-medium transition-colors ${
                      isActive("/manager") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
                    }`}
                  >
                    Analytics & Reports
                  </Link>
                )}
                <Link
                  to="/staff/bookings"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/staff/bookings") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
                  }`}
                >
                  Bookings Desk
                </Link>
                <Link
                  to="/staff/guests"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/staff/guests") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
                  }`}
                >
                  Guests
                </Link>
                <Link
                  to="/staff/rooms"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/staff/rooms") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
                  }`}
                >
                  Rooms
                </Link>
              </>
            )}

            {!(role && role !== "guest") && (
              <>
                <Link
                  to="/about"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/about") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
                  }`}
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/contact") ? "text-[#2C4A3E] font-semibold border-b-2 border-[#2C4A3E] pb-1" : "text-[#57534E] hover:text-[#2C4A3E]"
                  }`}
                >
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Admin / Dashboard Quick Link */}
                {role && role !== "guest" ? (
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#2C4A3E] bg-[#2C4A3E]/10 rounded-lg hover:bg-[#2C4A3E]/20 transition-all border border-[#2C4A3E]/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {role} Desk
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1C1917] bg-[#E8DFD1]/50 rounded-lg hover:bg-[#E8DFD1] transition-all"
                  >
                    <Calendar className="w-4 h-4 text-[#2C4A3E]" />
                    My Stays
                  </Link>
                )}

                {/* Profile Badge */}
                <div className="flex items-center gap-2 pl-3 border-l border-[#E8DFD1]">
                  <div className="w-9 h-9 rounded-full bg-[#2C4A3E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "G"}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-[#1C1917] truncate max-w-[120px]">
                      {user?.full_name || user?.email?.split("@")[0]}
                    </p>
                    <p className="text-[10px] text-[#57534E] capitalize">
                      {role || "Guest"}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-[#57534E] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#1C1917] hover:text-[#2C4A3E] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2C4A3E] hover:bg-[#3D6454] rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  Book Your Stay
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-[#1C1917] bg-[#E8DFD1]/40 hover:bg-[#E8DFD1] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E8DFD1] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#1C1917] hover:bg-[#E8DFD1]/50"
          >
            <Compass className="w-5 h-5 text-[#2C4A3E]" />
            Home
          </Link>
          <Link
            to="/properties"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#1C1917] hover:bg-[#E8DFD1]/50"
          >
            <Building2 className="w-5 h-5 text-[#2C4A3E]" />
            Explore Properties
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#1C1917] hover:bg-[#E8DFD1]/50"
          >
            <Sparkles className="w-5 h-5 text-[#2C4A3E]" />
            About Kaveri Stays
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#1C1917] hover:bg-[#E8DFD1]/50"
          >
            <User className="w-5 h-5 text-[#2C4A3E]" />
            Contact Us
          </Link>

          <div className="pt-4 border-t border-[#E8DFD1]">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-[#E8DFD1]/30 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2C4A3E] text-white flex items-center justify-center font-bold">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917]">{user?.full_name || user?.email}</p>
                    <p className="text-xs text-[#57534E] capitalize">{role || "Guest"}</p>
                  </div>
                </div>

                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 px-4 rounded-xl text-center font-semibold text-white bg-[#2C4A3E] block"
                >
                  Go to {role === "guest" ? "Guest Dashboard" : `${role.toUpperCase()} Desk`}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl text-center font-semibold text-rose-700 bg-rose-50 border border-rose-200 block"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-xl text-center font-semibold text-[#1C1917] bg-[#E8DFD1]/60 block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-xl text-center font-semibold text-white bg-[#2C4A3E] block"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
