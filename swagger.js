const express = require('express');
const app = express();

app.use(express.json());

// ================= SWAGGER =================
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Backend API",
      version: "1.0.0",
      description: "Express + MongoDB + Swagger API"
    }
  },
  apis: ["swagger.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const jwt = require('jsonwebtoken');
const SECRET = "my_SECRET_key"




// ================= MONGODB =================
const { MongoClient, ServerApiVersion } = require('mongodb');
// const jsonwebtoken = require('jsonwebtoken');

const uri = "mongodb+srv://learning-backend:gv32YEO3cgZ7HB99@cluster0.dvev3.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let usersCollection;

// ================= CONNECT DB =================
async function run() {
  try {
    await client.connect();

    const database = client.db("backendDB");
    usersCollection = database.collection("users");

    console.log("MongoDB connected successfully 🚀");

  } catch (err) {
    console.log(err);
  }
}

run().catch(console.dir);


// ================= ROUTES =================

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: test@gmail.com
 *     responses:
 *       200:
 *         description: login success
 */

app.post('/login', (req,res)=>{
    const user = req.body;

    if(user.email === "test@gmail.com"){
        const token = jwt.sign(
            {email: user.emai},
            SECRET,
            {expiresIn: "1h"}
        )

        res.json({
            message:"login success",
            token:token
        })
    }
    else{
     res.json({message:"Invalid token"})
    }
})


app.get("/", (req, res) => {
  res.send("running backend server");
});

function verifyToken(req,res,next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.json({ message: "token not found" });
    }

    const token = authHeader.split(" ")[1]; 

    jwt.verify(token,SECRET,(err,decoded) => {
        if(err){
            return res.json({message:"invalid token"})
        }
        req.user = decoded
        next()
    })
}

app.get('/profile', verifyToken, (req, res) => {
    res.json({
        message: "Protected data",
        user: req.user
    });
});
// ================= CREATE USER =================
/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Romicha
 *             role: frontend developer
 *     responses:
 *       200:
 *         description: success
 */
app.post('/user', async (req, res) => {
  const user = req.body;

  const result = await usersCollection.insertOne(user);

  res.json({
    message: "User created",
    data: result
  });
});


// ================= GET USERS =================
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: success
 */
app.get('/user', async (req, res) => {
  const users = await usersCollection.find().toArray();

  res.json(users);
});


// ================= CART =================
app.post('/cart', (req, res) => {
  const data = req.body;
  console.log(data);
  res.send("cart successful");
});

app.get('/cart', (req, res) => {
  res.send("cart received");
});


// ================= PRODUCTS =================
app.get('/products', (req, res) => {
  res.json([
    { id: 1, name: "laptop", price: 50000 },
    { id: 2, name: "Phone", price: 20000 },
    { id: 3, name: "Desktop", price: 60000 }
  ]);
});

app.get('/products/:id', (req, res) => {
  const id = req.params.id;

  res.json({
    productId: id,
    name: "simple name",
    price: 10000
  });
});


// ================= ABOUT =================
app.get('/about', (req, res) => {
  res.json({
    message: "i am learning backend",
    status: "success"
  });
});


// ================= SERVER =================
app.listen(4000, () => {
  console.log("server running port 4000 🚀");
});

