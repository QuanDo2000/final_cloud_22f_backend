const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const fastcsv = require('fast-csv');

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

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome' });
});

app.get('/pull/:hshd', (req, res) => {
  const hshd = req.params.hshd;
  console.log(`/pull/${hshd}`);
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

app.get('/dashboard/1', (req, res) => {
  const query =
    "SELECT Hshd_size, COUNT(Hshd_size) AS count FROM data_pull WHERE Hshd_size != 'null' GROUP BY Hshd_size;";
  conn.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

app.get('/dashboard/2', (req, res) => {
  const query =
    'SELECT Children, COUNT(Children) AS count FROM data_pull GROUP BY Children;';
  conn.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

app.get('/dashboard/3', (req, res) => {
  const query =
    "SELECT Income_range, COUNT(Income_range) AS count FROM data_pull WHERE Income_range != 'null' GROUP BY Income_range;";
  conn.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

app.get('/tpull/:hshd', (req, res) => {
  const hshd = req.params.hshd;
  console.log(`/pull/${hshd}`);
  const query =
    'SELECT * FROM tdata_pull WHERE Hshd_num = ? ORDER BY Basket_num, Date, Product_num, Department, Commodity;';
  conn.query(query, [hshd], (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

app.get('/tdashboard/1', (req, res) => {
  const query =
    "SELECT Hshd_size, COUNT(Hshd_size) AS count FROM tdata_pull WHERE Hshd_size != 'null' GROUP BY Hshd_size;";
  conn.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

app.get('/tdashboard/2', (req, res) => {
  const query =
    'SELECT Children, COUNT(Children) AS count FROM tdata_pull GROUP BY Children;';
  conn.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

app.get('/tdashboard/3', (req, res) => {
  const query =
    "SELECT Income_range, COUNT(Income_range) AS count FROM tdata_pull WHERE Income_range != 'null' GROUP BY Income_range;";
  conn.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ data: result });
    }
  });
});

var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, './uploads/');
  },
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
});

app.post('/upload/hshd', upload.any(), (req, res) => {
  console.log('/upload/hshd');
  if (req.files) {
    if (req.files.length == 1) {
      console.log('\tProcessing...');
      uploadCsv(__dirname + '/uploads/' + req.files[0].filename, 1)
        .then(() => {
          console.log('\tFile uploaded successfully.');
          res.status(200).json({ success: true });
        })
        .catch(() => {
          console.log('\tFile upload failed.');
          res.status(500).json({ success: false });
        });
    }
  }
});

app.post('/upload/product', upload.any(), (req, res) => {
  console.log('/upload/product');
  if (req.files) {
    if (req.files.length == 1) {
      console.log('\tProcessing...');
      uploadCsv(__dirname + '/uploads/' + req.files[0].filename, 2)
        .then(() => {
          console.log('\tFile uploaded successfully.');
          res.status(200).json({ success: true });
        })
        .catch(() => {
          console.log('\tFile upload failed.');
          res.status(500).json({ success: false });
        });
    }
  }
});

app.post('/upload/transaction', upload.any(), (req, res) => {
  console.log('/upload/transaction');
  if (req.files) {
    if (req.files.length == 1) {
      console.log('\tProcessing...');
      uploadCsv(__dirname + '/uploads/' + req.files[0].filename, 3)
        .then(() => {
          console.log('\tFile uploaded successfully.');
          res.status(200).json({ success: true });
        })
        .catch(() => {
          console.log('\tFile upload failed.');
          res.status(500).json({ success: false });
        });
    }
  }
});

app.get('/upload/finished', (req, res) => {
  const query =
    'CREATE TABLE tdata_pull AS SELECT thousehold.Hshd_num, ttransaction.Basket_num, ttransaction.Date, ttransaction.Product_num, tproduct.Department, tproduct.Commodity, ttransaction.Spend, ttransaction.Units, ttransaction.Store_region, ttransaction.Week_num, ttransaction.Year, thousehold.Loyalty_flag, thousehold.Age_range, thousehold.Marital_status, thousehold.Income_range, thousehold.Homeowner_desc, thousehold.Hshd_composition, thousehold.Hshd_size, thousehold.Children FROM thousehold, ttransaction, tproduct WHERE thousehold.Hshd_num = ttransaction.Hshd_num AND ttransaction.Product_num = tproduct.Product_num;';
  conn.query('DROP TABLE IF EXISTS tdata_pull;', (err) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      conn.query(query, (err) => {
        if (err) {
          res.status(500).json({ error: err });
        } else {
          res.status(200).json({ success: true });
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

async function initTable(type) {
  return new Promise((resolve, reject) => {
    if (type === 1) {
      conn.query('DROP TABLE IF EXISTS thousehold;', (err) => {
        if (err) {
          reject();
        } else {
          conn.query(
            'CREATE TABLE thousehold(Hshd_num INT NOT NULL, Loyalty_flag VARCHAR(5), Age_range VARCHAR(20), Marital_status VARCHAR(20), Income_range VARCHAR(20), Homeowner_desc VARCHAR(50), Hshd_composition VARCHAR(20), Hshd_size VARCHAR(5), Children VARCHAR(5), INDEX household_index (Hshd_num));',
            (err) => {
              if (err) {
                reject();
              } else {
                resolve();
              }
            }
          );
        }
      });
    } else if (type === 2) {
      conn.query('DROP TABLE IF EXISTS tproduct;', (err) => {
        if (err) {
          reject();
        } else {
          conn.query(
            'CREATE TABLE tproduct(Product_num INT NOT NULL, Department VARCHAR(20), Commodity VARCHAR(50), Brand_type VARCHAR(20), Natural_organic_flag VARCHAR(5), INDEX product_index (Product_num));',
            (err) => {
              if (err) {
                reject();
              } else {
                resolve();
              }
            }
          );
        }
      });
    } else if (type === 3) {
      conn.query('DROP TABLE IF EXISTS ttransaction;', (err) => {
        if (err) {
          reject();
        } else {
          conn.query(
            'CREATE TABLE ttransaction(Basket_num INT NOT NULL, Hshd_num INT NOT NULL, Date DATETIME, Product_num INT NOT NULL, Spend DECIMAL(5, 2), Units INT, Store_region VARCHAR(20), Week_num INT, Year INT, INDEX transaction_index (Basket_num, Hshd_num))',
            (err) => {
              if (err) {
                reject();
              } else {
                resolve();
              }
            }
          );
        }
      });
    }
  });
}

async function uploadCsv(uriFile, type) {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(uriFile);
    let csvData = [];
    let csvStream = fastcsv
      .parse({ trim: true, skipRows: 1, maxRows: 70000 })
      .on('data', (data) => {
        if (type === 3) {
          try {
            let date = new Date(data[2]);
            data[2] = date.toISOString().split('T')[0];
            csvData.push(data);
          } catch (err) {
            console.error(err);
            reject();
          }
        } else {
          csvData.push(data);
        }
      })
      .on('end', () => {
        initTable(type).then(() => {
          let query;
          if (type === 1) {
            query =
              'INSERT INTO thousehold(Hshd_num, Loyalty_flag, Age_range, Marital_status, Income_range, Homeowner_desc, Hshd_composition, Hshd_size, Children) VALUES ?';
          } else if (type === 2) {
            query =
              'INSERT INTO tproduct(Product_num, Department, Commodity, Brand_type, Natural_organic_flag) VALUES ?';
          } else if (type === 3) {
            query =
              'INSERT INTO ttransaction(Basket_num, Hshd_num, Date, Product_num, Spend, Units, Store_region, Week_num, Year) VALUES ?';
          }
          conn.query(query, [csvData], (err, res) => {
            if (err) {
              fs.unlinkSync(uriFile);
              reject();
            } else {
              fs.unlinkSync(uriFile);
              resolve();
            }
          });
        });
      });

    stream.pipe(csvStream);
  });
}
