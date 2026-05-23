"use client";
import MainSection from "@/components/MainSection";
import SideBar from "@/components/SideBar";
import BottomNav from "@/components/BottomNav";
import MobileFab from "@/components/MobileFab";

const page = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA] relative">
      <SideBar />
      <MainSection />

      {/* Mobile bottom nav and floating action button */}
      <MobileFab />
      <BottomNav />
    </div>
  );
};

export default page;
