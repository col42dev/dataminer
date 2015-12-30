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
var Dynamicworksheets = (function () {
    // 
    function Dynamicworksheets(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/worksheets/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/public/basic?alt=json';
        this.dynamicWorksheetNames = [];
        this.dynamicWorksheets = [];
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.dynamicWorksheetNames = [];
        this.dynamicWorksheets = [];
    }
    Dynamicworksheets.prototype.handleImportDynamicWorksheets = function () {
        var _this = this;
        console.log('handleImportDynamicWorksheets');
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.populateDynamicWorksheetsList(res); });
    };
    Dynamicworksheets.prototype.handleImportFromGoogleDocs = function (worksheetName) {
        var _this = this;
        console.log('importFromGoogleDocs' + worksheetName);
        var worksheetKey = '';
        this.dynamicWorksheets.forEach(function (worksheet) {
            if (worksheet['title']['$t'] === worksheetName) {
                worksheetKey = worksheet['key'];
            }
        });
        this.dynamicWorksheetNames = [worksheetName];
        var url = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/' + worksheetKey + '/public/values?alt=json';
        console.log(url);
        this.http
            .get(url)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res, worksheetKey); });
    };
    Dynamicworksheets.prototype.populateDynamicWorksheetsList = function (googleWorksheetJSON) {
        this.dynamicWorksheetNames = [];
        this.dynamicWorksheets = [];
        for (var rowIndex = 0; rowIndex < googleWorksheetJSON.feed.entry.length; rowIndex++) {
            var dynamic = {};
            if (googleWorksheetJSON.feed.entry[rowIndex]['title']['$t'].match(/^\_/)) {
                dynamic['title'] = googleWorksheetJSON.feed.entry[rowIndex]['title'];
                dynamic['content'] = googleWorksheetJSON.feed.entry[rowIndex]['content'];
                var re = new RegExp("https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/(.*)/public/basic");
                var match = re.exec(googleWorksheetJSON.feed.entry[rowIndex]['link'][0]['href']);
                if (match) {
                    dynamic['key'] = match[1];
                }
                this.dynamicWorksheetNames.push(googleWorksheetJSON.feed.entry[rowIndex]['title']['$t']);
                this.dynamicWorksheets.push(dynamic);
            }
        }
        //window.alert('Import complete. Now export to persist this change.');
        return; // { 'json':this.dynamicWorksheets, 'text':JSON.stringify(this.dynamicWorksheets, null, 2)};
    };
    Dynamicworksheets.prototype.handleExportToDynamoDB = function (evironmentFlag) {
        if (evironmentFlag === void 0) { evironmentFlag = 'live'; }
        var tables = (evironmentFlag === 'live') ? ['ptownrules', 'ptownrulestest01'] : ['ptownrulestest01'];
        console.log(this.result['worksheetKey'] + ', ' + this.result['title']);
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export(this.result['worksheetKey'], this.result, this.result['title'], tables);
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Dynamicworksheets.prototype.parseGoogleDocJSON = function (res, worksheetKey) {
        if (!this.result.hasOwnProperty('comment')) {
            this.result['comment'] = 'no comment';
        }
        var simvalues = this.result['json'];
        simvalues['data'] = {};
        simvalues['data']['rows'] = [];
        simvalues['data']['keys'] = {};
        var rowIndex = 0;
        for (var row in res.feed.entry) {
            var key = res.feed.entry[row]['title']['$t'];
            simvalues['data']['keys'][key] = {};
            var thisRow = {};
            thisRow[key] = {};
            for (var col in res.feed.entry[0]) {
                var value = res.feed.entry[row]['title']['$t'];
                if (!isNaN(value)) {
                    value = parseInt(value, 10);
                }
                Object.keys(value).forEach(function (subvalue) {
                    if (col.match(/^gsx/)) {
                        if (!isNaN(res.feed.entry[rowIndex][col]['$t'])) {
                            thisRow[key][col.substring(4)] = parseInt(res.feed.entry[rowIndex][col]['$t'], 10);
                        }
                        else {
                            thisRow[key][col.substring(4)] = res.feed.entry[rowIndex][col]['$t'];
                        }
                        simvalues['data']['keys'][key][col.substring(4)] = thisRow[key][col.substring(4)];
                    }
                });
            }
            simvalues['data']['rows'].push(thisRow);
            rowIndex++;
        }
        window.alert('Import complete. Now export to persist this change.');
        return { 'json': simvalues, 'text': JSON.stringify(simvalues, null, 2), 'title': res.feed['title']['$t'], 'worksheetKey': worksheetKey, 'comment': this.result['comment'] };
    };
    Dynamicworksheets = __decorate([
        core_1.Component({
            selector: 'dynamicworksheets',
            templateUrl: './components/dynamicworksheets/dynamicworksheets.html',
            styleUrls: ['./components/dynamicworksheets/dynamicworksheets.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Dynamicworksheets);
    return Dynamicworksheets;
})();
exports.Dynamicworksheets = Dynamicworksheets;
