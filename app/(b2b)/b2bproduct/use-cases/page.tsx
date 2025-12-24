import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Use Cases | Product",
  description: "Decompose customer behavior counts into latent factors",
};

const config = {
  type: "poisson_factorization" as const,
  title: "Use Cases",
  description: "Decompose a customer × event count matrix into latent behavioral factors using Non-negative Matrix Factorization (NMF). Reveal hidden customer segments based on usage patterns.",
  marketing: {
    headline: "Your customers use your product in ways you never designed for. Let's find them.",
    problem: "You built your product for 2-3 use cases, but customers have found 10. Some of those hidden use cases have better retention, higher expansion, and stronger word-of-mouth than your core positioning. But you don't know what they are or who's doing them.",
    solution: "We analyze your product usage data to identify distinct behavioral clusters—use cases your customers discovered themselves. You get a map of how people actually use your product, with retention and revenue metrics for each use case, so you can double down on what's working.",
    targetProfile: "Product-led SaaS with rich usage data (events, features, workflows). You have 500+ active customers and suspect there's segmentation you're missing.",
    trigger: "You're seeing surprising retention in a segment you didn't expect. Or churn in your 'ideal' customers while 'accidental' customers stick around. Something doesn't fit your mental model.",
    objections: [
      "\"We already have personas.\" → Personas are who they are. Use cases are what they do. They often don't align. We find the behavioral truth.",
      "\"Our product is simple.\" → Even simple products have usage patterns. We find whether your 'one use case' is actually three in disguise.",
      "\"We track too many events.\" → We handle high-dimensional data. More events = more signal. We'll reduce the dimensionality for you."
    ],
    testimonial: {
      quote: "We found a use case with 2x retention that we never marketed to. Built a landing page, ran some ads, and acquired 500 customers in a quarter—our best-performing segment now.",
      author: "Founder",
      role: "Bootstrapped Dev Tool"
    },
    riskReversal: "If we can't identify distinct, interpretable use cases from your data, we'll explain why and what you'd need to see them—no charge.",
    uniqueness: "We don't just cluster users—we decompose behavior into interpretable factors you can name and act on. Each use case comes with a behavioral fingerprint and business metrics.",
    offerAndRtr: "Upload your user event data to get a use case analysis within 48 hours. Includes use case definitions, user assignments, and business metrics (retention, expansion, NRR) by use case."
  },
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123, usr_abc",
    },
    {
      name: "event_count_1",
      type: "required" as const,
      description: "Count of first event type (logins, page views, etc.)",
      example: "42",
    },
    {
      name: "event_count_2",
      type: "required" as const,
      description: "Count of second event type",
      example: "17",
    },
    {
      name: "feature_*_uses",
      type: "optional" as const,
      description: "Additional event/feature usage columns",
      example: "feature_a_uses, feature_b_clicks",
    },
    {
      name: "support_tickets",
      type: "optional" as const,
      description: "Support interaction counts",
      example: "3",
    },
  ],
  mlSolution: "We use Non-negative Matrix Factorization (NMF) to decompose the customer × event matrix into latent factors representing use cases. Each customer gets a use case profile, and we compute retention/expansion metrics by dominant use case. Includes silhouette analysis for optimal cluster count.",
};

export default function UseCasesPage() {
  return <AnalysisPage config={config} />;
}
