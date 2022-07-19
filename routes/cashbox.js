const {Router} = require('express')
const router = Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const Nomen = require('../models/nomen-item')
const Storage = require('../models/storage')
const Cashbox = require('../models/cashbox')
const Sales = require('../models/sales')
const Currency = require('../models/currency')

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const cashbox = await Cashbox.find().lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    res.render('cashbox', {
        title: 'Кассы',
        isCashbox: true,
        user,
        cashbox,
        currency
    })
})


router.get('/add', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const storage = await Storage.find().lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    res.render('add-cashbox', {
        title: 'Кассы',
        isCashbox: true,
        user,
        storage,
        currency
    })
})


router.get('/:id', async (req, res) => {
    const cashbox = await Cashbox.findById(req.params.id).lean()
    const sales = await Sales.findOne().sort({salesNum: -1}).lean()
    const maxOrder = sales ? sales.salesNum : 0
    const order = maxOrder + 1
    res.render('cashbox-menu', {
        title: 'Касса',
        layout: 'item-card',
        cashbox,
        order
    })
})


router.post('/order', async (req, res) => {
    const sales = await Sales.findOne().sort({salesNum: -1}).lean()
    const maxOrder = sales ? sales.salesNum : 0
    const order = maxOrder + 1
    res.json(order)
})



router.post('/search', async (req, res) => {
    const nomen = await Nomen.findOne({artiqle: req.body.searchElem}).lean()
    res.json(nomen)
})

router.post('/add-saller', async (req, res) => {
    const storage = await Cashbox.findById(req.body.id)
    const saller = {
        sallerName: req.body.name,
        sallerPassword: req.body.password
    }
    storage.sellers.push(saller)
    await Cashbox.findByIdAndUpdate(req.body.id, storage)
    res.redirect(req.get('referer'))
})

router.post('/', async (req, res) => {
    const storageid = await Storage.findOne({name: req.body.storage})
    salesItem = []
    if(typeof(req.body.id) == 'object'){
        for (let i = 0; i < req.body.name.length; i++) {
            const item = {
                itemName: req.body.name[i],
                itemCount: req.body.count[i],
                itemId:req.body.id[i],
                itemPrice: req.body.price[i],
                salesPrice: req.body.salesPrice[i],
                itemDiscount : req.body.discount[i]
            }
            salesItem.push(item)
            const nomen = await Nomen.findById(req.body.id[i]).lean()
            nomens = [...nomen.storage]
            const idx = await nomens.findIndex(c => {
                return c.storageId === storageid._id.toString()
            })
            if(idx >= 0){
                nomens[idx].count -= +req.body.count[i]
                nomen.storage = nomens
                await Nomen.findByIdAndUpdate(req.body.id[i], nomen) 
            }
        } 
    }else{
        const item = {
            itemName: req.body.name,
            itemCount: req.body.count,
            itemId: req.body.id,
            itemPrice: req.body.price,
            salesPrice: req.body.salesPrice,
            itemDiscount : req.body.discount
        }
        salesItem.push(item)
        const nomen = await Nomen.findById(req.body.id).lean()
        nomens = [...nomen.storage]
        const idx = await nomens.findIndex(c => {
            return c.storageId === storageid._id.toString()
        })
        if(idx >= 0){
            nomens[idx].count -= +req.body.count
            nomen.storage = nomens
            await Nomen.findByIdAndUpdate(req.body.id, nomen) 
        }
    }

    const sale = new Sales({
        salesNum: req.body.num,
        salesWorker: req.body.saller,
        salesStorage: req.body.storage,
        salesCashbox: req.body.cashbox,
        salesDate: req.body.date,
        salesSum: req.body.sum,
        salesDay: req.body.day,
        list: salesItem

    })
    try{
        await sale.save()
        res.redirect(req.get('referer'))
    } catch(e){
        console.log(e);
    }
})


router.get('/edit/:id', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const cashboxItem = await Cashbox.findById(req.params.id).lean()
    const storage = await Storage.find().lean()
    res.render('edit-cashbox', {
        title: 'Редактирование кассы',
        isCashbox: true,
        user,
        cashboxItem,
        storage,
        currency
    })
})



router.post('/add/new', auth, async (req, res) => {
    const cashbox = new Cashbox({
        cashboxName: req.body.cashboxName,
        storage: req.body.storage
    })
    try{
        await cashbox.save()
        res.redirect('/cashbox')
    } catch(e){
        console.log(e);
    }
})

router.post('/edit/update', auth, async (req, res) => { 
    if(req.body.discount == 'false'){
        req.body.discount = false
    } else{
        req.body.discount = true
    }

    if (req.body.sallerName){
        const cashbox = {
            cashboxName: req.body.cashboxName,
            storage: req.body.storage,
            discount: req.body.discount
        }
        try{
            await Cashbox.findByIdAndUpdate(req.body.id, cashbox)
            res.redirect('/cashbox')
        } catch(e){
            console.log(e);
        }
    } else{
        try{
            await Cashbox.findByIdAndUpdate(req.body.id, req.body)
            res.redirect('/cashbox')
        } catch(e){
            console.log(e);
        }
    }
 
})

module.exports = router