import { create } from "zustand";

interface UiState {
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  toggleMobileSidebar: () => void;
  showCreateAssignment: boolean;
  setShowCreateAssignment: (show: boolean) => void;
  viewPaperAssignmentId: string | null;
  setViewPaperAssignmentId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  showCreateAssignment: false,
  setShowCreateAssignment: (show) => set({ showCreateAssignment: show }),
  viewPaperAssignmentId: null,
  setViewPaperAssignmentId: (id) => set({ viewPaperAssignmentId: id }),
}));
