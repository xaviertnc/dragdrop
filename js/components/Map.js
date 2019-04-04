/**
 * Map.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 10 Mar 2019
 *
 */

import { Dropable      } from '../plugins/Dropable.js';
import { BoxSelect     } from '../plugins/BoxSelect.js';
import { Groupable     } from '../plugins/Groupable.js';
import { GroupsManager } from '../plugins/GroupsManager.js';

import { Component } from '../classes/Component.js';

import { MapItem   } from '../components/MapItem.js';
import { MapGroup  } from '../components/MapGroup.js';

const log  = window.__DEBUG_LEVEL__     ? console.log : function(){};
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
     * @property viewScale
     * @type {Float}
     */
    this.viewScale = options.viewScale || 1;

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

    // Make this map droppable (i.e. a DROPZONE)
    this.addPlugin(Dropable);

    // Add Box Select capability
    this.addPlugin(BoxSelect);

    // Add Groups Management capability
    this.addPlugin(GroupsManager, { nextId: options.nextGroupId });

    /**
     * Current item's group id / name
     * @type {String}
     */
    let groupId;

    /**
     * The last map item's group id / name.
     * Used to detect if the group id changed.
     * @type {String}
     */
    let lastGroupId;

    /**
     * Holds the COLLECTION OBJECT the CURRENT ITEM belongs to.
     * @type {Group|Class} Group instance
     */
    let itemsCollection;

    /**
     * Holds the GROUP VIEW COMPONENT the CURRENT ITEM belongs to.
     * @type {MapGroup|Component}
     */
    let mapGroupViewComponent;

    /**
     * The CURRENT ITEM's VIEW COMPONENT.
     * @type {MapItem|Component}
     */
    let mapItemViewComponent;

    /**
     * The CURRENT ITEM's STORED STATE / DATA.
     * @type {Object}
     */
    let itemData;

    /**
     * A collection of all the newly add MAP GROUP COMPONENTS.
     * @type {Array}
     */
    const mapGroupComponents = [];

    /**
     * ==========================
     * ADD STORED / INITIAL ITEMS
     * ==========================
     * Strucutre:
     *   - Group (Object / Groupable Objects Collection Model)
     *   - GroupsManager (Plugin|Trait / Group Objects Collection Model)
     *   - Map (ViewModel / Component)
     *   - Map.el (View)
     *   - - MapGroup (ViewModel / Component)
     *   - - MapGroup.el (View)
     *   - - - MapItem (ViewModel / Component)
     *   - - - MapItem.el (View)
     */
    for (let i in  options.items || [])
    {

      itemData = options.items[i];

      groupId = itemData.group;

      // ----------
      // GROUP ITEM
      // ----------
      if (groupId.length) {

        // Prevent re-fetching or adding the group model and component
        // if we are referencing the same model and component as last time.
        if ( ! itemsCollection || groupId !== lastGroupId)
        {
          itemsCollection = this.groupsManager.findGroup(groupId);
          if ( ! itemsCollection) {
            itemsCollection = this.groupsManager.addGroup(groupId);
            // ADD NEW MAP GROUP COMPONENT!!!
            mapGroupViewComponent = this.addMapItem({
              data  : { type: 'Group'},
              model : itemsCollection
            });
            mapGroupComponents.push(mapGroupViewComponent);
          }
          lastGroupId = groupId;
        }

        // NOTE: addChild() AUTO MOUNTS the child element.
        mapItemViewComponent = mapGroupViewComponent.addChild(MapItem, {
          viewScale     : this.viewScale,
          groupsManager : this.groupsManager,
          // draggable  : { canDrag: this.canDragItem.bind(this) },
          data          : itemData
        });

        itemsCollection.addItem(mapItemViewComponent);
      }

      // -----------------------
      // NO GROUP: JUST ADD ITEM
      // -----------------------
      else {
        this.addMapItem({ data: itemData });
      }

    } // end: Loop through stored / initial map items.


    mapGroupComponents.forEach(mapGroupViewComponent => {
      mapGroupViewComponent.getGroupBounds();
      mapGroupViewComponent.normalizeChildPositions();
      mapGroupViewComponent.render();
    });


    // Build-out the HTML element
    this.render();

    log5('Map::new()', this);
  }


  /**
   * Called by Draggable plugin in `onDragStart` event
   * @param  {HTMLEvent} event DragStart event
   * @return {Boolean}  Yes / No
   */
  canDragItem(event) {
    log4('Map::canDragItem(), event:', event);
    const mapItem = this;
    const canDrag = ! mapItem.app.keyboard.get('SHIFT').isDown;
    log4('Map::canDrag(),', canDrag);
    return canDrag;
  }


  /**
   * Called by BoxSelect plugin in `onMouseDown` event
   * @param  {HTMLEvent} event MouseDown event
   * @return {Boolean}  Yes / No
   */
  canBoxSelect(event) {
    log4('Map::canBoxSelect(), event:', event);
    const mapItem = this;
    const canSelect = mapItem.app.keyboard.get('SHIFT').isDown;
    log4('Map::canBoxSelect(),', canSelect);
    return canSelect;
  }


  getItemDragImageScale() {
    const mapItem = this;
    const itemScale = mapItem.app.map.viewScale;
    // log('Map::getItemDragImageScale(),', itemScale);
    return itemScale;
  }


  /**
   * Dynamically calculate the ratio between the size of the drag image
   * and the actual HTML drag element size.
   * @return {Float} Drag image scale based on current map and item scales.
   */
  getItemDragImageRelativeSize() {
    // log('Map::getItemDragImageRelativeSize(),', 1);
    return 1;
  }


  getWidth() {
    return this.imageWidth * this.viewScale;
  }


  getHeight() {
    return this.imageHeight * this.viewScale;
  }


  getGroupItems() {
    return this.children.filter(child => child.data.type === 'Group');
  }


  zoomIn() {
    if (this.viewScale === 1) { this.update(2); }
    else this.update(4);
  }


  zoomOut() {
    if (this.viewScale === 4) { this.update(2); }
    else { this.update(1); }
  }


  /**
   * Create a new MapItem Component based on the contents of `params`
   * @param {Object} e.g. { data: {...}, model: {...} }
   * @return {MapItem|MapGroup|Component} The new map child component
   */
  addMapItem(params = {}) {
    // ADD GROUP MAP ITEM
    const itemOptions = {
      draggable                 : true,
      canDrag                   : this.canDragItem,
      getDragImageScale         : this.getItemDragImageScale,
      getDragImageRelativeSize  : this.getItemDragImageRelativeSize,
      groupsManager             : this.groupsManager,
      viewScale                 : this.viewScale,
      model                     : params.model,
      data                      : params.data
    };
    return params.data.type === 'Group'
      ? this.addChild(MapGroup, itemOptions)
      : this.addChild(MapItem, itemOptions);
  }


  groupSelectedItems() {
    log('Map::groupSelectedItems()');
    const itemsCollection = this.groupsManager.groupSelectedItems();
    if (itemsCollection) {
      this.groupsManager.clearSelection();
      this.removeChildren(itemsCollection.items, false); // Don't "auto dismount" items!
      const mapGroupViewComponent = this.addMapItem({
        data  : { type: 'Group' },
        model : itemsCollection
      });
      mapGroupViewComponent.getGroupBounds();
      mapGroupViewComponent.deactivateChildItems();
      mapGroupViewComponent.normalizeChildPositions();
      mapGroupViewComponent.render();
      mapGroupViewComponent.mount();
    }
    log('Map::groupSelectedItems(), itemsCollection:', itemsCollection);
  }


  ungroupSelectedItems() {

  }


  /**
   * Render the Map inner HTML + Mounts child components
   */
  render() {
    this.el.style = `width:${this.getWidth()}px;height:${this.getHeight()}px`;
    this.children.forEach(child => child.mount());
    log4('Map::render(), el:', this.el);
  }


  /**
   * Update / redraw the Map and it's items.
   * @param  {Float} viewScale Map display scale
   */
  update(viewScale) {
    log3('Map::update(), viewScale:', viewScale);

    if (viewScale === this.viewScale) { return; }

    const elScrollbox = this.el.parentElement;
    // log('Map::update(), elScrollbox:', elScrollbox);

    const sbx = {};
    sbx.top = elScrollbox.scrollTop;
    sbx.left = elScrollbox.scrollLeft;
    sbx.hWidth = elScrollbox.clientWidth / 2;
    sbx.hHeight = elScrollbox.clientHeight / 2;
    sbx.centerOnMapX = (sbx.left + sbx.hWidth) / this.viewScale;
    sbx.centerOnMapY = (sbx.top + sbx.hHeight) / this.viewScale;
    sbx.newCenterX = sbx.centerOnMapX * viewScale;
    sbx.newCenterY = sbx.centerOnMapY * viewScale;
    sbx.newLeft = sbx.newCenterX - sbx.hWidth;
    sbx.newTop = sbx.newCenterY - sbx.hHeight;
    // log('Map::update(), scrollbox:', sbx);

    this.viewScale = viewScale;

    this.el.style = `width:${this.getWidth()}px;height:${this.getHeight()}px`;
    for (let i=0; i < this.children.length; i++) {
      let child = this.children[i];
      child.update(viewScale);
    }

    setTimeout(function(){
      elScrollbox.scrollLeft = sbx.newLeft;
      elScrollbox.scrollTop = sbx.newTop;
    });
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
    const map = this;
    const jsonString = event.dataTransfer.getData('text');
    const dragData = JSON.parse(jsonString);
    // let mapItemData = dragData.dragObjData;
    log4('Map::onDrop(), map:', map);
    log3('Map::onDrop(), dropLocalPos:', dropPos);
    log3('Map::onDrop(), dragData:', dragData);
    // Adjust the original pointer offset to the current scale of the drag image...
    let mapItem = map.findChild(dragData.id);
    // log('Map::onDrop(), mapItem1:', mapItem);
    const unplaced = mapItem ? false : true;
    if (unplaced) {
      mapItem = map.app.leftSidebar.findChild(dragData.id);
    }
    // log('Map::onDrop(), mapItem2:', mapItem);
    const itemLeftOffset = dragData.pointerOffset.x * dragData.dragImageRelativeSize;
    const itemTopOffset = dragData.pointerOffset.y * dragData.dragImageRelativeSize;
    // Place the item's top-left corner back and up from the drop position.
    // Back it up by the offset between the drag image top-left and the drag pointer.
    // Since we are setting item DATA values, we need to also scale the x and y values
    // back to their x1 (base scale) values.
    mapItem.setX(dropPos.x - itemLeftOffset, map.viewScale);
    mapItem.setY(dropPos.y - itemTopOffset, map.viewScale);
    mapItem.viewScale = map.viewScale;
    // log('Map::onDrop(), unplaced:', unplaced);
    if (unplaced) {
      mapItem.groupsManager = map.groupsManager;
      mapItem.addPlugin(Groupable);
      mapItem.getDragImageScale = map.getItemDragImageScale;
      mapItem.getDragImageRelativeSize = map.getItemDragImageRelativeSize;
      mapItem.canDrag = map.canDragItem;
      mapItem.parent.removeChild(mapItem);
      mapItem.parent = map;
      map.children.push(mapItem);
      mapItem.update(map.viewScale);
      mapItem.mount();
    }
    else {
      mapItem.update(map.viewScale);
    }
  }


  onBoxSelect(selectBox, event) {
    // log('Map::onBoxSelect(), selectBox:', selectBox, event);
    const map = this;
    map.groupsManager.preventClear = true;
    map.children.forEach(function(child) {
      if (child.intersectsWith(selectBox)) {
        map.groupsManager.addSelectedItem(child, event);
      }
    });
  }


  onDocumentClick(event) {
    if (event.target.id === 'map') {
      if (this.groupsManager.preventClear) {
        this.groupsManager.preventClear = false;
      } else {
        this.groupsManager.clearSelection();
      }
    }
  }

}