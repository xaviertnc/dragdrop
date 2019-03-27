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


  addGroup(groupId, options) {
    // Create a new unique group ID if `groupId` is undefined.
    if ( ! groupId) { groupId = 'group' + this.nextId++; }
    let group = this.groups.find(group => group.id === groupId);
    if ( ! group) {
      group = new Group(groupId, options);
      this.groups.push(group);
    }
    return group;
  }


  removeGroup(group) {
    const index = this.groups.indexOf(group);
    if (index < 0) { return; }
    this.groups.splice(index, 1);
    // We need to run group.clear() to
    // clear each group item's group property!
    group.clear();
  }


  clearSelection() {
    this.selectedItems.unselectItems();
    this.selectedItems.clear();
  }


  /**
   * Groups any currently selected items into a NEW GROUP with
   * a specified or auto-generated name / id.
   * @param  {String} groupId
   * @param  {Object} options
   * @return {Group}
   */
  groupSelectedItems(groupId, options) {
    log('GroupsManager::groupSelectedItems(), groupId:', groupId);
    if (this.selectedItems.length < 2) { return; }
    const newGroup = this.addGroup(groupId, options);
    newGroup.addItems(this.selectedItems.items);
    return newGroup;
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
