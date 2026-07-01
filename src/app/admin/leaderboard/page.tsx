import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminLeaderboardPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { totalPoints: "desc" },
    take: 100, // Show top 100
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard Global</h1>
        <p className="text-muted-foreground mt-1">Peringkat 100 besar mahasiswa berdasarkan perolehan poin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Students</CardTitle>
          <CardDescription>Peringkat dihitung berdasarkan total poin yang disetujui admin.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Mahasiswa</TableHead>
                <TableHead>Prodi</TableHead>
                <TableHead>Total Poin</TableHead>
                <TableHead>Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Belum ada data mahasiswa.</TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => {
                  const pts = student.totalPoints;
                  let badge = "Bronze";
                  let badgeColor = "bg-orange-500/10 text-orange-600 border-orange-200";
                  
                  if (pts >= 50) { badge = "Platinum"; badgeColor = "bg-violet-500/10 text-violet-600 border-violet-200"; }
                  else if (pts >= 25) { badge = "Gold"; badgeColor = "bg-amber-500/10 text-amber-600 border-amber-200"; }
                  else if (pts >= 10) { badge = "Silver"; badgeColor = "bg-slate-500/10 text-slate-600 border-slate-200"; }

                  return (
                    <TableRow key={student.id} className={index < 3 ? "bg-primary/5" : ""}>
                      <TableCell className="text-center font-bold">
                        {index === 0 ? <Trophy className="w-5 h-5 mx-auto text-amber-500" /> :
                         index === 1 ? <Trophy className="w-5 h-5 mx-auto text-slate-400" /> :
                         index === 2 ? <Trophy className="w-5 h-5 mx-auto text-orange-700" /> :
                         index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{student.name}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.major || "-"}</TableCell>
                      <TableCell className="font-bold">{pts} pts</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badgeColor}>{badge}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
