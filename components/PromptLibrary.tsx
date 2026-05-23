"use client";

import { useTranslations } from "next-intl";

const PROMPTS = [
  { id: 1,  query: "What impact did NorthBrew Supplies have across branches in Q1 2024?", method: "graph" },
  { id: 2,  query: "Which branches were affected by the oat milk shortage and what were the consequences?", method: "graph" },
  { id: 3,  query: "Had NorthBrew Supplies caused problems before the Q1 2024 incident?", method: "semantic" },
  { id: 4,  query: "What steps were recommended to reduce dependency on NorthBrew Supplies?", method: "semantic" },
  { id: 5,  query: "Which branches experienced espresso machine failures and what was the common cause?", method: "semantic" },
  { id: 6,  query: "What is the relationship between the equipment fault at Leeds and the one at Manchester?", method: "graph" },
  { id: 7,  query: "Is there a risk that espresso machine failures could recur at other branches?", method: "semantic" },
  { id: 8,  query: "Which branches have outstanding maintenance items and what is the highest risk?", method: "semantic" },
  { id: 9,  query: "What operational problems followed the mobile ordering rollout?", method: "semantic" },
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
  graph:    "bg-indigo-950/50 text-indigo-300 border-indigo-700",
  semantic: "bg-emerald-950/50 text-emerald-300 border-emerald-700",
  hybrid:   "bg-amber-950/50 text-amber-300 border-amber-700",
};

interface Props {
  onSelect: (query: string, method: string) => void;
  activeQuery?: string;
}

export function PromptLibrary({ onSelect, activeQuery }: Props) {
  const t = useTranslations("Components.PromptLibrary");

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-subtle">
        {t("title")}
      </p>
      {PROMPTS.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.query, p.method)}
          className={`group flex items-start gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-bg-subtle ${
            activeQuery === p.query ? "bg-bg-subtle" : ""
          }`}
        >
          <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${METHOD_STYLES[p.method]}`}>
            {p.method}
          </span>
          <span className="leading-relaxed text-fg-muted group-hover:text-fg">
            {t(`prompts.${p.id}`)}
          </span>
        </button>
      ))}
    </div>
  );
}
