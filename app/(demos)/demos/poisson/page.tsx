import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Poisson Factorisation | Analysis Demos",
  description: "Decompose customer behavior counts into latent factors",
};

const config = {
  type: "poisson_factorization" as const,
  title: "Poisson Factorisation",
  description: "Decompose a customer × event count matrix into latent behavioral factors using Non-negative Matrix Factorization (NMF). Upload any CSV with customer IDs and numeric features — you'll select the columns after upload.",
};

export default function PoissonPage() {
  return <AnalysisPage config={config} />;
}
