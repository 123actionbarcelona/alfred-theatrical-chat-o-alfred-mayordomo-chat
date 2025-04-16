export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Manejar preflight (requerido por algunos navegadores)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- Procesar entrada ---
  const { messages } = req.body;

  if (!messages) {
    return res.status(400).json({ error: "Falta el campo 'messages' en la solicitud." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status || 500).json({ error: "Error en OpenAI", details: data });
    }

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Respuesta incompleta de OpenAI", data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error general:", error);
    return res.status(500).json({ error: "Error al conectar con OpenAI", details: error.message });
  }
}
