# re-mutable
Re-mutable is a lightweight immutability library.  There are already some excellent immutability libraries out there like immutable.js and immutability-helpers, so why reinvent the wheel? There are situations where neither are ideal:

#a) Immutable.js
 - Regular javascript types must be converted to and from their immutable.js equivalents.  This can be awkward if many parts of your code fetche regular objects and introduce them into the store.
 - You must use the equivalent apis for the immutable.js objects which take some getting used to.
 - Rarely does a slice of state from the store cleanly map to the props of every component.  More often you will extract some subset of a slice of state which requires more verbose syntax (eg. <Comp prop1={obj.get("key1")} prop2={obj.get("key2")} />)

#b) Immutability-helpers/React.update
 - This is essentially the deprecated React.update function.  While very powerful, describing your updates requires creating a nested structure of objects which can be a lot of overhead.  In our experience, updates to the store are usually isolated and simple and seldom require the power of React.update.  Most often, an action will require you to go to a specific path in the store and update a value.

#Overview
For a more detailed explation, please see the <a href="https://github.com/oshoghi/re-mutable/wiki">wiki</a>

Like other mutability libraries out there, Re-mutable is optimized through structural sharing; only parts of the store which are modified are cloned.  Re-mutable optially also supports operation chaining to prevent unnecessary cloning between calls.  Take the following example:

```js
const update = require("re-mutable");
let state = {};

update.set(state, ["a"], 1);
update.set(state, ["b"], 2);
//console.log(state) => { a: 1, b: 2 }
//the above operations will clone the root node twice because each call is unaware of eachother.  If your reducer performs
//more complicated updates to the store, it can take advantage of operation chaining to avoid these extra clones
update(state).set(["a"], 1).set(["b"], 2).end();
//this chained operation will be equivalent to the previous 2 set calls except that re-mutable will track what it has already
//cloned and not clone a second time.  The notation is also more concise.
```

#Supported functions
Re-mutable supports most common operations on your state:
  1. set/unset: Can be performed at any path in the state
   ```js
   const update = require("re-mutable");
   const state = { x: "remove me", myarray: [0, 1, 2] };
   const next = update(state)
     .set(["a"], 1)
     .unset(["x"])
     .unset(["myarray", 1]).end();

   console.log(next); //{ a: 1, myarray: [0, 2] };
   ```
  2. sort/prepend/concat/splice/push: Can be performend on any item in the store which is an array
   ```js
   const update = require("re-mutable");
   const state = { myarray: [0, 1, 2] };
   const next = update(state)
     .push(["myarray"], 2)
     .concat(["myarray"], [3, 4, 5])
     .prepend(["myarray"], [-2, -1])
     .sort(function (a, b) { return a > b ? -1 : 1; })
     .end();

   console.log(next); //{ myarray: [ 5, 4, 3, 2, 2, 1, 0, -1, -2 ] }
   ```
  3. increment/decrement: Can be performed on any numeric item in the store
   ```js
   const update = require("re-mutable");
   const state = { counts: { i: 5, j: 100 } };
   const next = update(state)
     .increment(["counts", "i"])     //default increment/decrement is 1
     .decrement(["counts", "j"], 10) //or specify the amount to increment/decrement by, here 10
     .end();

   console.log(next) //{ counts: { i: 6, j: 90 } }
   ```

   4. toggle: Can flip between true and false at the specified path
   ```
   const update = require("re-mutable");
   const state = { counts: { i: 5, j: false } };
   const next = update(state)
     .toggle(["counts", "i"])
     .toggle(["counts", "j"])
     .end();

   console.log(next) //{ counts: { i: false, j: true } }
   ```

   5. merge: Merge 2 objects together
   ```
   const update = require("re-mutable");
   const state = { employees: [{ name: "okhtay", id: 5 }] };
   const next = update.merge(state, ["employees", { id: 5 }], { lastname: "jones" });

   console.log(next); // { employees: [{ name: "okhtay", lastname: "jones", id: 5 }] };
   ```

Advanced uses:
  1. Find state by predicate:
   ```js
   const update = require("re-mutable");
   const state = { employees: [{ id: 1, name: "John", salary: 1 }, { id: 2, name: "Jane", salary: 5 } };

   //modify Jane's salary to 3 instead of the original 5
   const next = update.set(["employees", { name: "Jane" }, "salary"], 3);
   ```
