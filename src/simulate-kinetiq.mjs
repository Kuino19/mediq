/**
 * Kinetiq AI Pre-Consultation Simulation Script
 * Babcock University - CS Final Year Project
 * Authors: Adebola Joshua Adedeji (22/0596) & Lawal John Ifedayo (22/0391)
 *
 * Simulates 50 patient profiles through the Kinetiq AI pipeline.
 * Calls Groq API directly (same model as the live app).
 *
 * Usage:  node src/simulate-kinetiq.mjs <GROQ_API_KEY>
 *    or:  set GROQ_API_KEY=... && node src/simulate-kinetiq.mjs
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Accept key from env OR first positional argument
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.argv[2];
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
    console.error('ERROR: GROQ_API_KEY not found in .env.local');
    process.exit(1);
}

// ─── Patient profiles ─────────────────────────────────────────────────────────

const profiles = [
    { id: 1, group: "L", name: "Adeola Bakare", age: 34, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "Routine check-up / BP monitoring", key_symptoms: "Headache, mild dizziness", duration: "3 days", medical_history: "Hypertension", allergies: "None", current_medications: "Amlodipine", ground_truth: "On medication, no acute concern", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I have been having headaches and feeling a bit dizzy", q_duration: "For about 3 days now", q_character: "Dull, throbbing, about 4 out of 10", q_associated: "Just mild dizziness, nothing else", q_history: "I have hypertension", q_medications: "I take Amlodipine daily", q_other: "Nothing else to add" } },
    { id: 2, group: "L", name: "Emeka Okafor", age: 52, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Diabetes follow-up", key_symptoms: "Mild fatigue, increased thirst", duration: "1 week", medical_history: "Type 2 Diabetes", allergies: "None", current_medications: "Metformin", ground_truth: "Blood sugar review needed", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I am here for my diabetes follow-up, I have been feeling tired and very thirsty", q_duration: "About one week", q_character: "Just general tiredness, no pain", q_associated: "Drinking more water than usual, passing urine more often", q_history: "Type 2 diabetes for 5 years", q_medications: "Metformin twice daily", q_other: "Nothing else" } },
    { id: 3, group: "L", name: "Ngozi Eze", age: 28, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "Post-op wound review", key_symptoms: "Mild itching at incision site", duration: "5 days", medical_history: "Appendectomy (3 weeks ago)", allergies: "None", current_medications: "Amoxicillin", ground_truth: "Healing well, minor concern", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I had an appendix operation 3 weeks ago and the wound is itching", q_duration: "For the past 5 days", q_character: "Mild itching, no severe pain, about 2 out of 10", q_associated: "No fever, no discharge from the wound", q_history: "Appendectomy 3 weeks ago", q_medications: "I finished Amoxicillin last week", q_other: "The stitches look like they are healing" } },
    { id: 4, group: "L", name: "Tunde Adeleke", age: 45, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Medication refill request", key_symptoms: "No new symptoms", duration: "N/A", medical_history: "Hypertension, Asthma", allergies: "None", current_medications: "Lisinopril, Salbutamol inhaler", ground_truth: "Routine refill", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I just need a refill for my blood pressure and asthma medications", q_duration: "No new symptoms", q_character: "No pain or discomfort", q_associated: "No new symptoms at all", q_history: "Hypertension and asthma", q_medications: "Lisinopril and Salbutamol inhaler", q_other: "My medications finished two days ago" } },
    { id: 5, group: "L", name: "Funke Adesanya", age: 60, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "Annual wellness screening", key_symptoms: "None reported", duration: "N/A", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Routine wellness visit", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I am here for my yearly check-up, I have no complaints", q_duration: "No symptoms", q_character: "Feeling generally well", q_associated: "No symptoms", q_history: "No known medical conditions", q_medications: "No medications", q_other: "I just want to make sure everything is fine" } },
    { id: 6, group: "L", name: "Chidi Obi", age: 38, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Lower back pain (chronic)", key_symptoms: "Dull ache, worse on sitting", duration: "2 months", medical_history: "Lumbar strain", allergies: "None", current_medications: "Ibuprofen PRN", ground_truth: "Chronic, no red flags", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "My lower back has been aching for a long time", q_duration: "About 2 months now", q_character: "Dull and constant, worse when I sit for long, about 5 out of 10", q_associated: "No weakness in my legs, no numbness", q_history: "I was told I have lumbar strain last year", q_medications: "I take Ibuprofen when the pain is bad", q_other: "I work at a desk all day" } },
    { id: 7, group: "L", name: "Amara Nwosu", age: 22, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "Contraceptive counselling", key_symptoms: "None", duration: "N/A", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Information request only", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I want to speak with a doctor about family planning options", q_duration: "No symptoms", q_character: "No pain", q_associated: "No symptoms", q_history: "No medical conditions", q_medications: "No medications", q_other: "I have some questions about contraception" } },
    { id: 8, group: "L", name: "Babatunde Ojo", age: 55, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Gout follow-up", key_symptoms: "Mild joint stiffness, right big toe", duration: "2 days", medical_history: "Gout", allergies: "None", current_medications: "Allopurinol", ground_truth: "Flare, manageable", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "My right big toe is stiff and slightly painful again", q_duration: "For 2 days", q_character: "Stiff and mildly painful, about 3 out of 10", q_associated: "Slight redness around the toe joint", q_history: "I have gout, diagnosed 2 years ago", q_medications: "Allopurinol daily", q_other: "I think I ate too much red meat last weekend" } },
    { id: 9, group: "L", name: "Chioma Dike", age: 31, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "Skin rash review", key_symptoms: "Itchy red patches on forearm", duration: "4 days", medical_history: "Eczema", allergies: "None", current_medications: "Hydrocortisone cream", ground_truth: "Eczema flare, mild", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I have red itchy patches on my forearm that keep coming back", q_duration: "For about 4 days", q_character: "Very itchy, about 4 out of 10 discomfort", q_associated: "The skin is dry and slightly flaky", q_history: "I have eczema", q_medications: "I use hydrocortisone cream", q_other: "It gets worse at night" } },
    { id: 10, group: "L", name: "Ibrahim Musa", age: 48, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Thyroid follow-up", key_symptoms: "Mild fatigue", duration: "1 week", medical_history: "Hypothyroidism", allergies: "None", current_medications: "Levothyroxine", ground_truth: "TSH recheck needed", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I have been feeling more tired than usual lately", q_duration: "About one week", q_character: "General fatigue, no specific pain", q_associated: "Feeling a bit cold even when it is warm", q_history: "Hypothyroidism, diagnosed 3 years ago", q_medications: "Levothyroxine every morning", q_other: "I am here for my thyroid check" } },
    { id: 11, group: "L", name: "Yetunde Lawal", age: 66, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "Joint pain (chronic)", key_symptoms: "Aching knees, worse in morning", duration: "3 months", medical_history: "Osteoarthritis", allergies: "None", current_medications: "Naproxen", ground_truth: "Chronic arthritis, stable", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "My knees have been aching especially in the mornings", q_duration: "For about 3 months", q_character: "Dull aching, worse when I first wake up, about 5 out of 10", q_associated: "Some stiffness in the morning that improves after moving around", q_history: "Osteoarthritis in both knees", q_medications: "Naproxen when needed", q_other: "Climbing stairs is very difficult now" } },
    { id: 12, group: "L", name: "Segun Bello", age: 29, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Allergy review", key_symptoms: "Sneezing, watery eyes", duration: "2 weeks", medical_history: "Allergic rhinitis", allergies: "None", current_medications: "Cetirizine", ground_truth: "Seasonal allergy flare", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I keep sneezing and my eyes are watery and itchy", q_duration: "For the past 2 weeks", q_character: "Constant sneezing, runny nose, itchy eyes, about 4 out of 10", q_associated: "No fever, no sore throat", q_history: "Allergic rhinitis since I was a teenager", q_medications: "Cetirizine when it gets bad", q_other: "It started after the harmattan began" } },
    { id: 13, group: "L", name: "Hauwa Garba", age: 43, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "Migraine follow-up", key_symptoms: "Mild throbbing headache", duration: "1 day", medical_history: "Migraine", allergies: "None", current_medications: "Sumatriptan", ground_truth: "Typical migraine episode", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I have a throbbing headache on one side of my head", q_duration: "Since yesterday morning", q_character: "Throbbing on the left side, 6 out of 10, worse with light", q_associated: "Feeling nauseous, sensitive to light and noise", q_history: "Migraines for many years", q_medications: "Sumatriptan, I took one this morning", q_other: "I get these about once a month" } },
    { id: 14, group: "L", name: "Rotimi Afolabi", age: 57, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Cholesterol review", key_symptoms: "No symptoms", duration: "N/A", medical_history: "Hyperlipidaemia", allergies: "None", current_medications: "Atorvastatin", ground_truth: "Lipid panel review", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "No symptoms, I am here for my regular cholesterol check", q_duration: "No symptoms", q_character: "No pain", q_associated: "No symptoms", q_history: "High cholesterol diagnosed 4 years ago", q_medications: "Atorvastatin nightly", q_other: "I want to check if my diet changes have helped" } },
    { id: 15, group: "L", name: "Blessing Okonkwo", age: 35, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "UTI follow-up", key_symptoms: "Mild burning on urination", duration: "3 days", medical_history: "Recurrent UTI", allergies: "None", current_medications: "Nitrofurantoin (completed)", ground_truth: "Post-treatment review", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I still have a little burning feeling when I urinate", q_duration: "For 3 days", q_character: "Mild burning, 3 out of 10", q_associated: "No fever, frequency has reduced", q_history: "I get UTIs frequently, about 3 times a year", q_medications: "I just finished Nitrofurantoin yesterday", q_other: "I wanted to make sure the infection is fully gone" } },
    { id: 16, group: "L", name: "Musa Abdullahi", age: 50, sex: "M", complexity: "Low", red_flag: false, chief_complaint: "Peptic ulcer review", key_symptoms: "Mild epigastric discomfort after meals", duration: "1 week", medical_history: "Peptic Ulcer Disease", allergies: "None", current_medications: "Omeprazole", ground_truth: "Stable, diet compliance issue", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I have been having stomach discomfort especially after eating", q_duration: "For about one week", q_character: "Burning discomfort in the upper stomach area, 4 out of 10", q_associated: "Bloating after meals, mild nausea", q_history: "Peptic ulcer disease", q_medications: "Omeprazole in the morning", q_other: "I have been eating spicy food lately which I know I should avoid" } },
    { id: 17, group: "L", name: "Grace Onyekachi", age: 27, sex: "F", complexity: "Low", red_flag: false, chief_complaint: "General check-up", key_symptoms: "Mild fatigue, occasional headache", duration: "2 weeks", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Possible anaemia – check FBC", baseline_time_mins: 8, kinetiq_review_time_mins: 2, sim_responses: { q_chief: "I have been feeling tired and getting headaches on and off", q_duration: "For about 2 weeks", q_character: "General weakness and tiredness, headaches about 4 out of 10", q_associated: "I sometimes feel dizzy when I stand up quickly", q_history: "No known conditions", q_medications: "None", q_other: "I have not been eating well lately" } },
    { id: 18, group: "M", name: "Adewale Fadahunsi", age: 33, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Acute fever", key_symptoms: "High fever, body aches, chills", duration: "2 days", medical_history: "Malaria (previous)", allergies: "None", current_medications: "None", ground_truth: "Malaria/typhoid workup", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have a very high fever and my whole body is aching", q_duration: "Since yesterday, about 2 days", q_character: "Burning hot, chills, 8 out of 10", q_associated: "Body aches, chills, very weak, headache at the back", q_history: "I had malaria last year", q_medications: "Nothing currently", q_other: "I have not eaten much since yesterday" } },
    { id: 19, group: "M", name: "Nkechi Alozie", age: 40, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Persistent cough", key_symptoms: "Dry cough, mild chest tightness", duration: "10 days", medical_history: "Asthma", allergies: "None", current_medications: "Salbutamol inhaler", ground_truth: "Possible asthma exacerbation", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have had a dry cough that will not go away and my chest feels tight", q_duration: "For 10 days now", q_character: "Dry, tickling cough, chest tightness, 5 out of 10", q_associated: "Wheezing sometimes at night", q_history: "Asthma since childhood", q_medications: "Salbutamol inhaler, I have been using it more than usual", q_other: "My inhaler is not helping as much as before" } },
    { id: 20, group: "M", name: "Femi Adegoke", age: 25, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Abdominal pain", key_symptoms: "Central crampy abdominal pain, nausea", duration: "1 day", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Possible gastroenteritis/appendicitis early stage", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have been having crampy pain around my stomach area", q_duration: "Since this morning", q_character: "Crampy and coming in waves, 6 out of 10", q_associated: "Nausea, no vomiting yet, no diarrhoea", q_history: "No medical conditions", q_medications: "None", q_other: "The pain started around my belly button then moved lower right" } },
    { id: 21, group: "M", name: "Aisha Usman", age: 37, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Vaginal discharge + lower abdominal pain", key_symptoms: "Yellowish discharge, pelvic pain", duration: "5 days", medical_history: "None", allergies: "Penicillin allergy", current_medications: "None", ground_truth: "Possible PID, swab needed", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have been having unusual discharge and pain in my lower abdomen", q_duration: "For 5 days", q_character: "Dull aching pelvic pain, 6 out of 10, yellowish discharge", q_associated: "Mild fever, painful when I move around", q_history: "No known conditions", q_medications: "None, I am allergic to penicillin", q_other: "I am worried about this discharge, it is not normal for me" } },
    { id: 22, group: "M", name: "Dayo Olatunde", age: 46, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Chest tightness (exertional)", key_symptoms: "Tightness walking upstairs, resolves with rest", duration: "3 weeks", medical_history: "Hypertension", allergies: "None", current_medications: "Amlodipine", ground_truth: "Possible angina – ECG needed", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I get tightness in my chest when I climb stairs or walk fast", q_duration: "For about 3 weeks", q_character: "Pressure and tightness in the chest, 5 out of 10 during activity", q_associated: "Goes away when I rest, no pain at rest", q_history: "High blood pressure", q_medications: "Amlodipine daily", q_other: "It is getting more frequent, even small effort brings it on now" } },
    { id: 23, group: "M", name: "Obiageli Nwofor", age: 54, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Swollen leg", key_symptoms: "Left calf swelling, mild redness, warmth", duration: "4 days", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Possible DVT – Doppler urgently", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "My left calf has been swollen and slightly red and warm", q_duration: "For 4 days", q_character: "Swollen, tender to touch, 5 out of 10", q_associated: "The skin looks red, feels warmer than the other leg", q_history: "No known conditions", q_medications: "None", q_other: "I recently travelled by bus for 6 hours" } },
    { id: 24, group: "M", name: "Kunle Ayoola", age: 30, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Eye redness and discharge", key_symptoms: "Red eyes, purulent discharge, light sensitivity", duration: "2 days", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Bacterial conjunctivitis vs keratitis", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "Both my eyes are red and have a lot of discharge and they hurt in bright light", q_duration: "For 2 days", q_character: "Gritty, painful, 5 out of 10", q_associated: "Yellow-green discharge, eyes stuck together in the morning", q_history: "No known conditions", q_medications: "None", q_other: "My colleague had a similar problem last week" } },
    { id: 25, group: "M", name: "Taiwo Adeyemi", age: 62, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Dizziness and balance issues", key_symptoms: "Vertigo, nausea, falls to left", duration: "3 days", medical_history: "Hypertension", allergies: "None", current_medications: "Amlodipine", ground_truth: "BPPV vs central cause – neuro review", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I keep feeling like the room is spinning and I am losing my balance", q_duration: "For 3 days", q_character: "Spinning sensation, 7 out of 10, worse when I turn my head", q_associated: "Nausea, I tend to fall towards the left side", q_history: "High blood pressure", q_medications: "Amlodipine", q_other: "It came on very suddenly 3 days ago" } },
    { id: 26, group: "M", name: "Samuel Osei", age: 44, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Rectal bleeding", key_symptoms: "Bright red blood per rectum, no pain", duration: "1 week", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Haemorrhoids vs lower GI bleed", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have been seeing blood in the toilet when I pass stool", q_duration: "For about a week", q_character: "Bright red blood, no pain when it happens", q_associated: "No abdominal pain, stools look normal", q_history: "No known conditions", q_medications: "None", q_other: "It is quite bright red and only on the paper and in the bowl" } },
    { id: 27, group: "M", name: "Adaeze Ike", age: 26, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Severe menstrual pain", key_symptoms: "Cramping lower abdomen, heavy bleeding", duration: "2 days", medical_history: "Dysmenorrhoea", allergies: "None", current_medications: "Ibuprofen PRN", ground_truth: "Rule out endometriosis", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "My period pain is extremely severe this month and the bleeding is very heavy", q_duration: "For 2 days since my period started", q_character: "Severe cramping lower abdomen, 8 out of 10", q_associated: "Heavy bleeding, passing clots, mild nausea", q_history: "Painful periods since I was a teenager", q_medications: "Ibuprofen but it is not helping this time", q_other: "The pain is much worse than my usual periods" } },
    { id: 28, group: "M", name: "Oluwaseun Aina", age: 41, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Ear pain + hearing loss", key_symptoms: "Right ear pain, muffled hearing, mild fever", duration: "4 days", medical_history: "Recurrent otitis media", allergies: "None", current_medications: "None", ground_truth: "Otitis media vs CSOM", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "My right ear is very painful and I cannot hear well from it", q_duration: "For 4 days", q_character: "Deep aching pain in the right ear, 6 out of 10", q_associated: "Muffled hearing on the right, mild fever", q_history: "I have had ear infections before", q_medications: "None currently", q_other: "There is a slight discharge from the ear today" } },
    { id: 29, group: "M", name: "Priscilla Ebuka", age: 58, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Weight loss + fatigue", key_symptoms: "Unintentional 5kg loss, fatigue, night sweats", duration: "6 weeks", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Red flag weight loss – malignancy workup", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have been losing weight without trying and feeling very tired", q_duration: "For about 6 weeks", q_character: "Extreme fatigue, no specific pain", q_associated: "Night sweats, no appetite, I have lost about 5 kilograms", q_history: "No known conditions", q_medications: "None", q_other: "I am very worried because I was not trying to lose weight" } },
    { id: 30, group: "M", name: "Abdulrahman Yusuf", age: 36, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Skin infection", key_symptoms: "Painful, swollen, red area on thigh, warm", duration: "3 days", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Cellulitis vs abscess", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have a very painful red swollen area on my right thigh", q_duration: "For 3 days", q_character: "Throbbing pain, 7 out of 10, swollen and warm to touch", q_associated: "Area is getting bigger, mild fever today", q_history: "No known conditions", q_medications: "None", q_other: "I do not remember any injury there but it appeared suddenly" } },
    { id: 31, group: "M", name: "Vivian Okafor", age: 49, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Persistent headache", key_symptoms: "Daily headache, worse in morning, neck stiffness", duration: "2 weeks", medical_history: "Hypertension", allergies: "None", current_medications: "Amlodipine", ground_truth: "New onset daily headache – CT head", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have had a headache every single day for two weeks now", q_duration: "Every day for 2 weeks", q_character: "Pressure all over my head, worse in the mornings, 6 out of 10", q_associated: "Stiff neck, sometimes feel like vomiting in the morning", q_history: "High blood pressure", q_medications: "Amlodipine", q_other: "This is different from any headache I have had before" } },
    { id: 32, group: "M", name: "Emeka Nze", age: 67, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Urinary symptoms", key_symptoms: "Frequency, urgency, weak stream, nocturia", duration: "3 weeks", medical_history: "BPH suspected", allergies: "None", current_medications: "None", ground_truth: "BPH workup – PSA, USS", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I am urinating very frequently, the stream is weak and I wake up at night to urinate", q_duration: "For about 3 weeks", q_character: "Weak stream, urgency, waking up 3 times at night", q_associated: "Feeling like I never fully empty my bladder", q_history: "No formal diagnosis but doctor mentioned prostate last time", q_medications: "None", q_other: "It is affecting my sleep badly" } },
    { id: 33, group: "M", name: "Folasade Coker", age: 23, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Painful swallowing", key_symptoms: "Sore throat, odynophagia, swollen glands", duration: "5 days", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Tonsillitis vs peritonsillar abscess", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "My throat is very painful especially when I swallow, even water hurts", q_duration: "For 5 days", q_character: "Sharp stabbing pain when swallowing, 7 out of 10", q_associated: "Swollen glands in my neck, fever, bad breath", q_history: "No known conditions", q_medications: "None", q_other: "My right tonsil looks much bigger than the left" } },
    { id: 34, group: "M", name: "Kingsley Eze", age: 38, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Palpitations", key_symptoms: "Racing heart, intermittent, worse with caffeine", duration: "2 weeks", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Arrhythmia workup – ECG, Holter", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I keep feeling my heart racing or fluttering in my chest", q_duration: "For about 2 weeks, comes and goes", q_character: "Racing, fluttering sensation, 5 out of 10", q_associated: "Slightly breathless during episodes, no chest pain", q_history: "No known conditions", q_medications: "None", q_other: "I have been drinking a lot of coffee lately and it seems to make it worse" } },
    { id: 35, group: "M", name: "Bola Oduola", age: 55, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Blurred vision", key_symptoms: "Gradual blurring, worse for distance", duration: "1 month", medical_history: "Diabetes Type 2", allergies: "None", current_medications: "Metformin", ground_truth: "Diabetic retinopathy screening", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "My vision has been getting blurry gradually, especially for things far away", q_duration: "For about a month", q_character: "Gradual blurring, 5 out of 10", q_associated: "No eye pain, no redness", q_history: "Type 2 diabetes for 8 years", q_medications: "Metformin twice daily", q_other: "I have not had my eyes checked in over 2 years" } },
    { id: 36, group: "M", name: "Pius Okonkwo", age: 42, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Persistent diarrhoea", key_symptoms: "Loose stools x4/day, mild cramping, no blood", duration: "2 weeks", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Infectious vs IBD – stool MCS", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have been having loose watery stools many times a day for two weeks", q_duration: "For 2 weeks", q_character: "Watery stools about 4 times a day, crampy pain before each time, 5 out of 10", q_associated: "Mild cramping, no blood, lost some weight", q_history: "No known conditions", q_medications: "None", q_other: "I thought it was food poisoning but it is not going away" } },
    { id: 37, group: "M", name: "Lara Adesola", age: 31, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Anxiety and sleep disorder", key_symptoms: "Insomnia, racing thoughts, unable to concentrate", duration: "3 weeks", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "GAD vs depression screening", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I cannot sleep properly and my mind is always racing with worry", q_duration: "For about 3 weeks", q_character: "Constant anxiety feeling, 6 out of 10", q_associated: "Difficulty concentrating at work, tired during the day", q_history: "No known conditions", q_medications: "None", q_other: "I have been under a lot of pressure at work and at home" } },
    { id: 38, group: "M", name: "Godswill Uchenna", age: 60, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Swollen joints", key_symptoms: "Both wrists and fingers swollen, morning stiffness", duration: "1 month", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Rheumatoid arthritis workup – RF, anti-CCP", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "My wrists and fingers are swollen and stiff especially in the mornings", q_duration: "For about a month", q_character: "Aching and swollen joints, 6 out of 10, worse in the morning", q_associated: "Stiffness for over an hour each morning before loosening up", q_history: "No known conditions", q_medications: "None", q_other: "Both sides are affected which is strange to me" } },
    { id: 39, group: "M", name: "Chidinma Okeke", age: 29, sex: "F", complexity: "Medium", red_flag: false, chief_complaint: "Hair loss + fatigue", key_symptoms: "Diffuse hair loss, cold intolerance, constipation", duration: "2 months", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Hypothyroidism workup – TSH, T4", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "I have been losing a lot of hair and feeling very tired and cold all the time", q_duration: "For about 2 months", q_character: "General fatigue and cold feeling, 5 out of 10", q_associated: "Constipation, hair coming out in clumps, weight gain", q_history: "No known conditions", q_medications: "None", q_other: "My skin also feels very dry lately" } },
    { id: 40, group: "M", name: "Hassan Sule", age: 53, sex: "M", complexity: "Medium", red_flag: false, chief_complaint: "Jaundice", key_symptoms: "Yellow eyes, dark urine, pale stool, mild RUQ pain", duration: "1 week", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Hepatitis/biliary workup – LFTs, USS", baseline_time_mins: 11, kinetiq_review_time_mins: 3, sim_responses: { q_chief: "My eyes have turned yellow and my urine is very dark", q_duration: "For about a week", q_character: "Mild aching on the right side below my ribs, 4 out of 10", q_associated: "Urine is dark orange, stool is pale, slight fever", q_history: "No known conditions", q_medications: "None", q_other: "I also feel itchy all over my body" } },
    { id: 41, group: "H", name: "Chukwuemeka Obi", age: 58, sex: "M", complexity: "High", red_flag: true, chief_complaint: "Crushing chest pain", key_symptoms: "Crushing central chest pain radiating to left arm, sweating, nausea", duration: "45 mins", medical_history: "Hypertension, Diabetes", allergies: "None", current_medications: "Amlodipine, Metformin", ground_truth: "STEMI protocol – immediate ECG + troponin", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "I have a very severe crushing pain in the middle of my chest, it is spreading to my left arm", q_duration: "It started about 45 minutes ago and is not going away", q_character: "Crushing and squeezing, the worst pain of my life, 10 out of 10", q_associated: "I am sweating a lot, I feel like vomiting, I am short of breath", q_history: "I have high blood pressure and diabetes", q_medications: "Amlodipine and Metformin daily", q_other: "I feel like something is very wrong, please see me urgently" } },
    { id: 42, group: "H", name: "Ngozi Eze-Nwosu", age: 35, sex: "F", complexity: "High", red_flag: true, chief_complaint: "Shortness of breath (acute)", key_symptoms: "Sudden severe dyspnoea, cannot complete sentences, lips turning blue", duration: "20 mins", medical_history: "Asthma", allergies: "Penicillin", current_medications: "Salbutamol inhaler", ground_truth: "Severe asthma attack – nebulise immediately", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "I cannot breathe properly it came suddenly", q_duration: "About 20 minutes ago", q_character: "I cannot finish sentences lips feel numb", q_associated: "Wheezing chest very tight I used my inhaler but no relief", q_history: "Asthma since childhood", q_medications: "Salbutamol inhaler penicillin allergy", q_other: "Please I need help now" } },
    { id: 43, group: "H", name: "Alhaji Bello", age: 70, sex: "M", complexity: "High", red_flag: true, chief_complaint: "Sudden weakness one side", key_symptoms: "Left-sided facial droop, arm weakness, slurred speech", duration: "1 hour", medical_history: "Hypertension, AF", allergies: "None", current_medications: "Warfarin", ground_truth: "Stroke – activate stroke pathway immediately", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "My face is drooping on the left side and my left arm is very weak, I cannot speak properly", q_duration: "It started about one hour ago, very suddenly", q_character: "I cannot lift my left arm, my speech is slurred", q_associated: "I felt dizzy suddenly then this happened", q_history: "High blood pressure and irregular heartbeat", q_medications: "Warfarin daily", q_other: "Please this is an emergency" } },
    { id: 44, group: "H", name: "Fatimah Sanni", age: 26, sex: "F", complexity: "High", red_flag: true, chief_complaint: "Heavy vaginal bleeding", key_symptoms: "Soaking 6 pads/hour, severe cramping, dizziness", duration: "2 hours", medical_history: "Pregnancy 10 weeks", allergies: "None", current_medications: "Folic acid", ground_truth: "Threatened/incomplete miscarriage – urgent gynae", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "I am pregnant and I am bleeding very heavily with severe cramping", q_duration: "For the past 2 hours", q_character: "Soaking through pads very quickly, cramps are very severe, 9 out of 10", q_associated: "I feel very dizzy and weak", q_history: "I am 10 weeks pregnant", q_medications: "Folic acid supplements", q_other: "I am very scared please help me quickly" } },
    { id: 45, group: "H", name: "Adeyemi Coker", age: 48, sex: "M", complexity: "High", red_flag: true, chief_complaint: "Coughing blood", key_symptoms: "Frank haemoptysis, drenching night sweats, 8kg weight loss", duration: "3 weeks", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "TB/malignancy – isolate, CXR, sputum MCS", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "I have been coughing up blood and losing a lot of weight", q_duration: "For about 3 weeks", q_character: "Coughing up significant blood, severe fatigue", q_associated: "Drenching night sweats, lost about 8 kilograms", q_history: "No known conditions", q_medications: "None", q_other: "I have been coughing blood for 3 weeks I am very worried" } },
    { id: 46, group: "H", name: "Mama Eze", age: 65, sex: "F", complexity: "High", red_flag: true, chief_complaint: "Sudden severe headache", key_symptoms: "Worst headache of life, sudden onset, neck stiffness, vomiting", duration: "30 mins", medical_history: "Hypertension", allergies: "None", current_medications: "Amlodipine", ground_truth: "Subarachnoid haemorrhage – CT head stat", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "I have the worst headache of my entire life, it came like a thunderclap suddenly", q_duration: "About 30 minutes ago, very sudden onset", q_character: "Explosive, 10 out of 10, I have never felt anything like this", q_associated: "My neck is very stiff, I vomited twice", q_history: "High blood pressure", q_medications: "Amlodipine", q_other: "Please this is not a normal headache something is very wrong" } },
    { id: 47, group: "H", name: "Ifeanyi Okonkwo", age: 19, sex: "M", complexity: "High", red_flag: true, chief_complaint: "Seizure in waiting room", key_symptoms: "Witnessed tonic-clonic seizure, post-ictal now, no prior epilepsy", duration: "During wait", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "New onset seizure – neuro urgent, CT head", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "I just had a fit in the waiting room, I do not know what happened", q_duration: "It happened just now in the waiting room", q_character: "I lost consciousness and my body was shaking, I am confused now", q_associated: "I feel very tired and confused, my tongue hurts from biting it", q_history: "No known conditions, no previous fits", q_medications: "None", q_other: "I have never had anything like this before" } },
    { id: 48, group: "H", name: "Remi Adewale", age: 55, sex: "M", complexity: "High", red_flag: true, chief_complaint: "Abdominal rigidity", key_symptoms: "Board-like rigid abdomen, severe generalised pain, unable to move", duration: "3 hours", medical_history: "None", allergies: "None", current_medications: "None", ground_truth: "Peritonitis / bowel perforation – surgical emergency", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "My abdomen is extremely painful and hard like a board, I cannot move", q_duration: "For about 3 hours and getting worse", q_character: "Severe generalised abdominal pain, 10 out of 10, board hard abdomen", q_associated: "I cannot move, any movement makes it much worse, vomiting", q_history: "No known conditions", q_medications: "None", q_other: "The pain came on suddenly 3 hours ago please help me" } },
    { id: 49, group: "H", name: "Amina Yusuf", age: 40, sex: "F", complexity: "High", red_flag: true, chief_complaint: "Anaphylaxis reaction", key_symptoms: "Throat swelling, hives, difficulty breathing after antibiotic dose", duration: "10 mins", medical_history: "Penicillin allergy (known)", allergies: "Penicillin", current_medications: "Amoxicillin (given in error)", ground_truth: "Anaphylaxis – adrenaline immediately", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "My throat is swelling up and I have hives all over and I cannot breathe properly", q_duration: "Started about 10 minutes ago right after I took a tablet", q_character: "Throat tightening rapidly, 9 out of 10", q_associated: "Hives all over my body, difficulty breathing, heart racing", q_history: "I have a known penicillin allergy", q_medications: "I was given Amoxicillin just now I told them I was allergic", q_other: "Please this is an emergency I cannot breathe properly" } },
    { id: 50, group: "H", name: "Oladele Martins", age: 63, sex: "M", complexity: "High", red_flag: true, chief_complaint: "Severe hypoglycaemia", key_symptoms: "Confused, diaphoretic, shaking, blood glucose 1.9mmol/L", duration: "30 mins", medical_history: "Diabetes Type 2", allergies: "None", current_medications: "Glipizide", ground_truth: "Hypoglycaemia – IV dextrose immediately", baseline_time_mins: 14, kinetiq_review_time_mins: 4, sim_responses: { q_chief: "I feel very confused and shaky and I am sweating heavily", q_duration: "For about 30 minutes", q_character: "Severe shaking, confusion, sweating, I feel like I am going to pass out", q_associated: "A nurse checked my sugar and said it was very low", q_history: "Type 2 diabetes", q_medications: "Glipizide in the morning, I took it but skipped breakfast", q_other: "I skipped breakfast this morning before taking my tablet" } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callGroq(systemPrompt, userContent) {
    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            temperature: 0.3,
            max_tokens: 400,
            response_format: { type: 'json_object' },
        }),
    });
    if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices[0]?.message?.content;
}

function buildConversation(p) {
    const r = p.sim_responses;
    return [
        { role: 'assistant', text: 'Hello! I am Kinetiq, your pre-consultation assistant. What brings you in today?' },
        { role: 'user', text: r.q_chief },
        { role: 'assistant', text: 'How long have you been experiencing this?' },
        { role: 'user', text: r.q_duration },
        { role: 'assistant', text: 'Can you describe the character or severity of the symptom on a scale of 1-10?' },
        { role: 'user', text: r.q_character },
        { role: 'assistant', text: 'Do you have any other associated symptoms?' },
        { role: 'user', text: r.q_associated },
        { role: 'assistant', text: 'Do you have any significant past medical history?' },
        { role: 'user', text: r.q_history },
        { role: 'assistant', text: 'Are you currently on any medications or have any allergies?' },
        { role: 'user', text: r.q_medications },
        { role: 'assistant', text: 'Is there anything else you would like to let the doctor know?' },
        { role: 'user', text: r.q_other },
    ];
}

const SUMMARY_SYSTEM_PROMPT = `You are a medical triage AI assistant. Analyze the following pre-consultation conversation and provide:
1. A concise summary of the patient's symptoms, medical history, and concerns (2-3 sentences)
2. A triage code based on urgency:
   - RED: Emergency - life-threatening symptoms, severe pain, difficulty breathing, chest pain, severe bleeding, loss of consciousness
   - YELLOW: Urgent - moderate symptoms requiring prompt attention, persistent pain, high fever, suspected fractures
   - GREEN: Non-urgent - minor symptoms, routine check-ups, mild discomfort, preventive care
3. Suggested next steps for the doctor (1-2 sentences)

Respond ONLY with valid JSON:
{"summary":"...","triageCode":"red"|"yellow"|"green","nextSteps":"..."}`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main simulation loop ─────────────────────────────────────────────────────

const results = [];
const errors = [];

console.log(`\n=== Kinetiq Simulation — ${profiles.length} patients ===\n`);

for (const profile of profiles) {
    const conversation = buildConversation(profile);
    const conversationText = conversation
        .map(m => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`)
        .join('\n');

    let attempt = 0;
    let success = false;

    while (attempt < 3 && !success) {
        try {
            attempt++;
            const raw = await callGroq(SUMMARY_SYSTEM_PROMPT, `Conversation:\n${conversationText}`);
            const parsed = JSON.parse(raw);

            const validCodes = ['red', 'yellow', 'green'];
            const triageCode = validCodes.includes(parsed.triageCode?.toLowerCase())
                ? parsed.triageCode.toLowerCase()
                : 'yellow';

            // Determine triage match
            let expectedCode = 'green';
            if (profile.complexity === 'Medium') expectedCode = 'yellow';
            if (profile.complexity === 'High') expectedCode = 'red';
            const triageMatch = triageCode === expectedCode;

            results.push({
                id: profile.id,
                name: profile.name,
                age: profile.age,
                sex: profile.sex,
                complexity: profile.complexity,
                red_flag: profile.red_flag,
                chief_complaint: profile.chief_complaint,
                ground_truth: profile.ground_truth,
                expected_triage: expectedCode,
                ai_summary: parsed.summary,
                ai_triage: triageCode,
                ai_next_steps: parsed.nextSteps,
                triage_match: triageMatch,
                baseline_time_mins: profile.baseline_time_mins,
                kinetiq_review_time_mins: profile.kinetiq_review_time_mins,
                time_saved_mins: profile.baseline_time_mins - profile.kinetiq_review_time_mins,
            });

            const icon = triageMatch ? '✓' : '✗';
            const flag = triageCode === 'red' ? '🔴' : triageCode === 'yellow' ? '🟡' : '🟢';
            console.log(`[${profile.id.toString().padStart(2,'0')}] ${icon} ${flag}  ${profile.name.padEnd(22)} | ${profile.complexity.padEnd(6)} | got:${triageCode.padEnd(6)} exp:${expectedCode}`);
            success = true;

        } catch (err) {
            console.warn(`   Attempt ${attempt} failed for #${profile.id}: ${err.message}`);
            if (attempt < 3) await sleep(3000);
            else {
                errors.push({ id: profile.id, name: profile.name, error: err.message });
                console.error(`   ✗ Failed after 3 attempts`);
            }
        }
    }

    await sleep(500); // light rate-limit guard
}

// ─── Compute statistics ───────────────────────────────────────────────────────

const total = results.length;
const correct = results.filter(r => r.triage_match).length;
const accuracy = ((correct / total) * 100).toFixed(1);

const byGroup = {};
for (const r of results) {
    if (!byGroup[r.complexity]) byGroup[r.complexity] = { total: 0, correct: 0, time_saved: 0 };
    byGroup[r.complexity].total++;
    if (r.triage_match) byGroup[r.complexity].correct++;
    byGroup[r.complexity].time_saved += r.time_saved_mins;
}

const totalTimeSaved = results.reduce((s, r) => s + r.time_saved_mins, 0);
const avgTimeSaved = (totalTimeSaved / total).toFixed(1);

const redCorrect = results.filter(r => r.complexity === 'High' && r.triage_match).length;
const redTotal = results.filter(r => r.complexity === 'High').length;

console.log('\n═══════════════════════════════════════════════');
console.log('  SIMULATION RESULTS');
console.log('═══════════════════════════════════════════════');
console.log(`  Total patients simulated : ${total}`);
console.log(`  Triage accuracy          : ${correct}/${total} (${accuracy}%)`);
console.log(`  Red-flag detection       : ${redCorrect}/${redTotal} (${((redCorrect/redTotal)*100).toFixed(0)}%)`);
console.log(`  Total time saved         : ${totalTimeSaved} minutes`);
console.log(`  Avg time saved/patient   : ${avgTimeSaved} mins`);
console.log('');
for (const [group, stats] of Object.entries(byGroup)) {
    const pct = ((stats.correct / stats.total) * 100).toFixed(0);
    console.log(`  ${group.padEnd(8)}: ${stats.correct}/${stats.total} (${pct}%) | time saved: ${stats.time_saved} mins`);
}
console.log('═══════════════════════════════════════════════\n');

// ─── Save output ──────────────────────────────────────────────────────────────

const output = {
    metadata: {
        simulation_date: new Date().toISOString(),
        project: 'Kinetiq – AI-Enhanced Pre-Consultation System',
        university: 'Babcock University, Ilisan Remo, Ogun State, Nigeria',
        authors: ['Adebola Joshua Adedeji – 22/0596', 'Lawal John Ifedayo – 22/0391'],
        model_used: GROQ_MODEL,
        total_simulated: total,
        errors: errors.length,
    },
    statistics: {
        overall_accuracy_percent: parseFloat(accuracy),
        triage_correct: correct,
        triage_total: total,
        red_flag_detection_percent: parseFloat(((redCorrect / redTotal) * 100).toFixed(1)),
        total_time_saved_mins: totalTimeSaved,
        avg_time_saved_per_patient_mins: parseFloat(avgTimeSaved),
        by_group: byGroup,
    },
    results,
    errors,
};

writeFileSync(resolve(__dirname, 'simulation_results.json'), JSON.stringify(output, null, 2));
console.log('Results saved to src/simulation_results.json');
