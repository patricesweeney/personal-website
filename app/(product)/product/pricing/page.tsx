import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Pricing | Product",
  description: "Analyze willingness to pay and optimize price points",
};

const config = {
  type: "nrr_decomposition" as const,
  title: "Pricing",
  description: "Analyze willingness to pay across segments and optimize price points. Model price elasticity and identify opportunities for value-based pricing.",
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "price_paid",
      type: "required" as const,
      description: "Actual price paid per period",
      example: "99",
    },
    {
      name: "list_price",
      type: "optional" as const,
      description: "List price before discounts",
      example: "149",
    },
    {
      name: "segment",
      type: "optional" as const,
      description: "Customer segment or persona",
      example: "smb, mid-market, enterprise",
    },
    {
      name: "seats",
      type: "optional" as const,
      description: "Number of seats/licenses",
      example: "10",
    },
    {
      name: "usage_volume",
      type: "optional" as const,
      description: "Usage-based consumption metric",
      example: "5000",
    },
    {
      name: "churned",
      type: "optional" as const,
      description: "Whether customer churned",
      example: "1 or 0",
    },
    {
      name: "expanded",
      type: "optional" as const,
      description: "Whether customer expanded",
      example: "1 or 0",
    },
  ],
};

export default function PricingPage() {
  return <AnalysisPage config={config} />;
}

