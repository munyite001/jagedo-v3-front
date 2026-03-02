import { useState } from "react";
import { Send, Users, Building, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBulkSms } from "../context/BulkSmsContext";
import { useRolePermissions } from "@/context/RolePermissionProvider";
import { canPerformOperation } from "@/utils/adminPermissions";

export const MessageComposer = () => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { totalSelectedRecipients, selectedBuilders, selectedCustomers, sendSms } = useBulkSms();
  const { userMenuPermissions } = useRolePermissions();
  const canCreate = canPerformOperation(userMenuPermissions, 'bulk-sms', 'CREATE');

  const handleSend = async () => {
    setIsSending(true);
    try {
      await sendSms(message);
      if (canCreate) {
        setMessage("");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="lg:col-span-1 shadow-elegant">
      <CardHeader>
        <CardTitle>Compose Message</CardTitle>
        <CardDescription>Write your message to send to selected recipients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message">Message Content</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="resize-none"
            disabled={isSending}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{message.length} characters</span>
            <span>{Math.ceil(message.length / 160)} SMS</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {totalSelectedRecipients} recipient{totalSelectedRecipients !== 1 ? "s" : ""} selected
            </span>
            {selectedBuilders.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {selectedBuilders.length}
              </Badge>
            )}
            {selectedCustomers.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {selectedCustomers.length}
              </Badge>
            )}
          </div>
          <Button
            className="bg-blue-800 hover:bg-blue-900 text-primary-foreground"
            disabled={totalSelectedRecipients === 0 || !message.trim() || isSending || !canCreate}
            onClick={handleSend}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};