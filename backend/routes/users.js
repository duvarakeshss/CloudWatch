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
    console.log("User added with ID:", docRef.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error adding user:", error);
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

//GET /users/check/:email - check user exists 
router.get("/check/:email",async(req,res)=>{
   try {
    const { email } = req.params;

    // Query the users collection for this email
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1) // only need 1 document
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ exists: false, message: "User not found" });
    }

    // Email exists
    res.status(200).json({ exists: true, user: snapshot.docs[0].data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
module.exports = router;
