require('sails-test-helper');

var fs = require('fs'),
  json = requireHelper('jsonHelper');

describe(TEST_NAME, function() {
  describe('getAdmonAproximations', function() {
    it('should return false if no parameter', function() {
      var result = statsService.getAdmonAproximations();
      result.should.equal(false);
    });
    //Normal means that there are stats for every year of the administration
    it('should return the proper stats for a normal administration', function(done) {
      json.load('sample-administration.json', function(admon) {
        var result = statsService.getAdmonAproximations(admon);
        result.start.debt.should.equal(1500);
        result.start.debtgdp.should.equal(1.5);
        result.start.debtPerCapita.should.equal(15);
        result.end.debt.should.equal(2500);
        result.end.debtgdp.should.equal(2.5);
        result.end.debtPerCapita.should.equal(25);
        result.delta.debt.should.equal(1000);
        result.delta.debtgdp.should.equal(1);
        result.delta.debtPerCapita.should.equal(10);
        done();
      });
    });

    //Ongoing administration
    it('should return the proper stats for a administration with no end', function(done) {
      json.load('sample-administation2.json', function(admon) {
        var result = statsService.getAdmonAproximations(admon);
        result.start.debt.should.equal(750);
        result.start.debtgdp.should.equal(1.5);
        result.start.debtPerCapita.should.equal(15);
        result.end.debt.should.equal(4000);
        result.end.debtgdp.should.equal(4);
        result.end.debtPerCapita.should.equal(40);
        result.delta.debt.should.equal(3250);
        result.delta.debtgdp.should.equal(2.5);
        result.delta.debtPerCapita.should.equal(25);
        done();
      });
    });

  });



});
