import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";

const router: IRouter = Router();

async function checkAdminSession(req: any): Promise<boolean> {
  try {
    const cookie = req.cookies?.admin_session;
    if (!cookie) return false;
    const session = JSON.parse(cookie);
    if (!session?.id) return false;
    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, session.id));
    return !!user;
  } catch {
    return false;
  }
}

router.get("/admin/db-info", async (req, res): Promise<void> => {
  const isAdmin = await checkAdminSession(req);
  if (!isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawUrl = process.env.DATABASE_URL ?? "";
  if (!rawUrl) {
    res.json({ provider: "unknown", connected: false });
    return;
  }

  try {
    const url = new URL(rawUrl);
    const host = url.hostname;
    const port = url.port || "5432";
    const database = url.pathname.slice(1);
    const user = url.username;
    const hasPassword = !!url.password;
    const sslmode = url.searchParams.get("sslmode") ?? "prefer";

    // Detect provider from hostname
    let provider = "external";
    if (host === "helium" || host.endsWith(".helium") || host.includes("replit")) {
      provider = "replit";
    } else if (host.includes("supabase")) {
      provider = "supabase";
    } else if (host.includes("neon.tech")) {
      provider = "neon";
    } else if (host.includes("railway")) {
      provider = "railway";
    } else if (host.includes("elephantsql")) {
      provider = "elephantsql";
    }

    // Build masked connection string
    const maskedUrl = rawUrl.replace(/:([^:@]+)@/, ":••••••••@");

    res.json({
      provider,
      connected: true,
      host,
      port,
      database,
      user,
      hasPassword,
      sslmode,
      maskedUrl,
      externalExample:
        "postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB?sslmode=require",
    });
  } catch {
    res.json({ provider: "unknown", connected: false, error: "Could not parse DATABASE_URL" });
  }
});

export default router;
