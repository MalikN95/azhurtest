const {Router} = require('express')
const router = Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const Storage = require('../models/storage')
const Revision = require('../models/revision')
const Nomen = require('../models/nomen-item')
const Currency = require('../models/currency')

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const revision = await Revision.find().lean()
    res.render('revision', {
        title: 'Список ревизий',
        isRevision: true,
        user,
        revision,
        currency
    })
})

router.get('/new', auth, async (req, res) => {
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const user = await User.findById(req.session.user._id).lean()
    const storage = await Storage.find().lean()
    const lastOrder = await Revision.findOne().sort({revisionNum: -1}).lean()
    const maxOrder = lastOrder ? lastOrder.revisionNum : 0
    const order = maxOrder + 1
    res.render('new-revision', {
        title: 'Ревизия',
        isRevision: true,
        user,
        storage,
        order,
        currency
    })
})

router.get('/:id', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const revisionItem = await Revision.findById(req.params.id).lean()
    res.render('revision-info', {
        title: 'Информация о ревизий',
        isRevision: true,
        user,
        revisionItem,
        currency
    })
})




router.post('/new', auth, async (req, res) => {
    let list = []
    for (let index = 0; index < req.body.itemId.length; index++) {
        list.push({
            revItemName: req.body.itemName[index],
            revItemId: req.body.itemId[index],
            revCount:req.body.have[index],
            revArtiqle:req.body.artiqle[index]
        })
    }
    const revision = new Revision({
        revisionNum: req.body.number,
        revisionWorker: req.body.worker,
        revisionStorage: req.body.storage,
        revisionDate: req.body.date,
        list: list
    })
    try{
        await revision.save()
    } catch(e){
        console.log(e);
    }
    res.redirect('/revision')
})

router.post('/search', auth, async (req, res) => {
    let data =JSON.stringify(req.body) 
    data = data.replace(/[^a-zа-яё0-9\s-/]/g, '')
    const storage = await Storage.findOne({'name': {$regex: new RegExp(data, 'i')}})
    const storageId = storage._id
    const nomen = await Nomen.find({'storage.storageId': storageId}).lean()
    for (let index = 0; index < nomen.length; index++) {
        storages = [...nomen[index].storage]
        const inx = await storages.findIndex(c => {
            return c.storageId === storageId.toString()
        })
        nomen[index].num = storages[inx].count
    }
    res.json(nomen)
})


module.exports = router