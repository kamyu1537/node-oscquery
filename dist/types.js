"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OscQueryAccess = exports.OscQueryType = void 0;
var OscQueryType;
(function (OscQueryType) {
    OscQueryType["INT"] = "i";
    OscQueryType["FLOAT"] = "f";
    OscQueryType["STRING"] = "s";
    OscQueryType["BLOB"] = "b";
    OscQueryType["TRUE"] = "T";
    OscQueryType["FALSE"] = "F";
    OscQueryType["NIL"] = "N";
})(OscQueryType = exports.OscQueryType || (exports.OscQueryType = {}));
var OscQueryAccess;
(function (OscQueryAccess) {
    OscQueryAccess[OscQueryAccess["NONE"] = 0] = "NONE";
    OscQueryAccess[OscQueryAccess["READ_ONLY"] = 1] = "READ_ONLY";
    OscQueryAccess[OscQueryAccess["READ_WRITE"] = 2] = "READ_WRITE";
})(OscQueryAccess = exports.OscQueryAccess || (exports.OscQueryAccess = {}));
//# sourceMappingURL=types.js.map