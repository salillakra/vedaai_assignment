import BackIcon from "@/assets/Icons/back-icon.svg";
import NotificationIcon from "@/assets/Icons/notification-icon.svg";
import DropdownIcon from "@/assets/Icons/drop-down.svg";
import Image from "next/image";

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
  return (
    <div className="flex rounded-2xl h-14 shadow-[0px_16px_48px_0px_#0000001F] w-full items-center mt-3 justify-between pl-6 pr-3">
      <div className="flex items-center gap-6">
        <div>
          <Image src={BackIcon} alt="back icon" className="cursor-pointer" />
        </div>
        <div className="flex items-center gap-1 text-[#A9A9A9]">
          <MenuIcon />
          <span className="font-(--font-bricolage-grotesque) text-[16px] leading-[100%] tracking-[-0.04em] align-middle">
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
  );
};

export default Header;
