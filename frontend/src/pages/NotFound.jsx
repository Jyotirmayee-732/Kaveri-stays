import React from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowLeft } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-[#FAF8F5] text-[#2C4A3E] rounded-2xl flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-[#C59B27]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27] block">404 Error</span>
        <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Page Not Found</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          The stay page or administrative resource you requested does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C4A3E] text-white rounded-xl text-xs font-semibold hover:bg-[#3D6454]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
