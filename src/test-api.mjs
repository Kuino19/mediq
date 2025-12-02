const testAPI = async () => {
    try {
        console.log('Testing /api/chat endpoint...');
        const response = await fetch('http://localhost:9002/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ text: 'Hello', sender: 'user' }]
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

testAPI();
