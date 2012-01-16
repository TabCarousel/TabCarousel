if require?
  localStorage = require('localStorage')
  {Options} = require('../lib/TabCarousel')
else
  localStorage = this.localStorage
  Options = this.Options

describe "Options", ->
 describe "automaticStart", ->
    beforeEach ->
      @options = new Options
      localStorage.clear()

    it 'should give give false if not set', ->
      expect(@options.automaticStart()).toBeFalsy()

    it 'should give give false if set to true', ->
      @options.automaticStart(true)
      expect(@options.automaticStart()).toBeTruthy()

    it 'should give give false if set to any truthy value', ->
      @options.automaticStart('some string')
      expect(@options.automaticStart()).toBeTruthy()

    it 'should give give false if set to ""', ->
      @options.automaticStart('')
      expect(@options.automaticStart()).toBeFalsy()

    it 'should allow setting to true then false', ->
      @options.automaticStart(true)
      expect(@options.automaticStart()).toBeTruthy()
      @options.automaticStart(false)
      expect(@options.automaticStart()).toBeFalsy()
