const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.fezt5ye.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const productCollection = client.db("productDB").collection("products");
    const myCartCollection = client.db("productDB").collection("myCart");

    // app.get("/products/:brandName", async (req, res) => {
    //   const brand = req.params.brandName.toLowerCase();
    //   const query = { brand: brand };
    //   const products = await productCollection.find(query).toArray();
    //   res.send(products);
    // });

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.put("/products/update/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = {
        $set: {
          name: product.name,
          image: product.image,
          brand: product.brand,
          type : product.type,
          price : product.price,
          rating: product.rating,
          description: product.description,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedProduct,
        options

      );
      res.send(result);
    });

    app.get("/myCart", async (req, res) => {
      const cursor = myCartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/myCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const product = await myCartCollection.findOne(query);
      res.send(product);
    });

    app.delete("/myCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await myCartCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/myCart", async (req, res) => {
      const product = req.body;
      const result = await myCartCollection.insertOne(product);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
