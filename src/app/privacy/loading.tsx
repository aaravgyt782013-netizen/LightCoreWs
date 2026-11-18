import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { site } from "@/lib/site";

export default function PrivacyLoading() {
  return (
    <LoadingScreen
      label="Connection Establishing..."
      sublabel={`Loading ${site.name} privacy policy`}
    />
  );
}
