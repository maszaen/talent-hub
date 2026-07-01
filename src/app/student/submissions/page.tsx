import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Star, Award, Briefcase } from "lucide-react";

export default async function StudentSubmissionsPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/login");

  const submissions = await prisma.submission.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Semua Aktivitas</h1>
        <p className="text-muted-foreground mt-1">Pantau seluruh riwayat pengajuan keahlian, sertifikat, dan portofoliomu.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan Poin</CardTitle>
          <CardDescription>Jika statusnya REJECTED, kamu bisa melihat catatan alasan dari Admin di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengajuan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Poin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer & Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                    Kamu belum pernah melakukan pengajuan.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {sub.type === "SKILL" ? <Star className="w-4 h-4 text-primary" /> : 
                         sub.type === "CERTIFICATE" ? <Award className="w-4 h-4 text-primary" /> : 
                         <Briefcase className="w-4 h-4 text-primary" />}
                        {sub.title}
                      </div>
                      <Badge variant="outline" className="mt-1 text-[10px]">{sub.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="font-bold">
                      {sub.status === "APPROVED" ? `+${sub.pointsAwarded}` : "0"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === "APPROVED" ? "default" : sub.status === "REJECTED" ? "destructive" : "secondary"}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {sub.status === "PENDING" ? (
                        <span className="text-muted-foreground italic">Menunggu Review</span>
                      ) : (
                        <div>
                          <div className="text-muted-foreground">Oleh: {sub.reviewedBy || "Admin"}</div>
                          {sub.rejectionNote && (
                            <div className="text-destructive mt-1 max-w-[200px] text-xs">
                              Alasan: {sub.rejectionNote}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
