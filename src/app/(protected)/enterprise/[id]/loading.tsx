import { SkeletonEnterprisePage } from "@/components/ui/loading-skeleton";

export default function EnterpriseDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <SkeletonEnterprisePage />
    </div>
  );
}
