CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id VARCHAR(6) NOT NULL PRIMARY KEY,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  stock_quantity INT NOT NULL
);

