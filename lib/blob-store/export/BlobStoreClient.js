"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlobStoreTypes = void 0;
var S3 = require("aws-sdk/clients/s3");
var BlobStoreTypes;
(function (BlobStoreTypes) {
    BlobStoreTypes["S3"] = "s3";
})(BlobStoreTypes = exports.BlobStoreTypes || (exports.BlobStoreTypes = {}));
function createS3Client() {
    return new S3({
        region: process.env.AWS_DEFAULT_REGION || 'eu-west-1'
    });
}
var S3BlobStoreClient = /** @class */ (function () {
    function S3BlobStoreClient(bucketName, keyPrefix, client) {
        if (keyPrefix === void 0) { keyPrefix = ''; }
        if (client === void 0) { client = createS3Client(); }
        this.bucketName = bucketName;
        this.keyPrefix = keyPrefix;
        this.client = client;
    }
    S3BlobStoreClient.prototype.uploadFile = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var params, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            Bucket: this.bucketName,
                            Key: this.keyPrefix + file.name,
                            Body: file.data
                        };
                        return [4 /*yield*/, this.client.upload(params).promise()];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    S3BlobStoreClient.prototype.getFile = function (key) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    S3BlobStoreClient.prototype.getFiles = function (keyPrefix) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return S3BlobStoreClient;
}());
var blobStoreClientTypeMap = (_a = {},
    _a[BlobStoreTypes.S3] = S3BlobStoreClient,
    _a);
function createBlobStoreClient(type) {
    var _a;
    var params = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        params[_i - 1] = arguments[_i];
    }
    if (type in blobStoreClientTypeMap) {
        return new ((_a = blobStoreClientTypeMap[type]).bind.apply(_a, __spreadArray([void 0], params, false)))();
    }
    throw new Error("Invalid blobStoreClient type: ".concat(type));
}
exports.default = createBlobStoreClient;
