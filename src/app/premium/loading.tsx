import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function PremiumLoading() {
  return (
    <LoadingScreen
      label="Connection Establishing..."
      sublabel="Loading LightCore Premium plans"
    />
  );
}
