import { useState, useMemo } from "react";
import { History, Eye, Users, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useBulkSms } from "../context/BulkSmsContext";
import { SmsHistoryEntry } from "@/api/bulk-sms.api";
import { getSmsHistoryById } from "@/api/bulk-sms.api";
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { toast } from "sonner";
import { SmsDetailsSheet } from "./SmsDetailsSheet";

export const HistoryTab = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const axiosInstance = useAxiosWithAuth(serverUrl);
  const { smsHistory } = useBulkSms();
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SmsHistoryEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const itemsPerPage = 10;

  const sortedSmsHistory = useMemo(() => {
    return [...smsHistory].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [smsHistory]);

  const totalPages = Math.ceil(sortedSmsHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * itemsPerPage;
    return sortedSmsHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedSmsHistory, historyPage]);

  const viewHistoryDetails = async (item: SmsHistoryEntry) => {
    setIsLoadingDetails(true);
    try {
      const details = await getSmsHistoryById(axiosInstance, item.id);
      setSelectedHistoryItem(details);
      setIsDetailsOpen(true);
    } catch (err) {
      toast.error("Failed to load SMS details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (smsHistory.length === 0) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="text-center py-12 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No SMS history yet</p>
          <p className="text-sm">Start sending bulk SMS messages to see them appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>SMS History</CardTitle>
          <CardDescription>View all your sent bulk SMS messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead className="text-right w-12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.map(item => (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewHistoryDetails(item)}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-sm truncate">{item.messagePreview}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.metadata?.characterCount} chars ({item.metadata?.smsCount} SMS)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{item.recipients}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.builderCount > 0 && <span>{item.builderCount} builders</span>}
                          {item.builderCount > 0 && item.customerCount > 0 && <span> • </span>}
                          {item.customerCount > 0 && <span>{item.customerCount} customers</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`capitalize ${
                          item.status === "sent" ? "bg-green-100 text-green-800" :
                          item.status === "failed" ? "bg-red-100 text-red-800" :
                          item.status === "partial" ? "bg-yellow-100 text-yellow-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.date}</TableCell>
                      <TableCell className="text-right">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <PaginationControls
                currentPage={historyPage}
                totalPages={totalPages}
                totalItems={sortedSmsHistory.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setHistoryPage}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <SmsDetailsSheet
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        item={selectedHistoryItem}
        isLoading={isLoadingDetails}
      />
    </>
  );
};

const PaginationControls = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: any) => (
  <div className="flex items-center justify-between px-2 py-4 border-t">
    <div className="text-sm text-muted-foreground">
      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} messages
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onPageChange(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
        ← Previous
      </Button>
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(page)} className="w-10">
            {page}
          </Button>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => onPageChange(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
        Next →
      </Button>
    </div>
  </div>
);