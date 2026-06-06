export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, notes } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in Vercel environment variables."
      });
    }

    const prompt = `
You are a careful nutrition estimator.

Analyze the food photo and estimate calories and macros.

STRICT RULES:
- Use the user description as the main guide.
- If the user says "only one item", "single item", or clearly describes one food, return ONLY that food.
- If the user describes multiple foods, return those foods only.
- If no description is provided, identify only foods that are clearly visible.
- Do NOT invent extra foods.
- Do NOT include plates, table, background, stains, utensils, packaging, or hidden ingredients.
- Do NOT add sauces or side dishes unless clearly visible or mentioned.
- If uncertain, lower confidence instead of adding more items.
- Estimate portions realistically.
- Calories and macros must be approximate.

User description:
${notes || "No user description provided."}

Return JSON only in this exact format:
{
  "calories": 0,
  "protein_g": 0,
  "carbs_g": 0,
  "fat_g": 0,
  "confidence_percent": 0,
  "items": [
    {
      "name": "food name",
      "portion": "estimated portion",
      "calories": 0,
      "protein_g": 0,
      "carbs_g": 0,
      "fat_g": 0
    }
  ],
  "summary": "brief explanation"
}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: image }
            ]
          }
        ],
        text: {
          format: {
            type: "json_object"
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    const text =
      data.output_text ||
      data.output?.flatMap((o) => o.content || [])
        ?.find((c) => c.type?.includes("text"))?.text ||
      "{}";

    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
