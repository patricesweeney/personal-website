import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Expansion Drivers | Product",
  description: "Identify what drives customers to expand their usage and spend",
};

const config = {
  type: "nrr_decomposition" as const,
  title: "Expansion Drivers",
  description: "Identify the key factors that drive customers to expand their usage, add seats, or upgrade plans. Understand which behaviors predict upsell opportunities.",
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "expanded",
      type: "required" as const,
      description: "Whether customer expanded in period",
      example: "1 or 0",
    },
    {
      name: "expansion_amount",
      type: "optional" as const,
      description: "Dollar amount of expansion",
      example: "5000",
    },
    {
      name: "seats_added",
      type: "optional" as const,
      description: "Number of seats added",
      example: "5",
    },
    {
      name: "feature_adoption",
      type: "optional" as const,
      description: "Percentage of features used",
      example: "0.75",
    },
    {
      name: "usage_growth",
      type: "optional" as const,
      description: "Month-over-month usage growth",
      example: "0.25",
    },
    {
      name: "tenure_months",
      type: "optional" as const,
      description: "Months since customer acquisition",
      example: "12",
    },
    {
      name: "csm_touches",
      type: "optional" as const,
      description: "Number of CSM interactions",
      example: "4",
    },
  ],
};

export default function ExpansionDriversPage() {
  return <AnalysisPage config={config} />;
}

