/// <reference path="./typings/tsd.d.ts" />
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
var simkvp_1 = require('./components/simkvp/simkvp');
var mapstate_1 = require('./components/mapstate/mapstate');
var simworkers_1 = require('./components/simworkers/simworkers');
var characterstats_1 = require('./components/characterstats/characterstats');
var charactercombatmodifiers_1 = require('./components/charactercombatmodifiers/charactercombatmodifiers');
var recipes_1 = require('./components/recipes/recipes');
var unlocks_1 = require('./components/unlocks/unlocks');
var unlockprogression_1 = require('./components/unlockprogression/unlockprogression');
var craftystate_1 = require('./components/craftystate/craftystate');
var playerpowers_1 = require('./components/playerpowers/playerpowers');
var dynamicworksheets_1 = require('./components/dynamicworksheets/dynamicworksheets');
var router_1 = require('angular2/router');
var router_2 = require('angular2/router');
var ExporterPage = (function () {
    function ExporterPage(location) {
        this.location = location;
    }
    ExporterPage.prototype.getLinkStyle = function (path) {
        return this.location.path().indexOf(path) > -1;
    };
    ExporterPage = __decorate([
        core_1.Component({
            selector: 'exporter-page',
            templateUrl: './exporter-page.html',
            directives: [router_1.ROUTER_DIRECTIVES]
        }),
        router_1.RouteConfig([
            new router_1.Route({ path: '/simkvp', component: simkvp_1.Simkvp, name: 'Simkvp' }),
            new router_1.Route({ path: '/mapstate', component: mapstate_1.Mapstate, name: 'Mapstate' }),
            new router_1.Route({ path: '/simworkers', component: simworkers_1.Simworkers, name: 'Simworkers' }),
            new router_1.Route({ path: '/recipes', component: recipes_1.Recipes, name: 'Recipes' }),
            new router_1.Route({ path: '/unlocks', component: unlocks_1.Unlocks, name: 'Unlocks' }),
            new router_1.Route({ path: '/unlockprogression', component: unlockprogression_1.Unlockprogression, name: 'Unlockprogression' }),
            new router_1.Route({ path: '/characterstats', component: characterstats_1.Characterstats, name: 'Characterstats' }),
            new router_1.Route({ path: '/charactercombatmodifiers', component: charactercombatmodifiers_1.Charactercombatmodifiers, name: 'Charactercombatmodifiers' }),
            new router_1.Route({ path: '/craftystate', component: craftystate_1.Craftystate, name: 'Craftystate' }),
            new router_1.Route({ path: '/playerpowers', component: playerpowers_1.Playerpowers, name: 'Playerpowers' }),
            new router_1.Route({ path: '/dynamicworksheets', component: dynamicworksheets_1.Dynamicworksheets, name: 'Dynamicworksheets' }),
        ]), 
        __metadata('design:paramtypes', [router_2.Location])
    ], ExporterPage);
    return ExporterPage;
})();
exports.ExporterPage = ExporterPage;
