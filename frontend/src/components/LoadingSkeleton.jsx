import React from "react";

export const PropertySkeletonCard = () => {
  return (
    <div className="bg-white rounded-3xl border border-[#E8DFD1] overflow-hidden shadow-xs space-y-4 p-4">
      <div className="w-full h-56 rounded-2xl skeleton-shimmer"></div>
      <div className="space-y-3 px-2">
        <div className="h-6 w-3/4 skeleton-shimmer rounded-md"></div>
        <div className="h-4 w-1/2 skeleton-shimmer rounded-md"></div>
        <div className="h-12 w-full skeleton-shimmer rounded-xl"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-24 skeleton-shimmer rounded-md"></div>
          <div className="h-10 w-28 skeleton-shimmer rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DFD1] overflow-hidden p-6 space-y-4">
      <div className="h-8 w-1/3 skeleton-shimmer rounded-lg"></div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4 py-3 border-b border-stone-100">
          <div className="h-6 w-1/4 skeleton-shimmer rounded-md"></div>
          <div className="h-6 w-1/4 skeleton-shimmer rounded-md"></div>
          <div className="h-6 w-1/6 skeleton-shimmer rounded-md"></div>
          <div className="h-8 w-20 skeleton-shimmer rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};
