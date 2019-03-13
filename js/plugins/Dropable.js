/**
 * Dropable.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 10 Mar 2019
 *
 */

import { Plugin } from '../classes/Plugin.js';

const log2 = window.__DEBUG_LEVEL__ === 2 ? console.log : function(){};
const log3 = window.__DEBUG_LEVEL__ > 2 ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * Dropable plugin
 * @class Dropable
 * @module Dropable
 */
export class Dropable extends Plugin {
  /**
   * Plugin constructor.
   * @constructs Dropable
   * @param {Component} hostObj Host component to apply this plugin to.
   * @param {Object} options Plugin initial configuration.
   */
  constructor(hostObj, options) {
    super('dropable', hostObj, options);
  }


  /**
   * Configure plugin with custom options
   * Abstract/required method implementation.
   */
  init() {} // I.e. No options available on this plugin!


  getMouseGlobalPos(event) {
    let xPos, yPos;
    //get mouse position on document crossbrowser
    if (!event){ event = window.event; }
    if (event.pageX || event.pageY) {
      xPos = event.pageX;
      yPos = event.pageY;
    }
    else if (event.clientX || event.clientY) {
      xPos = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      yPos = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return {
      x: xPos,
      y: yPos
    };
  }


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
  getGlobalPos(el) {
    let xPos = 0;
    let yPos = 0;
    while (el) {
      if (el.tagName == 'BODY') {
        // deal with browser quirks with body/window/document and page scroll
        var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        var yScroll = el.scrollTop || document.documentElement.scrollTop;
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


  onDragEnter(event) {
    log2('Dropable.onDragEnter(),', event);
  }


  onDragOver(event) {
    log4('Dropable.onDragOver()');
    event.preventDefault();
    return false;
  }


  onDragLeave(event) {
    log2('Dropable.onDragLeave(),', event);
  }


  onDrop(event) {
    log2('Dropable.onDrop()');
    const dropZoneObj = this.hostObj; // HOST === DROPZONE CONTAINER
    const canDrop = !dropZoneObj.canDrop
      || (dropZoneObj.canDrop && dropZoneObj.canDrop(event));
    if (canDrop) {
      if (dropZoneObj.onDrop) {
        const dropGlobalPos = this.getMouseGlobalPos(event);
        const dropZoneGlobalPos = this.getGlobalPos(dropZoneObj.el);
        const dropLocalPos = {
          x: dropGlobalPos.x - dropZoneGlobalPos.x,
          y: dropGlobalPos.y - dropZoneGlobalPos.y
        };
        log3('Dropable.onDrop(), dropGlobalPos:', dropGlobalPos);
        log3('Dropable.onDrop(), dropZoneGlobalPos:', dropZoneGlobalPos);
        log4('Dropable.onDrop(), dropLocalPos:', dropLocalPos);
        dropZoneObj.onDrop(event, dropLocalPos);
      }
      event.preventDefault(); // Prevent blocking dropzone!
      return false;
    }
  }


  attach() {
    // log('Dropable::attach()');
    const dropObj = this.hostObj;
    dropObj.eventListners.onDragEnter = this.onDragEnter.bind(this);
    dropObj.eventListners.onDragOver = this.onDragOver.bind(this);
    dropObj.eventListners.onDragLeave = this.onDragLeave.bind(this);
    dropObj.eventListners.onDrop = this.onDrop.bind(this);
    dropObj.el.addEventListener('dragenter', dropObj.eventListners.onDragStart);
    dropObj.el.addEventListener('dragover', dropObj.eventListners.onDragOver);
    dropObj.el.addEventListener('dragleave', dropObj.eventListners.onDragLeave);
    dropObj.el.addEventListener('drop', dropObj.eventListners.onDrop);
  }


  detach() {}

}
