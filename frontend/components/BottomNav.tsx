"use client";
import { useState } from "react";
import { useUiStore } from "@/store/uiStore";

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState("Assignments");
  const { setViewPaperAssignmentId, setShowCreateAssignment } = useUiStore();

  const navItems = [
    {
      name: "Home",
      icon: (color: string) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 11.6667H11.6667V17.5H17.5V11.6667Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.33333 11.6667H2.5V17.5H8.33333V11.6667Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.5 2.5H11.6667V8.33333H17.5V2.5Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Assignments",
      icon: (color: string) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z"
            fill={color}
          />
        </svg>
      ),
      link: "/",
    },
    {
      name: "Library",
      icon: (color: string) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 3C4 2.44772 4.44772 2 5 2H11L16 7V17C16 17.5523 15.5523 18 15 18H5C4.44772 18 4 17.5523 4 17V3Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 2V7H16"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 12.5H12M10 10.5V14.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "AI Toolkit",
      icon: (color: string) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 19 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.63783 8.63783L6.18377 4H7.13246L8.6784 8.63783L13.3162 10.1838V11.1325L8.6784 12.6784L7.13246 17.3162H6.18377L4.63783 12.6784L0 11.1325V10.1838L4.63783 8.63783Z"
            fill={color}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.3878 2.38783L14.1838 0H15.1325L15.9284 2.38783L18.3162 3.18377V4.13246L15.9284 4.9284L15.1325 7.31623H14.1838L13.3878 4.9284L11 4.13246V3.18377L13.3878 2.38783Z"
            fill={color}
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 md:hidden flex justify-center">
      <div className="w-full max-w-md bg-[#121212]/95 backdrop-blur-md border border-white/10 shadow-[0px_16px_40px_rgba(0,0,0,0.5)] rounded-3xl p-2 flex justify-between items-center px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          const color = isActive ? "#FFFFFF" : "#A9A9A9";
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                if (item.name === "Assignments") {
                  setViewPaperAssignmentId(null);
                  setShowCreateAssignment(false);
                }
              }}
              className="flex flex-col items-center justify-center py-2 flex-1 cursor-pointer transition-all duration-200 active:scale-95 gap-1.5"
            >
              <div className="flex items-center justify-center h-5 w-5">
                {item.icon(color)}
              </div>
              <span
                className={`font-(--font-bricolage-grotesque) text-[11px] leading-[100%] tracking-tight transition-colors duration-200 ${
                  isActive ? "text-white font-medium" : "text-[#A9A9A9]"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
