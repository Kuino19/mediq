
export async function generateSpeech(text: string): Promise<ArrayBuffer> {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        throw new Error("ELEVENLABS_API_KEY is not defined");
    }

    // Voice ID for "Rachel" (an expressive female voice) or similar default
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_monolingual_v1", // Low latency model
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("ElevenLabs API Error:", response.status, errorData);
        throw new Error(`ElevenLabs API Failed: ${response.statusText}`);
    }

    return response.arrayBuffer();
}
