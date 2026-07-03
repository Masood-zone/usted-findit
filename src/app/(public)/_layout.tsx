import { RouteGuard } from "@/components/shared/route-guard";

export default function PublicLayout() {
  return <RouteGuard allowSignedOut signedOutOnly />;
}
