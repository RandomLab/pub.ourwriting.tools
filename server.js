const https = require('https')
const express = require('express')
const exphbs = require('express-handlebars');
const { text } = require('body-parser');
const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt()

require('dotenv').config()

const app = express()

app.use(express.static('public'))

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}))
app.set('view engine', 'hbs')
app.set('views', `${__dirname}/views`)

let data = { list : [] }

const replaceURL = (url) => {
    const re = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/
    let result = url.match(re)
    if (result) {
        return `![image](https://wiki.ourwriting.tools${result[1]})`
    } else {
        return null
    }
}

const parseMarkdown = (md) => {
    let newTxt = ''
    let txt = md.split('\n')
    txt.forEach(e => {
        let r = replaceURL(e)
        if (r) {
            newTxt += r + '\n'
        } else {
            if (!!e) {
                newTxt += e + '\n'
            }
        }
    })
    
    return newTxt   
}


const getSingleContent = obj => {
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
        console.log(res.headers)
        let data_content = ''
        console.log(`statusCode: ${res.statusCode}`)
    
        res.on('data', (d) => {
            data_content = d
        })
        
        res.on('end', () => {
            const renderData = JSON.parse(data_content).data.pages.single
            const newMD = parseMarkdown(renderData.content)
            let html = md.render(newMD)
            obj['content'] = html 
            data.list.push(obj)
        })
    
    })

    req.on('error', (error) => {
        console.error(error)
    })
    
    req.write(data_content)
    req.end()
} 


const getAllPages = () => {
    // get the list of pages
    const data_list = JSON.stringify({
        query: `{
            pages {
                list(tags:["eka","pub"], orderByDirection:DESC) {
                    id
                    title
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
        console.log(res.headers)
        let data_list = ''
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', (d) => {
            data_list = d
        })
        
        res.on('end', () => {
            const renderData = JSON.parse(data_list).data.pages.list
            
            renderData.forEach(element => {
              getSingleContent(element)  
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
    getAllPages()
})