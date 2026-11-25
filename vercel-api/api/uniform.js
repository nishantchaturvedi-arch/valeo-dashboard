// POST /api/uniform — put a caregiver photo into the Valeo navy uniform with Google Gemini.
// Add this file to the Vercel API project (the one at dashboard-api-beta-three.vercel.app) as api/uniform.js
// together with uniform-ref.jpg (a photo in the Valeo uniform), and set the environment variable GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables.
//
// Request:  {photo: "data:image/jpeg;base64,..."}   (the caregiver photo, max ~4 MB)
// Response: {photo: "data:image/png;base64,..."}    (edited photo)  or  {error: "..."}
const ALLOWED_ORIGINS = ['https://nishantchaturvedi-arch.github.io'];
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const fs = require('fs'), path = require('path');
// photo of a caregiver in the Valeo uniform — put uniform-ref.jpg next to this file in the API project
const REFERENCE_FILE = path.join(__dirname, 'uniform-ref.jpg');
const PROMPT = [
  'Edit the FIRST image. It is a professional headshot of a caregiver.',
  'Replace ONLY the clothing with the Valeo uniform shown in the SECOND image: a navy blue V-neck scrub top',
  'with the yellow Valeo logo ("VALEO / FEEL YOUR BEST") embroidered on the left chest.',
  'Keep the person exactly the same: same face, facial features, skin tone, hair, expression, head position and pose.',
  'Use a plain light grey studio background and soft even lighting, head and shoulders framing, photorealistic.',
  'Do not change the person\'s identity, age or body shape. Do not add text other than the chest logo.'
].join(' ');

let refCache = null;
async function reference(){
  if(refCache) return refCache;
  try{ refCache = fs.readFileSync(REFERENCE_FILE).toString('base64'); }
  catch(e){ throw new Error('uniform-ref.jpg is missing next to api/uniform.js on the server'); }
  return refCache;
}

module.exports = async function handler(req, res){
  const origin = req.headers.origin || '';
  if(ALLOWED_ORIGINS.includes(origin)){ res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.status(204).end();
  if(req.method !== 'POST') return res.status(405).json({error:'POST only'});
  if(!ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({error:'not allowed'});
  const key = process.env.GEMINI_API_KEY;
  if(!key) return res.status(500).json({error:'GEMINI_API_KEY is not set on the server'});

  try{
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const m = String(body.photo || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if(!m) return res.status(400).json({error:'send {photo: "data:image/...;base64,..."}'});
    if(m[2].length > 6 * 1024 * 1024) return res.status(413).json({error:'photo too large'});

    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'x-goog-api-key': key},
      body: JSON.stringify({
        contents: [{role: 'user', parts: [
          {text: PROMPT},
          {inline_data: {mime_type: m[1], data: m[2]}},
          {inline_data: {mime_type: 'image/jpeg', data: await reference()}}
        ]}],
        generationConfig: {responseModalities: ['IMAGE']}
      })
    });
    const j = await r.json();
    if(!r.ok) return res.status(502).json({error:(j.error && j.error.message) || ('Gemini error ' + r.status)});
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const img = parts.map(p => p.inline_data || p.inlineData).find(Boolean);
    if(!img) return res.status(502).json({error:'the model did not return an image — try another photo'});
    return res.status(200).json({photo:'data:' + (img.mime_type || img.mimeType || 'image/png') + ';base64,' + img.data});
  }catch(e){
    return res.status(500).json({error:e.message || 'failed'});
  }
};

// Vercel: allow photos up to ~6 MB in the request body
module.exports.config = {api: {bodyParser: {sizeLimit: '8mb'}}};
