import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Channel Attribution | Product",
  description: "Measure channel effectiveness and optimize marketing spend",
};

const config = {
  type: "nrr_decomposition" as const,
  title: "Channel Attribution",
  description: "Decompose revenue attribution across marketing channels using Bayesian media mix modeling. Understand ROI by channel, optimize budget allocation, and measure incrementality.",
  columns: [
    {
      name: "date",
      type: "required" as const,
      description: "Date of the observation (daily or weekly)",
      example: "2024-01-15",
    },
    {
      name: "revenue",
      type: "required" as const,
      description: "Revenue or conversions for the period",
      example: "50000",
    },
    {
      name: "paid_search_spend",
      type: "optional" as const,
      description: "Paid search advertising spend",
      example: "5000",
    },
    {
      name: "paid_social_spend",
      type: "optional" as const,
      description: "Paid social advertising spend",
      example: "3000",
    },
    {
      name: "display_spend",
      type: "optional" as const,
      description: "Display/programmatic advertising spend",
      example: "2000",
    },
    {
      name: "tv_spend",
      type: "optional" as const,
      description: "TV/video advertising spend",
      example: "10000",
    },
    {
      name: "email_sends",
      type: "optional" as const,
      description: "Number of marketing emails sent",
      example: "50000",
    },
    {
      name: "organic_traffic",
      type: "optional" as const,
      description: "Organic website sessions",
      example: "25000",
    },
  ],
};

export default function ChannelAttributionPage() {
  return <AnalysisPage config={config} />;
}
