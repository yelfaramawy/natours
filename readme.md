# Natours API

This is the backend API for the Natours project, a tour booking website. It provides the server-side logic and functionality for handling tours, user authentication, bookings, and more.

## ✨ Features

- User authentication and authorization using JWT (JSON Web Tokens)
- CRUD operations for tours, users, and bookings
- Advanced filtering, sorting, and pagination for tours
- Error handling and validation
- Data modeling and integration with MongoDB database
- Integration with external services like Stripe for payments
- Server-side rendering with Pug template engine

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Pug
- Stripe (for payment processing)
- Deployment Tools
  
## 🚀 Getting Started

To get a local copy of the project up and running, follow these steps:

1. Clone this repo to your local machine using git clone https://github.com/<your-username>/natours.git.
2. Go to the project directory using cd natours.
3. Install the dependencies using npm install or yarn install.
4. Create a .env file in the root folder and add the following environment variables:
 NODE_ENV=development PORT=3000 DATABASE=<your-mongodb-connection-string> DATABASE_PASSWORD=<your-mongodb-password> JWT_SECRET=<your-jwt-secret> JWT_EXPIRES_IN=90d JWT_COOKIE_EXPIRES_IN=90 EMAIL_USERNAME=<your-email-username> EMAIL_PASSWORD=<your-email-password> EMAIL_HOST=<your-email-host> EMAIL_PORT=<your-email-port> EMAIL_FROM=<your-email-address> STRIPE_SECRET_KEY=<your-stripe-secret-key>
 5. Run the app using npm start or yarn start.
Open your browser and go to http://localhost:3000.

Run the app using npm start or yarn start.
Open your browser and go to http://localhost:3000.
## 💻 Deployment

This project can be deployed using various platforms and services, such as Heroku, AWS, or your preferred hosting provider. Please refer to the documentation of your chosen deployment platform for specific instructions on how to deploy a Node.js application.

## © Credits

This project is a result of following Jonas Schmedtmann's [Node.js, Express, MongoDB & More: The Complete Bootcamp 2020](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/) course on Udemy. I would like to express my gratitude to Jonas for providing the knowledge and guidance to develop this project.
