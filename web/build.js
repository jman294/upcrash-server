const fs = require('fs')

let file = fs.readFileSync('js/client.js').toString()

file = file.replace(/\(([a-zA-Z]*?)\) =>/g, 'function ($1)')

fs.writeFileSync('built.js', file)
