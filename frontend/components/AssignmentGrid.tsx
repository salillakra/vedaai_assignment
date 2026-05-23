"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAssignmentStore, Assignment } from "@/store/assignmentStore";

/**
 * ThreeDotMenu Icon Component
 */
const ThreeDotIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z"
      stroke="#303030"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 4C8.55228 4 9 3.55228 9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4Z"
      stroke="#303030"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 14C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14Z"
      stroke="#303030"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Search/Magnifying Glass Icon Component
 */
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-400"
  >
    <path
      d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 14L11.1 11.1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Filter Icon Component
 */
const FilterIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.5 4.82153C2.5 3.53938 3.53938 2.5 4.82153 2.5H15.1785C16.4606 2.5 17.5 3.53938 17.5 4.82153C17.5 5.49412 17.2594 6.14453 16.8217 6.6552L14.4599 9.41062C13.5537 10.4679 13.0556 11.8144 13.0556 13.2069V15C13.0556 16.3807 11.9363 17.5 10.5556 17.5H9.44444C8.06373 17.5 6.94444 16.3807 6.94444 15V13.2069C6.94444 11.8144 6.44632 10.4679 5.54011 9.41062L3.17832 6.6552C2.7406 6.14453 2.5 5.49412 2.5 4.82153ZM4.82153 4.16667C4.45986 4.16667 4.16667 4.45986 4.16667 4.82153C4.16667 5.09627 4.26495 5.36195 4.44375 5.57054L6.80554 8.32597C7.97067 9.68529 8.61111 11.4166 8.61111 13.2069V15C8.61111 15.4602 8.98421 15.8333 9.44444 15.8333H10.5556C11.0158 15.8333 11.3889 15.4602 11.3889 15V13.2069C11.3889 11.4166 12.0293 9.68529 13.1945 8.32597L15.5563 5.57054C15.7351 5.36195 15.8333 5.09627 15.8333 4.82153C15.8333 4.45986 15.5401 4.16667 15.1785 4.16667H4.82153Z"
      fill="#A9A9A9"
    />
  </svg>
);

const AssignmentCard = ({ assignment }: { assignment: Assignment }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteAssignment = useAssignmentStore(
    (state) => state.deleteAssignment,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Close card menu contextually when tapping outside the element boundaries
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <div className="relative h-40.5 bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-[0px_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0px_12px_32px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300">
      <div className="flex justify-between items-start gap-4">
        {/* Assignment Title */}
        <h3 className="font-bold text-gray-800 text-lg md:text-xl leading-[1.3] tracking-tight">
          {assignment.title}
        </h3>

        {/* Dropdown Trigger */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle action menu"
          >
            <ThreeDotIcon />
          </button>

          {/* Context Action Menu Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
              <button
                onClick={() => {
                  alert(`Viewing Details for: ${assignment.title}`);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-(--font-bricolage-grotesque) text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                View Assignment
              </button>
              <button
                onClick={() => {
                  deleteAssignment(assignment.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-(--font-bricolage-grotesque) text-red-500 hover:bg-red-50/50 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date metadata display */}
      <div className="flex absolute bottom-5 justify-between flex-wrap items-center gap-x-4 gap-y-1 mt-8 md:mt-12 font-(--font-bricolage-grotesque) text-[11px] md:text-[13px] tracking-tight text-[#A9A9A9]">
        <span>
          <strong className="text-gray-700">Assigned on :</strong>{" "}
          {assignment.assignedDate}
        </span>
        <span>
          <strong className="text-gray-700">Due :</strong> {assignment.dueDate}
        </span>
      </div>
    </div>
  );
};

const AssignmentGrid = () => {
  const { assignments, searchQuery, setSearchQuery, addAssignment } =
    useAssignmentStore();

  // Filter assignments locally based on search term
  const filteredAssignments = assignments.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Triggers random assignment instantiation on demand
  const handleCreateAssignment = () => {
    const topics = [
      "Quiz on Thermodynamics",
      "Quiz on Electromagnetism",
      "Quiz on Quantum Physics",
      "Quiz on Organic Chemistry",
      "Quiz on Newtonian Mechanics",
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
    <div className="w-full px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-16 flex flex-col flex-1 select-none">
      {/* Header Breadcrumb / Meta Block */}
      <div className="flex flex-col gap-1 mt-2 md:mt-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40"></span>
            <span className="absolute -inset-0.5 rounded-full border border-emerald-300 opacity-30"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>

          <h2 className="font-semibold text-gray-800 text-xl md:text-2xl leading-[100%] tracking-tight">
            Assignments
          </h2>
        </div>
        <p className="text-xs md:text-sm text-[#5E5E5ECC] mt-1 tracking-tight">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* Action Filters and Search Row */}
      <div className="flex items-center justify-between mt-6 bg-white px-4 py-2 rounded-2xl gap-3 flex-wrap">
        {/* Filter Button */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 active:scale-95 transition-all text-xs  text-[#A9A9A9] cursor-pointer">
          <FilterIcon />
          <span>Filter By</span>
        </button>

        {/* Global Search Input */}
        <div className="relative w-full sm:w-64 max-w-sm">
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs font-(--font-bricolage-grotesque) focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-all bg-white text-gray-700"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <SearchIcon />
          </div>
        </div>
      </div>

      {/* Grid Display Area */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-6 md:mt-8 flex-1">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
          <div className="text-gray-400 font-(--font-bricolage-grotesque) text-sm">
            No matching assignments found.
          </div>
          <p className="text-[#5E5E5ECC] font-(--font-bricolage-grotesque) text-xs mt-1">
            Try adjusting your search criteria.
          </p>
        </div>
      )}

      {/* CTA Button */}
      <div
        className="hidden md:flex sticky bottom-6 z-30 justify-center w-full pointer-events-none mt-auto pb-2
      "
      >
        <button
          onClick={handleCreateAssignment}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-black/85 backdrop-blur-md text-white hover:bg-black active:scale-95 transition-all rounded-full text-xs font-semibold shadow-[0px_8px_32px_rgba(0,0,0,0.18)] border border-white/10 cursor-pointer"
        >
          <span className="text-lg leading-none font-light">+</span>
          Create Assignment
        </button>
      </div>
    </div>
  );
};

export default AssignmentGrid;
