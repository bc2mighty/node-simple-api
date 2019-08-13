if(process.env.NODE_ENV !== 'production'){
    require("dotenv").config({path: __dirname + '/.env'});
}

const express = require("express")
const app = express()
const morgan = require("morgan")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

//Make Changes here to connect it to the real database on Mongo Atlas
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})

const db = mongoose.connection;

db.on("error", error => console.log(error));
db.once("open", () => console.log("Connected!"));

mongoose.Promise = global.Promise
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const productRoutes = require("./api/routes/products")
const orderRoutes = require("./api/routes/order")
const userRoutes = require("./api/routes/user")

app.use(morgan("dev"))
app.use("/uploads",express.static("uploads"))
app.use(bodyParser.urlencoded({extended: false, limit: "5mb"}))
app.use(bodyParser.json({limit: "5mb"}))

/*
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin","*")
  res.header(
    "Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )
  if(req.method === "OPTIONS"){
    res.header("Access-Control-Allow-Methods","PUT, POST, PATCH, DELETE, GET")
    res.status(200).json({})
  }
})

app.use((req, res, next) => {
    const error = new Error("Not Found")
    error.status = 404
    next(error)
})
*/

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

app.use('/products', productRoutes)
app.use("/orders", orderRoutes)
app.use("/users", userRoutes)

module.exports = app
