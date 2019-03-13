/**
 * Draggable.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 09 Mar 2019
 *
 */

import { Plugin } from '../classes/Plugin.js';

const log2 = window.__DEBUG_LEVEL__ === 2 ? console.log : function(){};
const log3 = window.__DEBUG_LEVEL__ > 2 ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * Draggable plugin
 * @class Draggable
 * @module Draggable
 */
export class Draggable extends Plugin {
  /**
   * Plugin constructor.
   * @constructs Draggable
   * @param {Component} hostObj Host component to apply plugin to.
   * @param {Object} options Plugin initial configuration.
   */
  constructor(hostObj, options) {
    super('draggable', hostObj, options);
  }


  /**
   * Configure plugin with custom options
   * @param {Object} options Plugin custom configuration.
   */
  init(options) {
    /**
     * Scale of the drag "ghost image" relative
     * to the actual drag element.
     * @property dragImageScale
     * @type {Float}
     */
    this.dragImageScale = options.dragImageScale || 1;

    if (options.getDragImageScale) {
      /**
       * Custom / dynamic ghost image scale function.
       * @method getDragImageScale
       * @return {Float} Ghost image scale relative to the drag element size.
       */
      this.getDragImageScale = options.getDragImageScale;
    }

    if (options.getDragImageElement) {
      /**
       * Custom / dynamic ghost image element generator function.
       * @method getDragImageElement
       * @return {HTMLEntity} Drag ghost image element.
       */
      this.getDragImageElement = options.getDragImageElement;
    }

    /**
     * Confirms that we want to create a drag "ghost" image
     * everytime we drag.
     * @property useCustomDragImage
     * @type {Boolean}
     */
    this.useCustomDragImage = options.useCustomDragImage
      || this.getDragImageElement
      || this.dragImageScale;
  }


  _getDragObjId(drgObj) {
    return this.getDragObjId ? this.getDragObjId(drgObj) : drgObj.id;
  }


  _getDragObjData(drgObj) {
    return this.getDragObjData ? this.getDragObjData(drgObj) : drgObj.data;
  }


  /**
   * Get the scale of the drag "ghost image" relative
   * to the drag element's actual size.
   * @private function
   * @return {Float}
   */
  _getDragImageScale() {
    return this.getDragImageScale ? this.getDragImageScale() : this.dragImageScale;
  }


  /**
   * Get the element to use as template for the drag image
   * ...scaled correctly and positioned out of sight ...
   * @param  {Object} options e.g. { scale: 0.5, style: 'color:red;' }
   * @return {HTMLEntity} Drag image DOM element
   */
  _getDragImageElement(options = {}) {
    if (this.getDragImageElement) {
      // Providing your own drag element generator is HIGHLY recommended!
      return this.getDragImageElement(options);
    }
    if ( ! this.hostObj.el) {
      throw new Error('Draggable::_getDragImageElement(), DOM element is required!');
    }
    // NOTE: Pretty useless general case / fallback code follows.
    // Since we need overly involved logic to analyse the dragged element's structure
    // and come up with a decently scaled clone, we will keep it simple and assume that
    // the element has NO children!
    const drgObj = this.hostObj;
    const dragImageScale = options.scale || this._getDragImageScale();
    const dragImageElementStyle = options.style || 'position:absolute;left:-99999px';
    const dragImageElement = drgObj.el.cloneNode(true);
    const w = drgObj.el.clientWidth * dragImageScale;
    const h = drgObj.el.clientHeight * dragImageScale;
    dragImageElement.style = `width:${w}px;height:${h}px;` + dragImageElementStyle;
    return dragImageElement;
  }


  getEventGlobalPos(event) {
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


  onDragStart(event) {
    log2('Draggable.onDragStart(),', event);
    const drgObj = this.hostObj;
    const dragObjId = this._getDragObjId(drgObj);
    const dragObjData = this._getDragObjData(drgObj);
    const dragImageScale = this._getDragImageScale();
    const dragStartGlobalPos = this.getEventGlobalPos(event);
    const dragElementGlobalPos = this.getElementGlobalPos(drgObj.el);
    const dragPointerOffset = {
      x : (dragStartGlobalPos.x - dragElementGlobalPos.x),
      y : (dragStartGlobalPos.y - dragElementGlobalPos.y)
    };
    event.dataTransfer.setData('text', JSON.stringify({
      id: dragObjId,
      dragObjData: dragObjData,
      pointerOffset: dragPointerOffset,
      dragImageScale: dragImageScale
    }));
    if (this.useCustomDragImage) {
      const dragImageElement = this._getDragImageElement();
      drgObj.el.append(dragImageElement); // Remove again in "onDragEnd"
      event.dataTransfer.setDragImage(
        dragImageElement,
        dragPointerOffset.x * dragImageScale,
        dragPointerOffset.y * dragImageScale
      );
      drgObj.dragImageElement = dragImageElement;
    }
    if (drgObj.onDragStart) { drgObj.onDragStart(event); }
    log3('Draggable.onDragStart(), dragObjId', dragObjId);
    log3('Draggable.onDragStart(), dragObjData', dragObjData);
    log4('Draggable.onDragStart(), dragStartGlobalPos', dragStartGlobalPos);
    log4('Draggable.onDragStart(), dragElementGlobalPos', dragElementGlobalPos);
    log4('Draggable.onDragStart(), dragPointerOffset', dragPointerOffset);
  }


  onDrag(event) {
    log4('Draggable.onDrag()');
    if (this.hostObj.onDrag) { this.hostObj.onDrag(event); }
  }


  onDragEnd(event) {
    log2('Draggable.onDragEnd()');
    const drgObj = this.hostObj;
    if (drgObj.dragImageElement) {
      drgObj.dragImageElement.parentElement.removeChild(drgObj.dragImageElement);
    }
    if (drgObj.onDragEnd) { drgObj.onDragEnd(event); }
  }


  attach() {
    // log('Draggable::attach()');
    const drgObj = this.hostObj;
    drgObj.el.setAttribute('draggable', true);
    drgObj.eventListners.onDragStart = this.onDragStart.bind(this);
    drgObj.eventListners.onDrag = this.onDrag.bind(this);
    drgObj.eventListners.onDragEnd = this.onDragEnd.bind(this);
    drgObj.el.addEventListener('dragstart', drgObj.eventListners.onDragStart);
    drgObj.el.addEventListener('drag', drgObj.eventListners.onDrag);
    drgObj.el.addEventListener('dragend', drgObj.eventListners.onDragEnd);
  }


  detach() {}

}
