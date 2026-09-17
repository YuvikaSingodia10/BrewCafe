require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully");
    connection.release();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  }
});