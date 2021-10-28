const https = require('https')
const express = require('express')
const exphbs = require('express-handlebars');

require('dotenv').config()

const app = express()

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}))
app.set('view engine', 'hbs')
app.set('views', `${__dirname}/views`)

const data = JSON.stringify({
    query: `{
        pages {
            list(tags:["pub"]) {
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
        'Content-Length': data.length,
        'Authorization': process.env.API_KEY,
        'User-Agent': 'Node',
    },
}

const req = https.request(options, (res) => {
    console.log(res.headers)
    let data = ''
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', (d) => {
        data += d
    })
    res.on('end', () => {
        const renderData = JSON.parse(data).data.pages
        console.log(renderData)
        app.get('/', (req, res, next) => {
            res.render('index', renderData)
        })
    })

})

req.on('error', (error) => {
    console.error(error)
})

req.write(data)
req.end()

app.listen(process.env.PORT || 3000, () => {
    console.log('serve start')
})