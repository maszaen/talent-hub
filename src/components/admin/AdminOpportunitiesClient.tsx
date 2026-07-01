"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { createOpportunity, deleteOpportunity, toggleOpportunity } from "@/server-actions/opportunity.actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type Opportunity = {
  id: string;
  title: string;
  description: string;
  requiredSkills: any;
  postedBy: string;
  isActive: boolean;
};

export function AdminOpportunitiesClient({ opportunities }: { opportunities: Opportunity[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const skillsString = fd.get("requiredSkills") as string;
    const requiredSkills = skillsString.split(",").map(s => s.trim()).filter(Boolean);

    const res = await createOpportunity({
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      requiredSkills,
    });

    setLoading(false);
    if (res.success) {
      toast.success("Peluang berhasil ditambahkan!");
      setOpenCreate(false);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleOpportunity(id, !currentStatus);
    if (res.success) {
      toast.success(`Peluang di${!currentStatus ? 'aktifkan' : 'nonaktifkan'}!`);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus peluang ini?")) return;
    const res = await deleteOpportunity(id);
    if (res.success) {
      toast.success("Peluang dihapus!");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" /> Tambah Peluang
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Peluang Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul Peluang / Lowongan</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea name="description" required />
              </div>
              <div className="space-y-2">
                <Label>Keahlian yang Dibutuhkan</Label>
                <Input name="requiredSkills" placeholder="Contoh: Programmer, UI/UX Designer" required />
                <p className="text-xs text-muted-foreground">Pisahkan dengan koma.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpenCreate(false)}>Batal</Button>
                <Button type="submit" disabled={loading}>Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Peluang</TableHead>
            <TableHead>Keahlian Dibutuhkan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Belum ada data peluang.</TableCell>
            </TableRow>
          ) : (
            opportunities.map((o) => {
              const skillsArray = Array.isArray(o.requiredSkills) ? o.requiredSkills : [];
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-medium">{o.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{o.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {skillsArray.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={o.isActive ? "default" : "secondary"}>
                      {o.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleToggle(o.id, o.isActive)}
                      title={o.isActive ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {o.isActive ? <PowerOff className="w-4 h-4 text-amber-500" /> : <Power className="w-4 h-4 text-emerald-500" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(o.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </>
  );
}
