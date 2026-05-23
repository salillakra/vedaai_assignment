"use client";
import React from "react";
import Image from "next/image";
import { useAssignmentStore } from "@/store/assignmentStore";

/**
 * Plus Sign Icon Component
 */
const PlusIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4.16699V15.8337M4.16667 10H15.8333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * NoAssignment Empty State Component.
 * Displayed when there are no active assignments in the Zustand store.
 */
const NoAssignment = () => {
  // Extracting the creation dispatcher from our central data store
  const addAssignment = useAssignmentStore((state) => state.addAssignment);

  /**
   * Dispatches the action to create the initial default assignment card.
   */
  const handleCreateFirstAssignment = () => {
    addAssignment({
      title: "Quiz on Electricity",
      assignedDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
      dueDate: new Date(Date.now() + 86400000)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-"),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[calc(100vh-180px)] py-8 px-4 select-none pb-28 md:pb-8">
      {/* Responsive Illustration */}
      <div className="relative w-64 h-64 md:w-87.5 md:h-87.5 lg:w-100 lg:h-100 transition-all duration-300">
        <Image
          src="/NoAssignment.png"
          alt="No Assignment"
          fill
          className="object-contain animate-fade-in"
          priority
        />
      </div>

      {/* Responsive Text Area */}
      <div className="text-center text-gray-500 mt-2 md:mt-4 font-(--font-bricolage-grotesque) text-base md:text-lg leading-[1.4] tracking-[-0.04em] w-full max-w-121.5">
        <div className="font-bold text-[#303030] text-xl md:text-2xl transition-all">
          No assignments yet
        </div>
        <div className="text-sm md:text-base mt-2 text-[#5E5E5ECC] px-2 md:px-0">
          Create your first assignment to start collecting and grading student
          submissions. You can set up rubrics, define marking criteria, and let
          AI assist with grading.
        </div>
      </div>

      {/* Button CTA */}
      <button
        onClick={handleCreateFirstAssignment}
        className="flex items-center cursor-pointer gap-2 mt-6 px-5 py-2.5 bg-[#181818] rounded-[100px] text-gray-100 hover:bg-[#2C2C2C] active:scale-95 transition-all font-medium text-sm md:text-base shadow-sm border border-white/5"
      >
        <span className="text-white">
          <PlusIcon />
        </span>
        Create Your First Assignment
      </button>
    </div>
  );
};

export default NoAssignment;
