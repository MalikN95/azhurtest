const {Router} = require('express')
const Nomen = require('../models/nomen-item')
const User = require('../models/users')
const router = Router()
const auth = require('../middleware/auth')
const Storage = require('../models/storage')
let XLSX = require('xlsx')
var fs = require("fs")
const symbology = require('symbology')
const moment = require('moment')
const Currency = require('../models/currency')

router.get('/', auth, async (req, res) => {
    const nomen = await Nomen.find().lean().limit(200)
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    for (let i = 0; i < nomen.length; i++) {
        nomen[i].num = 0
        for (let index = 0; index < nomen[i].storage.length; index++) {
            nomen[i].num += nomen[i].storage[index].count
        }
    }
    res.render('nomenclature', {
        title: 'Номенклатура',
        isNomenclature: true,
        nomen,
        user,
        currency
    })
})
router.get('/all', auth, async (req, res) => {
    const nomen = await Nomen.find().lean()
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    res.render('nomenclature', {
        title: 'Номенклатура',
        isNomenclature: true,
        nomen,
        user,
        currency
    })
})

router.post('/', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const searchItem = req.body.name
    let nomen
    if(req.body.storage){
        nomen = await Nomen.find({$or: 
            [{'name': {$regex: new RegExp(searchItem, 'i')}, 'storage.storageId': req.body.storage},
            {'artiqle': {$regex: new RegExp(searchItem, 'i')}, 'storage.storageId': req.body.storage}]
        }).lean()
        for (let index = 0; index < nomen.length; index++) {
            storages = [...nomen[index].storage]
            const inx = await storages.findIndex(c => {
                return c.storageId === req.body.storage.toString()
            })
            nomen[index].num = storages[inx].count
        }
    } else{
        nomen = await Nomen.find({$or: 
            [{'name': {$regex: new RegExp(searchItem, 'i')}}, {'artiqle': {$regex: new RegExp(searchItem, 'i')}}]
        }).lean()
        for (let i = 0; i < nomen.length; i++) {
            nomen[i].num = 0
            for (let index = 0; index < nomen[i].storage.length; index++) {
                nomen[i].num += nomen[i].storage[index].count
            }
        }
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
        title: 'Номенклатура',
        isNomenclature: true,
        nomen,
        user,
        currency,
        costSum,
        result,
        priceSum
    })
})

router.post('/edit', async (req, res) => {
    const {id} = req.body
    delete req.body.id
    const toChange = {
        name: req.body.name
    }
    if(req.file){
        toChange.img = req.file.path
    }
    await Nomen.findByIdAndUpdate(id, req.body)
    await Nomen.findByIdAndUpdate(id,  toChange)
    res.redirect(req.get('referer'))
})

router.post('/barcode', async (req, res) => {
    const nomen = await Nomen.findById(req.body.id)
    const fileName = `${nomen.artiqle.replace(/[^+\d]/g, '') + moment().format('DDMMYYYHHmmssSSS')}.svg`
    const {data} = await symbology.createFile({
        symbology: symbology.SymbologyType.CODE128,
        fileName,
        borderWidth: 50,
        whitespaceWidth: 10
    }, nomen.artiqle, symbology.OutputType.SVG)
    fs.stat('assets/img/barcode', function(err) {
        if (!err) {
            fs.rename(fileName, `assets/img/barcode/${fileName}`, err => {
                if(err) throw err;
            })
        }
        else if (err.code === 'ENOENT') {
            fs.mkdir('assets/img/barcode', err => {
                if(err) throw err; 
            })
            fs.rename(fileName, `assets/img/barcode/${fileName}`, err => {
                if(err) throw err;
            })
        }
    })

    list = []
    for (let i = 0; i < req.body.num; i++) {
        obg = {
            name: nomen.name,
            price: nomen.price,
            img: fileName
        }
        list.push(obg)
    }
    res.render('barcode', {
        title: 'Печать штрих кода',
        layout: 'item-card',
        list
    })
})

router.post('/barcode-list-print', async ({body}, res) => {
    list = []
    for (let i = 0; i < body.id.length; i++) {
        const nomen = await Nomen.findById(body.id[i])
        const fileName = `${nomen.artiqle.replace(/[^+\d]/g, '') + moment().format('DDMMYYYHHmmssSSS')}.svg`
        const {data} = await symbology.createFile({
            symbology: symbology.SymbologyType.CODE128,
            fileName,
            borderWidth: 50,
            whitespaceWidth: 10
        }, nomen.artiqle, symbology.OutputType.SVG)
        fs.stat('assets/img/barcode', function(err) {
            if (!err) {
                fs.rename(fileName, `assets/img/barcode/${fileName}`, err => {
                    if(err) throw err;
                })
            }
            else if (err.code === 'ENOENT') {
                fs.mkdir('assets/img/barcode', err => {
                    if(err) throw err; 
                })
                fs.rename(fileName, `assets/img/barcode/${fileName}`, err => {
                    if(err) throw err;
                })
            }
        })
        for (let j = 0; j < body.count[i]; j++) {
            obg = {
                name: nomen.name,
                price: nomen.price,
                img: fileName
            }
            list.push(obg)
        }
    }
    res.render('barcode', {
        title: 'Печать штрих кода',
        layout: 'item-card',
        list
    })
})

router.post('/barcode-list', async ({body}, res) => {
    let nomenList = []
    for (let i = 0; i < body.barcodeList.length; i++) {
        const nomen = await Nomen.findById(body.barcodeList[i])
        nomenList.push(nomen)
    }
    res.json(nomenList)
})



router.post('/import-exel',  async (req, res) => {
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

    for (let i = 0; i < data.length; i++) {
        const searchNomen = await Nomen.findOne({artiqle: data[i].Артикул}).lean()
        if(!searchNomen && typeof(data[i].Цена) == 'number'){
            const nomen = new Nomen({
                unit: data[i].изм,
                name: data[i].Товар,
                artiqle: data[i].Артикул,
                cost: data[i].Себес,
                price: data[i].Цена,
                storage: []
            })
            try{
                await nomen.save()
            } catch(e){
                console.log(e);
            }
        }else if(!searchNomen && typeof(data[i].Цена) == 'string'){
            let str = data[i].Цена.toString()
            const nomen = new Nomen({
                unit: data[i].изм,
                name: data[i].Товар,
                artiqle: data[i].Артикул,
                cost: data[i].Себес,
                price: +str.slice(0, -3).replace(/\s/g, ''),
                storage: []
            })
            try{
                await nomen.save()
            } catch(e){
                console.log(e);
            }
        }
    }
    fs.unlink('images/' + req.file.filename, function(err){
        if (err) {
            console.log(err);
        }
    })
    res.redirect('/nomenclature')
})

router.post('/remove', async (req, res) => {
    try{
        await Nomen.deleteOne({
            _id: req.body.id
        })
        res.redirect('/nomenclature')
    } catch(e){
        console.log(e)
    }
})


router.get('/:id', auth, async (req, res) => {
    const nomenclatureItem = await Nomen.findById(req.params.id).lean()
    storages = [...nomenclatureItem.storage]
    stor = []
    for (let index = 0; index < storages.length; index++) {
        const storage = await Storage.findById(storages[index].storageId) 
        stor.push({
            storageName: storage.name,
            count : storages[index].count
        })
    }
    res.render('nomenclature-item', {
        layout: 'item-card',
        title: 'О товаре',
        nomenclatureItem,
        stor
    })
})


module.exports = router