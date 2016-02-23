/**
 * Entity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var q = require('q');

module.exports = {

  attributes: {
    name: {
      type: 'string',
      index: 'true',
    },
    stats: {
      type: 'json',
    },
    obligations: {
      collection: 'debtObligation',
      via: 'entity'
    },
    administrations: {
      collection: 'administration',
      via: 'entity'
    },
    balance: {
      type: 'float',
      index: true
    },
    gdpdebt: function() {
      var name = this.name;
      //console.log(name);
      return this.stats.map(function(stat) {
        stat.gdpdebt = stat.debt / (stat.gdp / 1000) * 100;
        //Check for statistical diference with the source file.
        if (stat.debtpib) {
          var diff = Math.round((stat.gdpdebt - stat.debtpib) * 100) / 100;
          if (Math.abs(diff) > 0.05) {
            //console.log(name, stat.year, diff);
          }
        }
        return stat;
      });

    }
  },

  calculateGDPDebt: function(query) {
    //console.log(query);
    return Entity.find({}).limit(35).then(function(entities) {
      return q.all(entities.map(function(entity) {
        return Entity.update(entity.id, {
          stats: entity.gdpdebt()
        });
      }));
    });
  }


};
