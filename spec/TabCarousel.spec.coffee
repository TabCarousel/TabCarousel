if require?
  localStorage = require('localStorage')
  {carousel} = require('../ext/javascripts/carousel')
else
  localStorage = this.localStorage
  carousel = this.carousel

describe "localStorage accessors", ->
  ns = carousel

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
