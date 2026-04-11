import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import prisma from "../config/db.js";
import calculateMatchScore from "../services/matching.service.js";

const applicationWorker = new Worker(
  "applications",
  async (job) => {
    const { applicationId, developerId, jobId } = job.data;

    console.log(`⚙️  Processing application: ${applicationId}`);

    // 1. Developer aur Job fetch karo
    const [developer, jobPost] = await Promise.all([
      prisma.user.findUnique({
        where: { id: developerId },
        select: { skills: true, name: true },
      }),
      prisma.job.findUnique({
        where: { id: jobId },
        select: { requiredSkills: true, title: true },
      }),
    ]);

    if (!developer || !jobPost) {
      throw new Error("Developer or Job not found");
    }

    // 2. Match score calculate karo
    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      developer.skills,
      jobPost.requiredSkills,
    );

    // 3. Application update karo score ke saath
    await prisma.application.update({
      where: { id: applicationId },
      data: { matchScore: score },
    });

    // 4. Notification banao
    await prisma.notification.create({
      data: {
        userId: developerId,
        message: `Your application for "${jobPost.title}" has been received! Match score: ${score}%`,
        type: "APPLICATION_RECEIVED",
      },
    });

    console.log(`✅ Application processed — Score: ${score}%`);
    console.log(`   Matched: ${matchedSkills.join(", ")}`);
    console.log(`   Missing: ${missingSkills.join(", ")}`);

    return { score, matchedSkills, missingSkills };
  },
  {
    connection,
    concurrency: 5, // 5 applications ek saath process
  },
);

// Worker events
applicationWorker.on("completed", (job, result) => {
  console.log(`🎉 Job ${job.id} completed — Match: ${result.score}%`);
});

applicationWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

applicationWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

export default applicationWorker;
