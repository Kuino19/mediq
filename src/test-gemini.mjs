import { GoogleGenerativeAI } from '@google/generative-ai';

const testGemini = async () => {
    try {
        console.log('Testing Gemini API with gemini-1.5-flash...');
        const genAI = new GoogleGenerativeAI('AIzaSyBKba5sEqjHfRit_6XZTYEfTTH6rPWUw1g');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Say hello in one sentence');
        const response = result.response;
        const text = response.text();

        console.log('✅ Success! Response:', text);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.status) console.error('Status:', error.status);
    }
};

testGemini();
