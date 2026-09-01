import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Building2, User, Mail, Phone, MapPin, Lock, UserPlus, Info } from "lucide-react";

export const Register = () => {
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 8) {
      showError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email: email,
        phone: phone || null,
        city: city || null,
        password: password
      });

      showSuccess("Account registered successfully! Please log in with your email and password.");
      navigate("/login");
    } catch (err) {
      showError(err.message || "Registration failed. Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-2xl space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2C4A3E] text-[#C59B27] flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Create Guest Account</h1>
          <p className="text-xs text-[#57534E]">
            Join Kaveri Stays to reserve rooms, track your bookings, and enjoy member hospitality privileges.
          </p>
        </div>

        <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8DFD1] text-xs text-[#57534E] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#C59B27] shrink-0" />
          <span>Note: Public registration creates guest accounts only. Staff & Owner accounts are managed administratively.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57534E] uppercase">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#57534E] uppercase">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#57534E] uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57534E] uppercase">City</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore, Chennai, Mumbai..."
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#57534E] uppercase">Password * (Min 8 chars)</label>
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#57534E] uppercase">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#2C4A3E] hover:bg-[#3D6454] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs text-[#57534E] pt-2">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#2C4A3E] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
