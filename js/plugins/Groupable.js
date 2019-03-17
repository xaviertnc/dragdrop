/*global Symbol*/

/**
 * Groupable.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 16 Mar 2019
 *
 */

import { Plugin } from '../classes/Plugin.js';

const log = window.__DEBUG_LEVEL__ ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};



/**
 * Groupable plugin
 * @class Groupable
 * @module Groupable
 */
export class Groupable extends Plugin {
  /**
   * Plugin constructor.
   * @constructs Groupable
   * @param {Component} hostObj Host component to apply this plugin to.
   * @param {Object} options Plugin initial configuration.
   */
  constructor(hostObj, options) {
    hostObj.selected = false;
    hostObj.group = hostObj.getGroup ? hostObj.getGroup() : null,
    super('groupable', hostObj, options);
  }


  /**
   * Configure plugin with custom options
   * Abstract/required method implementation.
   */
  init() {} // I.e. No options available on this plugin


  onClick(event) {
    log4('Groupable::onClick()');
    if (this.hostObj.onClick) {
      return this.hostObj.onClick(event);
    }
  }


  attach() {
    log4('Groupable::attach()');
    const hostObj = this.hostObj;
    hostObj.eventListners.onGroupableClick = this.onClick.bind(this);
    hostObj.el.addEventListener('click', hostObj.eventListners.onGroupableClick);
  }


  detach() {
    log4('Groupable::detach()');
    const hostObj = this.hostObj;
    hostObj.el.removeEventListener('click', hostObj.eventListners.onGroupableClick);
    delete hostObj.eventListners.onGroupableClick;
  }

}
