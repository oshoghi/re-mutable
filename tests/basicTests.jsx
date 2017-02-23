window.__DEV__ = true;

jest.dontMock("../index.js");

describe("Re-mutable", function () {
    var update = require("../index.js");
    var data = {
        list: [
            { id: 1, name: "henry" },
            { id: 2, name: "omar" },
            { id: 3, name: "lisa" },
        ]
    };


    it("doesnt mutate when pushing", function () {
        var state = { a: [1, 2, 3] };
        var next = update.push(state, ["a"], 4);

        expect(next).toEqual({ a: [1, 2, 3, 4] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when cocat'ing", function () {
        var state = { a: [1, 2, 3] };
        var next = update.concat(state, ["a"], [4, 5]);

        expect(next).toEqual({ a: [1, 2, 3, 4, 5] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when setting", function () {
        var state = { a: [1, 2, 3] };
        var next = update.set(state, ["b", "c"], "c");

        expect(next).toEqual({ a: [1, 2, 3], b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when unsetting", function () {
        var state = { a: [1, 2, 3], b: { c: "c" } };

        //unset an item in an array
        var next = update.unset(state, ["a", 1]);
        expect(next).toEqual({ a: [1, 3], b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3], b: { c: "c" } });

        //unset an item in an object
        next = update.unset(state, ["a"]);
        expect(next).toEqual({ b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3], b: { c: "c" } });
    });

    it("doesnt mutate when prepending", function () {
        var state = { a: [1, 2, 3] };
        var next = update.prepend(state, ["a"], [4, 5]);

        expect(next).toEqual({ a: [4, 5, 1, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when splicing", function () {
        var state = { a: [1, 2, 3] };
        var next = update.splice(state, ["a"], 1, 1);

        expect(next).toEqual({ a: [1, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update.splice(state, ["a"], 1, 0, 8, 8);
        expect(next).toEqual({ a: [1, 8, 8, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when sorting", function () {
        var state = { a: [1, 3, 2] };
        var next = update.sort(state, ["a"], function (a, b) { return a > b ? -1 : 1; });

        expect(next).toEqual({ a: [3, 2, 1] });
        expect(state).toEqual({ a: [1, 3, 2] });
    });

    it("doesnt mutate when incrementing", function () {
        var state = { a: [1, 2, 3] };
        var next = update.increment(state, ["a", 0]);

        expect(next).toEqual({ a: [2, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update.increment(state, ["a", 0], 5);
        expect(next).toEqual({ a: [6, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when decrementing", function () {
        var state = { a: [1, 2, 3] };
        var next = update.decrement(state, ["a", 0]);

        expect(next).toEqual({ a: [0, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update.decrement(state, ["a", 0], 5);
        expect(next).toEqual({ a: [-4, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("sets a value using a predicate", function () {
        var next = update.set(data, ["list", { id: 2 }, "name"], "george");

        expect(next).toEqual({
            list: [
                { id: 1, name: "henry" },
                { id: 2, name: "george" },
                { id: 3, name: "lisa" },
            ]
        });
    });

    it("increments using a predicate", function () {
        var next = update.increment(data, ["list", { id: 2 }, "id"]);

        expect(next).toEqual({
            list: [
                { id: 1, name: "henry" },
                { id: 3, name: "omar" },
                { id: 3, name: "lisa" },
            ]
        });
    });

    it("unsets with predicate", function () {
        var next = update.unset(data, ["list", { id: 2 }]);

        expect(next).toEqual({
            list: [
                { id: 1, name: "henry" },
                { id: 3, name: "lisa" },
            ]
        });
    });

    it("throws exception when trying to set a predicated that doesnt match", function () {
        var caught = false;

        try {
            var next = update.unset(data, ["list", { id: 5 }]);
        } catch (e) {
            caught = true;
        }

        expect(caught).toBe(true);
    });
});
