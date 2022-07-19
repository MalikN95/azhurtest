const express = require('express')
const path = require('path')
const flash = require('connect-flash')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
var compression = require('compression')
const homeRoutes = require('./routes/home')
const analyticsRoutes = require('./routes/analytics')
const nomenclatureRoutes = require('./routes/nomenclature')
const addNomenclatureRoutes = require('./routes/add-nomenclature')
const workerRoutes = require('./routes/worker')
const authRoutes = require('./routes/auth')
const authStorage = require('./routes/storage')
const postingRoutes = require('./routes/posting')
const cashboxRoutes = require('./routes/cashbox')
const revisionRoures = require('./routes/revision')
const reportRoutes = require('./routes/report')
const currencyRoures = require('./routes/currency')
const User = require('./models/users')
const varMiddleware = require('./middleware/variables')
const fileMiddleware = require('./middleware/file')
var bodyParser = require('body-parser');


const app = express()

const MONGODB_URI = `mongodb://localhost:27017/azhurDatabase`
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

const store = new MongoStore({
    collection: 'sessions',
    uri: MONGODB_URI
})
app.use(bodyParser.json({
    limit: '50mb'
  }));
  
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true 
  }));
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')


app.use(express.static('assets'))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'some secret value',
    resave: false,
    saveUninitialized: false,
    store
}))


app.use(flash())
app.use(compression())
app.use(fileMiddleware.single('img'))
app.use(varMiddleware)


//Routes

app.use('/', homeRoutes)
app.use('/analytics',analyticsRoutes)
app.use('/nomenclature',nomenclatureRoutes)
app.use('/worker', workerRoutes)
app.use('/add-nomenclature', addNomenclatureRoutes)
app.use('/auth', authRoutes)
app.use('/storage', authStorage)
app.use('/posting', postingRoutes)
app.use('/cashbox', cashboxRoutes)
app.use('/revision', revisionRoures)
app.use('/report', reportRoutes)
app.use('/currency', currencyRoures)



const PORT = process.env.PORT || 3000

async function start(){
    try{
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })

        app.listen(PORT, () => {
            console.log(`Server started on ${PORT} PORT`);
        })
    } catch(e){
        console.log(e);
    }

}

start()





