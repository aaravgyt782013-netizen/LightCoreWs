import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function GuildDashboardLoading() {
  return <LoadingScreen label="Syncing guild control plane" delayed />;
}
