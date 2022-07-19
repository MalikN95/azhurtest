const {Router} = require('express')
const router = Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const Currency = require('../models/currency')

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    res.render('home', {
        title: 'Добро пожаловать',
        isIndex: true,
        user,
        currency
    })
})



module.exports = router