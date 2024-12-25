require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyhfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        //service APIs:
        const serviceCollection = client.db('service-db').collection('service');

        // add service API
        app.post('/add-service', async (req, res) => {
            const serviceData = req.body;
            const result = await serviceCollection.insertOne(serviceData)
            res.send(result)
            // console.log(result);
        })
        // set all services to localhost API
        app.get('/services', async(req, res)=>{
            const result = await serviceCollection.find().toArray();
            res.send(result);
        })
        // featured section data
        app.get('/featured-services', async (req, res) => {
            
            const result = await serviceCollection.find().limit(6).toArray();
            res.send(result)
            // console.log(result);
        })


        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from trustLens Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
