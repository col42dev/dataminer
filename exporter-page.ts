/// <reference path="./typings/tsd.d.ts" />


import {Component} from 'angular2/core';
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

import {ROUTER_DIRECTIVES, RouteConfig, Route} from 'angular2/router';


import {
    ComponentInstruction,
    Location
} from 'angular2/router';

@Component({
    selector: 'exporter-page',
    templateUrl: './exporter-page.html',
    directives: [ROUTER_DIRECTIVES]
})

@RouteConfig([
    
  
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
 
])

export class ExporterPage {

    location:Location;

    constructor(location:Location) {
        this.location = location;
    }

    getLinkStyle(path) {
        return this.location.path().indexOf(path) > -1;
    }
}

