export default async function handler(req, res) {
  const { messages } = req.body;

  console.log("API KEY:", process.env.OPENAI_API_KEY); // solo para debug
  console.log("Mensajes recibidos:", messages); // debug también

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "No se han enviado mensajes válidos." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
      }),
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0]) {
      console.error("Respuesta inesperada de OpenAI:", data);
      return res.status(500).json({ error: "Error al procesar la respuesta de OpenAI", data });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Error en la API:", error);
    return res.status(500).json({ error: "Error en la API", details: error.message });
  }
}
