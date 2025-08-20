# AI-Powered Website Builder

This is a super simple, production-ready AI website builder. Describe your website in plain English, and the AI will generate and preview it instantly. You can refine your site with more prompts and download the result as a ZIP file.

## 🚀 How to Run Locally

1. **Clone this repo** (or copy the files to your machine).

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add your OpenAI API key:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and paste your OpenAI GPT-4o mini API key:
     ```env
     OPENAI_API_KEY=your-openai-gpt-4o-mini-key-here
     ```

4. **Start the app:**
```bash
npm run dev
   ```

5. **Open your browser:**
   - Go to [http://localhost:3000](http://localhost:3000)

## 📝 Features
- Chat with the AI agent to build and refine your website.
- Live preview updates instantly as you make changes.
- Download your generated website as a ZIP file.
- Reset session to start fresh anytime.

## 🛠️ Tech Stack
- Frontend: React (Next.js)
- Backend: Node.js (Next.js API routes)
- AI: OpenAI GPT-4o mini API (cost-efficient)

## 📌 Notes
- No Docker, no complex configs, no DevOps required.
- Only GPT-4o mini is used (not GPT-3.5 or GPT-4).
- All files are stored in memory for simplicity.

---

If you have any issues, just restart the app or reset your session from the menu.
