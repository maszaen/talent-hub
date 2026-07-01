"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Award, Upload } from "lucide-react";
import { toast } from "sonner";
import { addCertificate } from "@/server-actions/certificate.actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type Certificate = {
  id: string;
  title: string;
  level: "LOKAL" | "REGIONAL" | "NASIONAL" | "INTERNASIONAL";
  status: string;
  points: number;
  fileUrl: string;
  rejectionNote: string | null;
};

export function StudentCertificatesClient({ certificates }: { certificates: Certificate[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maksimal ukuran file 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const uploadToast = toast.loading("Mengunggah dokumen...");
    try {
      const res = await fetch("/api/upload?type=document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setFileUrl(data.url);
        toast.success("Dokumen berhasil diunggah", { id: uploadToast });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah dokumen", { id: uploadToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileUrl) {
      toast.error("Harap unggah bukti dokumen/sertifikat");
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const res = await addCertificate({
      title: fd.get("title") as string,
      issuer: fd.get("issuer") as string,
      level: fd.get("level") as "LOKAL" | "REGIONAL" | "NASIONAL" | "INTERNASIONAL",
      fileUrl,
    });
    
    setLoading(false);
    
    if (res.success) {
      toast.success("Sertifikat berhasil diajukan!");
      setOpenCreate(false);
      setFileUrl("");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal mengajukan sertifikat");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" /> Ajukan Sertifikat
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajukan Sertifikat / Prestasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Penghargaan / Sertifikat</Label>
                <Input name="title" required placeholder="Contoh: Juara 1 Web Design" />
              </div>
              <div className="space-y-2">
                <Label>Penyelenggara (Opsional)</Label>
                <Input name="issuer" placeholder="Contoh: Kemdikbud" />
              </div>
              <div className="space-y-2">
                <Label>Tingkat / Level</Label>
                <Select name="level" required defaultValue="LOKAL">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOKAL">Lokal / Universitas</SelectItem>
                    <SelectItem value="REGIONAL">Regional / Provinsi</SelectItem>
                    <SelectItem value="NASIONAL">Nasional</SelectItem>
                    <SelectItem value="INTERNASIONAL">Internasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bukti Dokumen (PDF/JPG/PNG)</Label>
                <Input type="file" accept=".pdf,image/*" onChange={handleFileUpload} required={!fileUrl} />
                {fileUrl && <p className="text-sm text-emerald-500 flex items-center mt-1"><Upload className="w-3 h-3 mr-1" /> File siap dikirim</p>}
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpenCreate(false)}>Batal</Button>
                <Button type="submit" disabled={loading || !fileUrl}>Ajukan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sertifikat</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Belum ada sertifikat yang diajukan.</TableCell>
            </TableRow>
          ) : (
            certificates.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      {c.title}
                    </span>
                    <a href={c.fileUrl} target="_blank" className="text-xs text-primary mt-1 hover:underline">Lihat Bukti</a>
                  </div>
                </TableCell>
                <TableCell>{c.level}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "APPROVED" ? "default" : c.status === "REJECTED" ? "destructive" : "secondary"}>
                    {c.status}
                  </Badge>
                  {c.status === "APPROVED" && <span className="ml-2 text-xs font-bold text-emerald-600">+{c.points}</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {c.rejectionNote || "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
