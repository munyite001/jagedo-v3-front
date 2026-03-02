import { Search, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBulkSms, getCustomerName } from "../../context/BulkSmsContext";

export const CustomersTab = () => {
  const {
    filteredCustomers,
    customers,
    customerSearch,
    setCustomerSearch,
    customerTypeFilter,
    setCustomerTypeFilter,
    customerCountyFilter,
    setCustomerCountyFilter,
    customerCounties,
    selectedCustomers,
    setSelectedCustomers,
  } = useBulkSms();

  const toggleCustomer = (id: number) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCustomers(filteredCustomers.map(c => c.id).filter(Boolean));
  };

  const deselectAll = () => {
    setSelectedCustomers([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Search Customers</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="ORGANIZATION">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>County</Label>
            <Select value={customerCountyFilter} onValueChange={setCustomerCountyFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {customerCounties.map(county => (
                  <SelectItem key={county} value={county}>{county}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll} className="flex-1" disabled={filteredCustomers.length === 0}>
          Select All ({filteredCustomers.length})
        </Button>
        <Button variant="outline" size="sm" onClick={deselectAll} className="flex-1">
          Clear
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {customers?.length === 0 ? "No customers available" : "No customers match your filters"}
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
              <Checkbox
                id={`customer-${customer.id}`}
                checked={selectedCustomers.includes(customer.id)}
                onCheckedChange={() => toggleCustomer(customer.id)}
              />
              <div className="flex-1 min-w-0">
                <label htmlFor={`customer-${customer.id}`} className="text-sm font-medium cursor-pointer block truncate">
                  {getCustomerName(customer)}
                </label>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Phone className="h-3 w-3" />
                  {customer.phoneNumber || "No phone"}
                </div>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">{customer.accountType || "Unknown"}</Badge>
                  {customer.county && <Badge variant="secondary" className="text-xs">{customer.county}</Badge>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};