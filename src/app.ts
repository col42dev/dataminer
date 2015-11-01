
import {HTTP_PROVIDERS} from 'angular2/http';
import {Component, View, bootstrap, provide} from 'angular2/angular2';
import {DataminerApp} from './app/dataminer';
import {ROUTER_DIRECTIVES, RouteConfig, Location,ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router';




bootstrap(DataminerApp,[ROUTER_PROVIDERS, HTTP_PROVIDERS,
          provide(LocationStrategy, {useClass: HashLocationStrategy})]);
