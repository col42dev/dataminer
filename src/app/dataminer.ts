
import {Component, View, bootstrap, provide} from 'angular2/angular2';

import {ROUTER_DIRECTIVES, RouteConfig, Location,ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router';

import { About } from './components/about/about';
import { Simkvp } from './components/simkvp/simkvp';


@RouteConfig([
 // new Route({path: '/', component: DataminerApp, as: 'Dataminer'}),
   new Route({path: '/about', component: About, as: 'About'}),
   new Route({path: '/simkvp', component: Simkvp, as: 'Simkvp'})
])


@Component({
  selector: 'dataminer-app',
  providers: [],
  templateUrl: 'app/dataminer.html',
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class DataminerApp {

  router: Router;
  location: Location;
    

  
  constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;
    }

}
