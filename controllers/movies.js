import { validateMovie, validatePartialMovie } from '../Schemas/movies.js';

export class MovieController{

    constructor({movieModel}){
        this.movieModel = movieModel
    }

    getAll = async (req,res)=>{
        try{
            const { genre } = req.query;
            if(genre){
                const movies = await this.movieModel.getAllByGenre({genre});
                if(movies.length>0){
                    res.status(200).json(movies);
                }else{
                    res.status(404).json({
                        status: 404,
                        details: "No se ha encontrado el género ingresado"
                    })
                }
            }else{
                const movies = await this.movieModel.getAll();
                res.status(200).json(movies);
            }
        }catch(error){
            console.log(error)
            res.status(500).json({
                error: true,
                status: 500,
                details: "Ha ocurrido un error al obtener todas las peliculas"
            })
        }
    }

    getById = async (req,res)=>{
        try{
            const { id } = req.params;
            const movie = await this.movieModel.getById({id});
            if(movie){
                res.status(200).json(movie);
            }else{
                res.status(404).json({message: 'Pelicula no encontrada'});
            }
        }catch(error){
            console.log(error)
            res.status(500).json({
                error: true,
                status: 500,
                details: "Ha ocurrido un error al obtener las peliculas por ID"
            })
        }
    }

    create = async (req,res)=>{
        const result = validateMovie(req.body);
        try{
            if(!result.error){
                const{
                    title,
                    genre,
                    year,
                    director,
                    duration,
                    rate,
                    poster
                } = req.body;
                const newMovie = await this.movieModel.create({input: result.data});
                if(newMovie){
                    res.status(201).json(newMovie);
                }else{
                    res.status(400).json({error: "Ha ocurrido un error al insertar la película"});
                }
            }else{
                res.status(400).json({error: JSON.parse(result.error.message)});
            }
        }catch(error){
            console.log(error)
            res.status(500).json({
                error: true,
                status: 500,
                details: "Ha ocurrido un error al registrar la película"
            })
        }
    }

    update = async (req,res)=>{
        try{
            const { id } = req.params;
            const result = validatePartialMovie(req.body);
            if(result){
                const updatedMovie = await this.movieModel.update({id, input: result.data})
                if(updatedMovie>0){
                    res.status(200).json({message: 'La pelicula ha sido actualizada'});
                }else{
                    res.status(404).json({message:'No se ha encontrado la pelicula solicitada por id'});
                }
            }else{
                res.status(400).json({message: 'Error en los campos de texto'})
            }
        }catch(error){
            console.log(error)
            res.status(500).json({
                error: true,
                status: 500,
                details: "Error al actualizar la pelicula"
            })
        }
    }

    delete = async (req,res)=>{
        try{
            const { id } = req.params;
            const deletedMovie = await this.movieModel.delete({id});
            if(deletedMovie>0){
                res.status(200).json({message: 'Pelicula eliminada correctamente'});
            }else{
                res.status(404).json({message: 'No se ha encontrado la película a eliminar'});
            }
        }catch(error){
            console.log(error)
            res.status(500).json({
                error: true,
                status: 500,
                details: "Ha ocurrido un error al eliminar la película"
            })
        } 
    }
}