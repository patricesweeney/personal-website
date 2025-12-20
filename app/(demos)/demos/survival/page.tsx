import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Survival Analysis | Analysis Demos",
  description: "Model time-to-churn with Cox proportional hazards",
};

const config = {
  type: "survival_analysis" as const,
  title: "Survival Analysis",
  description: "Fit a Cox proportional hazards model to understand time-to-churn and identify which factors accelerate or delay customer departure. Upload any CSV — you'll configure columns after upload.",
};

export default function SurvivalPage() {
  return <AnalysisPage config={config} />;
}
