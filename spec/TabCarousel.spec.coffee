if require?
  localStorage = require('localStorage')
  {TabCarousel} = require('../lib/TabCarousel')
else
  localStorage = this.localStorage
  TabCarousel = this.TabCarousel

describe "localStorage accessors", ->
  ns = TabCarousel

  beforeEach ->
    localStorage.clear()

  describe "automaticStart", ->
    it 'should give give false if not set', ->
      expect(ns.automaticStart()).toBeFalsy()

    it 'should give give false if set to true', ->
      ns.automaticStart(true)
      expect(ns.automaticStart()).toBeTruthy()

    it 'should give give false if set to any truthy value', ->
      ns.automaticStart('some string')
      expect(ns.automaticStart()).toBeTruthy()

    it 'should give give false if set to ""', ->
      ns.automaticStart('')
      expect(ns.automaticStart()).toBeFalsy()

    it 'should allow setting to true then false', ->
      ns.automaticStart(true)
      expect(ns.automaticStart()).toBeTruthy()
      ns.automaticStart(false)
      expect(ns.automaticStart()).toBeFalsy()
