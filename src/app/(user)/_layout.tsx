import { RouteGuard } from "@/components/shared/route-guard";

export default function UserLayout() {
  return <RouteGuard roles={["USER"]} />;
}
