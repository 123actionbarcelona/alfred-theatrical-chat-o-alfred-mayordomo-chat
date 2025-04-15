// En tu archivo de API (ej: /pages/api/openai.js o /app/api/openai/route.js)

export default async function handler(req, res) {
  // 1. Verificar Método HTTP
  if (req.method !== 'POST') {
    console.log(`Método no permitido: ${req.method}`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} No Permitido` });
  }

  console.log("--- Iniciando llamada a API OpenAI ---");

  // 2. Verificar API Key (importante para Vercel)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Error crítico: La variable de entorno OPENAI_API_KEY no está configurada en Vercel.");
    // No expongas detalles de configuración al cliente
    return res.status(500).json({ error: "Error de configuración del servidor." });
  }

  // 3. Obtener y validar 'messages' del cuerpo de la solicitud
  let messages;
  try {
    // Asegurarse que el body es parseado (Vercel/Next.js usualmente lo hace si Content-Type es correcto)
    // Si usas Next.js 13+ App Router, necesitas await req.json()
    // const body = await req.json(); // Descomenta si usas App Router
    // messages = body.messages; // Descomenta si usas App Router
    
    // Para Pages Router (o si ya tienes req.body parseado):
    messages = req.body.messages; 

    console.log("Cuerpo recibido (parcial):", JSON.stringify(req.body, null, 2)); // Log para ver qué llega

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Error: 'messages' no encontrado, no es un array o está vacío en req.body:", req.body);
      return res.status(400).json({ error: "El campo 'messages' es requerido en el cuerpo de la solicitud y debe ser un array no vacío." });
    }
    console.log("Mensajes recibidos para enviar a OpenAI:", JSON.stringify(messages, null, 2));

  } catch (parseError) {
    console.error("Error al parsear el cuerpo de la solicitud JSON:", parseError);
    return res.status(400).json({ error: "Cuerpo de la solicitud inválido, se esperaba JSON." });
  }


  // 4. Realizar la llamada a la API de OpenAI
  try {
    console.log("Enviando petición a OpenAI...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`, // Usar la variable verificada
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // O el modelo que prefieras
        messages: messages, // Usar los mensajes validados
        // stream: false, // Asegúrate que no estás esperando un stream si no lo manejas
      }),
    });

    console.log(`Respuesta de OpenAI recibida. Status: ${response.status} ${response.statusText}`);

    // Leer el cuerpo como texto primero para poder loguearlo siempre
    const responseText = await response.text();
    console.log("Cuerpo de la respuesta (raw text):", responseText);

    let data;
    try {
      // Intentar parsear el texto como JSON
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Error al parsear la respuesta JSON de OpenAI:", jsonError);
      console.error("El texto recibido no era JSON válido:", responseText);
      // Devolver error indicando que la respuesta de OpenAI no fue JSON
      // Podría ser un error 502 Bad Gateway si consideramos que OpenAI falló
      return res.status(502).json({ error: "La respuesta de OpenAI no fue un JSON válido.", details: responseText });
    }

    // 5. Manejar la respuesta de OpenAI (éxito o error HTTP)
    if (!response.ok) {
      // La API devolvió un error (4xx, 5xx)
      console.error(`Error de la API de OpenAI (Status ${response.status}):`, data);
      // Devuelve el estado y el cuerpo del error de OpenAI al cliente
      // Es importante devolver 'data' aquí porque a menudo contiene la razón del error de OpenAI
      return res.status(response.status).json({ 
          error: "Error recibido desde la API de OpenAI.", 
          openai_error: data // Anida el error original de OpenAI
      });
    }

    // 6. Validar la estructura esperada en caso de éxito (200 OK)
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Respuesta exitosa de OpenAI (200 OK) pero con estructura inesperada:", data);
      return res.status(500).json({ error: "Respuesta inesperada de OpenAI.", data_received: data });
    }

    // 7. Devolver la respuesta exitosa al cliente
    console.log("Respuesta de OpenAI procesada exitosamente.");
    res.status(200).json(data);

  } catch (error) {
    // Captura errores de red (fetch falló) u otros errores inesperados
    console.error("Error inesperado en el handler de la API:", error);
    res.status(500).json({ error: "Error interno del servidor.", details: error.message });
  }
}
