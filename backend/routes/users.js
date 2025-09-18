import express from "express";
import { db, admin } from "../database/db.js";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - companyName
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               companyName:
 *                 type: string
 *                 description: Company name
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Auto-generated user ID
 *                 message:
 *                   type: string
 *                   example: "User added"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /users/check/{email}:
 *   get:
 *     summary: Check if user exists by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email to check
 *     responses:
 *       200:
 *         description: User exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Delete user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with email user@example.com deleted successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Update user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated user name
 *               companyName:
 *                 type: string
 *                 description: Updated company name
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with email user@example.com updated successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// UPDATE /users/:email - update user by email
router.put("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { name, companyName } = req.body; // pass any fields you want to update

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
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.status(200).json({ message: `User with email ${email} updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/machine:
 *   post:
 *     summary: Add a machine for a user
 *     tags: [Machines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machineId
 *               - location
 *               - userEmail
 *             properties:
 *               machineId:
 *                 type: string
 *                 description: Unique machine identifier
 *               location:
 *                 type: string
 *                 description: Machine location
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 description: User email to associate machine with
 *     responses:
 *       201:
 *         description: Machine added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Auto-generated machine ID
 *                 message:
 *                   type: string
 *                   example: "Machine added successfully"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "machineId, location, and userEmail are required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/machine/{email}:
 *   get:
 *     summary: Get machines for a user by email
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email to get machines for
 *     responses:
 *       200:
 *         description: List of user's machines
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User email
 *                 machines:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       machineId:
 *                         type: string
 *                         description: Machine identifier
 *                       location:
 *                         type: string
 *                         description: Machine location
 *       404:
 *         description: User or machines not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/machine/{email}/{machineId}:
 *   delete:
 *     summary: Delete a specific machine for a user
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID to delete
 *     responses:
 *       200:
 *         description: Machine deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Machine with ID M001 for user user@example.com deleted successfully"
 *       404:
 *         description: User or machine not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
