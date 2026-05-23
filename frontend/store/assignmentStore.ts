import { create } from "zustand";

/**
 * Interface representing a single assignment entity.
 */
export interface Assignment {
  id: string;
  title: string;
  assignedDate: string;
  dueDate: string;
}

/**
 * State and action definition for the Assignment Zustand store.
 */
interface AssignmentState {
  // Collection of all assignments
  assignments: Assignment[];
  // Current search query for filtering assignments by title
  searchQuery: string;
  // Adds a new assignment to the start of the list
  addAssignment: (assignment: Omit<Assignment, "id">) => void;
  // Deletes an assignment by its unique ID
  deleteAssignment: (id: string) => void;
  // Sets the current search filter query
  setSearchQuery: (query: string) => void;
}

/**
 * Pre-populated default list matching the Figma "Filled State" mockup.
 */
const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Quiz on Electricity",
    assignedDate: "20-06-2025",
    dueDate: "21-06-2025",
  },
  {
    id: "2",
    title: "Quiz on Electricity",
    assignedDate: "20-06-2025",
    dueDate: "21-06-2025",
  },
  {
    id: "3",
    title: "Quiz on Electricity",
    assignedDate: "20-06-2025",
    dueDate: "21-06-2025",
  },
  {
    id: "4",
    title: "Quiz on Electricity",
    assignedDate: "20-06-2025",
    dueDate: "21-06-2025",
  },
  {
    id: "5",
    title: "Quiz on Electricity",
    assignedDate: "20-06-2025",
    dueDate: "21-06-2025",
  },
  {
    id: "6",
    title: "Quiz on Electricity",
    assignedDate: "20-06-2025",
    dueDate: "21-06-2025",
  },
];

/**
 * Global Zustand store hook to handle all assignment data-flows.
 * Features state persistence-ready structures and deterministic ID generation.
 */
export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: DEFAULT_ASSIGNMENTS,
  searchQuery: "",

  addAssignment: (newAssignment) =>
    set((state) => ({
      assignments: [
        {
          ...newAssignment,
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        },
        ...state.assignments,
      ],
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((assignment) => assignment.id !== id),
    })),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),
}));
