/**
 * importService
 *
 * @description :: Server-side logic for managing importing of csvs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var headers,
  column
q = require('q');

module.exports = {
  debt: function() {
    var deferred = q.defer();

    column = 'debt';
    csvService.parse('sources/serie-historica-entidades.csv')
      .then(importStats, deferred.reject)
      .then(deferred.resolve, deferred.reject);

    return deferred.promise;
  },
  debtpib: function() {
    var deferred = q.defer();

    column = 'debtpib';
    csvService.parse('sources/serie-historica-deuda-pib-entidades.csv')
      .then(importStats, deferred.reject)
      .then(deferred.resolve, deferred.reject);

    return deferred.promise;
  },
  obligations: function() {
    var deferred = q.defer();
    csvService.parse('sources/registro-deuda.csv')
      .then(importObligations, deferred.reject)
      .then(deferred.resolve, deferred.reject);
    return deferred.promise;
  }
};

function importObligations(data) {
  var deferred = q.defer();
  var headers = data.splice(0, 1);
  async.map(data, importObligation, function(e, res) {
    if (e) {
      deferred.reject(e);
    } else {
      deferred.resolve(res);
    }
  });
  return deferred.promise;
}

function importObligation(data, cb) {
  var entityName = data[0];
  Entity.findOne({
    name: {
      like: entityName.trim()
    }
  }).exec(function(e, entity) {
    if (e) {
      cb(e)
    };
    if (!entity) {
      cb(new Error('entity not found'));
    };
    var obligation = {};
    var headers = ['acredited', 'creditor', 'type', 'signDate', 'inscriptionDate', 'ammount', 'balance', 'term' ,'collateral','destination'];

    headers.forEach(function(header, i) {
      obligation[header] = data[i + 1].trim().toLowerCase().capitalizeFirstLetter();
    });
    obligation.entity = entity.id;
    DebtObligation.create(obligation).exec(cb);
  });
}

function importStats(data) {
  var deferred = q.defer();
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
