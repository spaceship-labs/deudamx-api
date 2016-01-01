var fs = require('fs'),
  helper = {};

module.exports = helper;

helper.load = load;

function load(filename, done) {
  fs.readFile(TEST_FIXTURES_PATH + '/' + filename, 'utf8', function(err, data) {
    if(err){
      throw(err);
    }
    done(JSON.parse(data));
  });
}
