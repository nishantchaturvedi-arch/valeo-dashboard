# Valeo uniform photo — API route

The dashboard's **Caregiver Profiles → 👔 Valeo uniform** button sends the caregiver photo to
`https://dashboard-api-beta-three.vercel.app/api/uniform`, which asks Google Gemini to put the person
in the Valeo navy uniform (copying a reference photo, `uniform-ref.jpg`) and returns the edited photo.
The person reviews it in the dashboard and chooses **Use this photo** or **Keep original**.

## Setup (once)

1. Get a Gemini API key at <https://aistudio.google.com/apikey> (Google AI Studio → Create API key).
   Image editing uses a paid tier, so billing must be enabled on the key's Google Cloud project.
2. Copy both files in `api/` — `uniform.js` and the reference photo `uniform-ref.jpg` — into the
   Vercel API project (the repo behind `dashboard-api-beta-three.vercel.app`) as `api/uniform.js` and `api/uniform-ref.jpg`.
3. In Vercel → that project → **Settings → Environment Variables**, add `GEMINI_API_KEY` = your key (Production).
4. Redeploy the project.

Optional: set `GEMINI_IMAGE_MODEL` to use a different Gemini image model (default `gemini-2.5-flash-image`).

The key stays on the server. Requests are accepted only from the dashboard's site
(`https://nishantchaturvedi-arch.github.io`).
