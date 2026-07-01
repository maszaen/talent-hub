import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentProfileClient } from "@/components/student/StudentProfileClient";
import { redirect } from "next/navigation";
import { User, Mail, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function StudentProfilePage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">Kelola informasi pribadi dan profil akademis kamu.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-1">
                  <Mail className="w-3 h-3" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-1">
                  <GraduationCap className="w-3 h-3" />
                  <span>{user.major || "Belum diatur"}</span>
                </div>
              </div>
              <div className="w-full pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Poin</span>
                  <Badge variant="secondary" className="font-bold">{user.totalPoints} pts</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
            <CardDescription>Perbarui data diri untuk melengkapi portofoliomu.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentProfileClient initialData={{
              name: user.name,
              major: user.major,
              cohortYear: user.cohortYear,
              bio: user.bio,
            }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
