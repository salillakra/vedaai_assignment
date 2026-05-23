"use client";
import Image from "next/image";
import VedaaiLogo from "@/assets/images/VedaaiLogo.svg";
import StarIcon from "@/assets/Icons/Star.svg";
import MenuIcon from "@/assets/Icons/menu.svg";
import UsersIcon from "@/assets/Icons/course.svg";
import FileTextIcon from "@/assets/Icons/file.svg";
import PieIcon from "@/assets/Icons/pie.svg";
import ToolKitIcon from "@/assets/Icons/toolkit.svg";
import GearIcon from "@/assets/Icons/gear.svg";
import { useUiStore } from "@/store/uiStore";
import { useAssignmentStore } from "@/store/assignmentStore";

interface SidebarContentProps {
  onClose?: () => void;
}

/**
 * Common content wrapper for the VedaAI Sidebar.
 * Shared between the static desktop layout and the floating mobile drawer layout.
 */
const SidebarContent = ({ onClose }: SidebarContentProps) => {
  // Querying the active assignments count from our global data store
  const assignmentsCount = useAssignmentStore((state) => state.assignments.length);

  const quickLinks = [
    { name: "Home", href: "#", Icon: MenuIcon },
    {
      name: "My Groups",
      href: "#",
      Icon: UsersIcon,
    },
    {
      name: "Assignments",
      href: "#",
      Icon: FileTextIcon,
    },
    {
      name: "AI Teacher's Toolkit",
      href: "#",
      Icon: ToolKitIcon,
    },
    {
      name: "My Library",
      href: "#",
      Icon: PieIcon,
    },
  ];

  return (
    <div className="flex h-full flex-col w-full gap-10 md:gap-14">
      {/* Brand Logo Banner */}
      <div className="h-12 w-38 object-contain">
        <Image
          className="w-38 scale-110 -translate-x-2"
          src={VedaaiLogo}
          height={100}
          width={100}
          loading="eager"
          alt="Vedaai Logo"
        />
      </div>

      {/* Primary Call-To-Action: Create Assignment */}
      <button
        onClick={() => {
          alert("Create Assignment Clicked");
          if (onClose) onClose();
        }}
        className="h-12.5 cursor-pointer rounded-[100px] p-1 shadow-[0px_32px_48px_0px_#00000033] bg-linear-to-r from-[#FF7950] to-[#C0350A] hover:opacity-95 transition-opacity active:scale-98"
      >
        <div className="h-full flex items-center justify-center gap-2 px-3 py-2 rounded-[98px] bg-black">
          <Image
            src={StarIcon}
            height={30}
            width={30}
            alt="Star Icon"
            className="h-4.5 w-4.5"
            loading="eager"
          />
          <span className="font-medium text-white text-base leading-7 tracking-tight align-middle">
            Create Assignment
          </span>
        </div>
      </button>

      {/* Quick Navigation Links */}
      <div className="flex flex-col gap-3">
        {quickLinks.map((link, index) => {
          const isAssignments = link.name === "Assignments";
          return (
            <a
              key={index}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors duration-200"
            >
              <Image src={link.Icon} alt={link.name} width={20} height={20} />
              <span className="font-(--font-bricolage-grotesque) text-base leading-[1.4] tracking-[-0.04em] align-middle text-[#5E5E5ECC]">
                {link.name}
              </span>
              
              {/* Dynamic Orange-Red count badge for Assignments */}
              {isAssignments && assignmentsCount > 0 && (
                <span className="ml-auto bg-[#FF5623] text-white text-[11px] font-bold px-2 py-0.5 rounded-full select-none transition-all scale-100 hover:scale-105">
                  {assignmentsCount}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* Settings & Institute Block anchored to footer */}
      <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-gray-100">
        <a
          href="#"
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors duration-200"
        >
          <Image
            src={GearIcon}
            alt="Settings"
            width={20}
            height={20}
            className="rotate-90"
          />
          <span className="font-(--font-bricolage-grotesque) text-base leading-[1.4] tracking-[-0.04em] align-middle text-[#5E5E5ECC]">
            Settings
          </span>
        </a>

        {/* User's School Metadata Block */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors duration-200">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#C4C4C4]">
            <Image
              src="/user_Image.jpg"
              height={50}
              width={50}
              className="object-cover h-full w-full"
              alt="user Image"
            />
          </div>
          <div className="flex flex-col font-(--font-bricolage-grotesque) overflow-hidden">
            <span className="text-[16px] leading-[1.4] font-bold tracking-[-0.04em] align-middle text-[#303030] truncate">
              Delhi Public School
            </span>
            <span className="text-[14px] leading-[1.4] tracking-[-0.04em] align-middle text-[#5E5E5E] truncate">
              Bokaro Steel City
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main SideBar Shell.
 * Orchestrates viewport boundaries to toggle standard desktop layout or sliding overlay drawer.
 */
const SideBar = () => {
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <div className="hidden md:flex min-w-76 min-h-[calc(100vh-200px)] my-3 p-6 mx-3 rounded-2xl bg-white shadow-[0px_16px_48px_0px_#0000001F] select-none">
        <div className="flex h-full flex-col w-62.75">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in select-none">
          {/* Transparent Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative flex flex-col w-76 max-w-[85vw] h-full bg-white p-6 shadow-2xl z-50 overflow-y-auto transition-transform duration-300 transform translate-x-0">
            {/* Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 hover:text-black active:scale-95"
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Sidebar inner content */}
            <div className="h-full mt-6">
              <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
