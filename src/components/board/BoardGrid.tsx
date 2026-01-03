"use client";

import type { BoardCellDef } from "@/lib/board-types";
import MacroSquare from "@/components/board/MacroSquare";

function macroCoords(cell: BoardCellDef) {
  const macroRow = Math.ceil(cell.row / 3); // 1..3
  const macroCol = Math.ceil(cell.col / 3); // 1..3
  return { macroRow, macroCol };
}

function macroKey(mr: number, mc: number) {
  return `${mr}-${mc}`;
}

function groupByMacro(cells: BoardCellDef[]) {
  const map = new Map<string, BoardCellDef[]>();
  for (const cell of cells) {
    const { macroRow, macroCol } = macroCoords(cell);
    const key = macroKey(macroRow, macroCol);
    const arr = map.get(key) ?? [];
    arr.push(cell);
    map.set(key, arr);
  }
  return map;
}

export default function BoardGrid(props: {
  cells: BoardCellDef[];
  values: Record<string, string>;
  onChangeCell: (id: string, next: string) => void;
  selectedCellId: string | null;
  onSelectCell: (id: string | null) => void;
}) {
  const { cells, values, onChangeCell, selectedCellId, onSelectCell } = props;

  const grouped = groupByMacro(cells);

  return (
    <div className="w-full overflow-auto">
      <div
        className="grid gap-px bg-neutral-300 p-px shadow-sm"
        style={{
          gridTemplateColumns: "repeat(3, minmax(520px, 1fr))",
          gridTemplateRows: "repeat(3, minmax(300px, 1fr))",
        }}
      >
        {([1, 2, 3] as const).map((mr) =>
          ([1, 2, 3] as const).map((mc) => {
            const key = macroKey(mr, mc);
            const macroCells = grouped.get(key) ?? [];
            return (
              <MacroSquare
                key={key}
                macroRow={mr}
                macroCol={mc}
                cells={macroCells}
                values={values}
                onChangeCell={onChangeCell}
                selectedCellId={selectedCellId}
                onSelectCell={onSelectCell}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

