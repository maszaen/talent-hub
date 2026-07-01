import { auth } from "@/lib/auth";
import { getAIRecommendation } from "@/lib/ai-recommendation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { Sparkles, Star, Trophy, Briefcase, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function StudentRecommendationsPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/login");

  // Fetch AI Recommendations based on user's current profile, skills, and points
  const recommendations = await getAIRecommendation(session.user.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rekomendasi AI</h1>
        <p className="text-muted-foreground mt-1">Saran yang dipersonalisasi untuk mengembangkan talenta dan karirmu.</p>
      </div>

      <div className="grid gap-6">
        {recommendations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Sparkles className="w-12 h-12 mb-4 text-muted/50" />
              <p>Belum ada rekomendasi yang tersedia.</p>
              <p className="text-sm">Lengkapi profil dan ajukan skill/portofolio terlebih dahulu.</p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, i) => (
            <Card key={i} className={`relative overflow-hidden ${rec.priority === "high" ? "border-primary/50 shadow-md shadow-primary/10" : ""}`}>
              {rec.priority === "high" && (
                <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {rec.type === "skill_gap" ? (
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Star className="w-5 h-5" /></div>
                    ) : rec.type === "opportunity" ? (
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                    ) : (
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Trophy className="w-5 h-5" /></div>
                    )}
                    <CardTitle className="text-xl">{rec.title}</CardTitle>
                  </div>
                  <Badge variant={rec.priority === "high" ? "default" : rec.priority === "medium" ? "secondary" : "outline"}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">{rec.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
