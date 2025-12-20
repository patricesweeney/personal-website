import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "NRR Decomposition | Analysis Demos",
  description: "Break down Net Revenue Retention into interpretable factors",
};

const config = {
  type: "nrr_decomposition" as const,
  title: "NRR Decomposition",
  description: "Decompose Net Revenue Retention into interpretable components using explainable machine learning. Upload any CSV — you'll configure columns after upload.",
};

export default function NRRPage() {
  return <AnalysisPage config={config} />;
}
