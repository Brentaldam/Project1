// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customer";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

module.exports.getTotalRecords = getTotalRecords;

const insertcustomer = (customer) => {
    // Will accept either a customer array or customer object
    if (customer instanceof Array) {
        params = customer;
    } else {
        params = Object.values(customer);
    };

    const sql = 'INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)';
    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `customer id ${params[0]} successfully inserted`,
                msg2: result.rowCount
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of customer id ${params[0]}.  ${err.message}`,
                
            };
        });
}; 



const findcustomers = (customer) => {
    // Will build query based on data provided in the form
    //  Use parameters to avoid sql injection

    // Declare variables
    console.log("in findCustomer, customer is:", customer);
    var i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build query as necessary
     if (customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += ` AND cusid = $${i}`;
        i++;
    };
    if (customer.cusfname !== "") {
        params.push(`${customer.cusfname}%`);
        sql += ` AND UPPER(cusfname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cuslname !== "") {
        params.push(`${customer.cuslname}%`);
        sql += ` AND UPPER(cuslname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cussalesytd !== "") {
        params.push(parseFloat(customer.cussalesytd));
        sql += ` AND cussalesytd >= $${i}`;
        i++;
    };

    sql += ` ORDER BY cusid`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

const updatecustomer = (customer) => {
    const sql = 'UPDATE customer SET cusfname = $1, cuslname = $2, cusstate = $3, cussalesytd = $4, cussalesprev = $5 WHERE cusid = $6';
    const params = [customer.cusfname, customer.cuslname, customer.cusstate, customer.cussalesytd, customer.cussalesprev, customer.cusid];
    return pool.query(sql, params)
        .then(result => {
            return {
                trans: "success",
                msg: `Customer id ${customer.cusid} successfully updated`,
                msg2: result.rowCount
            };
        })
        .catch(err => {
            return {
                trans: "fail",
                msg: `Error on update of customer id ${customer.cusid}.  ${err.message}`
                
            };
        });
};

const deletecustomer = (cusid) => {
    const sql = 'DELETE FROM customer WHERE cusid = $1';
    const params = [cusid];
    console.log(sql, cusid)
    return pool.query(sql, params)
        .then(result => {
            console.log(result);
            return {

                trans: "success",
                msg: `Customer id ${cusid} successfully deleted`,
                msg2: result.rowCount

            };
        })
        .catch(err => {
            console.log("delete customer fail",cusid)
            return {
                trans: "fail",
                msg: `Error on delete of customer id ${cusid}.  ${err.message}`
            };
        });
};




const getcustomerbyid = (cusid) => {
    const sql = 'select * FROM customer WHERE cusid = $1';
    const params = [cusid];
    return pool.query(sql, params)
        .then(result => {
            return {
                trans: "success",
                cus: result.rows[0]
            };
        })
        .catch(err => {
            return {
                trans: "fail",
                msg: `No record found.  ${err.message}`
            };
        });
};


// Add this at the bottom
module.exports.insertcustomer = insertcustomer;
module.exports.deletecustomer = deletecustomer;
module.exports.updatecustomer = updatecustomer; 
module.exports.getcustomerbyid = getcustomerbyid; 
// Add towards the bottom of the page
module.exports.findcustomers = findcustomers;