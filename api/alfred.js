export default async function handler(req, res) {
  console.log("Método:", req.method);
  console.log("Cuerpo recibido:", JSON.stringify(req.body, null, 2));
  console.log("API KEY PRESENTE:", !!process.env.OPENAI_API_KEY);

  const { messages } = req.body;

  if (!messages) {
    console.error("❌ Falta el campo 'messages' en el body.");
    return res.status(400).json({ error: "Falta el campo 'messages'." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
      }),
    });

    console.log("📨 Status de OpenAI:", response.status);
    const responseText = await response.text();
    console.log("🔍 Texto crudo de OpenAI:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Error al parsear respuesta JSON de OpenAI:", parseError);
      return res.status(500).json({
        error: "Respuesta de OpenAI no era JSON válido",
        raw: responseText,
      });
    }

    if (!response.ok) {
      console.error("⚠️ OpenAI devolvió error:", data);
      return res.status(response.status).json({
        error: "Error recibido desde OpenAI",
        details: data,
      });
    }

    if (!data.choices || !data.choices[0]) {
      console.error("❌ Respuesta inesperada (sin choices):", data);
      return res.status(500).json({
        error: "Respuesta inesperada de OpenAI",
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("🔥 Error al hacer fetch a OpenAI:", error);
    return res.status(500).json({ error: "Error en la API", details: error.message });
  }
}
