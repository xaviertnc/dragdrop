/**
 * MapItem.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 09 Mar 2019
 *
 */

import { Groupable } from '../plugins/Groupable.js';
import { Draggable } from '../plugins/Draggable.js';
import { Component } from '../classes/Component.js';

const log  = window.__DEBUG_LEVEL__     ? console.log : function(){};
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
  constructor(parent, options = {}) {

    // log('MapItem::new(), parent:', parent);
    // log('MapItem::new(), options:', options);

    options.id = 'item' + options.data.id;

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

    // Make this item DRAGGABLE!
    if (options.draggable) {
      this.addPlugin(Draggable, options.draggable);
    }

    // Make this item GROUPABLE!
    if (options.groupsManager) {
      this.groupsManager = options.groupsManager;
      this.addPlugin(Groupable);
    }

    this.x = this.data.x;
    this.y = this.data.y;
    this.z = this.data.z;

    this.width = this.data.w;
    this.height = this.data.h;

    // Construct / build-out the element HTML
    this.render();

    log4('MapItem::new()');
  }


  getViewX(scale) { return this.x      * (scale || this.viewScale); }
  getViewY(scale) { return this.y      * (scale || this.viewScale); }
  getViewW(scale) { return this.width  * (scale || this.viewScale); }
  getViewH(scale) { return this.height * (scale || this.viewScale); }


  setX(viewX, scale) { this.x = viewX / (scale || this.viewScale); }
  setY(viewY, scale) { this.y = viewY / (scale || this.viewScale); }


  getGroup() {
    log4('MapItem::getGroup(), this:', this);
    return this.data.group ? this.groupsManager.findGroup(this.data.group) : null;
  }


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


  onSelect(event) {
    log4('MapItem::onSelect(),', event);
    this.el.classList.add('selected');
    this.selected = true;
  }


  onUnselect(event) {
    log4('MapItem::onUnselect(),', event);
    this.el.classList.remove('selected');
    this.selected = false;
  }


  onClick(event) {
    const SHIFT = this.app.keyboard.get('SHIFT');
    log4('MapItem::onClick(), item.selected:', this.selected, ', SHIFT.isDown:', SHIFT.isDown);
    if (SHIFT.isDown) {
      if (this.selected) {
        if (this.group) { this.group.unselectItems(this, event); }
        else { this.groupsManager.removeSelectedItem(this, event); }
      }
      else {
        if (this.group) { this.group.selectItems(this, event); }
        else { this.groupsManager.addSelectedItem(this, event); }
      }
    }
    return true;
  }


  // onDragStart(event) {
  //   log('MapItem::onDragStart(), id:', this.id, ', group:', this.group);
  // }


  // onDrag(event) {
  //   log('MapItem::onDrag(), id:', this.id, ', group:', this.group.id);
  // }


  render() {
    const vx = this.getViewX();
    const vy = this.getViewY();
    const vw = this.getViewW();
    const vh = this.getViewH();
    const label = document.createElement('label');
    label.innerHTML = this.data.id;
    label.style = `line-height:${vh}px;font-size:${Math.min(vh/2, 14)}px`;
    this.el.classList.add('stand', this.data.type);
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


  mount(mountElement) {
    // log('MapItem::mount(), id:', this.id, ', this.parent.el:', this.parent.el);
    mountElement = mountElement || this.parent.el;
    mountElement.append(this.el);
  }


  deactivate() {
    this.removePlugin(Draggable).removePlugin(Groupable);
  }

}