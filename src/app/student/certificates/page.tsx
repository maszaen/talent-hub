import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentCertificatesClient } from "@/components/student/StudentCertificatesClient";
import { redirect } from "next/navigation";

export default async function StudentCertificatesPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/login");

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sertifikat & Prestasi</h1>
        <p className="text-muted-foreground mt-1">Unggah bukti prestasi lomba atau sertifikasi profesionalmu.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Sertifikat</CardTitle>
          <CardDescription>Semakin tinggi tingkat prestasi, semakin besar poin yang didapat.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentCertificatesClient certificates={certificates} />
        </CardContent>
      </Card>
    </div>
  );
}
