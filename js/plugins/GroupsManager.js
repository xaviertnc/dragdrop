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
    this.selectedItems = new Group('selectedItems', { isMetaGroup: true });
    this.groups = [];
    this.nextId = 1;
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


  findGroup(groupId) {
    return this.groups.find(group => group.id === groupId);
  }


  removeGroup(group) {
    const index = this.groups.indexOf(group);
    if (index < 0) { return; }
    this.groups.splice(index, 1);
  }


  clearSelection() {
    this.selectedItems.unselectItems();
    this.selectedItems.clear();
  }


  groupSelectedItems(groupId) {
    log('GroupsManager::groupSelectedItems(), groupId:', groupId);

    // Exit if we already have a group with id == groupId.
    if (groupId && this.findGroup(groupId)) { return; }

    // Separate items with and without a group
    // Create a list of the existing groups selected.
    let grouplessItems = [], selectedGroups = {};
    this.selectedItems.items.forEach(function(item) {
      if (item.group) {
        selectedGroups[item.group.id] = item.group;
      } else {
        grouplessItems.push(item);
      }
    });

    log('GroupsManager::groupSelectedItems(), grouplessItems:', grouplessItems);
    log('GroupsManager::groupSelectedItems(), selectedGroups:', selectedGroups);

    // If we have ANY groupless items OR we have MORE THAN ONE selected group,
    // we need to create a new group to represent the new collection.
    if (grouplessItems.length || selectedGroups.length > 1)
    {
      // Create a new unique group ID
      // if 'groupId' is undefined.
      if ( ! groupId) {
        groupId = 'group' + this.nextId++;
      }

      const newGroup = new Group(groupId, { items: grouplessItems });

      // Add ALL the items from any selected groups, even if the selected groups
      // have some items that are not within the selected rectangle.
      for (let id in selectedGroups) {
        const selectedGroup = selectedGroups[id];
        newGroup.addItems(selectedGroup.items);
        this.removeGroup(selectedGroup);
      }

      this.groups.push(newGroup);
      this.clearSelection();

      log('GroupsManager::groupSelectedItems(), newGroup:', newGroup);
    }
  }


  onDocumentClick(event) {
    log4('GroupsManager::onDocumentClick()');
    if (this.hostObj.onDocumentClick) {
      return this.hostObj.onDocumentClick(event);
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
