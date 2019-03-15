/**
 * Component.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 06 Mar 2019
 *
 */

const log = window.__DEBUG_LEVEL__ ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 4 ? console.log : function(){};
let nextId = 1;

/**
 * The base component for all other commponents
 * @abstract
 * @class Component
 * @module Component
 */
export class Component {
  /**
   * Component constructor.
   * @constructs Component
   * @param {Component} parent - Parent component
   * @param {Object} options - Component options
   */
  constructor(parent, options = {}) {
    /**
     * Parent component instance
     * @property parent
     * @type {Component}
     */
    this.parent = parent;

    /**
     * Component root ancestor (i.e. the App component)
     * @property rootParent
     * @type {Object}
     */
    this.rootParent = parent ? (this.parent.rootParent ? this.parent.rootParent : this.parent) : null;

    /**
     * Component plugins collection.
     * @property plugins
     * @type {Array}
     */
    this.plugins = options.plugins || [];

    /**
     * Component event handlers collection.
     * @property eventListners
     * @type {Object}
     */
    this.eventListners = {};

    /**
     * Component child components collection.
     * @property children
     * @type {Array}
     */
    this.children = [];

    /**
     * The part of a component's auto-id BEFORE the number.
     * @property idPrefix
     * @type {String}
     */
    this.idPrefix =  options.idPrefix || 'comp';

    /**
     * Component id / name
     * @property id
     * @type {String}
     */
    this.id = options.id || this.getNextId();

    /**
     * Component DOM element
     * @property el
     * @type {HTMLEntity}
     */
    this.el = options.el || document.createElement('div');
    this.el.__MODEL__ = this;
    this.el.id = this.id;
  }


  /**
   * Next id generator
   * @return {String} E.g. comp1, item42, group3 etc.
   */
  getNextId() {
    return this.idPrefix + nextId++;
  }


  /**
   * Adds plugin to this component instance.
   * @param {Plugin} PluginToAdd  - Plugin that you want to attach to this component
   * @param {Object} options - Plugin configuration options
   * @return {Component}
   * @example component.addPlugin(PluginClass)
   */
  addPlugin(PluginToAdd, options) {
    let plugin;
    const matchingPlugins = this.plugins.filter(function(activePlugin) {
      return activePlugin.constructor === PluginToAdd;
    });
    // log('matchingPlugins =', matchingPlugins);
    if (matchingPlugins.length) {
      plugin = matchingPlugins.pop();
    }
    else {
      plugin = new PluginToAdd(this, options);
      this.plugins.push(plugin);
      plugin.attach();
    }
    return plugin;
  }


  /**
   * Removes plugins that are already attached to this component instance.
   * @param {Plugin} PluginToRemove - Plugin that you want detached
   * @return {Component}
   * @example component.removePlugin(CustomPlugin1, CustomPlugin2)
   */
  removePlugin(PluginToRemove) {
    const activePluginsToRemove = this.plugins.filter(function(activePlugin) {
      return activePlugin.constructor === PluginToRemove;
    });
    activePluginsToRemove.forEach((activePlugin) => activePlugin.detach());
    this.plugins = this.plugins.filter(function(activePlugin) {
      return activePlugin.constructor !== PluginToRemove;
    });
    return this;
  }


  findPlugin(pluginId) {
    log4('Find plugin id =', pluginId);
    const result = this.plugins.filter(plugin => plugin.id === pluginId);
    return result.length ? result[0] : null;
  }


  addChild(childClass, childOptions) {
    const child = new childClass(this, childOptions);
    this.children.push(child);
    return child;
  }


  removeChild(child) {
    return this.children.splice(this.children.indexOf(child), 1);
  }


  findChild(childId) {
    const result = this.children.filter(child => child.id === childId);
    return result.length ? result[0] : null;
  }


  /**
   * Override me
   * @abstract
   */
  init() {
    throw new Error('Component::init() - Not Implemented');
  }


  /**
   * Override me
   * @abstract
   */
  render() {
    throw new Error('Component::render() - Not Implemented');
  }


  /**
   * Override me
   * @abstract
   */
  mount() {
    throw new Error('Component::mount() - Not Implemented!');
  }


  /**
   * Override me
   * @abstract
   */
  update() {
    throw new Error('Component::update() - Not Implemented');
  }

}