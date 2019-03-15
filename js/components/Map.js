/**
 * Map.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 10 Mar 2019
 *
 */

import { Dropable  } from '../plugins/Dropable.js';
import { Component } from '../classes/Component.js';
import { MapItem   } from '../components/MapItem.js';

const log3 = window.__DEBUG_LEVEL__ > 2 ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};
const log5 = window.__DEBUG_LEVEL__ > 4 ? console.log : function(){};

export class Map extends Component {
  /**
   * Map component constructor.
   * @constructs Map
   * @param {Component} parent - Parent component
   * @param {Object} options - Map options
   */
  constructor(parent, options) {
    super(parent, options);

    /**
     * The scale at which the background image and map content will be displayed.
     * @property scale
     * @type {Float}
     */
    this.scale = options.scale || 1;

    /**
     * The actual width of the image used for the map background
     * @property imageWidth
     * @type {Integer}
     */
    this.imageWidth  = options.imageWidth  || 1276; // px

    /**
     * The actual height of the image used for the map background
     * @property imageHeight
     * @type {Integer}
     */
    this.imageHeight = options.imageHeight || 1131; // px

    /**
     * This component's root/application component
     * @property app
     * @type {Component}
     */
    this.app = this.rootParent;

    // Create and Add items as child components
    for (let i in  options.items || []) {
      this.addMapItem(options.items[i]);
    }

    // Make this map droppable (i.e. a DROPZONE)
    this.addPlugin(Dropable);

    // Build-out the HTML element
    this.render();

    log5('Map::new()', this);
  }


  getWidth() {
    return this.imageWidth * this.scale;
  }


  getHeight() {
    return this.imageHeight * this.scale;
  }


  /**
   * Get the scale of the drag ghost/image element (relative
   * to the size of the draggable element) when we drag
   * elements on this map.
   * @return {Float} Drag image scale
   */
  getItemDragImageScale() {
    return 1;
  }


  zoomIn() {
    if (this.scale === 1) { this.update(2); }
    else this.update(4);
  }


  zoomOut() {
    if (this.scale === 4) { this.update(2); }
    else { this.update(1); }
  }


  /**
   * Create a new MapItem from "mapItemData" and add as child
   * @param {Object} mapItemData
   */
  addMapItem(mapItemData) {
    let options = {};
    options.draggable = true;
    options.data = mapItemData;
    options.viewScale = this.scale;
    options.id = 'item' + mapItemData.id;
    return this.addChild(MapItem, options);
  }


  /**
   * Render the Map inner HTML
   */
  render() {
    this.el.style = `width:${this.getWidth()}px;height:${this.getHeight()}px`;
    for (let i=0; i < this.children.length; i++) {
      let child = this.children[i];
      child.mount();
    }
    log4('Map::render(), el:', this.el);
  }


  /**
   * Update / redraw the Map and it's items.
   * @param  {Float} scale Map display scale
   */
  update(scale) {
    log3('Map::update(), scale:', scale);
    if (scale === this.scale) { return; }
    this.scale = scale;
    this.el.style = `width:${this.getWidth()}px;height:${this.getHeight()}px`;
    for (let i=0; i < this.children.length; i++) {
      let child = this.children[i];
      child.update(scale);
    }
  }


  /**
   * Mount component content
   */
  mount() {
    throw new Error('Map::mount(), Not required. Part of page template!');
  }


  /**
   * Map ON DROP event handler
   * @param  {DOMEvent} event  DOM "ondrop" event
   * @param  {Object} dropPos Drop position on map in map local x,y
   */
  onDrop(event, dropPos) {
    const jsonString = event.dataTransfer.getData('text');
    const dragData = JSON.parse(jsonString);
    // let mapItemData = dragData.dragObjData;
    log4('Map::onDrop(), this:', this);
    log3('Map::onDrop(), dropLocalPos:', dropPos);
    log3('Map::onDrop(), dragData:', dragData);
    // Adjust the original pointer offset to the current scale of the drag image...
    let mapItem = this.findChild(dragData.id);
    log4('Map::onDrop(), mapItem1:', mapItem);
    const unplaced = mapItem ? false : true;
    if (unplaced) {
      mapItem = this.app.leftSidebar.findChild(dragData.id);
    }
    log4('Map::onDrop(), mapItem2:', mapItem);
    const itemLeftOffset = dragData.pointerOffset.x * dragData.dragImageScale;
    const itemTopOffset = dragData.pointerOffset.y * dragData.dragImageScale;
    // Place the item's top-left corner back and up from the drop position.
    // Back it up by the offset between the drag image top-left and the drag pointer.
    // Since we are setting item DATA values, we need to also scale the x and y values
    // back to their x1 (base scale) values.
    mapItem.setDataX(dropPos.x - itemLeftOffset, this.scale);
    mapItem.setDataY(dropPos.y - itemTopOffset, this.scale);
    mapItem.viewScale = this.scale; //dragData.dragImageScale * this.app.unplaced.itemsViewScale;
    mapItem.findPlugin('draggable').reconfigure({
      getDragImageScale: this.getItemDragImageScale
    });
    if (unplaced) {
      mapItem.parent.removeChild(mapItem);
      mapItem.parent = this;
      this.children.push(mapItem);
      mapItem.update();
      mapItem.mount();
    }
    else {
      mapItem.update();
    }
  }


  // canDrop(event) {
  //   log('Map::canDrop(),', event);
  //   return true;
  // }

}