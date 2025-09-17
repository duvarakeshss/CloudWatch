const admin = require("firebase-admin");

// Load your service account key
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "cloudwatch-mananger.appspot.com", // must end with .appspot.com
});

const db = admin.firestore();

module.exports = { db, admin };
