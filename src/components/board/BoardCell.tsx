"use client";

import type { BoardCellDef, CellVariant } from "@/lib/board-types";

function variantClasses(variant: CellVariant | undefined) {
    switch (variant) {
        case "section":
        case "goal":
        case "accent":
            return "bg-[#7a0f0f] text-white font-semibold";
        case "ref":
            // mimic a "selected/green outline" cell
            return "bg-white text-neutral-900 ring-2 ring-emerald-500";
        case "plain":
        default:
            return "bg-white text-neutral-900";
    }
}

function cn(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

function placeholder(variant: CellVariant | undefined) {
    switch (variant) {
        case "goal":
            return "Goal";
        case "section":
        case "accent":
            return "Goal attribute";
        default:
            return "Requirement";
    }
}

export default function BoardCell(props: {
    cell: BoardCellDef;
    value: string;
    cssClasses?: string;
    onChange: (next: string) => void;
    isSelected?: boolean;
    onSelect?: () => void;
}) {
    const { cell, value, cssClasses, onChange, isSelected = false, onSelect } = props;

    const isGoal = cell.variant === "goal";
    const base = variantClasses(cell.variant);

    return (
        <div
            className={cn(
                "relative flex h-full w-full items-stretch p-2",
                base,
                cssClasses || "",
                isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
            )}
            onClick={onSelect}
        >
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onSelect}
                placeholder={placeholder(cell.variant)}
                className={cn(
                    "h-full w-full resize-none bg-transparent outline-none",
                    "text-center leading-snug",
                    isGoal ? "text-base font-semibold" : "text-xs",
                    cell.variant === "section" ? "tracking-wide" : "",
                    "placeholder:text-neutral-400",
                    (cell.variant === "goal" || cell.variant === "section" || cell.variant === "accent")
                        ? "placeholder:text-white/60"
                        : ""
                )}
            />
        </div>
    );
}

