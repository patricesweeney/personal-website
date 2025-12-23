import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Use Cases | Product",
  description: "Decompose customer behavior counts into latent factors",
};

const config = {
  type: "poisson_factorization" as const,
  title: "Use Cases",
  description: "Decompose a customer × event count matrix into latent behavioral factors using Non-negative Matrix Factorization (NMF). This reveals hidden customer segments based on their product usage patterns.",
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123, usr_abc",
    },
    {
      name: "event_count_1",
      type: "required" as const,
      description: "Count of first event type (logins, page views, etc.)",
      example: "42",
    },
    {
      name: "event_count_2",
      type: "required" as const,
      description: "Count of second event type",
      example: "17",
    },
    {
      name: "feature_*_uses",
      type: "optional" as const,
      description: "Additional event/feature usage columns",
      example: "feature_a_uses, feature_b_clicks",
    },
    {
      name: "support_tickets",
      type: "optional" as const,
      description: "Support interaction counts",
      example: "3",
    },
  ],
};

export default function UseCasesPage() {
  return <AnalysisPage config={config} />;
}
