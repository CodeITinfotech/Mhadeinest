import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  GetMeResponse,
} from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "houseboat_salt_goa").digest("hex");
}

async function ensureAdminUser() {
  const admins = await db.select().from(adminUsersTable).limit(1);
  if (admins.length === 0) {
    await db.insert(adminUsersTable).values({
      username: "admin",
      passwordHash: hashPassword("admin123"),
      role: "admin",
    });
  }
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureAdminUser();
  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, parsed.data.username));

  if (!user || user.passwordHash !== hashPassword(parsed.data.password)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  (req as any).session = { user: { id: user.id, username: user.username, role: user.role } };
  res.cookie("admin_session", JSON.stringify({ id: user.id, username: user.username, role: user.role }), {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json(AdminLoginResponse.parse({
    user: { id: user.id, username: user.username, role: user.role },
    message: "Login successful",
  }));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  res.clearCookie("admin_session");
  (req as any).session = null;
  res.json(AdminLogoutResponse.parse({ message: "Logged out successfully" }));
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const cookie = req.cookies?.admin_session;
  if (!cookie) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const user = JSON.parse(cookie);
    res.json(GetMeResponse.parse(user));
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
});

export default router;
