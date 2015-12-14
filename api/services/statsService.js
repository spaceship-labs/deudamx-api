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
        return setAdmonStats(admons[15]);
        //return q.all(admons.map(setAdmonStats));
      });
  }
}

function setAdmonStats(admon) {
  var obligations = new gauss.Collection(admon.obligations);

  var sum = obligations.map(
    function(ob) {
      return ob.ammount
    }).toVector().sum();
  var balance = obligations.map(
    function(ob) {
      return ob.balance
    }).toVector().sum();
  var count = obligations.length;


  var stats = {
    sum: sum,
    count: count,
    balance: balance,
    years : calculateStatsFromEntity(admon),
  };

  return Administration.update(admon.id, {
    stats: stats
  });
}

function calculateStatsFromEntity(admon) {
  //this da main science here
  var start = new Date(admon.start)
  var ends = admon.end ? new Date(admon.end) : false;
  //Add a year so that it overlaps (chek the paper)
  ends.setYear(ends.getFullYear() + 1);

  var years = admon.entity.stats.filter(function(stat) {
    if (stat.year === 'Marzo 2015') {
      stat.year = '2016';
    } else {
      //Add one year to stat because stat is from end of the year and date gets first day of year
      stat.year = parseInt(stat.year) + 1
      stat.year = stat.year.toString();
    }
    var statDate = new Date(stat.year);
    // If the administration has ended check if the date is in between else check with just lower bound
    if (ends) {
      return statDate >= start && statDate <= ends;
    } else {
      return statDate >= start;
    }
  });

  console.log(years.length);
  console.log(start, ends);
  return years;
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
