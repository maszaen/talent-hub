"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveSubmission, rejectSubmission } from "@/server-actions/verification.actions";

type Submission = {
  id: string;
  type: string;
  title: string;
  createdAt: Date;
  user: { name: string; major: string | null };
  suggestedPoints: number;
};

export function VerificationClient({ submissions }: { submissions: Submission[] }) {
  const [approveDialog, setApproveDialog] = useState<Submission | null>(null);
  const [rejectDialog, setRejectDialog] = useState<Submission | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpenApprove = (sub: Submission) => {
    setApproveDialog(sub);
    setPoints(sub.suggestedPoints);
  };

  const handleApprove = async () => {
    if (!approveDialog) return;
    setLoading(true);
    const res = await approveSubmission(approveDialog.id, points);
    setLoading(false);
    if (res.success) {
      toast.success("Submission disetujui!");
      setApproveDialog(null);
    } else {
      toast.error(res.error || "Gagal menyetujui");
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setLoading(true);
    const res = await rejectSubmission(rejectDialog.id, note);
    setLoading(false);
    if (res.success) {
      toast.success("Submission ditolak!");
      setRejectDialog(null);
      setNote("");
    } else {
      toast.error(res.error || "Gagal menolak");
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mahasiswa</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Judul/Nama</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                Tidak ada antrean verifikasi.
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-medium">{sub.user.name}</div>
                  <div className="text-xs text-muted-foreground">{sub.user.major}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{sub.type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{sub.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950" onClick={() => handleOpenApprove(sub)}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Terima
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => setRejectDialog(sub)}>
                    <XCircle className="w-4 h-4 mr-1" /> Tolak
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!approveDialog} onOpenChange={(open) => !open && setApproveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Poin yang Diberikan</Label>
              <Input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Poin yang disarankan: {approveDialog?.suggestedPoints}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)}>Batal</Button>
            <Button onClick={handleApprove} disabled={loading}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectDialog} onOpenChange={(open) => !open && setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Alasan Penolakan (Opsional)</Label>
              <Textarea placeholder="Tulis alasan penolakan..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading}>Tolak Pengajuan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
