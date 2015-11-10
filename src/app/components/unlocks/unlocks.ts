import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';

@Component({
  selector: 'unlocks',
  templateUrl: 'app/components/unlocks/unlocks.html',
  styleUrls: ['app/components/unlocks/unlocks.css'],
  providers: [],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Unlocks {

    private result: Object;
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/2hewe?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/os7bs54/public/values?alt=json';
   
    // 
    constructor(params: RouteParams, http: Http){
        this.http = http;
        this.importFromMyJSON();
    }
    
    importFromMyJSON() {  
      console.log('importFromMyJSON');
      
      this.result = { 'json':{}, 'text':'loading...'};
      this.http
        .get(this.myJsonUrl)
        .map(res => res.json())
        .subscribe(
          res => this.result  = { 'json':res, 'text':JSON.stringify(res, null, 2)}
         );
    }
    

    importFromGoogleDocs() {  
      console.log('importFromGoogleDocs');
          
      this.http
        .get(this.googleDocJsonFeedUrl)
        .map(res => res.json())
        .subscribe(
          res => this.result  = this.parseGoogleDocJSON(res)
         );
    }
    
    exportToMyJSON() {
        console.log('exportToMyJSON 1');
        
        var formatted = {};
        formatted['title'] = 'progression';
        
        var newVersionIdArray = [];
        if ( this.result['json'].hasOwnProperty('version')) {
          newVersionIdArray = this.result['json']['version'].split('.');
        } else {
          newVersionIdArray = ['0', '0', '0'];
        } 
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.'); 
        formatted['lastEditDate'] = (new Date()).toString();
        
        formatted['data'] = this.result['json']['data'];  // merge this.result in to formatted - so that header attributes appear first in the object.
        
        this.result['json'] = formatted;
        this.result['text'] = JSON.stringify(formatted, null, 2);
        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');

        let data: string = JSON.stringify(this.result['json'], null, 2);
        this.http.put(this.myJsonUrl, data, { headers: headers}) 
          .map(res => res.json())
          .subscribe(
            data => this.onExportToMyJsonSuccess(),
            err => console.log(err),
            () => console.log('Complete')
          ); 
    }
    
    onExportToMyJsonSuccess()
    {
         window.alert('MyJSON has been updated');
    }
    
    parseGoogleDocJSON(res) {
      var rootNode = this.result['json'];
      rootNode['data'] = {};

      let progressions = {};
      for (var i = 0; i < res.feed.entry.length; i++) {  
        let progression = {};
        let content = res.feed.entry[i].content;
        let playerlevel = res.feed.entry[i].gsx$playerlevel.$t;
        console.log( playerlevel);
      
        if (playerlevel.length > 0 ) {
          progression['playerLevel'] = parseInt( res.feed.entry[i].gsx$playerlevel.$t, 10);
          progression['playerXPNeeded'] = parseInt( res.feed.entry[i].gsx$playerxpneeded.$t, 10);      
          progression['maxWorkers'] = parseInt( res.feed.entry[i].gsx$maxworkers.$t, 10);
          progression['additionalMaxWorkersxp'] = parseInt( res.feed.entry[i].gsx$additionalmaxworkersxp.$t, 10);
          progression['maxHeroes'] = parseInt( res.feed.entry[i].gsx$maxheroes.$t, 10);
          progression['maxHeroesUnlocked'] = parseInt( res.feed.entry[i].gsx$maxheroesunlocked.$t, 10);
          progression['maxDefenseMines'] = parseInt( res.feed.entry[i].gsx$maxdefensemines.$t, 10);
          progression['maxDefenseTraps'] = parseInt( res.feed.entry[i].gsx$maxdefensetraps.$t, 10);
          progression['maxDefenseTowers'] = parseInt( res.feed.entry[i].gsx$maxdefensetowers.$t, 10);
          progression['attackModeRewardXP'] = parseInt( res.feed.entry[i].gsx$attackmoderewardxp.$t, 10);
          progression['maxCombatWaves'] = parseInt( res.feed.entry[i].gsx$maxcombatwaves.$t, 10);
          progression['maxRooms'] = parseInt( res.feed.entry[i].gsx$maxrooms.$t, 10);
        }
      
        progressions[playerlevel] = progression;
      }

      rootNode['data'] = progressions;
      
      window.alert('Updated. Now export to myjson server.');
       
      return { 'json':rootNode, 'text':JSON.stringify(rootNode, null, 2)};
    }

}