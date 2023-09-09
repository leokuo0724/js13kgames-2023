/**
 * @preserve
 * Kontra.js v9.0.0
 */
let noop = () => {};

// style used for DOM nodes needed for screen readers
let srOnlyStyle =
  'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';

/**
 * Append a node directly after the canvas and as the last element of other kontra nodes.
 *
 * @param {HTMLElement} node - Node to append.
 * @param {HTMLCanvasElement} canvas - Canvas to append after.
 */
function addToDom(node, canvas) {
  let container = canvas.parentNode;

  node.setAttribute('data-kontra', '');
  if (container) {
    let target =
      container.querySelector('[data-kontra]:last-of-type') || canvas;
    container.insertBefore(node, target.nextSibling);
  } else {
    document.body.appendChild(node);
  }
}

/**
 * Remove an item from an array.
 *
 * @param {*[]} array - Array to remove from.
 * @param {*} item - Item to remove.
 *
 * @returns {Boolean|undefined} True if the item was removed.
 */
function removeFromArray(array, item) {
  let index = array.indexOf(item);
  if (index != -1) {
    array.splice(index, 1);
    return true;
  }
}

/**
 * A simple event system. Allows you to hook into Kontra lifecycle events or create your own, such as for [Plugins](api/plugin).
 *
 * ```js
 * import { on, off, emit } from 'kontra';
 *
 * function callback(a, b, c) {
 *   console.log({a, b, c});
 * });
 *
 * on('myEvent', callback);
 * emit('myEvent', 1, 2, 3);  //=> {a: 1, b: 2, c: 3}
 * off('myEvent', callback);
 * ```
 * @sectionName Events
 */

// expose for testing
let callbacks$2 = {};

/**
 * There are currently only three lifecycle events:
 * - `init` - Emitted after `kontra.init()` is called.
 * - `tick` - Emitted every frame of [GameLoop](api/gameLoop) before the loops `update()` and `render()` functions are called.
 * - `assetLoaded` - Emitted after an asset has fully loaded using the asset loader. The callback function is passed the asset and the url of the asset as parameters.
 * @sectionName Lifecycle Events
 */

/**
 * Register a callback for an event to be called whenever the event is emitted. The callback will be passed all arguments used in the `emit` call.
 * @function on
 *
 * @param {String} event - Name of the event.
 * @param {Function} callback - Function that will be called when the event is emitted.
 */
function on(event, callback) {
  callbacks$2[event] = callbacks$2[event] || [];
  callbacks$2[event].push(callback);
}

/**
 * Call all callback functions for the event. All arguments will be passed to the callback functions.
 * @function emit
 *
 * @param {String} event - Name of the event.
 * @param {...*} args - Comma separated list of arguments passed to all callbacks.
 */
function emit(event, ...args) {
  (callbacks$2[event] || []).map(fn => fn(...args));
}

/**
 * Functions for initializing the Kontra library and getting the canvas and context
 * objects.
 *
 * ```js
 * import { getCanvas, getContext, init } from 'kontra';
 *
 * let { canvas, context } = init();
 *
 * // or can get canvas and context through functions
 * canvas = getCanvas();
 * context = getContext();
 * ```
 * @sectionName Core
 */

let canvasEl, context;

// allow contextless environments, such as using ThreeJS as the main
// canvas, by proxying all canvas context calls
let handler$1 = {
  // by using noop we can proxy both property and function calls
  // so neither will throw errors
  get(target, key) {
    // export for testing
    if (key == '_proxy') return true;
    return noop;
  }
};

/**
 * Return the canvas element.
 * @function getCanvas
 *
 * @returns {HTMLCanvasElement} The canvas element for the game.
 */
function getCanvas() {
  return canvasEl;
}

/**
 * Return the context object.
 * @function getContext
 *
 * @returns {CanvasRenderingContext2D} The context object the game draws to.
 */
function getContext() {
  return context;
}

/**
 * Initialize the library and set up the canvas. Typically you will call `init()` as the first thing and give it the canvas to use. This will allow all Kontra objects to reference the canvas when created.
 *
 * ```js
 * import { init } from 'kontra';
 *
 * let { canvas, context } = init('game');
 * ```
 * @function init
 *
 * @param {String|HTMLCanvasElement} [canvas] - The canvas for Kontra to use. Can either be the ID of the canvas element or the canvas element itself. Defaults to using the first canvas element on the page.
 * @param {Object} [options] - Game options.
 * @param {Boolean} [options.contextless=false] - If the game will run in an contextless environment. A contextless environment uses a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for the `canvas` and `context` so all property and function calls will noop.
 *
 * @returns {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} An object with properties `canvas` and `context`. `canvas` it the canvas element for the game and `context` is the context object the game draws to.
 */
function init$1(canvas, { contextless = false } = {}) {
  // check if canvas is a string first, an element next, or default to
  // getting first canvas on page
  canvasEl =
    document.getElementById(canvas) ||
    canvas ||
    document.querySelector('canvas');

  if (contextless) {
    canvasEl = canvasEl || new Proxy({}, handler$1);
  }


  context = canvasEl.getContext('2d') || new Proxy({}, handler$1);
  context.imageSmoothingEnabled = false;

  emit('init');

  return { canvas: canvasEl, context };
}

/**
 * Rotate a point by an angle.
 * @function rotatePoint
 *
 * @param {{x: Number, y: Number}} point - The {x,y} point to rotate.
 * @param {Number} angle - Angle (in radians) to rotate.
 *
 * @returns {{x: Number, y: Number}} The new x and y coordinates after rotation.
 */
function rotatePoint(point, angle) {
  let sin = Math.sin(angle);
  let cos = Math.cos(angle);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}

/**
 * Clamp a number between two values, preventing it from going below or above the minimum and maximum values.
 * @function clamp
 *
 * @param {Number} min - Min value.
 * @param {Number} max - Max value.
 * @param {Number} value - Value to clamp.
 *
 * @returns {Number} Value clamped between min and max.
 */
function clamp(min, max, value) {
  return Math.min(Math.max(min, value), max);
}

/**
 * Return the world rect of an object. The rect is the world position of the top-left corner of the object and its size. Takes into account the objects anchor and scale.
 * @function getWorldRect
 *
 * @param {{x: Number, y: Number, width: Number, height: Number}|{world: {x: Number, y: Number, width: Number, height: Number}}|{mapwidth: Number, mapheight: Number}} obj - Object to get world rect of.
 *
 * @returns {{x: Number, y: Number, width: Number, height: Number}} The world `x`, `y`, `width`, and `height` of the object.
 */
function getWorldRect(obj) {
  let { x = 0, y = 0, width, height } = obj.world || obj;

  // take into account tileEngine
  if (obj.mapwidth) {
    width = obj.mapwidth;
    height = obj.mapheight;
  }

  // account for anchor
  if (obj.anchor) {
    x -= width * obj.anchor.x;
    y -= height * obj.anchor.y;
  }

  // account for negative scales
  if (width < 0) {
    x += width;
    width *= -1;
  }
  if (height < 0) {
    y += height;
    height *= -1;
  }

  return {
    x,
    y,
    width,
    height
  };
}

/**
 * A simple 2d vector object. Takes either separate `x` and `y` coordinates or a Vector-like object.
 *
 * ```js
 * import { Vector } from 'kontra';
 *
 * let vector = Vector(100, 200);
 * let vector2 = Vector({x: 100, y: 200});
 * ```
 * @class Vector
 *
 * @param {Number|{x: number, y: number}} [x=0] - X coordinate of the vector or a Vector-like object. If passing an object, the `y` param is ignored.
 * @param {Number} [y=0] - Y coordinate of the vector.
 */
class Vector {
  constructor(x = 0, y = 0, vec = {}) {
    if (x.x != undefined) {
      this.x = x.x;
      this.y = x.y;
    }
    else {
      this.x = x;
      this.y = y;
    }

  }

  /**
   * Set the x and y coordinate of the vector.
   * @memberof Vector
   * @function set
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to set coordinates from.
   */
  set(vec) {
    this.x = vec.x;
    this.y = vec.y;
  }

  /**
   * Calculate the addition of the current vector with the given vector.
   * @memberof Vector
   * @function add
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to add to the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is the addition of the two vectors.
   */
  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y, this);
  }









}

function factory$a() {
  return new Vector(...arguments);
}

/**
 * This is a private class that is used just to help make the GameObject class more manageable and smaller.
 *
 * It maintains everything that can be changed in the update function:
 * position
 * velocity
 * acceleration
 * ttl
 */
class Updatable {
  constructor(properties) {
    return this.init(properties);
  }

  init(properties = {}) {
    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The game objects position vector. Represents the local position of the object as opposed to the [world](api/gameObject#world) position.
     * @property {Vector} position
     * @memberof GameObject
     * @page GameObject
     */
    this.position = factory$a();

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------



    /**
     * How may frames the game object should be alive.
     * @memberof GameObject
     * @property {Number} ttl
     * @page GameObject
     */
    this.ttl = Infinity;

    // add all properties to the object, overriding any defaults
    Object.assign(this, properties);
  }

  /**
   * Update the position of the game object and all children using their velocity and acceleration. Calls the game objects [advance()](api/gameObject#advance) function.
   * @memberof GameObject
   * @function update
   * @page GameObject
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    this.advance(dt);
  }

  /**
   * Move the game object by its acceleration and velocity. If you pass `dt` it will multiply the vector and acceleration by that number. This means the `dx`, `dy`, `ddx` and `ddy` should be how far you want the object to move in 1 second rather than in 1 frame.
   *
   * If you override the game objects [update()](api/gameObject#update) function with your own update function, you can call this function to move the game object normally.
   *
   * ```js
   * import { GameObject } from 'kontra';
   *
   * let gameObject = GameObject({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   dx: 5,
   *   dy: 2,
   *   update: function() {
   *     // move the game object normally
   *     this.advance();
   *
   *     // change the velocity at the edges of the canvas
   *     if (this.x < 0 ||
   *         this.x + this.width > this.context.canvas.width) {
   *       this.dx = -this.dx;
   *     }
   *     if (this.y < 0 ||
   *         this.y + this.height > this.context.canvas.height) {
   *       this.dy = -this.dy;
   *     }
   *   }
   * });
   * ```
   * @memberof GameObject
   * @function advance
   * @page GameObject
   *
   * @param {Number} [dt] - Time since last update.
   *
   */
  advance(dt) {


    this.ttl--;
  }

  // --------------------------------------------------
  // velocity
  // --------------------------------------------------


  // --------------------------------------------------
  // acceleration
  // --------------------------------------------------


  // --------------------------------------------------
  // ttl
  // --------------------------------------------------

  /**
   * Check if the game object is alive.
   * @memberof GameObject
   * @function isAlive
   * @page GameObject
   *
   * @returns {Boolean} `true` if the game objects [ttl](api/gameObject#ttl) property is above `0`, `false` otherwise.
   */
  isAlive() {
    return this.ttl > 0;
  }

  _pc() {}
}

/**
 * The base class of most renderable classes. Handles things such as position, rotation, anchor, and the update and render life cycle.
 *
 * Typically you don't create a GameObject directly, but rather extend it for new classes.
 * @class GameObject
 *
 * @param {Object} [properties] - Properties of the game object.
 * @param {Number} [properties.x] - X coordinate of the position vector.
 * @param {Number} [properties.y] - Y coordinate of the position vector.
 * @param {Number} [properties.width] - Width of the game object.
 * @param {Number} [properties.height] - Height of the game object.
 *
 * @param {CanvasRenderingContext2D} [properties.context] - The context the game object should draw to. Defaults to [core.getContext()](api/core#getContext).
 *
 * @param {Number} [properties.dx] - X coordinate of the velocity vector.
 * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
 * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
 * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
 * @param {Number} [properties.ttl=Infinity] - How many frames the game object should be alive. Used by [Pool](api/pool).
 *
 * @param {{x: Number, y: Number}} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
 * @param {GameObject[]} [properties.children] - Children to add to the game object.
 * @param {Number} [properties.opacity=1] - The opacity of the game object.
 * @param {Number} [properties.rotation=0] - The rotation around the anchor in radians.
 * @param {Number} [properties.scaleX=1] - The x scale of the game object.
 * @param {Number} [properties.scaleY=1] - The y scale of the game object.
 *
 * @param {(dt?: Number) => void} [properties.update] - Function called every frame to update the game object.
 * @param {Function} [properties.render] - Function called every frame to render the game object.
 *
 * @param {...*} properties.props - Any additional properties you need added to the game object. For example, if you pass `gameObject({type: 'player'})` then the game object will also have a property of the same name and value. You can pass as many additional properties as you want.
 */
class GameObject extends Updatable {
  /**
   * @docs docs/api_docs/gameObject.js
   */

  /**
   * Use this function to reinitialize a game object. It takes the same properties object as the constructor. Useful it you want to repurpose a game object.
   * @memberof GameObject
   * @function init
   *
   * @param {Object} properties - Properties of the game object.
   */
  init({
    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The width of the game object. Represents the local width of the object as opposed to the [world](api/gameObject#world) width.
     * @memberof GameObject
     * @property {Number} width
     */
    width = 0,

    /**
     * The height of the game object. Represents the local height of the object as opposed to the [world](api/gameObject#world) height.
     * @memberof GameObject
     * @property {Number} height
     */
    height = 0,

    /**
     * The context the game object will draw to.
     * @memberof GameObject
     * @property {CanvasRenderingContext2D} context
     */
    context = getContext(),

    render = this.draw,
    update = this.advance,

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------

    /**
     * The game objects parent object.
     * @memberof GameObject
     * @property {GameObject|null} parent
     */

    /**
     * The game objects children objects.
     * @memberof GameObject
     * @property {GameObject[]} children
     */
    children = [],

    /**
     * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
     * @memberof GameObject
     * @property {{x: Number, y: Number}} anchor
     *
     * @example
     * // exclude-code:start
     * let { GameObject } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { GameObject } from 'kontra';
     * // exclude-script:end
     *
     * let gameObject = GameObject({
     *   x: 150,
     *   y: 100,
     *   width: 50,
     *   height: 50,
     *   color: 'red',
     *   // exclude-code:start
     *   context: context,
     *   // exclude-code:end
     *   render: function() {
     *     this.context.fillStyle = this.color;
     *     this.context.fillRect(0, 0, this.height, this.width);
     *   }
     * });
     *
     * function drawOrigin(gameObject) {
     *   gameObject.context.fillStyle = 'yellow';
     *   gameObject.context.beginPath();
     *   gameObject.context.arc(gameObject.x, gameObject.y, 3, 0, 2*Math.PI);
     *   gameObject.context.fill();
     * }
     *
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 0.5, y: 0.5};
     * gameObject.x = 300;
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 1, y: 1};
     * gameObject.x = 450;
     * gameObject.render();
     * drawOrigin(gameObject);
     */
    anchor = { x: 0, y: 0 },

    /**
     * The opacity of the object. Represents the local opacity of the object as opposed to the [world](api/gameObject#world) opacity.
     * @memberof GameObject
     * @property {Number} opacity
     */
    opacity = 1,

    /**
     * The rotation of the game object around the anchor in radians. Represents the local rotation of the object as opposed to the [world](api/gameObject#world) rotation.
     * @memberof GameObject
     * @property {Number} rotation
     */
    rotation = 0,

    /**
     * The x scale of the object. Represents the local x scale of the object as opposed to the [world](api/gameObject#world) x scale.
     * @memberof GameObject
     * @property {Number} scaleX
     */
    scaleX = 1,

    /**
     * The y scale of the object. Represents the local y scale of the object as opposed to the [world](api/gameObject#world) y scale.
     * @memberof GameObject
     * @property {Number} scaleY
     */
    scaleY = 1,

    ...props
  } = {}) {
    this._c = [];

    // by setting defaults to the parameters and passing them into
    // the init, we can ensure that a parent class can set overriding
    // defaults and the GameObject won't undo it (if we set
    // `this.width` then no parent could provide a default value for
    // width)
    super.init({
      width,
      height,
      context,

      anchor,

      opacity,

      rotation,

      scaleX,
      scaleY,

      ...props
    });

    // di = done init
    this._di = true;
    this._uw();

    this.addChild(children);

    // rf = render function
    this._rf = render;

    // uf = update function
    this._uf = update;

    on('init', () => {
      this.context ??= getContext();
    });
  }

  /**
   * Update all children
   */
  update(dt) {
    this._uf(dt);

    this.children.map(child => child.update && child.update(dt));
  }

  /**
   * Render the game object and all children. Calls the game objects [draw()](api/gameObject#draw) function.
   * @memberof GameObject
   * @function render
   */
  render() {
    let context = this.context;
    context.save();

    // 1) translate to position
    //
    // it's faster to only translate if one of the values is non-zero
    // rather than always translating
    // @see https://jsperf.com/translate-or-if-statement/2
    if (this.x || this.y) {
      context.translate(this.x, this.y);
    }

    // 3) rotate around the anchor
    //
    // it's faster to only rotate when set rather than always rotating
    // @see https://jsperf.com/rotate-or-if-statement/2
    if (this.rotation) {
      context.rotate(this.rotation);
    }

    // 4) scale after translation to position so object can be
    // scaled in place (rather than scaling position as well).
    //
    // it's faster to only scale if one of the values is not 1
    // rather than always scaling
    // @see https://jsperf.com/scale-or-if-statement/4
    if (this.scaleX != 1 || this.scaleY != 1) {
      context.scale(this.scaleX, this.scaleY);
    }

    // 5) translate to the anchor so (0,0) is the top left corner
    // for the render function
    let anchorX = -this.width * this.anchor.x;
    let anchorY = -this.height * this.anchor.y;

    if (anchorX || anchorY) {
      context.translate(anchorX, anchorY);
    }

    // it's not really any faster to gate the global alpha
    // @see https://jsperf.com/global-alpha-or-if-statement/1
    this.context.globalAlpha = this.opacity;

    this._rf();

    // 7) translate back to the anchor so children use the correct
    // x/y value from the anchor
    if (anchorX || anchorY) {
      context.translate(-anchorX, -anchorY);
    }

    // perform all transforms on the parent before rendering the
    // children
    let children = this.children;
    children.map(child => child.render && child.render());

    context.restore();
  }

  /**
   * Draw the game object at its X and Y position, taking into account rotation, scale, and anchor.
   *
   * Do note that the canvas has been rotated and translated to the objects position (taking into account anchor), so {0,0} will be the top-left corner of the game object when drawing.
   *
   * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
   *
   * ```js
   * let { GameObject } = kontra;
   *
   * let gameObject = GameObject({
   *  x: 290,
   *  y: 80,
   *  width: 20,
   *  height: 40,
   *
   *  render: function() {
   *    // draw the game object normally (perform rotation and other transforms)
   *    this.draw();
   *
   *    // outline the game object
   *    this.context.strokeStyle = 'yellow';
   *    this.context.lineWidth = 2;
   *    this.context.strokeRect(0, 0, this.width, this.height);
   *  }
   * });
   *
   * gameObject.render();
   * ```
   * @memberof GameObject
   * @function draw
   */
  draw() {}

  /**
   * Sync property changes from the parent to the child
   */
  _pc() {
    this._uw();

    this.children.map(child => child._pc());
  }

  /**
   * X coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} x
   */
  get x() {
    return this.position.x;
  }

  /**
   * Y coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} y
   */
  get y() {
    return this.position.y;
  }

  set x(value) {
    this.position.x = value;

    // pc = property changed
    this._pc();
  }

  set y(value) {
    this.position.y = value;
    this._pc();
  }

  get width() {
    // w = width
    return this._w;
  }

  set width(value) {
    this._w = value;
    this._pc();
  }

  get height() {
    // h = height
    return this._h;
  }

  set height(value) {
    this._h = value;
    this._pc();
  }

  /**
   * Update world properties
   */
  _uw() {
    // don't update world properties until after the init has finished
    if (!this._di) return;

    let {
      _wx = 0,
      _wy = 0,

      _wo = 1,

      _wr = 0,

      _wsx = 1,
      _wsy = 1
    } = this.parent || {};

    // wx = world x, wy = world y
    this._wx = this.x;
    this._wy = this.y;

    // ww = world width, wh = world height
    this._ww = this.width;
    this._wh = this.height;

    // wo = world opacity
    this._wo = _wo * this.opacity;

    // wsx = world scale x, wsy = world scale y
    this._wsx = _wsx * this.scaleX;
    this._wsy = _wsy * this.scaleY;

    this._wx = this._wx * _wsx;
    this._wy = this._wy * _wsy;
    this._ww = this.width * this._wsx;
    this._wh = this.height * this._wsy;

    // wr = world rotation
    this._wr = _wr + this.rotation;

    let { x, y } = rotatePoint({ x: this._wx, y: this._wy }, _wr);
    this._wx = x;
    this._wy = y;

    this._wx += _wx;
    this._wy += _wy;
  }

  /**
   * The world position, width, height, opacity, rotation, and scale. The world property is the true position, width, height, etc. of the object, taking into account all parents.
   *
   * The world property does not adjust for anchor or scale, so if you set a negative scale the world width or height could be negative. Use [getWorldRect](/api/helpers#getWorldRect) to get the world position and size adjusted for anchor and scale.
   * @property {{x: Number, y: Number, width: Number, height: Number, opacity: Number, rotation: Number, scaleX: Number, scaleY: Number}} world
   * @memberof GameObject
   */
  get world() {
    return {
      x: this._wx,
      y: this._wy,
      width: this._ww,
      height: this._wh,

      opacity: this._wo,

      rotation: this._wr,

      scaleX: this._wsx,
      scaleY: this._wsy
    };
  }

  // --------------------------------------------------
  // group
  // --------------------------------------------------

  set children(value) {
    this.removeChild(this._c);
    this.addChild(value);
  }

  get children() {
    return this._c;
  }

  /**
   * Add an object as a child to this object. The objects position, size, and rotation will be relative to the parents position, size, and rotation. The childs [world](api/gameObject#world) property will be updated to take into account this object and all of its parents.
   * @memberof GameObject
   * @function addChild
   *
   * @param {...(GameObject|GameObject[])[]} objects - Object to add as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
   *
   * @example
   * // exclude-code:start
   * let { GameObject } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { GameObject } from 'kontra';
   * // exclude-script:end
   *
   * function createObject(x, y, color, size = 1) {
   *   return GameObject({
   *     x,
   *     y,
   *     width: 50 / size,
   *     height: 50 / size,
   *     anchor: {x: 0.5, y: 0.5},
   *     color,
   *     // exclude-code:start
   *     context: context,
   *     // exclude-code:end
   *     render: function() {
   *       this.context.fillStyle = this.color;
   *       this.context.fillRect(0, 0, this.height, this.width);
   *     }
   *   });
   * }
   *
   * let parent = createObject(300, 100, 'red');
   *
   * // create a child that is 25px to the right and
   * // down from the parents position
   * let child = createObject(25, 25, 'yellow', 2);
   *
   * parent.addChild(child);
   *
   * parent.render();
   */
  addChild(...objects) {
    objects.flat().map(child => {
      this.children.push(child);
      child.parent = this;
      child._pc = child._pc || noop;
      child._pc();
    });
  }

  /**
   * Remove an object as a child of this object. The removed objects [world](api/gameObject#world) property will be updated to not take into account this object and all of its parents.
   * @memberof GameObject
   * @function removeChild
   *
   * @param {...(GameObject|GameObject[])[]} objects - Object to remove as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
   */
  removeChild(...objects) {
    objects.flat().map(child => {
      if (removeFromArray(this.children, child)) {
        child.parent = null;
        child._pc();
      }
    });
  }

  // --------------------------------------------------
  // opacity
  // --------------------------------------------------

  get opacity() {
    return this._opa;
  }

  set opacity(value) {
    this._opa = clamp(0, 1, value);
    this._pc();
  }

  // --------------------------------------------------
  // rotation
  // --------------------------------------------------

  get rotation() {
    return this._rot;
  }

  set rotation(value) {
    this._rot = value;
    this._pc();
  }

  // --------------------------------------------------
  // scale
  // --------------------------------------------------

  /**
   * Set the x and y scale of the object. If only one value is passed, both are set to the same value.
   * @memberof GameObject
   * @function setScale
   *
   * @param {Number} x - X scale value.
   * @param {Number} [y=x] - Y scale value.
   */
  setScale(x, y = x) {
    this.scaleX = x;
    this.scaleY = y;
  }

  get scaleX() {
    return this._scx;
  }

  set scaleX(value) {
    this._scx = value;
    this._pc();
  }

  get scaleY() {
    return this._scy;
  }

  set scaleY(value) {
    this._scy = value;
    this._pc();
  }
}

/**
 * A versatile way to update and draw your sprites. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
 * @class Sprite
 * @extends GameObject
 *
 * @param {Object} [properties] - Properties of the sprite.
 * @param {String} [properties.color] - Fill color for the game object if no image or animation is provided.
 * @param {HTMLImageElement|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
 * @param {{[name: String] : Animation}} [properties.animations] - An object of [Animations](api/animation) from a [Spritesheet](api/spriteSheet) to animate the sprite.
 */
class Sprite extends GameObject {
  /**
   * @docs docs/api_docs/sprite.js
   */

  init({
    /**
     * The color of the game object if it was passed as an argument.
     * @memberof Sprite
     * @property {String} color
     */

    /**
     * The image the sprite will use when drawn if passed as an argument.
     * @memberof Sprite
     * @property {HTMLImageElement|HTMLCanvasElement} image
     */
    image,

    /**
     * The width of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the width of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the width of a single frame of the animation.
     * @memberof Sprite
     * @property {Number} width
     */
    width = image ? image.width : undefined,

    /**
     * The height of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the height of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the height of a single frame of the animation.
     * @memberof Sprite
     * @property {Number} height
     */
    height = image ? image.height : undefined,

    ...props
  } = {}) {
    super.init({
      image,
      width,
      height,
      ...props
    });
  }


  draw() {
    if (this.image) {
      this.context.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height
      );
    }


    if (this.color) {
      this.context.fillStyle = this.color;
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }
}

function factory$8() {
  return new Sprite(...arguments);
}

let fontSizeRegex = /(\d+)(\w+)/;

function parseFont(font) {
  if (!font) return { computed: 0 };

  let match = font.match(fontSizeRegex);

  // coerce string to number
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  let size = +match[1];
  let unit = match[2];
  let computed = size;

  return {
    size,
    unit,
    computed
  };
}

/**
 * An object for drawing text to the screen. Supports newline characters as well as automatic new lines when setting the `width` property.
 *
 * You can also display RTL languages by setting the attribute `dir="rtl"` on the main canvas element. Due to the limited browser support for individual text to have RTL settings, it must be set globally for the entire game.
 *
 * @example
 * // exclude-code:start
 * let { Text } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Text } from 'kontra';
 * // exclude-script:end
 *
 * let text = Text({
 *   text: 'Hello World!\nI can even be multiline!',
 *   font: '32px Arial',
 *   color: 'white',
 *   x: 300,
 *   y: 100,
 *   anchor: {x: 0.5, y: 0.5},
 *   textAlign: 'center'
 * });
 * // exclude-code:start
 * text.context = context;
 * // exclude-code:end
 *
 * text.render();
 * @class Text
 * @extends GameObject
 *
 * @param {Object} properties - Properties of the text.
 * @param {String} properties.text - The text to display.
 * @param {String} [properties.font] - The [font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) style. Defaults to the main context font.
 * @param {String} [properties.color] - Fill color for the text. Defaults to the main context fillStyle.
 * @param {Number} [properties.width] - Set a fixed width for the text. If set, the text will automatically be split into new lines that will fit the size when possible.
 * @param {String} [properties.textAlign='left'] - The [textAlign](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign) for the context. If the `dir` attribute is set to `rtl` on the main canvas, the text will automatically be aligned to the right, but you can override that by setting this property.
 * @param {Number} [properties.lineHeight=1] - The distance between two lines of text.
 * @param {String} [properties.strokeColor] - Stroke color for the text.
 * @param {number} [properties.lineWidth] - Stroke line width for the text.
 */
class Text extends GameObject {
  init({
    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The string of text. Use newline characters to create multi-line strings.
     * @memberof Text
     * @property {String} text
     */
    text = '',

    /**
     * The text alignment.
     * @memberof Text
     * @property {String} textAlign
     */
    textAlign = '',

    /**
     * The distance between two lines of text. The value is multiplied by the texts font size.
     * @memberof Text
     * @property {Number} lineHeight
     */
    lineHeight = 1,

    /**
     * The font style.
     * @memberof Text
     * @property {String} font
     */
    font = getContext()?.font,

    /**
     * The color of the text.
     * @memberof Text
     * @property {String} color
     */

    ...props
  } = {}) {
    // cast to string
    text = '' + text;

    super.init({
      text,
      textAlign,
      lineHeight,
      font,
      ...props
    });

    // p = prerender
    if (this.context) {
      this._p();
    }

    on('init', () => {
      this.font ??= getContext().font;
      this._p();
    });
  }

  // keep width and height getters/settings so we can set _w and _h
  // and not trigger infinite call loops
  get width() {
    // w = width
    return this._w;
  }

  set width(value) {
    // d = dirty
    this._d = true;
    this._w = value;

    // fw = fixed width
    this._fw = value;
  }

  get text() {
    return this._t;
  }

  set text(value) {
    this._d = true;
    this._t = '' + value;
  }

  get font() {
    return this._f;
  }

  set font(value) {
    this._d = true;
    this._f = value;
    this._fs = parseFont(value).computed;
  }

  get lineHeight() {
    // lh = line height
    return this._lh;
  }

  set lineHeight(value) {
    this._d = true;
    this._lh = value;
  }

  render() {
    if (this._d) {
      this._p();
    }
    super.render();
  }

  /**
   * Calculate the font width, height, and text strings before rendering.
   */
  _p() {
    // s = strings
    this._s = [];
    this._d = false;
    let context = this.context;
    let text = [this.text];

    context.font = this.font;

    text = this.text.split('\n');


    if (!this._s.length && this.text.includes('\n')) {
      let width = 0;
      text.map(str => {
        this._s.push(str);
        width = Math.max(width, context.measureText(str).width);
      });

      this._w = this._fw || width;
    }

    if (!this._s.length) {
      this._s.push(this.text);
      this._w = this._fw || context.measureText(this.text).width;
    }

    this.height =
      this._fs + (this._s.length - 1) * this._fs * this.lineHeight;
    this._uw();
  }

  draw() {
    let alignX = 0;
    let textAlign = this.textAlign;
    let context = this.context;


    alignX =
      textAlign == 'right'
        ? this.width
        : textAlign == 'center'
        ? (this.width / 2) | 0
        : 0;

    this._s.map((str, index) => {
      context.textBaseline = 'top';
      context.textAlign = textAlign;
      context.fillStyle = this.color;
      context.font = this.font;



      context.fillText(
        str,
        alignX,
        this._fs * this.lineHeight * index
      );
    });
  }
}

function factory$7() {
  return new Text(...arguments);
}

/**
 * A simple pointer API. You can use it move the main sprite or respond to a pointer event. Works with both mouse and touch events.
 *
 * Pointer events can be added on a global level or on individual sprites or objects. Before an object can receive pointer events, you must tell the pointer which objects to track and the object must haven been rendered to the canvas using `object.render()`.
 *
 * After an object is tracked and rendered, you can assign it an `onDown()`, `onUp()`, `onOver()`, or `onOut()` functions which will be called whenever a pointer down, up, over, or out event happens on the object.
 *
 * ```js
 * import { initPointer, track, Sprite } from 'kontra';
 *
 * // this function must be called first before pointer
 * // functions will work
 * initPointer();
 *
 * let sprite = Sprite({
 *   onDown: function() {
 *     // handle on down events on the sprite
 *   },
 *   onUp: function() {
 *     // handle on up events on the sprite
 *   },
 *   onOver: function() {
 *     // handle on over events on the sprite
 *   },
 *   onOut: function() {
 *     // handle on out events on the sprite
 *   }
 * });
 *
 * track(sprite);
 * sprite.render();
 * ```
 *
 * By default, the pointer is treated as a circle and will check for collisions against objects assuming they are rectangular (have a width and height property).
 *
 * If you need to perform a different type of collision detection, assign the object a `collidesWithPointer()` function and it will be called instead. The function is passed the pointer object. Use this function to determine how the pointer circle should collide with the object.
 *
 * ```js
 * import { Sprite } from 'kontra';
 *
 * let sprite = Srite({
 *   x: 10,
 *   y: 10,
 *   radius: 10
 *   collidesWithPointer: function(pointer) {
 *     // perform a circle v circle collision test
 *     let dx = pointer.x - this.x;
 *     let dy = pointer.y - this.y;
 *     return Math.sqrt(dx * dx + dy * dy) < this.radius;
 *   }
 * });
 * ```
 * @sectionName Pointer
 */

/**
 * Below is a list of buttons that you can use. If you need to extend or modify this list, you can use the [pointerMap](api/gamepad#pointerMap) property.
 *
 * - left, middle, right
 * @sectionName Available Buttons
 */

// save each object as they are rendered to determine which object
// is on top when multiple objects are the target of an event.
// we'll always use the last frame's object order so we know
// the finalized order of all objects, otherwise an object could ask
// if it's being hovered when it's rendered first even if other
// objects would block it later in the render order
let pointers = new WeakMap();
let callbacks$1 = {};
let pressedButtons = {};

/**
 * A map of pointer button indices to button names. Modify this object to expand the list of [available buttons](api/pointer#available-buttons).
 *
 * ```js
 * import { pointerMap, pointerPressed } from 'kontra';
 *
 * pointerMap[2] = 'buttonWest';
 *
 * if (pointerPressed('buttonWest')) {
 *   // handle west face button
 * }
 * ```
 * @property {{[key: Number]: String}} pointerMap
 */
let pointerMap = {
  0: 'left',
  1: 'middle',
  2: 'right'
};

/**
 * Detection collision between a rectangle and a circle.
 * @see https://yal.cc/rectangle-circle-intersection-test/
 *
 * @param {Object} object - Object to check collision against.
 */
function circleRectCollision(object, pointer) {
  let { x, y, width, height } = getWorldRect(object);

  // account for camera
  do {
    x -= object.sx || 0;
    y -= object.sy || 0;
  } while ((object = object.parent));

  let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + width));
  let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + height));
  return dx * dx + dy * dy < pointer.radius * pointer.radius;
}

/**
 * Get the first on top object that the pointer collides with.
 *
 * @param {Object} pointer - The pointer object
 *
 * @returns {Object} First object to collide with the pointer.
 */
function getCurrentObject(pointer) {
  // if pointer events are required on the very first frame or
  // without a game loop, use the current frame
  let renderedObjects = pointer._lf.length
    ? pointer._lf
    : pointer._cf;

  for (let i = renderedObjects.length - 1; i >= 0; i--) {
    let object = renderedObjects[i];
    let collides = object.collidesWithPointer
      ? object.collidesWithPointer(pointer)
      : circleRectCollision(object, pointer);

    if (collides) {
      return object;
    }
  }
}

/**
 * Get the style property value.
 */
function getPropValue(style, value) {
  return parseFloat(style.getPropertyValue(value)) || 0;
}

/**
 * Calculate the canvas size, scale, and offset.
 *
 * @param {Object} The pointer object
 *
 * @returns {Object} The scale and offset of the canvas
 */
function getCanvasOffset(pointer) {
  // we need to account for CSS scale, transform, border, padding,
  // and margin in order to get the correct scale and offset of the
  // canvas
  let { canvas, _s } = pointer;
  let rect = canvas.getBoundingClientRect();

  // @see https://stackoverflow.com/a/53405390/2124254
  let transform =
    _s.transform != 'none'
      ? _s.transform.replace('matrix(', '').split(',')
      : [1, 1, 1, 1];
  let transformScaleX = parseFloat(transform[0]);
  let transformScaleY = parseFloat(transform[3]);

  // scale transform applies to the border and padding of the element
  let borderWidth =
    (getPropValue(_s, 'border-left-width') +
      getPropValue(_s, 'border-right-width')) *
    transformScaleX;
  let borderHeight =
    (getPropValue(_s, 'border-top-width') +
      getPropValue(_s, 'border-bottom-width')) *
    transformScaleY;

  let paddingWidth =
    (getPropValue(_s, 'padding-left') +
      getPropValue(_s, 'padding-right')) *
    transformScaleX;
  let paddingHeight =
    (getPropValue(_s, 'padding-top') +
      getPropValue(_s, 'padding-bottom')) *
    transformScaleY;

  return {
    scaleX: (rect.width - borderWidth - paddingWidth) / canvas.width,
    scaleY:
      (rect.height - borderHeight - paddingHeight) / canvas.height,
    offsetX:
      rect.left +
      (getPropValue(_s, 'border-left-width') +
        getPropValue(_s, 'padding-left')) *
        transformScaleX,
    offsetY:
      rect.top +
      (getPropValue(_s, 'border-top-width') +
        getPropValue(_s, 'padding-top')) *
        transformScaleY
  };
}

/**
 * Execute the onDown callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerDownHandler(evt) {
  // touchstart should be treated like a left mouse button
  let button = evt.button != null ? pointerMap[evt.button] : 'left';
  pressedButtons[button] = true;
  pointerHandler(evt, 'onDown');
}

/**
 * Execute the onUp callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerUpHandler(evt) {
  let button = evt.button != null ? pointerMap[evt.button] : 'left';
  pressedButtons[button] = false;
  pointerHandler(evt, 'onUp');
}

/**
 * Track the position of the mousevt.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function mouseMoveHandler(evt) {
  pointerHandler(evt, 'onOver');
}

/**
 * Reset pressed buttons.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function blurEventHandler$2(evt) {
  let pointer = pointers.get(evt.target);
  pointer._oo = null;
  pressedButtons = {};
}

/**
 * Call a pointer callback function
 *
 * @param {Object} pointer
 * @param {String} eventName
 * @param {MouseEvent|TouchEvent} evt
 */
function callCallback(pointer, eventName, evt) {
  // Trigger events
  let object = getCurrentObject(pointer);
  if (object && object[eventName]) {
    object[eventName](evt);
  }

  if (callbacks$1[eventName]) {
    callbacks$1[eventName](evt, object);
  }

  // handle onOut events
  if (eventName == 'onOver') {
    if (object != pointer._oo && pointer._oo && pointer._oo.onOut) {
      pointer._oo.onOut(evt);
    }

    pointer._oo = object;
  }
}

/**
 * Find the first object for the event and execute it's callback function
 *
 * @param {MouseEvent|TouchEvent} evt
 * @param {string} eventName - Which event was called.
 */
function pointerHandler(evt, eventName) {
  evt.preventDefault();

  let canvas = evt.target;
  let pointer = pointers.get(canvas);
  let { scaleX, scaleY, offsetX, offsetY } = getCanvasOffset(pointer);
  let isTouchEvent = evt.type.includes('touch');

  if (isTouchEvent) {
    // track new touches
    Array.from(evt.touches).map(
      ({ clientX, clientY, identifier }) => {
        let touch = pointer.touches[identifier];
        if (!touch) {
          touch = pointer.touches[identifier] = {
            start: {
              x: (clientX - offsetX) / scaleX,
              y: (clientY - offsetY) / scaleY
            }
          };
          pointer.touches.length++;
        }

        touch.changed = false;
      }
    );

    // handle only changed touches
    Array.from(evt.changedTouches).map(
      ({ clientX, clientY, identifier }) => {
        let touch = pointer.touches[identifier];
        touch.changed = true;
        touch.x = pointer.x = (clientX - offsetX) / scaleX;
        touch.y = pointer.y = (clientY - offsetY) / scaleY;

        callCallback(pointer, eventName, evt);
        emit('touchChanged', evt, pointer.touches);

        // remove touches
        if (eventName == 'onUp') {
          delete pointer.touches[identifier];
          pointer.touches.length--;

          if (!pointer.touches.length) {
            emit('touchEnd');
          }
        }
      }
    );
  } else {
    // translate the scaled size back as if the canvas was at a
    // 1:1 scale
    pointer.x = (evt.clientX - offsetX) / scaleX;
    pointer.y = (evt.clientY - offsetY) / scaleY;

    callCallback(pointer, eventName, evt);
  }
}

/**
 * Initialize pointer event listeners. This function must be called before using other pointer functions.
 *
 * If you need to use multiple canvas, you'll have to initialize the pointer for each one individually as each canvas maintains its own pointer object.
 * @function initPointer
 *
 * @param {Object} [options] - Pointer options.
 * @param {Number} [options.radius=5] - Radius of the pointer.
 * @param {HTMLCanvasElement} [options.canvas] - The canvas that event listeners will be attached to. Defaults to [core.getCanvas()](api/core#getCanvas).
 *
 * @returns {{x: Number, y: Number, radius: Number, canvas: HTMLCanvasElement, touches: Object}} The pointer object for the canvas.
 */
function initPointer({
  radius = 5,
  canvas = getCanvas()
} = {}) {
  let pointer = pointers.get(canvas);
  if (!pointer) {
    let style = window.getComputedStyle(canvas);

    pointer = {
      x: 0,
      y: 0,
      radius,
      touches: { length: 0 },
      canvas,

      // cf = current frame, lf = last frame, o = objects,
      // oo = over object, _s = style
      _cf: [],
      _lf: [],
      _o: [],
      _oo: null,
      _s: style
    };
    pointers.set(canvas, pointer);
  }

  // if this function is called multiple times, the same event
  // won't be added multiple times
  // @see https://stackoverflow.com/questions/28056716/check-if-an-element-has-event-listener-on-it-no-jquery/41137585#41137585
  canvas.addEventListener('mousedown', pointerDownHandler);
  canvas.addEventListener('touchstart', pointerDownHandler);
  canvas.addEventListener('mouseup', pointerUpHandler);
  canvas.addEventListener('touchend', pointerUpHandler);
  canvas.addEventListener('touchcancel', pointerUpHandler);
  canvas.addEventListener('blur', blurEventHandler$2);
  canvas.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('touchmove', mouseMoveHandler);

  // however, the tick event should only be registered once
  // otherwise it completely destroys pointer events
  if (!pointer._t) {
    pointer._t = true;

    // reset object render order on every new frame
    on('tick', () => {
      pointer._lf.length = 0;

      pointer._cf.map(object => {
        pointer._lf.push(object);
      });

      pointer._cf.length = 0;
    });
  }

  return pointer;
}

/**
 * Begin tracking pointer events for an object.
 *
 * ```js
 * import { initPointer, track } from 'kontra';
 *
 * initPointer();
 *
 * track(obj);
 * track(obj1, obj2);
 * ```
 * @function track
 *
 * @param {...(Object|Object[])[]} objects - Object to track. Can be a single object, an array of objects, or a comma-separated list of objects.
 */
function track(...objects) {
  objects.flat().map(object => {
    let canvas = object.context ? object.context.canvas : getCanvas();
    let pointer = pointers.get(canvas);


    // override the objects render function to keep track of render
    // order
    if (!object._r) {
      object._r = object.render;

      object.render = function () {
        pointer._cf.push(this);
        this._r();
      };

      pointer._o.push(object);
    }
  });
}

/**
 * An accessible button. Supports screen readers and keyboard navigation using the <kbd>Tab</kbd> key. The button is automatically [tracked](api/pointer#track) by the pointer and accepts all pointer functions, but you will still need to call [initPointer](api/pointer#initPointer) to have pointer events enabled.
 * @class Button
 * @extends Sprite
 *
 * @param {Object} [properties] - Properties of the button (in addition to all Sprite properties).
 * @param {Object} [properties.text] - Properties of [Text](api/text) which are used to create the [textNode](api/button#textNode).
 * @param {Boolean} [properties.disabled] - Whether the button is disabled when created.
 * @param {Number} [properties.padX=0] - The horizontal padding.
 * @param {Number} [properties.padY=0] - The vertical padding.
 * @param {Function} [properties.onEnable] - Function called when the button is enabled.
 * @param {Function} [properties.onDisable] - Function called when the button is disabled.
 * @param {Function} [properties.onFocus] - Function called when the button is focused by the keyboard.
 * @param {Function} [properties.onBlur] - Function called when the button losses focus either by the pointer or keyboard.
 */
class Button extends Sprite {
  /**
   * @docs docs/api_docs/button.js
   */

  init({
    /**
     * The horizontal padding. This will be added to the width to give the final width of the button.
     * @memberof Button
     * @property {Number} padX
     */
    padX = 0,

    /**
     * The vertical padding. This will be added to the height to give the final height of the button.
     * @memberof Button
     * @property {Number} padY
     */
    padY = 0,

    text,
    disabled = false,
    onDown,
    onUp,
    ...props
  } = {}) {
    super.init({
      padX,
      padY,
      ...props
    });

    /**
     * Each Button creates a Text object and adds it as a child. The `text` of the Text object is used as the accessible name of the HTMLButtonElement.
     * @memberof Button
     * @property {Text} textNode
     */
    this.textNode = factory$7({
      ...text,

      // ensure the text uses the same context as the button
      context: this.context
    });

    // if the user didn't set a width/height or use an image
    // default to the textNode dimensions
    if (!this.width) {
      this.width = this.textNode.width;
      this.height = this.textNode.height;
    }

    track(this);
    this.addChild(this.textNode);

    // od = on down
    this._od = onDown || noop;

    // ou = on up
    this._ou = onUp || noop;

    // create an accessible DOM node for screen readers
    // dn = dom node
    let button = (this._dn = document.createElement('button'));
    button.style = srOnlyStyle;
    button.textContent = this.text;

    if (disabled) {
      this.disable();
    }

    // sync events between the button element and the class
    button.addEventListener('focus', () => this.focus());
    button.addEventListener('blur', () => this.blur());
    button.addEventListener('keydown', evt => this._kd(evt));
    button.addEventListener('keyup', evt => this._ku(evt));

    addToDom(button, this.context.canvas);

    this._uw();
    this._p();
  }

  /**
   * The text property of the Text object.
   * @memberof Button
   * @property {String} text
   */
  get text() {
    return this.textNode.text;
  }

  set text(value) {
    // d = dirty
    this._d = true;
    this.textNode.text = value;
  }

  /**
   * Clean up the button by removing the HTMLButtonElement from the DOM.
   * @memberof Button
   * @function destroy
   */
  destroy() {
    this._dn.remove();
  }

  _p() {
    // update DOM node text if it has changed
    if (this.text != this._dn.textContent) {
      this._dn.textContent = this.text;
    }

    // update width and height (need to prerender the button
    // first)
    this.textNode._p();

    let width = this.textNode.width + this.padX * 2;
    let height = this.textNode.height + this.padY * 2;

    this.width = Math.max(width, this.width);
    this.height = Math.max(height, this.height);
    this._uw();
  }

  render() {
    if (this._d) {
      this._p();
    }

    super.render();
  }

  /**
   * Enable the button. Calls [onEnable](api/button#onEnable) if passed.
   * @memberof Button
   * @function enable
   */
  enable() {
    /**
     * If the button is disabled.
     * @memberof Button
     * @property {Boolean} disabled
     */
    this.disabled = this._dn.disabled = false;
    this.onEnable();
  }

  /**
   * Disable the button. A disabled button will not longer render nor respond to pointer and keyboard events. Calls [onDisable](api/button#onDisable) if passed.
   * @memberof Button
   * @function disable
   */
  disable() {
    this.disabled = this._dn.disabled = true;
    this.onDisable();
  }

  /**
   * Focus the button. Calls [onFocus](api/button#onFocus) if passed.
   * @memberof Button
   * @function focus
   */
  focus() {
    if (!this.disabled) {
      /**
       * If the button is focused.
       * @memberof Button
       * @property {Boolean} focused
       */
      this.focused = true;
      // prevent infinite loop
      if (document.activeElement != this._dn) this._dn.focus();

      this.onFocus();
    }
  }

  /**
   * Blur the button. Calls [onBlur](api/button#onBlur) if passed.
   * @memberof Button
   * @function blur
   */
  blur() {
    this.focused = false;
    // prevent infinite loop
    if (document.activeElement == this._dn) this._dn.blur();

    this.onBlur();
  }

  onOver() {
    if (!this.disabled) {
      /**
       * If the button is hovered.
       * @memberof Button
       * @property {Boolean} hovered
       */
      this.hovered = true;
    }
  }

  onOut() {
    this.hovered = false;
  }

  /**
   * Function called when then button is enabled. Override this function to have the button do something when enabled.
   * @memberof Button
   * @function onEnable
   */
  onEnable() {}

  /**
   * Function called when then button is disabled. Override this function to have the button do something when disabled.
   * @memberof Button
   * @function onDisable
   */
  onDisable() {}

  /**
   * Function called when then button is focused. Override this function to have the button do something when focused.
   * @memberof Button
   * @function onFocus
   */
  onFocus() {}

  /**
   * Function called when then button is blurred. Override this function to have the button do something when blurred.
   * @memberof Button
   * @function onBlur
   */
  onBlur() {}

  onDown() {
    if (!this.disabled) {
      /**
       * If the button is pressed.
       * @memberof Button
       * @property {Boolean} pressed
       */
      this.pressed = true;
      this._od();
    }
  }

  onUp() {
    if (!this.disabled) {
      this.pressed = false;
      this._ou();
    }
  }

  // kd = keydown
  _kd(evt) {
    // activate button on enter or space
    if (evt.code == 'Enter' || evt.code == 'Space') {
      this.onDown();
    }
  }

  // kd = keydown
  _ku(evt) {
    // activate button on enter or space
    if (evt.code == 'Enter' || evt.code == 'Space') {
      this.onUp();
    }
  }
}

/**
 * Clear the canvas.
 */
function clear(context) {
  let canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * The game loop updates and renders the game every frame. The game loop is stopped by default and will not start until the loops `start()` function is called.
 *
 * The game loop uses a time-based animation with a fixed `dt` to [avoid frame rate issues](http://blog.sklambert.com/using-time-based-animation-implement/). Each update call is guaranteed to equal 1/60 of a second.
 *
 * This means that you can avoid having to do time based calculations in your update functions and instead do fixed updates.
 *
 * ```js
 * import { Sprite, GameLoop } from 'kontra';
 *
 * let sprite = Sprite({
 *   x: 100,
 *   y: 200,
 *   width: 20,
 *   height: 40,
 *   color: 'red'
 * });
 *
 * let loop = GameLoop({
 *   update: function(dt) {
 *     // no need to determine how many pixels you want to
 *     // move every second and multiple by dt
 *     // sprite.x += 180 * dt;
 *
 *     // instead just update by how many pixels you want
 *     // to move every frame and the loop will ensure 60FPS
 *     sprite.x += 3;
 *   },
 *   render: function() {
 *     sprite.render();
 *   }
 * });
 *
 * loop.start();
 * ```
 * @class GameLoop
 *
 * @param {Object} properties - Properties of the game loop.
 * @param {(dt: Number) => void} [properties.update] - Function called every frame to update the game. Is passed the fixed `dt` as a parameter.
 * @param {Function} properties.render - Function called every frame to render the game.
 * @param {Number}   [properties.fps=60] - Desired frame rate.
 * @param {Boolean}  [properties.clearCanvas=true] - Clear the canvas every frame before the `render()` function is called.
 * @param {CanvasRenderingContext2D} [properties.context] - The context that should be cleared each frame if `clearContext` is not set to `false`. Defaults to [core.getContext()](api/core#getContext).
 * @param {Boolean} [properties.blur=false] - If the loop should still update and render if the page does not have focus.
 */
function GameLoop({
  fps = 60,
  clearCanvas = true,
  update = noop,
  render,
  context = getContext(),
  blur = false
} = {}) {
  // check for required functions

  // animation variables
  let accumulator = 0;
  let delta = 1e3 / fps; // delta between performance.now timings (in ms)
  let step = 1 / fps;
  let clearFn = clearCanvas ? clear : noop;
  let last, rAF, now, dt, loop;
  let focused = true;

  if (!blur) {
    window.addEventListener('focus', () => {
      focused = true;
    });
    window.addEventListener('blur', () => {
      focused = false;
    });
  }

  on('init', () => {
    loop.context ??= getContext();
  });

  /**
   * Called every frame of the game loop.
   */
  function frame() {
    rAF = requestAnimationFrame(frame);

    // don't update the frame if tab isn't focused
    if (!focused) return;

    now = performance.now();
    dt = now - last;
    last = now;

    // prevent updating the game with a very large dt if the game
    // were to lose focus and then regain focus later
    if (dt > 1e3) {
      return;
    }

    emit('tick');
    accumulator += dt;

    while (accumulator >= delta) {
      loop.update(step);

      accumulator -= delta;
    }

    clearFn(loop.context);
    loop.render();
  }

  // game loop object
  loop = {
    /**
     * Called every frame to update the game. Put all of your games update logic here.
     * @memberof GameLoop
     * @function update
     *
     * @param {Number} [dt] - The fixed dt time of 1/60 of a frame.
     */
    update,

    /**
     * Called every frame to render the game. Put all of your games render logic here.
     * @memberof GameLoop
     * @function render
     */
    render,

    /**
     * If the game loop is currently stopped.
     *
     * ```js
     * import { GameLoop } from 'kontra';
     *
     * let loop = GameLoop({
     *   // ...
     * });
     * console.log(loop.isStopped);  //=> true
     *
     * loop.start();
     * console.log(loop.isStopped);  //=> false
     *
     * loop.stop();
     * console.log(loop.isStopped);  //=> true
     * ```
     * @memberof GameLoop
     * @property {Boolean} isStopped
     */
    isStopped: true,

    /**
     * The context the game loop will clear. Defaults to [core.getContext()](api/core#getCcontext).
     *
     * @memberof GameLoop
     * @property {CanvasRenderingContext2D} context
     */
    context,

    /**
     * Start the game loop.
     * @memberof GameLoop
     * @function start
     */
    start() {
      last = performance.now();
      this.isStopped = false;
      requestAnimationFrame(frame);
    },

    /**
     * Stop the game loop.
     * @memberof GameLoop
     * @function stop
     */
    stop() {
      this.isStopped = true;
      cancelAnimationFrame(rAF);
    },

    // expose properties for testing
  };

  return loop;
}

/**
 * A simple keyboard API. You can use it move the main sprite or respond to a key press.
 *
 * ```js
 * import { initKeys, keyPressed } from 'kontra';
 *
 * // this function must be called first before keyboard
 * // functions will work
 * initKeys();
 *
 * function update() {
 *   if (keyPressed('arrowleft')) {
 *     // move left
 *   }
 * }
 * ```
 * @sectionName Keyboard
 */

/**
 * Below is a list of keys that are provided by default. If you need to extend this list, you can use the [keyMap](api/keyboard#keyMap) property.
 *
 * - a-z
 * - 0-9
 * - enter, esc, space, arrowleft, arrowup, arrowright, arrowdown
 * @sectionName Available Keys
 */

let keydownCallbacks = {};
let keyupCallbacks = {};
let pressedKeys = {};

/**
 * A map of [KeyboardEvent code values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values) to key names. Add to this object to expand the list of [available keys](api/keyboard#available-keys).
 *
 * ```js
 * import { keyMap, onKey } from 'kontra';
 *
 * keyMap['ControlRight'] = 'ctrl';
 *
 * onKey('ctrl', function(e) {
 *   // handle ctrl key
 * });
 * ```
 * @property {{[key in (String|Number)]: String}} keyMap
 */
let keyMap = {
  // named keys
  Enter: 'enter',
  Escape: 'esc',
  Space: 'space',
  ArrowLeft: 'arrowleft',
  ArrowUp: 'arrowup',
  ArrowRight: 'arrowright',
  ArrowDown: 'arrowdown'
};

/**
 * Call the callback handler of an event.
 * @param {Function} callback
 * @param {KeyboardEvent} evt
 */
function call(callback = noop, evt) {
  if (callback._pd) {
    evt.preventDefault();
  }
  callback(evt);
}

/**
 * Execute a function that corresponds to a keyboard key.
 *
 * @param {KeyboardEvent} evt
 */
function keydownEventHandler(evt) {
  let key = keyMap[evt.code];
  let callback = keydownCallbacks[key];
  pressedKeys[key] = true;
  call(callback, evt);
}

/**
 * Set the released key to not being pressed.
 *
 * @param {KeyboardEvent} evt
 */
function keyupEventHandler(evt) {
  let key = keyMap[evt.code];
  let callback = keyupCallbacks[key];
  pressedKeys[key] = false;
  call(callback, evt);
}

/**
 * Reset pressed keys.
 */
function blurEventHandler() {
  pressedKeys = {};
}

/**
 * Initialize keyboard event listeners. This function must be called before using other keyboard functions.
 * @function initKeys
 */
function initKeys() {
  let i;

  // alpha keys
  // @see https://stackoverflow.com/a/43095772/2124254
  for (i = 0; i < 26; i++) {
    // rollupjs considers this a side-effect (for now), so we'll do it
    // in the initKeys function
    keyMap['Key' + String.fromCharCode(i + 65)] = String.fromCharCode(
      i + 97
    );
  }

  // numeric keys
  for (i = 0; i < 10; i++) {
    keyMap['Digit' + i] = keyMap['Numpad' + i] = '' + i;
  }

  window.addEventListener('keydown', keydownEventHandler);
  window.addEventListener('keyup', keyupEventHandler);
  window.addEventListener('blur', blurEventHandler);
}

/**
 * Register a function to be called when a key is pressed. Takes a single key or an array of keys. Is passed the original [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) as a parameter.
 *
 * By default, the default action will be prevented for any bound key. To not do this, pass the `preventDefault` option.
 *
 * ```js
 * import { initKeys, onKey } from 'kontra';
 *
 * initKeys();
 *
 * onKey('p', function(e) {
 *   // pause the game
 * });
 * onKey(['enter', 'space'], function(e) {
 *   // fire gun
 * });
 * ```
 * @function onKey
 *
 * @param {String|String[]} keys - Key or keys to register.
 * @param {(evt: KeyboardEvent) => void} callback - The function to be called when the key is pressed.
 * @param {Object} [options] - Register options.
 * @param {'keydown'|'keyup'} [options.handler=keydown] - Whether to register to keydown or keyup events.
 * @param {Boolean} [options.preventDefault=true] - Call `event. preventDefault()` when the key is activated.
 */
function onKey(
  keys,
  callback,
  { handler = 'keydown', preventDefault = true } = {}
) {
  let callbacks =
    handler == 'keydown' ? keydownCallbacks : keyupCallbacks;
  // pd = preventDefault
  callback._pd = preventDefault;
  // smaller than doing `Array.isArray(keys) ? keys : [keys]`
  [].concat(keys).map(key => (callbacks[key] = callback));
}

/** Extend sprite class, add image based on asset id */
class CustomSprite extends Sprite {
    constructor(properties) {
        let image = document.querySelector(`#${properties.assetId}`);
        super({ image, ...properties });
    }
}

let ASSET_IDS = {
    MONGOL: "ml",
    SHIELD: "sh",
    SWORD: "sw",
    BOW: "bw",
    CASTLE: "cs",
    EUROPE: "eu",
    FIST: "fs",
    CLOUD: "cd",
    HORSE: "hr",
    SHELL: "sl",
    GUN: "gn",
    ICON_CASTLE: "ics",
    ICON_SCORE: "isc",
};
let GENERAL_SCALE = 2;

class Background extends GameObject {
    constructor() {
        super();
        let bg = factory$8({
            x: 0,
            y: 0,
            color: "#8caba1",
            width: this.context.canvas.width,
            height: this.context.canvas.height / 2,
        });
        let ground = factory$8({
            color: "#b3a555",
            y: this.context.canvas.height / 2 - 8,
            width: this.context.canvas.width,
            height: 8,
        });
        let cloud0 = new Cloud({ x: 100, y: 30, speed: 0.2 });
        let cloud1 = new Cloud({ x: 500, y: 90, speed: 0.1, scale: 1.3 });
        let cloud2 = new Cloud({ x: 900, y: 60, speed: 0.15 });
        let cloud3 = new Cloud({ x: -100, y: 80, speed: 0.1, scale: 0.6 });
        this.addChild([bg, ground, cloud0, cloud1, cloud2, cloud3]);
    }
}
class Cloud extends CustomSprite {
    constructor({ x, y, speed = 0.5, scale = 1, }) {
        super({ x, y, assetId: ASSET_IDS.CLOUD });
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.setScale(GENERAL_SCALE * scale);
        this.width = 100;
        this.speed = speed;
    }
    update() {
        super.update();
        if (this.x > this.context.canvas.width) {
            this.x = -this.width;
        }
        this.x += this.speed;
    }
}

let EVENTS = {
    UPDATE_BLOCK: "update-block",
    ON_GRID_OVER: "on-grid-over",
    PLACE_BLOCK: "place-block",
    STATE_CHANGE: "state-change",
    ON_START_CLICK: "on-start-click",
    SPAWN_ALLY: "spawn-ally",
    COL_SCANNED: "col-scanned",
    FINAL_COL_SCANNED: "final-col-scanned",
    PERFECT_MATCH: "perfect-match",
    FIX_GRIDS: "fix-grids",
};

let a = {
	map: [
		[
			0,
			1,
			0,
			0
		],
		[
			0,
			1,
			0,
			0
		],
		[
			0,
			1,
			0,
			0
		],
		[
			0,
			1,
			0,
			0
		]
	],
	anchor: [
		1,
		1
	],
	color: "#4b726e",
	type: "cavalry"
};
let b = {
	map: [
		[
			0,
			0,
			1,
			0
		],
		[
			0,
			1,
			1,
			0
		],
		[
			0,
			1,
			0,
			0
		],
		[
			0,
			0,
			0,
			0
		]
	],
	anchor: [
		1,
		1
	],
	color: "#77743b",
	type: "archer"
};
let c = {
	map: [
		[
			0,
			1,
			0,
			0
		],
		[
			0,
			1,
			1,
			0
		],
		[
			0,
			0,
			1,
			0
		],
		[
			0,
			0,
			0,
			0
		]
	],
	anchor: [
		1,
		1
	],
	color: "#ba9158",
	type: "archer"
};
let d = {
	map: [
		[
			0,
			0,
			0,
			0
		],
		[
			0,
			1,
			1,
			0
		],
		[
			0,
			1,
			1,
			0
		],
		[
			0,
			0,
			0,
			0
		]
	],
	anchor: [
		1,
		1
	],
	color: "#c77b58",
	type: "guarder"
};
let e = {
	map: [
		[
			0,
			1,
			0,
			0
		],
		[
			0,
			1,
			0,
			0
		],
		[
			0,
			1,
			1,
			0
		],
		[
			0,
			0,
			0,
			0
		]
	],
	anchor: [
		2,
		1
	],
	color: "#ae5d40",
	type: "infantry"
};
let f = {
	map: [
		[
			0,
			0,
			1,
			0
		],
		[
			0,
			0,
			1,
			0
		],
		[
			0,
			1,
			1,
			0
		],
		[
			0,
			0,
			0,
			0
		]
	],
	anchor: [
		2,
		2
	],
	color: "#a8984c",
	type: "infantry"
};
let g = {
	map: [
		[
			0,
			0,
			0,
			0
		],
		[
			0,
			1,
			0,
			0
		],
		[
			1,
			1,
			1,
			0
		],
		[
			0,
			0,
			0,
			0
		]
	],
	anchor: [
		2,
		1
	],
	color: "#79444a",
	type: "gunner"
};
let blockMetadata = {
	a: a,
	b: b,
	c: c,
	d: d,
	e: e,
	f: f,
	g: g
};

let TIMELINE_GRID_SIZE = 40;
let TIMELINE_ROW = 5;
let TIMELINE_COL = 20;

let INIT_BONUS = {
    attackUnit: 0,
    attackRange: 0,
    attackRate: 1,
    health: 0,
    addSolider: 0,
};
class GameManager {
    constructor() {
        Object.defineProperty(this, "blockData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "prologue"
        });
        Object.defineProperty(this, "freeGridsCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: TIMELINE_COL * TIMELINE_ROW
        });
        Object.defineProperty(this, "bonus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                ally: INIT_BONUS,
                enemy: INIT_BONUS,
            }
        });
        onKey("z", () => {
            this.rotateCurrentBlock();
        });
        on(EVENTS.ON_START_CLICK, this.onStartClick.bind(this));
    }
    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    setState(state) {
        this.state = state;
        emit(EVENTS.STATE_CHANGE, this.state);
        if (state === "prepare")
            this.reload();
    }
    reload() {
        let max = Math.floor(this.freeGridsCount / 4) + 4; // 4 is buffer for users
        this.blockData = randomPickNElements(Object.values(blockMetadata), max);
        emit(EVENTS.UPDATE_BLOCK);
    }
    shiftBlock() {
        this.blockData.shift();
        emit(EVENTS.UPDATE_BLOCK);
        if (this.blockData.length === 0) {
            this.setState("ready");
        }
    }
    onStartClick() {
        this.setState("fight");
    }
    rotateCurrentBlock() {
        let blockMetadata = this.blockData[0];
        if (!blockMetadata)
            return;
        let { map, anchor } = blockMetadata;
        let rotatedMap = rotate90DegMatrix(map);
        let rotatedAnchor = rotate90DegAnchor(anchor, map.length);
        let rotatedBlockMetadata = {
            ...blockMetadata,
            map: rotatedMap,
            anchor: rotatedAnchor,
        };
        this.blockData[0] = rotatedBlockMetadata;
        emit(EVENTS.UPDATE_BLOCK);
    }
    updateAllyBonus(gift) {
        if (gift.effect === "addSolider")
            return; // Should not have this type
        if (gift.effect === "fixGrids") {
            emit(EVENTS.FIX_GRIDS, gift.value);
            return;
        }
        if (gift.effect === "attackRate") {
            this.bonus.ally[gift.effect] *= gift.value;
            return;
        }
        this.bonus.ally[gift.effect] += gift.value;
    }
    updateEnemyBonus(gift) {
        if (gift.effect === "fixGrids")
            return; // Should not have this type
        if (gift.effect === "attackRate") {
            this.bonus.enemy[gift.effect] *= gift.value;
            return;
        }
        this.bonus.enemy[gift.effect] += gift.value;
    }
}
function randomPickNElements(elements, count) {
    let result = [];
    for (let i = 0; i < count; i++) {
        let randomIndex = Math.floor(Math.random() * elements.length);
        result.push(elements[randomIndex]);
    }
    return result;
}
function rotate90DegMatrix(matrix) {
    let rows = matrix.length;
    let cols = matrix[0].length;
    let rotatedMatrix = new Array(cols)
        .fill(null)
        .map(() => new Array(rows).fill(null));
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            rotatedMatrix[col][rows - 1 - row] = matrix[row][col];
        }
    }
    return rotatedMatrix;
}
function rotate90DegAnchor(anchor, arrayLength) {
    let newX = anchor[1];
    let newY = arrayLength - 1 - anchor[0];
    return [newX, newY];
}

class HealthBar extends Sprite {
    constructor({ maxHealth, camp = "ally", }) {
        super({
            width: 60,
            height: 16,
            color: "#4d3d44",
        });
        Object.defineProperty(this, "maxHealth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "health", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.type = "health-bar";
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        let innerBg = factory$8({
            x: 3,
            y: 3,
            width: 54,
            height: 10,
            color: "#ab9b8e",
        });
        this.inner = factory$8({
            x: 3,
            y: 3,
            width: 54,
            height: 10,
            color: camp === "ally" ? "#ae5d40" : "#927441",
        });
        this.addChild([innerBg, this.inner]);
    }
    updateMaxHealth(maxHealth) {
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.updateHealth();
    }
    takeDamage(damage) {
        this.health -= damage;
        this.updateHealth();
        return this.health <= 0 ? true : false;
    }
    updateHealth() {
        this.inner.width = (this.health / this.maxHealth) * 54;
    }
}

class DetailsBox extends GameObject {
    constructor() {
        super();
        Object.defineProperty(this, "conquered", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "conqueredText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "scoreText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        let castleIcon = new CustomSprite({
            assetId: ASSET_IDS.ICON_CASTLE,
            scaleX: GENERAL_SCALE,
            scaleY: GENERAL_SCALE,
        });
        this.conqueredText = factory$7({
            color: "#4b726e",
            font: "20px Verdana",
            text: "0",
            x: 36,
            y: 8,
        });
        let scoreIcon = new CustomSprite({
            assetId: ASSET_IDS.ICON_SCORE,
            scaleX: GENERAL_SCALE,
            scaleY: GENERAL_SCALE,
            x: 72,
        });
        this.scoreText = factory$7({
            color: "#4b726e",
            font: "20px Verdana",
            text: "0",
            x: 108,
            y: 8,
        });
        this.addChild([castleIcon, scoreIcon, this.conqueredText, this.scoreText]);
        this.x = 12;
        this.y = 12;
    }
    static getInstance() {
        if (!DetailsBox.instance) {
            DetailsBox.instance = new DetailsBox();
        }
        return DetailsBox.instance;
    }
    updateScore(score) {
        this.score += score;
        this.scoreText.text = this.score.toLocaleString();
    }
    updateConquered() {
        this.conquered++;
        this.conqueredText.text = this.conquered.toLocaleString();
    }
    render() {
        if (GameManager.getInstance().state === "prologue")
            return;
        super.render();
    }
}

class BaseAttackUnit extends GameObject {
    constructor({ camp, type, moveSpeed, moveRate, health, attackRange, attackRate, attackUnit, }) {
        super();
        Object.defineProperty(this, "camp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "moveSpeed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "moveRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseHealth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "health", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseAttackRange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "attackRange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseAttackRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "attackRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseAttackUnit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "attackUnit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "attackTarget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "healthBar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.camp = camp;
        this.type = type;
        this.moveSpeed = moveSpeed;
        this.moveRate = moveRate;
        this.baseHealth = health;
        this.health = health;
        this.baseAttackRange = attackRange;
        this.attackRange = attackRange;
        this.baseAttackRate = attackRate;
        this.attackRate = attackRate;
        this.baseAttackUnit = attackUnit;
        this.attackUnit = attackUnit;
        this.healthBar = new HealthBar({ maxHealth: this.health, camp: this.camp });
        this.healthBar.setScale(1 / GENERAL_SCALE);
        this.healthBar.y = 4;
        this.setScale(GENERAL_SCALE);
        this.placeHealthBar();
        this.y = this.context.canvas.height / 2 - 6;
        this.updateAbilities();
    }
    updateAbilities() {
        let { bonus } = GameManager.getInstance();
        this.health = this.baseHealth + bonus[this.camp].health;
        this.healthBar.updateMaxHealth(this.health);
        this.attackRange = this.baseAttackRange + bonus[this.camp].attackRange;
        this.attackRate = Math.floor(this.baseAttackRate * bonus[this.camp].attackRate);
        this.attackUnit = this.baseAttackUnit + bonus[this.camp].attackUnit;
    }
    calculateScore() {
        let { bonus } = GameManager.getInstance();
        let healthScore = this.baseHealth + bonus[this.camp].health;
        let attackRangeScore = Math.abs(this.baseAttackRange + bonus[this.camp].attackRange);
        let attackUnitScore = this.baseAttackUnit + bonus[this.camp].attackUnit;
        let attackRateScoreRatio = 60 / Math.floor(this.baseAttackRate * bonus[this.camp].attackRate);
        return Math.round((healthScore + attackRangeScore + attackUnitScore) * attackRateScoreRatio);
    }
    takeDamage(damage) {
        if (this.healthBar.health <= 0)
            return;
        let isDead = this.healthBar.takeDamage(damage);
        if (!isDead)
            return;
        this.ttl = 0;
        if (this.camp === "enemy") {
            let score = this.calculateScore();
            DetailsBox.getInstance().updateScore(score);
            if (this.type === "castle") {
                DetailsBox.getInstance().updateConquered();
            }
        }
    }
    reset() {
        if (this.type !== "castle") {
            // Should not reset castle position
            this.x = this.camp === "ally" ? 0 : this.context.canvas.width;
        }
        this.updateAbilities();
        this.timer = 0;
        this.attackTarget = null;
    }
    stop() {
        this.ttl = 0;
        this.reset();
    }
    respawn() {
        this.ttl = Infinity;
        this.reset();
    }
    jump() {
        if (this.moveSpeed === 0)
            return;
        this.y -= 2;
        setTimeout(() => (this.y += 2), 100);
    }
    attack() {
        this.attackAnim();
        setTimeout(() => {
            if (!this.attackTarget)
                return;
            this.attackTarget.takeDamage(this.attackUnit);
            if (!this.attackTarget?.isAlive())
                this.attackTarget = null;
        }, 50);
    }
    update() {
        if (!this.isAlive())
            return;
        this.timer++;
        if (this.timer % this.moveRate === 0 && !this.attackTarget) {
            this.x += this.moveSpeed;
            this.jump();
        }
        if (this.attackTarget) {
            if (this.timer % this.attackRate === 0) {
                this.jump();
                this.attack();
            }
        }
        // deal with boundary
        if (this.camp === "ally" && this.x >= this.context.canvas.width) {
            this.ttl = 0;
        }
        if (this.camp === "enemy" && this.x <= 0) {
            this.ttl = 0;
        }
    }
}

class MongolGunner extends BaseAttackUnit {
    constructor() {
        super({
            camp: "ally",
            type: "gunner",
            moveSpeed: 10,
            moveRate: 10,
            health: 6,
            attackRange: 280,
            attackRate: 120,
            attackUnit: 2,
        });
        Object.defineProperty(this, "main", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gun", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.main = new CustomSprite({
            assetId: ASSET_IDS.MONGOL,
            anchor: { x: 0.5, y: 1 },
        });
        this.gun = new CustomSprite({
            x: -10,
            y: -16,
            assetId: ASSET_IDS.GUN,
            anchor: { x: 0, y: 1 },
            attack: function () {
                this.x -= 1;
                this.rotation -= 0.3;
                setTimeout(() => {
                    this.x -= 0.5;
                    this.rotation += 0.1;
                }, 25);
                setTimeout(() => {
                    this.x += 0.5;
                    this.rotation += 0.1;
                }, 50);
                setTimeout(() => {
                    this.x += 1;
                    this.rotation += 0.1;
                }, 100);
            },
        });
        this.addChild([this.main, this.gun, this.healthBar]);
    }
    placeHealthBar() {
        this.healthBar.x = -12;
    }
    attackAnim() {
        this.gun.attack();
    }
}

class EuropeCastle extends BaseAttackUnit {
    constructor() {
        super({
            camp: "enemy",
            type: "castle",
            moveSpeed: 0,
            moveRate: 0,
            health: 100,
            attackRange: -300,
            attackRate: 40,
            attackUnit: 1,
        });
        Object.defineProperty(this, "main", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "particle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.main = new CustomSprite({
            assetId: ASSET_IDS.CASTLE,
            anchor: { x: 0.5, y: 1 },
        });
        this.particle = factory$8({
            y: -60,
            width: 5,
            height: 5,
            color: "#4b3d44",
            opacity: 0,
            anchor: { x: 0.5, y: 0.5 },
            reset: () => {
                this.particle.x = 0;
                this.particle.y = -60;
                this.particle.opacity = 0;
            },
        });
        this.addChild([this.main, this.healthBar, this.particle]);
        this.x = this.context.canvas.width - 44;
    }
    placeHealthBar() {
        this.healthBar.x = -12;
    }
    attackAnim() {
        if (!this.attackTarget)
            return;
        let particleRect = getWorldRect(this.particle);
        let targetRect = getWorldRect(this.attackTarget);
        let deltaX = particleRect.x - targetRect.x;
        let deltaY = particleRect.y - (targetRect.y - 40);
        let fly = () => {
            this.particle.x -= deltaX / 3 / GENERAL_SCALE;
            this.particle.y -= deltaY / 3 / GENERAL_SCALE;
        };
        this.particle.opacity = 1;
        setTimeout(fly, 20);
        setTimeout(fly, 40);
        setTimeout(fly, 60);
        setTimeout(() => {
            this.particle.reset();
            this.attackTarget?.takeDamage(this.attackUnit);
            if (!this.attackTarget?.isAlive())
                this.attackTarget = null;
        }, 61);
    }
    takeDamage(damage) {
        super.takeDamage(damage);
        // check win
        if (this.healthBar.health <= 0) {
            GameManager.getInstance().setState("victory");
        }
    }
}

class Infantry extends BaseAttackUnit {
    constructor({ camp, moveSpeed = 10, moveRate = 10, health = 10, attackRange = 80, attackRate = 60, attackUnit = 1, }) {
        let isAlly = camp === "ally";
        super({
            camp,
            type: "infantry",
            moveSpeed,
            moveRate,
            health,
            attackRange,
            attackRate,
            attackUnit,
        });
        Object.defineProperty(this, "main", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shield", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sword", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.shield = new CustomSprite({
            assetId: ASSET_IDS.SHIELD,
            x: isAlly ? 12 : -12,
            y: -18,
            anchor: { x: 0.5, y: 0.5 },
            scaleX: isAlly ? 1 : -1,
        });
        this.main = new CustomSprite({
            assetId: isAlly ? ASSET_IDS.MONGOL : ASSET_IDS.EUROPE,
            anchor: { x: 0.5, y: 1 },
            scaleX: isAlly ? 1 : -1,
        });
        this.sword = new CustomSprite({
            assetId: ASSET_IDS.SWORD,
            x: isAlly ? -10 : 10,
            y: -18,
            anchor: { x: 0, y: 1 },
            scaleX: isAlly ? 1 : -1,
            attack: function () {
                this.rotation = isAlly ? 0.4 : -0.4;
                setTimeout(() => (this.rotation = isAlly ? 0.8 : -0.8), 25);
                setTimeout(() => (this.rotation = isAlly ? 1 : 1), 50);
                setTimeout(() => (this.rotation = 0), 100);
            },
        });
        this.addChild([this.shield, this.main, this.sword, this.healthBar]);
        this.x = isAlly ? 0 : this.context.canvas.width;
    }
    placeHealthBar() {
        this.healthBar.x = this.camp === "ally" ? -12 : -18;
    }
    attackAnim() {
        this.sword.attack();
    }
}

class Cavalry extends Infantry {
    constructor({ camp, moveSpeed = 12, moveRate = 8, health = 12, attackRange = 80, attackRate = 60, attackUnit = 1.5, }) {
        let isAlly = camp === "ally";
        super({
            camp,
            moveSpeed,
            moveRate,
            health,
            attackRange,
            attackRate,
            attackUnit,
        });
        this.type = "cavalry";
        this.horse = new CustomSprite({
            assetId: ASSET_IDS.HORSE,
            x: isAlly ? 9 : -9,
            scaleX: isAlly ? 1 : -1,
            anchor: { x: 0.5, y: 1 },
        });
        this.children.forEach((child) => {
            if (child.type !== "health-bar")
                child.y -= 8;
        });
        this.addChild(this.horse);
    }
}

class MongolKhan extends Cavalry {
    constructor() {
        super({
            camp: "ally",
            health: 50,
            moveSpeed: 20,
            attackUnit: 10,
            attackRange: 120,
            attackRate: 50,
        });
        this.type = "khan";
        this.setScale(2.5);
        this.sword.setScale(1, 1.2);
    }
}

class Archer extends BaseAttackUnit {
    constructor({ camp }) {
        let isAlly = camp === "ally";
        super({
            camp,
            type: "archer",
            moveSpeed: isAlly ? 10 : -5,
            moveRate: 10,
            health: 8,
            attackRange: isAlly ? 200 : -200,
            attackRate: 100,
            attackUnit: isAlly ? 1.5 : 1,
        });
        Object.defineProperty(this, "main", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.hand = new CustomSprite({
            assetId: ASSET_IDS.FIST,
            x: isAlly ? 10 : -10,
            y: -20,
            scaleX: isAlly ? 1 : -1,
        });
        this.main = new CustomSprite({
            assetId: isAlly ? ASSET_IDS.MONGOL : ASSET_IDS.EUROPE,
            scaleX: isAlly ? 1 : -1,
            anchor: { x: 0.5, y: 1 },
        });
        this.bow = new CustomSprite({
            assetId: ASSET_IDS.BOW,
            x: isAlly ? -10 : 10,
            y: -18,
            scaleX: isAlly ? 1 : -1,
            anchor: { x: 0, y: 0.5 },
            attackAnim: function (x, rotation) {
                let isAlly = this.camp === "ally";
                isAlly ? (this.x += x) : (this.x -= x);
                isAlly ? (this.rotation += rotation) : (this.rotation -= rotation);
            },
            attack: function () {
                this.attackAnim(-1, -0.3);
                setTimeout(() => {
                    this.attackAnim(-0.5, 0.1);
                }, 25);
                setTimeout(() => {
                    this.attackAnim(0.5, 0.1);
                }, 50);
                setTimeout(() => {
                    this.attackAnim(1, 0.1);
                }, 100);
            },
        });
        this.addChild([this.hand, this.main, this.bow, this.healthBar]);
        this.x = isAlly ? 0 : this.context.canvas.width;
    }
    placeHealthBar() {
        this.healthBar.x = this.camp === "ally" ? -12 : -18;
    }
    attackAnim() {
        this.bow.attack();
    }
}

class Guarder extends BaseAttackUnit {
    constructor({ camp }) {
        let isAlly = camp === "ally";
        super({
            camp,
            type: "guarder",
            moveSpeed: isAlly ? 6 : -6,
            moveRate: 12,
            health: 20,
            attackRange: isAlly ? 60 : -60,
            attackRate: 60,
            attackUnit: 0.5,
        });
        Object.defineProperty(this, "shell", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "main", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.shell = new CustomSprite({
            x: isAlly ? 14 : -6,
            y: -20,
            assetId: ASSET_IDS.SHELL,
            scaleX: isAlly ? 1 : -1,
            anchor: { x: 0.5, y: 0.5 },
            attack: function () {
                this.x += 6;
                setTimeout(() => (this.x -= 3), 25);
                setTimeout(() => (this.x -= 2), 50);
                setTimeout(() => (this.x -= 1), 100);
            },
        });
        this.main = new CustomSprite({
            x: isAlly ? 0 : 8,
            assetId: isAlly ? ASSET_IDS.MONGOL : ASSET_IDS.EUROPE,
            scaleX: isAlly ? 1 : -1,
            anchor: { x: 0.5, y: 1 },
        });
        this.fist = new CustomSprite({
            assetId: ASSET_IDS.FIST,
            x: isAlly ? -9 : 18,
            y: -21,
            scaleX: isAlly ? 1 : -1,
        });
        this.addChild([this.shell, this.main, this.healthBar, this.fist]);
        this.x = isAlly ? 0 : this.context.canvas.width;
    }
    placeHealthBar() {
        this.healthBar.x = this.camp === "ally" ? -12 : -10;
    }
    attackAnim() {
        this.shell.attack();
    }
}

class GameController {
    constructor() {
        Object.defineProperty(this, "allies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "enemies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "finalColScanned", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        on(EVENTS.COL_SCANNED, this.onColScanned.bind(this));
        on(EVENTS.SPAWN_ALLY, (unitType) => {
            this.spawnAttackUnit("ally", unitType);
        });
        on(EVENTS.FINAL_COL_SCANNED, () => {
            this.finalColScanned = true;
        });
        on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
        on(EVENTS.PERFECT_MATCH, this.onPerfectMatch.bind(this));
    }
    onPerfectMatch() {
        this.spawnAttackUnit("ally", "khan");
    }
    onStateChange(state) {
        if (state === "prepare") {
            this.finalColScanned = false;
            this.allies.forEach((e) => e.stop());
            this.enemies.forEach((e) => e.stop());
        }
        if (state === "fight") {
            let castle = this.enemies.find((e) => e.type === "castle");
            if (!castle) {
                this.enemies.push(new EuropeCastle());
            }
            else {
                castle.respawn();
            }
        }
        if (state === "victory") {
            let totalAliveAllyScore = Math.round(this.allies
                .filter((e) => e.isAlive())
                .reduce((prev, current) => {
                let scores = current.calculateScore();
                return (prev += scores);
            }, 0) / 2);
            DetailsBox.getInstance().updateScore(totalAliveAllyScore);
        }
    }
    onColScanned(col) {
        let types = [
            "infantry",
            "infantry",
            "guarder",
            "guarder",
            "archer",
            "cavalry",
        ];
        let randomIndex = Math.floor(Math.random() * types.length);
        this.spawnAttackUnit("enemy", types[randomIndex]);
        let extraSoliderCount = GameManager.getInstance().bonus.enemy.addSolider;
        if (col === 10 && extraSoliderCount > 0) {
            for (let i = 0; i < extraSoliderCount; i++) {
                let randomIndex = Math.floor(Math.random() * types.length);
                this.spawnAttackUnit("enemy", types[randomIndex]);
            }
        }
    }
    spawnAttackUnit(camp, unitType) {
        let targetCamp = camp === "ally" ? this.allies : this.enemies;
        let reusableObj = targetCamp.find((e) => e.type === unitType && !e.isAlive());
        if (reusableObj) {
            reusableObj.respawn();
            return;
        }
        // Create new instance
        let unit = getAttackUnit(camp, unitType);
        targetCamp.push(unit);
    }
    update() {
        this.enemies
            .filter((e) => e.isAlive())
            .forEach((enemy) => {
            if (!enemy.attackTarget) {
                // assign attack target
                this.allies
                    .filter((e) => e.isAlive())
                    .forEach((ally) => {
                    if (enemy.x + enemy.attackRange < ally.x) {
                        enemy.attackTarget = ally;
                    }
                });
            }
            enemy.update();
        });
        let aliveAllies = this.allies.filter((e) => e.isAlive());
        aliveAllies.forEach((ally) => {
            if (!ally.attackTarget) {
                // assign attack target
                this.enemies
                    .filter((e) => e.isAlive())
                    .forEach((enemy) => {
                    if (ally.x + ally.attackRange > enemy.x) {
                        ally.attackTarget = enemy;
                    }
                });
            }
            ally.update();
        });
        // check alive allies
        if (GameManager.getInstance().state === "fight" &&
            aliveAllies.length === 0 &&
            this.finalColScanned) {
            GameManager.getInstance().setState("defeat");
        }
    }
    render() {
        this.enemies.filter((e) => e.isAlive()).forEach((enemy) => enemy.render());
        this.allies.filter((e) => e.isAlive()).forEach((ally) => ally.render());
    }
}
function getAttackUnit(camp, unitType) {
    switch (unitType) {
        case "archer":
            return camp === "ally"
                ? new Archer({ camp: "ally" })
                : new Archer({ camp: "enemy" });
        case "infantry":
            return camp === "ally"
                ? new Infantry({ camp: "ally" })
                : new Infantry({
                    camp: "enemy",
                    moveSpeed: -5,
                    attackRange: -80,
                });
        case "cavalry":
            return camp === "ally"
                ? new Cavalry({ camp: "ally" })
                : new Cavalry({
                    camp: "enemy",
                    moveSpeed: -12,
                    attackRange: -80,
                });
        case "guarder":
            return camp === "ally"
                ? new Guarder({ camp: "ally" })
                : new Guarder({ camp: "enemy" });
        case "gunner":
            if (camp === "enemy")
                throw new Error();
            return new MongolGunner();
        case "khan":
            if (camp === "enemy")
                throw new Error();
            return new MongolKhan();
        case "castle":
            throw new Error();
    }
}

class Grid extends Sprite {
    constructor({ x, y, boxSize, coord, interact = false }) {
        super({
            x,
            y,
            width: boxSize,
            height: boxSize,
            color: (coord[0] + coord[1]) % 2 === 0 ? "#ab9b8e" : "#847875",
            opacity: 0.5,
        });
        Object.defineProperty(this, "coord", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "covered", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isPointerOver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "occupiedId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "occupiedUnitType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isScanned", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "locked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        if (interact)
            track(this);
        this.covered = factory$8({
            width: boxSize,
            height: boxSize,
        });
        this.addChild(this.covered);
        this.coord = coord;
    }
    onOver() {
        if (this.isPointerOver)
            return;
        this.isPointerOver = true;
        emit(EVENTS.ON_GRID_OVER, this.coord);
    }
    onOut() {
        this.isPointerOver = false;
    }
    onDown() {
        if (this.covered.color === "transparent")
            return;
        emit(EVENTS.PLACE_BLOCK, this.coord);
    }
    setScanned() {
        this.isScanned = true;
        this.covered.color = "#847875";
    }
    setLocked() {
        this.locked = true;
        this.color = "#79444a";
        GameManager.getInstance().freeGridsCount--;
    }
    setUnlocked() {
        this.locked = false;
        this.color =
            (this.coord[0] + this.coord[1]) % 2 === 0 ? "#ab9b8e" : "#847875";
        GameManager.getInstance().freeGridsCount++;
    }
    reset() {
        this.covered.color = "transparent";
        this.isScanned = false;
        // locked is not reset til game over
        this.occupiedId = null;
        this.occupiedUnitType = null;
    }
}

class Board extends GameObject {
    constructor(row, col, gridSize, title, category) {
        super();
        Object.defineProperty(this, "grids", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        for (let i = 0; i < col; i++) {
            this.grids.push([]);
            for (let j = 0; j < row; j++) {
                let grid = new Grid({
                    x: j * gridSize,
                    y: i * gridSize,
                    boxSize: gridSize,
                    coord: [i, j],
                    interact: category === "interact",
                });
                this.grids[i].push(grid);
                this.addChild(grid);
            }
        }
        let text = factory$7({
            x: 0,
            y: -24,
            color: "#574852",
            text: title,
            font: "16px Verdana",
        });
        this.addChild(text);
    }
    init() {
        super.init({});
        this.y = this.context.canvas.height / 2 + 64;
    }
}

let DISPLAY_GRID_SIZE = 34;
let DISPLAY_ROW = 4;
class DisplayBoard extends Board {
    constructor(type) {
        super(DISPLAY_ROW, DISPLAY_ROW, DISPLAY_GRID_SIZE, type === "current" ? "Current" : "Next", "display");
        /** 4x4 2D array */
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "unitTypeText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.type = type;
        this.x = this.type === "current" ? 866 : 1028;
        this.unitTypeText = factory$7({
            x: 0,
            y: DISPLAY_GRID_SIZE * DISPLAY_ROW + 8,
            color: "#574852",
            text: "",
            font: "12px Verdana",
        });
        this.addChild(this.unitTypeText);
        on(EVENTS.UPDATE_BLOCK, this.onUpdateBlock.bind(this));
    }
    onUpdateBlock() {
        let gameManager = GameManager.getInstance();
        let targetIndex = this.type === "current" ? 0 : 1;
        let targetBlock = gameManager.blockData[targetIndex];
        if (targetBlock) {
            let { type: unitType } = targetBlock;
            this.unitTypeText.text = `Type: ${unitType}`;
            this.setBlock(targetBlock);
        }
        else {
            this.unitTypeText.text = "";
            this.clearBlock();
        }
    }
    clearBlock() {
        this.grids.flat().forEach((grid) => {
            grid.covered.color = "transparent";
        });
    }
    setBlock(targetBlock) {
        this.clearBlock();
        let { map, color } = targetBlock;
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                if (map[i][j] === 1)
                    this.grids[i][j].covered.color = color;
            }
        }
    }
}
class CurrentBlockBoard extends DisplayBoard {
    constructor() {
        super("current");
        Object.defineProperty(this, "anchorButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.anchorButton = new AnchorButton();
        this.anchorButton.onDown = () => {
            GameManager.getInstance().rotateCurrentBlock();
        };
        this.addChild(this.anchorButton);
    }
    clearBlock() {
        super.clearBlock();
        this.anchorButton.disabled = true;
        this.anchorButton.opacity = 0;
    }
    setBlock(targetBlock) {
        super.setBlock(targetBlock);
        let { anchor } = targetBlock;
        this.anchorButton.x = anchor[1] * DISPLAY_GRID_SIZE + DISPLAY_GRID_SIZE / 2;
        this.anchorButton.y = anchor[0] * DISPLAY_GRID_SIZE + DISPLAY_GRID_SIZE / 2;
        this.anchorButton.disabled = false;
        this.anchorButton.opacity = 0.6;
    }
}
class AnchorButton extends Button {
    constructor() {
        super({
            width: DISPLAY_GRID_SIZE,
            height: DISPLAY_GRID_SIZE,
            disabled: true,
            opacity: 0,
            anchor: { x: 0.5, y: 0.5 },
        });
    }
    draw() {
        this.context.beginPath();
        this.context.arc(DISPLAY_GRID_SIZE / 2, DISPLAY_GRID_SIZE / 2, 5, 0, Math.PI * 2);
        this.context.lineWidth = 4;
        this.context.strokeStyle = "#4b3d44";
        this.context.stroke();
    }
}
class NextBlockBoard extends DisplayBoard {
    constructor() {
        super("next");
        Object.defineProperty(this, "remainText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.remainText = factory$7({
            x: DISPLAY_GRID_SIZE * DISPLAY_ROW,
            y: -7,
            text: "",
            color: "#574852",
            font: "12px Verdana",
            anchor: { x: 1, y: 1 },
        });
        this.addChild(this.remainText);
    }
    onUpdateBlock() {
        super.onUpdateBlock();
        this.remainText.text = `remain: ${GameManager.getInstance().blockData.length}`;
    }
}

let MAX_X = TIMELINE_GRID_SIZE * TIMELINE_COL;
class Timeline extends Sprite {
    constructor({ width, height }) {
        super({
            width,
            height,
            color: "black",
        });
        Object.defineProperty(this, "isActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isFinished", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "scanned", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
    }
    start() {
        this.isActive = true;
    }
    reset() {
        this.isActive = false;
        this.x = 0;
        this.isFinished = false;
        this.scanned.clear();
    }
    update() {
        if (!this.isActive)
            return;
        if (this.x >= MAX_X) {
            if (!this.isFinished) {
                this.isFinished = true;
                emit(EVENTS.FINAL_COL_SCANNED);
            }
            return;
        }
        this.x += 0.3;
        let currentCol = Math.floor(this.x / TIMELINE_GRID_SIZE);
        if (currentCol >= TIMELINE_COL)
            return;
        if (this.scanned.has(currentCol))
            return;
        this.scanned.add(currentCol);
        emit(EVENTS.COL_SCANNED, currentCol);
    }
    render() {
        if (!this.isActive)
            return;
        super.render();
    }
}

class TimelineBoard extends Board {
    constructor() {
        super(TIMELINE_COL, TIMELINE_ROW, TIMELINE_GRID_SIZE, "Strategy Board", "interact");
        Object.defineProperty(this, "currentOveredCoord", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "timeline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "perfectText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ifAnyLocked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.x = 36;
        this.timeline = new Timeline({
            width: 2,
            height: TIMELINE_GRID_SIZE * TIMELINE_ROW,
        });
        this.perfectText = factory$7({
            text: "Perfect!",
            font: "24px Verdana",
            color: "white",
            anchor: { x: 0.5, y: 0.5 },
            x: (TIMELINE_GRID_SIZE * TIMELINE_COL) / 2,
            y: (TIMELINE_GRID_SIZE * TIMELINE_ROW) / 2,
            opacity: 0,
        });
        this.addChild([this.timeline, this.perfectText]);
        on(EVENTS.ON_GRID_OVER, this.onGridOver.bind(this));
        on(EVENTS.PLACE_BLOCK, this.onPlaceBlock.bind(this));
        on(EVENTS.UPDATE_BLOCK, () => {
            this.onGridOver(this.currentOveredCoord);
        });
        on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
        on(EVENTS.COL_SCANNED, this.onColScanned.bind(this));
        on(EVENTS.FINAL_COL_SCANNED, this.onFinalColScanned.bind(this));
        on(EVENTS.FIX_GRIDS, this.fixGrids.bind(this));
    }
    onStateChange(state) {
        if (state === "prepare") {
            this.timeline.reset();
            this.grids.flat().forEach((grid) => {
                grid.reset();
            });
            this.clearCoveredGrid();
        }
        if (state === "fight") {
            this.timeline.start();
        }
    }
    onColScanned(col) {
        let blockIds = new Set();
        for (let i = 0; i < this.grids.length; i++) {
            let grid = this.grids[i][col];
            if (grid.isScanned || blockIds.has(grid.occupiedId))
                continue;
            if (!grid.occupiedId && !grid.occupiedUnitType) {
                grid.setLocked();
                this.ifAnyLocked = true;
                continue;
            }
            blockIds.add(grid.occupiedId);
            setTimeout(() => {
                emit(EVENTS.SPAWN_ALLY, grid.occupiedUnitType);
            }, 500 * i);
        }
        if (blockIds.size === 0)
            return;
        // Scan rest grids
        for (let i = 0; i < this.grids.length; i++) {
            for (let j = col; j < this.grids[i].length; j++) {
                let grid = this.grids[i][j];
                if (!grid.occupiedId || grid.isScanned)
                    continue;
                if (blockIds.has(grid.occupiedId)) {
                    grid.setScanned();
                }
            }
        }
    }
    onFinalColScanned() {
        if (!this.ifAnyLocked) {
            // Perfect
            emit(EVENTS.PERFECT_MATCH);
            this.perfectText.opacity = 1;
            setTimeout(() => {
                this.perfectText.opacity = 0;
            }, 1000);
        }
        this.ifAnyLocked = false;
    }
    clearCoveredGrid() {
        this.currentOveredCoord = null;
        this.grids.flat().forEach((grid) => {
            if (!grid.occupiedId && !grid.locked) {
                grid.covered.color = "transparent";
                grid.covered.opacity = 0;
            }
        });
    }
    /** Get all relative grids' coords based on the anchor */
    getRelativeCoords(coord, blockMetadata) {
        let { map, anchor } = blockMetadata;
        let coords = [];
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                let [x, y] = [coord[0] - anchor[0] + i, coord[1] - anchor[1] + j];
                if (map[i][j] === 1) {
                    if (x < 0 || x >= this.grids.length)
                        return [];
                    if (y < 0 || y >= this.grids[x].length)
                        return [];
                    if (this.grids[x][y].occupiedId || this.grids[x][y].locked)
                        return [];
                    coords.push([x, y]);
                }
            }
        }
        return coords;
    }
    onGridOver(coord) {
        if (!coord)
            return;
        this.clearCoveredGrid();
        let gameManager = GameManager.getInstance();
        let currentBlockMetadata = gameManager.blockData[0];
        if (!currentBlockMetadata)
            return;
        this.currentOveredCoord = coord;
        let coords = this.getRelativeCoords(coord, currentBlockMetadata);
        let { color } = currentBlockMetadata;
        for (let coord of coords) {
            if (this.grids[coord[0]][coord[1]].locked)
                continue;
            this.grids[coord[0]][coord[1]].covered.color = color;
            this.grids[coord[0]][coord[1]].covered.opacity = 1;
        }
    }
    onPlaceBlock(coord) {
        let gameManager = GameManager.getInstance();
        let currentBlockMetadata = gameManager.blockData[0];
        if (!currentBlockMetadata)
            return;
        let coords = this.getRelativeCoords(coord, currentBlockMetadata);
        let { color, type } = currentBlockMetadata;
        if (coords.length === 0)
            return;
        let id = generateUUID();
        coords.forEach((coord) => {
            this.grids[coord[0]][coord[1]].covered.color = color;
            this.grids[coord[0]][coord[1]].covered.opacity = 1;
            this.grids[coord[0]][coord[1]].occupiedId = id;
            this.grids[coord[0]][coord[1]].occupiedUnitType = type;
        });
        gameManager.shiftBlock();
    }
    fixGrids(count) {
        let counter = 0;
        for (let grid of this.grids.flat()) {
            if (counter === count)
                break;
            if (grid.locked) {
                grid.setUnlocked();
                counter++;
            }
        }
    }
}
let generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0;
        let v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

class CTAButton extends Button {
    constructor({ colorScheme }) {
        super({
            anchor: { x: 0.5, y: 0.5 },
            text: {
                color: "white",
                font: "16px Verdana",
                anchor: { x: 0.5, y: 0.5 },
            },
            width: 100,
            height: 36,
        });
        Object.defineProperty(this, "colorScheme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.colorScheme = colorScheme;
    }
    draw() {
        this.context.fillStyle = this.disabled
            ? this.colorScheme.disabled
            : this.pressed
                ? this.colorScheme.pressed
                : this.hovered
                    ? this.colorScheme.hover
                    : this.colorScheme.normal;
        this.context.fillRect(0, 0, this.width, this.height);
    }
}

class BlockActionButton extends CTAButton {
    constructor() {
        super({
            colorScheme: {
                normal: "#c77b58",
                hover: "#ae5d40",
                pressed: "#79444a",
                disabled: "#ab9b8e",
            },
        });
        this.x = this.context.canvas.width - 88;
        this.y = this.context.canvas.height - 50;
        this.text = "waiting...";
        this.disabled = true;
        on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
    }
    onDown() {
        let gameManager = GameManager.getInstance();
        switch (gameManager.state) {
            case "prepare":
                gameManager.shiftBlock();
                break;
            case "ready":
                emit(EVENTS.ON_START_CLICK);
                break;
        }
    }
    onStateChange(state) {
        switch (state) {
            case "prepare":
                this.disabled = false;
                this.text = "waive";
                this.textNode.color = "white";
                break;
            case "ready":
                this.text = "start";
                break;
            case "fight":
                this.disabled = true;
                this.text = "fighting...";
                this.textNode.color = "#d2c9a5";
                break;
        }
    }
}

class StrategyController {
    constructor() {
        Object.defineProperty(this, "group", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timelineBoard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentBlockBoard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nextBlockBoard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "button", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.timelineBoard = new TimelineBoard();
        this.currentBlockBoard = new CurrentBlockBoard();
        this.nextBlockBoard = new NextBlockBoard();
        this.button = new BlockActionButton();
        this.group = [
            this.timelineBoard,
            this.currentBlockBoard,
            this.nextBlockBoard,
            this.button,
        ];
    }
    update() {
        this.group.forEach((object) => object.update());
    }
    render() {
        this.group.forEach((object) => object.render());
    }
}

let TEXT_CONFIG = {
    color: "#4b726e",
    opacity: 0,
    textAlign: "center",
    anchor: { x: 0.5, y: 0.5 },
};
let PROLOGUES = {
    PART1: "In the 13th century, the Mongol Empire marches to conquer the world.\nAs a Mongol commander,\n your duty is to arrange the blocks, each representing a soldier.",
    PART2: "The Mongol March begins; your strategy will shape history.\nLead the Empire to victory.",
};
class MainBanner extends GameObject {
    constructor() {
        super();
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prologueStep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.title = new BannerText({
            font: "36px Verdana",
            text: "Mongol March",
            y: -72,
        });
        this.body = new BannerText({
            font: "16px Verdana",
            text: PROLOGUES.PART1,
            lineHeight: 2,
            y: 12,
        });
        this.body.startFadingIn = true;
        this.title.startFadingIn = true;
        this.addChild([this.title, this.body]);
        this.x = this.context.canvas.width / 2;
        this.y = this.context.canvas.height / 3;
        on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
        setTimeout(() => {
            this.body.fadeOutInText(PROLOGUES.PART2);
        }, 3000);
        setTimeout(() => {
            GameManager.getInstance().setState("prepare");
        }, 8000);
    }
    onStateChange(state) {
        state === "prepare" || state === "ready"
            ? (this.ttl = Infinity)
            : (this.ttl = 0);
        if (state === "prepare") {
            this.title.fadeOutInText(`Wave ${DetailsBox.getInstance().conquered + 1}`);
            this.body.fadeOutInText("Place blocks into board as possible as you can\nZ: rotate the block");
        }
    }
    render() {
        if (!this.isAlive())
            return;
        super.render();
    }
}
class BannerText extends Text {
    constructor({ y, font, text, lineHeight, }) {
        super({ y, font, text, lineHeight, ...TEXT_CONFIG });
        Object.defineProperty(this, "startFadingIn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "startFadingOut", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    fadeOutInText(text) {
        this.startFadingOut = true;
        this.startFadingIn = false;
        this.fadeOutCallback = () => {
            this.text = text;
            this.startFadingIn = true;
        };
    }
    update() {
        super.update();
        if (this.startFadingIn && this.opacity < 1) {
            this.opacity += 0.01;
            if (this.opacity >= 1) {
                this.startFadingIn = false;
            }
        }
        if (this.startFadingOut && this.opacity > 0) {
            this.opacity -= 0.01;
            if (this.opacity <= 0) {
                this.startFadingOut = false;
                this.fadeOutCallback?.();
            }
        }
    }
}

let positive = [
	{
		text: "+1 attack",
		effect: "attackUnit",
		value: 1
	},
	{
		text: "+10 attack range",
		effect: "attackRange",
		value: 10
	},
	{
		text: "+5% attack rate",
		effect: "attackRate",
		value: 0.95
	},
	{
		text: "+5 health",
		effect: "health",
		value: 5
	},
	{
		text: "repair 4 grids",
		effect: "fixGrids",
		value: 4
	}
];
let negative = [
	{
		text: "+0.5 attack",
		effect: "attackUnit",
		value: 0.5
	},
	{
		text: "+5 attack range",
		effect: "attackRange",
		value: -5
	},
	{
		text: "+2% attack rate",
		effect: "attackRate",
		value: 0.98
	},
	{
		text: "+2.5 health",
		effect: "health",
		value: 2.5
	},
	{
		text: "+1 solider",
		effect: "addSolider",
		value: 1
	}
];
let giftMetadata = {
	positive: positive,
	negative: negative
};

class ResultBoard extends Sprite {
    constructor({ gameController }) {
        super({
            color: "#d2c9a5",
            anchor: { x: 0.5, y: 0.5 },
            opacity: 0.3,
        });
        Object.defineProperty(this, "gameController", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gift1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gift2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "confirmButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.width = this.context.canvas.width;
        this.height = this.context.canvas.height;
        this.x = this.context.canvas.width / 2;
        this.y = this.context.canvas.height / 2;
        this.gameController = gameController;
        let board = factory$8({
            anchor: { x: 0.5, y: 0.5 },
            color: "#4b726e",
            width: 400,
            height: 260,
        });
        this.title = factory$7({
            anchor: { x: 0.5, y: 0.5 },
            color: "#d2c9a5",
            font: "24px Verdana",
            text: "Victory",
            y: -86,
        });
        this.body = factory$7({
            anchor: { x: 0.5, y: 0 },
            color: "#d2c9a5",
            font: "16px Verdana",
            textAlign: "center",
            text: "",
            lineHeight: 1.4,
            y: -56,
        });
        this.gift1 = new GiftButton(8);
        this.gift2 = new GiftButton(36);
        this.confirmButton = new ConfirmButton(86);
        this.addChild([
            board,
            this.title,
            this.gift1,
            this.gift2,
            this.body,
            this.confirmButton,
        ]);
        on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
    }
    onStateChange(state) {
        let details = DetailsBox.getInstance();
        if (state === "victory") {
            let aliveAllies = this.gameController.allies.filter((e) => e.isAlive());
            this.body.text = `${aliveAllies.length} soldier(s) left.\nSelect a gift below or skip to next round.`;
            // Pick gifts
            let { negative, positive } = giftMetadata;
            let positiveGift1 = positive[Math.floor(Math.random() * positive.length)];
            let negativeGift1 = negative[Math.floor(Math.random() * negative.length)];
            let positiveGift2 = positive[Math.floor(Math.random() * positive.length)];
            let negativeGift2 = negative[Math.floor(Math.random() * negative.length)];
            this.gift1.setGifts(positiveGift1, negativeGift1);
            this.gift2.setGifts(positiveGift2, negativeGift2);
        }
        if (state === "defeat") {
            let bestScore = Number(localStorage.getItem("_bs") ?? 0);
            let higherScore = Math.max(details.score, bestScore);
            localStorage.setItem("_bs", higherScore.toString());
            this.title.text = "Defeat";
            this.body.text = `You have been conquered ${details.conquered} territory!\n\nScore: ${details.score.toLocaleString()}\nBest: ${higherScore.toLocaleString()}`;
            this.gift1.setDisabled();
            this.gift2.setDisabled();
            this.confirmButton.text = "restart";
        }
    }
}
class ConfirmButton extends CTAButton {
    constructor(y) {
        super({
            colorScheme: {
                normal: "#8caba1",
                hover: "#6e8e82",
                pressed: "#6e8e82",
                disabled: "#ab9b8e",
            },
        });
        this.text = "skip";
        this.y = y;
    }
    onDown() {
        let gameManager = GameManager.getInstance();
        if (gameManager.state === "victory") {
            GameManager.getInstance().setState("prepare");
        }
        if (gameManager.state === "defeat") {
            window.location.reload();
        }
    }
}
class GiftButton extends CTAButton {
    constructor(y) {
        super({
            colorScheme: {
                normal: "transparent",
                hover: "#6e8e82",
                pressed: "#6e8e82",
                disabled: "#4b726e",
            },
        });
        Object.defineProperty(this, "positiveGift", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "negativeGift", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.y = y;
        this.height = 24;
        this.textNode.font = "14px Verdana";
    }
    setGifts(positiveGift, negativeGift) {
        this.positiveGift = positiveGift;
        this.negativeGift = negativeGift;
        this.text = `ally ${positiveGift.text}, enemy ${negativeGift.text}`;
    }
    setDisabled() {
        this.disabled = true;
        this.text = "";
    }
    onDown() {
        let gameManager = GameManager.getInstance();
        if (!this.positiveGift || !this.negativeGift)
            return;
        gameManager.updateAllyBonus(this.positiveGift);
        gameManager.updateEnemyBonus(this.negativeGift);
        gameManager.setState("prepare");
    }
}

let RESULT_STATES = ["victory", "defeat"];

let { canvas } = init$1();
initPointer();
initKeys();
function resize() {
    let ctx = canvas.getContext("2d");
    let { width: w, height: h } = canvas;
    let scale = Math.min(innerWidth / w, innerHeight / h, 1);
    canvas.style.width = canvas.width * scale + "px";
    canvas.style.height = canvas.height * scale + "px";
    if (ctx)
        ctx.imageSmoothingEnabled = false;
}
(onresize = resize)();
let SVG_DATA = {
    ml: 'width="23.8" height="47.9" viewBox="0 0 23.8 47.9"><path fill="#C77B58" d="m19 33 1-1 3-5-5-9-11-1-7 12 6 3v12h3l1-2 5-3 5 5h4z"/><path fill="#D1B187" d="M22 10V9h-6l-2 11h4c2 0 4 0 4-2v-8z"/><path fill="#79444A" d="M6 48h2l1-4H6zM20 44l1 2v2h3v-4zM6 32h14v3H6z"/><path fill="#574852" d="m15 35-8 7-4-2 3-5zM16 35l4 6h4l-4-6z"/><path fill="#847875" d="M7 20h12v12H7z"/><path fill="#574852" d="m23 26-3-6H4l-4 4 8 4 8-8 4 6z"/><path fill="#C77B58" d="m22 6-7-6-8 6-3 15h13l1-15z"/><path fill="#79444A" d="M6 6h17v4H6z"/></svg>',
    sh: 'width="27.6" height="27.6" viewBox="0 0 27.6 27.6"><circle cx="13.8" cy="13.8" r="13.8" fill="#AE5D40"/><path fill="#79444A" d="M12 10h3v8h-3z"/><path fill="#D1B187" d="M12 12h3v3l-2 1h-3z"/></svg>',
    sw: 'width="8.7" height="31.6" viewBox="0 0 8.7 31.6"><path fill="#D1B187" d="m1 28-1 3 5 1 2-2-1-3H4z"/><path fill="#D2C9A5" d="M4 26V0s9 7 2 26H4z"/><path fill="#AE5D40" d="M3 26h4v1H3z"/></svg>',
    bw: 'width="30.6" height="28.2" viewBox="0 0 30.6 28.2"><path fill="#574852" d="M21.2 27.7 2.9 14.1 21.2.5l.2.3L3.6 14.1l17.8 13.3z"/><path fill="#AE5D40" d="M20.8 0s2.7 4.4 2.7 14.1-2.7 14.1-2.7 14.1 4.7-3 4.7-14.1S20.8 0 20.8 0z"/><path fill="#4D4539" d="M6.8 13.7h22.6v.8H6.8z"/><path fill="#D2C9A5" d="m30.6 14.1-3-1.7.4 1.7-.4 1.7z"/><path fill="#D1B187" d="M.7 12.8 0 15.7l4.8.8 2.3-1.9-1-2.5-2.6-.1z"/></svg>',
    cs: 'width="44" height="103.8" viewBox="0 0 44 103.8"><path fill="#BA9158" d="M44 8V0h-8v8h-4V0h-8v8h-4V0h-8v8H8V0H0v104h44z"/><path fill="#927441" d="M0 16h44v4H0zM22 48h-5s0-16 5-16 5 16 5 16h-5z"/></svg>',
    eu: 'width="23.8" height="43.8" viewBox="0 0 23.8 43.8"><path fill="#847875" d="M20 31v-3l3-5-5-10H7L0 25l6 3v12h3l1-2 5-3 5 5h4z"/><path fill="#79444A" d="M6 44h2l1-4H6z"/><path fill="#BA9158" d="M20 31V17l-1-4h-2l1 4-9 1v-5H7L6 31l-1 5h17z"/><path fill="#79444A" d="m20 40 1 2v2h3v-4zM6 28h14v3H6z"/><path fill="#AB9B8E" d="M7 5c0-3 3-5 7-5s7 2 7 5v9c0 2-1 2-4 2h-5l-5-4V5c0 1 0 0 0 0z"/><path fill="#574852" d="M13 6h8v2h-1v6h-2V8h-5z"/></svg>',
    fs: 'width="5" height="4" viewBox="0 0 5 4"><path fill="#D1B187" d="M2 0h3v3L2 4H0z"/></svg>',
    cd: 'width="59.9" height="26.4" viewBox="0 0 59.9 26.4"><path fill="#D2C9A5" d="M60 26s0-14-15-14c1 0 1-12-11-12S22 7 22 7 10 5 10 17c0 0-10 0-10 9h60z"/></svg>',
    hr: 'width="54.3" height="44.1" viewBox="0 0 54.3 44.1"><path fill="#4B3D44" d="m34 3-7 20h3l6-17V4zM12 24H5l-5 9h5l3-6h4z"/><path fill="#BA9158" d="m35 31-23 2v5h24l5-5 3-18h-2z"/><path fill="#927441" d="M41 6V0h-5v6l-6 17H12v21h4v-8l3-3h13v11h4v-8l6-21h12V6z"/><path fill="#4B3D44" d="M12 43h4v1h-4zM32 43h4v1h-4z"/></svg>',
    sl: 'width="21.9" height="37.5" viewBox="0 0 21.9 37.5"><path fill="#574852" d="M0 0h22v38H0z"/><path fill="#847875" d="M1 2h20v34H1z"/><path fill="#79444A" d="M10 16h2v8h-2z"/><path fill="#D1B187" d="M10 18h2v3l-2 1H7z"/></svg>',
    gn: 'width="38.1" height="5.7" viewBox="0 0 38.1 5.7"><path fill="#AE5D40" d="M10 0h28v5H10z"/><path fill="#4D4539" d="M3 1h7v3H3z"/><path fill="#79444A" d="M29 0h1v5h-1zM19 0h1v5h-1z"/><path fill="#D1B187" d="M1 1 0 4l5 1 2-2-1-2-2-1zM22 6V4h4v2z"/></svg>',
    ics: 'width="16" height="16" viewBox="0 0 16 16"><path fill="#4B726E" d="M10 1v2-2h2v5h-1l1 9H4l1-9H4V1h2v2-2z"/></svg>',
    isc: 'width="16" height="16" viewBox="0 0 16 16"><path fill="#4B726E" d="M4 2v10l4 3 4-3V2H4zm6 6H6l1-1-2-2h2l1-1 1 1h2L9 7l1 1z"/></svg>',
};
let imgContainer = document.getElementById("imgs");
Object.entries(SVG_DATA).forEach(([id, data]) => {
    let encoded = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" ${data}`);
    imgContainer?.insertAdjacentHTML("beforeend", `
    <img id="${id}" src="data:image/svg+xml;utf8, ${encoded}" />
  `);
});
let bg = new Background();
let mainBanner = new MainBanner();
let gameController = new GameController();
let resultBoard = new ResultBoard({ gameController });
let strategyController = new StrategyController();
let detailsBox = DetailsBox.getInstance();
let loop = GameLoop({
    update: () => {
        bg.update();
        resultBoard.update();
        if (RESULT_STATES.includes(GameManager.getInstance().state))
            return;
        mainBanner.update();
        gameController.update();
        strategyController.update();
        detailsBox.update();
    },
    render: () => {
        bg.render();
        mainBanner.render();
        gameController.render();
        strategyController.render();
        if (RESULT_STATES.includes(GameManager.getInstance().state)) {
            resultBoard.render();
        }
        detailsBox.render();
    },
});
loop.start();
