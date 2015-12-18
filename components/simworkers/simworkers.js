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
var Simworkers = (function () {
    // 
    function Simworkers(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'oxtnpr4';
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oxtnpr4/public/values?alt=json';
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import(this.myJsonUrl, function (myresult) {
            this.result = myresult;
        }.bind(this));
    }
    Simworkers.prototype.handleImportFromGoogleDocs = function () {
        var _this = this;
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Simworkers.prototype.handleExportToDynamoDB = function (evironmentFlag) {
        if (evironmentFlag === void 0) { evironmentFlag = 'live'; }
        var tables = (evironmentFlag === 'live') ? ['ptownrules', 'ptownrulestest01'] : ['ptownrulestest01'];
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export('oxtnpr4', this.result, 'simworkers', tables);
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Simworkers.prototype.parseGoogleDocJSON = function (res) {
        var simworkers = this.result['json'];
        simworkers['data'] = {};
        simworkers['data']['races'] = {};
        simworkers['data']['professions'] = {};
        console.log('length:' + res.feed.entry.length);
        var races = {};
        var professions = {};
        for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) {
            var row = {};
            var raceprofession = res.feed.entry[rowIndex].gsx$workerattribute.$t;
            var rowdata = null;
            if (raceprofession === 'Race') {
                var race = res.feed.entry[rowIndex].gsx$workerraceprofession.$t;
                if (races.hasOwnProperty(race) === false) {
                    races[race] = {};
                    races[race].levels = [];
                }
                rowdata = races[race];
            }
            else if (raceprofession === 'Profession') {
                var profession = res.feed.entry[rowIndex].gsx$workerraceprofession.$t;
                if (professions.hasOwnProperty(profession) === false) {
                    professions[profession] = {};
                    professions[profession].levels = [];
                }
                rowdata = professions[profession];
            }
            var obj = {};
            obj['cost'] = parseInt(res.feed.entry[rowIndex].gsx$workerlevelcost.$t, 10);
            obj['level'] = parseInt(res.feed.entry[rowIndex].gsx$workerlevel.$t, 10);
            obj['motives'] = {};
            for (var motiveIndex = 0; motiveIndex < 8; motiveIndex++) {
                var keyNameId = 'gsx$workermotive' + (motiveIndex + 1) + 'id';
                var keyNameAmount = 'gsx$workermotive' + (motiveIndex + 1) + 'amount';
                var motiveTypeName = res.feed.entry[rowIndex][keyNameId].$t;
                var motiveTypeAmount = parseInt(res.feed.entry[rowIndex][keyNameAmount].$t, 10);
                obj['motives'][motiveTypeName] = motiveTypeAmount;
            }
            rowdata.levels.push(obj);
        }
        simworkers['data']['races'] = races;
        simworkers['data']['professions'] = professions;
        window.alert('Updated. Now update myjson server to persist this change.');
        return { 'json': simworkers, 'text': JSON.stringify(simworkers, null, 2) };
    };
    Simworkers = __decorate([
        core_1.Component({
            selector: 'simworkers',
            templateUrl: './components/simworkers/simworkers.html',
            styleUrls: ['./components/simworkers/simworkers.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Simworkers);
    return Simworkers;
})();
exports.Simworkers = Simworkers;
