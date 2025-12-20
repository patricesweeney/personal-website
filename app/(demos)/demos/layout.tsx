import { DemosSidebar } from "@/features/demos/components/DemosSidebar";

export default function DemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tools-layout">
      <DemosSidebar />
      <div className="tools-content">{children}</div>
    </div>
  );
}

