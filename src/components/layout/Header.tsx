"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-[#08070f]/70 backdrop-blur-md px-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all">
            V
          </div>
          <span className="text-md font-bold tracking-tight text-white glow-text group-hover:text-indigo-300 transition-colors">
            AlgoVerse
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden w-64 sm:block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input 
            className="pl-9 h-9 bg-zinc-950/50 border-white/5 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 text-xs text-zinc-300 placeholder-zinc-500 transition-all rounded-lg" 
            placeholder="Search topics..." 
          />
        </div>
        <Button 
          size="sm" 
          variant="outline"
          className="h-8 rounded-lg text-xs font-semibold px-4 border-white/10 hover:bg-indigo-600/10 hover:text-white hover:border-indigo-500/20 active:scale-95 transition-all"
        >
          Login
        </Button>
      </div>
    </header>
  );
}
