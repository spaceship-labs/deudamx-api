require('sails-test-helper');

var fs = require('fs'),
  json = requireHelper('jsonHelper');

describe(TEST_NAME, function() {
  describe('calculateStatsFromEntity', function() {
    it('should return false if no parameter', function() {
      var result = statsService.calculateStatsFromEntity();
      result.should.equal(false);
    });
    //Normal means that there are stats for every year of the administration
    it('should return the proper stats for a normal administration', function(done) {
      var result = statsService.calculateStatsFromEntity();
      json.load('sample-administration.json', function(admon) {
        var result = statsService.calculateStatsFromEntity(admon);
        console.log(result);
        done();
      });
    });

  });

  describe('getYearDeltas', function() {

    it('should return false if no parameter', function() {
      var result = statsService.getYearDeltas();
      result.should.equal(false);
    });

    it('should return the proper stats', function(done) {
      json.load('sample-stats.json', function(sampleStats) {
        var result = statsService.getYearDeltas(sampleStats);
        var year = 2013;
        var deltaDebt = 500;
        var perCapita = [0, 6, 9];
        result.length.should.equal(sampleStats.length - 1);
        result.forEach(function(delta, key) {
          delta.start.should.equal(year++);
          delta.end.should.equal(year);
          delta.deltaDebt.should.equal(deltaDebt);
          Math.round(delta.deltaGdp * 10).should.equal(1);
          delta.deltaPerCapita.should.equal(perCapita[key]);
          deltaDebt = deltaDebt * 2;
        });
        done();
      });
    });
  });


});
