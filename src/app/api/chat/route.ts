import { NextRequest, NextResponse } from 'next/server';

// Configure runtime for Netlify
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    console.log('[Chat API] Function invoked');

    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            console.error('[Chat API] Invalid request: messages array required');
            return NextResponse.json(
                { error: 'Invalid request: messages array required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY;

        console.log('[Chat API] Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');
        console.log('[Chat API] Processing', messages.length, 'messages');

        // Build conversation for Groq
        const chatMessages = [
            {
                role: 'system',
                content: 'You are a helpful medical triage assistant for KinetiQ hospital. Ask relevant questions about symptoms, duration, and severity. Keep responses to 2-3 sentences. Do not provide medical diagnoses.'
            },
            ...messages.map((msg: { text: string; sender: string }) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }))
        ];

        // Call Groq API directly with fetch (no SDK needed)
        let retries = 3;
        let botResponseText = '';

        while (retries > 0) {
            try {
                console.log('[Chat API] Calling Groq API, retries left:', retries);

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: chatMessages,
                        temperature: 0.7,
                        max_tokens: 150,
                    }),
                });

                console.log('[Chat API] Groq response status:', response.status);

                if (response.status === 429 || response.status === 503) {
                    console.warn('[Chat API] Rate limit or service unavailable, retrying...');
                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                    return NextResponse.json(
                        { error: 'AI is currently busy. Please try again in a moment.' },
                        { status: 429 }
                    );
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('[Chat API] Groq API error:', response.status, errorData);
                    throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
                }

                const data = await response.json();
                botResponseText = data.choices[0]?.message?.content || 'I apologize, could you repeat that?';
                console.log('[Chat API] Success! Response length:', botResponseText.length);
                break;

            } catch (error: any) {
                console.error('[Chat API] Error during API call:', error.message);
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                console.error('[Chat API] All retries exhausted');
                botResponseText = "I apologize, but I'm having trouble connecting. Please try again.";
            }
        }

        return NextResponse.json({ text: botResponseText });

    } catch (error: any) {
        console.error('[Chat API] Fatal error:', error);
        console.error('[Chat API] Error stack:', error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500 }
        );
    }
}
