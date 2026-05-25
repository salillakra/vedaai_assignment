"use client";
import React, { useState } from "react";
import { ArrowLeftIcon, DownloadIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Question {
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  marks: number;
  options?: string[];
  type?: string;
  answer?: string;
}

interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

interface QuestionPaper {
  id: string;
  assignmentId: string;
  sections: Section[];
  pdfUrl?: string | null;
}

const ViewPaper = ({
  assignmentId,
  onBack,
}: {
  assignmentId: string;
  onBack: () => void;
}) => {
  const [studentName, setStudentName] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [studentSection, setStudentSection] = useState("");

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["paper", assignmentId],
    queryFn: async () => {
      const res = await api.get(`/api/papers/assignment/${assignmentId}`);
      return res.data;
    },
    enabled: !!assignmentId,
  });

  const paper: QuestionPaper | undefined = response?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[calc(100vh-180px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="text-sm text-[#5E5E5ECC] mt-4 font-(--font-bricolage-grotesque)">
          Loading generated paper...
        </span>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[calc(100vh-180px)] p-6 text-center select-none">
        <div className="text-gray-400 font-(--font-bricolage-grotesque) text-base">
          Question paper is currently being generated or not found.
        </div>
        <p className="text-[#5E5E5ECC] font-(--font-bricolage-grotesque) text-xs mt-2 max-w-sm">
          Please make sure the background worker is finished and the assignment
          generation status has completed successfully.
        </p>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mt-6 px-5 py-2 border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer bg-white"
        >
          <ArrowLeftIcon size={14} />
          Go Back
        </button>
      </div>
    );
  }

  const getFullPdfUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="w-full flex flex-col flex-1 px-4 md:px-8 py-6 select-none max-w-4xl mx-auto pb-24 md:pb-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer bg-white shadow-sm"
        >
          <ArrowLeftIcon size={14} />
          Dashboard
        </button>

        {paper.pdfUrl && (
          <a
            href={getFullPdfUrl(paper.pdfUrl)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-5 py-2 bg-black text-white hover:bg-black/90 rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <DownloadIcon size={14} />
            Download PDF
          </a>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-12 shadow-[0px_16px_48px_rgba(0,0,0,0.03)] font-sans">
        <div className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">
          VedaAI Education Assessment Engine
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A365D] tracking-tight">
            Question Paper
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">
            ID: {paper.id.substring(0, 8)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 mb-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Student Name
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-gray-900 bg-transparent text-sm text-gray-700 focus:outline-none pb-1 font-medium transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Roll Number
            </label>
            <input
              type="text"
              placeholder="Enter roll number"
              value={studentRoll}
              onChange={(e) => setStudentRoll(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-gray-900 bg-transparent text-sm text-gray-700 focus:outline-none pb-1 font-medium transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Section
            </label>
            <input
              type="text"
              placeholder="Enter section"
              value={studentSection}
              onChange={(e) => setStudentSection(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-gray-900 bg-transparent text-sm text-gray-700 focus:outline-none pb-1 font-medium transition-colors"
            />
          </div>
        </div>

        <div className="border-b-2 border-dashed border-gray-200 my-8"></div>

        <div className="flex flex-col gap-8">
          {paper.sections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-4">
              <div className="border-l-4 border-[#1A365D] pl-4">
                <h2 className="text-lg font-bold text-[#1A365D]">
                  {section.title}
                </h2>
                <p className="text-xs text-gray-500 italic mt-0.5">
                  {section.instruction}
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {section.questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-gray-50 hover:border-gray-100 hover:bg-gray-50/30 rounded-2xl transition-all"
                  >
                    <div className="flex-1 w-full">
                      <div className="text-sm font-medium text-gray-800 leading-relaxed">
                        <span className="font-bold text-gray-900 mr-2">
                          {qIdx + 1}.
                        </span>
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: "span",
                            code({
                              children,
                              className,
                              ...rest
                            }: {
                              children?: React.ReactNode;
                              className?: string;
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || "",
                              );
                              const lang = match ? match[1] : "";
                              const value = String(children).replace(/\n$/, "");

                              if (lang === "mermaid") {
                                const base64 = btoa(
                                  unescape(encodeURIComponent(value)),
                                )
                                  .replace(/\+/g, "-")
                                  .replace(/\//g, "_")
                                  .replace(/=+$/, "");
                                const url = `https://mermaid.ink/svg/${base64}`;

                                return (
                                  <span className="my-4 flex flex-col items-center gap-2 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl w-full select-none">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                                      Diagram
                                    </span>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={url}
                                      alt="Mermaid Diagram"
                                      className="h-48 w-auto rounded-lg shadow-sm bg-white p-2 border border-gray-100"
                                    />
                                  </span>
                                );
                              }

                              const isInline = !className;
                              return isInline ? (
                                <code
                                  className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono font-semibold text-gray-800"
                                  {...rest}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-gray-50 p-4 border border-gray-100 rounded-2xl overflow-x-auto text-xs font-mono my-2 text-gray-800 w-full block">
                                  <code className={className} {...rest}>
                                    {children}
                                  </code>
                                </pre>
                              );
                            },
                          }}
                        >
                          {q.question}
                        </ReactMarkdown>

                        {(() => {
                          const isMCQ =
                            q.type?.toLowerCase().includes("multiple choice") ||
                            q.type?.toLowerCase().includes("mcq") ||
                            section.title
                              ?.toLowerCase()
                              .includes("multiple choice") ||
                            section.title?.toLowerCase().includes("mcq");
                          return isMCQ && q.options && q.options.length > 0 ? (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                              {q.options.map((opt, optIdx) => {
                                const label = String.fromCharCode(65 + optIdx); // A, B, C, D
                                return (
                                  <div
                                    key={optIdx}
                                    className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold bg-gray-50/50 p-2.5 border border-gray-100/80 rounded-xl hover:bg-gray-50 transition-colors"
                                  >
                                    <span className="w-5.5 h-5.5 flex items-center justify-center rounded-lg bg-[#1A365D]/10 text-[#1A365D] font-bold shrink-0 select-none text-[10px] uppercase">
                                      {label}
                                    </span>
                                    <span className="leading-normal">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                      >
                                        {opt}
                                      </ReactMarkdown>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {q.difficulty === "EASY" && (
                        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-100 select-none">
                          easy
                        </span>
                      )}
                      {q.difficulty === "MEDIUM" && (
                        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md border bg-amber-50 text-amber-700 border-amber-100 select-none">
                          moderate
                        </span>
                      )}
                      {q.difficulty === "HARD" && (
                        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md border bg-red-50 text-red-700 border-red-100 select-none">
                          hard
                        </span>
                      )}

                      <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-100 select-none">
                        {q.marks} marks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewPaper;
