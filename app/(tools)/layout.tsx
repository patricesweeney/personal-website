import { Sidebar } from "@/features/rl-system";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tools-layout">
      <Sidebar />
      <div className="tools-content">{children}</div>
    </div>
  );
}


