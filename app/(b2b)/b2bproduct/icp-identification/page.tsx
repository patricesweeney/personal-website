import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "ICP Identification | Product",
  description: "Identify your ideal customer profile from historical data",
};

const config = {
  type: "poisson_factorization" as const,
  title: "ICP Identification",
  description: "Identify your Ideal Customer Profile by analyzing which customer attributes correlate with high LTV, low churn, and fast sales cycles.",
  marketing: {
    headline: "Stop guessing who your best customers are. Let your data tell you.",
    problem: "Most companies define their ICP based on intuition, copying competitors, or whoever their first few customers happened to be. This leads to wasted sales effort on poor-fit prospects, high churn from customers who shouldn't have been sold to, and missed opportunities in segments you never considered.",
    solution: "We analyze your historical customer data to identify which firmographic, technographic, and behavioral attributes actually predict success—high LTV, low churn, fast sales cycles, and strong expansion. You get a data-driven ICP definition you can operationalize in your GTM motion.",
    targetProfile: "B2B SaaS companies with 100+ customers and at least 12 months of customer data. Typically Series A+ with a dedicated RevOps or Growth function looking to move from intuition-based to data-driven targeting.",
    trigger: "You just lost a big deal to a competitor and realized you were never their ICP. Or you're seeing 30%+ churn in a specific segment and wondering if you should stop selling to them entirely.",
    objections: [
      "\"We already know our ICP.\" → Great, let's validate it. Most companies find their data tells a different story than their assumptions.",
      "\"We don't have enough data.\" → 100 customers with basic attributes is enough to find signal. We'll tell you if your data is insufficient.",
      "\"Our market is too niche.\" → Niche markets often have the clearest ICP patterns. Less noise means stronger signal."
    ],
    testimonial: {
      quote: "We thought we were an enterprise product. The data showed our best customers were actually 200-500 employee companies. We shifted focus and improved win rates by 40%.",
      author: "VP Sales",
      role: "Series B DevTools Company"
    },
    riskReversal: "If we can't identify statistically significant patterns in your data, you pay nothing. We'll tell you upfront if your dataset isn't sufficient for meaningful analysis.",
    uniqueness: "We don't just give you a customer persona deck. We give you quantified criteria you can plug directly into your lead scoring, territory planning, and outbound targeting.",
    offerAndRtr: "Upload your customer data and get an ICP analysis report within 48 hours. Includes attribute importance rankings, segment performance comparisons, and actionable targeting criteria. No long-term commitment—just clarity on who you should be selling to."
  },
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
  mlSolution: "We use gradient boosted trees (XGBoost) with SHAP values for interpretability. The model predicts LTV from customer attributes, then SHAP decomposition shows which attributes drive predictions. We also run statistical tests (chi-squared, Kruskal-Wallis) to validate significance. Output includes feature importance rankings, segment-level LTV distributions, and decision rules for targeting.",
};

export default function ICPIdentificationPage() {
  return <AnalysisPage config={config} />;
}
