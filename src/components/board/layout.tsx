import type { BoardCellDef } from "@/lib/board-types";

export const BOARD_ROWS = 9;
export const BOARD_COLS = 9;

export const defaultBoardCells: BoardCellDef[] = [
  // Row 1
  { id: "r1c1", row: 1, col: 1, initialText: "" },
  { id: "r1c2", row: 1, col: 2, initialText: "" },
  { id: "r1c3", row: 1, col: 3, initialText: "" },
  { id: "r1c4", row: 1, col: 4, initialText: "" },
  { id: "r1c5", row: 1, col: 5, initialText: "" },
  { id: "r1c6", row: 1, col: 6, initialText: "" },
  { id: "r1c7", row: 1, col: 7, initialText: "" },
  { id: "r1c8", row: 1, col: 8, initialText: "" },
  { id: "r1c9", row: 1, col: 9, initialText: "" },

  // Row 2
  { id: "r2c1", row: 2, col: 1, initialText: "" },
  { id: "r2c2", row: 2, col: 2, variant: "section", initialText: "" },
  { id: "r2c3", row: 2, col: 3, initialText: "" },
  { id: "r2c4", row: 2, col: 4, initialText: "" },
  { id: "r2c5", row: 2, col: 5, variant: "section", initialText: "" },
  { id: "r2c6", row: 2, col: 6, initialText: "" },
  { id: "r2c7", row: 2, col: 7, initialText: "" },
  { id: "r2c8", row: 2, col: 8, variant: "section", initialText: "" },
  { id: "r2c9", row: 2, col: 9, initialText: "" },

  // Row 3
  { id: "r3c1", row: 3, col: 1, initialText: "" },
  { id: "r3c2", row: 3, col: 2, initialText: "" },
  { id: "r3c3", row: 3, col: 3, initialText: "" },
  { id: "r3c4", row: 3, col: 4, initialText: "" },
  { id: "r3c5", row: 3, col: 5, variant: "ref", initialText: "" },
  { id: "r3c6", row: 3, col: 6, initialText: "" },
  { id: "r3c7", row: 3, col: 7, initialText: "" },
  { id: "r3c8", row: 3, col: 8, initialText: "" },
  { id: "r3c9", row: 3, col: 9, initialText: "" },

  // Row 4 (goal starts at col 4)
  { id: "r4c1", row: 4, col: 1, initialText: "" },
  { id: "r4c2", row: 4, col: 2, initialText: "" },
  { id: "r4c3", row: 4, col: 3, initialText: "" },
  {
    id: "goal",
    row: 4,
    col: 4,
    rowSpan: 3,
    colSpan: 3,
    variant: "goal",
    initialText: "",
  },
  { id: "r4c7", row: 4, col: 7, initialText: "" },
  { id: "r4c8", row: 4, col: 8, initialText: "" },
  { id: "r4c9", row: 4, col: 9, initialText: "" },

  // Row 5 (cols 4-6 are covered by goal span)
  { id: "r5c1", row: 5, col: 1, initialText: "" },
  { id: "r5c2", row: 5, col: 2, variant: "accent", initialText: "" },
  { id: "r5c3", row: 5, col: 3, initialText: "" },
  { id: "r5c7", row: 5, col: 7, initialText: "" },
  { id: "r5c8", row: 5, col: 8, variant: "accent", initialText: "" },
  { id: "r5c9", row: 5, col: 9, initialText: "" },

  // Row 6 (cols 4-6 are covered by goal span)
  { id: "r6c1", row: 6, col: 1, initialText: "" },
  { id: "r6c2", row: 6, col: 2, initialText: "" },
  { id: "r6c3", row: 6, col: 3, initialText: "" },
  { id: "r6c7", row: 6, col: 7, initialText: "" },
  { id: "r6c8", row: 6, col: 8, initialText: "" },
  { id: "r6c9", row: 6, col: 9, initialText: "" },

  // Row 7
  { id: "r7c1", row: 7, col: 1, initialText: "" },
  { id: "r7c2", row: 7, col: 2, initialText: "" },
  { id: "r7c3", row: 7, col: 3, initialText: "" },
  { id: "r7c4", row: 7, col: 4, initialText: "" },
  { id: "r7c5", row: 7, col: 5, initialText: "" },
  { id: "r7c6", row: 7, col: 6, initialText: "" },
  { id: "r7c7", row: 7, col: 7, initialText: "" },
  { id: "r7c8", row: 7, col: 8, initialText: "" },
  { id: "r7c9", row: 7, col: 9, initialText: "" },

  // Row 8
  { id: "r8c1", row: 8, col: 1, initialText: "" },
  { id: "r8c2", row: 8, col: 2, variant: "accent", initialText: "" },
  { id: "r8c3", row: 8, col: 3, initialText: "" },
  { id: "r8c4", row: 8, col: 4, initialText: "" },
  { id: "r8c5", row: 8, col: 5, variant: "accent", initialText: "" },
  { id: "r8c6", row: 8, col: 6, initialText: "" },
  { id: "r8c7", row: 8, col: 7, initialText: "" },
  { id: "r8c8", row: 8, col: 8, variant: "accent", initialText: "" },
  { id: "r8c9", row: 8, col: 9, initialText: "" },

  // Row 9
  { id: "r9c1", row: 9, col: 1, initialText: "" },
  { id: "r9c2", row: 9, col: 2, initialText: "" },
  { id: "r9c3", row: 9, col: 3, initialText: "" },
  { id: "r9c4", row: 9, col: 4, initialText: "" },
  { id: "r9c5", row: 9, col: 5, initialText: "" },
  { id: "r9c6", row: 9, col: 6, initialText: "" },
  { id: "r9c7", row: 9, col: 7, initialText: "" },
  { id: "r9c8", row: 9, col: 8, initialText: "" },
  { id: "r9c9", row: 9, col: 9, initialText: "" },
];

export function makeDefaultValues() {
  const out: Record<string, string> = {};
  for (const c of defaultBoardCells) out[c.id] = c.initialText ?? "";
  return out;
}

