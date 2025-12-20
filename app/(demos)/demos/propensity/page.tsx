import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Propensity Model | Analysis Demos",
  description: "Score deals with win probability and expected value",
};

const config = {
  type: "propensity_model" as const,
  title: "Propensity Model",
  description: "Score each deal with win probability, expected ACV, and predicted time-to-close. Upload any CSV — you'll configure columns after upload.",
};

export default function PropensityPage() {
  return <AnalysisPage config={config} />;
}
