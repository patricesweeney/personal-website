import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Survival Analysis | Analysis Demos",
  description: "Model time-to-churn with Cox proportional hazards",
};

const config = {
  type: "survival_analysis" as const,
  title: "Survival Analysis",
  description: "Fit a Cox proportional hazards model to understand time-to-churn and identify which factors accelerate or delay customer departure. Get hazard ratios for each feature.",
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "tenure_months",
      type: "required" as const,
      description: "Time since customer acquisition (in months)",
      example: "14",
    },
    {
      name: "churned",
      type: "required" as const,
      description: "Binary indicator: 1 if churned, 0 if still active",
      example: "0 or 1",
    },
    {
      name: "plan_type",
      type: "optional" as const,
      description: "Subscription plan or tier",
      example: "pro, enterprise",
    },
    {
      name: "usage_score",
      type: "optional" as const,
      description: "Product usage intensity metric",
      example: "0.75",
    },
    {
      name: "support_interactions",
      type: "optional" as const,
      description: "Number of support tickets or calls",
      example: "5",
    },
    {
      name: "nps_score",
      type: "optional" as const,
      description: "Net Promoter Score if available",
      example: "8",
    },
  ],
};

export default function SurvivalPage() {
  return <AnalysisPage config={config} />;
}

