const {Router} = require('express')
const router = Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const Currency = require('../models/currency')
const fs = require('fs')

router.get('/', auth, async (req, res) => {
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const user = await User.findById(req.session.user._id).lean()
    res.render('report', {
        title: 'Отчеты',
        isReport: true,
        user,
        currency
    })
})


router.get('/a', auth, async (req, res) => {
    var filePath = 'assets/img/barcode/0012500011207222022140627951.svg'
    var stat = fs.statSync(filePath);
    fs.exists(filePath, function (exists) {
        if (exists) {
            res.writeHead(200, {
                "Content-Type": 'image/svg+xml',
                "Content-Disposition": stat.size
            });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    });
})


router.post('/a', auth, async (req, res) => {
    var filePath = 'assets/img/barcode/0012500011207222022140627951.svg'
    var stat = fs.statSync(filePath);
    fs.exists(filePath, function (exists) {
        if (exists) {
            res.writeHead(200, {
                "Content-Type": 'image/svg+xml',
                "Content-Disposition": stat.size
            });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    });
})


router.post('/', auth, async (req, res) => {
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const user = await User.findById(req.session.user._id).lean()
    res.render('report', {
        title: 'Отчеты',
        isReport: true,
        user,
        currency
    })
})


module.exports = router