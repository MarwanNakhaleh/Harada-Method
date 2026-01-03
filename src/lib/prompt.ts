export function generateCellHelpPrompt(
  helpQuestion: string,
  cellVariant: string,
  existingContent: string,
  cellId: string
): string {
  const cellTypeDescription = {
    goal: "the main goal cell (the central purpose or achievement you're working towards); this should be measurable in some way",
    section: "a goal attribute cell (a key characteristic or quality needed to achieve the goal)",
    accent: "a goal attribute cell (a key characteristic or quality needed to achieve the goal)",
    ref: "a reference cell",
    plain: "a requirement cell (a specific action, practice, or step needed to develop the goal attribute)",
  }[cellVariant] || "a cell";

  let prompt = `You are helping someone fill out a Harada Method goal-setting board. This is a 9x9 grid system designed to help break down and achieve ambitious goals.

  The user is working on ${cellTypeDescription} (cell ID: ${cellId}).`;

  if (existingContent) {
      prompt += `Current content in this cell: "${existingContent}"`;
  }

  prompt += `The user's question: ${helpQuestion}

  Please provide a helpful, concise suggestion for what they could write in this cell. Your response should be:
  1. Specific and actionable
  2. Appropriate for a ${cellVariant} cell in the Harada Method
  3. Clear and concise (suitable to fit in a cell)
  4. Directly address their question

  Provide ONLY the suggested text for the cell, without any additional explanation or formatting.`;

  return prompt;
}

