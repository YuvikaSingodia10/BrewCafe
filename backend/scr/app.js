const membersRoutes = require("./routes/members.routes");
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const rewardsRoutes = require("./routes/rewards.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BrewCafe API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/members", membersRoutes);

// Notification outbox
app.get("/api/outbox", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, message, type, created_at
       FROM notifications
       ORDER BY id ASC`
    );

    res.json({
      success: true,
      notifications: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch outbox"
    });
  }
});

// Expire points older than 90 days
app.post("/api/clock", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [oldPoints] = await connection.query(
      `SELECT user_id, SUM(points) AS expired_points
       FROM points_transactions
       WHERE type = 'EARN'
       AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
       GROUP BY user_id`
    );

    let expiredTotal = 0;

    for (const item of oldPoints) {
      const points = Number(item.expired_points);

      if (points <= 0) continue;

      await connection.query(
        `UPDATE members
         SET points_balance = GREATEST(points_balance - ?, 0)
         WHERE user_id = ?`,
        [points, item.user_id]
      );

      await connection.query(
        `INSERT INTO points_transactions
         (user_id, type, points, description)
         VALUES (?, 'ADJUSTMENT', ?, ?)`,
        [
          item.user_id,
          -points,
          "Points expired after 90 days"
        ]
      );

      expiredTotal += points;
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Clock processed successfully",
      expiredPoints: expiredTotal,
      processedMembers: oldPoints.length
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      success: false,
      message: "Clock processing failed"
    });
  } finally {
    connection.release();
  }
});

module.exports = app;