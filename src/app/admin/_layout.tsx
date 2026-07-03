import { RouteGuard } from "@/components/shared/route-guard";

export default function AdminLayout() {
  return <RouteGuard roles={["ADMIN", "SUPER_ADMIN"]} />;
}
