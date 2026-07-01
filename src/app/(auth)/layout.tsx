import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login - University Talent Hub",
  description: "Masuk ke portal University Talent Hub.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center p-0 bg-transparent mb-6 transition-transform hover:scale-105">
            <Image src="/logo.png" alt="Talent Hub Logo" width={48} height={48} className="object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Talent Hub</h1>
          <p className="text-sm text-foreground/60 mt-1 text-center">
            Platform Gamifikasi Talenta Mahasiswa
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
