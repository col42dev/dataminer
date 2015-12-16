var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
require('rxjs/operator/map');
require('rxjs/operator/mergeMap');
require('rxjs/observable/interval');
var http_1 = require('angular2/http');
var core_1 = require('angular2/core');
var browser_1 = require('angular2/platform/browser');
var exporter_page_1 = require('./exporter-page');
var about_1 = require('./components/about/about');
var versioning_1 = require('./components/versioning/versioning');
var router_1 = require('angular2/router');
var DataminerApp = (function () {
    function DataminerApp(router, location, versioning) {
        this.router = router;
        this.location = location;
        this.versioning = versioning;
        this.versioning.verify(null);
    }
    DataminerApp.prototype.getLinkStyle = function (path) {
        if (path === this.location.path()) {
            return true;
        }
        else if (path.length > 0) {
            return this.location.path().indexOf(path) > -1;
        }
    };
    DataminerApp = __decorate([
        core_1.Component({
            selector: 'dataminer-app',
            templateUrl: './dataminer-app.html',
            providers: [versioning_1.Versioning],
            directives: [exporter_page_1.ExporterPage, about_1.About, router_1.ROUTER_DIRECTIVES]
        }),
        router_1.RouteConfig([
            new router_1.Route({ path: '/', component: about_1.About, name: 'About' }),
            new router_1.Route({ path: '/exporter/...', component: exporter_page_1.ExporterPage, name: 'Exporter' }),
            new router_1.AsyncRoute({
                path: '/lazy',
                loader: function () { return ComponentHelper.LoadComponentAsync('LazyLoaded', './components/lazy-loaded/lazy-loaded'); },
                name: 'Lazy'
            })
        ]), 
        __metadata('design:paramtypes', [router_1.Router, router_1.Location, versioning_1.Versioning])
    ], DataminerApp);
    return DataminerApp;
})();
var ComponentHelper = (function () {
    function ComponentHelper() {
    }
    ComponentHelper.LoadComponentAsync = function (name, path) {
        return System.import(path).then(function (c) { return c[name]; });
    };
    return ComponentHelper;
})();
browser_1.bootstrap(DataminerApp, [router_1.ROUTER_PROVIDERS, http_1.HTTP_PROVIDERS,
    core_1.provide(router_1.LocationStrategy, { useClass: router_1.HashLocationStrategy })]);
