import BoardEditor from "@/components/board/BoardEditor";

export default function HomePage() {
  return (
    <main className="min-h-dvh w-full bg-neutral-50">
      <div className="mx-auto px-4 py-6">
        <h1 className="text-5xl font-semibold tracking-tight text-center">Harada Method</h1>
        <p className="mt-1 text-lg text-neutral-600">
          The Harada Method is a simple but thorough way to help you understand, itemize, and achieve your goals. It is a grid of 9x9 cells, with a center cell that is merged with the 8 surrounding cells. You can click any cell and type. Changes are saved to localStorage.
        </p>
        <p className="mt-1 text-lg text-neutral-600">
          If you need help thinking through what to fill in for a particular cell, you can click the "I need help" button to get some recommendations for the selected cell. You will not see the button if you have not selected a cell.
        </p>
        <div className="mt-6">
          <BoardEditor />
        </div>
      </div>
    </main>
  );
}

