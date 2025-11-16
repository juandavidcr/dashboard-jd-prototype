const pool = require("./db");
const bcrypt = require("bcrypt");

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error("Usage: node createUser.js email password");
    process.exit(1);
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [res] = await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash]);
    console.log("Created user id", res.insertId);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
