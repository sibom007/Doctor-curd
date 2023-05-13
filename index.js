// importent links
// require('crypto').randomBytes(64).toString('hex')
// https://github.com/auth0/node-jsonwebtoken

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const decode = require('jsonwebtoken/decode');
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

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: '1unauthorizasd' })
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token, process.env.ASSESS_TOKEN_SECRET, (error, decode) => {
    if (error) {
      return res.status(403).send({ error: true, message: '2unauthorizasd' })
    }
    req.decode = decode;
    next();
  })
}

async function run() {
  try {

    await client.connect();
    const servicescollaction = client.db("carDoctor").collection("services");
    const bookingData = client.db("carDoctor").collection("bookings");

    //jwt token servise
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ASSESS_TOKEN_SECRET,
        { expiresIn: "1h" })
      res.send({ token })
    })




    //clint services
    app.get('/services', async (req, res) => {
      const cursor = servicescollaction.find();
      const result = await cursor.toArray();
      res.send(result);
    })



    app.post('/bookings', async (req, res) => {
      const booking = req.body
      const result = await bookingData.insertOne(booking);
      res.send(result);
    })


    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await servicescollaction.findOne(query)
      res.send(result);
    })


    app.get('/bookings', verifyJWT, async (req, res) => {
      const decode = req.decode;
      console.log(decode);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      if (decode.email  !== req.query.email) {
        return res.status(403).send({ error: true, message: 'unauthorizasd' })
      }
      const result = await bookingData.find().toArray()
      res.send(result);
    })

    app.delete('/Bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingData.deleteOne(query)
      res.send(result);
    })


    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const Updatebooking = req.body
      console.log(Updatebooking);


      const updateDoc = {
        $set: {
          status: Updatebooking.status
        },
      };


      const result = await bookingData.updateOne(filter, updateDoc);
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