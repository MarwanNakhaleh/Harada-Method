"use client";

import BoardCell from "./BoardCell";
import type { BoardCellDef } from "@/lib/board-types";

function macroKey(mr: number, mc: number) {
  return `${mr}-${mc}`;
}

function localPos(globalRow: number, globalCol: number) {
  const localRow = ((globalRow - 1) % 3) + 1; // 1..3
  const localCol = ((globalCol - 1) % 3) + 1; // 1..3
  return { localRow, localCol };
}

export default function MacroSquare(props: {
  macroRow: number; // 1..3
  macroCol: number; // 1..3
  cells: BoardCellDef[];
  values: Record<string, string>;
  onChangeCell: (id: string, next: string) => void;
  selectedCellId: string | null;
  onSelectCell: (id: string | null) => void;
}) {
  const { macroRow, macroCol, cells, values, onChangeCell, selectedCellId, onSelectCell } = props;

  // Sort so rendering is stable (not required, but nice)
  const ordered = [...cells].sort((a, b) => (a.row - b.row) || (a.col - b.col));

  return (
    <div
      className="grid gap-px bg-neutral-300 p-px"
      style={{
        gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
        gridTemplateRows: "repeat(3, minmax(92px, 1fr))",
      }}
      aria-label={`MacroSquare ${macroKey(macroRow, macroCol)}`}
    >
      {ordered.map((cell) => {
        // Local placement inside this 3x3 square
        // For the center goal cell (rowSpan/colSpan 3), it will naturally cover the whole macro square.
        const { localRow, localCol } = localPos(cell.row, cell.col);
        const rowSpan = cell.rowSpan ?? 1;
        const colSpan = cell.colSpan ?? 1;

        return (
          <div
            key={cell.id}
            style={{
              gridRow: `${localRow} / span ${rowSpan}`,
              gridColumn: `${localCol} / span ${colSpan}`,
            }}
          >
            <BoardCell
              cell={cell}
              value={values[cell.id] ?? ""}
              onChange={(next) => onChangeCell(cell.id, next)}
              isSelected={selectedCellId === cell.id}
              onSelect={() => onSelectCell(cell.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

