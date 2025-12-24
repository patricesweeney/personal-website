import { B2BSidebar } from "@/features/demos/components/B2BSidebar";

export default function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tools-layout">
      <B2BSidebar />
      <div className="tools-content">{children}</div>
    </div>
  );
}
