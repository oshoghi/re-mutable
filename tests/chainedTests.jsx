window.__DEV__ = true;

jest.dontMock("../index.js");

describe("Re-mutable chained tests", function () {
    var update = require("../index.js"),
        _ = require("underscore");

    it("performs composite operation", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state)
            .push(["a"], 4)
            .set(["b", "c"], { d: 1, e: 3})
            .unset(["b", "c", "e"])
            .end();

        expect(next).toEqual({ a: [1, 2, 3, 4], b: { c: { d: 1 } } });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt clones more times than necessary", function () {
        var i = 0;
        update.setClone(function (o) {
            i++;
            return _.clone(o);
        });

        var state = { a: [1, 2, 3] };
        var next = update(state)
            .push(["a"], 4)
            .push(["a"], 5)
            .end();

        //individual operators are not yet smart enough not to clone the tip before performing
        //a mutating operation
        expect(i).toEqual(3);

        i = 0;
        var next = update(state)
            .set(["b"], 1)
            .set(["c"], 2)
            .end();

        expect(i).toEqual(1);
    });

    it("doesnt mutate when pushing", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state).push(["a"], 4).end();

        expect(next).toEqual({ a: [1, 2, 3, 4] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when cocat'ing", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state).concat(["a"], [4, 5]).end();

        expect(next).toEqual({ a: [1, 2, 3, 4, 5] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when setting", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state).set(["b", "c"], "c").end();

        expect(next).toEqual({ a: [1, 2, 3], b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when unsetting", function () {
        var state = { a: [1, 2, 3], b: { c: "c" } };

        //unset an item in an array
        var next = update(state).unset(["a", 1]).end();
        expect(next).toEqual({ a: [1, 3], b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3], b: { c: "c" } });

        //unset an item in an object
        next = update(state).unset(["a"]).end();
        expect(next).toEqual({ b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3], b: { c: "c" } });
    });

    it("doesnt mutate when prepending", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state).prepend(["a"], [4, 5]).end();

        expect(next).toEqual({ a: [4, 5, 1, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when splicing", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state).splice(["a"], 1, 1).end();

        expect(next).toEqual({ a: [1, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update(state).splice(["a"], 1, 0, 8, 8).end();
        expect(next).toEqual({ a: [1, 8, 8, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when sorting", function () {
        var state = { a: [1, 3, 2] };
        var next = update(state).sort(["a"], function (a, b) { return a > b ? -1 : 1; }).end();

        expect(next).toEqual({ a: [3, 2, 1] });
        expect(state).toEqual({ a: [1, 3, 2] });
    });

    it("doesnt mutate when incrementing", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state).increment(["a", 0]).end();

        expect(next).toEqual({ a: [2, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update(state).increment(["a", 0], 5).end();
        expect(next).toEqual({ a: [6, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when decrementing", function () {
        var state = { a: [1, 2, 3] };
        var next = update(state).decrement(["a", 0]).end();

        expect(next).toEqual({ a: [0, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update(state).decrement(["a", 0], 5).end();
        expect(next).toEqual({ a: [-4, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });
});
