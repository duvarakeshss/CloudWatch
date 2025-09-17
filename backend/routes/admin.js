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
    console.log("Admin added with ID:", docRef.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error adding admin:", error);
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

// GET /admin/:email - given an admin email, fetch users with the same company name
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

//GET /admin/check/:email - check user exists 
router.get("/check/:email",async(req,res)=>{
   try {
    const { email } = req.params;

    // Query the admin collection for this email
    const snapshot = await db
      .collection("admin")
      .where("email", "==", email)
      .limit(1) // only need 1 document
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ exists: false, message: "Admin not found" });
    }

    // Email exists
    res.status(200).json({ exists: true, user: snapshot.docs[0].data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
module.exports = router;
