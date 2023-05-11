// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 2
});

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Application folders
app.use(express.static("public"));
app.use(express.static("CSS"));
// Setup routes
app.get("/", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("index");
});


app.get("/search", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    //Create an empty customer object (To populate form with values)
    const cus = {
        cus_id: "",
        cus_Fname: "",
        cus_Lname: "",
        cus_state: "",
        cus_salesYTD: "",
        cus_SalesPrev: "",

    };
    res.render("search", {
        type: "get",
        totRecs: totRecs.totRecords,
        cus: cus
    });
});

app.post("/search", async (req, res) => {
    // Omitted validation check
    //  Can get totRecs from the page rather than using another DB call.
    //  Add it as a hidden form value.
    const totRecs = await dblib.getTotalRecords();
    /* console.log("search post", req.body) */
    dblib.findcustomers(req.body)
        .then(result => {
            console.log("resultis", result)
            res.render("search", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: result,
                cus: req.body
            })
        })
        .catch(err => {
            console.log("error is", err);
            res.render("search", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: `Unexpected Error: ${err.message}`,
                prod: req.body
            });
        });
});

// Define the route for creating a new customer
app.get("/createnewcustomer/",  (req, res) => {
    const cus = {
        cusid: "",
        cusfname: "",
        cuslname: "",
        cusstate: "",
        cussalesytd: "",
        cussalesprev: "",

    };
    res.render("createnewcustomer", { 
        type: "get",
        cus: cus
    },);

});

app.post("/createnewcustomer",  (req, res) => {
    dblib.insertcustomer(req.body)
        .then(result => {
          console.log(result, "this is result index");

            res.render("createnewcustomer", {
                type: "post",
                trans: result.trans,
                message: result.msg,
                cus: req.body
                
            });
            
        })
        .catch(err => {
            console.log("catch Activated");
            res.render("createnewcustomer", {
                type: "post",
                message: err.msg,
                cus: req.body
            });
        });
});

app.get("/import", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    //res.send("Root resource - Up and running!")
    res.render("import", {
        type: "get",
        totRecs: totRecs.totRecords,

    });
});

/*       app.post("/import",  upload.single('filename'), (req, res) => {
         if(!req.file || Object.keys(req.file).length === 0) {
             message = "Error: Import file not uploaded";
             return res.send(message);
         };
         //Read file line by line, inserting records
         const buffer = req.file.buffer; 
         const lines = buffer.toString().split(/\r?\n/);
      
         lines.forEach(line => {
              //console.log(line);
              product = line.split(",");
              //console.log(product);
          const sql = 'INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)';
              pool.query(sql, product, (err, result) => {
                  if (err) {
                      console.log(`Insert Error.  Error message: ${err.message}`);
                  } else {
                      console.log(`Inserted successfully`);
                  }
             });
         });
         message = `Records Processed: ${lines.length}`;
         res.send(message);
      });  */

/*     app.get("/export", async (req, res) => {
        const totRecs = await dblib.getTotalRecords();
        //res.send("Root resource - Up and running!")
        
        res.render("export", {
            type: "get",
            totRecs: totRecs.totRecords,
            
        });
    });
 */
app.get("/deletecustomer/:id", (req, res) => {
    const id = req.params.id;
    dblib.getcustomerbyid(id)
        .then(result => {
            console.log(result);
            res.render("deletecustomer", { x: result.cus, msg: "" })
        })
        .catch(error => {
            result = { msg: 'error: ${error.msg}' };
            res.render("deletecustomer", { result: result, msg: "" })
        })

    //   console.log(req.params.id);
    //res.send("Root resource - Up and running!")
    //     res.render("deletecustomer", {
    //     type: "get",
    //     cus: req.body
    // });
});

app.get("/updatecustomer/:id", (req, res) => {
    //res.send("Root resource - Up and running!")
    const id = req.params.id;
    dblib.getcustomerbyid(id)
        .then(result => {
            console.log(result);
            res.render("updatecustomer", { x: result.cus, msg: "" })
        })
        .catch(error => {
            result = { msg: 'error: ${error.msg}' };
            res.render("updatecustomer", { result: result, msg: "" })
        })
});




// const { updatecustomer } = require('./dblib.js');
// app.get('/updatecustomer/:cusid', (req, res) => {
//     var sql = `SELECT * FROM customer WHERE cusid = ${req.params.cusid}`;
//     pool.query(sql, (err, result) => {
//         if (err) {
//             return res.send(err.message);
//         }
//         res.render('updatecustomer', {
//             customer: result.rows[0], 
//             type: "get",
//             cus: req.body });
//     });
// });

app.post('/updatecustomer/:id', (req, res) => {
    var customer = {
        cusid: req.body.cusid,
        cusfname: req.body.cusfname,
        cuslname: req.body.cuslname,
        cusstate: req.body.cusstate,
        cussalesytd: req.body.cussalesytd,
        cussalesprev: req.body.cussalesprev
    };



    dblib.updatecustomer(customer)
        .then(result => {
            if (result.trans === "success") {
                res.render('updatecustomer', { success_msg: 'Customer Updated Successfully!', x: req.body, msg: result.msg2 });

            } else {
                res.render('error', { error: result, msg: result.msg2 });
            }
        })
        .catch(err => {
            res.render('error', { error: err });
        });
});

// const { deletecustomer } = require('./dblib.js');
// app.get("/deletecustomer/", (req, res) => {
//     var sql = `SELECT * FROM customer WHERE cusid = ${req.params.cusid}`;
//     pool.query(sql, (err, result) => {
//         if (err) {
//             return res.send(err.message);
//         }
//         res.render('deletecustomer', { customer: result.rows[0] });
//     });
// });


app.post('/deletecustomer/:id', (req, res) => {
    var cusid = req.body.cusid;
    //console.log("this is what we want: ",req.body);
    //console.log(req.body.cusid);
    dblib.deletecustomer(cusid)
        .then(result => {
            if (result.trans === "success") {
                res.render('deletecustomer', { success_msg: 'Customer Deleted Successfully', x: req.body, msg: result.msg2 });

            } else {
                res.render('error', { error: result, msg: result.msg2 });
            }
        })
        .catch(err => {
            res.render('error', { error: err });
        });
});

//     app.get("/import", async (req, res) => {
//         const totRecs = await dblib.getTotalRecords();
//         res.render("import", {
//             type: "get",
//             totRecs: totRecs.totRecords,

//         });
//       });




app.post("/import", upload.single('filename'), async (req, res) => {
    if (!req.file || Object.keys(req.file).length === 0) {
        message = "Error: Import file not uploaded";
        return res.send(message);
    };
    
    const buffer = req.file.buffer;
    const lines = buffer.toString().split(/\r?\n/);
    let numRecordsInserted = 0;
    let numRecordsNotInserted = 0;
    let errors = [];
    //         lines.forEach(line => {
    for (rec of lines) {
        product = rec.split(",");
        //console.log("Product prior to insertRecord is: ", product);
        const result = await dblib.insertRecord(product);
        if (result === "success") {
            numRecordsInserted++;
        } else {
            numRecordsNotInserted++;
            errors.push(`Customer ID: ${product[0]} - ${result}`);
        }
    }

    let message = "Import Summary:\n";
    message += `Records Processed: ${lines.length}\n`;
    message += `Records Inserted Successfully: ${numRecordsInserted}\n`;
    message += `Records Not Inserted: ${numRecordsNotInserted}\n`;

    // console.log("ERROR ARRAY IS **********", errors);
    for (e of errors) {
        message += `${e}\n`;
    };
    res.send(message);


})

app.get("/export", async (req, res) => {
    var message = "";
    const totRecs = await dblib.getTotalRecords();
    res.render("export", {
        message: message,
        type: "get",
        totRecs: totRecs.totRecords
    });
})


app.post("/export", (req, res) => {
    const sql = "SELECT * FROM customer ORDER BY cusid";
    pool.query(sql, [], (err, result) => {
        var message = "";
        if (err) {
            message = `Error - ${err.message}`;
            res.render("export", { message: message })
        } else {
            var output = "";
            result.rows.forEach(customer => {
                output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd},${customer.cussalesprev}\r\n`;
            });

            res.header("Content-Type", "text/plain");
            res.attachment(req.body.filename);
            return res.send(output);
        };
    });
});


// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

