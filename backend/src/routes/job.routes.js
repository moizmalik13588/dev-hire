import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../config/db.js";
import verifyToken from "../middleware/auth.js";
import allowRoles from "../middleware/rbac.js";
import calculateMatchScore from "../services/matching.service.js";
import { applicationQueue } from "../config/queue.js";

const router = express.Router();

// ─── CREATE JOB (Recruiter only) ─────────────────────────
router.post(
  "/",
  [
    verifyToken,
    allowRoles("RECRUITER"),
    body("title").trim().notEmpty().withMessage("Title required"),
    body("description").trim().notEmpty().withMessage("Description required"),
    body("requiredSkills")
      .isArray({ min: 1 })
      .withMessage("Skills array required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      title,
      description,
      requiredSkills,
      salaryMin,
      salaryMax,
      location,
    } = req.body;

    try {
      // Recruiter ki company hai?
      const company = await prisma.company.findUnique({
        where: { recruiterId: req.user.id },
      });
      if (!company) {
        return res.status(400).json({ message: "Create a company first" });
      }

      const job = await prisma.job.create({
        data: {
          title,
          description,
          requiredSkills,
          salaryMin,
          salaryMax,
          location,
          companyId: company.id,
        },
      });

      // ⬇️ Yahan add karo — job create hone ke baad cache clear karo
      const keys = await redis.keys("jobs:*");
      if (keys.length > 0) await redis.del(...keys);

      res.status(201).json({ message: "Job posted", job });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ─── GET ALL JOBS (Public) ────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { search, skill, location } = req.query;
    const cacheKey = `jobs:${search || ""}:${skill || ""}:${location || ""}`;

    // Cache check karo pehle
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ Cache hit:", cacheKey);
      return res.json(JSON.parse(cached));
    }

    const jobs = await prisma.job.findMany({
      where: {
        ...(search && { title: { contains: search, mode: "insensitive" } }),
        ...(skill && { requiredSkills: { has: skill } }),
        ...(location && {
          location: { contains: location, mode: "insensitive" },
        }),
      },
      include: {
        company: { select: { name: true, logoUrl: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Cache mein save karo — 5 minute ke liye
    await redis.setex(cacheKey, 300, JSON.stringify(jobs));
    console.log("💾 Cached:", cacheKey);

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET SINGLE JOB (Public) ──────────────────────────────

// ─── GET MY APPLICATIONS (Developer) ─────────────────────
router.get(
  "/my/applications",
  verifyToken,
  allowRoles("DEVELOPER"),
  async (req, res) => {
    try {
      const applications = await prisma.application.findMany({
        where: { developerId: req.user.id },
        include: {
          job: {
            include: {
              company: { select: { name: true, logoUrl: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(applications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.get("/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: { select: { name: true, logoUrl: true, description: true } },
      },
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── APPLY TO JOB (Developer only) ───────────────────────
router.post(
  "/:id/apply",
  verifyToken,
  allowRoles("DEVELOPER"),
  async (req, res) => {
    try {
      const job = await prisma.job.findUnique({
        where: { id: req.params.id },
      });
      if (!job) return res.status(404).json({ message: "Job not found" });

      // Already applied?
      const existing = await prisma.application.findUnique({
        where: {
          jobId_developerId: {
            jobId: job.id,
            developerId: req.user.id,
          },
        },
      });
      if (existing) {
        return res.status(409).json({ message: "Already applied to this job" });
      }

      // Developer skills fetch karo
      const developer = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { skills: true },
      });

      // Initial match score
      const { score } = calculateMatchScore(
        developer.skills,
        job.requiredSkills,
      );

      // Application banao
      const application = await prisma.application.create({
        data: {
          jobId: job.id,
          developerId: req.user.id,
          matchScore: score,
        },
      });

      // BullMQ queue mein daalo — background processing
      await applicationQueue.add("process-application", {
        applicationId: application.id,
        developerId: req.user.id,
        jobId: job.id,
      });

      console.log(`📥 Application queued for processing: ${application.id}`);

      // Immediately respond — user wait nahi karega
      res.status(201).json({
        message: "Application submitted successfully",
        application,
        matchScore: score,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);
// ─── GET JOB APPLICATIONS (Recruiter) ────────────────────
router.get(
  "/:id/applications",
  verifyToken,
  allowRoles("RECRUITER"),
  async (req, res) => {
    try {
      const applications = await prisma.application.findMany({
        where: { jobId: req.params.id },
        include: {
          developer: {
            select: { id: true, name: true, email: true, skills: true },
          },
        },
        orderBy: { matchScore: "desc" },
      });

      res.json(applications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ─── UPDATE APPLICATION STATUS (Recruiter) ───────────────
router.patch(
  "/applications/:appId/status",
  verifyToken,
  allowRoles("RECRUITER"),
  async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      const application = await prisma.application.update({
        where: { id: req.params.appId },
        data: { status },
      });

      res.json({ message: "Status updated", application });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ─── DELETE JOB (Recruiter only) ─────────────────────────
router.delete(
  "/:id",
  verifyToken,
  allowRoles("RECRUITER"),
  async (req, res) => {
    try {
      await prisma.job.delete({ where: { id: req.params.id } });
      res.json({ message: "Job deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
