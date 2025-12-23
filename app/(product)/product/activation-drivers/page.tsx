import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Activation Drivers | Product",
  description: "Identify what drives users from signup to value realization",
};

const config = {
  type: "poisson_factorization" as const,
  title: "Activation Drivers",
  description: "Identify the key actions and behaviors that drive users from signup to value realization. Understand which onboarding steps matter most for long-term retention and monetization.",
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

