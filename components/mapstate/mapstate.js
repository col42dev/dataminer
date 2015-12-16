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
var router_1 = require('angular2/router');
var router_2 = require('angular2/router');
var myjsonio_1 = require('../myjsonio/myjsonio');
var dynamodbio_1 = require('../dynamodbio/dynamodbio');
var versioning_1 = require('../versioning/versioning');
var Mapstate = (function () {
    // 
    function Mapstate(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'https://api.myjson.com/bins/1184a?pretty=1';
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/o5onybx/public/values?alt=json';
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import(this.myJsonUrl, function (myresult) {
            this.result = myresult;
        }.bind(this));
    }
    Mapstate.prototype.handleImportFromGoogleDocs = function () {
        var _this = this;
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Mapstate.prototype.handleExportToMyJSON = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.myjsonio.export2(this.myJsonUrl, this.result, 'mapstate');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Mapstate.prototype.handleExportToDynamoDB = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'mapstate');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Mapstate.prototype.importFromGoogleDocs = function () {
        var _this = this;
        console.log('importFromGoogleDocs');
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Mapstate.prototype.parseGoogleDocJSON = function (res) {
        var mapstate = this.result['json'];
        mapstate['data'] = {};
        mapstate['data']['map'] = {};
        mapstate['data']['map']['rows'] = [];
        for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) {
            var row = [];
            var colIndex = 0;
            while (res.feed.entry[rowIndex].hasOwnProperty('gsx$h' + (colIndex + 1))) {
                var cell = res.feed.entry[rowIndex]['gsx$h' + (colIndex + 1)];
                var cellValue = cell.$t;
                if (cellValue.length == 0) {
                    cellValue = '_';
                }
                cellValue = cellValue.replace(/\s/g, '');
                row.push(cellValue);
                colIndex++;
            }
            mapstate['data']['map']['rows'].push(row);
        }
        window.alert('Updated. Now update myjson server to persist this change.');
        return { 'json': mapstate, 'text': JSON.stringify(mapstate, null, 2) };
    };
    Mapstate = __decorate([
        core_1.Component({
            selector: 'mapstate',
            templateUrl: './components/mapstate/mapstate.html',
            styleUrls: ['./components/mapstate/mapstate.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Mapstate);
    return Mapstate;
})();
exports.Mapstate = Mapstate;
