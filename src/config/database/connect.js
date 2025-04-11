require("dotenv").config();
const mysql = require("mysql2/promise");

const database = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 30000,
});

async function connect() {
  try {
    const connection = await database.getConnection();
    console.log("Kết nối đến MySQL thành công!");
    connection.release();
  } catch (err) {
    console.error("Lỗi kết nối CSDL: " + err);
    throw err;
  }
}

// connect();

async function queryDatabase() {
  try {
    const [rows] = await database.query("SELECT * FROM Users");
    console.log("Dữ liệu từ bảng Users:", rows);
    console.log("Kết nối và truy xuất vào CSDL thành công!!!");

    return rows;
  } catch (err) {
    console.error("Lỗi truy vấn: " + err.message);
  }
}

// queryDatabase();

module.exports = { database, queryDatabase };
