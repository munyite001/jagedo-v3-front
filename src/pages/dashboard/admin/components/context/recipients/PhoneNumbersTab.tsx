import { useState } from "react";
import { Phone, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBulkSms } from "../../context/BulkSmsContext";
import { toast } from "sonner";

export const PhoneNumbersTab = () => {
  const { manualPhoneNumbers, setManualPhoneNumbers } = useBulkSms();
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [isParsingFile, setIsParsingFile] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-+()]/g, "");
    return /^\d{9,}$/.test(cleanPhone);
  };

  const addPhoneNumber = () => {
    if (!phoneNumberInput.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!validatePhoneNumber(phoneNumberInput)) {
      toast.error("Invalid phone number format");
      return;
    }

    if (manualPhoneNumbers.includes(phoneNumberInput)) {
      toast.warning("This phone number is already added");
      return;
    }

    setManualPhoneNumbers(prev => [...prev, phoneNumberInput]);
    setPhoneNumberInput("");
    toast.success("Phone number added");
  };

  const removePhoneNumber = (phone: string) => {
    setManualPhoneNumbers(prev => prev.filter(p => p !== phone));
  };

  const parseCSV = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split("\n").filter(line => line.trim());
          const phoneNumbers: string[] = [];

          lines.forEach(line => {
            const cells = line.split(",").map(cell => cell.trim());
            cells.forEach(cell => {
              if (cell && validatePhoneNumber(cell)) {
                phoneNumbers.push(cell);
              }
            });
          });

          if (phoneNumbers.length === 0) {
            reject(new Error("No valid phone numbers found"));
          } else {
            resolve([...new Set(phoneNumbers)]);
          }
        } catch (err: any) {
          reject(new Error("Failed to parse CSV: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const parseXLSX = async (file: File): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const XLSX = await import("xlsx");
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const data = event.target?.result as ArrayBuffer;
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            const phoneNumbers: string[] = [];

            rows.forEach(row => {
              if (Array.isArray(row)) {
                row.forEach(cell => {
                  const cellValue = String(cell).trim();
                  if (cellValue && validatePhoneNumber(cellValue)) {
                    phoneNumbers.push(cellValue);
                  }
                });
              }
            });

            if (phoneNumbers.length === 0) {
              reject(new Error("No valid phone numbers found"));
            } else {
              resolve([...new Set(phoneNumbers)]);
            }
          } catch (err: any) {
            reject(new Error("Failed to parse Excel: " + err.message));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
      } catch (err: any) {
        reject(new Error("XLSX library not available: " + err.message));
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    try {
      const fileName = file.name.toLowerCase();
      let phoneNumbers: string[] = [];

      if (fileName.endsWith(".csv")) {
        phoneNumbers = await parseCSV(file);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        phoneNumbers = await parseXLSX(file);
      } else {
        throw new Error("Unsupported file format. Please use CSV, XLS, or XLSX.");
      }

      setManualPhoneNumbers(prev => [...new Set([...prev, ...phoneNumbers])]);
      toast.success(`Imported ${phoneNumbers.length} phone number(s)`);
      event.target.value = "";
    } catch (err: any) {
      toast.error(err.message || "Failed to import phone numbers");
    } finally {
      setIsParsingFile(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <Label htmlFor="file-upload" className="font-semibold">Import from File</Label>
          </div>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileUpload}
            disabled={isParsingFile}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            📄 Supported formats: CSV, XLS, XLSX. Phone numbers can be in any column.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-input" className="font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Add Manually
          </Label>
          <div className="flex gap-2">
            <Input
              id="phone-input"
              placeholder="Enter phone number (e.g., 254712345678)"
              value={phoneNumberInput}
              onChange={(e) => setPhoneNumberInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPhoneNumber()}
              disabled={isParsingFile}
            />
            <Button onClick={addPhoneNumber} disabled={!phoneNumberInput.trim() || isParsingFile} size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Added Phone Numbers</Label>
            {manualPhoneNumbers.length > 0 && (
              <Badge variant="secondary">{manualPhoneNumbers.length}</Badge>
            )}
          </div>
          
          {manualPhoneNumbers.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg bg-muted/20">
              <Phone className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">No phone numbers added yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-3 bg-white">
              {manualPhoneNumbers.map((phone, index) => (
                <div key={`${phone}-${index}`} className="flex items-center justify-between p-3 rounded-md bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 border border-blue-100 group">
                  <span className="text-sm font-medium truncate text-blue-900">{phone}</span>
                  <Button variant="ghost" size="sm" onClick={() => removePhoneNumber(phone)} className="opacity-0 group-hover:opacity-100">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {manualPhoneNumbers.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setManualPhoneNumbers([])} className="flex-1">
              Clear All ({manualPhoneNumbers.length})
            </Button>
            <div className="text-xs text-muted-foreground flex items-center px-3 py-2 bg-green-50 rounded-md border border-green-200">
              ✓ {manualPhoneNumbers.length} number{manualPhoneNumbers.length !== 1 ? 's' : ''} ready
            </div>
          </div>
        )}
      </div>
    </div>
  );
};