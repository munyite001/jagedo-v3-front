import { useState } from "react";
import { Building, Filter, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBulkSms } from "../context/BulkSmsContext";
import { BuildersTab } from "./recipients/BuildersTab";
import { CustomersTab } from "./recipients/CustomersTab";
import { PhoneNumbersTab } from "./recipients/PhoneNumbersTab";

export const RecipientsPanel = () => {
  const [activeRecipientTab, setActiveRecipientTab] = useState("builders");
  const { builders, customers, manualPhoneNumbers, clearAllFilters } = useBulkSms();

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>Select who will receive the message</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <Filter className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeRecipientTab} onValueChange={setActiveRecipientTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builders" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Builders ({builders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customers ({customers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Numbers ({manualPhoneNumbers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builders">
            <BuildersTab />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="phone">
            <PhoneNumbersTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};