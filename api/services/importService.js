/**
 * importService
 *
 * @description :: Server-side logic for managing importing of csvs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var headers,
  column;

module.exports = {
  debt: function() {
    var q = require('q'),
      deferred = q.defer();

    column = 'debt';
    csvService.parse('sources/serie-historica-entidades.csv')
      .then(importStats, deferred.reject)
      .then(deferred.resolve, deferred.reject);

    return deferred.promise;
  },
  debtpib: function() {
    var q = require('q'),
      deferred = q.defer();

    column = 'debtpib';
    csvService.parse('sources/serie-historica-deuda-pib-entidades.csv')
      .then(importStats, deferred.reject)
      .then(deferred.resolve, deferred.reject);

    return deferred.promise;
  }
};

function importStats(data) {
  var q = require('q'),
    deferred = q.defer();
  headers = data.splice(0, 1)[0];

  headers.splice(0, 1);



  async.map(data, importStatsRow, function(e, res) {
    if (e) {
      deferred.reject(e);
    } else {
      deferred.resolve(res);
    }
  });

  return deferred.promise;
}

function importStatsRow(row, cb) {
  var name = row[0].trim();
  Entity.findOrCreate({
    name: name
  }, {
    name: name
  }, function(e, entity) {
    if (e) {
      cb(e);
    }
    Entity.update(entity.id, {
      stats: sortSeries(row, entity.stats)
    }).exec(cb);
  });

}

function sortSeries(row, exStats) {
  var i = 0;
  row.splice(0, 1);

  stats = row.map(function(data) {
    var existing = _.find(exStats, function(stat) {
      if (stat.year === headers[i]) {
        return stat;
      }
      return false;
    });

    if (existing) {
      var ret = existing;
    } else {
      var ret = {
        year: headers[i]
      };
    }
    i++;

    ret[column] = data;
    return ret;
  });
  return stats
}
