import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function DashboardLoading() {
  return (
    <LoadingScreen
      label="Loading Dashboard..."
      sublabel="Syncing your server workspace"
    />
  );
}
