const {Router} = require('express')
const router = Router()
const User = require('../models/users')
const Posting = require('../models/posting')
const auth = require('../middleware/auth')
const Storage = require('../models/storage')
const Nomen = require('../models/nomen-item')
let XLSX = require('xlsx')
var fs = require("fs")
const Currency = require('../models/currency')

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const nomen = await Posting.find().sort({postingNum: -1}).lean()
    res.render('posting', {
        title: 'Оприходывания',
        isPosting: true,
        user,
        nomen,
        currency
    })
})


router.get('/new', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const storage = await Storage.find().lean()
    const lastOrder = await Posting.findOne().sort({postingNum: -1}).lean()
    const maxOrder = lastOrder ? lastOrder.postingNum : 0
    const order = maxOrder + 1
    res.render('new-posting', {
        title: 'Оприходывания',
        isPosting: true,
        user,
        storage,
        order,
        currency
    })
})

router.get('/aaa', auth, async (req, res) => {
    var workbook = XLSX.readFile("USD.xlsx");
    var sheet_name_list = workbook.SheetNames;
    var headers = {};
    var data = [];
    sheet_name_list.forEach(function (y) {
      var worksheet = workbook.Sheets[y];
      for (z in worksheet) {
        if (z[0] === "!") continue;
        var col = z.substring(0, 1);
        var row = parseInt(z.substring(1));
        var value = worksheet[z].v;
        if (row == 1) {
          headers[col] = value;
          continue;
        }
        if (!data[row]) data[row] = {};
        data[row][headers[col]] = value;
      }
      data.shift();
      data.shift();

    });
    if(typeof(data) == 'object'){
    for (let i = 0; i < data.length; i++) {
        const nomen = await Nomen.findOne({artiqle: data[i].Артикул}).lean()
        if(nomen){
            nomen.cost = data[i].Цена
            await Nomen.findByIdAndUpdate(nomen._id, nomen) 
        } 
    }
    }
})
router.post('/import-exel', auth, async (req, res) => {
    const workbook = XLSX.readFile('images/' + req.file.filename)
    const sheet_name_list = workbook.SheetNames
    let data = []
    sheet_name_list.forEach(function (y) {
        let worksheet = workbook.Sheets[y]
        let headers = {}
        for (z in worksheet) {
          if (z[0] === "!") continue
          let col = z.substring(0, 1)
          let row = parseInt(z.substring(1))
          let value = worksheet[z].v
          if (row == 1) {
            headers[col] = value
            continue
          }
      
          if (!data[row]) data[row] = {}
          data[row][headers[col]] = value
        }
        data.shift()
        data.shift()
    })
    let list =[]
    let storageid = await Storage.findOne({name: req.body.storage})
    storageid = storageid._id.toString()
    if(typeof(data) == 'object'){
        for (let i = 0; i < data.length; i++) {
            const nomen = await Nomen.findOne({artiqle: data[i].Артикул}).lean()
            if(nomen && data[i].Остаток && typeof(data[i].Остаток) == 'number'){
                nomens = [...nomen.storage]
                const inx = await nomens.findIndex(c => {
                    return c.storageId === storageid
                })
                if(inx >= 0){
                    nomens[inx].count += +data[i].Остаток
                } else {
                    nomens.push({
                        storageId: storageid, 
                        count: +data[i].Остаток
                    })
                }
                nomen.storage = nomens
                list.push(nomen)
                list.push({count: +data[i].Остаток})
                await Nomen.findByIdAndUpdate(nomen._id, nomen) 
            } 
        }
    } else{
        const nomen = await Nomen.findOne({artiqle: data[i].Артикул}).lean()
        nomens = [...nomen.storage]
        const inx = await nomens.findIndex(c => {
            return c.storageId === storageid
        })
        if(inx >= 0){
            nomens[inx].count += +data.Остаток
        } else {
            nomens.push({
                storageId: storageid,
                count: +data.Остаток
            })
        }
        nomen.storage = nomens
        list.push(nomen)
        list.push({count: +req.body.count})
        await Nomen.findByIdAndUpdate(nomen._id, nomen)
    }
    const posting = new Posting({
        postingNum: req.body.number,
        postingWorker: req.body.worker,
        postingStorage: req.body.storage,
        postingDate: req.body.date,
        list: list
    })
    try{
        await posting.save()
    } catch(e){
        console.log(e);
    }
    fs.unlink('images/' + req.file.filename, function(err){
        if (err) {
            console.log(err);
        }
    })
    res.redirect('/posting')
})


router.post('/new', auth, async (req, res) => {
    let list =[]
    let storageid = await Storage.findOne({name: req.body.storage})
    storageid = storageid._id.toString()
    if(typeof(req.body.id) == 'object'){
        for (let index = 0; index < req.body.id.length; index++) {
            const nomen = await Nomen.findById(req.body.id[index]).lean()
            nomens = [...nomen.storage]
            const inx = await nomens.findIndex(c => {
                return c.storageId === storageid
            })
            if(inx >= 0){
                nomens[inx].count += +req.body.count[index]
            } else {
                nomens.push({
                    storageId: storageid, 
                    count: +req.body.count[index]
                })
            }
            nomen.storage = nomens
            list.push(nomen)
            list.push({count: +req.body.count[index]})
            await Nomen.findByIdAndUpdate(req.body.id[index], nomen) 
        }
    } else{
        const nomen = await Nomen.findById(req.body.id).lean()
        nomens = [...nomen.storage]
        const inx = await nomens.findIndex(c => {
            return c.storageId === storageid
        })
        if(inx >= 0){
            nomens[inx].count += +req.body.count
        } else {
            nomens.push({
                storageId: storageid, 
                count: +req.body.count
            })
        }
        nomen.storage = nomens
        list.push(nomen)
        list.push({count: +req.body.count})
        await Nomen.findByIdAndUpdate(req.body.id, nomen) 
    }
    const posting = new Posting({
        postingNum: req.body.number,
        postingWorker: req.body.worker,
        postingStorage: req.body.storage,
        postingDate: req.body.date,
        list: list
    })
    try{
        await posting.save()
    } catch(e){
        console.log(e);
    }
    res.redirect('/posting')
})

router.get('/:id', auth, async (req, res) => {
    const postingItem = await Posting.findById(req.params.id).lean()
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    res.render('posting-info', {
        title: 'Оприходывание',
        postingItem,
        user,
        currency
    })
})

router.post('/search', auth, async (req, res) => {
    const searchItem = req.body.searchElem
    const nomen = await Nomen.find( {$or: [{'name': {$regex: new RegExp(searchItem, 'i')}}, {'artiqle': {$regex: new RegExp(searchItem, 'i')}}]}).limit(20).lean()
    res.json(nomen)
})

router.post('/add-item', auth, async (req, res) => {
    let data =JSON.stringify(req.body) 
    data = data.replace(/[^a-zа-яё0-9\s-/]/g, '')
    const nomen = await Nomen.findById(data).lean()
    res.json(nomen)
})



module.exports = router