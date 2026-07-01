import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Award, Briefcase, Star, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();

  // If already logged in, redirect to respective dashboard
  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-transparent p-0">
              <Image src="/logo.png" alt="Talent Hub Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight">Talent Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Masuk
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm", className: "rounded-full shadow-lg shadow-primary/20" })}>
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Star className="w-4 h-4" /> 
            <span>Platform Gamifikasi Mahasiswa #1</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-blue-600">
            Bangun Portofolio.<br />Dapatkan Reward.
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Kumpulkan poin dari setiap keahlian, sertifikat, dan proyek yang kamu kerjakan. 
            Tukarkan poinmu dengan berbagai reward eksklusif dari kampus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className={buttonVariants({ size: "lg", className: "!rounded-full h-14 px-8 text-base shadow-xl shadow-primary/25 hover:scale-[1.04] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" })}>
              Mulai Perjalananmu <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "!rounded-full h-14 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 transition-colors" })}>
              Lihat Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja Talent Hub</h2>
            <p className="text-muted-foreground">Ekosistem terintegrasi untuk mengembangkan potensimu.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
              title="1. Verifikasi Keahlian"
              desc="Unggah sertifikat atau bukti portofoliomu. Admin kampus akan memverifikasi dan memberikan poin."
            />
            <FeatureCard 
              icon={<Award className="w-8 h-8 text-primary" />}
              title="2. Kumpulkan Poin"
              desc="Setiap pencapaian bernilai poin. Naikkan rank kamu dari Bronze hingga Platinum."
            />
            <FeatureCard 
              icon={<Briefcase className="w-8 h-8 text-blue-400" />}
              title="3. Dapatkan Peluang"
              desc="Gunakan poin untuk mengklaim reward atau dapatkan rekomendasi pekerjaan sesuai keahlianmu."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t border-white/5 bg-background">
        <p className="text-sm">© {new Date().getFullYear()} University Talent Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
