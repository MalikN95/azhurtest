const {Router} = require('express')
const router = Router()
const Storage = require('../models/storage')
const User = require('../models/users')
const auth = require('../middleware/auth')
const Nomen = require('../models/nomen-item')
const Currency = require('../models/currency')

router.get('/', auth, async (req, res) => {
    const storage = await Storage.find().lean()
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    res.render('storage', {
        title: 'Остатки по складам',
        isStorage: true,
        storage,
        user,
        currency
    })
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    let nomen = await Nomen.find({'storage.storageId': req.params.id}).lean()
    const storage = await Storage.findById(req.params.id).lean()
    for (let index = 0; index < nomen.length; index++) {
        storages = [...nomen[index].storage]
        const inx = await storages.findIndex(c => {
            return c.storageId === req.params.id.toString()
        })
        nomen[index].num = storages[inx].count
    }

    let costSum = 0
    let priceSum = 0
    for (let i = 0; i < nomen.length; i++) {
        nomenCost = nomen[i].num * nomen[i].cost
        costSum += nomenCost
        nomenPrice = nomen[i].num * nomen[i].price
        priceSum += nomenPrice
    }
    let result = priceSum - costSum
    res.render('nomenclature', {
        title: 'Остаток на складе',
        user,
        nomen,
        currency,
        storage,
        costSum,
        result,
        priceSum
        
    })
})

router.post('/add-form', auth, async(req, res) => {
    const storage = new Storage({
        name: req.body.name
    })
    try{
        await storage.save()
        res.redirect('/storage')
    } catch(e){
        console.log(e);
    }

})
module.exports = router