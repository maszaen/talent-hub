"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Gift,
  Trophy,
  Briefcase,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Mahasiswa", icon: Users },
  { href: "/admin/verification", label: "Verifikasi", icon: CheckSquare },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/rewards", label: "Reward", icon: Gift },
  { href: "/admin/opportunities", label: "Opportunity", icon: Briefcase },
];

function SidebarContent({
  userName,
  onLinkClick,
}: {
  userName: string;
  onLinkClick?: () => void;
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
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-primary/5 hover:bg-sidebar-primary/10 transition-colors">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-sidebar-primary-foreground">
              {userName?.charAt(0)?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-sidebar-foreground/60">Administrator</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger className="p-2 ml-auto text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin keluar dari panel admin?
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
    </div>
  );
}

export function AdminSidebar({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-sidebar min-h-screen flex-col border-r border-sidebar-border">
        <SidebarContent userName={userName} />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SidebarContent userName={userName} onLinkClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">Talent Hub Admin</span>
        </div>
      </div>
    </>
  );
}
