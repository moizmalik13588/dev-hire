import { Worker } from "bullmq";
import { connection, publisher } from "../config/redis.js";
import prisma from "../config/db.js";
import calculateMatchScore from "../services/matching.service.js";

// Production mein Upstash hai — BullMQ compatible nahi
// Isliye worker sirf development mein chalega
if (process.env.NODE_ENV !== "production") {
  const applicationWorker = new Worker(
    "applications",
    async (job) => {
      const { applicationId, developerId, jobId } = job.data;
      console.log(`⚙️  Processing application: ${applicationId}`);

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

      if (!developer || !jobPost) throw new Error("Developer or Job not found");

      const { score, matchedSkills, missingSkills } = calculateMatchScore(
        developer.skills,
        jobPost.requiredSkills,
      );

      await prisma.application.update({
        where: { id: applicationId },
        data: { matchScore: score },
      });

      const notification = await prisma.notification.create({
        data: {
          userId: developerId,
          message: `Your application for "${jobPost.title}" was received! Match score: ${score}%`,
          type: "APPLICATION_RECEIVED",
        },
      });

      await publisher.publish(
        `notifications:${developerId}`,
        JSON.stringify({
          type: "APPLICATION_RECEIVED",
          notification,
          matchScore: score,
          matchedSkills,
          missingSkills,
        }),
      );

      console.log(`✅ Application processed — Score: ${score}%`);
      return { score, matchedSkills, missingSkills };
    },
    { connection, concurrency: 5 },
  );

  applicationWorker.on("completed", (job, result) => {
    console.log(`🎉 Job ${job.id} completed — Match: ${result.score}%`);
  });

  applicationWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
  });

  applicationWorker.on("error", (err) => {
    console.error("Worker error:", err.message);
  });
}

export default {};
