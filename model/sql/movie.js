import sql from 'mssql';
import  { connection }  from './Connection/config.js';

export class MovieModel{
    static async getAllByGenre({genre}){
        let result;
        try{
            const instance = await sql.connect(connection);
            const genreLower = genre.toLowerCase();
            console.log(genreLower);
            const resultQueryGenres = await instance
                .request()
                .input('genreName',sql.VarChar,genreLower)
                .query('SELECT id FROM genres WHERE LOWER(name) = @genreName');
            const queryGenres = resultQueryGenres.recordset;
            console.log(queryGenres);
            if(queryGenres.length >= 1){
                const genreId = queryGenres[0].id;
                const resultQueryMovies = await instance
                    .request()
                    .input('genreId',sql.Int, genreId)
                    .query('SELECT m.* FROM movies m JOIN movie_genres mg ON m.id = mg.movie_id JOIN genres g ON g.id = mg.genre_id WHERE g.id = @genreId');
                result = resultQueryMovies.recordset;
            }else{
                result = 0;
            }
        }catch(error){
            console.log("Error: "+error);
            throw error;
        }finally{
            await sql.close();
        }
        return result;
    }

    static async getAll(){
        let result;
        try{
            await sql.connect(connection)
            const resultQuery = await sql.query`SELECT * FROM Movies`
            result = resultQuery.recordset;
        }catch(error){
            console.log('Error: '+error);
            throw error;
        }finally{
            await sql.close();
        }
        return result;
    }

    static async getById({id}){
        let result;
        try{
            const instance = await sql.connect(connection);
            const resultQueryMovieById = await instance
                .request()
                .input('movieId',sql.UniqueIdentifier,id)
                .query('SELECT * FROM movies WHERE id = @movieId');
            result = resultQueryMovieById.recordset[0];
        }catch(error){
            console.log('Error: '+error);
            throw error;
        }finally{
            await sql.close();
        }
        return result;
    }

    static async create({input}){
        let result;
        let instance;
        let transaction;
        try{
            const {
                genre: genreInput,
                title,
                year,
                duration,
                director,
                rate,
                poster
            } = input;
            instance = await sql.connect(connection);
            transaction = new sql.Transaction(instance);
            const request = new sql.Request(transaction);
            await transaction.begin();
            const resultInsertion = await request.input('title',sql.VarChar,title)
                    .input('year',sql.Int,year)
                    .input('duration',sql.Int,duration)
                    .input('director',sql.VarChar,director)
                    .input('rate',sql.Decimal(3,1),rate)
                    .input('poster',sql.Text,poster)
                    .query(`INSERT INTO movies (title,year,duration,director,rate,poster)
                    VALUES (@title,@year,@duration,@director,@rate,@poster)`);
            const finalResult = await request
                    .query(`SELECT * FROM movies WHERE title = @title`);
            const idInserted = finalResult.recordset[0].id;
            for(let g of genreInput){
                const genreRequest = new sql.Request(transaction);
                const resulQueryGenre = await genreRequest
                    .input('genre', sql.VarChar, g)
                    .query(`SELECT id FROM genres WHERE name = @genre`);

                const idGenre = resulQueryGenre.recordset[0]?.id;

                if (idGenre) {
                    const insertGenreRelation = new sql.Request(transaction);
                    await insertGenreRelation
                        .input('idMovie', sql.UniqueIdentifier, idInserted)
                        .input('idGenre', sql.Int, idGenre)
                        .query(`INSERT INTO movie_genres (movie_id, genre_id) VALUES (@idMovie, @idGenre)`);
                } 
            }
            result = finalResult.recordset[0];
            await transaction.commit();
        }catch(error){
            console.log(error);
            if(transaction) await transaction.rollback();
            throw error;
        }finally{
            if(instance){
                await sql.close();
            }     
        }
        return result;
    }

    static async delete({id}){
        let result = 0;
        let instance;
        let transaction;
        try{
            instance = await sql.connect(connection);
            transaction = new sql.Transaction(instance);
            const request = new sql.Request(transaction);
            await transaction.begin();
            await request.input('idMovie',sql.UniqueIdentifier,id);
            await request.query(`DELETE FROM movie_genres WHERE movie_id = @idMovie`);
            const eliminationResult = await request.query(`DELETE FROM movies WHERE id = @idMovie`);
            result = eliminationResult.rowsAffected;
            await transaction.commit();
        }catch(error){
            console.log(error);
            if(transaction) await transaction.rollback();
            throw error;
        }finally{
            if(instance){
                await sql.close();
            }
        }
        return result
    }

    static async update({id, input}){
        let result = 0;
        let instance;
        let transaction;
        try{
            const{
                title,
                year,
                director,
                duration,
                poster,
            } = input;
            instance = await sql.connect(connection);
            transaction = new sql.Transaction(instance);
            const request = new sql.Request(transaction);
            await transaction.begin();
            const resultUpdate = await request.input('title',sql.VarChar,title)
                .input('year',sql.Int,year)
                .input('director',sql.VarChar,director)
                .input('duration',sql.Int,duration)
                .input('poster',sql.Text,poster)
                .input('idMovie',sql.UniqueIdentifier,id)
                .query(`UPDATE movies 
                    SET title = @title, year = @year, director = @director, duration = @duration, poster = @poster
                    WHERE id = @idMovie`);
            result = resultUpdate.rowsAffected;
            await transaction.commit();
        }catch(error){
            console.log(error);
            throw error;
        }finally{
            if(instance){
                await sql.close();
            }
        }
        return result
    }
}