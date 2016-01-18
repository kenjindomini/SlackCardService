var app_1 = require("../../app");
var express = require("express");
function createNewServer(test) {
    test.app = app_1.setup(express());
}
exports.createNewServer = createNewServer;
//# sourceMappingURL=setup.js.map