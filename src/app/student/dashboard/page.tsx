import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award, Briefcase, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { where: { status: "APPROVED" } },
      certificates: { where: { status: "APPROVED" } },
      portfolios: { where: { status: "APPROVED" } },
      submissions: { 
        orderBy: { createdAt: "desc" },
        take: 5 
      },
    },
  });

  if (!user) return null;

  const pendingCount = await prisma.submission.count({
    where: { userId, status: "PENDING" },
  });

  const leaderboard = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { totalPoints: "desc" },
    take: 3,
    select: { id: true, name: true, totalPoints: true },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, {user.name}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Pantau progress talenta dan kumpulkan poinmu untuk mendapatkan reward.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.totalPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">Poin terakumulasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Skill Approved</CardTitle>
            <Star className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.skills.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Skill terverifikasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sertifikat</CardTitle>
            <Award className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.certificates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sertifikat valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.portfolios.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Karya terpublikasi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Aktivitas Terakhir</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Riwayat pengajuan poinmu (menunggu {pendingCount} verifikasi)
              </p>
            </div>
            <Link href="/student/submissions" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Lihat Semua <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                  Belum ada aktivitas pengajuan.
                </div>
              ) : (
                user.submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {sub.type === "SKILL" ? <Star className="w-4 h-4 text-primary" /> :
                         sub.type === "CERTIFICATE" ? <Award className="w-4 h-4 text-primary" /> :
                         <FileText className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={sub.status === "APPROVED" ? "default" : sub.status === "REJECTED" ? "destructive" : "secondary"}>
                      {sub.status === "APPROVED" ? `+${sub.pointsAwarded} Pts` : sub.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Leaderboard</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Peringkat tertinggi saat ini
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((lb, index) => (
                <div key={lb.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lb.name}</p>
                    <p className="text-xs text-muted-foreground">{lb.id === userId ? "Itu kamu!" : ""}</p>
                  </div>
                  <div className="font-bold text-amber-500">
                    {lb.totalPoints} pts
                  </div>
                </div>
              ))}
            </div>
            <Link href="/student/leaderboard" className={buttonVariants({ variant: "ghost", className: "w-full mt-4 text-primary" })}>
              Lihat Peringkat Lengkap
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
