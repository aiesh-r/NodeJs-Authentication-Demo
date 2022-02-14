require('dotenv').config();
require('./config/database').connect();
const bcrypt = require('bcryptjs/dist/bcrypt');
const express = require('express');
const User = require('./model/user');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json()); // convert request body to json

// register user endpoint
app.post("/register", async (req, res) => {
    try {
        // get user inputs from client
        const { first_name, last_name, email, password } = req.body;

        // vallidate user inputs
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All inputs are required");
        }

        // check if user already exists
        // vallidate if user exists in our db
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(409).send("This User Already Exist.Please Use Login.")
        }

        // encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // create user in our db
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword
        });

        // create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log("error in user registering", err);
    }
});

app.post("/login", async (req, res) => {
    try {
        // get user inputs
        const { email, password } = req.body;

        // validate user inputs
        if (!(email, password)) {
            // res.status(400).send("All fields are required");
            throw new Error("All the fields are required");
        }

        // validate if user exist in our db
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;

            // return user
            res.status(200).json(user);

        }
        // res.status(400).send("invalid credentials");

    } catch (e) {
        console.log("error in user login", e);
    }
});

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome!!!");
});

module.exports = app;