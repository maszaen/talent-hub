"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { claimReward } from "@/server-actions/reward.actions";
import { useRouter } from "next/navigation";
import { Gift, CheckCircle2 } from "lucide-react";

type Reward = {
  id: string;
  title: string;
  description: string | null;
  pointsRequired: number;
  stock: number;
};

export function StudentRewardsClient({ rewards, userPoints }: { rewards: Reward[], userPoints: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleClaim = async (rewardId: string) => {
    if (!confirm("Tukar poinmu dengan reward ini?")) return;
    
    setLoading(rewardId);
    const res = await claimReward(rewardId);
    setLoading(null);
    
    if (res.success) {
      toast.success("Reward berhasil diklaim! Silakan hubungi admin kampus.");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal mengklaim reward");
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          Belum ada reward yang tersedia.
        </div>
      ) : (
        rewards.map((r) => {
          const isEligible = userPoints >= r.pointsRequired;
          const isOutOfStock = r.stock <= 0;
          const disabled = !isEligible || isOutOfStock || loading !== null;

          return (
            <div key={r.id} className="relative flex flex-col p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
              {isOutOfStock && (
                <div className="absolute top-4 right-4 bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded">
                  Habis
                </div>
              )}
              
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="font-bold text-lg mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground flex-1 mb-4">
                {r.description || "Tidak ada deskripsi"}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t">
                <div className="font-bold text-amber-500">
                  {r.pointsRequired} pts
                </div>
                <Button 
                  onClick={() => handleClaim(r.id)} 
                  disabled={disabled}
                  variant={isEligible && !isOutOfStock ? "default" : "secondary"}
                >
                  {loading === r.id ? "Memproses..." : "Tukar Poin"}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
