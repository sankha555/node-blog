const express = require('express')
const router = express.Router()
const Article = require('../models/article')
const User = require('../models/user')

router.get('/', async(req, res) => {
    if (req.isAuthenticated())
        console.log('user in')
    else
        console.log('user not in')
    res.render('articles/list', { articles: await Article.find().sort({ date_created: 'desc' }) })
})

router.get('/new', (req, res) => {
    if (!req.isAuthenticated()) 
        res.redirect('/')
    else {
        article = new Article()
        res.render('articles/create_article', { article: article })
    }
})

router.get('/edit/:id', async(req, res) => {
    const article = await Article.findById(req.params.id)
    if (!req.user || (article.author != req.user._id)){
        res.status(500).send()
        //res.redirect('/')
    }
        
    res.render('articles/edit_article', { article: article })
})

router.get('/:slug', async(req, res) => {
    const article = await Article.findOne({ slug: req.params.slug })
    if (!article)
        res.redirect('/')
    const author = await User.findOne({_id : article.author})
    if (article == null) res.redirect('/')
    res.render('articles/article_detail', { article: article, author: author.name })
})

router.post('/', async(req, res, next) => {
    if (!req.isAuthenticated())
        res.redirect('/')
    req.article = new Article()
    next()
}, saveArticleAndRedirect('create_article'))

router.post('/edit/:id', async(req, res) => {
    const article = await Article.findById(req.params.id)
    if (!req.user||article.user != req.user._id)
        res.status(500).send()
        //res.redirect('/')
    
    let up_article = {}
    up_article.title = req.body.title
    up_article.author = req.user._id
    up_article.content = req.body.content

    let query = { _id: req.params.id }

    Article.update(query, up_article, function (err) {
        if (err) {
            console.log(err);
            return
        } else {
            console.log("Success updation")
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    })
})

router.delete('/:id', async(req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id)
        res.redirect('/articles')
    } catch(e){
        res.redirect('/articles')
    }

})

function saveArticleAndRedirect(path) {
    return async(req, res) => {
        let article = req.article
        article.title =  req.body.title
        article.content = req.body.content
        article.author = req.user._id
        article.date_created = req.body.date_created

        try {
            article = await article.save()
            res.redirect(`articles/${article.slug}`)
        } catch (e) {
            res.render(`articles/${path}`, { article: article })
        }
    }
}

module.exports = router