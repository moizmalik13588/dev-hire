import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../config/db.js";
import verifyToken from "../middleware/auth.js";
import allowRoles from "../middleware/rbac.js";

const router = express.Router();

// ─── CREATE COMPANY (Recruiter only) ─────────────────────
router.post(
  "/",
  [
    verifyToken,
    allowRoles("RECRUITER"),
    body("name").trim().notEmpty().withMessage("Company name required"),
    body("description").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, description, logoUrl } = req.body;

    try {
      // Recruiter ka already company hai?
      const existing = await prisma.company.findUnique({
        where: { recruiterId: req.user.id },
      });
      if (existing) {
        return res.status(409).json({ message: "You already have a company" });
      }

      const company = await prisma.company.create({
        data: {
          name,
          description,
          logoUrl,
          recruiterId: req.user.id,
        },
      });

      res.status(201).json({ message: "Company created", company });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ─── GET MY COMPANY (Recruiter) ───────────────────────────
router.get("/me", verifyToken, allowRoles("RECRUITER"), async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { recruiterId: req.user.id },
      include: {
        jobs: {
          include: {
            _count: { select: { applications: true } },
          },
        },
      },
    });

    if (!company) return res.status(404).json({ message: "No company found" });

    // Total applications count manually calculate karo
    const totalApplications = company.jobs.reduce(
      (acc, job) => acc + (job._count?.applications || 0),
      0,
    );

    res.json({ ...company, totalApplications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET ALL COMPANIES (Public) ───────────────────────────
router.get("/", async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { _count: { select: { jobs: true } } },
    });
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── UPDATE COMPANY (Recruiter only) ─────────────────────
router.put("/", verifyToken, allowRoles("RECRUITER"), async (req, res) => {
  const { name, description, logoUrl } = req.body;

  try {
    const company = await prisma.company.update({
      where: { recruiterId: req.user.id },
      data: { name, description, logoUrl },
    });
    res.json({ message: "Company updated", company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
