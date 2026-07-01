import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationClient } from "@/components/admin/VerificationClient";
import { redirect } from "next/navigation";
import { suggestPoints } from "@/lib/points-engine";
import { SubmissionType } from "@prisma/client";

export default async function AdminVerificationPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");

  const submissions = await prisma.submission.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { name: true, major: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  // Calculate suggested points by fetching detail for each submission if necessary
  const processedSubmissions = await Promise.all(submissions.map(async (sub) => {
    let suggestedPoints = 0;
    if (sub.type === "SKILL") suggestedPoints = suggestPoints("SKILL");
    else if (sub.type === "CERTIFICATE") {
      const cert = await prisma.certificate.findUnique({ where: { id: sub.refId } });
      if (cert) suggestedPoints = suggestPoints("CERTIFICATE", cert.level);
    }
    else if (sub.type === "PORTFOLIO") {
      const port = await prisma.portfolio.findUnique({ where: { id: sub.refId } });
      if (port) suggestedPoints = suggestPoints("PORTFOLIO", undefined, port.type);
    }
    return {
      ...sub,
      suggestedPoints
    };
  }));

  const skills = processedSubmissions.filter(s => s.type === "SKILL");
  const certs = processedSubmissions.filter(s => s.type === "CERTIFICATE");
  const ports = processedSubmissions.filter(s => s.type === "PORTFOLIO");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verifikasi Pengajuan</h1>
        <p className="text-muted-foreground mt-1">Review pengajuan skill, sertifikat, dan portfolio mahasiswa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Antrean Verifikasi</CardTitle>
          <CardDescription>Pilih kategori untuk melihat antrean.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Semua ({processedSubmissions.length})</TabsTrigger>
              <TabsTrigger value="skills">Skill ({skills.length})</TabsTrigger>
              <TabsTrigger value="certs">Sertifikat ({certs.length})</TabsTrigger>
              <TabsTrigger value="ports">Portfolio ({ports.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="m-0">
              <VerificationClient submissions={processedSubmissions} />
            </TabsContent>
            <TabsContent value="skills" className="m-0">
              <VerificationClient submissions={skills} />
            </TabsContent>
            <TabsContent value="certs" className="m-0">
              <VerificationClient submissions={certs} />
            </TabsContent>
            <TabsContent value="ports" className="m-0">
              <VerificationClient submissions={ports} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
