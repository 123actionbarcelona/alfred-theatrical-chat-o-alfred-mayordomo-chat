// api/alfred.js

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "https://123actionbarcelona.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { messages } = req.body;

  console.log("Iniciando llamada a la API OpenAI...");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // o el modelo que quieras usar
        messages,
      }),
    });

    const responseText = await response.text();
    console.log("Respuesta de OpenAI (texto):", responseText);

    const data = JSON.parse(responseText);

    if (!response.ok) {
      console.error("Error desde OpenAI API:", data);
      return res.status(response.status || 500).json({
        error: "Error de la API de OpenAI",
        details: data,
      });
    }

    if (!data || !data.choices || !data.choices[0]) {
      console.error("Respuesta inesperada de OpenAI:", data);
      return res.status(500).json({ error: "Respuesta incompleta de OpenAI", data });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error completo en la API:", error);
    res.status(500).json({ error: "Error en la API", details: error.message });
  }
}
