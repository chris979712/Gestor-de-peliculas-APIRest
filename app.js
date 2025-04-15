import express, { json } from 'express';
import { moviesRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js';
import cors from 'cors';

const app = express();

app.use(json());
app.use(cors());
app.disable('x-powered-by');

app.get('/',(req,res)=>{
    res.json({message: 'Bienvenido al servidor de películas'});
})

app.use('/movies', moviesRouter);

const PORT = process.env.PORT ?? 1234;

app.listen(PORT,()=>{
    console.log(`Servidor activo en la siguiente ruta http://localhost:${PORT}`);
})