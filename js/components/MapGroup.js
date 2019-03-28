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

    if (this.model && this.model.items) {
      this.children = this.model.items;
      this.children.forEach(child => child.parent = this);
    }

    log('MapGroup::new()');
  }


  getViewX(scale) { return Math.floor(this.topLeft.x * (scale || this.viewScale)); }
  getViewY(scale) { return Math.floor(this.topLeft.y * (scale || this.viewScale)); }
  getViewW(scale) { return Math.floor(this.width     * (scale || this.viewScale)); }
  getViewH(scale) { return Math.floor(this.height    * (scale || this.viewScale)); }


  setX(viewX, scale) { this.topLeft.x = Math.floor(viewX / (scale || this.viewScale)); }
  setY(viewY, scale) { this.topLeft.y = Math.floor(viewY / (scale || this.viewScale)); }


  getGroupBounds() {
    let top = 99999;
    let left = 99999;
    let bottom = -9999;
    let right = -9999;
    this.model.items.forEach(function(item) {
      let x, y;
      if (item.topLeft) {
        x = item.topLeft.x;
        y = item.topLeft.y;
      } else {
        x = item.x;
        y = item.y;
      }
      if (left > x) { left = x; }
      if (right < (x + item.width)) {
        right = x + item.width;
      }
      if (top > y) { top = y; }
      if (bottom < (y + item.height)) {
        bottom = y + item.height;
      }
    });
    this.width = right - left;
    this.height = bottom - top;
    this.topLeft = { y: top, x: left };
    this.bottomRight = { y: bottom, x: right };
  }


  deactivateChildItems() {
    this.children.forEach(child => child.deactivate());
  }


  normalizeChildPositions() {
    const group = this;
    this.children.forEach(function(child) {
      if (child.topLeft) {
        child.topLeft.x = child.topLeft.x - group.topLeft.x - 1;
        child.topLeft.y = child.topLeft.y - group.topLeft.y - 1;
      }
      else {
        child.x = child.x - group.topLeft.x - 1;
        child.y = child.y - group.topLeft.y - 1;
      }
    });
  }


  getGroup() {
    log('MapGroup::getGroup(), id:', this.id);
    return this.data.group ? this.groupsManager.findGroup(this.data.group) : null;
  }


  /**
   * Clone, scale and style this item's DOM element to make a drag ghost/image element.
   * @param  {Float} dropTargetScale The scale of the clone relative to the original element
   * @param  {String} style Additional styling to position the clone for example.
   * @return {HTMLEntity} Scaled and styled clone of this item's DOM element
   */
  getDragImageElement(dropTargetScale, style) {
    const ew = this.getViewW(dropTargetScale);
    const eh = this.getViewH(dropTargetScale);
    const dragImageElement = this.el.cloneNode(true); // true === Deep clone
    dragImageElement.id = 'dragImage';
    dragImageElement.classList.remove('draggable');
    dragImageElement.classList.add('dragImage');
    dragImageElement.removeAttribute('draggable');
    dragImageElement.style = `width:${ew}px;height:${eh}px;border-width:${dropTargetScale}px;` + style;
    return dragImageElement;
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


  update(viewScale) {
    log('MapGroup::update()');
    const vx = this.getViewX(viewScale);
    const vy = this.getViewY(viewScale);
    const vw = this.getViewW(viewScale);
    const vh = this.getViewH(viewScale);
    this.el.style = `left:${vx}px;top:${vy}px;width:${vw}px;height:${vh}px;border-width:${viewScale || this.viewScale}px;`;
    this.children.forEach(child => child.update(viewScale || this.viewScale));
  }


  render() {
    log('MapGroup::render()');
    this.el.classList.add('group');
    // this.el.innerHTML = this.id;
    this.update();
  }


  mount(mountElement) {
    log('MapGroup::mount(), id:', this.id, ', children:', this.children);
    this.children.forEach(child => child.mount());
    mountElement = mountElement || this.parent.el;
    mountElement.append(this.el);
  }


  dismount() {
    log4('MapGroup::dismount()');
    this.children.forEach(child => child.dismount());
    this.el.parentElement.removeChild(this.el);
  }


  deactivate() {
    this.removePlugin(Draggable).removePlugin(Groupable);
  }

}