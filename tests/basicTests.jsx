window.__DEV__ = true;

jest.dontMock("../index.js");

describe("Re-mutable", function () {
    var update = require("../index.js");
    var data;

    function expectToThrow (fn, message) {
        let caught = false;
        let _e;

        try {
            fn();
        } catch (e) {
            caught = true;
            _e = e;
        }

        expect(caught).toBe(true);

        if (message) {
            expect(_e.message).toEqual(message);
        }
    }

    beforeEach(function () {
        data = {
            list: [
                { id: 1, name: "henry" },
                { id: 2, name: "omar" },
                { id: 3, name: "lisa" },
            ]
        };
    });

    it("doesnt mutate when pushing", function () {
        const state = { a: [1, 2, 3] };
        const next = update.push(state, ["a"], 4);

        expect(next).toEqual({ a: [1, 2, 3, 4] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when cocat'ing", function () {
        const state = { a: [1, 2, 3] };
        const next = update.concat(state, ["a"], [4, 5]);

        expect(next).toEqual({ a: [1, 2, 3, 4, 5] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when setting", function () {
        const state = { a: [1, 2, 3] };
        const next = update.set(state, ["b", "c"], "c");

        expect(next).toEqual({ a: [1, 2, 3], b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when unsetting", function () {
        const state = { a: [1, 2, 3], b: { c: "c" } };

        //unset an item in an array
        let next = update.unset(state, ["a", 1]);
        expect(next).toEqual({ a: [1, 3], b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3], b: { c: "c" } });

        //unset an item in an object
        next = update.unset(state, ["a"]);
        expect(next).toEqual({ b: { c: "c" } });
        expect(state).toEqual({ a: [1, 2, 3], b: { c: "c" } });
    });

    it("doesnt mutate when prepending", function () {
        const state = { a: [1, 2, 3] };
        const next = update.prepend(state, ["a"], [4, 5]);

        expect(next).toEqual({ a: [4, 5, 1, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when splicing", function () {
        const state = { a: [1, 2, 3] };
        let next = update.splice(state, ["a"], 1, 1);

        expect(next).toEqual({ a: [1, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update.splice(state, ["a"], 1, 0, 8, 8);
        expect(next).toEqual({ a: [1, 8, 8, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when sorting", function () {
        const state = { a: [1, 3, 2] };
        const next = update.sort(state, ["a"], function (a, b) { return a > b ? -1 : 1; });

        expect(next).toEqual({ a: [3, 2, 1] });
        expect(state).toEqual({ a: [1, 3, 2] });
    });

    it("doesnt mutate when incrementing", function () {
        const state = { a: [1, 2, 3] };
        let next = update.increment(state, ["a", 0]);

        expect(next).toEqual({ a: [2, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update.increment(state, ["a", 0], 5);
        expect(next).toEqual({ a: [6, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("doesnt mutate when decrementing", function () {
        const state = { a: [1, 2, 3] };
        let next = update.decrement(state, ["a", 0]);

        expect(next).toEqual({ a: [0, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });

        next = update.decrement(state, ["a", 0], 5);
        expect(next).toEqual({ a: [-4, 2, 3] });
        expect(state).toEqual({ a: [1, 2, 3] });
    });

    it("sets a value using a predicate", function () {
        const next = update.set(data, ["list", { id: 2 }, "name"], "george");

        expect(next).toEqual({
            list: [
                { id: 1, name: "henry" },
                { id: 2, name: "george" },
                { id: 3, name: "lisa" },
            ]
        });
    });

    it("increments using a predicate", function () {
        const next = update.increment(data, ["list", { id: 2 }, "id"]);

        expect(next).toEqual({
            list: [
                { id: 1, name: "henry" },
                { id: 3, name: "omar" },
                { id: 3, name: "lisa" },
            ]
        });
    });

    it("unsets non-existing predicate", function () {
        var next = update(data).unset(["list", { id: 5 }]).end();
        expect(next).toEqual(data)
    });

    it("doesnt create path for unset", function () {
        var next = update(data).unset(["a", "b"]).end();
        expect(next).toEqual(data);
    });

    it("unset deep predicate", function () {
        var next = update({ a: data }).unset(["a", "list", { id: 2 }]).end();
        expect(next).toEqual({
            a: {
                list: [
                    { id: 1, name: "henry" },
                    { id: 3, name: "lisa" },
                ]
            }
        })
    });

    it("merge object", function () {
        const expectedResult = {
            list: [
                { id: 1, name: "henry" },
                { id: 2, name: "omar", lastname: "jones" },
                { id: 3, name: "lisa" },
            ]
        };
        const next = update.merge(data, ["list", { id: 2 }], { lastname: "jones" });

        expect(next).toEqual(expectedResult);
        expect(update(data).merge(["list", { id: 2 }], { lastname: "jones" }).end()).toEqual(expectedResult);
        expect(update(data).merge(["list"], [{ id: 4, name: "jimbo" }]).end()).toEqual({
            list: [
                { id: 1, name: "henry" },
                { id: 2, name: "omar" },
                { id: 3, name: "lisa" },
                { id: 4, name: "jimbo" },
            ]
        })
    });

    it("throws on invalid merges", function () {
        expectToThrow(() => update.merge(data, ["list"], { a: 1 }), "Re-mutable: cannot merge array and non-array");
        expectToThrow(() => update.merge(data, ["list"], 1), "Re-mutable: cannot merge array and non-array");

        expectToThrow(() => update.merge(data, ["list", 0], 1), "Re-mutable: cannot merge hashmap with an array or scalar");
        expectToThrow(() => update.merge(data, ["list", 0], [1]), "Re-mutable: cannot merge hashmap with an array or scalar");
    });

    it("unsets with predicate", function () {
        const next = update.unset(data, ["list", { id: 2 }]);

        expect(next).toEqual({
            list: [
                { id: 1, name: "henry" },
                { id: 3, name: "lisa" },
            ]
        });
    });

    it("toggles value", function () {
        let next = update.set(data, ["bool"], false);

        next = update.toggle(next, ["bool"]);
        expect(next.bool).toEqual(true);

        next = update.toggle(next, ["bool"]);
        expect(next.bool).toEqual(false);
    });
});
