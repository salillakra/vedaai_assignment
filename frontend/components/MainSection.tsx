"use client";
import React from "react";
import Header from "./Header";
import NoAssignment from "./NoAssignment";
import AssignmentGrid from "./AssignmentGrid";
import { useAssignmentStore } from "@/store/assignmentStore";

/**
 * Main Section wrapper component that dynamically manages
 * the transition between Empty State and Filled State based on the Zustand store.
 */
const MainSection = () => {
  // Querying the total assignments count from the Zustand store
  const assignmentsCount = useAssignmentStore((state) => state.assignments.length);

  return (
    <div className="w-full pr-0 md:pr-2 flex flex-col h-screen overflow-y-auto bg-[#F8F9FA]/20 scrollbar-thin">
      {/* Sticky/Fixed responsive Header */}
      <Header />

      {/* Conditionally rendering Empty state vs Grid list state */}
      {assignmentsCount === 0 ? <NoAssignment /> : <AssignmentGrid />}
    </div>
  );
};

export default MainSection;
