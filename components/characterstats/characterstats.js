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
var Characterstats = (function () {
    // 
    function Characterstats(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'https://api.myjson.com/bins/339pe?pretty=1';
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/omsznkc/public/values?alt=json';
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import(this.myJsonUrl, function (myresult) {
            this.result = myresult;
            this.columns = this.getColumns();
            this.rows = this.getRows();
        }.bind(this));
    }
    Characterstats.prototype.handleImportFromGoogleDocs = function () {
        var _this = this;
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Characterstats.prototype.handleExportToMyJSON = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.myjsonio.export2(this.myJsonUrl, this.result, 'characterStats');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Characterstats.prototype.handleExportToDynamoDB = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'characterStats');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Characterstats.prototype.parseGoogleDocJSON = function (res) {
        var simvalues = this.result['json'];
        var title = simvalues['title'];
        var version = simvalues['version'];
        var lastEditDate = simvalues['lastEditDate'];
        simvalues['data'] = {};
        simvalues['title'] = title;
        simvalues['version'] = version;
        simvalues['lastEditDate'] = lastEditDate;
        for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) {
            var row = {};
            var rowKeys = Object.keys(res.feed.entry[rowIndex]);
            rowKeys.forEach(function (thisKey) {
                if (thisKey.indexOf('gsx$') === 0 && thisKey !== 'gsx$charactertype') {
                    var truncatedKeyName = thisKey.replace('gsx$', '');
                    var levelStrippedKeyName = truncatedKeyName.match(/([a-z]+)\d+$/)[1];
                    var level = truncatedKeyName.match(/[a-z]+(\d+)$/)[1];
                    var value = res.feed.entry[rowIndex][thisKey].$t;
                    if (!row.hasOwnProperty(levelStrippedKeyName)) {
                        row[levelStrippedKeyName] = {};
                    }
                    if (isNaN(value)) {
                        row[levelStrippedKeyName][level] = value;
                    }
                    else {
                        row[levelStrippedKeyName][level] = parseFloat(value);
                    }
                }
            }.bind(this));
            var characterType = res.feed.entry[rowIndex]['gsx$charactertype'].$t;
            simvalues['data'][characterType] = row;
        }
        window.alert('Imported.');
        return { 'json': simvalues, 'text': JSON.stringify(simvalues, null, 2) };
    };
    Characterstats.prototype.getColumns = function () {
        var colKeys = [];
        var characterCount = Object.keys(this.result['json']['data']).length;
        var firstCharacterKeyName = Object.keys(this.result['json']['data'])[0];
        var statCount = Object.keys(this.result['json']['data'][firstCharacterKeyName]).length;
        colKeys.push('0');
        for (var stat = 1; stat < statCount; stat++) {
            colKeys.push(stat);
        }
        var thisColumns = [];
        colKeys.forEach(function (thisKey) {
            if (thisKey == '0') {
                thisColumns.push(new column_1.Column(thisKey, 'character'));
            }
            else {
                var desc = Object.keys(this.result['json']['data'][firstCharacterKeyName])[thisKey];
                thisColumns.push(new column_1.Column(thisKey, desc));
            }
        }.bind(this));
        return thisColumns;
    };
    Characterstats.prototype.getRows = function () {
        var thisRows = [];
        var rowKeys = Object.keys(this.result['json']['data']);
        rowKeys.forEach(function (thisRowKey) {
            var row = [];
            row.push(thisRowKey);
            var statKeys = Object.keys(this.result['json']['data'][thisRowKey]);
            statKeys.forEach(function (thisStatKey) {
                var cellvalue = this.result['json']['data'][thisRowKey][thisStatKey]['1']; // + '..' +this.result['json']['data'][thisRowKey][thisStatKey]['50']; 
                row = row.concat(cellvalue);
            }.bind(this));
            thisRows.push(row);
        }.bind(this));
        return thisRows;
    };
    Characterstats = __decorate([
        core_1.Component({
            selector: 'characterstats',
            templateUrl: './components/characterstats/characterstats.html',
            styleUrls: ['./components/characterstats/characterstats.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES, grid_1.Grid],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Characterstats);
    return Characterstats;
})();
exports.Characterstats = Characterstats;
