/**
 * Keyboard.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 08 Mar 2019
 *
 */

import { Key    } from '../classes/Key.js';
import { Plugin } from '../classes/Plugin.js';

const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * Keyboard plugin
 * @class Keyboard
 * @module Keyboard
 */
export class Keyboard extends Plugin {
  /**
   * Plugin constructor.
   * @constructs Keyboard
   * @param {Component} hostObj Host component to apply this plugin to.
   * @param {Object} options Plugin initial configuration.
   */
  constructor(hostObj, options) {
    super('keyboard', hostObj, options);
  }


  /**
   * Configure plugin with custom options
   * Abstract/required method implementation.
   */
  init() {} // I.e. No options available on this plugin!


  /**
   * Add keyboard key to track
   * @param {String  } keyName   - Key human identifier. e.g. "SHIFT"
   * @param {Integer } keyCode   - Key machine identifier. e.g. 16
   * @param {Function} onPress   - Optional | Function to handle "key pressed" events
   * @param {Function} onRelease - Optional | Function to handle "key released" events
   */
  add(keyName, keyCode, onPress, onRelease) {
    log4('Keyboard::add(), key:', keyName);
    this[keyName] = new Key(keyCode, onPress, onRelease);
  }


  get(keyName) {
    return this[keyName];
  }


  attach() {
    log4('Keyboard::attach()');
    this.hostObj.keyboard = this;
  }


  detach() {}

}
