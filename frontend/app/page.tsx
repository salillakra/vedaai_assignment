import MainSection from "@/components/MainSection";
import SideBar from "@/components/SideBar";

const page = () => {
  return (
    <div className="flex h-screen w-screen">
      <SideBar />
      <MainSection />
    </div>
  );
};

export default page;
