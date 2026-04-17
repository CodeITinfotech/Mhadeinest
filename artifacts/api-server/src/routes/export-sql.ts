import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { generateSql } from "../lib/sql-export";
import { createZipBuffer } from "../lib/zip-writer";

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
    const filename = `codeitweb_${type}_${new Date().toISOString().slice(0, 10)}.sql`;
    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(sql);
  } catch (err) {
    console.error("SQL export error:", err);
    res.status(500).json({ error: "Failed to generate SQL export" });
  }
});

router.get("/admin/export-zip", async (req, res): Promise<void> => {
  const isAdmin = await checkAdminSession(req);
  if (!isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const [pgSql, mySql] = await Promise.all([
      generateSql("postgresql"),
      generateSql("mysql"),
    ]);

    const zipBuf = createZipBuffer([
      {
        name: `codeitweb_postgresql_${dateStr}.sql`,
        data: Buffer.from(pgSql, "utf8"),
      },
      {
        name: `codeitweb_mysql_${dateStr}.sql`,
        data: Buffer.from(mySql, "utf8"),
      },
    ]);

    const filename = `codeitweb_database_backup_${dateStr}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", zipBuf.length);
    res.send(zipBuf);
  } catch (err) {
    console.error("ZIP export error:", err);
    res.status(500).json({ error: "Failed to generate ZIP export" });
  }
});

export default router;
