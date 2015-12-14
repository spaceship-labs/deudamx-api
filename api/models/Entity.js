/**
 * Entity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

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
      collection : 'debtObligation',
      via: 'entity'
    },
    administrations : {
      collection : 'administration',
      via : 'entity'
    },
    balance: {
      type: 'float',
      index: true
    }
  },


};
