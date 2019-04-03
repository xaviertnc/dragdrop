/**
 * LeftSidebar.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 07 Mar 2019
 *
 */

import { Component } from '../classes/Component.js';
import { MapItem } from '../components/MapItem.js';

const log  = window.__DEBUG_LEVEL__     ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};
const log5 = window.__DEBUG_LEVEL__ > 4 ? console.log : function(){};

export class LeftSidebar extends Component {
  /**
   * Component constructor.
   * @constructs LeftSidebar
   * @param {Component} parent - Parent component
   * @param {Object} options - LeftSidebar options
   */
  constructor(parent, options) {
    super(parent, options);

    /**
     * The scale at which to display all the map items
     * in this list.
     * @property itemsViewScale
     * @type {Float}
     */
    this.itemsViewScale = options.itemsViewScale || 2;

    /**
     * This component's root/application component
     * @property app
     * @type {Component}
     */
    this.app = this.rootParent;

    // Add some EXTRA map items! (for DEV only)
    let type = 'Maker4x4';
    const items = options.items || [];
    const types = ['Junior4x4', 'Kos4x4', 'Snuffel4x4', 'Opvoedkunde4x4', 'Tema4x4', 'Maker4x4'];
    for (let i=21; i<380; i++) {
      if (Math.random() > 0.96) {
        type = types[Math.floor(Math.random() * 6)];
      }
      const item = {
        id: i,
        type: type,
        x: 0,
        y: 0,
        z: 0,
        w: 16,
        h: 16,
        angle: 0,
        layer: 'base',
        group: 1,
        data: {}
      };
      items.push(item);
    }

    // Create and Add items as child components
    for (let i in  items) {
      let item = items[i];
      this.addMapItem(item);
    }

    // Build-out the HTML element
    this.render();

    log5('LeftSidebar::new(),', this);
  }


  getItemDragImageScale() {
    const mapItem = this;
    const itemScale = mapItem.app.map.viewScale;
    // log('LeftSidebar::getItemDragImageScale(),', itemScale);
    return itemScale;
  }


  /**
   * Dynamically calculate the ratio between the size of the drag image
   * and the actual HTML element size.
   * @return {Float} Drag image scale based on current map and item scales.
   */
  getItemDragImageRelativeSize() {
    const mapItem = this;
    const mapScale = mapItem.app.map.viewScale;
    const sidebarScale = mapItem.app.leftSidebar.itemsViewScale;
    // log('LeftSidebar::getItemDragImageRelativeSize(), mapScale:', mapScale);
    // log('LeftSidebar::getItemDragImageRelativeSize(), sidebarScale:', sidebarScale);
    const relSize = mapScale / sidebarScale;
    // log('LeftSidebar::getItemDragImageRelativeSize(),', relSize);
    return relSize;
  }


  /**
   * Create a new MapItem from "mapItemData" and add it as a child component
   */
  addMapItem(mapItemData) {
    const itemOptions = {
      draggable: true,
      getDragImageScale : this.getItemDragImageScale,
      getDragImageRelativeSize : this.getItemDragImageRelativeSize,
      viewScale: this.itemsViewScale,
      data: mapItemData
    };
    this.addChild(MapItem, itemOptions);
  }


  /**
   * Render component inner HTML
   */
  render() {
    const label = document.createElement('h3');
    label.innerHTML = 'Left Sidebar';
    const listbox = document.createElement('div');
    listbox.id = 'left-listbox';
    listbox.className = 'scrollbox';
    this.elListbox = listbox;
    this.el.append(label);
    this.el.append(listbox);
    for (let i=0; i < this.children.length; i++) {
      let child = this.children[i];
      child.mount(listbox);
    }
    log4('LeftSidebar::render(), el:', this.el);
  }


  /**
   * Mount component content
   */
  mount() {
    throw new Error('LeftSidebar::mount(), Not required. Part of page template!');
  }

}