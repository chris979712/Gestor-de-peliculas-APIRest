import express, { json } from 'express';
import { createMovieRouter } from './routes/movies.js'
import cors from 'cors';
import dotenv from 'dotenv';

export const createApp = ({movieModel}) =>{
    const app = express();
    dotenv.config();
    app.use(json());
    app.use(cors());
    app.disable('x-powered-by');

    app.get('/',(req,res)=>{
        res.json({message: 'Bienvenido al servidor de películas'});
    })

    app.use('/movies', createMovieRouter({movieModel}));

    const PORT = process.env.PORT ?? 1234;

    app.listen(PORT,()=>{
        console.log(`Servidor activo en la siguiente ruta http://localhost:${PORT}`);
    })
}