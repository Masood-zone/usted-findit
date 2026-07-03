import { LoadingScreen } from "@/components/shared/loading-screen";
import { getAuthUserHomeHref, useTypedSession } from "@/lib/auth-client";
import type { Href } from "expo-router";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const session = useTypedSession();
  const user = session.data?.user;
  let redirectHref: Href | null = null;

  if (!session.isPending) {
    if (!user) {
      redirectHref = "/sign-in";
    } else {
      redirectHref = getAuthUserHomeHref(user);
    }
  }

  useEffect(() => {
    if (redirectHref) {
      router.replace(redirectHref);
    }
  }, [redirectHref]);

  return <LoadingScreen />;
}
