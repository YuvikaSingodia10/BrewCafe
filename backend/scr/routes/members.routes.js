const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Lookup member by phone number
router.get("/phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const [rows] = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        m.points_balance,
        m.lifetime_earned_points,
        m.tier
       FROM users u
       JOIN members m ON u.id = m.user_id
       WHERE u.phone = ?`,
      [phone]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    res.json({
      success: true,
      member: rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Member lookup failed"
    });
  }
});

// Search/list members
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";

    const [rows] = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        m.points_balance,
        m.lifetime_earned_points,
        m.tier
       FROM users u
       JOIN members m ON u.id = m.user_id
       WHERE u.name LIKE ?
          OR u.email LIKE ?
          OR u.phone LIKE ?
       ORDER BY u.name ASC
       LIMIT 100`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    );

    res.json({
      success: true,
      count: rows.length,
      members: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch members"
    });
  }
});

module.exports = router;