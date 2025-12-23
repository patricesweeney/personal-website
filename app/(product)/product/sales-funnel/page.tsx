import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Sales Funnel Analysis | Product",
  description: "Analyze conversion rates and identify bottlenecks across your sales funnel",
};

const config = {
  type: "survival_analysis" as const,
  title: "Sales Funnel Analysis",
  description: "Analyze conversion rates and time-in-stage across your sales funnel. Identify bottlenecks, predict deal velocity, and optimize stage transitions.",
  columns: [
    {
      name: "deal_id",
      type: "required" as const,
      description: "Unique identifier for each deal/opportunity",
      example: "deal_456",
    },
    {
      name: "stage",
      type: "required" as const,
      description: "Current or final pipeline stage",
      example: "discovery, demo, proposal, negotiation",
    },
    {
      name: "days_in_stage",
      type: "required" as const,
      description: "Days spent in current stage",
      example: "7",
    },
    {
      name: "converted",
      type: "required" as const,
      description: "Whether deal moved to next stage or closed won",
      example: "1 or 0",
    },
    {
      name: "deal_size",
      type: "optional" as const,
      description: "Expected deal value",
      example: "50000",
    },
    {
      name: "source",
      type: "optional" as const,
      description: "Lead source or channel",
      example: "inbound, outbound, referral",
    },
    {
      name: "rep_id",
      type: "optional" as const,
      description: "Sales rep identifier",
      example: "rep_123",
    },
    {
      name: "segment",
      type: "optional" as const,
      description: "Customer segment",
      example: "smb, mid-market, enterprise",
    },
  ],
};

export default function SalesFunnelPage() {
  return <AnalysisPage config={config} />;
}

