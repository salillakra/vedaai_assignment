import { create } from "zustand";

export interface Assignment {
  id: string;
  title: string;
  instructions?: string | null;
  dueDate?: string | null;
  numberOfQuestions: number;
  totalMarks: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  paper?: {
    id: string;
    pdfUrl?: string | null;
  } | null;
}

interface AssignmentState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
