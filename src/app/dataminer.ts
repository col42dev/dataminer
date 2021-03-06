import {HTTP_PROVIDERS} from 'angular2/http';
import {Component, View, provide} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig, Location,ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router';

import { About } from './components/about/about';
import { Versioning } from './components/versioning/versioning';
import { Simkvp } from './components/simkvp/simkvp';
import { Mapstate } from './components/mapstate/mapstate';
import { Simworkers } from './components/simworkers/simworkers';
import { Characterstats } from './components/characterstats/characterstats';
import { Charactercombatmodifiers } from './components/charactercombatmodifiers/charactercombatmodifiers';
import { Recipes } from './components/recipes/recipes';
import { Unlocks } from './components/unlocks/unlocks';
import { Unlockprogression } from './components/unlockprogression/unlockprogression';
import { Craftystate } from './components/craftystate/craftystate';
import { Playerpowers } from './components/playerpowers/playerpowers';
import { Grid } from './components/grid/grid';
import { Column } from './components/grid/column';
import { Dynamicworksheets } from './components/dynamicworksheets/dynamicworksheets';
import { Eventscheduler } from './components/eventscheduler/eventscheduler';




@RouteConfig([
   new Route({path: '/', component: About, name: 'About'}),
   new Route({path: '/simkvp', component:Simkvp, name: 'Simkvp'}),
   new Route({path: '/mapstate', component:Mapstate, name: 'Mapstate'}),
   new Route({path: '/simworkers', component: Simworkers, name: 'Simworkers'}),
   new Route({path: '/recipes', component: Recipes, name: 'Recipes'}),
   new Route({path: '/unlocks', component: Unlocks, name: 'Unlocks'}),
   new Route({path: '/unlockprogression', component: Unlockprogression, name: 'Unlockprogression'}),
   new Route({path: '/characterstats', component: Characterstats, name: 'Characterstats'}),
   new Route({path: '/charactercombatmodifiers', component: Charactercombatmodifiers, name: 'Charactercombatmodifiers'}),
   new Route({path: '/craftystate', component: Craftystate, name: 'Craftystate'}),
   new Route({path: '/playerpowers', component: Playerpowers, name: 'Playerpowers'}),
   new Route({path: '/dynamicworksheets', component: Dynamicworksheets, name: 'Dynamicworksheets'}),
   new Route({path: '/eventscheduler', component: Eventscheduler, name: 'Eventscheduler'}),
 
])

@Component({
  selector: 'dataminer-app',
  providers: [Versioning],
  templateUrl: 'app/dataminer.html',
  directives: [ROUTER_DIRECTIVES, About],
  pipes: []
})
export class DataminerApp {
  router: Router;
  location: Location;
    versioning: Versioning;
  
   constructor(router: Router, location: Location,  versioning: Versioning) {
        this.router = router;
        this.location = location;  
        this.versioning = versioning; 
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
