import {Component} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';

@Component({
  selector: 'simkvp',
  templateUrl: 'app/components/simkvp/simkvp.html',
  styleUrls: ['app/components/simkvp/simkvp.css'],
  providers: [],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Simkvp {

     id: string;
    constructor(params: RouteParams){
        this.id = params.get('id');
    }
    
    

}