export type CellVariant = "plain" | "section" | "goal" | "accent" | "ref";

export type BoardCellDef = {
  id: string;
  row: number; // 1-based
  col: number; // 1-based
  rowSpan?: number;
  colSpan?: number;
  variant?: CellVariant;
  initialText?: string;
};

