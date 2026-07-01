"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { createReward, updateReward, deleteReward } from "@/server-actions/reward.actions";
import { useRouter } from "next/navigation";

type Reward = {
  id: string;
  title: string;
  description: string | null;
  pointsRequired: number;
  stock: number;
};

export function AdminRewardsClient({ rewards }: { rewards: Reward[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editData, setEditData] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createReward({
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      pointsRequired: parseInt(fd.get("pointsRequired") as string),
      stock: parseInt(fd.get("stock") as string),
    });
    setLoading(false);
    if (res.success) {
      toast.success("Reward berhasil ditambahkan!");
      setOpenCreate(false);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editData) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await updateReward(editData.id, {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      pointsRequired: parseInt(fd.get("pointsRequired") as string),
      stock: parseInt(fd.get("stock") as string),
    });
    setLoading(false);
    if (res.success) {
      toast.success("Reward berhasil diupdate!");
      setEditData(null);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus reward ini?")) return;
    const res = await deleteReward(id);
    if (res.success) {
      toast.success("Reward dihapus!");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" /> Tambah Reward
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Reward Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul Reward</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea name="description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Poin Dibutuhkan</Label>
                  <Input name="pointsRequired" type="number" min={1} required />
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input name="stock" type="number" min={0} required />
                </div>
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
            <TableHead>Judul Reward</TableHead>
            <TableHead>Poin Dibutuhkan</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Belum ada data reward.</TableCell>
            </TableRow>
          ) : (
            rewards.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-muted-foreground">{r.description}</div>
                </TableCell>
                <TableCell className="font-bold text-amber-500">{r.pointsRequired} pts</TableCell>
                <TableCell>{r.stock}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => setEditData(r)}>
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
          </DialogHeader>
          {editData && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul Reward</Label>
                <Input name="title" defaultValue={editData.title} required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea name="description" defaultValue={editData.description || ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Poin Dibutuhkan</Label>
                  <Input name="pointsRequired" type="number" min={1} defaultValue={editData.pointsRequired} required />
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input name="stock" type="number" min={0} defaultValue={editData.stock} required />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditData(null)}>Batal</Button>
                <Button type="submit" disabled={loading}>Update</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
