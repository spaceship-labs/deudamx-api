/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function(req, res) {
/*
    importService
      .debtpib()
      .then(importService.debt)
      .then(importService.population)
      .then(importService.obligations)
      .then(importService.setBalances)
      .then(function(data) {
        res.json(data);
      }, function(e) {
        res.json(e);
      });
*/

    res.json({
      service: 'deudamx api',
      version: '0.0.1',
      documentation: 'http://github.com/spaceship-labs/deudamx-api',
    });
  }
};
