/**
 * csvService
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  parse: function(filename) {
    var fs = require('fs'),
      parse = require('csv-parse'),
      q = require('q'),
      deferred = q.defer(),
      stream;

    parser = parse({
      delimiter: ','
    }, function(err, data) {
      deferred.resolve(data);
    });
    stream = fs.createReadStream(filename);
    stream.on('error', function(error) {
      deferred.reject(error);
    });
    stream.on('readable', function() {
      stream.pipe(parser);
    });

    return deferred.promise;
  }
};
