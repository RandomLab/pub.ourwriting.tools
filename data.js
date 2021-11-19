
const https = require('https')

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
        data_list += d
    })
    
    res.on('end', () => {
        const renderData = JSON.parse(data_list).data.pages
        console.log(renderData)
        app.get('/', (req, res, next) => {
            res.render('index', renderData)
        })
    })

})

req.on('error', (error) => {
    console.error(error)
})

req.write(data_list)
req.end()