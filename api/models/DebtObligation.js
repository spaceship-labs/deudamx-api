/**
 * DebtObligation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    entity: {
      model: 'entity'
    },
    inscriptionDate: {
      type: 'date'
    },
    signDate: {
      type: 'date'
    },
    ammount: {
      type: 'integer'
    },
    balace: {
      type: 'float'
    },
    term: {
      type: 'integer'
    },
    type: {
      type: 'string',
      enum: [
        'Crédito simple',
        'Proyecto de prestación de servicios',
        'Crédito en cuenta corriente',
        'Garantía de pago oportuno',
        'Emisión bursátil'
      ]
    },
    collateral: {
      type: 'string',
      enum: [
        'Participaciones federales',
        'Participaciones federales/bono cupón cero federal',
        'Ingresos propios',
        'Aportaciones federales',
        'Participaciones federales/bono cupón cero estatal',
        'Participaciones federales/bono cupón cero',
        'Ingresos propios/participaciones federales',
        'Participaciones federales/ingresos propios',
        'Participaciones federales/aportaciones federales',
        'Participaciones federales/bono cupón cero municipal'
      ]

    },
    destination: {
      type: 'string',
      enum: [
        'Inversión pública productiva',
        'Inversión pública productiva/refinanciamiento',
        'Refinanciamiento'
      ]
    }
  }
};
