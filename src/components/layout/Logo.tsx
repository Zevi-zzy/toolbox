"use client";

import { Box, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
          <Box className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-lg flex items-center justify-center shadow-md border-2 border-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300">
          <Sparkles className="w-3 h-3 text-white fill-white" />
        </div>
      </div>
      {showText && (
        <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
          Tool<span className="text-blue-600">box</span>
        </span>
      )}
    </Link>
  );
}
