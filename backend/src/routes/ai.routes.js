import express from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth.js";
import allowRoles from "../middleware/rbac.js";
import prisma from "../config/db.js";
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
      // Job details lo
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

      // Resume text user profile mein save karo
      await prisma.user.update({
        where: { id: req.user.id },
        data: { resumeText },
      });

      res.json({
        message: "Resume analyzed successfully",
        jobTitle: job.title,
        analysis,
      });
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
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, requiredSkills: true },
      });
      if (!job) return res.status(404).json({ message: "Job not found" });

      console.log(`🤖 Groq generating interview questions for: ${job.title}`);

      const questions = await generateInterviewQuestions(
        job.title,
        job.requiredSkills,
      );

      res.json({
        message: "Interview questions generated",
        jobTitle: job.title,
        questions,
      });
    } catch (err) {
      console.error("Groq error:", err);
      res.status(500).json({ message: "AI service error" });
    }
  },
);

export default router;
