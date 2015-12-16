var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var http_1 = require('angular2/http');
var Versioning = (function () {
    function Versioning(http) {
        this.version = '0.0.49';
        this.liveVersion = '';
        this.hasLatest = 0;
        this.verifiedCallback = null;
        this.myJSONVersionURL = 'https://api.myjson.com/bins/1t5wx';
        this.http = http;
    }
    Versioning.prototype.verify = function (verifiedCallback) {
        var _this = this;
        this.verifiedCallback = verifiedCallback;
        this.http
            .get(this.myJSONVersionURL)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.verifyLatestVersion(res); });
    };
    Versioning.prototype.verifyLatestVersion = function (latestVersion) {
        this.liveVersion = latestVersion['dataminer']['liveVersion'];
        var liveVersionIdArray = latestVersion['dataminer']['liveVersion'].split('.');
        var liveVersionMinorIndex = parseInt(liveVersionIdArray[2], 10);
        var loadedVersionIdArray = this.version.split('.');
        var loadedVersionMinorIndex = parseInt(loadedVersionIdArray[2], 10);
        this.hasLatest = (loadedVersionMinorIndex >= liveVersionMinorIndex) ? 1 : 0;
        //console.log( liveVersionIdArray[2] + ',' + loadedVersionIdArray[2]);
        if (this.verifiedCallback) {
            this.verifiedCallback(this.hasLatest);
        }
    };
    Versioning = __decorate([
        core_1.Component({
            selector: 'versioning',
            templateUrl: './components/versioning/versioning.html',
            styleUrls: ['./components/versioning/versioning.css'],
            providers: [],
            directives: [],
            pipes: []
        }), 
        __metadata('design:paramtypes', [http_1.Http])
    ], Versioning);
    return Versioning;
})();
exports.Versioning = Versioning;
