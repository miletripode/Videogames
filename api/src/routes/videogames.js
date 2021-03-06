/*[ ] GET /videogames:
Obtener un listado de los videojuegos
Debe devolver solo los datos necesarios para la ruta principal*/

/*[ ] GET /videogames?name="...":
Obtener un listado de las primeros 15 videojuegos que contengan la palabra ingresada como query parameter
Si no existe ningún videojuego mostrar un mensaje adecuado*/
const axios = require('axios');
var express = require ('express');
const router = express.Router();
const getDataBaseInfo = require('./Controllers/getDataBaseInfo')
const { Videogame, Genre} = require('../db');
const {API_KEY} = process.env;
const apiUrl = `https://api.rawg.io/api/games?key=${API_KEY}`;
const { Op } = require("sequelize");

router.get('/', async (req, res, next) => {
    let name = req.query.name;

    if(name){
        let gamesByName = await axios.get(`${apiUrl}&search=${name}`)
        gamesByName = gamesByName.data.results.map(v => {
            return {
                id: v.id,
                name: v.name,
                image: v.background_image,
                genres: v.genres.map(g => g.name),
                rating: v.rating
            }
        });
        let dbGames = await Videogame.findAll({
            where: {name: {
                [Op.iLike] : '%'+name+'%'
            }},
            atributtes: ['id', 'name', 'rating'],
            include: {
                model: Genre,
                attributes: ['name'],
                through: {
                attributes: []
                }
            }
        })
        if(gamesByName.length > 0 && dbGames.length > 0 ){
            res.status(200).send(dbGames.concat(gamesByName).slice(0,15))
        }
        else{
            if(gamesByName.length > 0){
                res.status(200).send(gamesByName.slice(0,15))
            }
            else{
                if(dbGames.length > 0){
                    res.status(200).send(dbGames.slice(0,15))
                }
                else{
                    res.status(404).send('Does not exist games')
                }
            }
        }
    }else{
        let dataBaseInfo = await getDataBaseInfo()
        let arrayApiInfo = [];
        for(let i=0; i < 5; i++){
            arrayApiInfo[i] = await axios.get(`${apiUrl}&page=${i+1}`)
            arrayApiInfo[i] = arrayApiInfo[i].data.results.map(v => {
                return {
                    id: v.id,
                    name: v.name,
                    image: v.background_image,
                    genres: v.genres.map(g => g.name),
                    rating: v.rating,
                    platforms: v.platforms.map(g => g.platform.name)
                }
            })
        }
        let aux = arrayApiInfo.flat()
        Promise.all([dataBaseInfo,aux])
        .then((response) => {
            let [infoDb, infoApi] = response
            return res.status(200).send(infoDb.concat(infoApi))
        })
        .catch((err) => next(err))
        }
    
})

module.exports = router