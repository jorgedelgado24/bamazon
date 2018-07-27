var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  welcomeMessage();
});

function welcomeMessage() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "Welcome to Bamazon!",
      choices: [
        "Continue as Guest",
        "Log In",
        "Exit"
      ]
    })
    .then(function (answer) {
      switch (answer.action) {
        case "Continue as Guest":
          products();
          break;

        case "Log In":
          login();
          break;

        case "Exit":
          exit();
          break;
      }
    });
}

// --------------------------------------------------------------------------
// IF "CONTINUE AS GUEST" SELECTED FUNTIONS
// --------------------------------------------------------------------------

function products() {
  var query = "SELECT * FROM products";
  connection.query(query, function (err, res) {
    console.log("\nProducts\n")
    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $ " + res[i].price);
      console.log("---------------------------------------------------------");
    }
    buy();
  });
}

//Global variables to be filled in buy() and used in subtractStock() & addSale()
var itemBought;
var newStock;
var quantityBought;
var productBought;
var departmentSale;
var price;
var totalSales;

//Variable to be used when entered a username
var user = "";

//buy() where the user will chose which products they want to buy
function buy() {
  inquirer
    .prompt([
      {
        name: "productID",
        type: "input",
        message: "Which product ID will you want to buy?"
      },
      {
        name: "quantity",
        type: "input",
        message: "How many?"
      }
    ])
    .then(function (answer) {

      //Bring information from table for item_id chosen by user
      var query = "SELECT * FROM products WHERE ?";
      connection.query(query, { item_id: answer.productID }, function (err, res) {

        if (err) throw err;

        //IF quantity is less than or equal to stock ... 
        if (answer.quantity <= res[0].stock_quantity) {

          //Assigning values to global variables to be used in subtractStock() and addSale()
          itemBought = answer.productID;
          newStock = res[0].stock_quantity - answer.quantity;
          quantityBought = answer.quantity;
          productBought = res[0].product_name;
          departmentSale = res[0].department_name;
          price = res[0].price;
          totalSales = res[0].price * answer.quantity;

          //SUBTRACT the quantity to the stock_quantity
          subtractStock();

        } else {

          //Message mentioning we don't have enough stock to fulfill order
          console.log("We only have " + res[0].stock_quantity + " Item ID " + res[0].item_id);

          //Ask to chose products again
          buy();
        }
      });
    });
}

//Function to subtract the quantity they bought to the stock
function subtractStock() {

  //update the stock_quantity to the newStock
  var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
  connection.query(query, [newStock, itemBought], function (err, result) {
    if (result) {
      //CREATE row to the sales table
      addSale();
    }
  });
}


//function to add a sales row to sales table
function addSale() {

  //add a sales row in the sales table
  var query = "INSERT INTO sales (item_id, product_name, department_name, price, quantity, total_sales) VALUES (?,?,?,?,?,?)";
  connection.query(query, [itemBought, productBought, departmentSale, price, quantityBought, totalSales], function (err, res) {

    if (res) {
      //Thank you message
      console.log("\nThank you for your purchase of " + quantityBought + " " + productBought + ". \nYour Total is $ " + totalSales + " USD." + "\n\nWe hope to see you again soon!\n");



      //if there's an admin user logged in send to managerActions()
      if (user != "") {
        managerActions();
      } else {
        //send back to initial menu
        welcomeMessage();
      }
    }
  });
}


//function to end the connection (Exit)
function exit() {
  connection.end();
}




// --------------------------------------------------------------------------
// IF "LOG IN" SELECTED FUNCTIONS
// --------------------------------------------------------------------------



//User must log in
function login() {
  inquirer
    .prompt([
      {
        name: "username",
        type: "input",
        message: "Username: ",
      },
      {
        name: "password",
        type: "password",
        message: "Password: ",
      }
    ])
    .then(function (answer) {

      //Bring from table the row where that username and password are present
      var query = "SELECT * FROM usersBamazon WHERE ? AND ?";
      connection.query(query, [{ userName: answer.username }, { password: answer.password }], function (err, res) {

        //if the username and password are incorrect tell the user and send to initial menu
        if (res.length < 1) {
          console.log("\nCredentials invalid\n")
          return welcomeMessage();
        } else {
          //set user variable to answer.username
          user = answer.username;
          //if username and password are correct send them to managerActions()
          managerActions();
        }
      });
    });
}





function managerActions() {
  inquirer
    .prompt({
      name: "managerAction",
      type: "list",
      message: "\n What would you like to do next?\n",
      choices: [
        "Enter an order",
        "View Sales",
        "View Products",
        "View Low Inventory",
        "Add to Inventory",
        "Create New Product",
        "Create New User",
        "Exit"
      ]
    })
    .then(function (answer) {
      switch (answer.managerAction) {
        case "Enter an order":
          buyManager();
          break;

        case "View Sales":
          sales();
          break;

        case "View Products":
          productsManager();
          break;

        case "View Low Inventory":
          lowInventory();
          break;

        case "Add to Inventory":
          addInventory();
          break;

        case "Create New Product":
          createProduct();
          break;

        case "Create New User":
          createUser();
          break;

        case "Exit":
          exit();
          break;
      }
    });
}

//Function for manager to enter an order. First we show the products to manager including stock
function buyManager() {
  var query = "SELECT * FROM products";
  connection.query(query, function (err, res) {
    console.log("\nProducts\n")
    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Stock: " + res[i].stock_quantity + " || Price: $ " + res[i].price);
      console.log("---------------------------------------------------------");
    }
    buy();
  });
}


//Functionto show the sales
function sales() {
  var query = "SELECT * FROM sales";
  connection.query(query, function (err, res) {
    console.log("\Sales\n")
    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $ " + res[i].price + " || Quantity: " + res[i].quantity + " || Total Sales USD: $ " + res[i].total_sales);
      console.log("---------------------------------------------------------");
    }
    //return to managerActions() sales
    managerActions();
  });
}


//Function to show products to manager including stock
function productsManager() {
  var query = "SELECT * FROM products";
  connection.query(query, function (err, res) {
    console.log("\nProducts\n")
    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Stock: " + res[i].stock_quantity + " || Price: $ " + res[i].price);
      console.log("---------------------------------------------------------");
    }
    //After showing the products, ask the managerActions();
    managerActions();
  });
}


//Function to show the products with an inventory below 5
function lowInventory() {
  var query = "SELECT * FROM products WHERE stock_quantity < 5";
  connection.query(query, function (err, res) {
    console.log("\nProducts with stock below 5\n")
    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Stock: " + res[i].stock_quantity + " || Price: $ " + res[i].price);
      console.log("---------------------------------------------------------");
    }
    //After showing the products, ask the managerActions();
    managerActions();
  });
}


//Function to add inventory to an existing product
function addInventory() {
  //Show the products to the user so they can choose from one to update the stock
  var query = "SELECT * FROM products";
  connection.query(query, function (err, res) {
    console.log("\nProducts\n")
    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Stock: " + res[i].stock_quantity + " || Price: $ " + res[i].price);
      console.log("---------------------------------------------------------");
    }
    //Message telling the user what to do
    console.log("\nAdd Inventory to an existing product.\n");
    inquirer
      .prompt([
        {
          name: "productID",
          type: "input",
          message: "Which product ID do you want to add stock to?"
        },
        {
          name: "quantity",
          type: "input",
          message: "what's the new stock quantity for this product ID?"
        }
      ])
      .then(function (answer) {
        //update the stock_quantity to the one specified
        var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
        connection.query(query, [answer.quantity, answer.productID], function (err, result) {
          if (result) {
            //Send message to user that this has been updated
            console.log("\nUpdated the stock quantity of product ID " + answer.productID + " to " + answer.quantity + "\n")
            //Send the user to the managerActions() menu
            managerActions();
          }
        });
      });
  });
}


//Function to create a new product
function createProduct() {
  console.log("\nCreate a new product.\n");
  inquirer
    .prompt([
      {
        name: "productID",
        type: "input",
        message: "Product ID (6 characters: 2 Department. 4 Product): ",
      },
      {
        name: "productName",
        type: "input",
        message: "Product Name: ",
      },
      {
        name: "departmentName",
        type: "input",
        message: "Department Name: ",
      },
      {
        name: "price",
        type: "input",
        message: "Price: ",
      },
      {
        name: "stockQuantity",
        type: "input",
        message: "Stock Quantity: ",
      },
    ])
    .then(function (answer) {
      //inssert new product based on input
      var query = "INSERT INTO products (item_id, product_name, department_name, price, stock_quantity) VALUES (?,?,?,?,?)";
      connection.query(query, [answer.productID, answer.productName, answer.departmentName, answer.price, answer.stockQuantity], function (err, res) {

        if (res) {
          //Thank you message
          console.log("\nNew Product ID " + answer.productID + " created!\n");
          //send user to managerActions()
          managerActions();
        }
      });
    });
}


//Function to create a new admin user
function createUser() {
  console.log("\nCreate a new admin user.\n");
  inquirer
    .prompt([
      {
        name: "username",
        type: "input",
        message: "New Username: ",
      },
      {
        name: "password",
        type: "password",
        message: "Password: ",
      }
    ])
    .then(function (answer) {
      //create new user based on input
      var query = "INSERT INTO usersBamazon (userName, password) VALUES (?,?)";
      connection.query(query, [answer.username, answer.password], function (err, res) {

        if (res) {
          //Thank you message
          console.log("\nNew User " + answer.username + " created!\n");
          //send user to managerActions()
          managerActions();
        }
      });
    });
}



