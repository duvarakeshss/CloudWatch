const express = require("express");
const router = express.Router();
const { db, admin } = require("../database/db");

// POST /users - add a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, companyName } = req.body;

    const docRef = await db.collection("users").add({
      name,
      email,
      companyName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ id: docRef.id, message: "User added" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /users - fetch all users
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
