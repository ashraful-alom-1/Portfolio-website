# Ashraful Alom Portfolio

Responsive portfolio website with a secure AI-powered recruiter assistant, project showcase, resume download, and contact email workflow.

## Architecture

- `index.html`, `styles.css`, `script.js`: static GitHub Pages frontend.
- `server/server.js`: Express API hosted on Render or exported through Vercel Serverless Functions.
- `server/api/index.js`, `server/vercel.json`: Vercel adapter and rewrites for `/api/*`.
- `server/routes/assistant.js`: Gemini 1.5 Flash proxy, GitHub repository summary endpoint, and assistant guardrails.
- `server/routes/contact.js`: Resend-powered email route for the main contact form and assistant lead capture.
- `server/data/portfolioKnowledge.js`: structured knowledge base for personal details, skills, education, projects, and project classifications.

The frontend never stores or calls Gemini with a secret key. Browser requests go to the backend, and the backend calls Gemini with `GEMINI_API_KEY` from environment variables.

## Assistant Features

- Floating glassmorphism AI chat button and responsive chat window.
- Suggested recruiter questions.
- Gemini 1.5 Flash responses grounded in structured portfolio data.
- Smart project classification: Full Stack, Frontend Only, API Based, UI/UX focused, and programming practice.
- GitHub public repository metadata summary with short cache.
- Local chat memory through `localStorage`.
- Markdown response rendering.
- Lead detection for hiring, internship, freelance, interview, and collaboration messages.
- In-chat contact capture that sends email through Resend.
- Friendly error handling for API, quota, and email failures.
- Lightweight backend rate limits and CORS allowlist.

## Environment Variables

Copy `server/.env.example` to `server/.env` locally:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ashraful-alom-1.github.io
CONTACT_EMAIL=ashraful.abh@gmail.com
RESEND_API_KEY=your_resend_api_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Do not commit real API keys.

## Local Backend Setup

```bash
cd server
npm install
npm run dev
```

Test:

```bash
curl http://localhost:5000/
```

## Deployment

Frontend:

1. Push `index.html`, `styles.css`, `script.js`, images, resume, sitemap, and robots files to GitHub.
2. Enable GitHub Pages for the repository.
3. Confirm the site loads at `https://ashraful-alom-1.github.io/Portfolio-website/`.

Backend on Render:

1. Deploy the `server` folder as a Node web service.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Add all variables from `server/.env.example` in Render Environment settings.
5. After deploy, check the root endpoint and confirm `assistantConfigured` and `emailConfigured` are true.

Backend on Vercel Serverless:

1. Import/deploy the `server` folder as the Vercel project root.
2. Vercel uses `server/api/index.js` plus `server/vercel.json` to route `/api/*` to the Express app.
3. Add the same environment variables from `server/.env.example`.
4. Deploy and test:

```bash
https://your-vercel-api.vercel.app/
https://your-vercel-api.vercel.app/api/assistant
```

5. If you use Vercel instead of Render, update `getApiBaseUrl()` in `script.js` or expose `window.PORTFOLIO_API_BASE` before `script.js` loads.

Gemini setup:

1. Create a Gemini API key in Google AI Studio.
2. Add it as `GEMINI_API_KEY` on Render.
3. Set `GEMINI_MODEL=gemini-2.0-flash` unless your Google AI Studio model list shows another supported Flash model.
4. Redeploy the backend.

Resend setup:

1. Create a Resend API key.
2. Add it as `RESEND_API_KEY` on Render.
3. Set `CONTACT_EMAIL` to the destination email address.
4. For production, verify a sending domain in Resend and update the `from` address in `server/routes/contact.js`.

## Testing Checklist

- Open and close assistant on desktop and mobile.
- Send: "Which projects are full stack?"
- Send: "Why should we hire Ashraful?"
- Confirm hiring-intent messages open the lead form.
- Submit a test lead and verify email delivery.
- Refresh the page and confirm chat history persists.
- Clear chat history.
- Download resume from assistant header.
- Check browser console for frontend errors.
- Check backend logs for failed Gemini or Resend responses.

## Future Upgrades

- Add streaming responses with Gemini streaming API.
- Store leads in Supabase/Postgres in addition to email.
- Add GitHub README analysis with scheduled caching.
- Add a small admin JSON editor for updating portfolio knowledge.
- Add analytics events for recruiter question categories.
