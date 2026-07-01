import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentPortfolioClient } from "@/components/student/StudentPortfolioClient";
import { redirect } from "next/navigation";

export default async function StudentPortfolioPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/login");

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Karya & Portofolio</h1>
        <p className="text-muted-foreground mt-1">Pamerkan proyek-proyek terbaikmu untuk diverifikasi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Portofolio</CardTitle>
          <CardDescription>Semakin tinggi kompleksitas proyek (Personal vs Industri), semakin tinggi poinnya.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentPortfolioClient portfolios={portfolios} />
        </CardContent>
      </Card>
    </div>
  );
}
