import express from 'express';
import cors from 'cors'
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT;

//Routes
import linkRouter from './routes/link.route.js';

app.use(express.json());

app.use(cors({origin: 'http://localhost:3000'}))

app.get('/api/health', async (req,res) => {
    return res.status(200).json({
        ok : true,
        version : '1.0'
    });
})

app.use('/api', linkRouter);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})