import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCardList } from "@/components/ui/loading-skeleton";

export default function EnterpriseListLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <section>
        <SkeletonCardList count={5} />
      </section>
    </div>
  );
}
