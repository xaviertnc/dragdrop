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

  constructor(hostObj, options) {
    super('boxselect', hostObj, options);
    this.selecting = false;
    this.slectedItems = [];
    this.el = this.renderBox();
    this.hideBox();
    this.hostObj.el.append(this.el);
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


  getEventLocalPos(globalPos) {
    const hostGlobalPos = this.getElementGlobalPos(this.hostObj.el);
    return {
      x: globalPos.x - hostGlobalPos.x,
      y: globalPos.y - hostGlobalPos.y
    };
  }


  renderBox() {
    const el = document.createElement('div');
    el.style='border:1px dashed black;opacity:0.34;position:absolute;z-index:99';
    el.id = 'boxselect';
    return el;
  }


  moveBoxTo(pointerGlobalPos) {
    this.globalPos = pointerGlobalPos;
    this.localPos = this.getEventLocalPos(pointerGlobalPos);
    this.el.style.top = this.localPos.y + 'px';
    this.el.style.left = this.localPos.x + 'px';
  }


  hideBox() {
    log4('BoxSelect::hide()');
    this.el.style.width = '3px';
    this.el.style.height = '3px';
    this.moveBoxTo({ x: -9999, y: 0 });
    this.localPos = {};
    this.globalPos = {};
    this.visible = false;
    this.height = 1;
    this.width = 1;
  }


  resizeBox(pointerGlobalPos) {
    const pointerLocalPos = this.getEventLocalPos(pointerGlobalPos);
    this.width = pointerLocalPos.x - this.localPos.x;
    this.height = pointerLocalPos.y - this.localPos.y;
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';
  }


  onMouseDown(event) {
    log4('BoxSelect::onMouseDown(),', event);
    // PLEASE NOTE: If we try to "show / move" the box in this method, some crutial
    // subsequent events get cancelled! This causes difficult to resolve issues
    // with firing "onclick" events added by other plugins.
    this.selecting = this.hostObj.canBoxSelect
      ? this.hostObj.canBoxSelect(event)
      : true;
  }


  onMouseMove(event) {
    if (this.selecting) {
      // log4('BoxSelect::onMouseMove(),', event);
      if (this.visible) {
        this.resizeBox({ x: event.clientX, y: event.clientY });
      } else {
        this.moveBoxTo({ x: event.clientX, y: event.clientY });
        this.visible = true;
      }
    }
  }


  onMouseUp(event) {
    log4('BoxSelect::onMouseUp(),', event);
    if (this.selecting) {
      this.selecting = false;
      if (this.visible) {
        if (this.hostObj.onBoxSelect) {
          const selectBox = {
            x: this.globalPos.x,
            y: this.globalPos.y,
            width: this.width,
            height: this.height
          };
          this.hostObj.onBoxSelect(selectBox, event);
        }
        this.hideBox();
      }
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
