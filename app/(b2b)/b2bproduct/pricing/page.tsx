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
  marketing: {
    headline: "You're leaving money on the table. Let's find out how much.",
    problem: "Your pricing was set when you launched and hasn't changed since, except for a 10% bump someone suggested in a board meeting. You have no idea if you're underpriced (leaving revenue on the table) or overpriced (losing deals you should win). Every pricing conversation is a guess.",
    solution: "We analyze your win/loss data, discount patterns, and churn behavior to estimate price elasticity by segment. You get data-driven guidance on where you can raise prices, where you need to lower them, and how to structure your pricing to capture more value.",
    targetProfile: "B2B SaaS with 200+ customers and visible price variation (different deal sizes, occasional discounting, multiple tiers). Typically have a founder or finance lead who suspects pricing is wrong but doesn't know how wrong.",
    trigger: "You just raised prices and saw unexpected churn in a key segment. Or a new competitor entered at half your price and you don't know if you should respond. Or you're approaching a funding round and need to show ARR growth.",
    objections: [
      "\"We can't raise prices.\" → You might be right. But often only some segments are price-sensitive. We find the ones where you have room.",
      "\"We don't have pricing data.\" → You have deal sizes, discount rates, and churn by price point. That's pricing data.",
      "\"Our pricing is complex.\" → Usage-based, tiered, per-seat—we model it all. Complexity often hides opportunity."
    ],
    testimonial: {
      quote: "We found we could raise prices 20% on our top tier with <2% incremental churn. That's pure margin. The analysis paid for itself in the first month.",
      author: "CFO",
      role: "Series B Security Company"
    },
    riskReversal: "We provide confidence intervals on all elasticity estimates. If the data doesn't support actionable recommendations, we'll tell you what to collect and revisit at no additional charge.",
    uniqueness: "We don't just tell you to 'test prices.' We estimate the revenue impact of specific price changes by segment so you can decide before you experiment.",
    offerAndRtr: "Upload your customer and deal data to get a pricing analysis within 72 hours. Includes elasticity estimates by segment, optimal price point recommendations, and revenue impact projections for specific pricing changes."
  },
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
