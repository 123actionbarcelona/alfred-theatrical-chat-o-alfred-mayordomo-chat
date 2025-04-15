export default async function handler(req, res) {
  const { messages } = req.body;

  console.log("Método:", req.method);
  console.log("Cuerpo recibido:", JSON.stringify(req.body, null, 2));

  if (!messages) {
    console.error("No se encontraron 'messages' en el cuerpo de la solicitud.");
    return res.status(400).json({ error: "Falta el campo 'messages' en la solicitud." });
  }

  try {
    console.log("--- Iniciando llamada a la API OpenAI ---");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18", // Modelo eficiente recomendado
        messages
      })
    });

    console.log("Status respuesta OpenAI:", response.status);
    const responseText = await response.text();
    console.log("Texto respuesta OpenAI:", responseText);

    try {
      const data = JSON.parse(responseText);

      if (!response.ok) {
        console.error("Error desde OpenAI API:", data);
        return res.status(response.status || 500).json({ error: "Error de la API de OpenAI", details: data });
      }

      if (!data || !data.choices || !data.choices[0]) {
        console.error("Respuesta inesperada de OpenAI:", data);
        return res.status(500).json({ error: "Error al procesar la respuesta de OpenAI", data });
      }

      return res.status(200).json(data);
    } catch (parseError) {
      console.error("Error al parsear JSON de OpenAI:", parseError);
      console.error("Texto recibido que causó el error:", responseText);
      return res.status(500).json({ error: "Error al procesar respuesta de OpenAI (no era JSON válido)", responseBody: responseText });
    }
  } catch (error) {
    console.error("Error completo en la API:", error);
    return res.status(500).json({ error: "Error en la API", details: error.message });
  }
}
