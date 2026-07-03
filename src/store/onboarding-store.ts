import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OnboardingState = {
  hasSeenPublicOnboarding: boolean;
  markPublicOnboardingSeen: () => void;
  resetPublicOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenPublicOnboarding: false,
      markPublicOnboardingSeen: () => set({ hasSeenPublicOnboarding: true }),
      resetPublicOnboarding: () => set({ hasSeenPublicOnboarding: false })
    }),
    {
      name: "usted-findit-onboarding",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
