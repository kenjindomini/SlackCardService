var setup_1 = require("./setup");
"use strict";
var request = require("supertest"), expect = require("expect");
describe("Run the app", function () {
    beforeEach(function () {
        setup_1.createNewServer(this);
    });
    it("responds to /", function (done) {
        request(this.app)
            .get("/")
            .expect(200, done);
    });
    it("resets state between tests: set x equal to zero", function () {
        this.app.locals.x = 0;
    });
    it("resets state between tests", function () {
        expect(this.app.locals.x).toNotExist();
    });
    it("returns 404 for unknown routes", function (done) {
        request(this.app)
            .get("/foo/bar")
            .expect(404, done);
    });
});
//# sourceMappingURL=AppSpec.js.map