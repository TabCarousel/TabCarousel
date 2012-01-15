{exec}  = require('child_process')

task 'spec', 'Run Jasmine specs in spec/', ->
  exec 'node_modules/.bin/jasmine-node --coffee spec/', (err, stdout, stderr) ->
   throw err if err
   console.log(stdout + stderr)

task 'spec:browser', 'Compile Jasmine specs for use with SpecRunner.html', ->
  exec 'coffee --output build --compile --join TabCarouselSpec.js --watch spec/*.coffee', (err, stdout, stderr) ->
   throw err if err
   console.log(stdout + stderr)
