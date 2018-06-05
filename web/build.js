const fs = require('fs')
const path = require('path')

let file = fs.readdir('js', function (err, files) {
  if (err) {
    console.error('Could not list the directory.', err)
    process.exit(1)
  }

  var output = ""
  files.forEach(function (file, index) {
    if (file.indexOf('.js') === file.length-3) {
      fs.stat(path.normalize(path.join('js', file)), function (error, stat) {
        if (error) {
          console.error('Error stating file.', error)
          return
        }

        if (stat.isFile()) {
          fs.readFile(path.normalize(path.join('js', file)),
            function (error, contents) {
              if (error) {
                console.error('Error reading file.', error)
                return
              }
              var altered = contents.toString().replace(/\(([a-zA-Z]*?)\) =>/g, 'function ($1)')
              output += altered
              if (index === files.length-1) {
                end(output)
              }
            })
        }
      })
    }
  })
})

function end(output) {
  fs.writeFileSync('built.js', output)
}
