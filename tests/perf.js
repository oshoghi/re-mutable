window.__DEV__ = true;

jest.dontMock("../index.js");

/*
describe("compare perf", function () {
    var update = require("../index.js"),
        helper = require("immutability-helper"),
        immutable = require("immutable");

    function profile (fn) {
        var start = Date.now();

        for (var i = 0; i < 500000; i += 1) {
            fn();
        }

        return (Date.now() - start) + "ms";
    }

    it("compare concat", function () {
        var state = { a: [1, 2, 3] };
        var istate = immutable.fromJS(state);

        console.log("concat 3 values on a 3 value array (re-mutable, immutability-helper, immutable):",
            profile(function () {
                update(state).concat(["a"], [4, 5, 6]).end();
            }),
            profile(function () {
                helper(state, { a: { $push: [4, 5, 6] } });
            }),
            profile(function () {
                istate.get("a").concat([4, 5, 6]);
            }));
    });

    it("compare bunch of push", function () {
        var state = { a: [1, 2, 3] };
        var istate = immutable.fromJS(state);

        console.log("push 3 values onto the state (re-mutable, immutability-helper, immutable):",
            profile(function () {
                update(state).push(["a"], 4).push(["a"], 5).push(["a"], 6).end();
            }),
            profile(function () {
                helper(state, { a: { $push: [4] } });
                helper(state, { a: { $push: [5] } });
                helper(state, { a: { $push: [6] } });
            }),
            profile(function () {
                istate.get("a").push(4).push(5).push(6);
            }));
    });

    it("set values in an object", function () {
        var state = { a: 1, b: 2, c: 3 };
        var istate = immutable.fromJS(state);

        console.log("set values in object (re-mutable, immutability-helper, immutable):",
            profile(function () {
                update(state).set(["a"], "a").set(["d"], 4).end();
            }),
            profile(function () {
                helper(state, { $set: { a: "a", c: 4 }});
            }),
            profile(function () {
                istate.set("a", "a").set("c", 4);
            }));
    });
});*/
