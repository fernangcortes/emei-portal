export async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
    if (!apiKey) {
        throw new Error("Chave de API do Gemini não configurada.");
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                }
            })
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(`Erro na API do Gemini: ${response.status} - ${errBody.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Resposta inválida da API do Gemini.");
        }

        return text;
    } catch (error: any) {
        console.error("Erro no Gemini:", error);
        throw new Error(error.message || "Falha ao se comunicar com a IA.");
    }
}
