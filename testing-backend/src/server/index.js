import express from 'express';
import cors from 'cors';
import { PORT } from '../utils/utils.js'; // Added .js extension
import mongoose from 'mongoose';
import { MONGO_URI } from '../utils/utils.js'; // Added .js extension
import userRouter from '../routes/userRoutes.js'; // Added .js extension

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB database`);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });


const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.use('/api/users', userRouter); // Adjust the path as necessary)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
