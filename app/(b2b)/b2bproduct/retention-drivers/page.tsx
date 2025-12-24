import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Retention Drivers | Product",
  description: "Model time-to-churn with Cox proportional hazards",
};

const config = {
  type: "survival_analysis" as const,
  title: "Retention Drivers",
  description: "Fit a Cox proportional hazards model to understand time-to-churn and identify which factors accelerate or delay customer departure. Get hazard ratios for each feature.",
  marketing: {
    headline: "Every churned customer showed warning signs. Let's find them earlier.",
    problem: "You're doing churn postmortems, but by then it's too late. The customer decided to leave 3 months ago—you just didn't notice. Your CS team is stretched thin, treating every account the same instead of focusing on the ones actually at risk.",
    solution: "We build a survival model from your historical churn data to identify which factors predict churn and when. You get hazard ratios for each risk factor and early warning indicators so you can intervene while there's still time.",
    targetProfile: "B2B SaaS with 15%+ annual churn and at least 12 months of customer history. You have a CS function that's responsible for retention and needs to prioritize their book.",
    trigger: "You just lost 3 logo customers you didn't see coming. Or your NRR dipped below 100% and the board is asking questions. Or you're seeing churn spike in a segment and don't know why.",
    objections: [
      "\"We already track health scores.\" → Most health scores are made up. We build them from what actually predicts churn in your data.",
      "\"Churn is random.\" → Some is. But a lot isn't. We quantify which factors matter and by how much.",
      "\"We can't prevent churn.\" → You can't save everyone. But catching at-risk accounts 60 days earlier gives you a fighting chance."
    ],
    testimonial: {
      quote: "We found that customers who don't log in for 2 weeks churn at 3x the rate. Built an automated re-engagement campaign and saved $800K in ARR in the first quarter.",
      author: "Head of Customer Success",
      role: "Series B Collaboration Tool"
    },
    riskReversal: "If the model doesn't identify at-risk accounts with at least 2x the baseline churn rate, we'll work with your team to improve it or refund the analysis.",
    uniqueness: "We don't just flag at-risk accounts—we tell you how much time you have and what specific factors are driving their risk. Your team knows who to call and what to say.",
    offerAndRtr: "Upload your customer data to get a retention analysis within 48 hours. Includes risk scores for every account, hazard ratios for each factor, and a prioritized intervention list for your CS team."
  },
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "tenure_months",
      type: "required" as const,
      description: "Time since customer acquisition (in months)",
      example: "14",
    },
    {
      name: "churned",
      type: "required" as const,
      description: "Binary indicator: 1 if churned, 0 if still active",
      example: "0 or 1",
    },
    {
      name: "plan_type",
      type: "optional" as const,
      description: "Subscription plan or tier",
      example: "pro, enterprise",
    },
    {
      name: "usage_score",
      type: "optional" as const,
      description: "Product usage intensity metric",
      example: "0.75",
    },
    {
      name: "support_interactions",
      type: "optional" as const,
      description: "Number of support tickets or calls",
      example: "5",
    },
    {
      name: "nps_score",
      type: "optional" as const,
      description: "Net Promoter Score if available",
      example: "8",
    },
  ],
  mlSolution: "We fit Cox proportional hazards models with time-varying covariates to predict churn timing. Hazard ratios quantify the impact of each risk factor. Includes survival curves by segment, at-risk account scoring, and expected time-to-churn estimates for intervention prioritization.",
};

export default function RetentionDriversPage() {
  return <AnalysisPage config={config} />;
}
