const fs = require('fs')
const path = require('path')
const ujs = require("uglify-js");

let file = fs.readdir('js', function (err, files) {
  if (err) {
    console.error('Could not list the directory.', err)
    process.exit(1)
  }

  let output = ""
  files.forEach(function (file, index) {
    if (file.indexOf('.js') === file.length-3) {
      fs.stat(path.normalize(path.join('js', file)), function (error, stat) {
        if (error) {
          console.error('Error stating file.', error)
          return
        }

        if (stat.isFile()) {
          let contents = fs.readFileSync(path.normalize(path.join('js', file)))
          let altered = contents.toString().replace(/\(([a-zA-Z]*?)\) =>/g, 'function ($1)')
          output += altered
          if (index = files.length - 1) {
            end(output)
          }
        }
      })
    }
  })
})

function end(output) {
  if (process.env.PRODUCTION === 'true') {
    output = ujs.minify(output).code
  }
  fs.writeFileSync('built.js', output)
}
