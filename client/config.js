/**
 * This file is used to configure your common browserify bundle.
 * 
 * If you add common packages that should be shared between multiple scripts,
 * add their names to the common.packages array below and they will be
 * automatically included.
 * 
 * All common packages are automatically excluded from your browserified
 * script builds.
 * 
 * If you change this configuration, you *must* restart the web server.
 */

module.exports = {
	common: {
		bundle: 'common.js',
		packages: [
			'react',
			'react-router',
      'd3',
      'react-d3',
      'topojson',
      'datamaps/dist/datamaps.all.js',
      'jquery',
      'lodash',
      'jquery-ui'
		]
	}
};
