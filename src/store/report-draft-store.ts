import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ReportDraft } from "@/types/reports";

const emptyDraft: ReportDraft = {
  brand: "",
  category: "",
  colour: "",
  confirmed: false,
  description: "",
  eventDate: "",
  eventTime: "",
  hiddenVerificationDetails: "",
  images: [],
  landmark: "",
  location: "",
  storageOption: "",
  title: "",
  verificationQuestion: ""
};

type ReportDraftState = {
  draft: ReportDraft;
  resetDraft: () => void;
  setDraft: (updates: Partial<ReportDraft>) => void;
};

export const useReportDraftStore = create<ReportDraftState>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      resetDraft: () => set({ draft: emptyDraft }),
      setDraft: (updates) => set((state) => ({ draft: { ...state.draft, ...updates } }))
    }),
    {
      name: "usted-findit-report-draft",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
