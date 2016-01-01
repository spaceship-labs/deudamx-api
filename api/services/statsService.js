/**
 * importService
 *
 * @description :: Server-side logic for calculating stats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var q = require('q'),
  gauss = require('gauss')

module.exports = {
  relateObligations: function() {
    console.log('relating obligations');
    return Administration
      .find()
      .then(function(admons) {
        return q.all(admons.map(findObligation));
      });
  },
  setAdmonStats: function() {
    console.log('setting administration stats');
    return Administration
      .find()
      .populate('obligations')
      .populate('entity')
      .then(function(admons) {
        return q.all(admons.map(setAdmonStats));
      });
  },
  calculateStatsFromEntity: calculateStatsFromEntity,
  getYearDeltas: getYearDeltas,
}

function setAdmonStats(admon) {

  var stats = {
    obStats: calculateStatsFromObligations(admon.obligations),
    entityStats: calculateStatsFromEntity(admon),
  };

  return Administration.update(admon.id, {
    stats: stats
  });
}

function calculateStatsFromObligations(obligations) {
  obligations = new gauss.Collection(obligations);

  var sum = obligations.map(
    function(ob) {
      return ob.ammount
    }).toVector().sum();
  var balance = obligations.map(
    function(ob) {
      return ob.balance
    }).toVector().sum();
  var count = obligations.length;
  return {
    sum: sum,
    balance: balance,
    count: count
  }
}

function calculateStatsFromEntity(admon) {
  if (admon && admon.entity) {
    var deltas = getYearDeltas(admon.entity.stats);
    var startDate = new Date(admon.start);
    var endDate = new Date(admon.end);

    var relevantDeltas = deltas.filter(function(delta) {

      var startYear = startDate.getFullYear();
      startYear = startYear >= admon.entity.stats[0].year ? startYear : admon.entity.stats[0].year;
      if (admon.end) {
        return delta.start === startYear || delta.start === endDate.getFullYear();
      } else {
        return delta.start === startYear || delta.end === 2016;
      }

    });


    if (relevantDeltas.length > 1) {
      var start = getLinearAproximations(admon, relevantDeltas[0], startDate);
      var end = getLinearAproximations(admon, relevantDeltas[1], endDate);
    } else if (relevantDeltas.length === 1) {
      if (startDate.getFullYear() === endDate.getFullYear()) {
        var start = getLinearAproximations(admon, relevantDeltas[0], startDate);
        var end = getLinearAproximations(admon, relevantDeltas[0], endDate);
      } else {
        console.log('not enough data for' + startDate.getFullYear() + ' - ' + endDate.getFullYear());
        return false;
      }
    } else {
      console.log('no data for' + startDate.getFullYear() + ' - ' + endDate.getFullYear());
      return false;
    }
    return {
      start: start,
      end: end,
      delta: {
        debt: end.debt - start.debt,
        debtgdp: end.debtgdp - start.debtgdp,
        debtPerCapita: end.debtPerCapita - start.debtPerCapita
      }
    };
  } else {
    return false;
  }
}

function getLinearAproximations(admon, delta, date) {
  date = date ? date : new Date('2016');
  var yearStart = new Date(date.getFullYear().toString());
  var pct = Math.abs(date - yearStart) / (1000 * 3600 * 24 * 365);
  return {
    debt: parseFloat(delta.stat.debt) + (pct * delta.deltaDebt),
    debtgdp: parseFloat(delta.stat.debtpib) + (pct * delta.deltaGdp),
    debtPerCapita: parseFloat(delta.stat.perCapita) + (pct * delta.deltaPerCapita)
  }
}

function getYearDeltas(stats) {
  if (stats) {
    var deltas = stats.map(function(stat, index) {
      if (index !== 0) {
        if (stat.year === 'Marzo 2015') {
          stat.year = '2015'
        }
        var prevStat = stats[index - 1];
        var end = parseInt(stat.year) + 1;
        var deltaDebt = parseFloat(stat.debt) - parseFloat(prevStat.debt);
        var deltaGdp = parseFloat(stat.debtpib) - parseFloat(prevStat.debtpib);
        deltaPerCapita = stat.perCapita - prevStat.perCapita;
        return {
          start: parseInt(stat.year),
          end: end,
          deltaDebt: deltaDebt,
          deltaGdp: deltaGdp,
          deltaPerCapita: deltaPerCapita,
          stat: prevStat
        }
      } else {
        return null;
      }
    });
    deltas.splice(0, 1);
    return deltas;
  } else {
    return false;
  }
}

function findObligation(admon) {
  var query = {
    entity: admon.entity,
    signDate: {
      '>=': admon.start
    }
  }
  if (admon.end) {
    query.signDate['<'] = admon.end;
  }
  DebtObligation.find(query).then(function(obs) {
    return q.all(obs.map(function(ob) {
      return DebtObligation.update(ob.id, {
        administration: admon.id
      });
    }));
  });

}
