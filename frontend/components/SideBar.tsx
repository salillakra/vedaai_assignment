import Image from "next/image";
import VedaaiLogo from "@/assets/images/VedaaiLogo.svg";
import StarIcon from "@/assets/Icons/Star.svg";
import MenuIcon from "@/assets/Icons/menu.svg";
import UsersIcon from "@/assets/Icons/course.svg";
import FileTextIcon from "@/assets/Icons/file.svg";
import PieIcon from "@/assets/Icons/pie.svg";
import ToolKitIcon from "@/assets/Icons/toolkit.svg";
import GearIcon from "@/assets/Icons/gear.svg";

const SideBar = () => {
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
    <div className="min-w-76 min-h-[calc(100vh-200px)] my-3 p-6 mx-3 rounded-2xl bg-white shadow-[0px_16px_48px_0px_#0000001F]">
      <div className="flex h-full flex-col w-62.75 gap-14">
        {/* Logo */}
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

        {/* Create Assignment Button */}
        <button className="h-12.5 cursor-pointer rounded-[100px] p-1 shadow-[0px_32px_48px_0px_#00000033] bg-linear-to-r from-[#FF7950] to-[#C0350A]">
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

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors duration-200 "
            >
              <Image src={link.Icon} alt={link.name} width={20} height={20} />
              <span className="font-(--font-bricolage-grotesque)  text-base leading-[1.4] tracking-[-0.04em] align-middle text-[#5E5E5ECC]">
                {link.name}
              </span>
            </a>
          ))}
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-2 mt-auto">
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors duration-200 "
          >
            <Image
              src={GearIcon}
              alt="Settings"
              width={20}
              height={20}
              className="rotate-90"
            />
            <span className="font-(--font-bricolage-grotesque)  text-base leading-[1.4] tracking-[-0.04em] align-middle text-[#5E5E5ECC]">
              Settings
            </span>
          </a>

          {/* User's Institute */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors duration-200 ">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-[#C4C4C4]">
              <Image
                src="/user_Image.jpg"
                height={50}
                width={50}
                className="object-cover"
                alt="user Image"
              />
            </div>
            <div className="flex flex-col font-(--font-bricolage-grotesque)">
              <span className="text-[16px] leading-[1.4] font-bold tracking-[-0.04em] align-middle text-[#303030]">
                Delhi Public School
              </span>
              <span className="text-[14px] leading-[1.4] tracking-[-0.04em] align-middle text-[#5E5E5E]">
                Bokaro Steel City
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
