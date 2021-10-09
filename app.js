const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user")
const authRoutes = require("./routes/authentication")
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use("/v1/users", userRoutes);
app.use("/v1/auth", authRoutes);

app.get('/.well-known/apple-app-site-association', function (request, response) {
    response.sendFile(__dirname + '/apple-app-site-association.json');
});

app.get("/home",
    function (req, res) {
        return res.json("Hello to home")
    })

mongoose.connect(process.env.MONDO_DB_URL)
    .then(() => { console.log("Connected to DataBase Successfully"); })
    .catch((error) => { console.log(error); });

app.listen(3000, console.log("Listening on Port 3000"),);