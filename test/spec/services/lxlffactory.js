'use strict';

describe('Service: lxlfFactory', function () {

  // load the service's module
  beforeEach(module('lxlfApp'));

  // instantiate service
  var lxlfFactory;
  beforeEach(inject(function (_lxlfFactory_) {
    lxlfFactory = _lxlfFactory_;
  }));

  it('should do something', function () {
    expect(!!lxlfFactory).toBe(true);
  });

});
