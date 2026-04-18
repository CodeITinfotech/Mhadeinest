import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/events", async (_req, res): Promise<void> => {
  const events = await db
    .select()
    .from(eventsTable)
    .orderBy(eventsTable.sortOrder);
  res.json(events);
});

router.post("/events", async (req, res): Promise<void> => {
  const { name, category, description, image, amenities, chargeables, minHours, sortOrder, isActive, mrp, sellingPrice } = req.body;
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const [event] = await db.insert(eventsTable).values({
    name,
    category: category || "",
    description: description || "",
    image: image || null,
    amenities: amenities || "",
    chargeables: chargeables || [],
    minHours: minHours ?? 2,
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? true,
    mrp: mrp ?? null,
    sellingPrice: sellingPrice ?? null,
  }).returning();
  res.status(201).json(event);
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { name, category, description, image, amenities, chargeables, minHours, sortOrder, isActive, mrp, sellingPrice } = req.body;
  const [event] = await db
    .update(eventsTable)
    .set({
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(amenities !== undefined && { amenities }),
      ...(chargeables !== undefined && { chargeables }),
      ...(minHours !== undefined && { minHours }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
      ...(mrp !== undefined && { mrp: mrp ?? null }),
      ...(sellingPrice !== undefined && { sellingPrice: sellingPrice ?? null }),
    })
    .where(eq(eventsTable.id, id))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [event] = await db.delete(eventsTable).where(eq(eventsTable.id, id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
