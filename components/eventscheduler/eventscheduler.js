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
var Eventscheduler = (function () {
    // 
    function Eventscheduler(params, http, dynamodbio, versioning) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.clientID = '520844228177-3utgp17ioq1vk8p1m7uktl1kce62ll7l.apps.googleusercontent.com'; //choose web app client Id, redirect URI and Javascript origin set to http://localhost
        this.apiKey = ''; //choose public apiKey, any IP allowed (leave blank the allowed IP boxes in Google Dev Console)
        this.userEmail = "e1f592e343osdhequi9a0og69s@group.calendar.google.com"; //your calendar Id
        this.userTimeZone = "London"; //example "Romeo" "Los_Angeles" ecc...
        this.scope = "https://www.googleapis.com/auth/calendar.readonly";
        this.http = http;
        this.dynamodbio = dynamodbio;
        this.versioning = versioning;
        this.checkAuth();
    }
    Eventscheduler.prototype.checkAuth = function () {
        gapi.auth.authorize({ client_id: this.clientID, scope: this.scope, immediate: false }, this.handleAuthResult.bind(this));
        return false;
    };
    Eventscheduler.prototype.handleAuthResult = function (authResult) {
        console.log("Authentication result:");
        console.log(authResult);
        if (authResult && !authResult.error) {
            gapi.client.load('calendar', 'v3', function () {
                //console.log('completed  gapi.client.load');
                var today = new Date();
                var request = gapi.client.calendar.events.list({
                    'calendarId': this.userEmail,
                    'timeZone': this.userTimeZone,
                    'singleEvents': true,
                    'timeMin': today.toISOString(),
                    'maxResults': 10,
                    'orderBy': 'startTime' });
                request.execute(function (resp) {
                    //console.log('request.execute called:');
                    this.result = { 'json': { 'data': {} }, 'text': '' };
                    if (resp.error) {
                        console.log('request.execute error:');
                        console.log(resp.error);
                    }
                    for (var i = 0; i < resp.items.length; i++) {
                        //console.log("Event: " + i + ' '+ JSON.stringify( resp.items[i]));
                        this.result.json.data[resp.items[i].id] = resp.items[i];
                    }
                    this.result.text = JSON.stringify(this.result.json, null, 2);
                }.bind(this));
            }.bind(this));
        }
        else {
            console.log("NOT  authenticated  " + authResult.error);
            console.log(authResult);
        }
    };
    Eventscheduler.prototype.handleImportFromGoogleDocs = function () {
        gapi.auth.authorize({ client_id: this.clientID, scope: this.scope, immediate: false }, this.handleAuthResult.bind(this));
    };
    Eventscheduler.prototype.handleExportToDynamoDB = function (evironmentFlag) {
        if (evironmentFlag === void 0) { evironmentFlag = 'live'; }
        var tables = (evironmentFlag === 'live') ? ['ptownrules', 'ptownrulestest01'] : ['ptownrulestest01'];
        this.versioning.verify(function (verified) {
            if (verified === 1) {
                this.result = this.dynamodbio.export('events', this.result, 'eventscheduler', tables);
            }
            else {
                window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
        }.bind(this));
    };
    Eventscheduler = __decorate([
        core_1.Component({
            selector: 'eventscheduler',
            templateUrl: './components/eventscheduler/eventscheduler.html',
            styleUrls: ['./components/eventscheduler/eventscheduler.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio, versioning_1.Versioning],
            directives: [router_2.ROUTER_DIRECTIVES],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, dynamodbio_1.Dynamodbio, versioning_1.Versioning])
    ], Eventscheduler);
    return Eventscheduler;
})();
exports.Eventscheduler = Eventscheduler;
