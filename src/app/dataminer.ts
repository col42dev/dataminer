
import {Component, View, bootstrap, provide} from 'angular2/angular2';

import {ROUTER_DIRECTIVES, RouteConfig, Location,ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router';

import { About } from './components/about/about';
import { Simkvp } from './components/simkvp/simkvp';
import { Mapstate } from './components/mapstate/mapstate';
import { Simworkers } from './components/simworkers/simworkers';
import { Playerprogression } from './components/playerprogression/playerprogression';
import { Characterstats } from './components/characterstats/characterstats';
import { Recipes } from './components/recipes/recipes';
import { Unlocks } from './components/unlocks/unlocks';

@RouteConfig([
   new Route({path: '/', component: About, as: 'About'}),
   new Route({path: '/simkvp', component: Simkvp, as: 'Simkvp'}),
   new Route({path: '/mapstate', component: Mapstate, as: 'Mapstate'}),
   new Route({path: '/simworkers', component: Simworkers, as: 'Simworkers'}),
   new Route({path: '/playerprogression', component: Playerprogression, as: 'Playerprogression'}),
   new Route({path: '/recipes', component: Recipes, as: 'Recipes'}),
   new Route({path: '/unlocks', component: Unlocks, as: 'Unlocks'}),
   new Route({path: '/characterstats', component: Characterstats, as: 'Characterstats'})
])


@Component({
  selector: 'dataminer-app',
  providers: [],
  templateUrl: 'app/dataminer.html',
  directives: [About, Simkvp, Characterstats, Mapstate, Simworkers, Playerprogression, Recipes, Unlocks, ROUTER_DIRECTIVES],
  pipes: []
})
export class DataminerApp {

  router: Router;
  location: Location;
    
  constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;
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
