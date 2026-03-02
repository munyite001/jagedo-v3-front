import { useState } from "react";
import { Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Send } from "lucide-react";

import { BulkSmsProvider, useBulkSms } from "../admin/components/context/BulkSmsContext";
import { useAdminPermission } from "@/components/ProtectedAdminRoute";
import { Navigate } from "react-router-dom";
import { ComposeTab } from "../admin/components/context/ComposeTab";
import { HistoryTab } from "../admin/components/context/HistoryTab";
import { ReadOnlyWarning } from "../admin/components/context/ReadOnlyWarning";
import { LoadingState } from "../admin/components/context/LoadingState";

const BulkSMSContent = () => {
  const [activeTab, setActiveTab] = useState("compose");
  const { hasAccess, isLoading } = useAdminPermission('bulk-sms', 'VIEW');
  const { customers, builders, loading } = useBulkSms();

  if (isLoading || loading) {
    return <LoadingState />;
  }

  if (!hasAccess) {
    return <Navigate to="/403" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk SMS</h1>
        <p className="text-muted-foreground mt-1">
          Send messages to {builders?.length || 0} builders and{" "}
          {customers?.length || 0} customers
        </p>
      </div>

      <ReadOnlyWarning />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <ComposeTab />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function BulkSMSWrapper() {
  return (
    <BulkSmsProvider>
      <BulkSMSContent />
      <Toaster />
    </BulkSmsProvider>
  );
}