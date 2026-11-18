import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function StatusLoading() {
  return (
    <LoadingScreen
      label="Connection Establishing..."
      sublabel="Checking live gateway & shard telemetry"
    />
  );
}
