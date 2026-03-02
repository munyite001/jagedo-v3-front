import { Search, Building, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBulkSms, getBuilderName } from "../../context/BulkSmsContext";

export const BuildersTab = () => {
  const {
    filteredBuilders,
    builders,
    builderSearch,
    setBuilderSearch,
    builderTypeFilter,
    setBuilderTypeFilter,
    builderCountyFilter,
    setBuilderCountyFilter,
    builderTypes,
    builderCounties,
    selectedBuilders,
    setSelectedBuilders,
  } = useBulkSms();

  const toggleBuilder = (id: number) => {
    setSelectedBuilders(prev =>
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedBuilders(filteredBuilders.map(b => b.id).filter(Boolean));
  };

  const deselectAll = () => {
    setSelectedBuilders([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Search Builders</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, or email..."
              value={builderSearch}
              onChange={(e) => setBuilderSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Builder Type</Label>
            <Select value={builderTypeFilter} onValueChange={setBuilderTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {builderTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>County</Label>
            <Select value={builderCountyFilter} onValueChange={setBuilderCountyFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {builderCounties.map(county => (
                  <SelectItem key={county} value={county}>{county}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll} className="flex-1" disabled={filteredBuilders.length === 0}>
          Select All ({filteredBuilders.length})
        </Button>
        <Button variant="outline" size="sm" onClick={deselectAll} className="flex-1">
          Clear
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
        {filteredBuilders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {builders?.length === 0 ? "No builders available" : "No builders match your filters"}
          </div>
        ) : (
          filteredBuilders.map(builder => (
            <div key={builder.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
              <Checkbox
                id={`builder-${builder.id}`}
                checked={selectedBuilders.includes(builder.id)}
                onCheckedChange={() => toggleBuilder(builder.id)}
              />
              <div className="flex-1 min-w-0">
                <label htmlFor={`builder-${builder.id}`} className="text-sm font-medium cursor-pointer block truncate">
                  {getBuilderName(builder)}
                </label>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Phone className="h-3 w-3" />
                  {builder.phoneNumber || "No phone"}
                </div>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">{builder.userType || "Unknown"}</Badge>
                  {builder.skills && <Badge variant="secondary" className="text-xs">{builder.skills}</Badge>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};