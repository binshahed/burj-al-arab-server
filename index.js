const express = require("express");
const bodeParser = require("body-parser");
const cors = require("cors");

const port = 5000;

const app = express();

app.use(cors());
app.use(bodeParser.json());

const password = "arabian123";

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://arabian:arabian123@cluster0.o73vx.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("burjAlArab").collection("bookins");
  console.log("db connected");

  //create booking
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newBooking);
  });

  //get bookings
  app.get("/bookings", (req, res) => {
    bookings.find({ email: req.query.email }).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port);
