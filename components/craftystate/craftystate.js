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
var Craftystate = (function () {
    // 
    function Craftystate(params, http, myjsonio, dynamodbio) {
        this.result = { 'json': {}, 'text': 'loading...' };
        this.myJsonUrl = 'https://api.myjson.com/bins/1a9rm?pretty=1';
        this.http = http;
        this.myjsonio = myjsonio;
        this.dynamodbio = dynamodbio;
        this.dynamodbio.import(this.myJsonUrl, function (myresult) {
            this.result = myresult;
        }.bind(this));
    }
    ;
    Craftystate.prototype.exportToMyJSON = function () {
        var _this = this;
        console.log('exportToMyJSON & AWS');
        var formatted = this.result['json'];
        formatted['title'] = 'craftystate';
        var newVersionIdArray = [];
        if (formatted.hasOwnProperty('version')) {
            newVersionIdArray = formatted['version'].split('.');
        }
        else {
            newVersionIdArray = ['0', '0', '0'];
        }
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.');
        formatted['lastEditDate'] = (new Date()).toString();
        this.result['json'] = formatted;
        this.result['text'] = JSON.stringify(formatted, null, 2);
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');
        var data = JSON.stringify(formatted, null, 2);
        this.http.put(this.myJsonUrl, data, { headers: headers })
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.onExportToMyJsonSuccess(); }, function (err) { return console.log(err); }, function () { return console.log('MyJSON Export Complete'); });
        //AWS  PUT 
        var table = new AWS.DynamoDB({ params: { TableName: 'ptownrules' } });
        var itemParams = {
            "TableName": "ptownrules",
            "Item": {
                "ptownrules": { "S": this.myJsonUrl },
                "data": { "S": data }
            }
        };
        table.putItem(itemParams, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
    };
    Craftystate.prototype.onExportToMyJsonSuccess = function () {
        window.alert('MyJSON has been updated');
    };
    Craftystate = __decorate([
        core_1.Component({
            selector: 'craftystate',
            templateUrl: './components/craftystate/craftystate.html',
            styleUrls: ['./components/craftystate/craftystate.css'],
            providers: [myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio],
            directives: [router_2.ROUTER_DIRECTIVES],
            pipes: []
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams, http_1.Http, myjsonio_1.Myjsonio, dynamodbio_1.Dynamodbio])
    ], Craftystate);
    return Craftystate;
})();
exports.Craftystate = Craftystate;
