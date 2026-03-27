import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, PhoneCall, XCircle, Clock, Search,
  ChevronDown, Phone, Mail, Users, Calendar, Package,
  MessageSquare, User, Trash2, X, RefreshCw, StickyNote
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

type Status = "new" | "details_shared" | "converted" | "lost";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  packageService: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  paxDetails: string;
  message: string;
  status: Status;
  createdAt: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new:            { label: "New",            color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   icon: Clock },
  details_shared: { label: "Details Shared", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200", icon: PhoneCall },
  converted:      { label: "Converted",      color: "text-green-700",  bg: "bg-green-50 border-green-200", icon: CheckCircle2 },
  lost:           { label: "Lost",           color: "text-red-700",    bg: "bg-red-50 border-red-200",     icon: XCircle },
};

const STATUS_ORDER: Status[] = ["new", "details_shared", "converted", "lost"];

export default function AdminInquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "kanban">("list");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/inquiries`);
      const data = await res.json();
      setInquiries(data.sort((a: Inquiry, b: Inquiry) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch {
      toast({ title: "Error", description: "Failed to load inquiries.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: Status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API}/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
      toast({ title: "Status updated", description: `Marked as "${STATUS_CONFIG[status].label}"` });
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteInquiry = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`${API}/inquiries/${id}`, { method: "DELETE" });
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({ title: "Deleted", description: "Inquiry removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = inquiries.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.phone.includes(q);
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = inquiries.filter(i => i.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inquiries</h1>
          <p className="text-sm text-muted-foreground">{inquiries.length} total • {counts.new} new</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <div className="flex border border-border rounded-lg overflow-hidden">
            {(["list", "kanban"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn("px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  view === v ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-muted"
                )}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status summary chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={cn("px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            filterStatus === "all" ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:border-foreground/40"
          )}
        >
          All <span className="ml-1 opacity-60">{inquiries.length}</span>
        </button>
        {STATUS_ORDER.map(s => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5",
                filterStatus === s ? `${cfg.bg} ${cfg.color} border-current` : "bg-card border-border text-muted-foreground hover:border-foreground/40"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
              <span className="opacity-60">{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…" className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading inquiries…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search || filterStatus !== "all" ? "No inquiries match your filters." : "No inquiries yet. They'll appear here once visitors submit the form."}
        </div>
      ) : view === "list" ? (
        /* ── LIST VIEW ──────────────────────────────────────────────── */
        <div className="space-y-3">
          {filtered.map(inq => (
            <InquiryCard
              key={inq.id}
              inq={inq}
              onView={() => setSelected(inq)}
              onStatus={updateStatus}
              onDelete={deleteInquiry}
              updatingId={updatingId}
              deletingId={deletingId}
            />
          ))}
        </div>
      ) : (
        /* ── KANBAN VIEW ────────────────────────────────────────────── */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {STATUS_ORDER.map(s => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            const cards = filtered.filter(i => i.status === s);
            return (
              <div key={s} className="min-w-[200px]">
                <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border mb-3", cfg.bg)}>
                  <Icon className={cn("w-4 h-4", cfg.color)} />
                  <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
                  <span className={cn("ml-auto text-xs font-bold", cfg.color)}>{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map(inq => (
                    <div key={inq.id} onClick={() => setSelected(inq)}
                      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <p className="font-semibold text-sm truncate">{inq.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{inq.packageService || "No package selected"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{inq.phone}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(inq.createdAt)}</p>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h3 className="font-bold text-lg">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">{fmtDate(selected.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <DetailRow icon={Phone} label="Phone" value={selected.phone} />
                <DetailRow icon={Mail} label="Email" value={selected.email} />
                {selected.whatsapp && <DetailRow icon={Phone} label="WhatsApp" value={selected.whatsapp} />}
              </div>

              {/* Booking details */}
              {(selected.packageService || selected.checkIn || selected.guests) && (
                <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Booking Details</p>
                  {selected.packageService && <DetailRow icon={Package} label="Package" value={selected.packageService} />}
                  {selected.checkIn && <DetailRow icon={Calendar} label="Date" value={selected.checkIn} />}
                  {selected.guests && <DetailRow icon={Users} label="Guests" value={`${selected.guests} pax`} />}
                  {selected.paxDetails && <DetailRow icon={User} label="Pax Details" value={selected.paxDetails} />}
                </div>
              )}

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <StickyNote className="w-3.5 h-3.5" /> Notes
                  </p>
                  <p className="text-sm bg-muted/40 rounded-xl p-4 whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}

              {/* Status actions */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Change Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_ORDER.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    const isActive = selected.status === s;
                    return (
                      <button key={s} disabled={updatingId === selected.id || isActive}
                        onClick={() => updateStatus(selected.id, s)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                          isActive
                            ? `${cfg.bg} ${cfg.color} border-current`
                            : "bg-card border-border text-muted-foreground hover:border-foreground/30 disabled:opacity-50"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp quick reply */}
              {selected.whatsapp || selected.phone ? (
                <a
                  href={`https://wa.me/${(selected.whatsapp || selected.phone).replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selected.name)}%2C%20thank%20you%20for%20your%20inquiry%20about%20${encodeURIComponent(selected.packageService || "our houseboat")}!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white rounded-xl font-medium text-sm hover:bg-[#1da851] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Reply on WhatsApp
                </a>
              ) : null}

              {/* Delete */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full gap-2"
                  disabled={deletingId === selected.id}
                  onClick={() => deleteInquiry(selected.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === selected.id ? "Deleting…" : "Delete Inquiry"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function InquiryCard({ inq, onView, onStatus, onDelete, updatingId, deletingId }: {
  inq: Inquiry;
  onView: () => void;
  onStatus: (id: number, s: Status) => void;
  onDelete: (id: number) => void;
  updatingId: number | null;
  deletingId: number | null;
}) {
  const cfg = STATUS_CONFIG[inq.status];
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 flex-wrap">
        {/* Left info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-base">{inq.name}</p>
            <StatusBadge status={inq.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {inq.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{inq.phone}</span>}
            {inq.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{inq.email}</span>}
            {inq.packageService && <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{inq.packageService}</span>}
            {inq.checkIn && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{inq.checkIn}</span>}
            {inq.guests && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{inq.guests} guests</span>}
          </div>
          {inq.message && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{inq.message}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-2">{fmtDate(inq.createdAt)}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {STATUS_ORDER.filter(s => s !== inq.status).map(s => {
            const c = STATUS_CONFIG[s];
            const Ic = c.icon;
            return (
              <button key={s} disabled={updatingId === inq.id}
                onClick={() => onStatus(inq.id, s)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  c.bg, c.color, "hover:opacity-80 disabled:opacity-40"
                )}
              >
                <Ic className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
          <button
            disabled={deletingId === inq.id}
            onClick={() => onDelete(inq.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.bg, cfg.color)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <span className="text-muted-foreground text-xs">{label}: </span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
