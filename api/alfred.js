export default async function handler(req, res) {
  const { messages } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
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

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ error: "Error en la API", details: error.message });
  }
}
