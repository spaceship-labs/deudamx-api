/**
 * importService
 *
 * @description :: Server-side logic for calculating stats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var q = require('q'),
  gauss = require('gauss');

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
  }
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
  var deltas = getYearDeltas(admon.entity.stats);
  var relevantDeltas = deltas.filter(function(delta) {
    var startYear = admon.start.getFullYear();
    startYear = startYear >= 1994 ? startYear : 1994;
    if (admon.end) {

      return delta.start === startYear || delta.start === admon.end.getFullYear();
    } else {
      return delta.start === startYear || delta.end === 2016;
    }
  });


  if (relevantDeltas.length > 1) {
    var start = getLinearAproximations(admon, relevantDeltas[0], admon.start);
    var end = getLinearAproximations(admon, relevantDeltas[1], admon.end);
  } else if (relevantDeltas.length === 1) {
    if (admon.start.getFullYear() === admon.end.getFullYear()) {
      var start = getLinearAproximations(admon, relevantDeltas[0], admon.start);
      var end = getLinearAproximations(admon, relevantDeltas[0], admon.end);
    } else {
      console.log('not enough data for' + admon.start.getFullYear() + ' - ' + admon.end.getFullYear());
      return false;
    }
  } else {
    console.log('no data for' + admon.start.getFullYear() + ' - ' + admon.end.getFullYear());
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
  var deltas = stats.map(function(stat, index) {
    if (index !== 0) {
      if (stat.year === 'Marzo 2015') {
        stat.year = '2015'
      }
      var prevStat = stats[index - 1];
      var end = parseInt(stat.year) + 1;
      prevStat.year = parseInt(prevStat.year) + 1;
      return {
        start: parseInt(stat.year),
        end: end,
        deltaDebt: stat.debt - prevStat.debt,
        deltaGdp: stat.debtpib - prevStat.debtpib,
        deltaPerCapita: stat.perCapita - prevStat.perCapita,
        stat: prevStat
      }
    } else {
      return null;
    }
  });
  deltas.splice(0, 1);
  return deltas;
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
