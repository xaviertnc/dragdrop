/**
 * Key.js
 * @author: C. Moller <xavier.tnc@gmail.com>
 * @date: 06 Mar 2019
 *
 */

const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};

/**
 * Key class
 * @class Key
 * @module Key
 */
export class Key {
  /**
   * Key class contructor. Used with Keyboard plugin.
   * @param  {Integer} keyCode   [description]
   * @param  {Function} onPress   [description]
   * @param  {Function} onRelease [description]
   */
  constructor(keyCode, onPress, onRelease) {
    /**
     * Key code
     * @property keyCode
     * @type {Integer}
     */
    this.keyCode = keyCode;

    /**
     * Key optional on-press event handler
     * @property onPress
     * @type {Function}
     */
    this.onPress = onPress;

    /**
     * Key optional on-release event handler
     * @property onRelease
     * @type {Function}
     */
    this.onRelease = onRelease;

    /**
     * Key UP STATE
     * @property isUp
     * @type {Boolean}
     */
    this.isUp = true;

    /**
     * Key DOWN STATE
     * @property isDown
     * @type {Boolean}
     */
    this.isDown = false;

    const upListener = this.upHandler.bind(this);
    const downListener = this.downHandler.bind(this);

    // Attach event listeners
    window.addEventListener('keyup', upListener, false);
    window.addEventListener('keydown', downListener, false);

    /**
     * Detach event listeners
     * @method unsubscribe
     * @type {Function}
     */
    this.unsubscribe = function()
    {
      window.removeEventListener('keydown', downListener);
      window.removeEventListener('keyup', upListener);
    };

    log4('Key::new(), keyCode:', keyCode);
  }


  /**
   * Base DOWN / PRESS handler
   * @param  {Object} event DOM "onkeydown" event
   */
  downHandler(event) {
    let keyPressed = (event.keyCode ? event.keyCode : event.which);
    if (keyPressed === this.keyCode)
    {
      if (this.isUp && this.onPress)
      {
        this.onPress();
      }
      this.isUp = false;
      this.isDown = true;
      event.preventDefault();
    }
  }


  /**
   * Base UP / RELEASE handler
   * @param  {Object} event DOM "onkeyup" event
   */
  upHandler(event) {
    let keyPressed = (event.keyCode ? event.keyCode : event.which);
    if (keyPressed === this.keyCode)
    {
      if (this.isDown && this.onRelease)
      {
        this.onRelease();
      }
      this.isUp = true;
      this.isDown = false;
      event.preventDefault();
    }
  }

}