import { Router, type IRouter } from "express";
import { SubmitInquiryBody, SubmitInquiryResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { inquiriesTable } from "@workspace/db/schema";
import { serializeArray } from "../lib/serialize";

const router: IRouter = Router();

// Public: submit inquiry
router.post("/inquiry", async (req, res): Promise<void> => {
  const parsed = SubmitInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, phone, checkIn, checkOut, guests, message } = parsed.data;

  req.log.info(
    { name, email, phone, checkIn, checkOut, guests },
    `New inquiry received: ${message.slice(0, 100)}`
  );

  try {
    await db.insert(inquiriesTable).values({
      name,
      email,
      phone: phone || "",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      guests: guests || 2,
      message,
    });
  } catch (err) {
    req.log.error(err, "Failed to save inquiry to DB");
  }

  res.json(SubmitInquiryResponse.parse({ message: "Your inquiry has been received. We will contact you shortly on WhatsApp or Email!" }));
});

// Admin: list all inquiries
router.get("/inquiries", async (req, res): Promise<void> => {
  try {
    const inquiries = await db
      .select()
      .from(inquiriesTable)
      .orderBy(inquiriesTable.createdAt);
    res.json(serializeArray(inquiries));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

export default router;
