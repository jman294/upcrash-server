const fs = require('fs')

let file = fs.readFileSync('js/client.js').toString()

file = file.replace(/\(\) =>/g, 'function ()')

fs.writeFileSync('built.js', file)
