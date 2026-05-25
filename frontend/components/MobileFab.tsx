"use client";
import { useUiStore } from "@/store/uiStore";

const MobileFab = () => {
  const { setShowCreateAssignment } = useUiStore();

  return (
    <button
      onClick={() => setShowCreateAssignment(true)}
      className="fixed bottom-26 right-4 z-40 md:hidden h-14 w-14 rounded-full bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center text-[#FF5623] cursor-pointer hover:scale-110 active:scale-90 transition-all duration-200"
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
