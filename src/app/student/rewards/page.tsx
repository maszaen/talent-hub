import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentRewardsClient } from "@/components/student/StudentRewardsClient";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

export default async function StudentRewardsPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/login");

  const [user, rewards, claims] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { totalPoints: true } }),
    prisma.reward.findMany({ orderBy: { pointsRequired: "asc" } }),
    prisma.rewardClaim.findMany({ 
      where: { userId: session.user.id },
      include: { reward: true },
      orderBy: { claimedAt: "desc" }
    })
  ]);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Katalog Reward</h1>
          <p className="text-muted-foreground mt-1">Tukarkan poin yang telah kamu kumpulkan dengan berbagai benefit kampus.</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex flex-col items-end">
          <span className="text-sm font-medium text-primary">Saldo Poin Kamu</span>
          <span className="text-3xl font-extrabold text-primary">{user.totalPoints}</span>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Tersedia untuk Ditukar</h2>
        <StudentRewardsClient rewards={rewards} userPoints={user.totalPoints} />
      </div>

      {claims.length > 0 && (
        <div className="pt-8 border-t">
          <h2 className="text-xl font-bold mb-4">Riwayat Penukaran</h2>
          <div className="space-y-3">
            {claims.map(claim => (
              <div key={claim.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{claim.reward.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Diklaim pada {claim.claimedAt.toLocaleDateString("id-ID", { dateStyle: "long" })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-500/10">
                  -{claim.reward.pointsRequired} pts
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
