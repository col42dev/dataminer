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
var grid_1 = require('../grid/grid');
var column_1 = require('../grid/column');
var myjsonio_1 = require('../myjsonio/myjsonio');
var dynamodbio_1 = require('../dynamodbio/dynamodbio');
var versioning_1 = require('../versioning/versioning');
var Unlockprogression = (function () {
    // 
    function Unlockprogression(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'https://api.myjson.com/bins/28kay?pretty=1';
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oz4n58j/public/values?alt=json';
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import(this.myJsonUrl, function (myresult) {
            this.result = myresult;
            this.columns = this.getColumns();
            this.categories = this.getCategories();
        }.bind(this));
    }
    Unlockprogression.prototype.handleImportFromGoogleDocs = function () {
        var _this = this;
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Unlockprogression.prototype.handleExportToMyJSON = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.myjsonio.export2(this.myJsonUrl, this.result, 'unlockprogression');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Unlockprogression.prototype.handleExportToDynamoDB = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export('oz4n58j', this.result, 'unlockprogression');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Unlockprogression.prototype.parseGoogleDocJSON = function (res) {
        var rootNode = this.result['json'];
        rootNode['data'] = {};
        var progressions = {};
        for (var i = 0; i < res.feed.entry.length; i++) {
            var subcategory = res.feed.entry[i].gsx$subcategory.$t;
            var amounts = [];
            var level = 1;
            while (res.feed.entry[i].hasOwnProperty('gsx$p' + (level))) {
                var propnameLevel = 'gsx$p' + level;
                var amount = parseInt(res.feed.entry[i][propnameLevel].$t, 10);
                amounts.push(amount);
                level += 1;
            }
            progressions[subcategory] = amounts;
        }
        rootNode['data'] = progressions;
        window.alert('Updated. Now update myjson server to persist this change.');
        return { 'json': rootNode, 'text': JSON.stringify(rootNode, null, 2) };
    };
    Unlockprogression.prototype.getColumns = function () {
        var colKeys = [];
        var levels = this.result['json']['data'][Object.keys(this.result['json']['data'])[0]].length;
        for (var level = 0; level <= levels; level++) {
            colKeys.push(level);
        }
        var thisColumns = [];
        colKeys.forEach(function (thisKey) {
            if (thisKey == '0') {
                thisColumns.push(new column_1.Column(thisKey, 'category'));
            }
            else {
                thisColumns.push(new column_1.Column(thisKey, thisKey));
            }
        }.bind(this));
        return thisColumns;
    };
    Unlockprogression.prototype.getCategories = function () {
        var thisCharacters = [];
        var rowKeys = Object.keys(this.result['json']['data']);
        rowKeys.forEach(function (thisKey) {
            var row = [];
            row.push(thisKey);
            row = row.concat(this.result['json']['data'][thisKey]);
            thisCharacters.push(row);
        }.bind(this));
        return thisCharacters;
    };
    Unlockprogression = __decorate([
        core_1.Component({
            selector: 'unlockprogression',
            templateUrl: './components/unlockprogression/unlockprogression.html',
            styleUrls: ['./components/unlockprogression/unlockprogression.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES, grid_1.Grid],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Unlockprogression);
    return Unlockprogression;
})();
exports.Unlockprogression = Unlockprogression;
