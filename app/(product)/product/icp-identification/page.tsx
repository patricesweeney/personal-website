import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "ICP Identification | Product",
  description: "Identify your ideal customer profile from historical data",
};

const config = {
  type: "poisson_factorization" as const,
  title: "ICP Identification",
  description: "Identify your Ideal Customer Profile by analyzing which customer attributes correlate with high LTV, low churn, and fast sales cycles. Use data to define and refine your target market.",
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "ltv",
      type: "required" as const,
      description: "Customer lifetime value or proxy metric",
      example: "15000",
    },
    {
      name: "industry",
      type: "optional" as const,
      description: "Customer industry or vertical",
      example: "fintech, healthcare, ecommerce",
    },
    {
      name: "company_size",
      type: "optional" as const,
      description: "Employee count or size segment",
      example: "50, 500, enterprise",
    },
    {
      name: "geography",
      type: "optional" as const,
      description: "Region or country",
      example: "US, EMEA, APAC",
    },
    {
      name: "use_case",
      type: "optional" as const,
      description: "Primary use case or job-to-be-done",
      example: "analytics, automation, collaboration",
    },
    {
      name: "tech_stack",
      type: "optional" as const,
      description: "Key technologies in their stack",
      example: "salesforce, hubspot, snowflake",
    },
    {
      name: "sales_cycle_days",
      type: "optional" as const,
      description: "Days from first touch to close",
      example: "45",
    },
    {
      name: "churned",
      type: "optional" as const,
      description: "Whether customer churned",
      example: "1 or 0",
    },
  ],
};

export default function ICPIdentificationPage() {
  return <AnalysisPage config={config} />;
}

