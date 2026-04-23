import express from "express";
import prisma from "../config/db.js";
import verifyToken from "../middleware/auth.js";
import allowRoles from "../middleware/rbac.js";
import redis from "../config/redis.js";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const RETELL_API_KEY = process.env.RETELL_API_KEY;

// ─── CREATE INTERVIEW AGENT + START CALL ─────────────────
// Developer apna interview shuru kare
router.post(
  "/start/:applicationId",
  verifyToken,
  allowRoles("DEVELOPER"),
  async (req, res) => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: req.params.applicationId },
        include: {
          job: { select: { title: true, requiredSkills: true } },
          developer: { select: { name: true, skills: true } },
        },
      });

      if (!application)
        return res.status(404).json({ message: "Application not found" });

      if (application.developerId !== req.user.id)
        return res.status(403).json({ message: "Not authorized" });

      // Already interview hai?
      const existing = await prisma.interview.findUnique({
        where: { applicationId: application.id },
      });
      if (existing && existing.status === "COMPLETED") {
        return res.status(409).json({ message: "Interview already completed" });
      }

      // Retell pe Web Call banao
      const retellRes = await fetch(
        "https://api.retellai.com/v2/create-web-call",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RETELL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: process.env.RETELL_AGENT_ID,
            metadata: {
              applicantName: application.developer.name,
              jobTitle: application.job.title,
              requiredSkills: application.job.requiredSkills.join(", "),
              applicationId: application.id,
            },
          }),
        },
      );

      const callData = await retellRes.json();
      if (!retellRes.ok) {
        console.error("Retell error:", callData);
        return res.status(500).json({ message: "Could not create call" });
      }

      // DB mein save karo
      const interview = await prisma.interview.upsert({
        where: { applicationId: application.id },
        create: {
          applicationId: application.id,
          retellCallId: callData.call_id,
          status: "IN_PROGRESS",
        },
        update: {
          retellCallId: callData.call_id,
          status: "IN_PROGRESS",
        },
      });

      res.json({
        message: "Interview started",
        accessToken: callData.access_token, // Frontend ko chahiye
        callId: callData.call_id,
        interviewId: interview.id,
      });
    } catch (err) {
      console.error("Interview start error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ─── RETELL WEBHOOK ───────────────────────────────────────
// Call complete hone pe Retell yahan POST karta hai
router.post("/webhook", async (req, res) => {
  try {
    const { event, call } = req.body;
    console.log("📞 Retell webhook:", event, call?.call_id);

    if (event === "call_ended" && call?.call_id) {
      const interview = await prisma.interview.findFirst({
        where: { retellCallId: call.call_id },
        include: {
          application: {
            include: {
              job: { select: { title: true, requiredSkills: true } },
              developer: { select: { name: true } },
            },
          },
        },
      });

      if (!interview) return res.sendStatus(200);

      const transcript = call.transcript || "";

      // Groq se score generate karo
      const scoring = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are an expert technical interviewer. Analyze the interview transcript and return ONLY a JSON object with this exact structure, no extra text:
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`,
          },
          {
            role: "user",
            content: `Job: ${interview.application.job.title}
Required Skills: ${interview.application.job.requiredSkills.join(", ")}
Candidate: ${interview.application.developer.name}

Interview Transcript:
${transcript || "No transcript available"}

Evaluate the candidate's performance.`,
          },
        ],
      });

      let score = 50,
        feedback = "",
        strengths = [],
        improvements = [];
      try {
        const raw = scoring.choices[0].message.content;
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        score = parsed.score;
        feedback = parsed.feedback;
        strengths = parsed.strengths || [];
        improvements = parsed.improvements || [];
      } catch (e) {
        console.error("Score parse error:", e);
      }

      // DB update karo
      await prisma.interview.update({
        where: { id: interview.id },
        data: {
          status: "COMPLETED",
          transcript,
          score,
          feedback,
          strengths,
          improvements,
        },
      });

      // Notification bhejo candidate ko
      await prisma.notification.create({
        data: {
          userId: interview.application.developerId,
          message: `Your interview for "${interview.application.job.title}" is complete! Score: ${score}/100`,
          type: "APPLICATION_RECEIVED",
        },
      });

      // Cache clear
      await redis.del(`applications:${interview.application.developerId}`);
      console.log(`✅ Interview scored: ${score}/100`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

// ─── GET INTERVIEW RESULT ─────────────────────────────────
router.get("/result/:applicationId", verifyToken, async (req, res) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { applicationId: req.params.applicationId },
    });

    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    res.json(interview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
