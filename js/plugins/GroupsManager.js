/*global Symbol*/

/**
 * GroupsManager.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 16 Mar 2019
 *
 */

import { Group  } from '../classes/Group.js';
import { Plugin } from '../classes/Plugin.js';

const log = window.__DEBUG_LEVEL__ ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};


/**
 * GroupsManager plugin
 * @class GroupsManager
 * @module GroupsManager
 */
export class GroupsManager extends Plugin {
  /**
   * Plugin constructor.
   * @constructs GroupsManager
   * @param {Component} hostObj Host component to apply this plugin to.
   * @param {Object} options Plugin initial configuration.
   */
  constructor(hostObj, options) {
    super('groupsmanager', hostObj, options);
    this.selectedItems = new Group('selectedItems');
    this.groups = [];
  }


  /**
   * Configure plugin with custom options
   * Abstract/required method implementation.
   */
  init() {} // I.e. No options available on this plugin


  addSelectedItem(item, event) {
    log4('GroupsManager::addSelectedItem(), item:', item);
    this.selectedItems.addItem(item);
    return this.selectedItems.selectItem(item, event);
  }


  removeSelectedItem(item, event) {
    this.selectedItems.removeItem(item);
    return this.selectedItems.unselectItem(item, event);
  }


  groupSelection(groupId) {
    this.groups.push(new Group(groupId, { items: this.selectedItems }));
  }


  findGroup(groupId) {
    return this.groups.find(group => group.id === groupId);
  }


  onDocumentClick(event) {
    if (event.target.id === 'map') {
      log('GroupsManager::onDocumentClick()');
      this.selectedItems.unselectItems();
      this.selectedItems.clear();
    }
  }


  attach() {
    log4('GroupsManager::attach()');
    const hostObj = this.hostObj;
    hostObj.groupsManager = this;
    hostObj.eventListners.onGrpsManDocClick = this.onDocumentClick.bind(this);
    document.addEventListener('click', hostObj.eventListners.onGrpsManDocClick);
  }


  detach() {
    log4('GroupsManager::detach()');
    delete this.hostObj.groupsManager;
  }

}
