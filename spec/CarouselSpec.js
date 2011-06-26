describe("localStorage accessors", function() {
  var ns = carousel;

  beforeEach(function () {
    localStorage.clear();
  });
  
  describe("automaticStart", function () {
    it('should give give false if not set', function () {
      expect(ns.automaticStart()).toBeFalsy();
    });

    it('should give give false if set to true', function () {
      ns.automaticStart(true);
      expect(ns.automaticStart()).toBeTruthy();
    });

    it('should give give false if set to any truthy value', function () {
      ns.automaticStart('some string');
      expect(ns.automaticStart()).toBeTruthy();
    });
  });
});
