import { Router, type IRouter } from "express";
import { SubmitInquiryBody, SubmitInquiryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

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

  res.json(SubmitInquiryResponse.parse({ message: "Your inquiry has been received. We will contact you shortly on WhatsApp or Email!" }));
});

export default router;
