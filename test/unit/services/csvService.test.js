require("sails-test-helper");

describe(TEST_NAME, function() {
  describe("parse", function() {
    it("should parse csv file", function(done) {
      csvService.parse('test/fixtures/samplecsv.csv').then(function(data) {
        data.length.should.equal(3);
        done();
      });
    });
    it('should resolve error if no file', function(done){
      csvService.parse('wrongfilename.csv').then(function(data){

      },function(error){
        done();
      });
    });
  });
});

