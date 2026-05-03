"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import {
  createDapp,
  fetchDappBackfillStatus,
  fetchDapps,
  type BackfillStatus,
} from "@/lib/api";
import { truncateAddress } from "@arcana/shared";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { DataTable, TableCell, TableHead, TableRow } from "@/components/ui/DataTable";
import { Input, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Badge, StatusPill } from "@/components/ui/StatusAndBadge";

interface DApp {
  id: string;
  name: string;
  contractAddresses: string[];
  chainId: number;
  createdAt: string;
}

export default function DAppsPage() {
  const router = useRouter();
  const [dapps, setDapps] = useState<DApp[]>([]);
  const [backfillStatuses, setBackfillStatuses] = useState<
    Record<string, BackfillStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [addresses, setAddresses] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadStatuses = useCallback(async (activeDapps: DApp[]) => {
    const entries = await Promise.all(
      activeDapps.map(async (dapp) => {
        try {
          const res = await fetchDappBackfillStatus(dapp.id);
          return [dapp.id, res.data] as const;
        } catch {
          return null;
        }
      }),
    );

    setBackfillStatuses(
      Object.fromEntries(
        entries.filter(
          (
            entry,
          ): entry is readonly [string, BackfillStatus] => entry !== null,
        ),
      ),
    );
  }, []);

  const loadDapps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDapps();
      setDapps(res.data);
      await loadStatuses(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dApps");
    } finally {
      setLoading(false);
    }
  }, [loadStatuses]);

  useEffect(() => {
    void loadDapps();
  }, [loadDapps]);

  useEffect(() => {
    const hasActiveBackfill = Object.values(backfillStatuses).some((status) =>
      ["queued", "scanning", "syncing"].includes(status.state),
    );
    if (!hasActiveBackfill) return;

    const interval = setInterval(() => {
      void loadDapps();
    }, 5000);

    return () => clearInterval(interval);
  }, [backfillStatuses, loadDapps]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const contractAddresses = addresses
      .split(/[\n,]+/)
      .map((a) => a.trim())
      .filter(Boolean);

    if (!name.trim()) {
      setFormError("Enter a name for the dApp you want to monitor.");
      return;
    }

    if (contractAddresses.length === 0) {
      setFormError("Add at least one contract address to monitor.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await createDapp({
        name: name.trim(),
        contractAddresses,
      });
      setName("");
      setAddresses("");
      setShowForm(false);
      setFormSuccess(`Now monitoring ${res.data.name}.`);
      await loadDapps();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to register dApp",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filteredDapps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dapps;

    return dapps.filter((dapp) => {
      const haystack = [dapp.name, ...dapp.contractAddresses]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [dapps, search]);

  if (error) {
    return <ErrorState message={error} onRetry={loadDapps} />;
  }

return (
    <div className="space-y-8">
      <PageHeader
        title="dApp Registry"
        subtitle="Track monitored Stylus contracts, watch backfill progress, and open each contract's performance view."
        actions={
          <Button
            data-testid="toggle-dapp-form"
            onClick={() => setShowForm((current) => !current)}
            className="gap-2"
          >
            <Plus size={16} />
            {showForm ? "Close Form" : "Add dApp"}
          </Button>
        }
      />

      {showForm ? (
        <Panel className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  dApp Name
                </label>
                <Input
                  data-testid="dapp-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Stylus dApp"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Contract Addresses
                </label>
                <Textarea
                  data-testid="dapp-addresses-input"
                  value={addresses}
                  onChange={(e) => setAddresses(e.target.value)}
                  placeholder="0x1234..., 0x5678... or one per line"
                  disabled={submitting}
                  rows={4}
                />
                <p className="mt-3 text-xs text-white/30">
                  Duplicate and invalid addresses are rejected automatically.
                </p>
              </div>
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {formError}
              </div>
            ) : null}

            <div className="flex items-center gap-4">
              <Button
                data-testid="submit-dapp-form"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Register dApp"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {formSuccess ? (
        <Panel className="border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-300">
          {formSuccess}
        </Panel>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
            size={16}
          />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registry..."
            className="pl-11"
          />
        </div>
        <div className="text-xs font-mono font-semibold uppercase tracking-[0.15em] text-white/30">
          {filteredDapps.length} visible
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Panel key={index} className="animate-pulse p-6">
              <div className="mb-3 h-5 w-48 rounded bg-white/10" />
              <div className="h-4 w-80 rounded bg-white/10" />
            </Panel>
          ))}
        </div>
      ) : filteredDapps.length === 0 ? (
        <EmptyState
          title={dapps.length === 0 ? "No dApps registered yet" : "No matching dApps"}
          description={
            dapps.length === 0
              ? 'Use "Add dApp" to start monitoring a Stylus contract.'
              : "Try a different search term or clear the current filter."
          }
        />
      ) : (
        <DataTable>
          <TableHead>
            <tr>
              <TableCell isHeader>Project Name</TableCell>
              <TableCell isHeader>Contracts</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader className="text-right">
                Indexed Txs
              </TableCell>
              <TableCell isHeader className="text-right">
                Indexed Events
              </TableCell>
              <TableCell isHeader>Progress</TableCell>
            </tr>
          </TableHead>
          <tbody>
            {filteredDapps.map((dapp) => {
              const status = backfillStatuses[dapp.id];
              const runtimeStatus = mapBackfillStatus(status);
              const progressLabel = getBackfillProgressLabel(status);

              return (
                <TableRow
                  key={dapp.id}
                  onClick={() => router.push(`/dapps/${dapp.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] font-mono text-[12px] font-semibold tracking-wider text-white/50 shadow-inner transition-colors group-hover:border-white/[0.1] group-hover:bg-white/[0.06]">
                        {dapp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-white">
                          {dapp.name}
                        </span>
                        <span className="mt-0.5 font-mono text-[11px] text-white/35">
                          chain {dapp.chainId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {dapp.contractAddresses.slice(0, 2).map((address) => (
                        <Badge key={address} color="indigo">
                          {truncateAddress(address, 8)}
                        </Badge>
                      ))}
                      {dapp.contractAddresses.length > 2 ? (
                        <Badge>
                          +{dapp.contractAddresses.length - 2} more
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      status={runtimeStatus}
                      label={status?.state ?? "ready"}
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono text-white/85">
                    {(status?.indexedTransactions ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-white/85">
                    {(status?.indexedEvents ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-[13px] text-white/80">
                        {progressLabel}
                      </div>
                      {status?.message ? (
                        <div className="text-xs text-white/35">{status.message}</div>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </DataTable>
      )}
    </div>
  );
}

function mapBackfillStatus(
  status?: BackfillStatus,
): "operational" | "warning" | "critical" | "syncing" | "offline" {
  if (!status) return "offline";
  if (status.state === "completed") return "operational";
  if (status.state === "failed") return "critical";
  if (status.state === "queued" || status.state === "scanning" || status.state === "syncing") {
    return "syncing";
  }
  return "warning";
}

function getBackfillProgressLabel(status?: BackfillStatus) {
  if (!status) return "Awaiting status";

  if (status.totalTransactions && status.totalTransactions > 0) {
    return `${status.processedTransactions.toLocaleString()} / ${status.totalTransactions.toLocaleString()} processed`;
  }

  if (status.state === "completed") {
    return "Backfill completed";
  }

  if (status.state === "failed") {
    return "Backfill failed";
  }

  return "Backfill in progress";
}
