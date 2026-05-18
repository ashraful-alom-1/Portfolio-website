const express = require('express');
const portfolioKnowledge = require('../data/portfolioKnowledge');

const router = express.Router();

const GITHUB_USER = 'ashraful-alom-1';
const githubCache = {
  data: null,
  fetchedAt: 0
};

function truncateText(value, max = 8000) {
  const text = String(value || '').trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function cleanMessages(messages = []) {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-10)
    .map(item => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: truncateText(item.content, 1200)
    }))
    .filter(item => item.content);
}

function estimateIntent(message) {
  const text = String(message || '').toLowerCase();
  const hiringWords = [
    'hire',
    'internship',
    'job',
    'interview',
    'recruiter',
    'available',
    'freelance',
    'collaborate',
    'opportunity',
    'contact us',
    'schedule'
  ];

  return {
    hiringIntent: hiringWords.some(word => text.includes(word)),
    contactIntent: ['contact', 'email', 'call', 'message', 'connect'].some(word => text.includes(word))
  };
}

function includesAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function getFallbackReply() {
  return portfolioKnowledge.assistantPolicy.fallback;
}

function isHinglish(message) {
  const text = String(message || '').toLowerCase();
  return /\b(tum|tumhara|tera|aap|kaun|kya|kaise|kahan|kis|mein|hai|ho|karte|batao|padhai|naam|rehta|rehti|hoon|kyun|kitna|kaunsa|konsi|accha|weak|pura|portfolio kiska)\b/.test(text);
}

function normalizeQuery(message) {
  return String(message || '')
    .toLowerCase()
    .replace(/[^\w\s.+#-]/g, ' ')
    .replace(/\b(his|her|their|your|you|he|him|ashraful|alom|please|tell|me|about|what|is|are|do|does|can|could|would|the|a|an)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesIntent(message, intent) {
  const aliases = portfolioKnowledge.assistantPolicy?.intentAliases?.[intent] || [];
  const raw = String(message || '').toLowerCase();
  const normalized = normalizeQuery(message);
  return aliases.some(alias => {
    const normalizedAlias = normalizeQuery(alias);
    const rawAlias = String(alias).toLowerCase();
    if (rawAlias.length <= 3) {
      return new RegExp(`\\b${rawAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(raw);
    }
    if (rawAlias.includes(' ') && normalizedAlias.split(/\s+/).length < 2) {
      return raw.includes(rawAlias);
    }
    if (!rawAlias.includes(' ')) {
      const exactRaw = new RegExp(`\\b${rawAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(raw);
      const normalizedWords = normalized.split(/\s+/);
      return exactRaw || normalizedWords.includes(normalizedAlias);
    }
    return raw.includes(rawAlias) || Boolean(normalizedAlias && normalized.includes(normalizedAlias));
  });
}

function hasUnsupportedRequest(message) {
  const text = String(message || '').toLowerCase();
  
  // NEVER block greetings
  if (/^(hi|hello|hey|hii|heyy|hiii|heya|howdy|yo|sup|wassup|good morning|good evening|namaste)/i.test(text) && text.length < 30) {
    return false;
  }
  
  const unsupported = [
    'meaning', 'mean', 'matlab', 'pronounce', 'nickname', 'ash bulana',
    'cgpa', 'gpa', 'marks', 'percentage', 'rank', 'jee', 'semester', 'sem',
    'backlog', 'attendance', 'fee', 'quota', 'aicte', 'ranking',
    'age', 'phone', 'number', 'salary', 'ctc', 'stipend', 'hourly rate',
    'family', 'born', 'birth', 'permanent address', 'exact location',
    'database', 'mongodb', 'sql', 'nosql', 'firebase', 'node', 'express',
    'redux', 'figma', 'bootstrap', 'docker', 'devops', 'ci/cd', 'jest',
    'graphql', 'api', 'rest api', 'payment', 'stripe', 'razorpay', 'hipaa',
    'medical records', 'admin panel', 'dashboard', 'patient login', 'user registration',
    'localstorage', 'wishlist', 'search functionality', 'filter', 'coupon',
    'review', 'rating', 'video', 'walkthrough', 'days', 'timeline', 'took',
    'alone', 'contribution', 'state management', 'pages', 'count',
    'mentor', 'guru', 'blogs', 'channels', 'hackathon', 'competition',
    'open source', 'twitter', 'youtube', 'linkedin connections',
    'favorite', 'food', 'movie', 'music', 'weather', 'lunch', 'coffee',
    'weakness', 'weaknesses', 'weak points', 'limitations', 'drawbacks',
    'areas of improvement', 'not good at', 'struggle with', 'kami'
  ];
  return unsupported.some(item => {
    const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return item.includes(' ') ? text.includes(item) : new RegExp(`\\b${escaped}\\b`).test(text);
  });
}

function buildFreePortfolioReply(message) {
  const text = String(message || '').toLowerCase();
  const normalized = normalizeQuery(message);
  const projects = portfolioKnowledge.projects;
  const skills = portfolioKnowledge.skills;
  const person = portfolioKnowledge.person;
  const hinglish = isHinglish(message);

  const projectList = projects
    .map(project => `- **${project.name}**: ${project.description} Tech: ${project.technologies.join(', ')}.`)
    .join('\n');

  const matchedProject = projects.find(project => {
    const name = project.name.toLowerCase();
    const meaningfulParts = name
      .split(/\s+/)
      .filter(part => part.length > 4 && !['project', 'website', 'language', 'programs', 'platform'].includes(part));
    return text.includes(name) ||
      (name === 'abhayapuri care hospital' && includesAny(text, ['hospital project', 'hospital management', 'healthcare project'])) ||
      (name === 'c language programs' && includesAny(text, ['c program', 'c language program', 'c language programs'])) ||
      meaningfulParts.some(part => text.includes(part));
  });

  if (hasUnsupportedRequest(message)) {
    return getFallbackReply();
  }

  if (matchesIntent(text, 'conversation') && text.length < 50) {
    return hinglish
      ? 'Hi! Main Ashraful Alom hoon. Mere portfolio ke baare mein poocho — skills, projects, education, ya contact.'
      : "Hi! I'm Ashraful Alom. Ask me about my skills, projects, education, or why I'd be a great fit for your team.";
  }

  if (matchedProject) {
    return hinglish
      ? `**${matchedProject.name}**: ${matchedProject.description}\n\nTech: ${matchedProject.technologies.join(', ')}.`
      : `**${matchedProject.name}**: ${matchedProject.description}\n\nTech: ${matchedProject.technologies.join(', ')}.`;
  }

  if (matchesIntent(text, 'experience')) {
    return hinglish
      ? `Mere paas **3+ years learning experience** hai. Main **fresher** hoon, first professional role actively seek kar raha hoon, aur prior company employment nahi hai.`
      : `I have **3+ years of learning experience**. I am a **fresher actively seeking my first professional role** and have **no prior company employment**.`;
  }

  if (matchesIntent(text, 'languages')) {
    return `I know these languages:\n${person.languages.map(item => `- **${item.name}:** ${item.level}. ${item.details}`).join('\n')}`;
  }

  if (matchesIntent(text, 'identity') || matchesIntent(text, 'profession')) {
    return hinglish
      ? `Main Ashraful Alom hoon, ek **${person.title}**. Main ${person.location} se hoon.`
      : `I'm Ashraful Alom, a **${person.title}** from ${person.location}.`;
  }

  if (matchesIntent(text, 'location')) {
    return hinglish
      ? `Main **${person.location}** mein rehta hoon.`
      : `I am based in **${person.location}**.`;
  }

  if (matchesIntent(text, 'skills')) {
    return hinglish
      ? `Meri verified technical skills hain: ${skills.technical.join(', ')}.`
      : `My verified technical skills are: ${skills.technical.join(', ')}.`;
  }

  if (matchesIntent(text, 'softSkills')) {
    return hinglish
      ? `Meri verified strengths/soft skills hain: ${skills.soft.join(', ')}.`
      : `My verified strengths and soft skills are: ${skills.soft.join(', ')}.`;
  }

  if (matchesIntent(text, 'projects') || includesAny(normalized, ['project', 'work', 'portfolio'])) {
    return hinglish
      ? `Mere portfolio mein 9 verified projects hain:\n${projectList}`
      : `I have 9 verified projects:\n${projectList}`;
  }

  if (matchesIntent(text, 'education') || includesAny(normalized, ['education', 'study', 'degree'])) {
    const education = portfolioKnowledge.education
      .map(item => `- **${item.degree}**, ${item.institute} (${item.period})${item.status ? ` - ${item.status}` : ''}`)
      .join('\n');
    return hinglish ? `Meri education:\n${education}` : `My education:\n${education}`;
  }

  if (matchesIntent(text, 'certifications')) {
    return `My verified certifications are:\n${portfolioKnowledge.certifications.map(item => `- ${item}`).join('\n')}`;
  }

  if (matchesIntent(text, 'awards')) {
    return `My verified award is:\n${portfolioKnowledge.awards.map(item => `- ${item}`).join('\n')}`;
  }

  if (matchesIntent(text, 'hobbies')) {
    return `My hobbies are ${person.hobbies.join(', ')}.`;
  }

  if (includesAny(text, ['contact', 'email', 'linkedin', 'message', 'connect'])) {
    return `You can contact me at [${person.email}](mailto:${person.email}).`;
  }

  return getFallbackReply();
}

function classifyRepo(repo) {
  const language = repo.language || '';
  const name = repo.name || '';
  const description = repo.description || '';
  const text = `${name} ${description} ${language}`.toLowerCase();
  const categories = [];

  if (text.includes('next') || text.includes('hospital') || text.includes('management')) {
    categories.push('Full Stack');
  }
  if (['html', 'css', 'javascript'].includes(language.toLowerCase()) || text.includes('website')) {
    categories.push('Frontend Only');
  }
  if (text.includes('api')) categories.push('API Based');
  if (text.includes('ai') || text.includes('ml') || text.includes('machine')) categories.push('AI/ML');
  if (text.includes('server') || text.includes('backend')) categories.push('Backend');
  if (!categories.length) categories.push('Repository');

  return [...new Set(categories)];
}

async function fetchGithubSummary() {
  const cacheAge = Date.now() - githubCache.fetchedAt;
  if (githubCache.data && cacheAge < 30 * 60 * 1000) {
    return githubCache.data;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ashraful-portfolio-assistant'
      }
    });

    if (!response.ok) throw new Error(`GitHub API failed with ${response.status}`);

    const repos = await response.json();
    githubCache.data = {
      user: GITHUB_USER,
      fetchedAt: new Date().toISOString(),
      repositories: repos.map(repo => ({
        name: repo.name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
        url: repo.html_url,
        homepage: repo.homepage || '',
        archived: repo.archived,
        categories: classifyRepo(repo)
      }))
    };
    githubCache.fetchedAt = Date.now();
    return githubCache.data;
  } catch (error) {
    return {
      user: GITHUB_USER,
      unavailable: true,
      message: 'GitHub live metadata is temporarily unavailable. Use verified portfolio project data instead.'
    };
  }
}

router.get('/github-summary', async (req, res) => {
  const summary = await fetchGithubSummary();
  res.json({ success: true, data: summary });
});

// Simplified assistant route - always uses fallback, no Gemini
router.post('/assistant', async (req, res) => {
  try {
    const userMessage = req.body?.message;
    
    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please send a question for the assistant.'
      });
    }
    
    const githubSummary = await fetchGithubSummary();
    const intent = estimateIntent(userMessage);
    
    // Always use free portfolio knowledge - no Gemini API
    const reply = buildFreePortfolioReply(userMessage);
    
    res.json({
      success: true,
      reply,
      meta: {
        model: 'free-portfolio-knowledge',
        fallback: true,
        hiringIntent: intent.hiringIntent,
        contactIntent: intent.contactIntent,
        githubLiveData: !githubSummary.unavailable
      }
    });
  } catch (error) {
    console.error('Assistant route error:', error);
    res.json({
      success: true,
      reply: getFallbackReply(),
      meta: {
        model: 'free-portfolio-knowledge',
        fallback: true
      }
    });
  }
});

module.exports = router;