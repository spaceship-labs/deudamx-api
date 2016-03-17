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
      for (var i = 0;i<this.stats.length;i++) {
          this.stats[i].gdpdebt = this.stats[i].debt / (this.stats[i].gdp / 1000) * 100;
      }
      return this.stats;
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
