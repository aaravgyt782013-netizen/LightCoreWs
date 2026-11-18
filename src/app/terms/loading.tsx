import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { site } from "@/lib/site";

export default function TermsLoading() {
  return (
    <LoadingScreen
      label="Connection Establishing..."
      sublabel={`Loading ${site.name} terms of service`}
    />
  );
}
