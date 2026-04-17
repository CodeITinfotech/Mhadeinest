import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, X, User, Bot, Circle, CheckCircle, Plus, Pencil, Trash2, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const API = import.meta.env.BASE_URL + "api";

interface ChatSession {
  id: number;
  token: string;
  visitorName: string;
  status: "active" | "closed";
  createdAt: string;
  updatedAt: string;
  lastMessage?: { sender: string; message: string; createdAt: string } | null;
}

interface Message {
  id: number;
  sessionId: number;
  sender: "visitor" | "admin" | "bot";
  message: string;
  createdAt: string;
}

interface TrainingEntry {
  id: number;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminChat() {
  const [tab, setTab] = useState<"chats" | "training">("chats");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-border bg-background shrink-0">
        <button
          onClick={() => setTab("chats")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
            tab === "chats"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          Live Chats
        </button>
        <button
          onClick={() => setTab("training")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
            tab === "training"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Bot Training
        </button>
      </div>

      {tab === "chats" ? <LiveChatsPanel /> : <BotTrainingPanel />}
    </div>
  );
}

// ─── Live Chats Panel ────────────────────────────────────────────────────────
function LiveChatsPanel() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const esRef = useRef<EventSource | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/chat/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    esRef.current?.close();
    const es = new EventSource(`${API}/chat/admin/stream`);
    esRef.current = es;

    es.addEventListener("message", (e) => {
      const payload = JSON.parse(e.data);
      const token = payload.sessionToken as string;
      setSelectedToken(current => {
        if (current === token) {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.id)) return prev;
            return [...prev, payload as Message];
          });
        } else if (payload.sender !== "admin") {
          setUnreadMap(u => ({ ...u, [token]: (u[token] || 0) + 1 }));
        }
        return current;
      });
      fetchSessions();
    });

    es.addEventListener("session_new", () => fetchSessions());
    es.addEventListener("session_closed", () => fetchSessions());
    return () => { es.close(); };
  }, [fetchSessions]);

  useEffect(() => {
    if (!selectedToken) { setMessages([]); return; }
    setUnreadMap(u => { const n = { ...u }; delete n[selectedToken]; return n; });
    fetch(`${API}/chat/session/${selectedToken}/messages`)
      .then(r => r.ok ? r.json() : [])
      .then((msgs: Message[]) => setMessages(msgs))
      .catch(() => {});
  }, [selectedToken]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !selectedToken || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    const optimistic: Message = { id: Date.now(), sessionId: 0, sender: "admin", message: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    try {
      await fetch(`${API}/chat/session/${selectedToken}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sender: "admin" }),
      });
    } catch {}
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSession = async (token: string) => {
    try {
      await fetch(`${API}/chat/session/${token}/close`, { method: "PATCH" });
      if (selectedToken === token) setSelectedToken(null);
      fetchSessions();
    } catch {}
  };

  const activeSessions = sessions.filter(s => s.status === "active");
  const closedSessions = sessions.filter(s => s.status === "closed");
  const selectedSession = sessions.find(s => s.token === selectedToken);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: session list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-background">
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground">
            {activeSessions.length} active · {closedSessions.length} closed
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeSessions.length === 0 && closedSessions.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
              No chats yet. They'll appear here when visitors start a conversation.
            </div>
          )}
          {activeSessions.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Active</p>
              {activeSessions.map(s => (
                <SessionItem key={s.token} session={s} isSelected={selectedToken === s.token}
                  unread={unreadMap[s.token] || 0} onClick={() => setSelectedToken(s.token)} onClose={() => closeSession(s.token)} />
              ))}
            </div>
          )}
          {closedSessions.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Closed</p>
              {closedSessions.map(s => (
                <SessionItem key={s.token} session={s} isSelected={selectedToken === s.token}
                  unread={0} onClick={() => setSelectedToken(s.token)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: conversation */}
      <div className="flex-1 flex flex-col bg-muted/20">
        {selectedSession ? (
          <>
            <div className="bg-background border-b border-border px-5 py-3 flex items-center gap-3 shrink-0">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0",
                selectedSession.status === "active" ? "bg-primary" : "bg-muted-foreground")}>
                {selectedSession.visitorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{selectedSession.visitorName}</p>
                <p className={cn("text-xs flex items-center gap-1", selectedSession.status === "active" ? "text-green-600" : "text-muted-foreground")}>
                  {selectedSession.status === "active"
                    ? <><Circle className="w-2 h-2 fill-green-500 text-green-500" /> Active</>
                    : <><CheckCircle className="w-3 h-3" /> Closed</>}
                </p>
              </div>
              {selectedSession.status === "active" && (
                <button onClick={() => closeSession(selectedSession.token)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" /> Close Chat
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex gap-2", msg.sender === "admin" ? "flex-row-reverse" : "flex-row")}>
                  {msg.sender !== "admin" && (
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white",
                      msg.sender === "bot" ? "bg-primary" : "bg-muted-foreground")}>
                      {msg.sender === "bot" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  <div className={cn("flex flex-col max-w-[70%]", msg.sender === "admin" ? "items-end" : "items-start")}>
                    <span className="text-[10px] text-muted-foreground mb-0.5 mx-1 capitalize">{msg.sender}</span>
                    <div className={cn("px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap",
                      msg.sender === "admin"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-background text-foreground rounded-tl-sm border border-border shadow-sm")}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 mx-1">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {selectedSession.status === "active" ? (
              <div className="bg-background border-t border-border p-4 shrink-0">
                <div className="flex gap-3">
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder={`Reply to ${selectedSession.visitorName}…`}
                    className="flex-1 h-10 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={sendReply} disabled={!input.trim() || sending}
                    className="px-5 h-10 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-background border-t border-border px-5 py-3 text-sm text-muted-foreground text-center shrink-0">
                This chat is closed.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Choose a chat session from the left panel to view messages and reply in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bot Training Panel ───────────────────────────────────────────────────────
function BotTrainingPanel() {
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${API}/chat/training`);
      if (res.ok) setEntries(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const addEntry = async () => {
    if (!newQ.trim() || !newA.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/chat/training`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ.trim(), answer: newA.trim() }),
      });
      if (res.ok) {
        setNewQ(""); setNewA(""); setShowAdd(false);
        fetchEntries();
      }
    } catch {} finally { setSaving(false); }
  };

  const startEdit = (entry: TrainingEntry) => {
    setEditingId(entry.id);
    setEditQ(entry.question);
    setEditA(entry.answer);
  };

  const saveEdit = async (id: number) => {
    if (!editQ.trim() || !editA.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/chat/training/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: editQ.trim(), answer: editA.trim() }),
      });
      if (res.ok) { setEditingId(null); fetchEntries(); }
    } catch {} finally { setSaving(false); }
  };

  const toggleActive = async (entry: TrainingEntry) => {
    try {
      await fetch(`${API}/chat/training/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !entry.isActive }),
      });
      fetchEntries();
    } catch {}
  };

  const deleteEntry = async (id: number) => {
    if (!confirm("Delete this training entry?")) return;
    try {
      await fetch(`${API}/chat/training/${id}`, { method: "DELETE" });
      fetchEntries();
    } catch {}
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Bot Training</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add custom Q&A pairs to teach the chatbot how to answer questions about your resort.
              The bot also automatically learns from your FAQs, packages, and activities.
            </p>
          </div>
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); }}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Q&A
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary/80 space-y-1">
          <p className="font-semibold">How the bot works:</p>
          <ul className="list-disc list-inside space-y-0.5 text-primary/70">
            <li>Matches visitor questions against your training Q&As and FAQs (keyword matching)</li>
            <li>Dynamically answers price, activity, and booking questions using live website data</li>
            <li>If no answer is found, it always replies with your contact / WhatsApp number instead of staying silent</li>
          </ul>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-4 shadow-sm">
            <p className="font-semibold text-sm text-foreground">New Training Entry</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Question (what the visitor might ask)</label>
                <input
                  value={newQ}
                  onChange={e => setNewQ(e.target.value)}
                  placeholder="e.g. Do you allow pets on board?"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Answer (what the bot should reply)</label>
                <textarea
                  value={newA}
                  onChange={e => setNewA(e.target.value)}
                  rows={3}
                  placeholder="e.g. Unfortunately we don't allow pets on board. However, all our crew are pet lovers!"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowAdd(false); setNewQ(""); setNewA(""); }}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={addEntry} disabled={!newQ.trim() || !newA.trim() || saving}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        )}

        {/* Entry list */}
        {loading ? (
          <div className="text-center py-10 text-sm text-muted-foreground">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No training entries yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add Q&A pairs to teach the bot your specific answers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className={cn("bg-card border rounded-xl p-4 shadow-sm transition-opacity", !entry.isActive && "opacity-50")}>
                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
                      <input value={editQ} onChange={e => setEditQ(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Answer</label>
                      <textarea value={editA} onChange={e => setEditA(e.target.value)} rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => saveEdit(entry.id)} disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-1">Q: {entry.question}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">A: {entry.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleActive(entry)} title={entry.isActive ? "Disable" : "Enable"}
                        className={cn("px-2 py-1 rounded text-xs font-medium transition-colors",
                          entry.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
                        {entry.isActive ? "On" : "Off"}
                      </button>
                      <button onClick={() => startEdit(entry)} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteEntry(entry.id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Session Item ─────────────────────────────────────────────────────────────
function SessionItem({ session, isSelected, unread, onClick, onClose }: {
  session: ChatSession; isSelected: boolean; unread: number; onClick: () => void; onClose?: () => void;
}) {
  return (
    <div onClick={onClick} className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1 group",
      isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
    )}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0",
        session.status === "active" ? "bg-primary" : "bg-muted-foreground")}>
        {session.visitorName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
            {session.visitorName}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(session.updatedAt)}</span>
        </div>
        {session.lastMessage && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {session.lastMessage.sender === "admin" ? "You: " : ""}
            {session.lastMessage.message}
          </p>
        )}
      </div>
      {unread > 0 && (
        <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
          {unread}
        </span>
      )}
      {onClose && session.status === "active" && (
        <button onClick={e => { e.stopPropagation(); onClose(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-destructive" title="Close chat">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
