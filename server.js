const https = require('https')
const express = require('express')
const exphbs = require('express-handlebars')

const MarkdownIt = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
})

const markdownItAttrs = require('markdown-it-attrs')
const markdownItFigure = require('markdown-it-figure')

MarkdownIt.use(markdownItAttrs, {
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: [],
})

MarkdownIt.use(markdownItFigure)


require('dotenv').config()

const app = express()

app.use(express.static('public'))

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: __dirname + '/views/partials/'
}))

app.set('view engine', 'hbs')
app.set('views', `${__dirname}/views`)

const data = { 
    intro : [],
    eka: [],
    esadse: []
}

const getSingleContent = (tag, obj) => {

    // get a single page
    
    const data_content = JSON.stringify({
        query: `{
            pages {
                single(id:${obj.id}) {
                    content
                }
            }
        }`
    })

    const options = {
        hostname: 'wiki.ourwriting.tools',
        path: '/graphql',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data_content.length,
            'Authorization': process.env.API_KEY,
            'User-Agent': 'Node',
        },
    }

    const req = https.request(options, (res) => {
        // console.log(res.headers)
        
        let data_content = ''
        
        console.log(`statusCode: ${res.statusCode}`)
    
        res.on('data', (d) => {
            data_content = d
        })
        
        res.on('end', () => {

            const renderData = JSON.parse(data_content).data.pages.single
                        
            let html = MarkdownIt.render(renderData.content)
            
            obj['content'] = html 
            
            data[tag].push(obj)
        })
    
    })

    req.on('error', (error) => {
        console.error(error)
    })
    
    req.write(data_content)
    req.end()
} 


const getAllPages = (tag) => {

    // get the list of pages
    
    const data_list = JSON.stringify({
        query: `{
            pages {
                list(tags:["${tag}"], orderBy:TITLE) {
                    id
                    title
                    createdAt
                }
            }
        }`
    })

    const options = {
        hostname: 'wiki.ourwriting.tools',
        path: '/graphql',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data_list.length,
            'Authorization': process.env.API_KEY,
            'User-Agent': 'Node',
        },
    }

    const req = https.request(options, (res) => {
        
        // console.log(res.headers)

        let data_list = ''

        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', (d) => {
            data_list = d
        })
        
        res.on('end', () => {
            const renderData = JSON.parse(data_list).data.pages.list
            
            renderData.forEach(element => {
                console.log(renderData)
                getSingleContent(tag, element)  
            })

        })

    })

    req.on('error', (error) => {
        console.error(error)
    })

    req.write(data_list)
    req.end()
}

app.get('/', (req, res, next) => {
    // console.log(data)
    res.render('index', data)
})

app.listen(process.env.PORT || 3000, () => {
    getAllPages('intro')
    getAllPages('eka')
    getAllPages('esadse')
})