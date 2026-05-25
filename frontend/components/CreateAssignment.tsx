"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  UploadIcon,
  CalendarIcon,
  MicrophoneIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface QuestionType {
  id: string;
  name: string;
  numQuestions: number;
  marks: number;
}

const QUESTION_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "True/False Questions",
  "Fill in the Blanks",
];

const DEFAULT_QUESTION_TYPES: QuestionType[] = [
  { id: "1", name: "Multiple Choice Questions", numQuestions: 4, marks: 1 },
  { id: "2", name: "Short Questions", numQuestions: 3, marks: 2 },
  { id: "3", name: "Diagram/Graph-Based Questions", numQuestions: 5, marks: 5 },
  { id: "4", name: "Numerical Problems", numQuestions: 5, marks: 5 },
];

// Zod validation schema for instant feedback
const assignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Assignment title is required" })
    .max(100, { message: "Title must be less than 100 characters" }),
  dueDate: z
    .any()
    .refine((val) => val instanceof Date, { message: "Due date is required" })
    .refine(
      (date) => {
        if (!(date instanceof Date)) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      { message: "Due date must be today or in the future" }
    ),
  questionTypes: z
    .array(
      z.object({
        name: z.string().min(1),
        numQuestions: z
          .number()
          .int()
          .positive({ message: "Questions must be greater than zero" }),
        marks: z
          .number()
          .int()
          .positive({ message: "Marks must be greater than zero" }),
      })
    )
    .min(1, { message: "At least one question type is required" }),
});

type FormErrors = {
  title?: string;
  dueDate?: string;
  questionTypes?: string;
};

const CreateAssignment = ({ onBack }: { onBack: () => void }) => {
  const [title, setTitle] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(
    DEFAULT_QUESTION_TYPES
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFileName, setSelectedFileName] = useState("");
  const [tempFilePath, setTempFilePath] = useState("");
  const [tempFilename, setTempFilename] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const queryClient = useQueryClient();

  // Instant validation logic on every state change
  useEffect(() => {
    const payload = {
      title,
      dueDate,
      questionTypes: questionTypes.map((qt) => ({
        name: qt.name,
        numQuestions: qt.numQuestions,
        marks: qt.marks,
      })),
    };

    const result = assignmentSchema.safeParse(payload);
    if (result.success) {
      setErrors({});
    } else {
      const newErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "title") {
          newErrors.title = issue.message;
        } else if (path === "dueDate") {
          newErrors.dueDate = issue.message;
        } else if (path === "questionTypes") {
          newErrors.questionTypes = "Every question type must have positive questions and marks values.";
        }
      });
      setErrors(newErrors);
    }
  }, [title, dueDate, questionTypes]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/assignments/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setTempFilePath(data.filePath);
        setTempFilename(data.filename);
        setUploadedUrl(data.url);
      }
    },
    onError: () => {
      alert("failed to upload file");
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      instructions?: string;
      dueDate?: string;
      numberOfQuestions: number;
      totalMarks: number;
      questionTypes: string[];
      fileUrl?: string;
      tempFilePath?: string;
      tempFilename?: string;
    }) => {
      const res = await api.post("/api/assignments", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      onBack();
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "failed to create assignment");
    },
  });

  const handleMicClick = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          stream.getTracks().forEach((track) => track.stop());

          try {
            const { puter } = await import("@heyputer/puter.js");
            const result = await puter.ai.speech2txt(audioBlob);
            const text = typeof result === "string" ? result : (result as { text?: string })?.text || "";
            if (text) {
              setAdditionalInfo((prev) => (prev ? prev + " " + text : text));
            }
          } catch (err) {
            console.error("speech transcription error:", err);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("failed to access microphone:", err);
        alert("could not access microphone");
      }
    }
  };

  const totalQuestions = questionTypes.reduce(
    (sum, qt) => sum + qt.numQuestions,
    0
  );
  const totalMarks = questionTypes.reduce(
    (sum, qt) => sum + qt.numQuestions * qt.marks,
    0
  );

  const updateQuestionType = (
    id: string,
    field: "numQuestions" | "marks",
    delta: number
  ) => {
    setQuestionTypes((prev) =>
      prev.map((qt) =>
        qt.id === id ? { ...qt, [field]: Math.max(0, qt[field] + delta) } : qt
      )
    );
  };

  const removeQuestionType = (id: string) => {
    setQuestionTypes((prev) => prev.filter((qt) => qt.id !== id));
  };

  const addQuestionType = () => {
    setQuestionTypes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9),
        name: "Multiple Choice Questions",
        numQuestions: 1,
        marks: 1,
      },
    ]);
  };

  const changeQuestionName = (id: string, name: string) => {
    setQuestionTypes((prev) =>
      prev.map((qt) => (qt.id === id ? { ...qt, name } : qt))
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      uploadMutation.mutate(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      uploadMutation.mutate(file);
    }
  };

  const handleSubmit = () => {
    setTouched({ title: true, dueDate: true, questionTypes: true });

    const payload = {
      title,
      dueDate,
      questionTypes: questionTypes.map((qt) => ({
        name: qt.name,
        numQuestions: qt.numQuestions,
        marks: qt.marks,
      })),
    };

    const validationResult = assignmentSchema.safeParse(payload);
    if (!validationResult.success) {
      return;
    }

    const types = questionTypes.map(
      (qt) => `${qt.name} (count: ${qt.numQuestions}, marks per question: ${qt.marks})`
    );

    createMutation.mutate({
      title,
      instructions: additionalInfo,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      numberOfQuestions: totalQuestions,
      totalMarks,
      questionTypes: types,
      fileUrl: uploadedUrl || undefined,
      tempFilePath: tempFilePath || undefined,
      tempFilename: tempFilename || undefined,
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="w-full flex flex-col flex-1 select-none">
      <div className="w-full px-4 md:px-8 pt-4 md:pt-6 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="relative hidden md:flex h-3 w-3 shrink-0 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40"></span>
            <span className="absolute -inset-0.5 rounded-full border border-emerald-300 opacity-30"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <h2 className="font-semibold text-gray-800 text-xl md:text-2xl leading-[100%] tracking-tight">
            Create Assignment
          </h2>
        </div>
        <p className="text-xs md:text-sm text-[#5E5E5ECC] mt-0.5 tracking-tight">
          Set up a new assignment for your students
        </p>
      </div>

      <div className="w-full px-4 md:px-8 mt-5">
        <div className="flex items-center gap-0">
          <div className="h-0.75 flex-1 bg-[#303030] rounded-full"></div>
          <div className="h-0.75 flex-1 bg-[#E5E5E5] rounded-full ml-2"></div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 mt-6 md:mt-8 pb-32 md:pb-8 flex-1">
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.04)]">
          <h3 className="font-bold text-gray-800 text-base md:text-lg tracking-tight">
            Assignment Details
          </h3>
          <p className="text-xs text-[#A9A9A9] mt-0.5 tracking-tight">
            Basic information about your assignment
          </p>

          <div
            className={`mt-5 md:mt-6 border-2 border-dashed rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-2 transition-colors ${
              dragActive
                ? "border-gray-400 bg-gray-50"
                : "border-[#E0E0E0] bg-[#FAFAFA]"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon size={32} />
            <p className="text-sm text-gray-700 font-medium mt-1 text-center">
              {uploadMutation.isPending
                ? "Uploading..."
                : selectedFileName
                ? `Selected: ${selectedFileName}`
                : "Choose a file or drag & drop it here"}
            </p>
            <p className="text-xs text-[#A9A9A9]">PDF, images, upto 10MB</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-5 py-2 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-[#A9A9A9] text-center mt-3 tracking-tight">
            Upload images or PDF documents of your preferred source material
          </p>

          <div className="mt-6">
            <label className="font-bold text-gray-800 text-sm tracking-tight">
              Assignment Title
            </label>
            <input
              type="text"
              placeholder="e.g. Quiz on Electricity"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTouched((prev) => ({ ...prev, title: true }));
              }}
              className={`w-full px-4 py-3 border rounded-full text-sm text-gray-700 focus:outline-none focus:ring-1 transition-all bg-white mt-2 ${
                touched.title && errors.title
                  ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:border-gray-400 focus:ring-gray-300"
              }`}
            />
            {touched.title && errors.title && (
              <p className="text-red-500 text-[11px] font-semibold mt-1.5 pl-3">
                {errors.title}
              </p>
            )}
          </div>

          <div className="mt-6">
            <label className="font-bold text-gray-800 text-sm tracking-tight block">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger
                render={(triggerProps) => (
                  <button
                    type="button"
                    {...triggerProps}
                    className={`w-full px-4 py-3 border rounded-full text-sm text-gray-700 focus:outline-none focus:ring-1 transition-all bg-white mt-2 flex items-center justify-between cursor-pointer ${
                      touched.dueDate && errors.dueDate
                        ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                        : "border-gray-200 focus:border-gray-400 focus:ring-gray-300"
                    }`}
                    onClick={(e) => {
                      setTouched((prev) => ({ ...prev, dueDate: true }));
                      triggerProps.onClick?.(e);
                    }}
                  >
                    <span className={dueDate ? "text-gray-800" : "text-gray-400"}>
                      {dueDate ? format(dueDate, "dd-MM-yyyy") : "Select due date"}
                    </span>
                    <CalendarIcon size={18} className="text-gray-400" />
                  </button>
                )}
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => setDueDate(date)}
                  disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                />
              </PopoverContent>
            </Popover>
            {touched.dueDate && errors.dueDate && (
              <p className="text-red-500 text-[11px] font-semibold mt-1.5 pl-3">
                {errors.dueDate}
              </p>
            )}
          </div>

          <div className="mt-6 md:mt-8">
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 mb-3">
              <span className="font-bold text-gray-800 text-sm tracking-tight">
                Question Type
              </span>
              <span className="text-xs text-[#A9A9A9] w-28 text-center">
                No. of Questions
              </span>
              <span className="text-xs text-[#A9A9A9] w-20 text-center">
                Marks
              </span>
              <span className="w-5"></span>
            </div>
            <span className="md:hidden font-bold text-gray-800 text-sm tracking-tight block mb-4">
              Question Type
            </span>

            <div className="flex flex-col gap-3 md:gap-2.5">
              {questionTypes.map((qt) => (
                <React.Fragment key={qt.id}>
                  <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4">
                    <Select
                      value={qt.name}
                      onValueChange={(val) => val && changeQuestionName(qt.id, val)}
                    >
                      <SelectTrigger className="flex-1 w-full rounded-full border border-gray-200 px-4 py-2.5 h-auto text-sm text-gray-700 bg-white shadow-none focus:ring-0 focus:outline-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center border border-gray-200 rounded-full w-28">
                      <button
                        onClick={() =>
                          updateQuestionType(qt.id, "numQuestions", -1)
                        }
                        className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-sm font-medium text-gray-700">
                        {qt.numQuestions}
                      </span>
                      <button
                        onClick={() =>
                          updateQuestionType(qt.id, "numQuestions", 1)
                        }
                        className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center border border-gray-200 rounded-full w-20">
                      <button
                        onClick={() => updateQuestionType(qt.id, "marks", -1)}
                        className="px-2.5 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-sm font-medium text-gray-700">
                        {qt.marks}
                      </span>
                      <button
                        onClick={() => updateQuestionType(qt.id, "marks", 1)}
                        className="px-2.5 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeQuestionType(qt.id)}
                      className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="md:hidden bg-[#FAFAFA] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <Select
                          value={qt.name}
                          onValueChange={(val) => val && changeQuestionName(qt.id, val)}
                        >
                          <SelectTrigger className="w-full rounded-full border border-gray-200 px-4 py-2 h-auto text-sm text-gray-700 bg-white shadow-none focus:ring-0 focus:outline-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        onClick={() => removeQuestionType(qt.id)}
                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer ml-2 shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-[#A9A9A9] block mb-1.5">
                          No. of Questions
                        </span>
                        <div className="flex items-center border border-gray-200 rounded-full bg-white">
                          <button
                            onClick={() =>
                              updateQuestionType(qt.id, "numQuestions", -1)
                            }
                            className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-sm font-medium text-gray-700">
                            {qt.numQuestions}
                          </span>
                          <button
                            onClick={() =>
                              updateQuestionType(qt.id, "numQuestions", 1)
                            }
                            className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#A9A9A9] block mb-1.5">
                          Marks
                        </span>
                        <div className="flex items-center border border-gray-200 rounded-full bg-white">
                          <button
                            onClick={() =>
                              updateQuestionType(qt.id, "marks", -1)
                            }
                            className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-sm font-medium text-gray-700">
                            {qt.marks}
                          </span>
                          <button
                            onClick={() => updateQuestionType(qt.id, "marks", 1)}
                            className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={addQuestionType}
              className="flex items-center gap-2 mt-4 cursor-pointer group"
            >
              <span className="h-8 w-8 rounded-full bg-[#F4F4F4] flex items-center justify-center text-gray-500 group-hover:bg-gray-200 transition-colors text-lg leading-none">
                +
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Add Question Type
              </span>
            </button>

            {touched.questionTypes && errors.questionTypes && (
              <p className="text-red-500 text-[11px] font-semibold mt-3 pl-3">
                {errors.questionTypes}
              </p>
            )}

            <div className="flex flex-col items-end mt-4 gap-0.5">
              <span className="text-sm text-gray-700">
                <span className="font-semibold">Total Questions :</span>{" "}
                {totalQuestions}
              </span>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">Total Marks :</span>{" "}
                {totalMarks}
              </span>
            </div>
          </div>

          <div className="mt-6 md:mt-8">
            <label className="font-bold text-gray-800 text-sm tracking-tight">
              Additional Information (For better output)
            </label>
            <div className="relative mt-2">
              <textarea
                placeholder="e.g. Generate a question paper for a 3-hour exam duration..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-all bg-[#FAFAFA] resize-none pr-10"
              />
              <button
                type="button"
                onClick={handleMicClick}
                className={`absolute right-4 bottom-4 cursor-pointer p-1.5 rounded-full transition-all duration-200 ${
                  isRecording
                    ? "text-red-500 bg-red-50 animate-pulse scale-110"
                    : "text-[#A9A9A9] hover:text-gray-600 hover:bg-gray-100"
                }`}
                title={isRecording ? "Stop recording" : "Record audio"}
              >
                <MicrophoneIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 md:mt-8 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer bg-white"
          >
            <ArrowLeftIcon size={14} />
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || hasErrors}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm font-medium hover:bg-black active:scale-95 transition-all cursor-pointer shadow-[0px_4px_12px_rgba(0,0,0,0.15)] disabled:opacity-50"
          >
            {createMutation.isPending ? "Generating..." : "Next"}
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
