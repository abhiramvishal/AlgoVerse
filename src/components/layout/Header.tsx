"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        AlgoVerse
      </Link>
      <div className="flex items-center gap-2">
        <div className="relative hidden w-56 sm:block">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input className="pl-8" placeholder="Search topics..." />
        </div>
        <Button size="sm" variant="outline">
          Login
        </Button>
      </div>
    </header>
  );
}
