"use client";
import { useState, useEffect, useRef } from "react";
import { useAssignmentStore, Assignment } from "@/store/assignmentStore";
import { useUiStore } from "@/store/uiStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { io, Socket } from "socket.io-client";

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

const AssignmentCard = ({
  assignment,
  socketStatus,
  onClearSocketStatus,
}: {
  assignment: Assignment;
  socketStatus?: { status: string; message: string; pdfUrl?: string };
  onClearSocketStatus?: (id: string) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const { setViewPaperAssignmentId } = useUiStore();

  const getFullPdfUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/assignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/assignments/${id}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      onClearSocketStatus?.(assignment.id);
    },
  });

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

  const currentStatus = socketStatus?.status || assignment.status;
  const currentMessage = socketStatus?.message || "";
  const pdfUrl = socketStatus?.pdfUrl || assignment.paper?.pdfUrl;

  const assignedDateFormatted = assignment.createdAt
    ? new Date(assignment.createdAt)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-")
    : "today";

  const dueDateFormatted = assignment.dueDate
    ? new Date(assignment.dueDate)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-")
    : "no due date";

  return (
    <div
      onClick={() => {
        if (currentStatus === "COMPLETED") {
          setViewPaperAssignmentId(assignment.id);
        }
      }}
      className={`relative h-44.5 bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-[0px_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0px_12px_32px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 ${
        currentStatus === "COMPLETED" ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg md:text-xl leading-[1.3] tracking-tight">
            {assignment.title}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2 items-center">
            {currentStatus === "PENDING" && (
              <span className="text-[10px] font-semibold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                pending
              </span>
            )}
            {currentStatus === "PROCESSING" && (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                <span className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-ping"></span>
                <span className="text-[10px] font-semibold">
                  {currentMessage || "processing"}
                </span>
              </div>
            )}
            {currentStatus === "FAILED" && (
              <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                failed
              </span>
            )}
            {currentStatus === "COMPLETED" && (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                ready
              </span>
            )}
          </div>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle action menu"
          >
            <ThreeDotIcon />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
              {currentStatus === "COMPLETED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewPaperAssignmentId(assignment.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-(--font-bricolage-grotesque) text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  View Paper
                </button>
              )}
              {pdfUrl && (
                <a
                  href={getFullPdfUrl(pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hidden md:block px-4 py-2 text-xs font-(--font-bricolage-grotesque) text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Download PDF
                </a>
              )}
              {currentStatus === "FAILED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    retryMutation.mutate(assignment.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-(--font-bricolage-grotesque) text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Retry Generation
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(assignment.id);
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

      {pdfUrl && (
        <a
          href={getFullPdfUrl(pdfUrl)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hidden md:flex absolute right-6 bottom-5 items-center justify-center bg-black/85 text-white hover:bg-black rounded-full px-4 py-1.5 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          Download PDF
        </a>
      )}

      <div className="flex absolute bottom-5 justify-between flex-wrap items-center gap-x-4 gap-y-1 mt-8 md:mt-12 font-(--font-bricolage-grotesque) text-[11px] md:text-[13px] tracking-tight text-[#A9A9A9]">
        <span>
          <strong className="text-gray-700">Assigned on:</strong>{" "}
          {assignedDateFormatted}
        </span>
        <span>
          <strong className="text-gray-700">Due:</strong> {dueDateFormatted}
        </span>
        {pdfUrl && (
          <a
            href={getFullPdfUrl(pdfUrl)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="md:hidden flex items-center justify-center bg-black/85 text-white hover:bg-black rounded-full px-3 py-1 text-[10px] font-semibold active:scale-95 transition-all cursor-pointer"
          >
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
};

const AssignmentGrid = ({ assignments }: { assignments: Assignment[] }) => {
  const { searchQuery, setSearchQuery } = useAssignmentStore();
  const { setShowCreateAssignment } = useUiStore();
  const queryClient = useQueryClient();
  const [socketStatuses, setSocketStatuses] = useState<
    Record<string, { status: string; message: string; pdfUrl?: string }>
  >({});
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.io connection once on mount
  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001",
      {
        transports: ["websocket"],
      },
    );
    socketRef.current = socket;

    socket.on(
      "assignment:status",
      (data: {
        assignmentId: string;
        status: string;
        message: string;
        pdfUrl?: string;
      }) => {
        setSocketStatuses((prev) => ({
          ...prev,
          [data.assignmentId]: {
            status: data.status,
            message: data.message,
            pdfUrl: data.pdfUrl,
          },
        }));

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
          }, 1000);
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // Dynamically join rooms as assignments change, or when socket connects
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const joinAll = () => {
      assignments.forEach((assignment) => {
        socket.emit("join:assignment", assignment.id);
      });
    };

    if (socket.connected) {
      joinAll();
    } else {
      socket.on("connect", joinAll);
    }

    return () => {
      socket.off("connect", joinAll);
    };
  }, [assignments]);

  const filteredAssignments = assignments.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-16 flex flex-col flex-1 select-none">
      <div className="flex flex-col gap-1 mt-2 md:mt-4">
        <div className="flex items-center gap-2">
          <span className="relative hidden md:flex h-3 w-3 shrink-0 items-center justify-center">
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

      <div className="flex items-center justify-between mt-6 bg-white px-4 py-2 rounded-2xl gap-3">
        <button className="flex items-center gap-1 w-fit px-2 py-2 md:px-4 md:py-2 rounded-full hover:bg-gray-50 active:scale-95 transition-all text-xs  text-[#A9A9A9] cursor-pointer">
          <FilterIcon />
          <span className="text-xs text-nowrap md:text-sm">Filter By</span>
        </button>

        <div className="relative w-full sm:w-64 max-w-sm">
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs md:text-sm font-(--font-bricolage-grotesque) focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-all bg-white text-gray-700"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <SearchIcon />
          </div>
        </div>
      </div>

      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:gap-3 mt-6 md:mt-8 flex-1">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              socketStatus={socketStatuses[assignment.id]}
              onClearSocketStatus={(id) => {
                setSocketStatuses((prev) => {
                  const updated = { ...prev };
                  delete updated[id];
                  return updated;
                });
              }}
            />
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

      <div
        className="hidden md:flex sticky bottom-0 z-30 justify-center items-end w-full pointer-events-none mt-auto pb-6"
        style={{
          background:
            "linear-gradient(to top, #F8F9FA 30%, rgba(248,249,250,0.8) 60%, rgba(248,249,250,0) 100%)",
          height: "120px",
        }}
      >
        <button
          onClick={() => setShowCreateAssignment(true)}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-black/85 text-white hover:bg-black active:scale-95 transition-all rounded-full text-xs font-semibold border border-white/10 cursor-pointer shadow-[0px_8px_24px_rgba(0,0,0,0.2)]"
        >
          <span className="text-lg leading-none font-light">+</span>
          Create Assignment
        </button>
      </div>
    </div>
  );
};

export default AssignmentGrid;
