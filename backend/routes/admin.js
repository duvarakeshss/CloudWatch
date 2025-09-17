const express = require("express");
const router = express.Router();
const { db, admin } = require("../database/db");

// POST /users - add a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, companyName } = req.body;

    const docRef = await db.collection("admin").add({
      name,
      email,
      companyName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ id: docRef.id, message: "Admin added" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /admin - fetch all admins
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("admin").get();
    const admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/:email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Step 1: Find the admin by email
    const adminSnapshot = await db
      .collection("admin")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const adminData = adminSnapshot.docs[0].data();
    const companyName = adminData.companyName;

    // Step 2: Fetch users with the same company name
    const userSnapshot = await db
      .collection("users")
      .where("companyName", "==", companyName)
      .get();

    const users = userSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ companyName, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
