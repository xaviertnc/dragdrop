/**
 * MapItem.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 09 Mar 2019
 *
 */

import { Draggable } from '../plugins/Draggable.js';
import { Component } from '../classes/Component.js';

const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * App Component
 * @class MapItem
 * @module MapItem
 */
export class MapItem extends Component {
  /**
   * Component constructor.
   * @constructs MapItem
   * @param {Component} parent - Item parent component
   * @param {Object} options - Item options
   */
  constructor(parent, options) {
    super(parent, options);

    /**
     * Map item data
     * @property data
     * @type {Object}
     */
    this.data = options.data || {};

    /**
     * The scale at which to display this item relative
     * to it's normal size (defined in the *data* object).
     * @property viewScale
     * @type {Float}
     */
    this.viewScale = options.viewScale || 1;

    /**
     * Item's application component
     * @property app
     * @type {Component}
     */
    this.app = this.rootParent;

    /**
     * Item DRAGGABLE STATE
     * @property draggable
     * @type {Boolean}
     */
    this.draggable = options.draggable ? true : false;

    if (this.draggable) {
      // Make this component DRAGGABLE!
      this.addPlugin(Draggable, options.drag);
    }

    // Construct / build-out the element HTML
    this.render();

    log4('MapItem::new()');
  }


  getViewX(scale) { return this.data.x * (scale || this.viewScale); }
  getViewY(scale) { return this.data.y * (scale || this.viewScale); }
  getViewW(scale) { return this.data.w * (scale || this.viewScale); }
  getViewH(scale) { return this.data.h * (scale || this.viewScale); }


  setDataX(dispX, scale) { this.data.x = dispX / (scale || this.viewScale); }
  setDataY(dispY, scale) { this.data.y = dispY / (scale || this.viewScale); }


  /**
   * Clone, scale and style this item's DOM element to make a drag ghost/image element.
   * @param  {Float} scale The scale of the clone relative to the original element
   * @param  {String} style Additional styling to position the clone for example.
   * @return {HTMLEntity} Scaled and styled clone of this item's DOM element
   */
  getDragImageElement(scale, style) {
    const ew = this.el.clientWidth ? this.el.clientWidth * scale : this.getViewW();
    const eh = this.el.clientHeight ? this.el.clientHeight * scale : this.getViewH();
    const imageElement = this.el.cloneNode(true); // true === Deep clone
    imageElement.style = `width:${ew}px;height:${eh}px;` + style;
    // Scale LABEL also ...
    imageElement.firstChild.style = `line-height:${eh}px;font-size:${Math.min(eh/2, 14)}px`;
    return imageElement;
  }


  render() {
    const vx = this.getViewX();
    const vy = this.getViewY();
    const vw = this.getViewW();
    const vh = this.getViewH();
    const label = document.createElement('label');
    label.innerHTML = this.data.id;
    label.style = `line-height:${vh}px;font-size:${Math.min(vh/2, 14)}px`;
    this.el.className = 'stand ' + this.data.type;
    this.el.style = `left:${vx}px;top:${vy}px;width:${vw}px;height:${vh}px;`;
    this.el.append(label);
    return this.el;
  }


  update(viewScale) {
    const vx = this.getViewX(viewScale);
    const vy = this.getViewY(viewScale);
    const vw = this.getViewW(viewScale);
    const vh = this.getViewH(viewScale);
    this.el.style = `left:${vx}px;top:${vy}px;width:${vw}px;height:${vh}px;`;
    this.el.firstChild.style = `line-height:${vh}px;font-size:${Math.min(vh/2, 14)}px`;
  }


  mount() {
    this.parent.el.append(this.el);
  }

}