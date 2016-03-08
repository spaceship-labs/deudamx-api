/**
 * importService
 *
 * @description :: Server-side logic for calculating stats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var q = require('q'),
  gauss = require('gauss'),
  i = 0;

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
      //.skip(30)
      //.limit(40)
      .populate('obligations')
      .populate('entity')
      .then(function(admons) {
        return q.all(admons.map(setAdmonStats));
      });
  },
  calculateGDPDebt : calculateGDPDebt,
  getAdmonAproximations: getAdmonAproximations
}

function calculateGDPDebt(){

}

function getAdmonAproximations(admon) {
  if (admon && admon.entity) {
    var debtVector = mapVector(admon.entity.stats, 'debt');
    var gdpVector = mapVector(admon.entity.stats, 'gdpdebt');
    var perCapitaVector = mapVector(admon.entity.stats, 'perCapita');

    var start = {
      debt: getLinearAproximation(debtVector, admon.start),
      debtgdp: getLinearAproximation(gdpVector, admon.start),
      debtPerCapita: getLinearAproximation(perCapitaVector, admon.start),
    }
    if(!admon.end){
      admon.end = '2016';
    }
    var end = {
      debt: getLinearAproximation(debtVector, admon.end),
      debtgdp: getLinearAproximation(gdpVector, admon.end),
      debtPerCapita: getLinearAproximation(perCapitaVector, admon.end),
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
  }else{
    return false;
  }
}

function mapVector(stats, field) {
  return stats.map(function(stat) {
    if (stat.year === 'Marzo 2015') {
      stat.year = 2015;
    }
    var year = parseInt(stat.year) + 1;
    year = new Date(year.toString());
    return [Date.parse(year), parseFloat(stat[field])];
  });
}

function getLinearAproximation(vector, date) {
  var i;
  date = new Date(date);
  var x = date.getTime();

  for (i = 0; i < vector.length; i++) {
    if (vector[i][0] >= x) {
      break;
    }
  }
  if(i === 0){
    return vector[0][1];
  }else{
    var start = vector[i - 1];
    var end = vector[i];
    var m = (end[1] - start[1]) / (end[0] - start[0]);
    var b = end[1] - m * end[0];
    var y = m * x + b;
  }
  return y;
}



function setAdmonStats(admon) {
  var stats = {
    obStats: calculateStatsFromObligations(admon.obligations),
    entityStats: getAdmonAproximations(admon),
  };
  console.log(i++);
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
