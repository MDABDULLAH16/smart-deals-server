import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

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

const smartDeals = client.db("Smart-Deals");
const productsCollection = smartDeals.collection("products");
const bidsCollection = smartDeals.collection('bids');
async function run() {
  try {
    await client.connect();

      //all apis will be here for sometimes;
      //bids api;

      app.post('/bids', async (req, res) => {
          const newBids = req.body;
          const result = await bidsCollection.insertOne(newBids);
          res.send(result)
      })
      app.get('/bids', async (req, res) => {
          const cursor = bidsCollection.find();
          const result = await cursor.toArray();
          res.send(result)
        })
    //products api;
      app.get("/products", async (req, res) => {
          const email = req.query.email;
          const query = {};
          if (email) {
            query.email= email
          }
      const cursor = productsCollection.find(query);
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
      res.send({
        message: "product create Successful",
        data: result,
        success: true,
      });
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
