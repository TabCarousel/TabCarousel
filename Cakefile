{exec}  = require('child_process')

task 'spec', 'Run Jasmine specs in spec/', ->
  exec 'node_modules/.bin/jasmine-node --coffee spec/', (err, stdout, stderr) ->
   throw err if err
   console.log(stdout + stderr)

# coffee --output public --compile --join TabCarouselSpec.js --watch spec/*.coffee
