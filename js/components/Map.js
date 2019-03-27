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

    // Make this map droppable (i.e. a DROPZONE)
    this.addPlugin(Dropable);

    // Add Box Select capability
    this.addPlugin(BoxSelect);

    // Add Groups Management capability
    this.addPlugin(GroupsManager);

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
          viewScale     : this.scale,
          groupsManager : this.groupsManager,
          draggable     : { canDrag: this.canDragItem.bind(this) },
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
      mapGroupViewComponent.getBounds();
      mapGroupViewComponent.normalizeChildPositions();
      mapGroupViewComponent.render();
    });


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


  getGroupItems() {
    return this.children.filter(child => child.data.type === 'Group');
  }


  zoomIn() {
    if (this.scale === 1) { this.update(2); }
    else this.update(4);
  }


  zoomOut() {
    if (this.scale === 4) { this.update(2); }
    else { this.update(1); }
  }


  canDragItem() {
    const canDrag = ! this.app.keyboard.get('SHIFT').isDown;
    log4('Map::canDrag(), ', canDrag);
    return canDrag;
  }


  canBoxSelect(event) {
    log4('Map::canBoxSelect(), event:', event);
    return this.app.keyboard.get('SHIFT').isDown;
  }


  /**
   * Create a new MapItem Component based on the contents of `params`
   * @param {Object} e.g. { data: {...}, model: {...} }
   * @return {MapItem|MapGroup|Component} The new map child component
   */
  addMapItem(params = {}) {
    // ADD GROUP MAP ITEM
    if (params.data.type === 'Group')
    {
      return this.addChild(MapGroup, {
        id            : params.model.id,
        viewScale     : this.scale,
        groupsManager : this.groupsManager,
        draggable     : { canDrag: this.canDragItem.bind(this) },
        model         : params.model,
        data          : params.data
      });
    }
    // ADD GENERAL MAP ITEM
    return this.addChild(MapItem, {
      viewScale     : this.scale,
      groupsManager : this.groupsManager,
      draggable     : { canDrag: this.canDragItem.bind(this) },
      data          : params.data
    });
  }


  groupSelectedItems() {
    log('Map::groupSelectedItems()');
    const newGroup = this.groupsManager.groupSelectedItem();
    if (newGroup) {
      this.addMapItem({
        data  : { type: 'Group' },
        model : newGroup
      });
      this.removeChildren(newGroup);
      this.groupsManager.clearSelection();
    }
    log('Map::groupSelectedItems(), newGroup:', newGroup);
  }


  ungroupSelectedItems() {

  }


  /**
   * Render the Map inner HTML
   */
  render() {
    this.el.style = `width:${this.getWidth()}px;height:${this.getHeight()}px`;
    this.children.forEach(child => child.mount());
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
    mapItem.setX(dropPos.x - itemLeftOffset, this.scale);
    mapItem.setY(dropPos.y - itemTopOffset, this.scale);
    mapItem.viewScale = this.scale;
    if (unplaced) {
      mapItem.groupsManager = this.groupsManager;
      mapItem.addPlugin(Groupable);
      mapItem.findPlugin('draggable').reconfigure({
        getDragImageScale: this.getItemDragImageScale,
        canDrag: this.canDragItem.bind(this)
      });
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