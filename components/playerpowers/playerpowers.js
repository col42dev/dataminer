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
var Playerpowers = (function () {
    function Playerpowers(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'https://api.myjson.com/bins/457gd?pretty=1';
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/o7sqgzj/public/values?alt=json';
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
    Playerpowers.prototype.handleImportFromGoogleDocs = function () {
        var _this = this;
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Playerpowers.prototype.handleExportToMyJSON = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.myjsonio.export2(this.myJsonUrl, this.result, 'playerPowers');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Playerpowers.prototype.handleExportToDynamoDB = function () {
        this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'playerPowers');
    };
    Playerpowers.prototype.parseGoogleDocJSON = function (res) {
        var playerPowersValues = this.result['json'];
        var title = playerPowersValues['title'];
        var version = playerPowersValues['version'];
        var lastEditDate = playerPowersValues['lastEditDate'];
        playerPowersValues['data'] = {};
        playerPowersValues['title'] = title;
        playerPowersValues['version'] = version;
        playerPowersValues['lastEditDate'] = lastEditDate;
        for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) {
            var row = {};
            var rowKeys = Object.keys(res.feed.entry[rowIndex]);
            rowKeys.forEach(function (thisKey) {
                if ((thisKey.indexOf('gsx$') === 0) && (thisKey !== 'gsx$playerpower')) {
                    var truncatedKeyName = thisKey.replace('gsx$', '');
                    var value = res.feed.entry[rowIndex][thisKey].$t;
                    if (!row.hasOwnProperty(truncatedKeyName)) {
                        row[truncatedKeyName] = {};
                    }
                    if (isNaN(value)) {
                        row[truncatedKeyName] = value;
                    }
                    else {
                        row[truncatedKeyName] = parseFloat(value);
                    }
                }
            }.bind(this));
            var playerPower = res.feed.entry[rowIndex]['gsx$playerpower'].$t;
            playerPowersValues['data'][playerPower] = row;
        }
        window.alert('Imported.');
        return { 'json': playerPowersValues, 'text': JSON.stringify(playerPowersValues, null, 2) };
    };
    Playerpowers.prototype.getColumns = function () {
        var colKeys = [];
        var playerPowerCount = Object.keys(this.result['json']['data']).length;
        var firstPlayerPowerKeyName = Object.keys(this.result['json']['data'])[0];
        var statCount = Object.keys(this.result['json']['data'][firstPlayerPowerKeyName]).length;
        colKeys.push('0');
        for (var stat = 1; stat < statCount; stat++) {
            colKeys.push(stat);
        }
        var thisColumns = [];
        colKeys.forEach(function (thisKey) {
            if (thisKey == '0') {
                thisColumns.push(new column_1.Column(thisKey, 'playerpower'));
            }
            else {
                var desc = Object.keys(this.result['json']['data'][firstPlayerPowerKeyName])[thisKey];
                thisColumns.push(new column_1.Column(thisKey, desc));
            }
        }.bind(this));
        return thisColumns;
    };
    Playerpowers.prototype.getRows = function () {
        var thisRows = [];
        var rowKeys = Object.keys(this.result['json']['data']);
        rowKeys.forEach(function (thisRowKey) {
            var row = [];
            row.push(thisRowKey);
            var statKeys = Object.keys(this.result['json']['data'][thisRowKey]);
            statKeys.forEach(function (thisStatKey) {
                var cellvalue = this.result['json']['data'][thisRowKey][thisStatKey]; // + '..' +this.result['json']['data'][thisRowKey][thisStatKey]['50']; 
                row = row.concat(cellvalue);
            }.bind(this));
            thisRows.push(row);
        }.bind(this));
        return thisRows;
    };
    Playerpowers = __decorate([
        core_1.Component({
            selector: 'playerpowers',
            templateUrl: './components/playerpowers/playerpowers.html',
            styleUrls: ['./components/playerpowers/playerpowers.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES, grid_1.Grid],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Playerpowers);
    return Playerpowers;
})();
exports.Playerpowers = Playerpowers;
