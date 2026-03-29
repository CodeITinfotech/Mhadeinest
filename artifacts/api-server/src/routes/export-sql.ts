import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { generateSql } from "../lib/sql-export";

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

router.get("/admin/export-sql", async (req, res): Promise<void> => {
  const isAdmin = await checkAdminSession(req);
  if (!isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const type = req.query.type === "mysql" ? "mysql" : "postgresql";
  try {
    const sql = await generateSql(type);
    const filename = `shubhangi_boathouse_${type}_${new Date().toISOString().slice(0, 10)}.sql`;
    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(sql);
  } catch (err) {
    console.error("SQL export error:", err);
    res.status(500).json({ error: "Failed to generate SQL export" });
  }
});

export default router;
