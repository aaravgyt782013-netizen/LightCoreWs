import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function DashboardLoading() {
  return (
    <LoadingScreen
      label="Connection Establishing..."
      sublabel="Syncing your Discord servers & credentials"
    />
  );
}
