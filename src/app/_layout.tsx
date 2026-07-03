import { AppProviders } from "@/providers/app-providers";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts as useInterFonts
} from "@expo-google-fonts/inter";
import {
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts as useMontserratFonts
} from "@expo-google-fonts/montserrat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_600SemiBold
  });
  const [montserratLoaded] = useMontserratFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold
  });
  const fontsLoaded = interLoaded && montserratLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
