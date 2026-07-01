import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentSkillsClient } from "@/components/student/StudentSkillsClient";
import { redirect } from "next/navigation";

export default async function StudentSkillsPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/login");

  const userId = session.user.id;

  const [skills, availableSkills] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.skill.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keahlian (Skills)</h1>
        <p className="text-muted-foreground mt-1">Ajukan keahlian yang kamu miliki untuk diverifikasi dan mendapatkan poin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Keahlian Saya</CardTitle>
          <CardDescription>Semua skill yang pernah kamu ajukan akan muncul di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentSkillsClient skills={skills} availableSkills={availableSkills} />
        </CardContent>
      </Card>
    </div>
  );
}
