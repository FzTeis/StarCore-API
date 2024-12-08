const Together = require("together-ai");

async function gpt(text, user = "User") {
    try {
        if (!text) {
            throw new Error("El texto no puede estar vacío.");
        }

        const together = new Together({ 
            apiKey: '03a1f1d70d6f50269975fb0ead6309437cde6371af087dcddc49a025a717027d' // Reemplaza con tu API Key de Together.AI
        });

        const initialMessages = [
            {
                role: "system",
                content: `
Eres una inteligencia artificial avanzada basada en el modelo LLaMA de Meta, diseñada para responder de manera clara, detallada y precisa a cualquier pregunta que se te formule. Tu objetivo es ofrecer respuestas comprensibles, informativas y completas sin importar el tema o la complejidad. Si no tienes información suficiente, utiliza tu creatividad y contexto para ofrecer una respuesta útil. Siempre mantén un tono profesional, amable y directo. Recuerda llamar por su nombre al usuario si crees que es necesario: ${user} (si su nombre es "User" no lo llames por su numbre. Tu creador es i'm Fz ~
`
            },
            { role: "user", content: text }
        ];

        const response = await together.chat.completions.create({
            messages: initialMessages,
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            max_tokens: null,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["<|eot_id|>", "<|eom_id|>"],
            stream: true
        });

        let generatedResponse = "";

        for await (const token of response) {
            if (token.choices && token.choices[0] && token.choices[0].delta && token.choices[0].delta.content) {
                generatedResponse += token.choices[0].delta.content;
            }
        }

        if (!generatedResponse.trim()) {
            return "Lo siento, no puedo dar una respuesta a tu pregunta.";
        }
let r = {
status: true,
creator: "I'm Fz",
result: generatedResponse.trim()
}
        return r

    } catch (error) {
        console.error("Error en la función gpt:", error);
        return "⚠️ Ocurrió un error al procesar tu solicitud. Inténtalo más tarde.";
    }
}
module.exports = { gpt }