const testHF = async () => {
    try {
        console.log('Testing google/flan-t5-base...');
        const response = await fetch(
            'https://api-inference.huggingface.co/models/google/flan-t5-base',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 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',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: 'What symptoms do you have?',
                }),
            }
        );

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

testHF();
