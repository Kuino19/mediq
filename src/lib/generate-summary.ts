/**
 * AI-powered summary generation for medical triage
 * Uses Groq API to analyze patient conversations and determine urgency
 */

type Message = {
    text: string;
    sender: 'user' | 'bot';
};

type SummaryResult = {
    summaryText: string;
    triageCode: 'red' | 'yellow' | 'green';
    suggestedNextSteps: string;
};

export async function generateSummary(messages: Message[]): Promise<SummaryResult> {
    const apiKey = process.env.GROQ_API_KEY;

    // Build conversation text
    const conversationText = messages
        .map(m => `${m.sender === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`)
        .join('\n');

    const systemPrompt = `You are a medical triage AI assistant. Analyze the following pre-consultation conversation and provide:

1. A concise summary of the patient's symptoms, medical history, and concerns (2-3 sentences)
2. A triage code based on urgency:
   - RED: Emergency - life-threatening symptoms, severe pain, difficulty breathing, chest pain, severe bleeding, loss of consciousness
   - YELLOW: Urgent - moderate symptoms requiring prompt attention, persistent pain, high fever, suspected fractures
   - GREEN: Non-urgent - minor symptoms, routine check-ups, mild discomfort, preventive care
3. Suggested next steps for the doctor (1-2 sentences)

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief summary of symptoms and patient concerns",
  "triageCode": "red" | "yellow" | "green",
  "nextSteps": "Recommended actions for the doctor"
}`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Conversation:\n${conversationText}` }
                ],
                temperature: 0.3, // Lower temperature for more consistent medical analysis
                max_tokens: 300,
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;

        if (!aiResponse) {
            throw new Error('No response from AI');
        }

        // Parse the JSON response
        const parsed = JSON.parse(aiResponse);

        // Validate the response
        if (!parsed.summary || !parsed.triageCode || !parsed.nextSteps) {
            throw new Error('Invalid AI response format');
        }

        // Ensure triage code is valid
        const validTriageCodes = ['red', 'yellow', 'green'];
        if (!validTriageCodes.includes(parsed.triageCode.toLowerCase())) {
            console.warn('Invalid triage code from AI, defaulting to yellow');
            parsed.triageCode = 'yellow';
        }

        return {
            summaryText: parsed.summary,
            triageCode: parsed.triageCode.toLowerCase() as 'red' | 'yellow' | 'green',
            suggestedNextSteps: parsed.nextSteps,
        };

    } catch (error) {
        console.error('Error generating summary:', error);

        // Fallback: create a basic summary from the conversation
        const patientMessages = messages.filter(m => m.sender === 'user');
        const symptoms = patientMessages.map(m => m.text).join('. ');

        return {
            summaryText: `Patient reported: ${symptoms.substring(0, 200)}...`,
            triageCode: 'yellow', // Default to urgent when AI fails
            suggestedNextSteps: 'Conduct full examination and review patient history.',
        };
    }
}
