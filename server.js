const express = require('express')
const mongoose = require('mongoose')
const app = express()
const methodOverride = require('method-override')
const config = require('./config/database')
const passport = require('passport')
var flash = require("connect-flash")
var session = require('express-session')
const morgan = require('morgan')
const cookie_parser = require('cookie-parser')
const cookieSession = require('cookie-session')
const swig = require('swig')

mongoose.connect('mongodb://localhost:27017/blog', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

app.use(flash());
/*app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'woot',
    resave: false,
    saveUninitialized: false
}))*/

app.use(cookieSession({
    name: 'my_session',
    keys: ['key1', 'key2']
}))

const articleRouter = require('./routes/articles')
const userRouter = require('./routes/users')

require('./models/user')

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.engine('htm', swig.renderFile)
app.set('view engine', 'htm')

app.use(cookie_parser())
app.use(morgan('combined'))

// Passport Config
require('./config/passport')(passport)
app.use(passport.initialize())
app.use(passport.session())

// Accessing user as a global object
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// Landing Page
app.get('/', (req, res) => {
    if (req.isAuthenticated())
        console.log('user in')
    else
        console.log('user not in')

    res.render('index')
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/plus.profile.emails.read']
    }
));

app.get('/auth/google/callback', passport.authenticate('google', {
    scope:
        ['https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/plus.profile.emails.read'],
    failureRedirect: '/auth/google'
}), function(req, res){
    res.redirect('/')
})

app.use('/articles', articleRouter)
app.use('/users', userRouter)

app.listen(5000)