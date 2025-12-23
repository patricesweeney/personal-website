import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Propensity Model | Analysis Demos",
  description: "Score deals with win probability and expected value",
};

const config = {
  type: "propensity_model" as const,
  title: "Propensity Model",
  description: "Score each deal with win probability, expected ACV, and predicted time-to-close. Combine into a single priority score for pipeline optimization and more accurate forecasting.",
  columns: [
    {
      name: "deal_id",
      type: "required" as const,
      description: "Unique identifier for each deal/opportunity",
      example: "opp_456",
    },
    {
      name: "stage",
      type: "required" as const,
      description: "Current pipeline stage",
      example: "discovery, proposal, negotiation",
    },
    {
      name: "acv",
      type: "required" as const,
      description: "Quoted Annual Contract Value",
      example: "75000",
    },
    {
      name: "days_in_pipe",
      type: "required" as const,
      description: "Days since opportunity was created",
      example: "45",
    },
    {
      name: "won",
      type: "required" as const,
      description: "Outcome: 1 if won, 0 if lost (for training)",
      example: "1 or 0",
    },
    {
      name: "days_to_close",
      type: "optional" as const,
      description: "Actual days to close (for won deals)",
      example: "62",
    },
    {
      name: "company_size",
      type: "optional" as const,
      description: "Target company employee count or segment",
      example: "500, enterprise",
    },
    {
      name: "industry",
      type: "optional" as const,
      description: "Target company industry",
      example: "fintech, healthcare",
    },
    {
      name: "champion_score",
      type: "optional" as const,
      description: "Strength of internal champion",
      example: "0.8",
    },
  ],
};

export default function PropensityPage() {
  return <AnalysisPage config={config} />;
}

