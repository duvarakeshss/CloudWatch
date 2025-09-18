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
});
// DELETE /users/:email - delete user by email
router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Query users collection for this email
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all matching docs (in case multiple users with same email)
    snapshot.forEach(async (doc) => {
      await db.collection("users").doc(doc.id).delete();
    });

    res.status(200).json({ message: `User with email ${email} deleted successfully` });
    console.log(`User with email ${email} deleted`);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE /users/:email - update user by email
router.put("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { name, companyName, age } = req.body; // pass any fields you want to update

    // Query users collection for this email
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update all matching docs (in case multiple users with same email)
    snapshot.forEach(async (doc) => {
      await db.collection("users").doc(doc.id).update({
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(age && { age }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.status(200).json({ message: `User with email ${email} updated successfully` });
    console.log(`User with email ${email} updated`);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

// ADD a Machine - /users/machine
router.post("/machine", async (req, res) => {
  try {
    const { machineId, location, userEmail } = req.body;

    if (!machineId || !location || !userEmail) {
      return res.status(400).json({ message: "machineId, location, and userEmail are required" });
    }

    // Find the user by email
    const userSnapshot = await db.collection("users").where("email", "==", userEmail).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get first matched user (assuming unique email)
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // Save machine data
    const machineRef = await db.collection("Machine").add({
      machineId,
      location,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      id: machineRef.id,
      message: "Machine added successfully",
    });

    console.log(`✅ Machine ${machineId} added for User ${userEmail} (UserId: ${userId})`);
  } catch (error) {
    console.error("Error adding machine:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET machines for a user by email - /users/machine/:email
router.get("/machine/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find user by email
    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assume unique email → take first match
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // Find machines belonging to this user
    const machineSnapshot = await db.collection("Machine").where("userId", "==", userId).get();

    if (machineSnapshot.empty) {
      return res.status(404).json({ message: "No machines found for this user" });
    }

    // Collect machines
    const machines = machineSnapshot.docs.map(doc => ({
      machineId: doc.data().machineId,
      location: doc.data().location
    }));

    res.status(200).json({ email, machines });
    console.log(`✅ Fetched machines for User ${email}`);
  } catch (error) {
    console.error("Error fetching machines:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE machine by email and machineId - /users/machine/:email/:machineId
router.delete("/machine/:email/:machineId", async (req, res) => {
  try {
    const { email, machineId } = req.params;

    // 1. Find the user by email
    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // 2. Find the machine for this user
    const machineSnapshot = await db
      .collection("Machine")
      .where("userId", "==", userId)
      .where("machineId", "==", machineId)
      .get();

    if (machineSnapshot.empty) {
      return res.status(404).json({ message: "Machine not found for this user" });
    }

    // 3. Delete the machine document(s)
    machineSnapshot.forEach(async (doc) => {
      await db.collection("Machine").doc(doc.id).delete();
    });

    res.status(200).json({
      message: `Machine with ID ${machineId} for user ${email} deleted successfully`,
    });

    console.log(`✅ Deleted Machine ${machineId} for User ${email}`);
  } catch (error) {
    console.error("Error deleting machine:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
