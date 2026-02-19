require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
require("./models/Mission")

const app = express()

mongoose.connect(process.env.MONGO_URI)

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.default.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: { maxAge: 1000 * 60 * 60 } // 1h
}))

app.use("/", require("./routes/auth"))
app.use("/game", require("./routes/game"))
app.use("/admin", require("./routes/admin"))

app.listen(5047, () => console.log("Serveur lancé sur 5047"))