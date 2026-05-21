"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  if (locale !== "tr") return null;

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      <span className="font-semibold text-fg">TR</span>
      <span className="text-fg-subtle">/</span>
      <Link
        href={pathname}
        locale="en"
        className="text-fg-subtle transition-colors hover:text-fg"
      >
        EN
      </Link>
    </div>
  );
}
