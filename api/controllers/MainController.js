/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function(req, res) {

    res.json({
      service: 'deudamx api',
      version: '0.0.1',
      documentation: 'http://github.com/spaceship-labs/deudamx-api',
      description: 'contains information about sub-national public debt in Mexico'
    });

  },
  install: function(req, res) {
    installService.all()
      .then(res.json.bind(res), res.json.bind(res));
  },
  test: function(req, res) {
    console.log('start test');
    //Entity.calculateGDPDebt()
    statsService.setAdmonStats()
      .then(res.json.bind(res), res.json.bind(res));
  }


};
