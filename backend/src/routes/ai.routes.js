import express from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth.js";
import allowRoles from "../middleware/rbac.js";
import prisma from "../config/db.js";
import redis from "../config/redis.js";
import {
  reviewResume,
  generateJobDescription,
  generateInterviewQuestions,
} from "../services/groq.service.js";

const router = express.Router();

// ─── Resume Review (Developer only) ──────────────────────
router.post(
  "/resume-review",
  [
    verifyToken,
    allowRoles("DEVELOPER"),
    body("resumeText").trim().notEmpty().withMessage("Resume text required"),
    body("jobId").notEmpty().withMessage("Job ID required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { resumeText, jobId } = req.body;

    try {
      // Cache key — user + job combination
      const cacheKey = `resume:${req.user.id}:${jobId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("⚡ Cache hit:", cacheKey);
        return res.json(JSON.parse(cached));
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, requiredSkills: true },
      });
      if (!job) return res.status(404).json({ message: "Job not found" });

      console.log(`🤖 Groq analyzing resume for: ${job.title}`);
      const analysis = await reviewResume(
        resumeText,
        job.title,
        job.requiredSkills,
      );

      await prisma.user.update({
        where: { id: req.user.id },
        data: { resumeText },
      });

      const result = {
        message: "Resume analyzed successfully",
        jobTitle: job.title,
        analysis,
      };

      // Cache mein save karo — 30 min
      await redis.setex(cacheKey, 1800, JSON.stringify(result));
      console.log("💾 Cached:", cacheKey);

      res.json(result);
    } catch (err) {
      console.error("Groq error:", err);
      res.status(500).json({ message: "AI service error" });
    }
  },
);

// ─── JD Generator (Recruiter only) ───────────────────────
router.post(
  "/generate-jd",
  [
    verifyToken,
    allowRoles("RECRUITER"),
    body("jobTitle").trim().notEmpty().withMessage("Job title required"),
    body("skills").isArray({ min: 1 }).withMessage("Skills array required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { jobTitle, skills, location, salaryMin, salaryMax } = req.body;

    try {
      console.log(`🤖 Groq generating JD for: ${jobTitle}`);

      const jd = await generateJobDescription(
        jobTitle,
        skills,
        location,
        salaryMin,
        salaryMax,
      );

      res.json({
        message: "Job description generated",
        jobTitle,
        generatedJD: jd,
      });
    } catch (err) {
      console.error("Groq error:", err);
      res.status(500).json({ message: "AI service error" });
    }
  },
);

// ─── Interview Prep (Developer only) ─────────────────────
router.post(
  "/interview-prep",
  [
    verifyToken,
    allowRoles("DEVELOPER"),
    body("jobId").notEmpty().withMessage("Job ID required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { jobId } = req.body;

    try {
      // Cache check — same job pe same questions return karo
      const cacheKey = `interview:${jobId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("⚡ Cache hit:", cacheKey);
        return res.json(JSON.parse(cached));
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, requiredSkills: true },
      });
      if (!job) return res.status(404).json({ message: "Job not found" });

      console.log(`🤖 Groq generating questions for: ${job.title}`);
      const questions = await generateInterviewQuestions(
        job.title,
        job.requiredSkills,
      );

      const result = {
        message: "Interview questions generated",
        jobTitle: job.title,
        questions,
      };

      // Cache mein save karo — 1 hour (questions change nahi hoti)
      await redis.setex(cacheKey, 3600, JSON.stringify(result));
      console.log("💾 Cached:", cacheKey);

      res.json(result);
    } catch (err) {
      console.error("Groq error:", err);
      res.status(500).json({ message: "AI service error" });
    }
  },
);

export default router;
