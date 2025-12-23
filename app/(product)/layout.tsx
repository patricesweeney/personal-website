import { DemosSidebar } from "@/features/demos/components/DemosSidebar";

export default function ProductLayout({
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

