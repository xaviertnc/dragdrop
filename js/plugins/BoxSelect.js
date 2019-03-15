/**
 * BoxSelect.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 13 Mar 2019
 *
 */

import { Plugin } from '../classes/Plugin.js';

const log = window.__DEBUG_LEVEL__ ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * BoxSelect plugin
 * @class BoxSelect
 * @module BoxSelect
 */
export class BoxSelect extends Plugin {
  /**
   * Plugin constructor.
   * @constructs BoxSelect
   * @param {Component} hostObj Host component to apply this plugin to.
   * @param {Object} options Plugin initial configuration.
   */
  constructor(hostObj, options) {
    super('boxselect', hostObj, options);
    this.selecting = false;
    this.slectedItems = [];
    this.el = this.render();
    this.localPos = {};
  }


  /**
   * Configure plugin with custom options
   * Abstract/required method implementation.
   */
  init() {} // I.e. No options available on this plugin


  /**
   * Get pos(x,y) of an event target element that we can directly compare
   * to the mouse pointer pos(clientX, clientY) of the same event.
   *
   * NOTE: If the target is inside a scrolled parent, the parent CSS
   *       "position" MUST be set to "relative" for calcs to work!
   *
   * @param  {HTMLEntity} el Target element
   * @return {Object} { x: target.mouseComparableX, y: target.mouseComparableY }
   */
  getElementGlobalPos(el) {
    let xPos = 0;
    let yPos = 0;
    while (el) {
      if (el.tagName == 'BODY') {
        // deal with browser quirks with body/window/document and page scroll
        const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        const yScroll = el.scrollTop || document.documentElement.scrollTop;
        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }


  getHostLocalPos(event) {
    const hostGlobalPos = this.getElementGlobalPos(this.hostObj.el);
    return {
      x: event.clientX - hostGlobalPos.x,
      y: event.clientY - hostGlobalPos.y
    };
  }


  render() {
    const el = document.createElement('div');
    el.style='border:1px dashed black;opacity:0.34;position:absolute;z-index:99';
    el.id = 'boxselect';
    return el;
  }


  mount(pointerLocalPos) {
    this.el.style.width = '3px';
    this.el.style.height = '3px';
    this.localPos = pointerLocalPos;
    this.el.style.top = pointerLocalPos.y + 'px';
    this.el.style.left = pointerLocalPos.x + 'px';
    this.hostObj.el.append(this.el);
    log4('BoxSelect::mount(x,y),', pointerLocalPos);
  }


  dismount() {
    this.el.parentElement.removeChild(this.el);
  }


  update(pointerLocalPos) {
    const w = pointerLocalPos.x - this.localPos.x;
    const h = pointerLocalPos.y - this.localPos.y;
    this.el.style.width = w + 'px';
    this.el.style.height = h + 'px';
  }


  getKey(key) {
    return this.hostObj.app.keyboard.get(key);
  }


  getSelectedItems() {

  }


  onMouseDown(event) {
    log4('BoxSelect::onMouseDown(),', event);
    if (this.getKey('SHIFT').isDown) {
      this.selecting = true;
      this.mount(this.getHostLocalPos(event));
    }
  }


  onMouseMove(event) {
    if (this.selecting) {
      log4('BoxSelect::onMouseMove(),', event);
      this.update(this.getHostLocalPos(event));
    }
  }


  onMouseUp(event) {
    log4('BoxSelect::onMouseUp(),', event);
    if (this.selecting) {
      this.selecting = false;
      this.dismount();
    }
  }


  attach() {
    log4('BoxSelect::attach()');
    const hostObj = this.hostObj;
    hostObj.boxSelect = this;
    hostObj.eventListners.onMouseDown = this.onMouseDown.bind(this);
    hostObj.eventListners.onMouseMove = this.onMouseMove.bind(this);
    hostObj.eventListners.onMouseUp = this.onMouseUp.bind(this);
    hostObj.el.addEventListener('mousedown', hostObj.eventListners.onMouseDown);
    hostObj.el.addEventListener('mousemove', hostObj.eventListners.onMouseMove);
    hostObj.el.addEventListener('mouseup', hostObj.eventListners.onMouseUp);
  }


  detach() {}

}
