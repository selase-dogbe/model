const STYLES: Record<string, string> = {
  PENDING: "bg-slate-700 text-slate-200",
  ASSIGNED: "bg-amber-900 text-amber-300",
  IN_TRANSIT: "bg-blue-900 text-blue-300",
  DELIVERED: "bg-emerald-900 text-emerald-300",
  CANCELLED: "bg-red-950 text-red-400",
  PLANNED: "bg-slate-700 text-slate-200",
  IN_PROGRESS: "bg-blue-900 text-blue-300",
  COMPLETED: "bg-emerald-900 text-emerald-300",
  SKIPPED: "bg-red-950 text-red-400",
  ACTIVE: "bg-emerald-900 text-emerald-300",
  OFFLINE: "bg-slate-700 text-slate-300",
  ON_BREAK: "bg-amber-900 text-amber-300",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-slate-700 text-slate-200";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status.replace("_", " ")}
    </span>
  );
}
