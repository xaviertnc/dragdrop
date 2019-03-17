/**
 * App.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 06 Mar 2019
 *
 */

import { Keyboard  } from '../plugins/Keyboard.js';
import { Component } from '../classes/Component.js';

// const log  = window.__DEBUG_LEVEL__     ? console.log : function(){};
// const log2 = window.__DEBUG_LEVEL__ > 1 ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * App Component
 * @class App
 * @module App
 */
export class App extends Component {
  /**
   * Component constructor.
   * @constructs App
   * @param {Object} options - App options
   */
  constructor(options) {
    super(null, options);
    this.init();
  }


  init() {
    log4('App::init()');
    this.elDebug = document.getElementById('debug');
    this.eventListners.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.eventListners.onMouseMove);
    this.addPlugin(Keyboard);
  }


  /**
   * Global mouse move event listner
   * @param {Object} event - DOM generated event object
   */
  onMouseMove(event) {
    this.elDebug.innerHTML = `mouseX = ${event.clientX}, mouseY = ${event.clientY}`;
  }

}