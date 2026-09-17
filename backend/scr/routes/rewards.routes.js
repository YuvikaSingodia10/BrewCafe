const express = require("express");
const pool = require("../config/db");

const router = express.Router();

function calculateTier(points) {
  if (points >= 5000) return "PLATINUM";
  if (points >= 1000) return "GOLD";
  if (points >= 500) return "SILVER";
  return "BRONZE";
}

function getEarningRate(tier) {
  if (tier === "PLATINUM") return 0.3;
  if (tier === "GOLD") return 0.2;
  if (tier === "SILVER") return 0.15;
  return 0.1;
}

// Get member balance
router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        m.points_balance,
        m.lifetime_earned_points,
        m.tier
       FROM users u
       JOIN members m ON u.id = m.user_id
       WHERE u.id = ?`,
      [userId]
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
      message: "Could not fetch balance"
    });
  }
});

// Record purchase and earn points
router.post("/purchase", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { userId, amount, referenceId } = req.body;

    if (!userId || amount === undefined || !referenceId) {
      return res.status(400).json({
        success: false,
        message: "userId, amount and referenceId are required"
      });
    }

    await connection.beginTransaction();

    const [memberRows] = await connection.query(
      `SELECT points_balance, lifetime_earned_points, tier
       FROM members
       WHERE user_id = ?
       FOR UPDATE`,
      [userId]
    );

    if (memberRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    const currentMember = memberRows[0];
    const oldTier = currentMember.tier;

    const earningRate = getEarningRate(oldTier);
    const pointsEarned = Math.floor(Number(amount) * earningRate);

    const [purchaseResult] = await connection.query(
      `INSERT INTO purchases
       (user_id, reference_id, amount, points_earned)
       VALUES (?, ?, ?, ?)`,
      [userId, referenceId, amount, pointsEarned]
    );

    const newBalance = currentMember.points_balance + pointsEarned;
    const newLifetimeEarned =
      currentMember.lifetime_earned_points + pointsEarned;

    const newTier = calculateTier(newLifetimeEarned);

    await connection.query(
      `UPDATE members
       SET points_balance = ?,
           lifetime_earned_points = ?,
           tier = ?
       WHERE user_id = ?`,
      [newBalance, newLifetimeEarned, newTier, userId]
    );

    await connection.query(
      `INSERT INTO points_transactions
       (user_id, type, points, description, reference_id)
       VALUES (?, 'EARN', ?, ?, ?)`,
      [
        userId,
        pointsEarned,
        `Points earned from purchase of ${amount}`,
        referenceId
      ]
    );

    // Tier-change notification
    if (oldTier !== newTier) {
      await connection.query(
        `INSERT INTO notifications
         (user_id, message, type)
         VALUES (?, ?, 'TIER_CHANGE')`,
        [
          userId,
          `Congratulations! You moved from ${oldTier} to ${newTier}.`
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Purchase recorded successfully",
      purchaseId: purchaseResult.insertId,
      pointsEarned,
      pointsBalance: newBalance,
      lifetimeEarnedPoints: newLifetimeEarned,
      tier: newTier
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Purchase failed"
    });
  } finally {
    connection.release();
  }
});

// Redeem points
router.post("/redeem", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { userId, points, rewardName } = req.body;

    if (!userId || !points || !rewardName) {
      return res.status(400).json({
        success: false,
        message: "userId, points and rewardName are required"
      });
    }

    await connection.beginTransaction();

    const [members] = await connection.query(
      `SELECT points_balance
       FROM members
       WHERE user_id = ?
       FOR UPDATE`,
      [userId]
    );

    if (members.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    const currentBalance = members[0].points_balance;

    if (currentBalance < points) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Insufficient points",
        pointsBalance: currentBalance
      });
    }

    const newBalance = currentBalance - points;

    await connection.query(
      `UPDATE members
       SET points_balance = ?
       WHERE user_id = ?`,
      [newBalance, userId]
    );

    await connection.query(
      `INSERT INTO points_transactions
       (user_id, type, points, description)
       VALUES (?, 'REDEEM', ?, ?)`,
      [userId, -points, `Redeemed reward: ${rewardName}`]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Reward redeemed successfully",
      rewardName,
      pointsRedeemed: points,
      pointsBalance: newBalance
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Redemption failed"
    });
  } finally {
    connection.release();
  }
});

module.exports = router;