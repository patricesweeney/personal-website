import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Packaging | Product",
  description: "Optimize feature bundling and plan structure",
};

const config = {
  type: "poisson_factorization" as const,
  title: "Packaging",
  description: "Analyze feature usage patterns to optimize how features are bundled into plans. Identify natural feature clusters and understand which combinations drive upgrades.",
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "current_plan",
      type: "required" as const,
      description: "Current subscription tier",
      example: "free, pro, enterprise",
    },
    {
      name: "feature_a_usage",
      type: "optional" as const,
      description: "Usage count for feature A",
      example: "42",
    },
    {
      name: "feature_b_usage",
      type: "optional" as const,
      description: "Usage count for feature B",
      example: "18",
    },
    {
      name: "feature_c_usage",
      type: "optional" as const,
      description: "Usage count for feature C",
      example: "7",
    },
    {
      name: "upgraded",
      type: "optional" as const,
      description: "Whether customer upgraded in period",
      example: "1 or 0",
    },
    {
      name: "mrr",
      type: "optional" as const,
      description: "Monthly recurring revenue",
      example: "99",
    },
  ],
};

export default function PackagingPage() {
  return <AnalysisPage config={config} />;
}

