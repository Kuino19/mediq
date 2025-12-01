const testAPI = async () => {
    try {
        const response = await fetch('http://localhost:9002/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ text: 'Hello', sender: 'user' }]
            })
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};

testAPI();
