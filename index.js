// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();



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
 app.get( "/createnewcustomer", ( req, res ) => {
    res.render( "createnewcustomer" );
  });

  app.post( "/createnewcustomer", (req, res ) => {
    dblib.insertcustomer( req.body )
        .then(result => {
            res.render("createnewcustomer", {
                type: "post",
                message: "Customer Created Successfully!"
            })
        })
        .catch(err => {
            res.render("createcreatenewcustomer", {
                type: "post",
                message: "Customer Creation Failed!"
            })
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
      
      app.post("/import",  upload.single('filename'), (req, res) => {
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
      }); 

    app.get("/export", async (req, res) => {
        const totRecs = await dblib.getTotalRecords();
        //res.send("Root resource - Up and running!")
        
        res.render("export", {
            type: "get",
            totRecs: totRecs.totRecords,
            
        });
    });

    app.get("/deletecustomer", (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM customer WHERE cus_id = $1";
        //res.send("Root resource - Up and running!")
        res.render("deletecustomer", {
        type: "get",
        cus: req.body
    });
});

    app.get("/updatecustomer", (req, res) => {
        //res.send("Root resource - Up and running!")
        res.render("updatecustomer", {
        type: "get",
        cus: req.body
    });
    });

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

