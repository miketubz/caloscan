export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { image, notes } = req.body || {};
    if (!image) return res.status(400).json({ error: 'No image provided' });
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY in Vercel environment variables.' });

    const prompt = `
Analyze this food photo for calorie estimation.

IMPORTANT RULES:
- If the user notes/description says there is only one item, return ONLY that one food item.
- Do NOT invent extra foods.
- Do NOT list background objects, plates, sauce stains, table items, or possible hidden ingredients.
- If unsure, use the user's description as the main source of truth.
- Return JSON only.

User description:
${notes || "No user description provided"}

Return this JSON format:
{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "confidence_percent": number,
  "items": [
    {
      "name": "food item name",
      "portion": "estimated portion",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number
    }
  ],
  "summary": "short explanation"
}
`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [{
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: image }
          ]
        }],
        text: { format: { type: 'json_object' } }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'OpenAI request failed' });

    const text = data.output_text || data.output?.flatMap(o => o.content || []).find(c => c.type?.includes('text'))?.text || '{}';
    res.status(200).json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
