var noContext = {};
var clone = function (obj) {
    if (typeof(obj) === "object") {
        if (Array.prototype.isPrototypeOf(obj)) {
            return obj.slice();
        } else {
            var newObj = {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    newObj[k] = obj[k];
                }
            }
            return newObj;
        }
    }

    return obj;
}

function resolveAndClone (state, parts) {
    var original = this;

    for (var i = 0; i < parts.length - 1; i += 1) {
        switch (typeof(state[parts[i]])) {
            case "undefined":
                state[parts[i]] = {};
                break;
            case "object":
                //dont clone if a previous operation has already causes a clone
                if (this === noContext || (original && original[parts[i]] === state[parts[i]])) {
                    state[parts[i]] = clone(state[parts[i]]);
                }
                break;
            default:
                throw "trying to set sub-state on non-object";
        }

        if (original) {
            original = original[parts[i]];
        }
        state = state[parts[i]];
    }

    return state;
}

function modify (state, path, fn) {
    if (this === noContext) {
        state = clone(state);
    }

    var parts = Array.prototype.isPrototypeOf(path) ? path : path.split(".");
    var tip = parts.length > 1 ? resolveAndClone.call(this, state, parts) : state;
    var lastKey = parts[parts.length - 1];

    fn.call(this, tip, lastKey);

    return this !== noContext ? chain(this, state) : state;
}

/**
 * @typedef {string|string[]} path
 * @example
 * var state = { path: { to: { num: 1} } };
 * var strPath = "path.to.num"
 * var arrPath = ["path", "to", "num"]
 */

/**
 * @function unset
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3], b: 1 };
 *
 * console.log(update.unset(state, ["b"]));
 * //=> { a: [1, 2, 3] }
 *
 * console.log(update.unset(state, ["a", 1]));
 * //=> { a: [1, 3] }
 */
function unset (state, path) {
    return modify.call(this, state, path, function (tip, lastKey) {
        if (Array.prototype.isPrototypeOf(tip)) {
            tip.splice(lastKey, 1);
        } else {
            delete tip[lastKey];
        }
    });
};

/**
 * @function set
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {*} val - The value to set at the specified path
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.set(state, ["b", "c"], 1));
 * //=> { a: [1, 2, 3], b: { c: 1 } }
 */
function set (state, path, val) {
    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] = val;
    });
};

/**
 * @function decrement
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {number} [by=1] - The amount to decrement by
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.decrement(state, ["a", 0], 3));
 * //=> { a: [-2, 2, 3] }
 */
function decrement (state, path, by) {
    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] -= (by || 1);
    });
}

/**
 * @function increment
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {number} [by=1] - The amount to increment by
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.increment(state, ["a", 0], 3));
 * //=> { a: [4, 2, 3] }
 */
function increment (state, path, by) {
    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] += (by || 1);
    });
}

/**
 * @function concat
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {*} items - The items to concat onto the array at the given path
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.concat(state, ["a"], [4, 5]));
 * //=> { a: [1, 2, 3, 4, 5] }
 */
function concat (state, path, items) {
    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] = tip[lastKey].concat(items);
    });
}

/**
 * @function prepend
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {*} items - The items to prepend onto the array at the given path
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.prepend(state, ["a"], [4, 5]));
 * //=> { a: [4, 5, 1, 2, 3] }
 */
function prepend (state, path, items) {
    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] = items.concat(tip[lastKey]);
    });
}

/**
 * @function prepend
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {*} items - The items to prepend onto the array at the given path
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.prepend(state, ["a"], [4, 5]));
 * //=> { a: [4, 5, 1, 2, 3] }
 */
function sort (state, path, sortFn) {
    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] = clone(tip[lastKey]);
        tip[lastKey] = tip[lastKey].sort(sortFn);
    });
}

/**
 * @function splice
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {number} index -  An integer that specifies at what position to add/remove items, Use negative values to specify the position from the end of the array
 * @param {number} howMany - The number of items to be removed. If set to 0, no items will be removed
 * @param {...*} [items] - items to splice in
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.splice(state, ["a"], 0, 0, 0));
 * //=> { a: [0, 1, 2, 3] }
 */
function splice (state, path) {
    var args = arguments;

    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] = clone(tip[lastKey]);
        tip[lastKey].splice.apply(tip[lastKey], Array.prototype.slice.call(args, 2, args.length));
    });
}

/**
 * @function push
 * @param {object} state - The starting state
 * @param {path} path - The path may be an array or keys or a dot delimited string
 * @param {*} item - The item to push onto the array
 * @returns {object} either the next state or the remutable object, depending on usage
 * @example
 * var update = require("re-mutable");
 * var state = { a: [1, 2, 3] };
 *
 * console.log(update.push(state, ["a"], 4));
 * //=> { a: [1, 2, 3, 4] }
 */
function push (state, path, item) {
    return modify.call(this, state, path, function (tip, lastKey) {
        tip[lastKey] = clone(tip[lastKey]);
        tip[lastKey].push(item);
    });
}

function chain (original, state) {
    return {
        original: original,
        set: function (path, val) {
            return set.call(original, state, path, val);
        },
        unset: function (path) {
            return unset.call(original, state, path);
        },
        increment: function (path, by) {
            return increment.call(original, state, path, by);
        },
        decrement: function (path, by) {
            return decrement.call(original, state, path, by);
        },
        concat: function (path, items) {
            return concat.call(original, state, path, items);
        },
        prepend: function (path, items) {
            return prepend.call(original, state, path, items);
        },
        push: function (path, item) {
            return push.call(original, state, path, item);
        },
        splice: function () {
            return splice.apply(original, [state].concat(Array.prototype.slice.call(arguments)));
        },
        sort: function (path, fn) {
            return sort.call(original, state, path, fn);
        },
        end: function () {
            return state;
        }
    };
}

function start (state) {
    var next = clone(state);

    return chain(state, next);
}

start.set = set.bind(noContext);
start.unset = unset.bind(noContext);
start.increment = increment.bind(noContext);
start.decrement = decrement.bind(noContext);
start.prepend = prepend.bind(noContext);
start.concat = concat.bind(noContext);
start.splice = splice.bind(noContext);
start.sort = sort.bind(noContext);
start.push = push.bind(noContext);
start.setClone = function (c) { clone = c; }

module.exports = start;
