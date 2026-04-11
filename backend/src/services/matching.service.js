const calculateMatchScore = (developerSkills, jobSkills) => {
  if (!jobSkills.length)
    return { score: 0, matchedSkills: [], missingSkills: [] };

  const devSet = new Set(developerSkills.map((s) => s.toLowerCase()));

  const matchedSkills = jobSkills.filter((s) => devSet.has(s.toLowerCase()));
  const missingSkills = jobSkills.filter((s) => !devSet.has(s.toLowerCase()));

  const score = Math.round((matchedSkills.length / jobSkills.length) * 100);

  return { score, matchedSkills, missingSkills };
};

export default calculateMatchScore;
