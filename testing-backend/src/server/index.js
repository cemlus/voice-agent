import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from '../routes/userRoutes.js'; // Added .js extension
import dotenv from 'dotenv';
import lmntRouter from '../routes/lmntRoutes.js';

dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname'; // Default URI if not set

if (!MONGO_URI) {
  console.error('MONGO_URI is not set in the environment variables.');
  process.exit(1);}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB database`);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });


const app = express();
app.use(cors( {
  origin: 'http://localhost:5173', // Adjust this to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.use('/api/users', userRouter); // Adjust the path as necessary)

app.use('/api/lmnt', lmntRouter)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
