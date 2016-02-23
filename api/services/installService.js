/**
 * installService
 *
 * @description :: Server-side logic for managing instalation
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var q = require('q');

module.exports = {
  all: function() {
    //return statsService.setAdmonStats();
    return importService
      .debtpib()
      .then(importService.gdp)
      .then(importService.debt)
      .then(importService.population)
      .then(importService.obligations)
      .then(importService.administrations)
      .then(importService.setBalances)
      .then(Entity.calculateGDPDebt)
      .then(statsService.relateObligations)
      .then(statsService.setAdmonStats);
  }

};
