import { getAuthUserHomeHref, useTypedSession } from "@/lib/auth-client";
import type { AppRole, AuthSessionUser } from "@/types/auth";
import type { Href } from "expo-router";
import { router, Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { LoadingScreen } from "./loading-screen";

type RouteGuardProps = {
  allowSignedOut?: boolean;
  signedOutOnly?: boolean;
  roles?: readonly AppRole[];
};

function hasRestrictedAccount(user: AuthSessionUser | undefined) {
  return Boolean(user && user.accountStatus !== "ACTIVE");
}

export function RouteGuard({ allowSignedOut = false, signedOutOnly = false, roles }: RouteGuardProps) {
  const session = useTypedSession();
  const user = session.data?.user;
  const pathname = usePathname();
  const isPending = Boolean(session.isPending);
  let redirectHref: Href | null = null;

  if (signedOutOnly && user) {
    if (hasRestrictedAccount(user)) {
      redirectHref = "/account-status";
    } else {
      redirectHref = getAuthUserHomeHref(user);
    }
  } else if (!allowSignedOut && !user) {
    redirectHref = "/sign-in";
  } else if (hasRestrictedAccount(user)) {
    redirectHref = "/account-status";
  } else if (user && roles?.length && !roles.includes(user.role)) {
    redirectHref = getAuthUserHomeHref(user);
  }

  const shouldRedirect = Boolean(redirectHref && pathname !== redirectHref);

  useEffect(() => {
    if (shouldRedirect && redirectHref) {
      router.replace(redirectHref);
    }
  }, [redirectHref, shouldRedirect]);

  const shouldBlockForPendingSession = isPending && !allowSignedOut;

  if (shouldBlockForPendingSession || shouldRedirect) {
    return <LoadingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
