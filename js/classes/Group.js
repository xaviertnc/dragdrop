/**
 * Group.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 16 Mar 2019
 *
 */

const log = window.__DEBUG_LEVEL__ ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * App Component
 * @class Group
 * @module Group
 */
export class Group {
  /**
   * Component constructor.
   * @constructs Group
   * @param {String} id Group id /name
   * @param {Object} options Group options like initial items etc.
   */
  constructor(id, options = {}) {
    this.id = id;
    this.items = options.items || [];
    this.isMetaGroup = options.isMetaGroup || false;
    if ( ! this.isMetaGroup && this.items.length) {
      const thisGroup = this;
      this.items.forEach(function(item) { item.group = thisGroup; });
    }
    log('Group::new(), id:', id);
  }


  addItem(item) {
    log4('Group::addItem(), item:', item);
    const index = this.items.indexOf(item);
    if (index < 0) {
      if ( ! this.isMetaGroup) { item.group = this; }
      this.items.push(item);
    }
    return this;
  }


  removeItem(item) {
    log4('Group::removeItem(), item:', item);
    const index = this.items.indexOf(item);
    if (index >= 0) {
      if ( ! this.isMetaGroup) {
        delete this.items[index].group;
      }
      this.items.splice(index, 1);
    }
    return item;
  }


  addItems(items = []) {
    log4('Group::addItems(), items:', items);
    if (items && typeof items.length === 'undefined') {
      throw new Error('Group::addItems(), Items param must be an array!');
    }
    items.forEach(item => this.addItem(item));
  }


  removeItems(items = []) {
    log4('Group::removeItems(), items:', items);
    if (items && typeof items.length === 'undefined') {
      throw new Error('Group::removeItems(), Items param must be an array!');
    }
    items.forEach(item => this.removeItem(item));
  }


  selectItem(item, event) {
    log4('Group::selectItem()');
    if (item.onSelect) {
      return item.onSelect(event);
    }
    item.selected = true;
  }


  unselectItem(item, event) {
    log4('Group::unselectItem()');
    if (item.onUnselect) {
      return item.onUnselect(event);
    }
    item.selected = false;
  }


  selectItems(event) {
    log4('Group::selectItems()');
    this.items.forEach(item => this.selectItem(item, event));
  }


  unselectItems(event) {
    log4('Group::unselectItems()');
    this.items.forEach(item => this.unselectItem(item, event));
  }


  clear() {
    log4('Group::clear()');
    if ( ! this.isMetaGroup) {
      this.items.forEach(function(item) { delete item.group; });
    }
    this.items = [];
  }

}