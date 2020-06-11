const express = require('express')
const router = express.Router()
const Article = require('../models/article')

router.get('/', async(req, res) => {
    articles = [{
        title: 'First Blog',
        date_created: new Date(),
        content: 'Lorem Ipsum Dolor'
    },
    {
        title: 'Second Blog',
        date_created: new Date(),
        content: 'Lorem Ipsum Dolor sit amet'
    }]
    res.render('articles/list', { articles: await Article.find().sort({ date_created: 'desc' }) })
})

router.get('/new', (req, res) => {
    article = new Article()
    res.render('articles/create_article', {article: article})
})

router.get('/edit/:id', async(req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/edit_article', { article: article })
})

router.get('/:slug', async(req, res) => {
    const article = await Article.findOne({ slug: req.params.slug })
    if (article == null) res.redirect('/')
    res.render('articles/article_detail', { article: article })
})

router.post('/', async(req, res, next) => {
    req.article = new Article()
    next()
}, saveArticleAndRedirect('create_article'))

router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit_article'))

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