import Groq from 'groq-sdk';

const testGroq = async () => {
    try {
        console.log('Testing Groq API...');
        const groq = new Groq({
            apiKey: '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',
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say hello' }
            ],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 50,
        });

        console.log('✅ Success!');
        console.log('Response:', chatCompletion.choices[0]?.message?.content);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
};

testGroq();
