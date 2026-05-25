"use client";
import React from "react";
import Header from "./Header";
import NoAssignment from "./NoAssignment";
import AssignmentGrid from "./AssignmentGrid";
import CreateAssignment from "./CreateAssignment";
import ViewPaper from "./ViewPaper";
import { useUiStore } from "@/store/uiStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Assignment } from "@/store/assignmentStore";

const MainSection = () => {
  const {
    showCreateAssignment,
    setShowCreateAssignment,
    viewPaperAssignmentId,
    setViewPaperAssignmentId,
  } = useUiStore();

  const { data: response, isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const res = await api.get("/api/assignments");
      return res.data;
    },
    refetchInterval: (query) => {
      const list = (query?.state?.data?.data as Assignment[]) || [];
      const hasProcessing = list.some(
        (asm) => asm.status === "PENDING" || asm.status === "PROCESSING"
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const assignments = response?.data || [];

  return (
    <div className="w-full pr-0 md:pr-2 flex flex-col h-screen overflow-y-auto bg-[#F8F9FA]/20 scrollbar-thin">
      <Header />

      {viewPaperAssignmentId ? (
        <ViewPaper
          assignmentId={viewPaperAssignmentId}
          onBack={() => setViewPaperAssignmentId(null)}
        />
      ) : showCreateAssignment ? (
        <CreateAssignment onBack={() => setShowCreateAssignment(false)} />
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[calc(100vh-180px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : assignments.length === 0 ? (
        <NoAssignment />
      ) : (
        <AssignmentGrid assignments={assignments} />
      )}
    </div>
  );
};

export default MainSection;
