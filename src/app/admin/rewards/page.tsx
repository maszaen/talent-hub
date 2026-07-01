import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminRewardsClient } from "@/components/admin/AdminRewardsClient";
import { redirect } from "next/navigation";

export default async function AdminRewardsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");

  const rewards = await prisma.reward.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Katalog Reward</h1>
        <p className="text-muted-foreground mt-1">Kelola hadiah yang bisa ditukarkan dengan poin mahasiswa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Reward</CardTitle>
          <CardDescription>Tambah, edit, atau hapus reward dari sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminRewardsClient rewards={rewards} />
        </CardContent>
      </Card>
    </div>
  );
}
