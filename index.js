const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000



app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
  res.send('doctor is runing');
})






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lgfbklm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();
    const servicescollaction = client.db("carDoctor").collection("services");
    const bookingData = client.db("carDoctor").collection("bookings");

    app.get('/services', async (req, res) => {

      const cursor = servicescollaction.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.post('/bookings', async (req, res) => {
      const booking = req.body
      console.log(booking);
      const result = await bookingData.insertOne(booking);
      res.send(result);
    })


    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await servicescollaction.findOne(query)
      res.send(result);
    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`doctor server is run port ${port}`);
})