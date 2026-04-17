import { Router, type IRouter, type Response } from "express";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  chatSessionsTable,
  chatMessagesTable,
  chatTrainingTable,
  faqsTable,
  packagesTable,
  activitiesTable,
  settingsTable,
} from "@workspace/db/schema";
import { randomUUID } from "crypto";
import { serializeArray, serializeDates } from "../lib/serialize";

const router: IRouter = Router();

// ─── In-memory SSE subscriber maps ─────────────────────────────────────────
const sessionSubs = new Map<string, Set<Response>>();
const adminSubs = new Set<Response>();

function broadcast(token: string, event: string, payload: object) {
  const line = `event: ${event}\ndata: ${JSON.stringify({ ...payload, sessionToken: token })}\n\n`;
  sessionSubs.get(token)?.forEach(res => { try { res.write(line); } catch {} });
  adminSubs.forEach(res => { try { res.write(line); } catch {} });
}

function broadcastAdmin(event: string, payload: object) {
  const line = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  adminSubs.forEach(res => { try { res.write(line); } catch {} });
}

// ─── Smart bot reply engine ──────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreMatch(query: string, candidate: string): number {
  const qWords = normalize(query).split(" ").filter(w => w.length > 2);
  const cText = normalize(candidate);
  if (!qWords.length) return 0;
  const hits = qWords.filter(w => cText.includes(w)).length;
  return hits / qWords.length;
}

async function getBotReply(message: string): Promise<string | null> {
  const msg = normalize(message);

  // Load all knowledge sources in parallel
  const [training, faqs, pkgs, acts, settingsRows] = await Promise.all([
    db.select().from(chatTrainingTable).where(eq(chatTrainingTable.isActive, true)).orderBy(asc(chatTrainingTable.sortOrder)),
    db.select().from(faqsTable).where(eq(faqsTable.isActive, true)).orderBy(asc(faqsTable.sortOrder)),
    db.select().from(packagesTable).where(eq(packagesTable.isActive, true)).orderBy(asc(packagesTable.sortOrder)),
    db.select().from(activitiesTable).where(eq(activitiesTable.isActive, true)).orderBy(asc(activitiesTable.sortOrder)),
    db.select().from(settingsTable).limit(1),
  ]);

  const cfg = settingsRows[0];
  const siteName = cfg?.siteName || "Mhadeinest";
  const location = cfg?.heroLocationTag || "Goa's backwaters";

  // Build knowledge base: training takes priority, then FAQs
  const knowledge: Array<{ question: string; answer: string }> = [
    ...training.map(t => ({ question: t.question, answer: t.answer })),
    ...faqs.map(f => ({ question: f.question, answer: f.answer })),
  ];

  // 1. Exact match
  const exact = knowledge.find(k => normalize(k.question) === msg);
  if (exact) return exact.answer;

  // 2. Scored keyword match
  let best: { answer: string; score: number } | null = null;
  for (const k of knowledge) {
    const qScore = scoreMatch(message, k.question);
    const aScore = scoreMatch(message, k.answer) * 0.4;
    const score = Math.max(qScore, aScore);
    if (score >= 0.4 && (!best || score > best.score)) {
      best = { answer: k.answer, score };
    }
  }
  if (best) return best.answer;

  // 3. Synthesized dynamic answers from website content

  // Price / package query
  if (/price|cost|rate|package|deal|tariff|how much|charges|fee/.test(msg)) {
    if (pkgs.length > 0) {
      const list = pkgs
        .map(p => `• *${p.name}* — ₹${Number(p.pricePerNight || 0).toLocaleString("en-IN")}/night (up to ${p.capacity} guests)`)
        .join("\n");
      return `Here are our current packages at ${siteName}:\n\n${list}\n\nAll packages include meals and accommodation. Visit our Packages page for full details! 🌿`;
    }
  }

  // Activity query
  if (/activit|trek|hike|nature|bird|forest|walk|camp|outdoor|adventure|what can|things to do/.test(msg)) {
    if (acts.length > 0) {
      const list = acts.map(a => `${a.icon || "•"} ${a.name}`).join("\n");
      return `We offer a wonderful range of nature experiences:\n\n${list}\n\nMost are included in our packages. Ask us to know more! 🌳`;
    }
  }

  // Booking query
  if (/book|reserv|availab|confirm|check in|checkout/.test(msg)) {
    const wa = cfg?.whatsappNumber;
    if (wa) {
      const waLink = `https://wa.me/${wa.replace(/\D/g, "")}`;
      return `Booking at ${siteName} is easy! You can:\n\n👉 [WhatsApp us directly](${waLink})\n📝 Or use the Inquiry form on our website\n\nWe usually confirm within a few hours. 🙌`;
    }
    return `To book your stay at ${siteName}, please use the Inquiry form on our website or reach out via WhatsApp. We'll confirm within a few hours!`;
  }

  // Location query
  if (/locat|where|address|map|reach|direction|near|place|find you/.test(msg)) {
    return `${siteName} is nestled in ${location}. We'll share the exact directions and resort location once your booking is confirmed. 📍`;
  }

  // Contact query
  if (/contact|phone|call|number|email|reach you|whatsapp/.test(msg)) {
    const wa = cfg?.whatsappNumber;
    const email = cfg?.inquiryEmail;
    const parts = [];
    if (wa) parts.push(`📱 WhatsApp / Call: ${wa}`);
    if (email) parts.push(`📧 Email: ${email}`);
    if (parts.length) return `You can reach the ${siteName} team at:\n\n${parts.join("\n")}\n\nWe're available 9am–8pm IST every day!`;
  }

  // Greeting
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|hola)/.test(msg)) {
    return `Hello! 👋 Welcome to ${siteName} — your Nature Nest getaway. How can I help you today? Feel free to ask about our packages, activities, bookings, or location!`;
  }

  // Thank you
  if (/thank|thanks|thx|ty|great|awesome|perfect|wonderful/.test(msg)) {
    return `You're most welcome! 😊 Is there anything else I can help you with? We're here to make your nature retreat truly unforgettable! 🌿`;
  }

  return null; // No match → caller will use fallback
}

function buildFallback(cfg: { whatsappNumber?: string | null; inquiryEmail?: string | null } | undefined): string {
  const wa = cfg?.whatsappNumber;
  const email = cfg?.inquiryEmail;
  const waLink = wa ? `https://wa.me/${wa.replace(/\D/g, "")}` : null;

  const lines = [
    "I don't have a specific answer for that just yet, but our team will be happy to help! 😊",
    "",
    "Please reach out to us directly:",
  ];
  if (wa) lines.push(`📞 Call / WhatsApp: ${wa}`);
  if (waLink) lines.push(`👉 [Chat on WhatsApp](${waLink})`);
  if (email) lines.push(`📧 Email: ${email}`);
  lines.push("", "We're available 9am–8pm IST and usually respond within minutes! 🌿");

  return lines.join("\n");
}

// ─── Public: create or resume session ──────────────────────────────────────
router.post("/chat/session", async (req, res): Promise<void> => {
  const { visitorName, token: existingToken } = req.body;

  if (existingToken) {
    try {
      const [existing] = await db
        .select()
        .from(chatSessionsTable)
        .where(and(eq(chatSessionsTable.token, existingToken), eq(chatSessionsTable.status, "active")));
      if (existing) { res.json(serializeDates(existing)); return; }
    } catch {}
  }

  const token = randomUUID();
  const name = (visitorName as string)?.trim() || "Guest";
  try {
    const [session] = await db
      .insert(chatSessionsTable)
      .values({ token, visitorName: name, status: "active" })
      .returning();
    broadcastAdmin("session_new", serializeDates(session));
    res.json(serializeDates(session));
  } catch {
    res.status(500).json({ error: "Failed to create session" });
  }
});

// ─── Public: send a message ────────────────────────────────────────────────
router.post("/chat/session/:token/messages", async (req, res): Promise<void> => {
  const { token } = req.params;
  const { message, sender = "visitor" } = req.body;

  if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

  const safeSender = sender === "admin" ? "admin" : "visitor";

  try {
    const [session] = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.token, token));
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    if (session.status === "closed") { res.status(400).json({ error: "Session closed" }); return; }

    const [msg] = await db
      .insert(chatMessagesTable)
      .values({ sessionId: session.id, sender: safeSender, message: message.trim() })
      .returning();

    const serialized = serializeDates(msg);
    broadcast(token, "message", serialized);

    await db
      .update(chatSessionsTable)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessionsTable.id, session.id));

    res.json(serialized);

    // Auto bot reply for visitor messages — always replies
    if (safeSender === "visitor") {
      setTimeout(async () => {
        try {
          const [cfg] = await db.select().from(settingsTable).limit(1);
          let reply = await getBotReply(message.trim());
          if (!reply) reply = buildFallback(cfg);

          const [botMsg] = await db
            .insert(chatMessagesTable)
            .values({ sessionId: session.id, sender: "bot", message: reply })
            .returning();
          broadcast(token, "message", serializeDates(botMsg));
        } catch {}
      }, 800);
    }
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ─── Public: get messages for a session ───────────────────────────────────
router.get("/chat/session/:token/messages", async (req, res): Promise<void> => {
  const { token } = req.params;
  try {
    const [session] = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.token, token));
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, session.id))
      .orderBy(asc(chatMessagesTable.createdAt));

    res.json(serializeArray(messages));
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ─── Public: SSE stream for visitor ───────────────────────────────────────
router.get("/chat/session/:token/stream", (req, res): void => {
  const { token } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch {} }, 25000);

  if (!sessionSubs.has(token)) sessionSubs.set(token, new Set());
  sessionSubs.get(token)!.add(res);

  req.on("close", () => {
    clearInterval(ping);
    sessionSubs.get(token)?.delete(res);
    if (sessionSubs.get(token)?.size === 0) sessionSubs.delete(token);
  });
});

// ─── Admin: SSE stream for all sessions ───────────────────────────────────
router.get("/chat/admin/stream", (req, res): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch {} }, 25000);
  adminSubs.add(res);

  req.on("close", () => {
    clearInterval(ping);
    adminSubs.delete(res);
  });
});

// ─── Admin: list all sessions ──────────────────────────────────────────────
router.get("/chat/sessions", async (req, res): Promise<void> => {
  try {
    const sessions = await db
      .select()
      .from(chatSessionsTable)
      .orderBy(desc(chatSessionsTable.updatedAt));

    const enriched = await Promise.all(
      sessions.map(async s => {
        const [lastMsg] = await db
          .select()
          .from(chatMessagesTable)
          .where(eq(chatMessagesTable.sessionId, s.id))
          .orderBy(desc(chatMessagesTable.createdAt))
          .limit(1);
        return { ...serializeDates(s), lastMessage: lastMsg ? serializeDates(lastMsg) : null };
      })
    );
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// ─── Admin: close a session ────────────────────────────────────────────────
router.patch("/chat/session/:token/close", async (req, res): Promise<void> => {
  const { token } = req.params;
  try {
    const [updated] = await db
      .update(chatSessionsTable)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(chatSessionsTable.token, token))
      .returning();
    if (!updated) { res.status(404).json({ error: "Session not found" }); return; }
    broadcast(token, "session_closed", serializeDates(updated));
    res.json(serializeDates(updated));
  } catch {
    res.status(500).json({ error: "Failed to close session" });
  }
});

// ─── Admin: Training CRUD ─────────────────────────────────────────────────

router.get("/chat/training", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(chatTrainingTable)
      .orderBy(asc(chatTrainingTable.sortOrder), asc(chatTrainingTable.createdAt));
    res.json(serializeArray(rows));
  } catch {
    res.status(500).json({ error: "Failed to fetch training" });
  }
});

router.post("/chat/training", async (req, res): Promise<void> => {
  const { question, answer, isActive = true, sortOrder = 0 } = req.body;
  if (!question?.trim() || !answer?.trim()) {
    res.status(400).json({ error: "question and answer are required" });
    return;
  }
  try {
    const [row] = await db
      .insert(chatTrainingTable)
      .values({ question: question.trim(), answer: answer.trim(), isActive, sortOrder })
      .returning();
    res.json(serializeDates(row));
  } catch {
    res.status(500).json({ error: "Failed to create training entry" });
  }
});

router.patch("/chat/training/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { question, answer, isActive, sortOrder } = req.body;
  try {
    const updates: Record<string, unknown> = {};
    if (question !== undefined) updates.question = question.trim();
    if (answer !== undefined) updates.answer = answer.trim();
    if (isActive !== undefined) updates.isActive = isActive;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    const [row] = await db
      .update(chatTrainingTable)
      .set(updates)
      .where(eq(chatTrainingTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeDates(row));
  } catch {
    res.status(500).json({ error: "Failed to update training entry" });
  }
});

router.delete("/chat/training/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  try {
    await db.delete(chatTrainingTable).where(eq(chatTrainingTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete training entry" });
  }
});

export default router;
