"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Star,
  FileText,
  Award,
  Trophy,
  Gift,
  Sparkles,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "Profil Saya", icon: User },
  { href: "/student/skills", label: "Skill", icon: Star },
  { href: "/student/certificates", label: "Sertifikat", icon: Award },
  { href: "/student/portfolio", label: "Portfolio", icon: FileText },
  { href: "/student/submissions", label: "Pengajuan", icon: FileText },
  { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/student/rewards", label: "Reward", icon: Gift },
  { href: "/student/recommendations", label: "AI Rekomendasi", icon: Sparkles },
];

function SidebarContent({
  userName,
  totalPoints,
}: {
  userName: string;
  totalPoints?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-none">
              Talent Hub
            </p>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Student Portal</p>
          </div>
        </div>
      </div>

      {/* Points display */}
      {totalPoints !== undefined && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30">
          <p className="text-xs text-sidebar-foreground/60 mb-0.5">Total Poin Kamu</p>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xl font-bold text-sidebar-foreground">
              {totalPoints}
            </span>
            <Badge
              variant="secondary"
              className="text-xs ml-auto bg-sidebar-primary/20 text-sidebar-foreground/70"
            >
              {totalPoints >= 50
                ? "🏆 Platinum"
                : totalPoints >= 25
                ? "🥇 Gold"
                : totalPoints >= 10
                ? "🥈 Silver"
                : "🥉 Bronze"}
            </Badge>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
        {studentLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {link.label}
              {link.href === "/student/recommendations" && (
                <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary-foreground">
              {userName?.charAt(0)?.toUpperCase() ?? "S"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-sidebar-foreground/50">Mahasiswa</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger className="inline-flex w-full justify-start items-center gap-3 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 text-sm h-10 px-4 py-2 rounded-md font-medium transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin keluar dari portal mahasiswa?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => signOut({ callbackUrl: "/login" })}>
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function StudentSidebar({
  userName,
  totalPoints,
}: {
  userName: string;
  totalPoints?: number;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-sidebar min-h-screen flex-col border-r border-sidebar-border">
        <SidebarContent userName={userName} totalPoints={totalPoints} />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center gap-3">
        <Sheet>
          <SheetTrigger className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SidebarContent userName={userName} totalPoints={totalPoints} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">Talent Hub</span>
        </div>
        {totalPoints !== undefined && (
          <div className="ml-auto flex items-center gap-1 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-bold">{totalPoints}</span>
          </div>
        )}
      </div>
    </>
  );
}
