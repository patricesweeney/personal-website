import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "NRR Decomposition | Analysis Demos",
  description: "Break down Net Revenue Retention into interpretable factors",
};

const config = {
  type: "nrr_decomposition" as const,
  title: "NRR Decomposition",
  description: "Decompose Net Revenue Retention into interpretable components using explainable machine learning. Understand what drives expansion, contraction, and churn at the customer level.",
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "nrr",
      type: "required" as const,
      description: "Net Revenue Retention ratio for the period",
      example: "1.15 (meaning 115% NRR)",
    },
    {
      name: "usage_depth",
      type: "optional" as const,
      description: "Measure of product adoption depth",
      example: "0.8",
    },
    {
      name: "tenure",
      type: "optional" as const,
      description: "Customer tenure in months",
      example: "24",
    },
    {
      name: "support_health",
      type: "optional" as const,
      description: "Support relationship health score",
      example: "0.9",
    },
    {
      name: "expansion_eligible",
      type: "optional" as const,
      description: "Whether customer is eligible for upsell",
      example: "1 or 0",
    },
    {
      name: "contract_value",
      type: "optional" as const,
      description: "Current ARR or contract value",
      example: "50000",
    },
  ],
};

export default function NRRPage() {
  return <AnalysisPage config={config} />;
}

