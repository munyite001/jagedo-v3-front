import { Users, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmsHistoryEntry } from "@/api/bulk-sms.api";

interface SmsDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: SmsHistoryEntry | null;
  isLoading: boolean;
}

export const SmsDetailsSheet = ({ isOpen, onOpenChange, item, isLoading }: SmsDetailsSheetProps) => {
  if (isLoading || !item) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent>
          <div className="flex items-center justify-center h-full">Loading...</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>SMS Details</SheetTitle>
          <SheetDescription>Full details of the sent bulk SMS message</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Message Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Full Message</h3>
            <div className="bg-muted p-4 rounded-lg border">
              <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
            </div>
          </div>

          {/* Message Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Character Count</p>
              <p className="text-lg font-semibold">{item.metadata?.characterCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">SMS Parts</p>
              <p className="text-lg font-semibold">{item.metadata?.smsCount}</p>
            </div>
          </div>

          {/* Recipients Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Recipients</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total" value={item.recipients} />
              <StatCard label="Builders" value={item.builderCount} />
              <StatCard label="Customers" value={item.customerCount} />
            </div>
          </div>

          {/* Status and Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge className={`capitalize ${
                item.status === "sent" ? "bg-green-600" :
                item.status === "failed" ? "bg-red-600" :
                item.status === "partial" ? "bg-yellow-600" : "bg-blue-600"
              }`}>
                {item.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Sent Date</p>
              <p className="text-sm font-medium">{item.date}</p>
            </div>
          </div>

          {/* Failed Count */}
          {item.metadata?.failedCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-600">
                {item.metadata.failedCount} recipient{item.metadata.failedCount !== 1 ? 's' : ''} failed to receive SMS
              </p>
            </div>
          )}

          {/* Recipients List */}
          {item.recipientsList && item.recipientsList.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Recipients List</h3>
                <Badge variant="outline">{item.recipientsList.length} total</Badge>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                {item.recipientsList.map((recipient, index) => (
                  <div key={index} className="flex items-start justify-between p-3 rounded-md bg-white border hover:shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{recipient.name}</p>
                        <Badge variant="outline" className="text-xs">{recipient.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span className="font-mono">{recipient.phoneNumber}</span>
                      </div>
                    </div>
                    <RecipientStatusBadge status={recipient.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card className="p-3">
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </Card>
);

const RecipientStatusBadge = ({ status }: { status: string }) => {
  const config = {
    sent: { className: "bg-green-100 text-green-800", icon: "✓" },
    failed: { className: "bg-red-100 text-red-800", icon: "✗" },
    pending: { className: "bg-yellow-100 text-yellow-800", icon: "⏱" },
  };

  const style = config[status as keyof typeof config] || config.pending;
  
  return (
    <Badge className={`${style.className} text-xs capitalize`}>
      {style.icon} {status}
    </Badge>
  );
};