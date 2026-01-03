"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/questionnaire";

const NEW_USER_STORAGE_KEY = "harada.newUser";

// Modal questions - easy to add or remove questions here
const MODAL_QUESTIONS = [
  "Are you already familiar with the Harada Method?",
  "Do you know what large goal you want to achieve?",
];

type Props = {
  questions: Question[];
};

type Answers = Record<string, string | number | null>;

function initAnswers(questions: Question[]): Answers {
  const a: Answers = {};
  for (const q of questions) {
    a[q.id] = q.type === "number" ? null : "";
  }
  return a;
}

export default function QuestionnaireForm({ questions }: Props) {
  const [answers, setAnswers] = useState<Answers>(() => initAnswers(questions));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentModalQuestionIndex, setCurrentModalQuestionIndex] = useState(0);
  const [modalAnswers, setModalAnswers] = useState<Record<number, string>>({});
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  const requiredIds = useMemo(
    () => new Set(questions.filter(q => q.required).map(q => q.id)),
    [questions]
  );

  // Check if this is a new user
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const newUser = !window.localStorage.getItem(NEW_USER_STORAGE_KEY);
      setIsNewUser(newUser);
      if (newUser) {
        console.log("Welcome to the Harada Method!");
      } else {
        console.log("Thanks for returning to the Harada Method!");
      }
    } catch (error) {
      console.error("Error checking new user status:", error);
    }
  }, []);

  function handleModalAnswer(questionIndex: number, answer: string) {
    setModalAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  }

  function handleModalNext() {
    const isLastQuestion = currentModalQuestionIndex === MODAL_QUESTIONS.length - 1;
    const allQuestionsAnswered = Object.keys(modalAnswers).length === MODAL_QUESTIONS.length;
    
    if (!isLastQuestion) {
      setCurrentModalQuestionIndex((prev) => prev + 1);
    } else if (isLastQuestion && allQuestionsAnswered) {
      // User has answered all questions and clicked "Next" on the final question
      setHasCompletedQuestionnaire(true);
      setIsNewUser(false);
    }
  }

  // Effect to save to localStorage only when questionnaire is completed
  useEffect(() => {
    if (hasCompletedQuestionnaire) {
      try {
        window.localStorage.setItem(NEW_USER_STORAGE_KEY, "false");
        console.log("Questionnaire completed! User is no longer new.");
      } catch (error) {
        console.error("Error saving user completion status:", error);
      }
    }
  }, [hasCompletedQuestionnaire]);

  function handleModalBack() {
    if (currentModalQuestionIndex > 0) {
      setCurrentModalQuestionIndex((prev) => prev - 1);
    }
  }

  const currentAnswer = modalAnswers[currentModalQuestionIndex];
  const canGoForward = currentAnswer !== undefined;
  const canGoBack = currentModalQuestionIndex > 0;

  function setValue(id: string, value: string | number | null) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function isMissingRequired(): string[] {
    const missing: string[] = [];
    for (const id of requiredIds) {
      const v = answers[id];
      if (v === null) missing.push(id);
      if (typeof v === "string" && v.trim().length === 0) missing.push(id);
    }
    return Array.from(new Set(missing));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = isMissingRequired();
    if (missing.length > 0) {
      alert(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching recommendations");
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePdf() {
    if (!results) return;

    setGeneratingPdf(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendations: results,
          location_country: answers.location_country,
          location_state: answers.location_state,
          location_city: answers.location_city,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate PDF: ${response.statusText}`);
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "recommendations.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Get the PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download with correct filename
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Also open in new tab for viewing
      window.open(url, "_blank");

      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred while generating the PDF");
      console.error("Error generating PDF:", err);
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <>
      {isNewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#7a0f0f] text-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">
              {MODAL_QUESTIONS[currentModalQuestionIndex]}
            </h2>

            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`modal-question-${currentModalQuestionIndex}`}
                  value="yes"
                  checked={currentAnswer === "yes"}
                  onChange={(e) => handleModalAnswer(currentModalQuestionIndex, e.target.value)}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`modal-question-${currentModalQuestionIndex}`}
                  value="no"
                  checked={currentAnswer === "no"}
                  onChange={(e) => handleModalAnswer(currentModalQuestionIndex, e.target.value)}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleModalBack}
                disabled={!canGoBack}
                className={`flex items-center gap-2 px-4 py-2 rounded ${canGoBack
                    ? "bg-white text-[#7a0f0f] hover:bg-gray-100"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back
              </button>

              {canGoForward && (
                <button
                  type="button"
                  onClick={handleModalNext}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-white text-[#7a0f0f] hover:bg-gray-100"
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Harada Method</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <label className="block text-sm font-medium" htmlFor={q.id}>
                {q.label} {q.required ? <span className="text-red-500">*</span> : null}
              </label>

              {q.helpText ? (
                <p className="text-xs text-gray-600">{q.helpText}</p>
              ) : null}

              {q.type === "select" ? (
                <select
                  id={q.id}
                  className="w-full rounded-md border px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setValue(q.id, e.target.value)}
                  disabled={loading || generatingPdf}
                >
                  <option value="">Select…</option>
                  {(q.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : q.type === "radio" ? (
                <div className="space-y-2">
                  {(q.options ?? []).map((opt) => (
                    <label
                      key={opt.value}
                      htmlFor={`${q.id}-${opt.value}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        id={`${q.id}-${opt.value}`}
                        name={q.id}
                        value={opt.value}
                        checked={(answers[q.id] as string) === opt.value}
                        onChange={(e) => setValue(q.id, e.target.value)}
                        disabled={loading || generatingPdf}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              ) : q.type === "textarea" ? (
                <textarea
                  id={q.id}
                  className="w-full rounded-md border px-3 py-2 min-h-28 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={q.placeholder ?? ""}
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setValue(q.id, e.target.value)}
                  disabled={loading || generatingPdf}
                />
              ) : (
                <input
                  id={q.id}
                  className="w-full rounded-md border px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type={q.type}
                  placeholder={q.placeholder ?? ""}
                  min={q.type === "number" ? q.min : undefined}
                  max={q.type === "number" ? q.max : undefined}
                  value={
                    q.type === "number"
                      ? (answers[q.id] ?? "")?.toString()
                      : ((answers[q.id] as string) ?? "")
                  }
                  onChange={(e) => {
                    if (q.type === "number") {
                      const raw = e.target.value;
                      setValue(q.id, raw === "" ? null : Number(raw));
                    } else {
                      setValue(q.id, e.target.value);
                    }
                  }}
                  disabled={loading || generatingPdf}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || generatingPdf}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>

        {loading && (
          <div className="mt-6">
            <p className="text-sm text-gray-600">Loading results...</p>
          </div>
        )}

        {error && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-red-600">Error</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        )}

        {results && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Recommendations</h2>
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                {generatingPdf ? "Generating PDF..." : "Generate PDF results!"}
              </button>
            </div>
            <pre className="mt-2 rounded-md bg-gray-50 border p-3 text-xs overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}

