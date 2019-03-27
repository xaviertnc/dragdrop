/**
 * MapGroup.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 24 Mar 2019
 *
 */

import { Groupable } from '../plugins/Groupable.js';
import { Draggable } from '../plugins/Draggable.js';
import { Component } from '../classes/Component.js';

const log  = window.__DEBUG_LEVEL__     ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * App Component
 * @class MapGroup
 * @module MapGroup
 */
export class MapGroup extends Component {
  /**
   * Component constructor.
   * @constructs MapGroup
   * @param {Component} parent - Item parent component
   * @param {Object} options - Item options
   */
  constructor(parent, options) {
    super(parent, options);

    /**
     * Map group model object.
     * @property model
     * @type {Object}
     */
    this.model = options.model || {};

    /**
     * Map group data object.
     * @property model
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

    // NOTE: Defaults for debug puposes at the moment...
    this.width = options.width || 100;
    this.height = options.height || 100;

    // NOTE: Defaults for debug puposes at the moment...
    this.topLeft = {
      x: options.x || 100,
      y: options.y || 100
    };

    this.bottomRight = {
      x: this.topLeft.x + this.width,
      y: this.topLeft.y + this.height
    };

    log('MapGroup::new()');
  }


  getViewX(scale) { return this.topLeft.x * (scale || this.viewScale); }
  getViewY(scale) { return this.topLeft.y * (scale || this.viewScale); }
  getViewW(scale) { return this.width     * (scale || this.viewScale); }
  getViewH(scale) { return this.height    * (scale || this.viewScale); }


  setX(viewX, scale) { this.x = viewX / (scale || this.viewScale); }
  setY(viewY, scale) { this.y = viewY / (scale || this.viewScale); }


  getBounds() {
    let top = 99999;
    let left = 99999;
    let bottom = -1;
    let right = -1;
    this.model.items.forEach(function(item) {
      if (left > item.x) { left = item.x; }
      if (right < (item.x + item.width)) {
        right = item.x + item.width;
      }
      if (top > item.y) { top = item.y; }
      if (bottom < (item.y + item.height)) {
        bottom = item.y + item.height;
      }
    });
    this.width = right - left;
    this.height = bottom - top;
    this.topLeft = { y: top, x: left };
    this.bottomRight = { y: bottom, x: right };
  }


  normalizeChildPositions() {
    const group = this;
    this.children.forEach(function(child) {
      child.x = child.x - group.topLeft.x;
      child.y = child.y - group.topLeft.y;
      child.update();
    });
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
    log4('MapGroup::onSelect(),', event);
    this.el.classList.add('selected');
    this.selected = true;
  }


  onUnselect(event) {
    log4('MapGroup::onUnselect(),', event);
    this.el.classList.remove('selected');
    this.selected = false;
  }


  onClick(event) {
    const SHIFT = this.app.keyboard.get('SHIFT');
    log4('MapGroup::onClick(), item.selected:', this.selected, ', SHIFT.isDown:', SHIFT.isDown);
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


  addChild(childClass, childOptions) {
    const child = super.addChild(childClass, childOptions);
    child.mount();
    return child;
  }


  // onDragStart(event) {
  //   log('MapGroup::onDragStart(), id:', this.id, ', group:', this.group);
  // }


  // onDrag(event) {
  //   log('MapGroup::onDrag(), id:', this.id, ', group:', this.group.id);
  // }


  render() {
    log('MapGroup::render()');
    this.el.classList.add('group');
    this.el.innerHTML = this.id;
    this.update();
  }


  update(viewScale) {
    log('MapGroup::update()');
    const vx = this.getViewX(viewScale);
    const vy = this.getViewY(viewScale);
    const vw = this.getViewW(viewScale);
    const vh = this.getViewH(viewScale);
    this.el.style = `left:${vx}px;top:${vy}px;;width:${vw}px;height:${vh}px;`;
  }


  mount(mountElement) {
    log('MapGroup::mount(), id:', this.id, ', children:', this.children);
    this.children.forEach(child => child.mount());
    mountElement = mountElement || this.parent.el;
    mountElement.append(this.el);
  }


  dismount() {
    log('MapGroup::dismount()');
    this.children.forEach(child => child.dismount());
    this.el.parentElement.removeChild(this.el);
  }

}