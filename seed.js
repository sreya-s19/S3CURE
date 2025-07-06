// seed.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- SETUP ---
const serviceAccountKeyPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountKeyPath);

const useEmulator = process.argv.includes('--emulator');

if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  console.log('--- RUNNING IN EMULATOR MODE ---');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const missionsJsonFilePath = path.join(__dirname, 'missions.json');
const badgesJsonFilePath = path.join(__dirname, 'badges.json');

// --- FUNCTIONS TO SEED DATA ---

// Function to seed missions
const seedMissions = async () => {
  try {
    console.log(`Reading missions from: ${missionsJsonFilePath}`);
    const fileContents = fs.readFileSync(missionsJsonFilePath, 'utf8');
    let missionsObject = JSON.parse(fileContents);

    // If the JSON is wrapped in a root "missions" object, unwrap it.
    if (missionsObject.missions) {
      missionsObject = missionsObject.missions;
    }

    if (!missionsObject || Object.keys(missionsObject).length === 0) {
      console.log('No missions found to seed. Skipping mission seeding.');
      return 0;
    }

    const missionsCollection = db.collection('missions');
    const batch = db.batch();
    let operationCount = 0;

    console.log('Preparing missions for upload...');

    for (const missionId in missionsObject) {
      if (Object.prototype.hasOwnProperty.call(missionsObject, missionId)) {
        const missionFromFile = missionsObject[missionId];

        // --- NEW: Robust Step Transformation ---
        // Map original step fields to the fields expected by our React app (tool, prompt, answer, successMessage)
        const transformedSteps = missionFromFile.steps ? missionFromFile.steps.map(step => ({
            tool: step.tool || step.type || 'terminal', // Use 'tool' or 'type', fallback to 'terminal'
            prompt: step.prompt || '',
            answer: step.answer || step.flag || '', // Use 'answer' or 'flag'
            successMessage: step.successMessage || step.success || '', // Use 'successMessage' or 'success'
            filesystem: step.filesystem || {} // Preserve filesystem or use empty object
        })) : [ // Fallback if no steps array in source JSON (shouldn't happen with your current missions.json)
            {
              tool: 'terminal',
              prompt: `Your objective is to solve the "${missionFromFile.title}" case. The flag has been leaked. Find and submit it.`,
              answer: missionFromFile.flag || '',
              successMessage: "Correct! Mission Complete.",
              filesystem: {
                "flag.txt": { "type": "text", "content": `The flag is: ${missionFromFile.flag || ''}` }
              }
            }
        ];

        const newMissionData = {
          title: missionFromFile.title,
          briefing: missionFromFile.description,
          difficulty: missionFromFile.difficulty.toLowerCase(),
          status: missionFromFile.unlocked ? 'Available' : 'Locked', // 'unlocked' from your JSON is mapped to 'status'
          steps: transformedSteps
        };

        // --- NEW: Assign default badgeId based on mission title/difficulty ---
        // This ensures every mission has a badge ID, which is needed for progression logic.
        if (!missionFromFile.badgeId) { // Only assign if not already in JSON
            if (missionFromFile.title === 'The Rookie Ping') newMissionData.badgeId = 'rookie-ping-master';
            else if (missionFromFile.title === 'Simple Password Leak') newMissionData.badgeId = 'password-breacher-bronze';
            else if (missionFromFile.title === 'Decode the Note') newMissionData.badgeId = 'cipher-cracker-silver';
            else if (missionFromFile.title === 'Quantum Mirage') newMissionData.badgeId = 'quantum-infiltrator-gold';
            else if (missionFromFile.title === 'Signal Snare') newMissionData.badgeId = 'network-sniffer-silver';
            else if (missionFromFile.title === 'Phantom Footprints') newMissionData.badgeId = 'image-forensics-bronze'; // Assign a new one
            else if (missionFromFile.title === 'Data Breach Traceback') newMissionData.badgeId = 'password-breacher-bronze';
            else if (missionFromFile.title === 'Encrypted Email Hunt') newMissionData.badgeId = 'cipher-cracker-silver';
            else if (missionFromFile.title === 'Network Packet Analysis') newMissionData.badgeId = 'network-sniffer-silver';
            else if (missionFromFile.title === 'Malware Signature Extraction') newMissionData.badgeId = 'malware-analyst-gold';
            else if (missionFromFile.title === 'Social Media Scraper') newMissionData.badgeId = 'osint-master-gold';
            else if (missionFromFile.title === 'Phishing Email Detection') newMissionData.badgeId = 'phish-spotter-bronze';
            else if (missionFromFile.title === 'Hidden Code in Image') newMissionData.badgeId = 'steganography-expert-silver'; // New badge
            else if (missionFromFile.title === 'Suspicious USB Analysis') newMissionData.badgeId = 'usb-forensics-bronze'; // New badge
            else if (missionFromFile.title === 'Wi-Fi Network Sniffing') newMissionData.badgeId = 'network-sniffer-silver';
            else if (missionFromFile.title === 'Browser History Forensics') newMissionData.badgeId = 'digital-forensics-bronze'; // New badge
            else if (missionFromFile.title === 'Encrypted Chat Logs') newMissionData.badgeId = 'cipher-cracker-silver';
            else if (missionFromFile.title === 'Log File Analysis') newMissionData.badgeId = 'log-analyst-bronze'; // New badge
            else if (missionFromFile.title === 'Social Media Footprint') newMissionData.badgeId = 'osint-master-gold';
            else if (missionFromFile.title === 'Ghost in the Server') newMissionData.badgeId = 'server-spectre-diamond'; // Specific complex mission
            else {
                // Default fallback for any mission without a specific badge mapping
                newMissionData.badgeId = 'unassigned-badge'; 
            }
        }
        
        // Ensure image URL for 'Ghost in the Server' is correct
        if (missionFromFile.title === 'Ghost in the Server') {
            const ghostServerImageStep = newMissionData.steps.find(step => step.tool === 'fileViewer');
            if (ghostServerImageStep && ghostServerImageStep.filesystem && ghostServerImageStep.filesystem['suspicious_image.jpg']) {
                ghostServerImageStep.filesystem['suspicious_image.jpg'].url = '/suspicious_image.jpg';
            }
        }


        const missionRef = missionsCollection.doc();
        batch.set(missionRef, newMissionData);
        operationCount++;
      }
    }

    if (operationCount > 0) {
      console.log(`Uploading ${operationCount} missions to Firestore...`);
      await batch.commit();
      console.log('✅ Missions seeded successfully.');
    } else {
        console.log('No missions found to seed. Skipping mission seeding.');
    }
    return operationCount;
  } catch (error) {
    console.error('❌ Error seeding missions:', error);
    return 0;
  }
};

// Function to seed badges
const seedBadges = async () => {
  try {
    console.log(`Reading badges from: ${badgesJsonFilePath}`);
    const fileContents = fs.readFileSync(badgesJsonFilePath, 'utf8');
    const badgesObject = JSON.parse(fileContents);

    if (!badgesObject || Object.keys(badgesObject).length === 0) {
      console.log('No badges found to seed. Skipping badge seeding.');
      return 0;
    }

    const badgesCollection = db.collection('badges');
    const batch = db.batch();
    let operationCount = 0;

    console.log('Preparing badges for upload...');

    for (const badgeId in badgesObject) {
      if (Object.prototype.hasOwnProperty.call(badgesObject, badgeId)) {
        const badgeData = badgesObject[badgeId];
        const badgeRef = badgesCollection.doc(badgeId);
        batch.set(badgeRef, badgeData);
        operationCount++;
      }
    }

    if (operationCount > 0) {
      console.log(`Uploading ${operationCount} badges to Firestore...`);
      await batch.commit();
      console.log('✅ Badges seeded successfully.');
    } else {
        console.log('No badges found to seed. Skipping badge seeding.');
    }
    return operationCount;
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    return 0;
  }
};

// --- MAIN EXECUTION ---
const main = async () => {
  console.log('\n--- Starting Firestore Seeding ---');
  if (useEmulator) {
    console.log('Ensuring emulator is running on localhost:8080...');
  }

  const seededMissionsCount = await seedMissions();
  const seededBadgesCount = await seedBadges();

  console.log('\n--- Seeding Summary ---');
  console.log(`Missions seeded: ${seededMissionsCount}`);
  console.log(`Badges seeded: ${seededBadgesCount}`);
  console.log('--- Firestore Seeding Complete ---');
};

main();