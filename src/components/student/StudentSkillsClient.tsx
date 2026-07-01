"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { addSkill } from "@/server-actions/skill.actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type SkillOption = { id: string; name: string; category: string | null };
type StudentSkill = { 
  id: string; 
  status: string; 
  points: number; 
  skill: { name: string; category: string | null } 
};

export function StudentSkillsClient({ skills, availableSkills }: { skills: StudentSkill[], availableSkills: SkillOption[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const skillId = fd.get("skillId") as string;
    
    if (!skillId) {
      toast.error("Pilih skill terlebih dahulu");
      setLoading(false);
      return;
    }

    const res = await addSkill(skillId);
    setLoading(false);
    
    if (res.success) {
      toast.success("Skill berhasil diajukan!");
      setOpenCreate(false);
      setSelectedSkillId(""); // Reset the selection
      router.refresh();
    } else {
      toast.error(res.error || "Gagal mengajukan skill");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" /> Ajukan Skill
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajukan Keahlian Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Keahlian</Label>
                <Select name="skillId" required value={selectedSkillId} onValueChange={(val) => setSelectedSkillId(val ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih skill yang kamu miliki" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} {s.category ? `(${s.category})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Hanya bisa memilih skill dari master data kampus. Jika skill belum ada, hubungi Admin.</p>
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
            <TableHead>Keahlian</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Poin</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Belum ada skill yang diajukan.</TableCell>
            </TableRow>
          ) : (
            skills.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    {s.skill.name}
                  </div>
                </TableCell>
                <TableCell>{s.skill.category || "-"}</TableCell>
                <TableCell>{s.status === "APPROVED" ? `+${s.points}` : "0"}</TableCell>
                <TableCell>
                  <Badge variant={s.status === "APPROVED" ? "default" : s.status === "REJECTED" ? "destructive" : "secondary"}>
                    {s.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
