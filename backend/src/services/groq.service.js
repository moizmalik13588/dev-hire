import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

// ─── Resume Review ────────────────────────────────────────
export const reviewResume = async (resumeText, jobTitle, requiredSkills) => {
  const prompt = `
You are an expert technical recruiter. Analyze this resume for a "${jobTitle}" position.

Required Skills: ${requiredSkills.join(", ")}

Resume:
${resumeText}

Respond in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "missingSkills": ["<skill 1>", "<skill 2>"],
  "recommendation": "<STRONG_MATCH | GOOD_MATCH | WEAK_MATCH | NO_MATCH>"
}

Return ONLY the JSON, no extra text.
`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const raw = response.choices[0].message.content.trim();
  return JSON.parse(raw);
};

// ─── JD Generator ────────────────────────────────────────
export const generateJobDescription = async (
  jobTitle,
  skills,
  location,
  salaryMin,
  salaryMax,
) => {
  const prompt = `
You are an expert HR professional. Write a professional job description for:

Job Title: ${jobTitle}
Required Skills: ${skills.join(", ")}
Location: ${location || "Remote"}
Salary Range: ${salaryMin ? `PKR ${salaryMin} - ${salaryMax}` : "Competitive"}

Respond in this exact JSON format:
{
  "description": "<full job description 3-4 paragraphs>",
  "responsibilities": ["<responsibility 1>", "<responsibility 2>", "<responsibility 3>", "<responsibility 4>", "<responsibility 5>"],
  "requirements": ["<requirement 1>", "<requirement 2>", "<requirement 3>", "<requirement 4>"],
  "niceToHave": ["<nice to have 1>", "<nice to have 2>", "<nice to have 3>"],
  "benefits": ["<benefit 1>", "<benefit 2>", "<benefit 3>"]
}

Return ONLY the JSON, no extra text.
`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const raw = response.choices[0].message.content.trim();
  return JSON.parse(raw);
};

// ─── Interview Prep ───────────────────────────────────────
export const generateInterviewQuestions = async (jobTitle, requiredSkills) => {
  const prompt = `
You are a senior technical interviewer. Generate interview questions for a "${jobTitle}" position.

Required Skills: ${requiredSkills.join(", ")}

Respond in this exact JSON format:
{
  "technical": [
    {"question": "<question>", "hint": "<what interviewer looks for>"},
    {"question": "<question>", "hint": "<what interviewer looks for>"},
    {"question": "<question>", "hint": "<what interviewer looks for>"},
    {"question": "<question>", "hint": "<what interviewer looks for>"},
    {"question": "<question>", "hint": "<what interviewer looks for>"}
  ],
  "behavioral": [
    {"question": "<question>", "hint": "<what interviewer looks for>"},
    {"question": "<question>", "hint": "<what interviewer looks for>"},
    {"question": "<question>", "hint": "<what interviewer looks for>"}
  ],
  "situational": [
    {"question": "<question>", "hint": "<what interviewer looks for>"},
    {"question": "<question>", "hint": "<what interviewer looks for>"}
  ]
}

Return ONLY the JSON, no extra text.
`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 2000,
  });

  const raw = response.choices[0].message.content.trim();
  return JSON.parse(raw);
};
