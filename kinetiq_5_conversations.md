# Kinetiq – 5 Realistic Patient Simulations
**Babcock University CS Project · Adebola Joshua Adedeji (22/0596) & Lawal John Ifedayo (22/0391)**  
**Simulation Date:** 25 March 2026 · **Model:** Llama 3.3-70B Versatile (Groq)

> **Realism note:** Patients speak in pure lay language — they describe *what they feel*, not medical diagnoses. Medical history is phrased as *"the doctor told me…"* or *"I take a tablet for…"*

---

## Results Summary

| # | Patient | Group | AI Triage | Expected | ✓/✗ | Time Saved |
|---|---|---|---|---|---|---|
| 1 | Adeola Bakare, 34F | 🟢 Low | GREEN | GREEN | ✓ | 6 mins |
| 2 | Femi Adegoke, 25M | 🟡 Medium | YELLOW | YELLOW | ✓ | 8 mins |
| 3 | Aisha Usman, 37F | 🟡 Medium | YELLOW | YELLOW | ✓ | 8 mins |
| 4 | Chukwuemeka Obi, 58M | 🔴 High | RED | RED | ✓ | 10 mins |
| 5 | Mama Eze, 65F | 🔴 High | RED | RED | ✓ | 10 mins |

**Triage Accuracy: 5/5 (100%) · Total Time Saved: 42 minutes · Avg: 8.4 mins/patient**

---

## Patient 1 — Adeola Bakare · 34F · 🟢 LOW

**Chief Complaint:** Headache and dizziness (known BP patient)

---

**Conversation**

> **Kinetiq:** Hello! I'm the Kinetiq virtual assistant. I'll ask you a few questions about what brings you in today so the doctor can prepare for your visit. How can I help you?

> **Adeola:** I have been having this pounding headache and I feel a bit dizzy. I am not sure what is causing it.

> **Kinetiq:** That sounds uncomfortable — can you tell me how long you've been experiencing this pounding headache and dizziness, is it something that just started or has it been going on for a while?

> **Adeola:** It has been going on for about three days now.

> **Kinetiq:** So it's been a relatively short period of time, three days. Can you describe the headache a bit more — is it a mild ache or is it severe, and is it constant or does it come and go?

> **Adeola:** It is more like a dull, throbbing pain, mostly around the back of my head. I would say maybe a 4 out of 10. The dizziness is mild, not like the room is spinning, just a little unsteady.

> **Kinetiq:** So the headache is a dull, throbbing pain mostly at the back of your head and the dizziness is mild and makes you feel a bit unsteady. Have you noticed any other symptoms such as nausea, sensitivity to light or sound, or fever?

> **Adeola:** No, just the headache and the dizziness. No vomiting or anything like that.

> **Kinetiq:** You're experiencing the headache and dizziness in isolation without any other symptoms. Do you have any pre-existing medical conditions, or are you taking any medications or supplements?

> **Adeola:** Yes, the doctor told me my blood pressure is high so I take a tablet every morning. I think it is called Amlodipine. I have been on it for about two years.

> **Kinetiq:** You've been taking Amlodipine for high blood pressure for about two years — that's helpful to know. Are you allergic to any medications, or have you had any adverse reactions in the past?

> **Adeola:** No allergies that I know of. I just want to make sure my blood pressure is okay.

> **Kinetiq:** Thank you for sharing all this information — the doctor will review your details shortly. I wish you all the best.

---

**AI-Generated Clinical Summary** 🟢 GREEN

> *"The patient is experiencing a dull, throbbing headache and mild dizziness for three days, with no other symptoms like nausea or vomiting, and has a history of high blood pressure managed with Amlodipine. The headache is rated 4 out of 10 and the dizziness is mild. The patient's primary concern is ensuring their blood pressure is under control."*

**Next Steps for Doctor:** Review the patient's blood pressure records and evaluate the headache and dizziness in the context of the patient's hypertension; consider checking the current medication regimen.

| Metric | Value |
|---|---|
| Baseline review time | 8 mins |
| Kinetiq review time | 2 mins |
| **Time saved** | **6 mins** |

---

## Patient 2 — Femi Adegoke · 25M · 🟡 MEDIUM

**Chief Complaint:** Sudden crampy abdominal pain migrating to lower right

---

**Conversation**

> **Kinetiq:** Hello! I'm the Kinetiq virtual assistant. I'll ask you a few questions about what brings you in today so the doctor can prepare for your visit. How can I help you?

> **Femi:** I am having a bad pain in my stomach, it started this morning and it keeps coming and going.

> **Kinetiq:** Can you tell me more about the pain — how severe is it on a scale of 1 to 10, and is it a sharp, dull, or crampy feeling?

> **Femi:** It started just a few hours ago, maybe since around 6 this morning.

> **Kinetiq:** So the pain started around 6 am and it's been coming and going — have you noticed any other symptoms like nausea, vomiting, or changes in your bowel movements?

> **Femi:** The pain is crampy, like something squeezing inside. It started around my belly button but now it feels more towards the lower right side of my stomach. I would say about a 6 or 7 out of 10.

> **Kinetiq:** That sounds uncomfortable — have you experienced any other symptoms like fever, chills, or loss of appetite?

> **Femi:** I feel slightly sick to my stomach, like I might vomit. I have not vomited yet though. No diarrhoea.

> **Kinetiq:** The nausea is likely adding to your discomfort — do you have any pre-existing medical conditions or previous surgeries that might be relevant?

> **Femi:** No, I have never had any serious illness before and I am not on any medication.

> **Kinetiq:** That's helpful — are you allergic to any medications, foods, or substances that you're aware of?

> **Femi:** The pain on the right side is getting worse and I am a bit scared. I have never felt this kind of pain before.

> **Kinetiq:** Thank you for sharing. I'm going to make sure the doctor is aware of all the details — they will review your information shortly. I wish you a speedy recovery.

---

**AI-Generated Clinical Summary** 🟡 YELLOW

> *"The patient is experiencing crampy stomach pain that started around 6am, initially around the belly button and now more towards the lower right side, with a severity of 6–7 out of 10, accompanied by nausea but no vomiting or diarrhoea. The patient has no pre-existing medical conditions or allergies. The pain is worsening and causing concern."*

**Next Steps for Doctor:** Promptly review the patient's symptoms and consider potential causes such as appendicitis; prepare for a thorough examination and possible further testing.

| Metric | Value |
|---|---|
| Baseline review time | 11 mins |
| Kinetiq review time | 3 mins |
| **Time saved** | **8 mins** |

---

## Patient 3 — Aisha Usman · 37F · 🟡 MEDIUM

**Chief Complaint:** Pelvic pain + yellowish discharge + unidentified antibiotic allergy

---

**Conversation**

> **Kinetiq:** Hello! I'm the Kinetiq virtual assistant. I'll ask you a few questions about what brings you in today so the doctor can prepare for your visit. How can I help you?

> **Aisha:** I have been having pain in my lower belly and there is a discharge that is not normal for me.

> **Kinetiq:** That must be uncomfortable for you. Can you tell me how long you've been experiencing the pain and discharge?

> **Aisha:** It started about five days ago.

> **Kinetiq:** So it's been about five days since the symptoms began. How would you describe the severity of the pain — is it a dull ache, a sharp stabbing pain, or something else, and is it constant or does it come and go?

> **Aisha:** The pain is a dull ache, low down in my belly. I would say about a 6 out of 10. The discharge is yellowish and has a slight smell.

> **Kinetiq:** That sounds quite unpleasant, especially with the smell. Are you experiencing any other symptoms along with the pain and discharge, such as fever, itching, or difficulty urinating?

> **Aisha:** I also have a mild fever and the pain gets worse when I walk around. I feel generally unwell.

> **Kinetiq:** It sounds like you're feeling quite miserable. Have you had any similar problems in the past, such as urinary tract infections or other issues that might be related to your current symptoms?

> **Aisha:** I have no known medical conditions. But I need to mention that I once took an antibiotic, a capsule, and I got a very bad rash all over my body. The doctor at another hospital told me never to take that type of antibiotic again. I do not remember the exact name.

> **Kinetiq:** It's very important that you mentioned that — we'll flag this. Are you currently taking any medications or supplements, and do you have any other allergies?

> **Aisha:** I am very worried because this type of discharge has never happened to me before.

> **Kinetiq:** Thank you for sharing your concerns — the doctor will review all the information you've provided shortly. Please try not to worry, and I wish you all the best.

---

**AI-Generated Clinical Summary** 🟡 YELLOW

> *"The patient is experiencing a dull ache in the lower belly with a yellowish discharge and a slight smell, accompanied by a mild fever and worsening pain upon movement, with no known medical conditions but a history of a severe allergic reaction to an unspecified antibiotic."*

**Next Steps for Doctor:** Promptly evaluate the patient's symptoms — consider possible pelvic inflammatory disease or urinary tract infection — and take into account the antibiotic allergy history when prescribing treatment.

| Metric | Value |
|---|---|
| Baseline review time | 11 mins |
| Kinetiq review time | 3 mins |
| **Time saved** | **8 mins** |

---

## Patient 4 — Chukwuemeka Obi · 58M · 🔴 HIGH

**Chief Complaint:** Crushing chest pain radiating to left arm → suspected STEMI

---

**Conversation**

> **Kinetiq:** Hello! I'm the Kinetiq virtual assistant. I'll ask you a few questions about what brings you in today so the doctor can prepare for your visit. How can I help you?

> **Chukwuemeka:** Please I need help quickly. I have a very severe pain in the middle of my chest, it is spreading down my left arm.

> **Kinetiq:** That sounds very concerning — can you tell me how long you've been experiencing this chest pain and whether it's been constant or coming and going?

> **Chukwuemeka:** It started about 45 minutes ago and it has not stopped at all.

> **Kinetiq:** Are you also experiencing any other symptoms, such as shortness of breath, dizziness, or nausea, along with the chest pain?

> **Chukwuemeka:** It feels like something very heavy is sitting on my chest and squeezing it. I have never felt anything like this in my life. It is 10 out of 10.

> **Kinetiq:** That must be very frightening. Have you had any previous medical conditions such as high blood pressure or heart problems, or are you taking any medications?

> **Chukwuemeka:** I am sweating a lot, I feel like I want to vomit, and I am finding it hard to breathe properly.

> **Kinetiq:** It sounds like you are experiencing a lot of distressing symptoms. Do you have any known allergies to medications?

> **Chukwuemeka:** The doctor told me my blood pressure is high and I have sugar in my blood. I take a white tablet for the blood pressure and a round tablet for the sugar every day.

> **Kinetiq:** So you have a history of high blood pressure and diabetes and you're currently taking medication for both. Have you ever experienced anything like this before?

> **Chukwuemeka:** Please I am very scared, something is very wrong with me, I need to see the doctor immediately.

> **Kinetiq:** Thank you for sharing all of this — I'm making sure the doctor reviews it right away. The doctor will be with you shortly to help you.

---

**AI-Generated Clinical Summary** 🔴 RED

> *"The patient is experiencing severe, constant chest pain radiating down the left arm, accompanied by shortness of breath, sweating, nausea, and a feeling of heavy pressure on the chest, with a history of high blood pressure and diabetes."*

**Next Steps for Doctor:** Immediately attend to the patient to assess for potential myocardial infarction or other life-threatening conditions — consider emergency ECG, troponin, and urgent intervention.

| Metric | Value |
|---|---|
| Baseline review time | 14 mins |
| Kinetiq review time | 4 mins |
| **Time saved** | **10 mins** |

---

## Patient 5 — Mama Eze · 65F · 🔴 HIGH

**Chief Complaint:** Sudden "thunderclap" worst headache of life + neck stiffness + vomiting → suspected Subarachnoid Haemorrhage

---

**Conversation**

> **Kinetiq:** Hello! I'm the Kinetiq virtual assistant. I'll ask you a few questions about what brings you in today so the doctor can prepare for your visit. How can I help you?

> **Mama Eze:** I have the worst headache of my entire life. It hit me very suddenly like something exploded in my head.

> **Kinetiq:** That sounds extremely painful and alarming. Can you tell me approximately how long you've been experiencing this severe headache?

> **Mama Eze:** It came on about 30 minutes ago very suddenly. One moment I was fine, the next moment it was like a thunderclap.

> **Kinetiq:** A thunderclap headache is a very distinctive and intense type of headache. Are you experiencing any other symptoms along with it, such as nausea, vomiting, sensitivity to light, or dizziness?

> **Mama Eze:** It is the most severe pain I have ever experienced in my life. A 10 out of 10. It is all over my head.

> **Kinetiq:** The severity of the pain must be really overwhelming. Have you had any previous medical conditions such as migraines or high blood pressure?

> **Mama Eze:** My neck is very stiff, I cannot bend it forward. I have vomited twice since it started. I feel confused.

> **Kinetiq:** The stiffness in your neck and vomiting along with the severe headache are concerning symptoms. Are you currently taking any medications or do you have any known allergies?

> **Mama Eze:** I take a tablet for my blood pressure. I have had high blood pressure for many years.

> **Kinetiq:** It's good that you mentioned your high blood pressure and medication. Have you ever had any previous episodes of severe headaches like this?

> **Mama Eze:** This is not a normal headache. Something is very wrong. Please I need the doctor to see me right now.

> **Kinetiq:** Thank you for sharing all this — I'm making sure the doctor reviews it right away. The doctor will be with you shortly to assess your condition and provide the necessary care.

---

**AI-Generated Clinical Summary** 🔴 RED

> *"The patient is experiencing a sudden, severe headache described as a 'thunderclap' headache which started 30 minutes ago, accompanied by stiffness in the neck, vomiting, and confusion. The patient has a history of high blood pressure and is currently taking medication for it. The patient is extremely concerned and feels that something is very wrong."*

**Next Steps for Doctor:** Immediately assess the patient for potential life-threatening conditions such as a haemorrhagic stroke or subarachnoid haemorrhage — consider urgent CT scan or MRI.

| Metric | Value |
|---|---|
| Baseline review time | 14 mins |
| Kinetiq review time | 4 mins |
| **Time saved** | **10 mins** |

---

## Overall Results

| Metric | Value |
|---|---|
| Patients simulated | 5 |
| Triage accuracy | **5/5 (100%)** |
| Red-flag detection | **2/2 (100%)** |
| Total time saved | **42 minutes** |
| Average time saved | **8.4 mins/patient** |

> All patient responses were written in realistic lay language — patients described their symptoms and experiences without using clinical diagnosis names. Despite this, the AI correctly assessed urgency in every case, including flagging both life-threatening emergencies (chest pain + stroke-type headache) as RED immediately.
