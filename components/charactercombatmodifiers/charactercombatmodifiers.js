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
var Charactercombatmodifiers = (function () {
    // 
    function Charactercombatmodifiers(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'https://api.myjson.com/bins/22cm6?pretty=1';
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oevkvmv/public/values?alt=json';
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import('oevkvmv', function (myresult) {
            this.result = myresult;
        }.bind(this));
    }
    Charactercombatmodifiers.prototype.handleImportFromGoogleDocs = function () {
        var _this = this;
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Charactercombatmodifiers.prototype.handleExportToMyJSON = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.myjsonio.export2(this.myJsonUrl, this.result, 'characterCombatModifiers');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Charactercombatmodifiers.prototype.handleExportToDynamoDB = function () {
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export("oevkvmv", this.result, 'characterCombatModifiers');
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Charactercombatmodifiers.prototype.parseGoogleDocJSON = function (res) {
        var simvalues = this.result['json'];
        var title = simvalues['title'];
        var version = simvalues['version'];
        var lastEditDate = simvalues['lastEditDate'];
        simvalues = {};
        //ensures header fields appear at start of JSON
        simvalues['title'] = title;
        simvalues['version'] = version;
        simvalues['lastEditDate'] = lastEditDate;
        simvalues['data'] = {};
        for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) {
            var row = {};
            var rowKeys = Object.keys(res.feed.entry[rowIndex]);
            rowKeys.forEach(function (thisKey) {
                if (thisKey.indexOf('gsx$') === 0) {
                    switch (thisKey) {
                        case 'gsx$characterprefab':
                        case 'gsx$combatanttype':
                            break;
                        default:
                            {
                                var truncatedKeyName = thisKey.replace('gsx$', '');
                                var value = res.feed.entry[rowIndex][thisKey].$t;
                                if (isNaN(value)) {
                                    row[truncatedKeyName] = value;
                                }
                                else {
                                    row[truncatedKeyName] = parseFloat(value);
                                }
                            }
                            break;
                    }
                }
            }.bind(this));
            var characterType = res.feed.entry[rowIndex]['gsx$characterprefab'].$t;
            if (!simvalues['data'].hasOwnProperty(characterType)) {
                simvalues['data'][characterType] = [];
            }
            simvalues['data'][characterType].push(row);
        }
        window.alert('Updated. Now update myjson server to persist this change.');
        return { 'json': simvalues, 'text': JSON.stringify(simvalues, null, 2) };
    };
    Charactercombatmodifiers.prototype.getColumns = function () {
        var rowKeys = Object.keys(this.result['json']);
        var colKeys = Object.keys(this.result['json'][rowKeys[3]]); //3 - skip past header fields!
        var thisColumns = [];
        colKeys.forEach(function (thisKey) {
            thisColumns.push(new column_1.Column(thisKey, thisKey));
        }.bind(this));
        return thisColumns;
    };
    Charactercombatmodifiers.prototype.getCharacters = function () {
        var thisCharacters = [];
        var rowKeys = Object.keys(this.result['json']);
        rowKeys.forEach(function (thisKey) {
            switch (thisKey) {
                case 'title':
                case 'version':
                case 'lastEditDate':
                    break;
                default:
                    thisCharacters.push(this.result['json'][thisKey]);
                    break;
            }
        }.bind(this));
        return thisCharacters;
    };
    Charactercombatmodifiers = __decorate([
        core_1.Component({
            selector: 'charactercombatmodifiers',
            templateUrl: './components/charactercombatmodifiers/charactercombatmodifiers.html',
            styleUrls: ['./components/charactercombatmodifiers/charactercombatmodifiers.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES, grid_1.Grid],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Charactercombatmodifiers);
    return Charactercombatmodifiers;
})();
exports.Charactercombatmodifiers = Charactercombatmodifiers;
