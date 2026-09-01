import React from "react";
import { STATUS_COLORS } from "../utils/constants";

export const StatusBadge = ({ status }) => {
  const normalized = (status || "").toLowerCase();
  const config = STATUS_COLORS[normalized] || {
    bg: "bg-stone-100 text-stone-700 border-stone-200",
    dot: "bg-stone-400",
    label: status || "Unknown"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} shadow-2xs`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};
