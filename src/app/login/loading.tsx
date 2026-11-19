import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function LoginLoading() {
  return <LoadingScreen label="Preparing Discord OAuth2" delayed />;
}
