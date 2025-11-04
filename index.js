import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("./smart-deals-firebase-admin.json");

const app = express();
const port = process.env.PORT || 3000;
const uri =
  "mongodb+srv://smart-deals:2wcjFQhXHOtpycgB@basic-project.hymtgk.mongodb.net/?appName=basic-project";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Deals is running!!");
});
// smart - deals;
// 2wcjFQhXHOtpycgB
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyFirebaseToken = async (req, res, next) => {
  // console.log("token", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  try {
    const decodeToken = await admin.auth().verifyIdToken(token);
    req.user = decodeToken;
    // console.log('after decode',decodeToken);
    
     

    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "invalid or expired token" });
  }
};

const smartDeals = client.db("Smart-Deals");
const productsCollection = smartDeals.collection("products");
const bidsCollection = smartDeals.collection("bids");
const userCollection = smartDeals.collection("users");
async function run() {
  try {
    await client.connect();

    //all apis will be here for sometimes;

    //users api;
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email };
      const existingEmail = await userCollection.findOne(query);
      if (existingEmail) {
        res.send({ message: "this email already exist", success: false });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    //bids api;
    app.post("/bids", async (req, res) => {
      const newBids = req.body;
      const result = await bidsCollection.insertOne(newBids);
      res.send(result);
    });
    app.get("/bids", async (req, res) => {
      const cursor = bidsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/myBids",  async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email= email
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/myBids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });
    // bid for products
    app.get("/bids/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { productId: productId };
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //products api;
    app.get("/products",verifyFirebaseToken,   async (req, res) => {
    
      const user = req.user;
      console.log({user});
      
      const email = req.query.email;
      const query = {}
      if (email) {
        query.email=email
      }

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/latest-products", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({ created_at: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //you will be continue all time
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart is running on ${port}`);
});
