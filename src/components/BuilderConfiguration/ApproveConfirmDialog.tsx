import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export function ApproveConfirmDialog({ open, onOpenChange, skillName, onConfirm, disabled }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Skill</DialogTitle>
        </DialogHeader>
        <p className="py-2">
          Are you sure you want to approve the skill <strong>{skillName}</strong>?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={disabled}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
