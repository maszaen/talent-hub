import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Star, Award, Briefcase } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminStudentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");

  const { id } = await props.params;

  const student = await prisma.user.findUnique({
    where: { id, role: "STUDENT" },
    include: {
      skills: { include: { skill: true } },
      certificates: true,
      portfolios: true,
      submissions: { orderBy: { createdAt: "desc" } },
    }
  });

  if (!student) notFound();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/students" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Mahasiswa</h1>
          <p className="text-muted-foreground mt-1">Profil dan riwayat talenta mahasiswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl text-center">{student.name}</h3>
              <p className="text-muted-foreground text-center text-sm">{student.email}</p>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prodi</span>
                <span className="font-medium">{student.major || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Angkatan</span>
                <span className="font-medium">{student.cohortYear || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Poin</span>
                <Badge variant="secondary" className="font-bold">{student.totalPoints} pts</Badge>
              </div>
            </div>

            {student.bio && (
              <div className="pt-4 border-t">
                <span className="text-sm text-muted-foreground block mb-1">Bio</span>
                <p className="text-sm">{student.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <Tabs defaultValue="skills" className="w-full">
              <div className="px-6 pt-6 pb-2 border-b">
                <TabsList>
                  <TabsTrigger value="skills" className="gap-2"><Star className="w-4 h-4"/> Skills</TabsTrigger>
                  <TabsTrigger value="certs" className="gap-2"><Award className="w-4 h-4"/> Sertifikat</TabsTrigger>
                  <TabsTrigger value="portfolios" className="gap-2"><Briefcase className="w-4 h-4"/> Portfolio</TabsTrigger>
                  <TabsTrigger value="history">Riwayat</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="skills" className="p-6 m-0">
                <div className="grid gap-3">
                  {student.skills.length === 0 ? <p className="text-muted-foreground">Belum ada skill.</p> :
                    student.skills.map(s => (
                      <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">{s.skill.name}</span>
                        <Badge variant={s.status === "APPROVED" ? "default" : s.status === "REJECTED" ? "destructive" : "secondary"}>
                          {s.status}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </TabsContent>

              <TabsContent value="certs" className="p-6 m-0">
                <div className="grid gap-3">
                  {student.certificates.length === 0 ? <p className="text-muted-foreground">Belum ada sertifikat.</p> :
                    student.certificates.map(c => (
                      <div key={c.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{c.title}</span>
                          <Badge variant={c.status === "APPROVED" ? "default" : c.status === "REJECTED" ? "destructive" : "secondary"}>{c.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Level: {c.level} | Points: {c.points}
                        </div>
                        {c.fileUrl && <a href={c.fileUrl} target="_blank" className="text-sm text-primary hover:underline">Lihat Dokumen</a>}
                      </div>
                    ))
                  }
                </div>
              </TabsContent>

              <TabsContent value="portfolios" className="p-6 m-0">
                <div className="grid gap-3">
                  {student.portfolios.length === 0 ? <p className="text-muted-foreground">Belum ada portfolio.</p> :
                    student.portfolios.map(p => (
                      <div key={p.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{p.title}</span>
                          <Badge variant={p.status === "APPROVED" ? "default" : p.status === "REJECTED" ? "destructive" : "secondary"}>{p.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tipe: {p.type} | Points: {p.points}
                        </div>
                        {p.linkUrl && <a href={p.linkUrl} target="_blank" className="text-sm text-primary hover:underline block">{p.linkUrl}</a>}
                        {p.fileUrl && <a href={p.fileUrl} target="_blank" className="text-sm text-primary hover:underline block">Lihat Dokumen</a>}
                      </div>
                    ))
                  }
                </div>
              </TabsContent>

              <TabsContent value="history" className="p-6 m-0">
                <div className="space-y-4">
                  {student.submissions.length === 0 ? <p className="text-muted-foreground">Belum ada riwayat.</p> :
                    student.submissions.map(sub => (
                       <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                       <div>
                         <p className="font-medium text-sm">[{sub.type}] {sub.title}</p>
                         <p className="text-xs text-muted-foreground">
                           {sub.createdAt.toLocaleDateString("id-ID")}
                         </p>
                       </div>
                       <Badge variant={sub.status === "APPROVED" ? "default" : sub.status === "REJECTED" ? "destructive" : "secondary"}>
                         {sub.status === "APPROVED" ? `+${sub.pointsAwarded}` : sub.status}
                       </Badge>
                     </div>
                    ))
                  }
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
