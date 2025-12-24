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
  marketing: {
    headline: "Your best leads are buried in your CRM. Let's find them.",
    problem: "Your SDRs treat every lead the same, or worse, they cherry-pick based on gut feel. Meanwhile, high-intent leads go cold while reps chase logos that will never close. The result: wasted sales capacity, missed quota, and frustrated reps.",
    solution: "We build a custom lead scoring model from your historical conversion data. Each lead gets a conversion probability, expected deal value, and priority score. Your reps focus on the leads most likely to close, and your pipeline gets healthier overnight.",
    targetProfile: "B2B SaaS with 50+ closed-won deals and an inbound or mixed motion. You have a sales team that's capacity-constrained and needs to prioritize ruthlessly.",
    trigger: "Your conversion rate is dropping, your reps are complaining about lead quality, or you just hired a bunch of SDRs and need to point them at the right accounts.",
    objections: [
      "\"We already have lead scoring.\" → If it's based on 'downloaded whitepaper = 10 points', it's not working. We model actual conversion patterns.",
      "\"Our AEs know which leads are good.\" → Great AEs have good intuition. But can they apply it to 500 leads consistently? Scoring scales their judgment.",
      "\"We don't have enough data.\" → 50 closed deals is enough to find patterns. We'll tell you if your data is insufficient."
    ],
    testimonial: {
      quote: "Our top-scored leads convert at 3x the rate of bottom-scored. We restructured territories around score tiers and improved quota attainment by 35%.",
      author: "Director of Sales Ops",
      role: "Series B Martech"
    },
    riskReversal: "We validate the model on held-out data before you deploy it. If it doesn't beat random on historical data, you don't pay.",
    uniqueness: "We don't give you a static score—we give you conversion probability, expected value, AND predicted time-to-close. Prioritize for this quarter or this month.",
    offerAndRtr: "Upload your lead and opportunity data to get a scored pipeline within 48 hours. Includes model performance metrics, score distributions, and integration-ready output for your CRM."
  },
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
