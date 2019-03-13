/**
 * UnplacedItemsList.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 07 Mar 2019
 *
 */

import { Component } from '../classes/Component.js';
import { MapItem } from '../components/MapItem.js';

const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};
const log5 = window.__DEBUG_LEVEL__ > 4 ? console.log : function(){};

export class UnplacedItemsList extends Component {
  /**
   * Component constructor.
   * @constructs UnplacedItemsList
   * @param {Component} parent - Parent component
   * @param {Object} options - UnplacedItemsList options
   */
  constructor(parent, options) {
    super(parent, options);

    /**
     * The scale at which to display all the map items
     * in this list.
     * @property itemsViewScale
     * @type {Float}
     */
    this.itemsViewScale = options.itemsViewScale || 1.67;

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
    for (let i=18; i<380; i++) {
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

    log5('UnplacedItemsList::new(),', this);
  }


  /**
   * Dynamically calculate the scale of an unplaced item's drag image
   * @return {Float} Drag image scale based on current map and item scales.
   */
  getItemDragImageScale() {
    const mapItem = this.hostObj; // Draggable Plugin HOST
    return mapItem.app.map.scale / mapItem.parent.itemsViewScale;
  }


  /**
   * Clone, scale and style a mapItem's DOM element to make a drag ghost/image element.
   * @param  {Object} options E.g { scale: 0.5, style: 'color:red' }
   * @return {HTMLEntity} A scaled and styled clone of the mapItem's DOM element
   */
  getItemDragImageElement(options = {}) {
    const mapItem = this.hostObj; // Draggable Plugin HOST
    if ( ! mapItem.el) { return; }
    const dragImageScale = options.scale || this._getDragImageScale();
    const dragImageElementStyle = options.style || 'position:absolute;left:-99999px';
    const dragImageElement = mapItem.getDragImageElement(dragImageScale, dragImageElementStyle);
    return dragImageElement;
  }


  /**
   * Create a new MapItem from "mapItemData" and add it as a child component
   */
  addMapItem(mapItemData) {
    const itemOptions = {
      id        : 'item' + mapItemData.id,
      viewScale : this.itemsViewScale,
      data      : mapItemData,
      draggable : true,
      drag      : { // Configure Draggable plugin on this item...
        getDragImageScale   : this.getItemDragImageScale,
        getDragImageElement : this.getItemDragImageElement
      }
    };
    this.addChild(MapItem, itemOptions);
  }


  /**
   * Render component inner HTML
   */
  render() {
    for (let i=0; i < this.children.length; i++) {
      let child = this.children[i];
      child.mount();
    }
    log4('UnplacedItemsList::render(), el:', this.el);
  }


  /**
   * Mount component content
   */
  mount() {
    throw new Error('UnplacedItemsList::mount(), Not required. Part of page template!');
  }

}