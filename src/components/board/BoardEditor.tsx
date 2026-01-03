"use client";

import { useEffect, useMemo, useState } from "react";
import BoardGrid from "@/components/board/BoardGrid";
import { BOARD_COLS, BOARD_ROWS, defaultBoardCells, makeDefaultValues as clearBoard } from "./layout";
import type { CellVariant } from "@/lib/board-types";

const BOARD_DATA_STORAGE_KEY = "harada.board.v1";
const NEW_USER_STORAGE_KEY = "harada.newUser";

// Modal questions - easy to add or remove questions here
const MODAL_QUESTIONS = [
  "Are you already familiar with the Harada Method?",
  "Do you know what large goal you want to achieve?",
];

export default function BoardEditor() {
  const defaults = useMemo(() => clearBoard(), []);

  const [values, setValues] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const raw = window.localStorage.getItem(BOARD_DATA_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Record<string, string>;
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  });

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentModalQuestionIndex, setCurrentModalQuestionIndex] = useState(0);
  const [modalAnswers, setModalAnswers] = useState<Record<number, string>>({});
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState("");
  const [isLoadingHelp, setIsLoadingHelp] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Check if this is a new user (has never opened the app before)
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

  useEffect(() => {
    try {
      window.localStorage.setItem(BOARD_DATA_STORAGE_KEY, JSON.stringify(values));
    } catch (error) {
      console.error("Error saving board to localStorage:", error);
    }
  }, [values]);

  function onChangeCell(id: string, next: string) {
    setValues((prev) => ({ ...prev, [id]: next }));
  }

  function onSelectCell(id: string | null) {
    setSelectedCellId(id);
  }

  function handleModalAnswer(questionIndex: number, answer: string) {
    setModalAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  }

  function handleModalNext() {
    if (currentModalQuestionIndex < MODAL_QUESTIONS.length - 1) {
      setCurrentModalQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered, close modal and mark as not a new user anymore
      try {
        window.localStorage.setItem(NEW_USER_STORAGE_KEY, "false");
      } catch (error) {
        console.error("Error saving new user status:", error);
      }
      setIsNewUser(false);
    }
  }

  function handleModalBack() {
    if (currentModalQuestionIndex > 0) {
      setCurrentModalQuestionIndex((prev) => prev - 1);
    }
  }

  function resetBoard() {
    setValues(defaults);
    try {
      window.localStorage.removeItem(BOARD_DATA_STORAGE_KEY);
    } catch (error) {
      console.error("Error resetting board in localStorage", error);
    }
  }

  function resetAllStorage() {
    setValues(defaults);
    try {
      window.localStorage.removeItem(BOARD_DATA_STORAGE_KEY);
      window.localStorage.removeItem(NEW_USER_STORAGE_KEY);
      alert("All data has been reset. Refresh the page to begin again.");
    } catch (error) {
      console.error("Error resetting all storage in localStorage", error);
      alert(`Error resetting all storage in localStorage: ${error}. Please try again.`);
    }
  }

  function handleHelpClick() {
    if (!selectedCellId) {
      alert("Please select a cell first");
      return;
    }
    setShowHelpModal(true);
    setHelpQuestion("");
  }

  async function handleExportPdf() {
    setIsExportingPdf(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "board",
          cells: defaultBoardCells,
          values,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Get the filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "harada-board.pdf";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleHelpSubmit() {
    if (!selectedCellId || !helpQuestion.trim()) {
      alert("Please enter what you need help with");
      return;
    }

    setIsLoadingHelp(true);
    try {
      // Find the selected cell to get its variant
      const selectedCell = defaultBoardCells.find(c => c.id === selectedCellId);
      const cellVariant = selectedCell?.variant || "plain";
      const existingContent = values[selectedCellId] || "";

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cell-help",
          helpQuestion: helpQuestion.trim(),
          cellVariant,
          existingContent,
          cellId: selectedCellId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      
      // Update the cell with the AI recommendation
      if (data.recommendation) {
        onChangeCell(selectedCellId, data.recommendation);
      }

      setShowHelpModal(false);
      setHelpQuestion("");
    } catch (error) {
      console.error("Error getting help:", error);
      alert("Failed to get help. Please try again.");
    } finally {
      setIsLoadingHelp(false);
    }
  }

  const currentAnswer = modalAnswers[currentModalQuestionIndex];
  const canGoForward = currentAnswer !== undefined;
  const canGoBack = currentModalQuestionIndex > 0;

  const selectedCell = defaultBoardCells.find(c => c.id === selectedCellId);
  const selectedCellLabel = selectedCell?.variant === "goal" 
    ? "Goal" 
    : selectedCell?.variant === "section" || selectedCell?.variant === "accent"
    ? "Goal attribute"
    : "Requirement";

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

      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900">
              Get help with: {selectedCellLabel}
            </h2>
            
            <p className="text-sm text-neutral-600 mb-4">
              What specifically do you need help with for this cell?
            </p>

            <textarea
              value={helpQuestion}
              onChange={(e) => setHelpQuestion(e.target.value)}
              placeholder="e.g., I need ideas for what to write here, or help refining my existing content..."
              className="w-full h-32 px-3 py-2 border border-neutral-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900"
              disabled={isLoadingHelp}
            />

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowHelpModal(false);
                  setHelpQuestion("");
                }}
                disabled={isLoadingHelp}
                className="px-4 py-2 rounded border border-neutral-300 text-neutral-900 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleHelpSubmit}
                disabled={isLoadingHelp || !helpQuestion.trim()}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingHelp ? "Getting help..." : "Get AI Suggestion"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-neutral-900">Editable board</div>
            <div className="text-xs text-neutral-600">
              {BOARD_COLS}×{BOARD_ROWS} grid with a merged center goal cell. Changes are saved to localStorage.
            </div>
          </div>

          <div className="flex gap-2">
            {selectedCellId && (
              <button
                type="button"
                onClick={handleHelpClick}
                className="rounded-md border border-blue-500 bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
              >
                I need help!
              </button>
            )}
            <button
              type="button"
              onClick={resetBoard}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Reset Board
            </button>
            <button
              type="button"
              onClick={resetAllStorage}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Reset All Data
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingPdf ? "Exporting..." : "Export PDF"}
            </button>
          </div>
        </div>

        <BoardGrid
          cells={defaultBoardCells}
          values={values}
          onChangeCell={onChangeCell}
          selectedCellId={selectedCellId}
          onSelectCell={onSelectCell}
        />
      </section>
    </>
  );
}

