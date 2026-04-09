/**
 * Kinetiq – 5-Patient Realistic Simulation
 * Patients speak in pure lay language – no self-diagnosis, no medical terms.
 * The AI chat + summary pipeline is called exactly as the live app does.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.argv[2];
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const CHAT_MODEL = 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) { console.error('GROQ_API_KEY missing'); process.exit(1); }

// ── Helpers ───────────────────────────────────────────────────────────────────

async function groq(messages, json = false, max = 300) {
    const body = { model: CHAT_MODEL, messages, temperature: 0.4, max_tokens: max };
    if (json) body.response_format = { type: 'json_object' };
    const r = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`Groq ${r.status}: ${await r.text()}`);
    return (await r.json()).choices[0].message.content;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Triage summary prompt (identical to src/lib/generate-summary.ts) ─────────

const SUMMARY_PROMPT = `You are a medical triage AI assistant. Analyze the following pre-consultation conversation and provide:
1. A concise summary of the patient's symptoms, medical history, and concerns (2-3 sentences)
2. A triage code:
   - RED: Emergency – life-threatening (severe chest pain, difficulty breathing, stroke signs, severe bleeding, collapse)
   - YELLOW: Urgent – moderate, needs prompt attention (high fever, significant pain, suspected serious condition)
   - GREEN: Non-urgent – mild, routine, or follow-up
3. Suggested next steps for the doctor (1-2 sentences)
Respond ONLY with valid JSON: {"summary":"...","triageCode":"red"|"yellow"|"green","nextSteps":"..."}`;

// ── The 5 patients ─────────────────────────────────────────────────────────────
// Responses are written as a real uninformed patient would speak:
//   - No diagnosis names, only lay descriptions of what they feel
//   - Medical history phrased as "the doctor told me / I take a tablet for..."
//   - Allergies phrased as personal experience ("I had a reaction / I broke out")

const PATIENTS = [
    // ─── 1. LOW ───────────────────────────────────────────────────────────────
    {
        id: 1,
        name: 'Adeola Bakare',
        age: 34, sex: 'F',
        complexity: 'Low',
        expected_triage: 'green',
        chief_complaint: 'Headache and dizziness (on BP treatment)',
        baseline_mins: 8,
        Kinetiq_mins: 2,
        // Scripted patient turns – realistic, no self-diagnosis
        patient_turns: [
            // Bot opens: "Hello! I'm the Kinetiq virtual assistant. How can I help you today?"
            "I have been having this pounding headache and I feel a bit dizzy. I am not sure what is causing it.",
            // Bot: "How long have you been feeling this way?"
            "It has been going on for about three days now.",
            // Bot: "Can you describe the pain? How severe is it on a scale of 1 to 10?"
            "It is more like a dull, throbbing pain, mostly around the back of my head. I would say maybe a 4 out of 10. The dizziness is mild, not like the room is spinning, just a little unsteady.",
            // Bot: "Do you have any other symptoms?"
            "No, just the headache and the dizziness. No vomiting or anything like that.",
            // Bot: "Have you had any medical conditions before or are you on any medications?"
            "Yes, the doctor told me my blood pressure is high so I take a tablet every morning. I think it is called Amlodipine. I have been on it for about two years.",
            // Bot: "Any allergies or other concerns?"
            "No allergies that I know of. I just want to make sure my blood pressure is okay.",
        ],
    },

    // ─── 2. MEDIUM ────────────────────────────────────────────────────────────
    {
        id: 2,
        name: 'Femi Adegoke',
        age: 25, sex: 'M',
        complexity: 'Medium',
        expected_triage: 'yellow',
        chief_complaint: 'Sudden abdominal pain moving to lower right',
        baseline_mins: 11,
        Kinetiq_mins: 3,
        patient_turns: [
            "I am having a bad pain in my stomach, it started this morning and it keeps coming and going.",
            "It started just a few hours ago, maybe since around 6 this morning.",
            "The pain is crampy, like something squeezing inside. It started around my belly button but now it feels more towards the lower right side of my stomach. I would say about a 6 or 7 out of 10.",
            "I feel slightly sick to my stomach, like I might vomit. I have not vomited yet though. No diarrhoea.",
            "No, I have never had any serious illness before and I am not on any medication.",
            "The pain on the right side is getting worse and I am a bit scared. I have never felt this kind of pain before.",
        ],
    },

    // ─── 3. MEDIUM (allergy flagged) ─────────────────────────────────────────
    {
        id: 3,
        name: 'Aisha Usman',
        age: 37, sex: 'F',
        complexity: 'Medium',
        expected_triage: 'yellow',
        chief_complaint: 'Pelvic pain and unusual discharge (allergy to a common antibiotic)',
        baseline_mins: 11,
        Kinetiq_mins: 3,
        patient_turns: [
            "I have been having pain in my lower belly and there is a discharge that is not normal for me.",
            "It started about five days ago.",
            "The pain is a dull ache, low down in my belly. I would say about a 6 out of 10. The discharge is yellowish and has a slight smell.",
            "I also have a mild fever and the pain gets worse when I walk around. I feel generally unwell.",
            "I have no known medical conditions. But I need to mention that I once took an antibiotic, a capsule, and I got a very bad rash all over my body. The doctor at another hospital told me never to take that type of antibiotic again. I do not remember the exact name.",
            "I am very worried because this type of discharge has never happened to me before.",
        ],
    },

    // ─── 4. HIGH / RED-FLAG ───────────────────────────────────────────────────
    {
        id: 4,
        name: 'Chukwuemeka Obi',
        age: 58, sex: 'M',
        complexity: 'High',
        expected_triage: 'red',
        chief_complaint: 'Crushing chest pain radiating to left arm (STEMI)',
        baseline_mins: 14,
        Kinetiq_mins: 4,
        patient_turns: [
            "Please I need help quickly. I have a very severe pain in the middle of my chest, it is spreading down my left arm.",
            "It started about 45 minutes ago and it has not stopped at all.",
            "It feels like something very heavy is sitting on my chest and squeezing it. I have never felt anything like this in my life. It is 10 out of 10.",
            "I am sweating a lot, I feel like I want to vomit, and I am finding it hard to breathe properly.",
            "The doctor told me my blood pressure is high and I have sugar in my blood. I take a white tablet for the blood pressure and a round tablet for the sugar every day.",
            "Please I am very scared, something is very wrong with me, I need to see the doctor immediately.",
        ],
    },

    // ─── 5. HIGH / RED-FLAG ───────────────────────────────────────────────────
    {
        id: 5,
        name: 'Mama Eze',
        age: 65, sex: 'F',
        complexity: 'High',
        expected_triage: 'red',
        chief_complaint: 'Thunderclap worst headache of life + stiff neck (Subarachnoid haemorrhage)',
        baseline_mins: 14,
        Kinetiq_mins: 4,
        patient_turns: [
            "I have the worst headache of my entire life. It hit me very suddenly like something exploded in my head.",
            "It came on about 30 minutes ago very suddenly. One moment I was fine, the next moment it was like a thunderclap.",
            "It is the most severe pain I have ever experienced in my life. A 10 out of 10. It is all over my head.",
            "My neck is very stiff, I cannot bend it forward. I have vomited twice since it started. I feel confused.",
            "I take a tablet for my blood pressure, I have had high blood pressure for many years.",
            "This is not a normal headache. Something is very wrong. Please I need the doctor to see me right now.",
        ],
    },
];

// ── AI Chat System Prompt (same as production) ────────────────────────────────

const CHAT_SYSTEM = `You are a helpful medical pre-consultation assistant for Kinetiq hospital. 
Your job is to gather information about the patient's symptoms through a natural conversation.
Ask one clear question at a time. Cover: main complaint, duration, character/severity, associated symptoms, medical history, medications/allergies.
Keep each response to 1-2 sentences. Do NOT give medical diagnoses or treatment advice.`;

// ── Run simulation ────────────────────────────────────────────────────────────

const allResults = [];

console.log('\n════════════════════════════════════════════════════');
console.log('  Kinetiq – 5-Patient Realistic Simulation');
console.log('════════════════════════════════════════════════════\n');

for (const patient of PATIENTS) {
    console.log(`\n▶  Patient ${patient.id}: ${patient.name} (${patient.age}${patient.sex}) — ${patient.complexity}`);
    console.log('─'.repeat(56));

    // Build the conversation turn by turn, calling AI for each bot reply
    const chatHistory = []; // { role: 'user'|'assistant', content: string }
    const displayConversation = []; // { speaker, text } for output

    // Opening bot greeting
    const opening = "Hello! I'm the Kinetiq virtual assistant. I'll ask you a few questions about what brings you in today so the doctor can prepare for your visit. How can I help you?";
    chatHistory.push({ role: 'assistant', content: opening });
    displayConversation.push({ speaker: 'Kinetiq', text: opening });
    console.log(`\n  🤖 Kinetiq: ${opening}`);

    for (let i = 0; i < patient.patient_turns.length; i++) {
        const patientText = patient.patient_turns[i];

        // Patient speaks
        chatHistory.push({ role: 'user', content: patientText });
        displayConversation.push({ speaker: patient.name, text: patientText });
        console.log(`\n  👤 ${patient.name}: ${patientText}`);

        // AI replies (unless it's the last patient turn)
        if (i < patient.patient_turns.length - 1) {
            await sleep(600);
            const botReply = await groq(
                [{ role: 'system', content: CHAT_SYSTEM }, ...chatHistory],
                false, 120
            );
            chatHistory.push({ role: 'assistant', content: botReply });
            displayConversation.push({ speaker: 'Kinetiq', text: botReply });
            console.log(`\n  🤖 Kinetiq: ${botReply}`);
        } else {
            // Final closing bot message
            await sleep(600);
            const closing = await groq(
                [
                    { role: 'system', content: CHAT_SYSTEM + '\nThe patient has given all necessary information. Thank them, tell them the doctor will review their information shortly, and wish them well. Keep it warm and brief.' },
                    ...chatHistory
                ],
                false, 80
            );
            chatHistory.push({ role: 'assistant', content: closing });
            displayConversation.push({ speaker: 'Kinetiq', text: closing });
            console.log(`\n  🤖 Kinetiq: ${closing}`);
        }
    }

    // ── Generate AI Summary ───────────────────────────────────────────────────
    await sleep(800);
    const conversationText = displayConversation
        .map(m => `${m.speaker === 'Kinetiq' ? 'Assistant' : 'Patient'}: ${m.text}`)
        .join('\n');

    const rawSummary = await groq(
        [
            { role: 'system', content: SUMMARY_PROMPT },
            { role: 'user', content: `Conversation:\n${conversationText}` }
        ],
        true, 350
    );

    const parsed = JSON.parse(rawSummary);
    const validCodes = ['red', 'yellow', 'green'];
    const triageCode = validCodes.includes(parsed.triageCode?.toLowerCase())
        ? parsed.triageCode.toLowerCase() : 'yellow';
    const match = triageCode === patient.expected_triage;

    console.log('\n  ── AI Summary ──────────────────────────────────');
    console.log(`  📋 ${parsed.summary}`);
    console.log(`  🚦 Triage: ${triageCode.toUpperCase()} (expected: ${patient.expected_triage.toUpperCase()}) ${match ? '✓' : '✗'}`);
    console.log(`  💊 Next Steps: ${parsed.nextSteps}`);

    allResults.push({
        patient: {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            sex: patient.sex,
            complexity: patient.complexity,
            chief_complaint: patient.chief_complaint,
        },
        conversation: displayConversation,
        ai_output: {
            summary: parsed.summary,
            triage_code: triageCode,
            next_steps: parsed.nextSteps,
        },
        evaluation: {
            expected_triage: patient.expected_triage,
            triage_match: match,
            baseline_review_mins: patient.baseline_mins,
            Kinetiq_review_mins: patient.Kinetiq_mins,
            time_saved_mins: patient.baseline_mins - patient.Kinetiq_mins,
        },
    });

    await sleep(1000); // pause between patients
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const correct = allResults.filter(r => r.evaluation.triage_match).length;
const totalSaved = allResults.reduce((s, r) => s + r.evaluation.time_saved_mins, 0);

console.log('\n════════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('════════════════════════════════════════════════════');
console.log(`  Triage accuracy  : ${correct}/5`);
console.log(`  Total time saved : ${totalSaved} minutes`);
console.log('════════════════════════════════════════════════════\n');

const output = {
    metadata: {
        simulation_date: new Date().toISOString(),
        project: 'Kinetiq – AI-Enhanced Pre-Consultation System',
        university: 'Babcock University, Ilisan Remo, Ogun State, Nigeria',
        authors: ['Adebola Joshua Adedeji – 22/0596', 'Lawal John Ifedayo – 22/0391'],
        model: CHAT_MODEL,
        note: 'Realistic lay-language patient responses. Patients do not use medical diagnosis terms.',
        patients_simulated: 5,
    },
    statistics: {
        triage_accuracy: `${correct}/5`,
        total_time_saved_mins: totalSaved,
        avg_time_saved_mins: totalSaved / 5,
    },
    conversations: allResults,
};

writeFileSync(resolve(__dirname, 'sim5_results.json'), JSON.stringify(output, null, 2));
console.log('Saved → src/sim5_results.json\n');
