const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql');
const fs = require('fs');

const app = express();

dotenv.config();

const PORT = process.env.PORT || 8080;

var conn = mysql.createPool({
  host: 'cloud-database-server.mysql.database.azure.com',
  // host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: 'data',
  port: 3306,
  ssl: { ca: fs.readFileSync('./mysql/DigiCertGlobalRootCA.crt.pem') },
  // debug: true,
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome' });
});

app.get('/pull/:hshd', (req, res) => {
  const hshd = req.params.hshd;
  const query =
    'SELECT * FROM data_pull WHERE Hshd_num = ? ORDER BY Basket_num, Date, Product_num, Department, Commodity;';
  conn.query(query, [hshd], (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
