/**
 * Plugin.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 08 Mar 2019
 *
 */

const log3 = window.__DEBUG_LEVEL__ > 2 ? console.log : function(){};
const log5 = window.__DEBUG_LEVEL__ > 4 ? console.log : function(){};

/**
 * Base plugin class
 * @abstract
 * @class Plugin
 * @module Plugin
 */
export class Plugin {
  /**
   * Plugin constructor.
   * @constructs Plugin
   * @param {[type]} id      Plugin name/id to simplify searching for this plugin.
   * @param {Object} hostObj Plugin host object (Object to be extended)
   * @param {Object} options Plugin initial configuration.
   */
  constructor(id, hostObj, options = {}) {
    /**
     * Plugin name / id
     * @property id
     * @type {String}
     */
    this.id = id;

    /**
     * The HOST Object to attach the plugin to
     * @property hostObj
     * @type {Object}
     */
    this.hostObj = hostObj;

    // Configure plugin with custom options
    this.init(options);

    log5('Plugin::new()');
  }


  /**
   * Override to configure plugin
   * @abstract
   */
  init() {
    throw new Error('Plugin::init() not implemented!');
  }


  /**
   * Override to add listeners
   * @abstract
   */
  attach() {
    throw new Error('Plugin::attach() not implemented!');
  }


  /**
   * Override to remove listeners
   * @abstract
   */
  detach() {
    throw new Error('Plugin::detach() not implemented!');
  }


  /**
   * Alias for Plugin::init().
   * Used when we need to update the plugin config AFTER instantiation.
   * @param  {Object} options Plugin settings to update
   */
  reconfigure(options) {
    log3('Plugin::reconfigure(), options:', options);
    this.init(options);
  }

}