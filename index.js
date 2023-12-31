const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Meal DB Server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rnoho8k.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const favouriteCollection = client.db("mealDB").collection("favourites");

    app.get("/api/v1/get-favourite", async (req, res) => {
      const { id } = req.query;
      const query = { userId: id };

      const cursor = favouriteCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    app.post("/api/v1/user/create-token", async (req, res) => {
      const userInfo = req.body;
      const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        })
        .send({ success: true });
    });

    app.post("/api/v1/add-favourite", async (req, res) => {
      const foodInfo = req.body;
      const result = await favouriteCollection.insertOne(foodInfo);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
