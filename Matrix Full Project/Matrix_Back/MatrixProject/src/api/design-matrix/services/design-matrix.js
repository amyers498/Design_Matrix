'use strict';

/**
 * design-matrix service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::design-matrix.design-matrix');
