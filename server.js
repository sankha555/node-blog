const express = require('express')
const mongoose = require('mongoose')
const app = express()
const methodOverride = require('method-override')
const articleRouter = require('./routes/articles')

mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

var path = require('path')

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))


app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.use('/articles', articleRouter)

app.listen(5000)