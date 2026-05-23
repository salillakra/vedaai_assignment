"use client";
import BackIcon from "@/assets/Icons/back-icon.svg";
import NotificationIcon from "@/assets/Icons/notification-icon.svg";
import DropdownIcon from "@/assets/Icons/drop-down.svg";
import VedaaiLogo from "@/assets/images/VedaaiLogo.svg";
import Image from "next/image";
import { useUiStore } from "@/store/uiStore";
import VedaaiMobileLogo from "@/assets/images/VedaaiMobileLogo.svg";

//Menu Icon
const MenuIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 11.6667H11.6667V17.5H17.5V11.6667Z"
        stroke="#A9A9A9"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.33333 11.6667H2.5V17.5H8.33333V11.6667Z"
        stroke="#A9A9A9"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 2.5H11.6667V8.33333H17.5V2.5Z"
        stroke="#A9A9A9"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z"
        stroke="#A9A9A9"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Header = () => {
  const { toggleMobileSidebar } = useUiStore();

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex bg-white rounded-2xl h-14 shadow-[0px_16px_48px_0px_#0000001F] w-full items-center mt-3 justify-between pl-6 pr-3 select-none">
        <div className="flex items-center gap-6">
          <div>
            <Image src={BackIcon} alt="back icon" className="cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 text-[#A9A9A9]">
            <MenuIcon />
            <span className="text-[16px] leading-[100%] tracking-[-0.04em] align-middle">
              Assignment
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src={NotificationIcon}
              alt="notification icon"
              className="cursor-pointer"
            />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#FF5623] rounded-full"></span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/user_Image.jpg"
              alt="profile picture"
              width={32}
              height={32}
              className="rounded-full h-8 w-8 object-cover cursor-pointer"
            />
            <div className="flex font-(--font-bricolage-grotesque) items-center gap-0.5">
              <span className="font-medium text-[16px] leading-[100%] tracking-[-0.04em] align-middle">
                John Doe
              </span>
              <Image
                src={DropdownIcon}
                alt="dropdown icon"
                className="cursor-pointer inline-block ml-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex mt-4.5 mx-4 py-1.5 rounded-2xl shadow-sm h-14 px-3 md:hidden bg-white border-b border-gray-100 items-center justify-between sticky top-0 z-40">
        {/* Left: VedaAI Logo */}
        <div className="flex items-center h-10">
          <Image
            src={VedaaiMobileLogo}
            alt="VedaAI Logo"
            width={50}
            height={50}
            className="h-7 w-auto"
            priority
          />
        </div>

        {/* Right: Notifications, Avatar, Hamburger */}
        <div className="flex items-center gap-3">
          {/* Notification bell inside a rounded light gray circle */}
          <div className="relative h-10 w-10 flex items-center justify-center bg-[#F4F4F4] rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
            <Image
              src={NotificationIcon}
              alt="notification icon"
              width={20}
              height={20}
            />
            {/* Orange-Red badge dot */}
            <span className="absolute top-2.5 right-2.75 h-2.5 w-2.5 bg-[#FF5623] rounded-full border border-white"></span>
          </div>

          {/* User profile picture */}
          <Image
            src="/user_Image.jpg"
            alt="profile picture"
            width={40}
            height={40}
            className="rounded-full h-10 w-10 object-cover cursor-pointer border border-gray-200"
          />

          {/* Hamburger Menu Icon */}
          <button
            onClick={toggleMobileSidebar}
            className="h-10 w-10 flex items-center justify-center cursor-pointer text-black hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Open navigation menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="black"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
