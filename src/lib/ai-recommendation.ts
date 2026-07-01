import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";

export interface Recommendation {
  type: "skill_gap" | "opportunity" | "leaderboard";
  title: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export async function getAIRecommendation(
  userId: string
): Promise<Recommendation[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { include: { skill: true }, where: { status: "APPROVED" } },
      certificates: { where: { status: "APPROVED" } },
      portfolios: { where: { status: "APPROVED" } },
    },
  });

  if (!user) return [];

  const opportunities = await prisma.opportunity.findMany({
    where: { isActive: true },
  });

  const leaderboard = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { totalPoints: "desc" },
    take: 11,
    select: { id: true, totalPoints: true },
  });

  const rewards = await prisma.reward.findMany({
    orderBy: { pointsRequired: "asc" },
    take: 5,
  });

  const userSkillNames = user.skills.map((s) => s.skill.name);

  const mappedOpportunities = opportunities.map(o => ({
    title: o.title,
    requiredSkills: Array.isArray(o.requiredSkills) ? (o.requiredSkills as string[]) : []
  }));

  // Try Anthropic AI first
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const prompt = `
You are a university talent advisor. Based on this student's profile, give personalized recommendations.

Student Profile:
- Name: ${user.name}
- Total Points: ${user.totalPoints}
- Approved Skills: ${userSkillNames.join(", ") || "none"}
- Certificates: ${user.certificates.length} approved
- Portfolios: ${user.portfolios.length} approved

Available Opportunities (require these skills):
${mappedOpportunities.map((o) => `- "${o.title}": needs [${o.requiredSkills.join(", ")}]`).join("\n")}

Leaderboard context:
- Student's rank: ${leaderboard.findIndex((u) => u.id === userId) + 1} of ${leaderboard.length}
- Points needed to reach top 3: ${Math.max(0, (leaderboard[2]?.totalPoints ?? 0) - user.totalPoints)}
- Points needed to reach top 10: ${Math.max(0, (leaderboard[9]?.totalPoints ?? 0) - user.totalPoints)}

Next rewards available:
${rewards.map((r) => `- "${r.title}": ${r.pointsRequired} points (student has ${user.totalPoints})`).join("\n")}

Return a JSON array of 3-5 recommendations. Each object must have exactly:
{
  "type": "skill_gap" | "opportunity" | "leaderboard",
  "title": "short action title",
  "reason": "specific explanation why this helps",
  "priority": "high" | "medium" | "low"
}

Be specific, actionable, and reference the actual data above. No markdown, just valid JSON array.`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) return parsed as Recommendation[];
      }
    } catch (e) {
      console.error("AI recommendation failed, falling back to rule-based:", e);
    }
  }

  // Rule-based fallback
  return getRuleBasedRecommendations(
    user,
    userSkillNames,
    mappedOpportunities,
    leaderboard,
    rewards
  );
}

function getRuleBasedRecommendations(
  user: { id: string; totalPoints: number; name: string },
  userSkillNames: string[],
  opportunities: { title: string; requiredSkills: string[] }[],
  leaderboard: { id: string; totalPoints: number }[],
  rewards: { title: string; pointsRequired: number }[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Skill gap analysis
  const allRequiredSkills = new Set(
    opportunities.flatMap((o) => o.requiredSkills)
  );
  const missingSkills = [...allRequiredSkills].filter(
    (s) => !userSkillNames.includes(s)
  );

  if (missingSkills.length > 0) {
    recs.push({
      type: "skill_gap",
      title: `Tambahkan skill: ${missingSkills.slice(0, 3).join(", ")}`,
      reason: `Skill ini dibutuhkan oleh ${opportunities.length} opportunity aktif di kampus, tapi belum ada di profilmu.`,
      priority: "high",
    });
  }

  // Filter out opportunities that don't match the user's skills
  const matchedOpportunities = opportunities.filter((o) => {
    const matchCount = o.requiredSkills.filter((reqSkill: string) => 
      userSkillNames.includes(reqSkill)
    ).length;
    return matchCount > 0;
  });

  if (matchedOpportunities.length > 0) {
    const best = matchedOpportunities.sort((a, b) => b.requiredSkills.filter(s => userSkillNames.includes(s)).length - a.requiredSkills.filter(s => userSkillNames.includes(s)).length)[0];
    const overlap = best.requiredSkills.filter(s => userSkillNames.includes(s)).length;
    
    recs.push({
      type: "opportunity",
      title: `Lamar: "${best.title}"`,
      reason:
        overlap > 0
          ? `Kamu sudah punya ${overlap} dari ${best.requiredSkills.length} skill yang dibutuhkan.`
          : `Opportunity baru tersedia. Mulai kembangkan skill yang diperlukan.`,
      priority: overlap > 0 ? "high" : "medium",
    });
  }

  // Leaderboard boost
  const rank = leaderboard.findIndex((u) => u.id === user.id) + 1;
  const top10Points = leaderboard[9]?.totalPoints ?? 0;
  const top3Points = leaderboard[2]?.totalPoints ?? 0;
  const gapTo10 = Math.max(0, top10Points - user.totalPoints);
  const gapTo3 = Math.max(0, top3Points - user.totalPoints);

  if (rank > 3) {
    recs.push({
      type: "leaderboard",
      title: `Naik ke Top 3 — butuh ${gapTo3} poin lagi`,
      reason: `Kamu saat ini di rank ${rank}. Upload portfolio tipe Industri (8 poin) atau Sertifikat Internasional (10 poin) untuk boost cepat.`,
      priority: "high",
    });
  } else if (gapTo10 > 0) {
    recs.push({
      type: "leaderboard",
      title: `Masuk Top 10 — butuh ${gapTo10} poin`,
      reason: `Tambahkan portfolio Freelance (5 poin) atau Sertifikat Nasional (5 poin) untuk masuk top 10.`,
      priority: "medium",
    });
  }

  // Next reward
  const nextReward = rewards.find((r) => r.pointsRequired > user.totalPoints);
  if (nextReward) {
    const gap = nextReward.pointsRequired - user.totalPoints;
    recs.push({
      type: "leaderboard",
      title: `Klaim "${nextReward.title}" — butuh ${gap} poin lagi`,
      reason: `Kamu hanya butuh ${gap} poin lagi untuk menukarkan "${nextReward.title}". Coba submit skill baru (3 poin) atau sertifikat.`,
      priority: "low",
    });
  }

  return recs;
}
