const {Router} = require('express')
const router = Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const Currency = require('../models/currency')

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const users = await User.find().lean()
    res.render('worker', {
        title: 'Сотрудники',
        isWorker: true,
        user,
        users,
        currency
    })
})
router.post('/add-worker', auth, async(req, res) => {
    const user = new User({
        workerName: req.body.workerName,
        position: req.body.position,
        systemAccess: req.body.systemAccess,
        password: req.body.password
    })
    try{
        await user.save()
        res.redirect('/worker')
    } catch(e){
        console.log(e);
    }

})


module.exports = router