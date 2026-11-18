import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function GuildDashboardLoading() {
  return (
    <LoadingScreen
      label="Connection Establishing..."
      sublabel="Loading server security modules & configuration"
    />
  );
}
