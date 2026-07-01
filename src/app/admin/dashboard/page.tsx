import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckSquare, Award, Star } from "lucide-react";
import { DashboardChart } from "@/components/admin/DashboardChart";

export default async function AdminDashboard() {
  const session = await auth();

  const [
    totalStudents,
    approvedSkills,
    approvedCertificates,
    approvedPortfolios,
    pendingSubmissions,
    submissions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.studentSkill.count({ where: { status: "APPROVED" } }),
    prisma.certificate.count({ where: { status: "APPROVED" } }),
    prisma.portfolio.count({ where: { status: "APPROVED" } }),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.submission.findMany({
      select: { createdAt: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    }),
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = monthNames.map(name => ({ name, total: 0 }));

  submissions.forEach(sub => {
    const month = sub.createdAt.getMonth();
    monthlyData[month].total += 1;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Ringkasan data talenta mahasiswa di Talent Hub.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Skill Terverifikasi</CardTitle>
            <Star className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedSkills}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Portofolio & Sertifikat</CardTitle>
            <Award className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedCertificates + approvedPortfolios}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <DashboardChart data={monthlyData} />
    </div>
  );
}
