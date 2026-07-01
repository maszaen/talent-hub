"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { registerStudent } from "@/server-actions/user.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const major = formData.get("major") as string;
    const cohortYearStr = formData.get("cohortYear") as string;

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    const res = await registerStudent({
      name,
      email,
      password,
      major: major || undefined,
      cohortYear: cohortYearStr ? parseInt(cohortYearStr) : undefined,
    });

    if (!res.success) {
      setError(res.error || "Gagal mendaftar");
      setLoading(false);
      return;
    }

    // Auto login
    const loginRes = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (loginRes?.error) {
      router.push("/login"); // fallback
    } else {
      router.push("/student/dashboard");
      router.refresh();
    }
  };

  return (
    <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              name="name"
              placeholder="Andi Pratama"
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Kampus</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@student.ac.id"
              required
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major">Program Studi</Label>
              <Input
                id="major"
                name="major"
                placeholder="Informatika"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohortYear">Angkatan</Label>
              <Input
                id="cohortYear"
                name="cohortYear"
                type="number"
                placeholder="2024"
                min={2018}
                max={2030}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="bg-background/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 mt-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Daftar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/60">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Masuk
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
