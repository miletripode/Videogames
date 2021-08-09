/*[ ] GET /platforms:
Obtener todos los tipos de plataformas existentes*/
var express = require ('express');
const router = express.Router();
const getApiInfo = require('./Controllers/getApiInfo')

router.get('/', async (req, res) => {
    let infoApi = await getApiInfo()
    let platforms = infoApi.map(p => p.platforms).flat()

    let mySet = new Set(platforms)
    platforms= Array.from(mySet)
    
    res.send(platforms)
})

module.exports = router