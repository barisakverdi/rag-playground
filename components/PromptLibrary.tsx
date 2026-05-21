"use client";

const PROMPTS = [
  { id: 1, query: "What impact did NorthBrew Supplies have across branches in Q1 2024?", method: "graph" },
  { id: 2, query: "Which branches were affected by the oat milk shortage and what were the consequences?", method: "graph" },
  { id: 3, query: "Had NorthBrew Supplies caused problems before the Q1 2024 incident?", method: "semantic" },
  { id: 4, query: "What steps were recommended to reduce dependency on NorthBrew Supplies?", method: "semantic" },
  { id: 5, query: "Which branches experienced espresso machine failures and what was the common cause?", method: "semantic" },
  { id: 6, query: "What is the relationship between the equipment fault at Leeds and the one at Manchester?", method: "graph" },
  { id: 7, query: "Is there a risk that espresso machine failures could recur at other branches?", method: "semantic" },
  { id: 8, query: "Which branches have outstanding maintenance items and what is the highest risk?", method: "semantic" },
  { id: 9, query: "What operational problems followed the mobile ordering rollout?", method: "semantic" },
  { id: 10, query: "The oat milk modifier bug lasted two weeks — what was the customer impact?", method: "graph" },
  { id: 11, query: "How did the mobile ordering rollout timing compound other operational issues?", method: "graph" },
  { id: 12, query: "What should be done differently before rolling out mobile ordering to Midlands?", method: "semantic" },
  { id: 13, query: "Which branches had staffing shortages in Q1 2024?", method: "semantic" },
  { id: 14, query: "How did understaffing compound the equipment failure at Leeds Central?", method: "graph" },
  { id: 15, query: "What are the staffing risks going into Easter trading?", method: "semantic" },
  { id: 16, query: "Where do staffing issues and customer complaints overlap?", method: "graph" },
  { id: 17, query: "How did the espresso machine fault lead to drink quality complaints?", method: "graph" },
  { id: 18, query: "Which customer complaints were caused by supplier issues versus branch operational failures?", method: "graph" },
  { id: 19, query: "What is the most significant systemic risk facing the North England region?", method: "hybrid" },
  { id: 20, query: "Trace the full chain from the Wakefield depot failure to the Google Reviews impact", method: "graph" },
] as const;

const METHOD_STYLES = {
  graph: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  semantic: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  hybrid: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
};

interface Props {
  onSelect: (query: string) => void;
  activeQuery?: string;
}

export function PromptLibrary({ onSelect, activeQuery }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        20 Sample Queries
      </p>
      {PROMPTS.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.query)}
          className={`group flex items-start gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            activeQuery === p.query ? "bg-zinc-100 dark:bg-zinc-800" : ""
          }`}
        >
          <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${METHOD_STYLES[p.method]}`}>
            {p.method}
          </span>
          <span className="leading-relaxed text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100">
            {p.query}
          </span>
        </button>
      ))}
    </div>
  );
}
