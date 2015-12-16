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
var myjsonio_1 = require('../myjsonio/myjsonio');
var Dynamodbio = (function () {
    function Dynamodbio(http, myjsonio) {
        this.lastExportDateMyJSONURL = 'https://api.myjson.com/bins/3ywwt?pretty=1';
        this.http = http;
        this.myjsonio = myjsonio;
    }
    Dynamodbio.prototype.import = function (myjsonurl, callback) {
        var table = new AWS.DynamoDB({ params: { TableName: 'ptownrules' } });
        table.getItem({ Key: { ptownrules: { S: myjsonurl } } }, function (err, data) {
            callback({
                'json': JSON.parse(data.Item.data.S),
                'text': data.Item.data.S });
        });
    };
    Dynamodbio.prototype.export2 = function (keyname, thisresult, titlename) {
        var formatted = { 'title': titlename };
        var newVersionIdArray = [];
        if (thisresult['json'].hasOwnProperty('version')) {
            newVersionIdArray = thisresult['json']['version'].split('.');
        }
        else {
            newVersionIdArray = ['0', '0', '0'];
        }
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.');
        formatted['lastEditDate'] = (new Date()).toString();
        formatted['data'] = thisresult['json']['data']; // merge this.result in to formatted - so that header attributes appear first in the object.
        thisresult['json'] = formatted;
        thisresult['text'] = JSON.stringify(formatted, null, 2);
        var data = JSON.stringify(thisresult['json'], null, 2);
        var table = new AWS.DynamoDB({ params: { TableName: 'ptownrules' } });
        var itemParams = {
            "TableName": "ptownrules",
            "Item": {
                "ptownrules": { "S": keyname },
                "data": { "S": data }
            }
        };
        table.putItem(itemParams, function (err, data) {
            console.log('putItem');
            if (err) {
                console.log(err);
                window.alert('ERROR: putItem Failed:' + JSON.stringify(itemParams));
            }
            else {
                window.alert('DynamoDB has been updated');
                this.updateLastDynamoDBExportDate();
                this.myjsonio.export2(keyname, thisresult, titlename);
            }
        }.bind(this));
        return thisresult;
    };
    Dynamodbio.prototype.updateLastDynamoDBExportDate = function () {
        // update last export date to MyJSON
        var myJSONheaders = new http_1.Headers();
        myJSONheaders.append('Content-Type', 'application/json; charset=utf-8');
        var data = JSON.stringify({ 'lastDynamoDBExportDate': (new Date()).toString() }, null, 2);
        this.http.put(this.lastExportDateMyJSONURL, data, { headers: myJSONheaders })
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return console.log('MyJSON updateLastDynamoDBExportDate data:' + JSON.stringify(data)); }, function (err) { return window.alert('ERROR: MyJSON updateLastDynamoDBExportDate:' + JSON.stringify(err)); }, function () { return console.log('MyJSON last export date export complete'); });
    };
    Dynamodbio = __decorate([
        core_1.Component({
            selector: 'dynamodbio',
            templateUrl: './components/dynamodbio/dynamodbio.html',
            styleUrls: ['./components/dynamodbio/dynamodbio.css'],
            providers: [myjsonio_1.Myjsonio],
            directives: [],
            pipes: []
        }), 
        __metadata('design:paramtypes', [http_1.Http, myjsonio_1.Myjsonio])
    ], Dynamodbio);
    return Dynamodbio;
})();
exports.Dynamodbio = Dynamodbio;