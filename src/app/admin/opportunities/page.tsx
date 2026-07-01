import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminOpportunitiesClient } from "@/components/admin/AdminOpportunitiesClient";
import { redirect } from "next/navigation";

export default async function AdminOpportunitiesPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");

  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Peluang & Lowongan</h1>
        <p className="text-muted-foreground mt-1">Kelola informasi peluang proyek, lomba, atau asisten lab untuk mahasiswa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Peluang</CardTitle>
          <CardDescription>Tambah peluang baru dan tentukan keahlian yang dicari.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminOpportunitiesClient opportunities={opportunities} />
        </CardContent>
      </Card>
    </div>
  );
}
