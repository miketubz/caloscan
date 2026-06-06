# CalorieScan Mobile App

A Vercel-ready React/Vite mobile web app that lets users take/upload a meal photo, estimate calories/macros using OpenAI vision, and save scan history locally.

## Local setup

```bash
npm install
npm run dev
```

## Deploy to Vercel from GitHub

1. Upload this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Add an Environment Variable:
   - `OPENAI_API_KEY` = your OpenAI API key
4. Deploy.

## Notes

- Food-photo calorie estimates are approximate.
- Add portion notes for better results, for example: `2 eggs, 1 cup rice, pork adobo, small pancit`.
- If the API key is missing, the app shows a demo estimate instead of failing.
