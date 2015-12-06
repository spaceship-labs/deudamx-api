/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function(req, res) {
    /*importService.debtpib()
      .then(importService.debt)
      .then(function(data) {
        res.json(data)
      });*/
    importService.obligations().then(function(data) {
      res.json(data);
    }, function(e) {
      res.json(e);
    });
  }
};
