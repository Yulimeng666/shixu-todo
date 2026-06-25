import type { ReactNode } from "react";

type AppLayoutProps = {
  sidebar: ReactNode;
  mobileNav: ReactNode;
  children: ReactNode;
};

export function AppLayout({ sidebar, mobileNav, children }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-orange-50 text-stone-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden rounded-xl border border-orange-200 bg-orange-50/92 shadow-sm lg:block">
          {sidebar}
        </aside>
        <div className="flex min-w-0 flex-col rounded-xl border border-orange-200 bg-orange-50/45 shadow-sm">
          <div className="rounded-t-xl border-b border-orange-200 bg-orange-50/95 lg:hidden">
            {mobileNav}
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
