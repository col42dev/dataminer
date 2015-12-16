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
var Myjsonio = (function () {
    function Myjsonio(http) {
        this.http = http;
    }
    Myjsonio.prototype.import = function (myjsonurl, callback, _this) {
        var thisresult = null;
        this.http
            .get(myjsonurl)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) { return callback({
            'json': res,
            'text': JSON.stringify(res, null, 2) }, _this); });
    };
    Myjsonio.prototype.export2 = function (myJsonUrl, thisresult, titlename) {
        var _this = this;
        var formatted = {};
        formatted['title'] = titlename;
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
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');
        var data = JSON.stringify(thisresult['json'], null, 2);
        this.http.put(myJsonUrl, data, { headers: headers })
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.onExportToMyJsonSuccess(); }, function (err) { return window.alert('ERROR:' + JSON.stringify(err)); }, function () { return console.log('MyJSON Export Complete'); });
    };
    Myjsonio.prototype.onExportToMyJsonSuccess = function () {
        window.alert('MyJSON has been updated');
    };
    Myjsonio = __decorate([
        core_1.Component({
            selector: 'myjsonio',
            templateUrl: './components/myjsonio/myjsonio.html',
            styleUrls: ['./components/myjsonio/myjsonio.css'],
            providers: [],
            directives: [],
            pipes: []
        }), 
        __metadata('design:paramtypes', [http_1.Http])
    ], Myjsonio);
    return Myjsonio;
})();
exports.Myjsonio = Myjsonio;
