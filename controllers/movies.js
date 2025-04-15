import { MovieModel } from "../model/movie.js";
import { validateMovie, validatePartialMovie } from '../Schemas/movies.js';

export class MovieController{

    static async getAll (req,res) {
        const { genre } = req.query;
        const movies = await MovieModel.getAll({genre});
        res.status(200).json(movies);
    }

    static async getById (req,res){
        const { id } = req.params;
        const movie = await MovieModel.getById({id});
        if(movie){
            res.status(200).json(movie);
        }else{
            res.status(404).json({message: 'Pelicula no encontrada'});
        }
    }

    static async create (req,res){
        const result = validateMovie(req.body);
        if(!result.error){
            const{
                tittle,
                genre,
                year,
                director,
                duration,
                rate,
                poster
            } = req.body;
            const newMovie = await MovieModel.create(result.data);
            res.status(201).json(newMovie);
        }else{
            res.status(400).json({error: JSON.parse(result.error.message)});
        }
        
    }

    static async update (req,res){
        const { id } = req.params;
        const result = validatePartialMovie(req.body);
        if(result){
            const updatedMovie = await MovieModel.update({id, input: result})
            if(updatedMovie){
                res.status(200).json(updatedMovie);
            }else{
                res.status(404).json({message:'No se ha encontrado la pelicula solicitada por id'});
            }
        }else{
            res.status(400).json({message: 'Error en los campos de texto'})
        }
        
    }

    static async delete (req,res) {
        const { id } = req.params;
        const deletedMovie = await MovieModel.delete({id});
        if(deletedMovie){
            return res.status(200).json({message: 'Pelicula eliminada correctamente'});
        }else{
            return res.status(404).json({message: 'No se ha encontrado la película a eliminar'});
        }
    }
}