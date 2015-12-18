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
var Recipes = (function () {
    // 
    function Recipes(params, http, myjsonio, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'od3otrm';
        this.googleDocJsonFeedUrl = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/od3otrm/public/values?alt=json';
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import(this.myJsonUrl, function (myresult) {
            this.result = myresult;
        }.bind(this));
    }
    Recipes.prototype.handleImportFromGoogleDocs = function () {
        var _this = this;
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Recipes.prototype.handleExportToDynamoDB = function (evironmentFlag) {
        if (evironmentFlag === void 0) { evironmentFlag = 'live'; }
        var tables = (evironmentFlag === 'live') ? ['ptownrules', 'ptownrulestest01'] : ['ptownrulestest01'];
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export('od3otrm', this.result, 'recipes', tables);
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Recipes.prototype.importFromGoogleDocs = function () {
        var _this = this;
        console.log('importFromGoogleDocs');
        this.http
            .get(this.googleDocJsonFeedUrl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return _this.result = _this.parseGoogleDocJSON(res); });
    };
    Recipes.prototype.parseGoogleDocJSON = function (res) {
        var recipejson = this.result['json'];
        recipejson['data'] = {};
        recipejson['data']['craftableDefines'] = {};
        for (var i = 0; i < res.feed.entry.length; i++) {
            var content = res.feed.entry[i].content;
            var workstation = res.feed.entry[i].gsx$recipeworkstationid.$t;
            if (workstation.length > 0 && workstation !== 'Null') {
                var recipe = {};
                var workstationLevel = res.feed.entry[i].gsx$recipeworkstationlevel.$t;
                recipe['construction'] = [];
                recipe['construction'].push(workstation + workstationLevel);
                recipe['actionPoints'] = parseInt(res.feed.entry[i].gsx$inputactionpointsamount.$t, 10);
                recipe['input'] = {};
                for (var resourceInputIndex = 1; resourceInputIndex <= 3; resourceInputIndex++) {
                    var propnameInputID = 'gsx$inputresource' + resourceInputIndex + 'id';
                    var propnameInputAmount = 'gsx$inputresource' + resourceInputIndex + 'amount';
                    var resourceInputId = res.feed.entry[i][propnameInputID].$t;
                    if (resourceInputId.length > 0) {
                        var resourceAmount = parseInt(res.feed.entry[i][propnameInputAmount].$t, 10);
                        recipe['input'][resourceInputId] = resourceAmount;
                    }
                }
                recipe['output'] = {};
                for (var resourceOutputIndex = 1; resourceOutputIndex <= 1; resourceOutputIndex++) {
                    var propnameOutputID = 'gsx$outputresource' + resourceOutputIndex + 'id';
                    var propnameOutputAmount = 'gsx$outputresource' + resourceOutputIndex + 'amount';
                    var propnameOutputLevel = 'gsx$outputresource' + resourceOutputIndex + 'level';
                    var resourceOutputId = res.feed.entry[i][propnameOutputID].$t;
                    if (resourceOutputId.length > 0) {
                        var resourceOutputAmount = parseInt(res.feed.entry[i][propnameOutputAmount].$t, 10);
                        var resourceOutputLevel = res.feed.entry[i][propnameOutputLevel].$t;
                        if (resourceOutputLevel.length > 0) {
                            resourceOutputLevel = parseInt(resourceOutputLevel, 10);
                            if (resourceOutputLevel == 0) {
                                resourceOutputLevel = '';
                            }
                        }
                        else {
                            resourceOutputLevel = '';
                        }
                        recipe['output'][resourceOutputId + resourceOutputLevel] = resourceOutputAmount;
                    }
                }
                recipe['duration'] = parseInt(res.feed.entry[i].gsx$inputtimeamount.$t, 10);
                if (recipe['duration'] === 0) {
                    recipe['duration'] = 1;
                }
                recipe['recipename'] = res.feed.entry[i].gsx$recipename.$t;
                recipe['desc'] = res.feed.entry[i].gsx$recipedescription.$t;
                recipe['category'] = res.feed.entry[i].gsx$recipecategory.$t;
                if (res.feed.entry[i].gsx$recipesubcategory.$t.length > 0) {
                    recipe['recipesubcategory'] = res.feed.entry[i].gsx$recipesubcategory.$t;
                }
                var recipeid = res.feed.entry[i].gsx$recipeid.$t;
                recipejson['data']['craftableDefines'][recipeid] = recipe;
                recipe['playerlevelneeded'] = parseInt(res.feed.entry[i].gsx$playerlevelneeded.$t, 10);
                recipe['simMotives'] = [];
                for (var motivesIndex = 1; motivesIndex <= 5; motivesIndex++) {
                    var recipesimulationmotive = 'gsx$recipesimulationmotive' + motivesIndex + 'id';
                    var id = res.feed.entry[i][recipesimulationmotive].$t;
                    if (id.length > 0) {
                        recipe['simMotives'].push(id);
                    }
                }
                if (res.feed.entry[i].gsx$recipesimulationmaxworkers.$t.length > 0) {
                    recipe['maxWorkers'] = parseInt(res.feed.entry[i].gsx$recipesimulationmaxworkers.$t, 10);
                }
                recipe['xp'] = parseInt(res.feed.entry[i].gsx$recipeplayerxpadded.$t, 10);
                recipe['automate'] = res.feed.entry[i].gsx$outputautomaticrenew.$t;
                if (res.feed.entry[i].gsx$objectslotcategory.$t.length > 0) {
                    recipe['objectSlotCategory'] = res.feed.entry[i].gsx$objectslotcategory.$t;
                }
                if (res.feed.entry[i].gsx$motiveslotcapacity.$t.length > 0) {
                    recipe['motiveSlotCapacity'] = parseInt(res.feed.entry[i].gsx$motiveslotcapacity.$t, 10);
                }
                if (res.feed.entry[i].gsx$workstationslotcapacity.$t.length > 0) {
                    recipe['workstationSlotCapacity'] = parseInt(res.feed.entry[i].gsx$workstationslotcapacity.$t, 10);
                }
                if (res.feed.entry[i].gsx$defenseslotcapacity.$t.length > 0) {
                    recipe['defenseSlotCapacity'] = parseInt(res.feed.entry[i].gsx$defenseslotcapacity.$t, 10);
                }
                // local/global storage
                recipe['localStorage'] = parseInt(res.feed.entry[i].gsx$recipelocalstorage.$t, 10);
                //recipe['globalStorage'] = parseInt(res.feed.entry[i].gsx$recipeglobalstorage1.$t, 10);
                if (res.feed.entry[i].hasOwnProperty('gsx$outputautomaticupgrade') && res.feed.entry[i].gsx$outputautomaticupgrade.$t.length > 0) {
                    recipe['automaticupgrade'] = (res.feed.entry[i].gsx$outputautomaticupgrade.$t === 'TRUE') ? 1 : 0;
                }
            }
        }
        window.alert('Updated. Now update myjson server to persist this change.');
        return { 'json': recipejson, 'text': JSON.stringify(recipejson, null, 2) };
    };
    Recipes = __decorate([
        core_1.Component({
            selector: 'recipes',
            templateUrl: './components/recipes/recipes.html',
            styleUrls: ['./components/recipes/recipes.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Recipes);
    return Recipes;
})();
exports.Recipes = Recipes;
