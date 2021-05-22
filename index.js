const express = require("express");
const bodeParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const MongoClient = require("mongodb").MongoClient;

require("dotenv").config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o73vx.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const port = 5000;

const app = express();

app.use(cors());
app.use(bodeParser.json());

var serviceAccount = require("./configs/burj-al-arab-h-firebase-adminsdk-mng92-f970823294.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-h.firebaseio.com",
});


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
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail }).toArray((err, documents) => {
              res.status(200).send(documents);
            });
          } else {
            res.status(401).send("un-authorize access");
          }
          // ...
        })
        .catch((error) => {
          res.status(401).send("un-authorize decoded");
        });
    } else {
      res.status(401).send("un-authorize access");
    }

    // idToken comes from the client app
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port);
