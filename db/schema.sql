CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id VARCHAR(6) NOT NULL,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  stock_quantity INT NOT NULL
);


CREATE TABLE usersBamazon (
  userName VARCHAR(50) NOT NULL PRIMARY KEY,
  password VARCHAR(50) NOT NULL
);


CREATE TABLE sales (
  item_id VARCHAR(6) NOT NULL,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  quantity INT NOT NULL,
  total_sales DECIMAL(10,4) NOT NULL
);

