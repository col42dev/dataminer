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
require('rxjs/add/operator/retry');
require('rxjs/add/operator/timeout');
require('rxjs/add/operator/delay');
require('rxjs/add/operator/map');
var Versioning = (function () {
    function Versioning(http) {
        this.version = '0.0.59';
        this.liveVersion = '';
        this.hasLatest = 0;
        this.verifiedCallback = null;
        this.packageJSONURL = 'http://cors.io/?u=' + 'http://ec2-54-67-81-203.us-west-1.compute.amazonaws.com/dataminer/package.json'; //use proxy http://cors.io/
        this.http = http;
    }
    Versioning.prototype.verify = function (verifiedCallback) {
        var _this = this;
        this.verifiedCallback = verifiedCallback;
        this.http
            .get(this.packageJSONURL)
            .timeout(1500, new Error('versioning request response timedout'))
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.verifyLatestVersion(res); }, function (err) { return _this.verifyError(err); }, function () { return console.log('fetch live version complete'); });
    };
    Versioning.prototype.verifyError = function (err) {
        // in case of http error assume latest version is loaded.
        console.log(err);
        console.log('unable to verify that dataminer version is up to date');
        this.hasLatest = 1;
    };
    Versioning.prototype.verifyLatestVersion = function (latestVersion) {
        this.liveVersion = latestVersion['version'];
        var liveVersionIdArray = latestVersion['version'].split('.');
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
