# Udacity's Express/Prisma E-Commerce Website Backend

This is the backend project for a mock e-commerce website developed using Express and Prisma as part of the Udacity  Full-Stack Javascript Developer Nanodegree program. The backend provides the necessary APIs to interact with the database and serve data to the frontend.

## Installation
To install and run the project, follow these steps:

- Clone the repository to your local machine.
- Navigate to the project directory and run `npm install` to install the required dependencies.
- Create a .env file in the project directory and add the necessary environment variables (see .env-example for an example).
- Run `npm run dev` to start the development server.

## Usage 
Once the backend server is up and running, it provides the following APIs for the frontend to interact with:


### Users

| Endpoint       | Verb   |
| -------------- | ------ |
| /users/        | GET    |
| /users/:userId | GET    |
| /users/        | POST   |
| /users/:userId | PUT    |
| /users/:userId | DELETE |

### Products

| Endpoint             | Verb   |
| -------------------- | ------ |
| /products/           | GET    |
| /products/:productId | GET    |
| /products/           | POST   |
| /products/:productId | PUT    |
| /products/:productId | DELETE |

### OrderItems

| Endpoint                               | Verb   |
| -------------------------------------- | ------ |
| /users/:userId/orderitems/             | GET    |
| /users/:userId/orderitems/:orderItemId | GET    |
| /users/:userId/orderitems/             | POST   |
| /users/:userId/orderitems/:orderItemId | PUT    |
| /users/:userId/orderitems/:orderItemId | DELETE |

### Orders

| Endpoint                       | Verb |
| ------------------------------ | ---- |
| /users/:userId/orders/         | GET  |
| /users/:userId/orders/:orderId | GET  |
| /users/:userId/orders/         | POST |

## Contributing
This project is part of the Udacity Full-Stack Javascript Developer Nanodegree program and is not currently accepting external contributions.
