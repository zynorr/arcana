"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Bell,
  Blocks,
  ChevronRight,
  Code,
  Layers3,
  LayoutGrid,
  Menu,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  TerminalSquare,
  X,
} from "lucide-react";
import { fetchDapps, fetchSearch } from "@/lib/api";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  mobileLabel: string;
}

interface DAppTarget {
  id: string;
  name: string;
}

const navItems: NavItem[] = [
  { label: "Global Metrics", href: "/", icon: LayoutGrid, mobileLabel: "HOME" },
  {
    label: "dApp Registry",
    href: "/dapps",
    icon: Layers3,
    mobileLabel: "DAPPS",
  },
  { label: "Explorer", href: "/explorer", icon: Blocks, mobileLabel: "SCAN" },
  { label: "Alerts", href: "/alerts", icon: ShieldAlert, mobileLabel: "ALERTS" },
  { label: "Stylus Analytics", href: "/stylus", icon: Code, mobileLabel: "STYLUS" },
  { label: "Ops Health", href: "/ops", icon: Activity, mobileLabel: "OPS" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    type: string;
    result: unknown;
  } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [targets, setTargets] = useState<DAppTarget[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTargets() {
      try {
        const res = await fetchDapps();
        if (!cancelled) {
          setTargets(
            res.data.map((dapp) => ({
              id: dapp.id,
              name: dapp.name,
            })),
          );
        }
      } catch {
        if (!cancelled) {
          setTargets([]);
        }
      }
    }

    void loadTargets();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearchOpen(true);

    try {
      const res = await fetchSearch(query);
      setSearchResult(res.data);
    } catch {
      setSearchResult({ type: "none", result: null });
    } finally {
      setSearching(false);
    }
  };

  const navigateToResult = () => {
    if (!searchResult || searchResult.type === "none") return;

    setSearchOpen(false);
    setSearchResult(null);

    if (searchResult.type === "transaction") {
      const tx = searchResult.result as { txHash: string };
      router.push(`/explorer?search=${encodeURIComponent(tx.txHash)}`);
    } else if (searchResult.type === "block") {
      const block = searchResult.result as { blockNumber: number };
      router.push(
        `/explorer?search=${encodeURIComponent(String(block.blockNumber))}`,
      );
    } else if (searchResult.type === "address") {
      const addr = searchResult.result as { address: string };
      router.push(`/explorer?search=${encodeURIComponent(addr.address)}`);
    }

    setSearchQuery("");
    closeSidebar();
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased selection:bg-white/20 selection:text-white">
      {sidebarOpen ? (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <aside className="relative z-20 flex h-full w-72 shrink-0 flex-col border-r border-white/[0.05] bg-black/20 backdrop-blur-2xl">
          <div className="flex items-center gap-3 px-6 pb-8 pt-10">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-violet blur-md opacity-40" />
              <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-white/80 p-2 shadow-xl">
                <TerminalSquare size={20} strokeWidth={2.5} className="text-black" />
              </div>
            </div>
            <div>
              <h1 className="leading-tight text-xl font-bold tracking-tight text-white">
                Arcana
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                Stylus Analytics
              </p>
            </div>
          </div>

          <div className="px-4 pb-6">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent px-5 py-5">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] shadow-inner">
                  <Sparkles className="h-5 w-5 text-accent-indigo" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Arbitrum One</p>
                  <p className="text-[11px] font-medium text-white/35">
                    Live indexed analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                </span>
                <span className="text-white/60">{targets.length} monitored dApps</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
            <div className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/25">
              Dashboards
            </div>
            {navItems.map((item) => {
              const active = isActiveRoute(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent-indigo/30",
                    active
                      ? "bg-accent-indigo/10 border border-accent-indigo/20 font-semibold text-white"
                      : "font-medium text-white/45 hover:bg-white/[0.03] hover:text-white/80",
                  )}
                >
                  <div
                    className={cn(
                      "transition-colors duration-200",
                      active
                        ? "text-accent-indigo"
                        : "text-white/30 group-hover:text-white/60",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </Link>
              );
            })}

            <div className="mb-4 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/25">
              Monitored dApps
            </div>

            {targets.length === 0 ? (
              <Link
                href="/dapps"
                onClick={closeSidebar}
                className="block rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] px-4 py-4 text-[13px] text-white/35 transition-colors hover:bg-white/[0.03] hover:text-white/70"
              >
                No monitored dApps yet. Open the registry to add one.
              </Link>
            ) : (
              <div className="space-y-1">
                {targets.slice(0, 6).map((target) => {
                  const active = pathname === `/dapps/${target.id}`;

                  return (
                    <Link
                      key={target.id}
                      href={`/dapps/${target.id}`}
                      onClick={closeSidebar}
                      className={cn(
                        "group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200",
                        active
                          ? "bg-white/[0.05] text-white"
                          : "text-white/40 hover:bg-white/[0.03] hover:text-white/70",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            active ? "bg-accent-indigo shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/15",
                          )}
                        />
                        <span className="truncate font-medium">{target.name}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-all",
                          active
                            ? "translate-x-0.5 text-white/60"
                            : "text-white/15 group-hover:translate-x-0.5 group-hover:text-white/30",
                        )}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          <div className="space-y-3 border-t border-white/[0.05] p-4">
            <Link
              href="/dapps"
              onClick={closeSidebar}
              className="flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium text-white/55 transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
            >
              Open Registry
              <Layers3 className="h-4 w-4 text-white/30" />
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
            >
              <Settings2 className="h-4 w-4 text-white/30" />
              Settings
            </button>
          </div>
        </aside>
      </div>

      <div className="relative z-10 flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/[0.04] bg-black/10 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {sidebarOpen ? (
              <button
                type="button"
                className="rounded-xl p-2 text-white/40 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-accent-indigo/30 lg:hidden"
                onClick={closeSidebar}
              >
                <X size={20} />
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl p-2 text-white/40 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-accent-indigo/30 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
            )}

            <div className="hidden items-center gap-5 text-[13px] font-medium sm:flex">
              <div className="flex items-center gap-3 text-white/60">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/50 animate-pulse" />
                  <div className="relative h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                </div>
                <span className="text-white/80">Arbitrum One</span>
              </div>
              <div className="h-4 w-px bg-white/[0.08]" />
              <span className="font-mono text-[10px] font-semibold tracking-widest text-white/25 uppercase">
                Stylus Monitoring
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div ref={searchRef} className="relative hidden items-center md:flex">
              <Search
                className="pointer-events-none absolute left-4 text-white/25"
                size={16}
              />
              <input
                data-testid="global-search-input"
                type="text"
                placeholder="Search tx, contract, dApp..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (
                      searchOpen &&
                      searchResult &&
                      searchResult.type !== "none" &&
                      !searching
                    ) {
                      navigateToResult();
                      return;
                    }

                    void handleSearch();
                  }

                  if (e.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
                className="w-80 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-11 pr-24 text-sm text-white shadow-inner transition-all placeholder:text-white/20 hover:bg-white/[0.03] hover:border-white/[0.1] focus:border-accent-indigo/40 focus:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-accent-indigo/20"
              />
              <div className="pointer-events-none absolute right-3 flex items-center gap-1">
                <kbd className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-white/30">
                  ⌘K
                </kbd>
              </div>
              {searching ? (
                <div className="absolute right-12 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
              ) : null}

              {searchOpen && searchResult ? (
                <div className="absolute right-0 top-full z-50 mt-3 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/90 shadow-2xl backdrop-blur-xl">
                  {searchResult.type === "none" ? (
                    <div className="px-5 py-4 text-sm font-medium text-white/40">
                      No indexed result found
                    </div>
                  ) : (
                    <button
                      data-testid="global-search-result"
                      type="button"
                      onClick={navigateToResult}
                      className="w-full px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-indigo">
                        {searchResult.type}
                      </div>
                      <div className="mt-1.5 truncate font-mono text-sm text-white/85">
                        {searchResult.type === "transaction"
                          ? (searchResult.result as { txHash: string }).txHash
                          : searchResult.type === "block"
                            ? `#${(searchResult.result as { blockNumber: number }).blockNumber}`
                            : (searchResult.result as { address: string }).address}
                      </div>
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <Link
              href="/alerts"
              className="relative rounded-xl p-2.5 text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/70"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-indigo shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            </Link>

            <Link
              href="/dapps"
              className="hidden rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all hover:bg-white/90 hover:shadow-xl sm:inline-flex"
            >
              Add dApp
            </Link>
          </div>
        </header>

        <main className="h-full flex-1 overflow-y-auto p-10 md:p-12 lg:p-16">
          <div className="mx-auto h-full max-w-[1600px] pb-16">{children}</div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.04] bg-black/40 backdrop-blur-2xl px-2 py-4 md:hidden">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all",
                active ? "bg-white/[0.05] text-white" : "text-white/30 hover:text-white/60",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-mono text-[9px] font-semibold tracking-[0.15em]">
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
