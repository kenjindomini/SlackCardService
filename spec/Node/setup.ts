/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/mocha/mocha.d.ts" />

import {setup} from "../../app";
import {Express} from "express";
import * as Mocha from "mocha";

var express = require("express");

interface TestClass extends Mocha.ITest {
    app: Express;
}

export function createNewServer(test: TestClass): void {
    test.app = setup(express());
}
