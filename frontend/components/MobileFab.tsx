"use client";
import React from "react";
import { useAssignmentStore } from "@/store/assignmentStore";

/**
 * Mobile-only Floating Action Button (FAB).
 * Triggers assignment creation reactively on mobile viewports.
 */
const MobileFab = () => {
  // Accessing the creation action directly from our central store
  const addAssignment = useAssignmentStore((state) => state.addAssignment);

  /**
   * Dispatches the action to create a new assignment with randomized topic titles.
   */
  const handleCreateMobileAssignment = () => {
    const topics = [
      "Quiz on Electricity",
      "Quiz on Thermodynamics",
      "Quiz on Quantum Physics",
      "Quiz on Organic Chemistry",
    ];
    const randomTitle = topics[Math.floor(Math.random() * topics.length)];

    addAssignment({
      title: randomTitle,
      assignedDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
      dueDate: new Date(Date.now() + 86400000)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-"),
    });
  };

  return (
    <button
      onClick={handleCreateMobileAssignment}
      className="fixed bottom-24 right-6 z-40 md:hidden h-14 w-14 rounded-full bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center text-[#FF5623] cursor-pointer hover:scale-110 active:scale-90 transition-all duration-200"
      aria-label="Create Assignment"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="#FF5623"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default MobileFab;
