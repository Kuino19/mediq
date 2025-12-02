// Test script to diagnose submit-consultation issues
import { generateSummary } from './lib/generate-summary.js';

const testMessages = [
    { text: "I have a headache", sender: "user" },
    { text: "How long have you had it?", sender: "bot" },
    { text: "About 2 hours", sender: "user" }
];

console.log('Testing AI summary generation...');

try {
    const result = await generateSummary(testMessages);
    console.log('✅ Success!');
    console.log('Summary:', result.summaryText);
    console.log('Triage Code:', result.triageCode);
    console.log('Next Steps:', result.suggestedNextSteps);
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}
