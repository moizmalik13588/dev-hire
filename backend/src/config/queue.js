const isDev = process.env.NODE_ENV !== "production";

let applicationQueue;

if (isDev) {
  const { Queue } = await import("bullmq");
  const { connection } = await import("./redis.js");

  applicationQueue = new Queue("applications", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
} else {
  // Production mein dummy queue
  applicationQueue = {
    add: async () => {
      console.log("⚠️  Queue disabled in production");
    },
  };
}

export { applicationQueue };
