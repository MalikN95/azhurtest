const {Router} = require('express')
const Nomen = require('../models/nomen-item')
const router = Router()

router.get('/', (req, res) => {
    res.render('analytics', {
        title: 'Аналитика',
        isAnalytics: true
    })
})
router.post('/', async (req, res) => {
    const nomen = new Nomen({
        name: req.body.name,
        artiqle: req.body.artiqle,
        barcode: req.body.barcode,
        cost: req.body.cost,
        price: req.body.price,
        storage: []
    })
    try{
        await nomen.save()
        res.redirect('/nomenclature')
    } catch(e){
        console.log(e);
    }

})


module.exports = router