import {Component} from 'angular2/angular2';

import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';

@Component({
  selector: 'about',
  templateUrl: 'app/components/about/about.html',
  styleUrls: ['app/components/about/about.css'],
  providers: [],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class About {

    id: string;
    constructor(params: RouteParams){
        this.id = params.get('id');
    }


}