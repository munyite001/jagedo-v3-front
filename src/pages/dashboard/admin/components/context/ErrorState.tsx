// components/ErrorState.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Bulk SMS</h1>
      <p className="text-muted-foreground mt-1">Error loading recipients</p>
    </div>
    <Card className="shadow-elegant">
      <CardContent className="flex justify-center items-center h-40 text-red-500">
        <div className="text-center">
          <p className="font-medium">Failed to load data</p>
          <p className="text-sm mt-1">{error}</p>
          <Button className="mt-4" onClick={onRetry} variant="outline">
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);