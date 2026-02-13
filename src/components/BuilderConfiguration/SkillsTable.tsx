import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, DivideSquareIcon,Wrench  } from "lucide-react";
import {
  BuilderSkill,
  BuilderType,
  BUILDER_TYPES,
  BUILDER_TYPE_LABELS,
} from "@/types/builder";
import { BuilderTypeBadge } from "./BuilderTypeBadge";
import { SkillDialog } from "./SkillDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ApproveConfirmDialog } from "./ApproveConfirmDialog";
import { useGlobalContext } from "@/context/GlobalProvider";

interface Props {
  skills: BuilderSkill[];
  onAdd: (name: string, type: BuilderType, createdBy: string) => void;
  onUpdate: (
    id: number,
    name: string,
    type: BuilderType,
    approvedBy?: string,
  ) => void;
  onDelete: (id: number) => void;
}

export function SkillsTable({ skills, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<BuilderSkill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuilderSkill | null>(null);
  const [approveTarget, setApproveTarget] = useState<BuilderSkill | null>(null);
  const { user } = useGlobalContext();

  const filtered = useMemo(
    () =>
      skills.filter((s) => {
        const matchesSearch = s.skillName
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesType =
          activeTab === "ALL" || s.builderType === activeTab;
        return matchesSearch && matchesType;
      }),
    [skills, search, activeTab],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: skills.length };
    BUILDER_TYPES.forEach(
      (t) => (map[t] = skills.filter((s) => s.builderType === t).length),
    );
    return map;
  }, [skills]);

  const tabs = useMemo(
    () => [
      { key: "ALL", label: "All", count: counts.ALL },
      ...BUILDER_TYPES.map((t) => ({
        key: t,
        label: BUILDER_TYPE_LABELS[t],
        count: counts[t],
      })),
    ],
    [counts],
  );

  const handleSave = (
    name: string,
    type: BuilderType,
    createdBy: string,
    approvedBy?: string,
  ) => {
    if (editingSkill) {
      onUpdate(editingSkill.id, name, type, approvedBy);
    } else {
      onAdd(name, type, createdBy);
    }
    setEditingSkill(null);
    setDialogOpen(false);
  };

  const openEdit = (skill: BuilderSkill) => {
    setEditingSkill(skill);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditingSkill(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Wrench className="h-9 w-9 text-gray-800" />
          Builder Skills
        </h1>
        <Button
          onClick={openAdd}
          className="bg-blue-800 hover:bg-gray-700 text-white shadow-md"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Skill
        </Button>
      </div>

      {/* Custom grid-based tabs */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 rounded-lg p-2 sm:p-4 shadow-sm border bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex justify-center items-center w-full px-2 py-2 sm:py-1 rounded-md font-medium transition-all duration-200 space-x-2 text-sm sm:text-base ${
                activeTab === tab.key
                  ? "bg-blue-800 text-white shadow-md"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-semibold">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
        <Input
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 border-blue-200 focus:border-blue-600 shadow-sm"
        />
      </div>

      <div className="rounded-md border shadow-sm  bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-800">ID</TableHead>
              <TableHead className="font-semibold text-gray-800">Skill Name</TableHead>
              <TableHead className="font-semibold text-gray-800">Builder Type</TableHead>
              <TableHead className="font-semibold text-gray-800">Created By</TableHead>
              <TableHead className="font-semibold text-gray-800">Approved By</TableHead>
              <TableHead className="font-semibold text-gray-800 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No skills found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell>{s.id}</TableCell>
                  <TableCell className="font-medium">{s.skillName}</TableCell>
                  <TableCell>
                    <BuilderTypeBadge type={s.builderType} />
                  </TableCell>
                  <TableCell>{s.createdBy}</TableCell>
                  <TableCell className={!s.approvedBy ? "text-yellow-600 font-bold " : "text-gray-600 font-bold "}>
                    {s.approvedBy ?? "Pending"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:border-blue-600 hover:bg-blue-50"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setDeleteTarget(s)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
                        onClick={() => setApproveTarget(s)}
                        disabled={
                          s.createdBy === `${user?.firstName} ${user?.lastName}` ||
                          !!s.approvedBy
                        }
                        title={
                          s.createdBy === `${user?.firstName} ${user?.lastName}`
                            ? "You cannot approve your own skill"
                            : s.approvedBy
                              ? "Already approved"
                              : "Approve skill"
                        }
                      >
                        <DivideSquareIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SkillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        skill={editingSkill}
        onSave={handleSave}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        skillName={deleteTarget?.skillName ?? ""}
        onConfirm={() => deleteTarget && onDelete(deleteTarget.id)}
      />
      <ApproveConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        skillName={approveTarget?.skillName ?? ""}
        onConfirm={() => {
          if (approveTarget && user) {
            onUpdate(
              approveTarget.id,
              approveTarget.skillName,
              approveTarget.builderType,
              `${user.firstName} ${user.lastName}`
            );
            setApproveTarget(null);
          }
        }}
      />
    </div>
  );
}