import { Metadata } from "next";
import { DemosOverview } from "@/features/demos";

export const metadata: Metadata = {
  title: "Analysis Demos | Patrice Sweeney",
  description: "Upload your data and run customer analytics models",
};

export default function DemosPage() {
  return <DemosOverview />;
}
