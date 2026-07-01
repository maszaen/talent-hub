import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminStudentsPage(props: {
  searchParams: Promise<{ q?: string; minPoints?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");

  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const minPoints = parseInt(searchParams?.minPoints || "0", 10);

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      name: { contains: query },
      totalPoints: { gte: minPoints },
    },
    include: {
      _count: {
        select: {
          skills: { where: { status: "APPROVED" } },
          certificates: { where: { status: "APPROVED" } },
          portfolios: { where: { status: "APPROVED" } },
        }
      }
    },
    orderBy: { totalPoints: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daftar Mahasiswa</h1>
        <p className="text-muted-foreground mt-2">
          Kelola dan lihat profil talenta seluruh mahasiswa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-4 flex-wrap items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Nama Mahasiswa</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  name="q" 
                  placeholder="Cari nama..." 
                  defaultValue={query}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2 w-32">
              <label className="text-sm font-medium">Min. Poin</label>
              <Input 
                name="minPoints" 
                type="number" 
                defaultValue={minPoints || ""}
                placeholder="0"
              />
            </div>
            <Button type="submit">Filter</Button>
            {(query || minPoints > 0) && (
              <Link href="/admin/students" className={buttonVariants({ variant: "ghost" })}>
                Reset
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Prodi & Angkatan</TableHead>
                <TableHead>Total Poin</TableHead>
                <TableHead>Item Approved</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                    Tidak ada mahasiswa yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const totalApproved = 
                    student._count.skills + 
                    student._count.certificates + 
                    student._count.portfolios;
                    
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                        <br/>
                        <span className="text-xs text-muted-foreground font-normal">{student.email}</span>
                      </TableCell>
                      <TableCell>
                        {student.major || "-"}
                        <br/>
                        <span className="text-xs text-muted-foreground">{student.cohortYear || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-bold">
                          {student.totalPoints} pts
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {totalApproved} items
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/students/${student.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
