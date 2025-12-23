import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Activation Drivers | Product",
  description: "Identify what drives users from signup to value realization",
};

const config = {
  type: "poisson_factorization" as const,
  title: "Activation Drivers",
  description: "Identify the key actions and behaviors that drive users from signup to value realization. Understand which onboarding steps matter most.",
  marketing: {
    headline: "Most of your signups never see value. Here's how to fix that.",
    problem: "You're acquiring users, but they're not activating. Your onboarding has 12 steps because product couldn't agree on what matters. Meanwhile, users drop off before they ever understand why they signed up. You're paying to acquire users who never convert.",
    solution: "We analyze your user behavior data to identify which actions actually predict long-term retention and monetization. You get a ranked list of activation drivers so you can simplify onboarding to the actions that matter and remove the friction that doesn't.",
    targetProfile: "Product-led SaaS with a freemium or trial motion. You have 1,000+ signups and can track user events. Typically have a Growth PM or PLG team looking to improve signup-to-paid conversion.",
    trigger: "Your trial-to-paid conversion is under 5% and you don't know what to optimize. Or you just redesigned onboarding and want to validate whether it's working.",
    objections: [
      "\"We already know our 'aha moment'.\" → Most teams guess. Let's validate with data. Often the real driver is different from the assumed one.",
      "\"We don't track enough events.\" → You need signups, core actions, and outcomes. Even basic tracking reveals patterns.",
      "\"Our product is too complex.\" → Complex products often have simpler activation patterns than expected. We find the signal."
    ],
    testimonial: {
      quote: "We thought activation was about inviting teammates. Turns out it was about creating the second project. We rewrote onboarding and improved trial-to-paid by 60%.",
      author: "Head of Growth",
      role: "Series A Productivity Tool"
    },
    riskReversal: "If we can't identify statistically significant activation drivers from your data, we'll refund the analysis and explain what data you'd need to collect.",
    uniqueness: "We don't just tell you what correlates with retention—we estimate the causal impact of each action. Some actions are just signals; others actually cause activation. We separate them.",
    offerAndRtr: "Upload your user event data to get an activation analysis within 48 hours. Includes ranked action importance, optimal onboarding sequence, and cohort comparisons for activated vs. non-activated users."
  },
  columns: [
    {
      name: "user_id",
      type: "required" as const,
      description: "Unique identifier for each user",
      example: "user_123",
    },
    {
      name: "activated",
      type: "required" as const,
      description: "Whether user reached activation milestone",
      example: "1 or 0",
    },
    {
      name: "completed_onboarding",
      type: "optional" as const,
      description: "Completed onboarding flow",
      example: "1 or 0",
    },
    {
      name: "invited_teammate",
      type: "optional" as const,
      description: "Invited at least one teammate",
      example: "1 or 0",
    },
    {
      name: "created_first_project",
      type: "optional" as const,
      description: "Created their first project/workspace",
      example: "1 or 0",
    },
    {
      name: "connected_integration",
      type: "optional" as const,
      description: "Connected an external integration",
      example: "1 or 0",
    },
    {
      name: "days_to_activate",
      type: "optional" as const,
      description: "Days from signup to activation",
      example: "3",
    },
  ],
};

export default function ActivationDriversPage() {
  return <AnalysisPage config={config} />;
}
