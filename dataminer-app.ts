import 'rxjs/operator/map';
import 'rxjs/operator/mergeMap';
import 'rxjs/observable/interval'

import {HTTP_PROVIDERS} from 'angular2/http';
import {Component, View, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

import {ExporterPage} from './exporter-page';
import {About} from './components/about/about';
import { Versioning } from './components/versioning/versioning';

import {ROUTER_DIRECTIVES, RouteConfig, Location,ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router';

declare var System:any;

@Component(
{
    selector: 'dataminer-app',
    templateUrl: './dataminer-app.html',
    providers: [Versioning],
    directives:[ExporterPage, About, ROUTER_DIRECTIVES]
})

@RouteConfig([
    new Route({path: '/', component: About, name: 'About'}),
    new Route({path: '/exporter/...', component: ExporterPage, name: 'Exporter'}),
    new AsyncRoute({
        path: '/lazy',
        loader: () => ComponentHelper.LoadComponentAsync('LazyLoaded','./components/lazy-loaded/lazy-loaded'),
        name: 'Lazy'
    })
])
 
class DataminerApp {

    router: Router;
    location: Location;
     versioning: Versioning;

    constructor(router: Router, location: Location,  versioning: Versioning) {
        this.router = router;
        this.location = location;
        this.versioning = versioning
        this.versioning.verify(null);
    }

    getLinkStyle(path) {

        if(path === this.location.path()){
            return true;
        }
        else if(path.length > 0){
            return this.location.path().indexOf(path) > -1;
        }
    }
}

class ComponentHelper{

    static LoadComponentAsync(name,path){
        return System.import(path).then(c => c[name]);
    }
}

bootstrap(DataminerApp,[ROUTER_PROVIDERS, HTTP_PROVIDERS,
          provide(LocationStrategy, {useClass: HashLocationStrategy})]);


