const {Router} = require('express')
const router = Router()
const Currency = require('../models/currency')

router.post('/', async (req, res) => {
    const curNum = await Currency.findOne().sort({num: -1}).lean()
    const maxOrder = curNum ? curNum.num : 0
    const order = maxOrder + 1
    const currency = new Currency({
        num: order,
        date: req.body.date,
        usd: (1 / req.body.rates.USD).toFixed(1),
        euro: (1 /req.body.rates.EUR).toFixed(1),
        rub: (1 / req.body.rates.RUB).toFixed(1)
    })
    res.json(currency)
    try{
        await currency.save()
    } catch(e){
        console.log(e);
    }
})



module.exports = router