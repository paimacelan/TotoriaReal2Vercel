<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1m8WHvJofqA6KEOgx2RVLwTVivjgQBJTm

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

To deploy this project on Vercel:

1.  Push the code to a GitHub repository.
2.  Import the project in Vercel.
3.  Add the following Environment Variables in the Vercel project settings:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `GEMINI_API_KEY` (if used)
4.  Deploy.
