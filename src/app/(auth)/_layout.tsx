import { RouteGuard } from "@/components/shared/route-guard";

export default function AuthLayout() {
  return <RouteGuard allowSignedOut signedOutOnly />;
}
