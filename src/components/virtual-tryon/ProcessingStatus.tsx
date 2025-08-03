import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface ProcessingStatusProps {
  progress: number;
  predictionId: string | null;
}

export const ProcessingStatus = ({ progress, predictionId }: ProcessingStatusProps) => {
  const getStatusMessage = (progress: number) => {
    if (progress < 20) return "Submitting your try-on request...";
    if (progress < 40) return "Analyzing your photo...";
    if (progress < 60) return "Preparing the outfit...";
    if (progress < 80) return "Generating your virtual try-on...";
    return "Finalizing the result...";
  };

  const estimatedTimeRemaining = Math.max(0, Math.ceil((100 - progress) / 100 * 120)); // seconds

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary" />
              <Loader2 className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-spin" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Creating Your Virtual Try-On</h3>
          <p className="text-muted-foreground mb-6">
            {getStatusMessage(progress)}
          </p>
          
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              {estimatedTimeRemaining > 0 && (
                <span>~{estimatedTimeRemaining}s remaining</span>
              )}
            </div>
          </div>
          
          {predictionId && (
            <div className="mt-4 p-2 bg-muted rounded text-xs text-muted-foreground">
              ID: {predictionId.slice(0, 8)}...
            </div>
          )}
          
          <div className="mt-6 text-xs text-muted-foreground">
            Powered by AI • High-quality results take time
          </div>
        </div>
      </Card>
    </div>
  );
};