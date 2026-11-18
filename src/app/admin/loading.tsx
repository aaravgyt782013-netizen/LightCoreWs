import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function AdminLoading() {
  return (
    <LoadingScreen
      label="Connection Establishing..."
      sublabel="Verifying owner security clearance"
    />
  );
}
