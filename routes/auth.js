const {Router} = require('express')
const User = require('../models/users')
const router = Router()


router.get('/', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        layout: 'item-card',
        loginError: req.flash('loginError')
    })
})

router.post('/', async (req, res) => {
    try{
        const {name, password} = req.body
        const candidate = await User.findOne({workerName: name}).lean()
        if(candidate.systemAccess){
            if(candidate){
                const areSame = password === candidate.password
                if(areSame){
                    req.session.user = candidate
                    req.session.isAuthenticated = true
                    req.session.save(err => {
                        if(err){
                            throw err
                        }
                        res.redirect('/')
                    })
                }else{
                    req.flash('loginError', 'Не верный пароль')
                    res.redirect('/auth')
                }
            }else{
                req.flash('loginError', 'Не правильное имя пользователя')
                res.redirect('/auth')
            }
        }else {
            req.flash('loginError', 'Отказано в доступе')
            res.redirect('/auth')
        }

    }catch(e){

    }

    
})


module.exports = router