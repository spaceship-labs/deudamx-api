/**
 * importService
 *
 * @description :: Server-side logic for managing importing of csvs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var headers,
  column,
  q = require('q');

module.exports = {
  administrations: function() {
    var deferred = q.defer();
    console.log('importing administrations');
    csvService.parse('sources/administrations.csv')
      .then(importAdministrations)
      .then(deferred.resolve,deferred.reject);
    return deferred.promise;
  },
  debt: function() {
    var deferred = q.defer();
    column = 'debt';
    console.log('importing debt series');
    csvService.parse('sources/serie-historica-entidades.csv')
      .then(importStats, deferred.reject)
      .then(deferred.resolve, deferred.reject);

    return deferred.promise;
  },
  debtpib: function() {
    var deferred = q.defer();
    console.log('importing debt gdp series');
    column = 'debtpib';
    csvService.parse('sources/serie-historica-deuda-pib-entidades.csv')
      .then(importStats, deferred.reject)
      .then(deferred.resolve, deferred.reject);

    return deferred.promise;
  },
  gdp: function() {
    var deferred = q.defer();
    console.log('importing gdp series');
    column = 'gdp';
    csvService.parse('sources/base-pib.csv')
      .then(importStats, deferred.reject)
      .then(deferred.resolve, deferred.reject);

    return deferred.promise;
  },
  obligations: function() {
    var deferred = q.defer();
    console.log('importing debt registry');
    csvService.parse('sources/registro-deuda.csv')
      .then(importObligations, deferred.reject)
      .then(deferred.resolve, deferred.reject);
    return deferred.promise;
  },
  population: function() {
    var deferred = q.defer();
    console.log('importing population');
    column = 'population';
    csvService.parse('sources/poblacion-inegi.csv')
      .then(function(data) {
        var newTable = interpolatePopulation(data);
        importStats(newTable).then(deferred.resolve, deferred.reject);
      });

    return deferred.promise;
  },
  setBalances: function() {
    var deferred = q.defer();
    console.log('setting balance stats');
    Entity.find({}).exec(function(e, entities) {
      if (e) {
        console.log(e);
        deferred.reject(e);
      }
      async.map(entities, setBalance, function(e, res) {
        if (e) {
          deferred.reject(e)
        }
        deferred.resolve(res);
      });
    });
    return deferred.promise;
  }

};

function interpolatePopulation(data) {
  var deferred = q.defer();
  var years = data.splice(0, 1)[0];
  years.splice(0, 1);

  var newData = data.map(function(row) {
    var entity = row.splice(0, 1)[0];
    var newRow = [];
    var delta = 0;
    row.forEach(function(pop, key) {
      pop = parseInt(pop);
      newRow.push(pop);
      var thisYear = parseInt(years[key]);
      if (key < row.length - 1) {
        var nextYear = parseInt(years[key + 1]);
        var nextPop = parseInt(row[key + 1]);
        delta = (nextPop - pop) / (nextYear - thisYear);
        for (var i = thisYear + 1; i < nextYear; i++) {
          var extrapolation = ((i - thisYear) * delta) + pop;
          newRow.push(Math.round(extrapolation));
        }
      } else {
        for (var i = thisYear + 1; i <= 2015; i++) {
          var extrapolation = ((i - thisYear) * delta) + pop;
          newRow.push(Math.round(extrapolation));
        }
      }
    });
    //Remove 1990-1992
    newRow.splice(0, 3);
    newRow.splice(0, 0, entity);
    return newRow;

  });

  //Insert Years header
  var headers = ['entidad'];
  for (var i = 1993; i <= 2014; i++) {
    headers.push(i.toString());
  }
  headers.push('Marzo 2015');
  newData.splice(0, 0, headers);

  return newData;
}

function setBalance(entity, cb) {
  entity.stats = setPerCapita(entity.stats);
  Entity.update(entity.id, {
    balance: entity.stats[entity.stats.length - 1].debt,
    balancegdp: entity.stats[entity.stats.length - 1].debtpib,
    population: entity.stats[entity.stats.length - 1].population,
    balancePerCapita: entity.stats[entity.stats.length - 1].perCapita,
    stats: entity.stats,
  }, cb);
}

function setPerCapita(stats) {
  for (var i = 0; i < stats.length; i++) {
    stats[i].perCapita = (stats[i].debt * 1000000) / stats[i].population;
  }
  return stats;
}


function importAdministrations(data) {
  var deferred = q.defer();
  data.splice(0,1);
  async.mapSeries(data, importAdministration, function(e, res) {
    if (e) {
      deferred.reject(e);
    } else {
      deferred.resolve(res);
    }
  });
  return deferred.promise;
}


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

function importAdministration(data,cb){
  var headers = ['party','governor','start','end','picture','twitter'];
  //console.log(data);
  importRecord(data,headers,Administration,false,cb);
}

function importObligation(data, cb) {
  var headers = ['acredited', 'creditor', 'type', 'signDate', 'inscriptionDate', 'ammount', 'balance', 'term', 'collateral', 'destination'];
  importRecord(data,headers,DebtObligation,true,cb);
}
//Assumes first value in row is entity name
function importRecord(data, headers, collection, normalizeStrings, cb) {
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
      return cb(new Error('entity not found'));
    };
    var record = {};

    headers.forEach(function(header, i) {
      if(normalizeStrings){
        record[header] = data[i + 1].trim().toLowerCase().capitalizeFirstLetter();
      }else{
        record[header] = data[i + 1];
      }
    });
    record.entity = entity.id;
    //console.log(record);

    collection.create(record).exec(cb);
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

  return stats;
}
