import { B2CSidebar } from "@/features/demos/components/B2CSidebar";

export default function B2CLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tools-layout">
      <B2CSidebar />
      <div className="tools-content">{children}</div>
    </div>
  );
}

