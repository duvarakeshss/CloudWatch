import express from "express";
import { db, admin } from "../database/db.js";

const router = express.Router();

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admins]
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
 *                 description: Admin's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address
 *               companyName:
 *                 type: string
 *                 description: Company name
 *     responses:
 *       200:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Auto-generated admin ID
 *                 message:
 *                   type: string
 *                   example: "Admin added"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /admin - add a new admin
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

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admins]
 *     responses:
 *       200:
 *         description: List of all admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /admin/{email}:
 *   get:
 *     summary: Get users by admin's company
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Admin email to get company users for
 *     responses:
 *       200:
 *         description: List of users in the admin's company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companyName:
 *                   type: string
 *                   description: Company name
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Admin not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /admin/check/{email}:
 *   get:
 *     summary: Check if admin exists by email
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Admin email to check
 *     responses:
 *       200:
 *         description: Admin exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: true
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
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
 *                   example: "Admin not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//GET /admin/check/:email - check admin exists
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
    res.status(200).json({ exists: true, admin: snapshot.docs[0].data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
