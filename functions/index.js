// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Initialize CORS middleware

admin.initializeApp();
const db = admin.firestore();

// We are changing this from https.onCall to https.onRequest
exports.checkRankPromotion = functions.https.onRequest((req, res) => {
  // 1. Wrap the function logic in the CORS middleware
  cors(req, res, async () => {
    try {
      // Manually check that the request is a POST request
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      // 2. Get the userId from the request body.
      // The structure { data: { userId } } mimics the onCall format.
      const userId = req.body.data.userId;
      if (!userId) {
        console.error("User ID is missing from the request body.");
        res.status(400).send({ error: 'User ID is required.' });
        return;
      }
      console.log(`Checking rank promotion for user: ${userId}`);
      
      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        console.error(`User document ${userId} not found.`);
        res.status(404).send({ error: 'User not found.' });
        return;
      }

      const userData = userSnap.data();
      const badgeCount = userData.badges?.length || 0;
      let newRank = userData.rank;

      // --- Your Rank Promotion Logic ---
      // (This is an example, adjust the numbers as needed)
      if (badgeCount >= 5 && newRank === 'Analyst') { // Example threshold
        newRank = 'Lead';
      } else if (badgeCount >= 1 && newRank === 'Trainee') { // Example threshold
        newRank = 'Analyst';
      }
      // Add more promotion logic here...

      if (newRank !== userData.rank) {
        await userRef.update({ rank: newRank });
        console.log(`User ${userId} promoted to ${newRank}.`);
        res.status(200).send({ success: true, newRank: newRank });
      } else {
        console.log(`User ${userId} not eligible for promotion. Current rank: ${userData.rank}, Badges: ${badgeCount}`);
        res.status(200).send({ success: true, newRank: userData.rank });
      }

    } catch (error) {
      console.error("Error in checkRankPromotion function:", error);
      res.status(500).send({ error: 'An internal error occurred.' });
    }
  });
});