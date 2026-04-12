import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Users ───────────────────────────────────────────────

  const recruiter1Hash = await bcrypt.hash('123456', 12)
  const recruiter2Hash = await bcrypt.hash('123456', 12)
  const recruiter3Hash = await bcrypt.hash('123456', 12)
  const devHash = await bcrypt.hash('123456', 12)

  const recruiter1 = await prisma.user.create({
    data: {
      name: 'Ahmad Raza',
      email: 'ahmad@arbisoft.com',
      passwordHash: recruiter1Hash,
      role: 'RECRUITER',
    }
  })

  const recruiter2 = await prisma.user.create({
    data: {
      name: 'Sara Khan',
      email: 'sara@10pearls.com',
      passwordHash: recruiter2Hash,
      role: 'RECRUITER',
    }
  })

  const recruiter3 = await prisma.user.create({
    data: {
      name: 'Usman Ali',
      email: 'usman@nextbridge.com',
      passwordHash: recruiter3Hash,
      role: 'RECRUITER',
    }
  })

  const developer = await prisma.user.create({
    data: {
      name: 'Moiz Khan',
      email: 'moiz@test.com',
      passwordHash: devHash,
      role: 'DEVELOPER',
      skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'Redis'],
    }
  })

  console.log('✅ Users created')

  // ─── Companies ───────────────────────────────────────────

  const arbisoft = await prisma.company.create({
    data: {
      name: 'Arbisoft',
      description: 'Arbisoft is a software company that builds digital products for startups and enterprises globally. We are a team of 1000+ engineers based in Pakistan.',
      recruiterId: recruiter1.id,
    }
  })

  const tenPearls = await prisma.company.create({
    data: {
      name: '10Pearls',
      description: '10Pearls is an award-winning digital innovation company helping businesses accelerate their digital transformation journey with cutting-edge technology.',
      recruiterId: recruiter2.id,
    }
  })

  const nextbridge = await prisma.company.create({
    data: {
      name: 'Nextbridge',
      description: 'Nextbridge is a leading software development company in Pakistan, delivering enterprise-grade solutions across fintech, healthtech, and edtech domains.',
      recruiterId: recruiter3.id,
    }
  })

  console.log('✅ Companies created')

  // ─── Jobs ────────────────────────────────────────────────

  await prisma.job.createMany({
    data: [
      // Arbisoft Jobs
      {
        title: 'Senior Backend Engineer',
        description: 'We are looking for a Senior Backend Engineer to join our growing platform team at Arbisoft. You will be responsible for designing and building scalable microservices, optimizing database performance, and mentoring junior engineers. You will work closely with product managers and frontend engineers to deliver high-quality features used by millions of users worldwide.',
        requiredSkills: ['Node.js', 'PostgreSQL', 'Docker', 'Redis', 'AWS'],
        salaryMin: 250000,
        salaryMax: 400000,
        location: 'Lahore (Hybrid)',
        companyId: arbisoft.id,
      },
      {
        title: 'Full Stack Developer',
        description: 'Arbisoft is hiring a Full Stack Developer to work on our SaaS products. You will be building features across the entire stack — from React frontend components to Node.js APIs and PostgreSQL databases. This is a great opportunity to work with a talented team on products used globally.',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
        salaryMin: 180000,
        salaryMax: 300000,
        location: 'Lahore (On-site)',
        companyId: arbisoft.id,
      },
      {
        title: 'DevOps Engineer',
        description: 'We are seeking an experienced DevOps Engineer to manage our cloud infrastructure, CI/CD pipelines, and deployment processes. You will work with AWS, Docker, and Kubernetes to ensure high availability and scalability of our production systems.',
        requiredSkills: ['Docker', 'AWS', 'Kubernetes', 'Linux', 'CI/CD'],
        salaryMin: 200000,
        salaryMax: 350000,
        location: 'Lahore (Remote)',
        companyId: arbisoft.id,
      },

      // 10Pearls Jobs
      {
        title: 'React Native Developer',
        description: '10Pearls is looking for a skilled React Native Developer to build cross-platform mobile applications for our US-based clients. You will collaborate with designers and backend engineers to create smooth, performant mobile experiences for iOS and Android platforms.',
        requiredSkills: ['React Native', 'React', 'TypeScript', 'REST APIs', 'Redux'],
        salaryMin: 200000,
        salaryMax: 320000,
        location: 'Karachi (Hybrid)',
        companyId: tenPearls.id,
      },
      {
        title: 'Senior Frontend Engineer',
        description: 'Join 10Pearls as a Senior Frontend Engineer and work on complex web applications for Fortune 500 clients. You will lead frontend architecture decisions, mentor junior developers, and ensure best practices in performance optimization, accessibility, and code quality.',
        requiredSkills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'GraphQL'],
        salaryMin: 220000,
        salaryMax: 380000,
        location: 'Karachi (On-site)',
        companyId: tenPearls.id,
      },
      {
        title: 'Node.js Backend Developer',
        description: '10Pearls is seeking a Node.js Backend Developer to build RESTful APIs and microservices for our fintech clients. You will work with modern backend technologies including Express.js, PostgreSQL, Redis, and AWS to deliver robust and scalable solutions.',
        requiredSkills: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Docker'],
        salaryMin: 160000,
        salaryMax: 280000,
        location: 'Karachi (Remote)',
        companyId: tenPearls.id,
      },

      // Nextbridge Jobs
      {
        title: 'Python Django Developer',
        description: 'Nextbridge is looking for a Python Django Developer to join our backend team. You will be building REST APIs, integrating third-party services, and working on data-intensive applications. Experience with machine learning integration is a plus.',
        requiredSkills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
        salaryMin: 150000,
        salaryMax: 260000,
        location: 'Islamabad (On-site)',
        companyId: nextbridge.id,
      },
      {
        title: 'MERN Stack Developer',
        description: 'Join Nextbridge as a MERN Stack Developer and work on innovative web applications for our international clients. You will be responsible for both frontend and backend development using MongoDB, Express.js, React, and Node.js in an agile environment.',
        requiredSkills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Redux'],
        salaryMin: 140000,
        salaryMax: 240000,
        location: 'Islamabad (Hybrid)',
        companyId: nextbridge.id,
      },
      {
        title: 'AI/ML Engineer',
        description: 'Nextbridge is hiring an AI/ML Engineer to develop intelligent features for our enterprise products. You will work on NLP models, recommendation systems, and data pipelines. Experience with Python, TensorFlow or PyTorch, and cloud deployment is required.',
        requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'PostgreSQL', 'Docker'],
        salaryMin: 280000,
        salaryMax: 450000,
        location: 'Islamabad (Remote)',
        companyId: nextbridge.id,
      },
    ]
  })

  console.log('✅ Jobs created')
  console.log('')
  console.log('🎉 Seed complete! Login credentials:')
  console.log('   Developer  → moiz@test.com / 123456')
  console.log('   Recruiter1 → ahmad@arbisoft.com / 123456')
  console.log('   Recruiter2 → sara@10pearls.com / 123456')
  console.log('   Recruiter3 → usman@nextbridge.com / 123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
