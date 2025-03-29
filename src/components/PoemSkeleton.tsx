
import { Skeleton } from "@/components/ui/skeleton";

const PoemSkeleton = () => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-primary/20" />
          <Skeleton className="h-4 w-32 bg-primary/10" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full bg-primary/20" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full bg-primary/10" />
        <Skeleton className="h-4 w-full bg-primary/10" />
        <Skeleton className="h-4 w-3/4 bg-primary/10" />
        <Skeleton className="h-4 w-5/6 bg-primary/10" />
      </div>
    </div>
  );
};

export default PoemSkeleton;
