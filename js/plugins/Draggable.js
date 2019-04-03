/**
 * Draggable.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 09 Mar 2019
 *
 */

import { Plugin } from '../classes/Plugin.js';

const log  = window.__DEBUG_LEVEL__ ? console.log : function(){};
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
  init() { /* Do nothing */ }


  getDragObjId(drgObj) {
    return drgObj.getDragObjId
      ? drgObj.getDragObjId()
      : drgObj.id;
  }


  getDragObjData(drgObj) {
    return drgObj.getDragObjData
      ? drgObj.getDragObjData()
      : drgObj.data;
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

    if (drgObj.canDrag && !drgObj.canDrag(event)) {
      return; // Exit if we're not allowed to drag.
    }

    const dragObjId = this.getDragObjId(drgObj);
    const dragObjData = this.getDragObjData(drgObj);
    const dragStartGlobalPos = this.getEventGlobalPos(event);
    const dragElementGlobalPos = this.getElementGlobalPos(drgObj.el);

    const dragPointerOffset = {
      x : (dragStartGlobalPos.x - dragElementGlobalPos.x),
      y : (dragStartGlobalPos.y - dragElementGlobalPos.y)
    };

    let dragImageScale = 1;
    let dragImageRelativeSize = 1;

    if (drgObj.getDragImageScale) {
      dragImageScale = drgObj.getDragImageScale();
    }

    if (drgObj.getDragImageRelativeSize) {
      dragImageRelativeSize = drgObj.getDragImageRelativeSize();
    }

    event.dataTransfer.setData('text', JSON.stringify({
      id: dragObjId,
      dragObjData: dragObjData,
      dragImageScale: dragImageScale,
      dragImageRelativeSize: dragImageRelativeSize,
      pointerOffset: dragPointerOffset
    }));

    // Only set a custom drag image if we need to.
    // log('Draggable.onDragStart(), drgObj.useCustomDragImage:', drgObj.useCustomDragImage);
    if (drgObj.useCustomDragImage)
    {

      const dragImageElement = drgObj.getDragImageElement(dragImageScale);

      const dragImageOffset = {
        x: dragPointerOffset.x * dragImageRelativeSize,
        y: dragPointerOffset.y * dragImageRelativeSize
      };

      event.dataTransfer.setDragImage(
        dragImageElement,
        dragImageOffset.x,
        dragImageOffset.y
      );

      drgObj.el.append(dragImageElement); // Remove again in "onDragEnd"

      drgObj.dragImageElement = dragImageElement;
    }

    if (drgObj.onDragStart) {
      drgObj.onDragStart(event);
    }

    // log('Draggable.onDragStart(), dragObjId', dragObjId);
    // log3('Draggable.onDragStart(), dragObjData', dragObjData);
    // log4('Draggable.onDragStart(), dragStartGlobalPos', dragStartGlobalPos);
    // log4('Draggable.onDragStart(), dragElementGlobalPos', dragElementGlobalPos);
    // log('Draggable.onDragStart(), dragPointerOffset', dragPointerOffset);
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
      if (drgObj.onDragEnd) { drgObj.onDragEnd(event); }
      delete drgObj.dragImageElement;
    } else {
      if (drgObj.onDragEnd) { drgObj.onDragEnd(event); }
    }
  }


  attach() {
    // log('Draggable::attach()');
    const drgObj = this.hostObj;
    drgObj.el.classList.add('draggable');
    drgObj.el.setAttribute('draggable', true);
    drgObj.eventListners.onDragStart = this.onDragStart.bind(this);
    drgObj.eventListners.onDragEnd = this.onDragEnd.bind(this);
    drgObj.eventListners.onDrag = this.onDrag.bind(this);
    drgObj.el.addEventListener('dragstart', drgObj.eventListners.onDragStart);
    drgObj.el.addEventListener('dragend', drgObj.eventListners.onDragEnd);
    drgObj.el.addEventListener('drag', drgObj.eventListners.onDrag);
    drgObj.draggable = this;
  }


  detach() {
    log4('Draggable::detach()');
    const hostObj = this.hostObj;
    hostObj.el.removeAttribute('draggable');
    hostObj.el.classList.remove('draggable');
    hostObj.el.removeEventListener('drag', hostObj.eventListners.onDrag);
    hostObj.el.removeEventListener('dragend', hostObj.eventListners.onDragEnd);
    hostObj.el.removeEventListener('dragstart', hostObj.eventListners.onDragStart);
    delete hostObj.draggable;
    delete hostObj.eventListners.onDragEnd;
    delete hostObj.eventListners.onDragStart;
    delete hostObj.eventListners.onDrag;
  }

}
