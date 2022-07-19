const {Router} = require('express')
const router = Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const Sales = require('../models/sales')
const moment = require('moment')
const Currency = require('../models/currency')

router.get('/', auth, async(req, res) => {
    const user = await User.findById(req.session.user._id).lean()
    const currency = await Currency.findOne().sort({num: -1}).lean()
    const fullTimeSallers = await Sales.find().lean()
    const today = moment().format('YYYYMMDD')
    const daySallers = await Sales.find({salesDay: today}).lean()

    dayPoints = {
        points: [],
        sum: [],
        label: 'Статистика по точкам продаж за сегодня'
    }
    for (let i = 0; i < daySallers.length; i++) {
        const idx = await dayPoints.points.findIndex(c => {
            return c === daySallers[i].salesCashbox
        })
        if(idx >= 0){
            dayPoints.sum[idx] = dayPoints.sum[idx] + daySallers[i].salesSum
        } else{
            dayPoints.points.push(daySallers[i].salesCashbox)
            dayPoints.sum.push(daySallers[i].salesSum)
        }
    }

    daySallerData = {
        saller: [],
        sum: [],
        label: 'Статистика по продавцам за сегодня'
    }
    for (let i = 0; i < daySallers.length; i++) {
        const idx = await daySallerData.saller.findIndex(c => {
            return c === daySallers[i].salesWorker
        })
        if(idx >= 0){
            daySallerData.sum[idx] = daySallerData.sum[idx] + daySallers[i].salesSum
        } else{
            daySallerData.saller.push(daySallers[i].salesWorker)
            daySallerData.sum.push(daySallers[i].salesSum)
        }
    }

    sallerArr = {
        saller: [],
        sum: [],
        label: 'Статистика по продавцам за все время'
    }
    for (let i = 0; i < fullTimeSallers.length; i++) {
        const idx = await sallerArr.saller.findIndex(c => {
            return c === fullTimeSallers[i].salesWorker
        })
        if(idx >= 0){
            sallerArr.sum[idx] = sallerArr.sum[idx] + fullTimeSallers[i].salesSum
        } else{
            sallerArr.saller.push(fullTimeSallers[i].salesWorker)
            sallerArr.sum.push(fullTimeSallers[i].salesSum)
        }
    }

    pointArr = {
        points: [],
        sum: [],
        label: 'Статистика по точкам продаж за все время'
    }

    for (let i = 0; i < fullTimeSallers.length; i++) {
        const idx = await pointArr.points.findIndex(c => {
            return c === fullTimeSallers[i].salesCashbox
        })
        if(idx >= 0){
            pointArr.sum[idx] = pointArr.sum[idx] + fullTimeSallers[i].salesSum
        } else{
            pointArr.points.push(fullTimeSallers[i].salesCashbox)
            pointArr.sum.push(fullTimeSallers[i].salesSum)
        }
    }

    res.render('analytics', {
        title: 'Аналитика',
        isAnalytics: true,
        user,
        sallerArr,
        daySallerData,
        dayPoints,
        currency,
        pointArr
    })
})



module.exports = router