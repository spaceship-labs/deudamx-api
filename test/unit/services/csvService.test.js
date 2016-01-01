require("sails-test-helper");

describe(TEST_NAME, function() {
  describe("parse", function() {
    it("should parse csv file", function(done) {
      csvService.parse(TEST_FIXTURES_PATH+'/samplecsv.csv').then(function(data) {
        data.length.should.equal(3);
        done();
      });
    });
    it('should reject the promise if no file', function(done){
      csvService.parse(TEST_FIXTURES_PATH+'/wrongfilename.csv').then(function(data){

      },function(error){
        done();
      });
    });
  });
});

