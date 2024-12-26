require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId, Timestamp } = require('mongodb');
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
        const reviewCollection = client.db('service-db').collection('review');

        // add service API
        app.post('/add-service', async (req, res) => {
            const serviceData = req.body;
            const result = await serviceCollection.insertOne(serviceData)
            res.send(result)
            // console.log(result);
        })
        // // set all services to localhost API
        // app.get('/services', async (req, res) => {
        //     const result = await serviceCollection.find().toArray();
        //     res.send(result);
        // })
        // get all services by extra functionality : filter / search
        app.get('/services', async(req, res)=>{
            const filter = req.query.filter;
            console.log(filter);
            let query = {}
            if(filter){
                query.category = filter;
            }
            const result = await serviceCollection.find(query).toArray();
            res.send(result);
        })
        // featured section data
        app.get('/featured-services', async (req, res) => {

            const result = await serviceCollection.find().limit(6).toArray();
            res.send(result)
            // console.log(result);
        })
        // get individual data 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })
        // get all services posted by specific user 
        app.get('/my-services/:email', async (req, res) => {
            const email = req.params.email;
            const search = req.query.search;
            let query = { email: email, 
                title : {
                    $regex: search,
                    $options: "i"
                }
             };
            const result = await serviceCollection.find(query).toArray()
            // console.log(result);
            res.send(result);
        })
        //Update Service
        // use Put operation to update
        app.put('/update-service/:id', async (req, res) => {
            const id = req.params.id;
            const service = req.body;
            const updated = {
                $set: service
            }
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const result = await serviceCollection.updateOne(query, updated, options);
            res.send(result);
        })
        // delete a job 
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })

        // review APIs
        // Add review to db
        app.post('/add-review', async (req, res) => {
            const reviewData = req.body;
            const result = await reviewCollection.insertOne(reviewData)
            res.send(result)
            // console.log(result);
        })
        // set all reviews to API
        app.get('/reviews', async(req, res)=>{
            const result = await reviewCollection.find().toArray();
            res.send(result);
        })
        // get all services posted by specific user 
        app.get('/my-reviews/:email', async (req, res) => {
            const email = req.params.email;
            let query = { email: email };
            const result = await reviewCollection.find(query).toArray()
            // console.log(result);
            res.send(result);
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
