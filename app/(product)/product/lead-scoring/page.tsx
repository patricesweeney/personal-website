import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Lead Scoring | Product",
  description: "Score leads with conversion probability and expected value",
};

const config = {
  type: "propensity_model" as const,
  title: "Lead Scoring",
  description: "Score each lead with conversion probability, expected value, and predicted time-to-close. Prioritize your pipeline and allocate sales resources more effectively.",
  columns: [
    {
      name: "lead_id",
      type: "required" as const,
      description: "Unique identifier for each lead",
      example: "lead_456",
    },
    {
      name: "source",
      type: "required" as const,
      description: "Lead acquisition channel",
      example: "organic, paid, referral",
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
      name: "engagement_score",
      type: "optional" as const,
      description: "Website/content engagement metric",
      example: "0.75",
    },
    {
      name: "days_since_signup",
      type: "optional" as const,
      description: "Days since lead was created",
      example: "14",
    },
    {
      name: "converted",
      type: "required" as const,
      description: "Outcome: 1 if converted, 0 if not (for training)",
      example: "1 or 0",
    },
  ],
};

export default function LeadScoringPage() {
  return <AnalysisPage config={config} />;
}

