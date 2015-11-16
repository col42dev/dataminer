
import {Component, View, bootstrap, provide, NgIf} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
 

import {ROUTER_DIRECTIVES, RouteConfig, Location,ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router';

import { About } from './components/about/about';
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
import { Versioning } from './components/versioning/versioning';

@RouteConfig([
   new Route({path: '/', component: About, as: 'About'}),
   new Route({path: '/simkvp', component: Simkvp, as: 'Simkvp'}),
   new Route({path: '/mapstate', component: Mapstate, as: 'Mapstate'}),
   new Route({path: '/simworkers', component: Simworkers, as: 'Simworkers'}),
   new Route({path: '/recipes', component: Recipes, as: 'Recipes'}),
   new Route({path: '/unlocks', component: Unlocks, as: 'Unlocks'}),
   new Route({path: '/unlockprogression', component: Unlockprogression, as: 'Unlockprogression'}),
   new Route({path: '/characterstats', component: Characterstats, as: 'Characterstats'}),
   new Route({path: '/charactercombatmodifiers', component: Charactercombatmodifiers, as: 'Charactercombatmodifiers'}),
   new Route({path: '/craftystate', component: Craftystate, as: 'Craftystate'}),
   new Route({path: '/playerpowers', component: Playerpowers, as: 'Playerpowers'}),
])

@Component({
  selector: 'dataminer-app',
  providers: [Versioning],
  templateUrl: 'app/dataminer.html',
  directives: [NgIf, About, Simkvp, Characterstats, Charactercombatmodifiers, Mapstate, Simworkers, Recipes, Unlocks, Unlockprogression, Grid, Craftystate, Playerpowers, ROUTER_DIRECTIVES],
  pipes: []
})
export class DataminerApp {

  router: Router;
  location: Location;
  versioning: Versioning;


  constructor(router: Router, location: Location, versioning: Versioning) {
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
