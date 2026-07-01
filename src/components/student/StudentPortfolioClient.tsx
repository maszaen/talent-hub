"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Briefcase, Upload, Link2 } from "lucide-react";
import { toast } from "sonner";
import { addPortfolio } from "@/server-actions/portfolio.actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type Portfolio = {
  id: string;
  title: string;
  type: "PERSONAL" | "FREELANCE" | "INDUSTRI";
  status: string;
  points: number;
  linkUrl: string | null;
  fileUrl: string | null;
  rejectionNote: string | null;
};

export function StudentPortfolioClient({ portfolios }: { portfolios: Portfolio[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [inputType, setInputType] = useState<"link" | "file">("link");

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
    const fd = new FormData(e.currentTarget);
    const linkUrl = fd.get("linkUrl") as string;

    if (inputType === "link" && !linkUrl) {
      toast.error("Harap isi URL portofolio");
      return;
    }
    if (inputType === "file" && !fileUrl) {
      toast.error("Harap unggah file portofolio");
      return;
    }

    setLoading(true);
    
    const res = await addPortfolio({
      title: fd.get("title") as string,
      type: fd.get("type") as "PERSONAL" | "FREELANCE" | "INDUSTRI",
      description: fd.get("description") as string,
      linkUrl: inputType === "link" ? linkUrl : undefined,
      fileUrl: inputType === "file" ? fileUrl : undefined,
    });
    
    setLoading(false);
    
    if (res.success) {
      toast.success("Portofolio berhasil diajukan!");
      setOpenCreate(false);
      setFileUrl("");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal mengajukan portofolio");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" /> Ajukan Portfolio
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Karya Portofolio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul Karya / Proyek</Label>
                <Input name="title" required placeholder="Contoh: Aplikasi Manajemen Kampus" />
              </div>
              <div className="space-y-2">
                <Label>Kategori Karya</Label>
                <Select name="type" required defaultValue="PERSONAL">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal Project</SelectItem>
                    <SelectItem value="FREELANCE">Proyek Lepas (Freelance)</SelectItem>
                    <SelectItem value="INDUSTRI">Proyek Industri / Magang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Singkat</Label>
                <Textarea name="description" placeholder="Ceritakan peranmu dan teknologi yang digunakan..." required />
              </div>

              <div className="space-y-2 border p-4 rounded-lg bg-muted/50">
                <Label>Bukti Portofolio</Label>
                <div className="flex gap-2 mb-2">
                  <Button type="button" size="sm" variant={inputType === "link" ? "default" : "outline"} onClick={() => setInputType("link")}>
                    Link / URL
                  </Button>
                  <Button type="button" size="sm" variant={inputType === "file" ? "default" : "outline"} onClick={() => setInputType("file")}>
                    Upload File
                  </Button>
                </div>
                {inputType === "link" ? (
                  <Input name="linkUrl" placeholder="https://github.com/..." />
                ) : (
                  <div>
                    <Input type="file" accept=".pdf,image/*" onChange={handleFileUpload} />
                    {fileUrl && <p className="text-sm text-emerald-500 flex items-center mt-1"><Upload className="w-3 h-3 mr-1" /> File siap dikirim</p>}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpenCreate(false)}>Batal</Button>
                <Button type="submit" disabled={loading}>Ajukan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Karya</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bukti</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Belum ada portofolio yang diajukan.</TableCell>
            </TableRow>
          ) : (
            portfolios.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    {p.title}
                  </div>
                </TableCell>
                <TableCell>{p.type}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "APPROVED" ? "default" : p.status === "REJECTED" ? "destructive" : "secondary"}>
                    {p.status}
                  </Badge>
                  {p.status === "APPROVED" && <span className="ml-2 text-xs font-bold text-emerald-600">+{p.points}</span>}
                  {p.status === "REJECTED" && <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">{p.rejectionNote}</p>}
                </TableCell>
                <TableCell>
                  {p.linkUrl && (
                    <a href={p.linkUrl} target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline mb-1">
                      <Link2 className="w-3 h-3" /> Buka URL
                    </a>
                  )}
                  {p.fileUrl && (
                    <a href={p.fileUrl} target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <Upload className="w-3 h-3" /> Lihat File
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
