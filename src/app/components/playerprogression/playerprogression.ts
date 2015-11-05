import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';

@Component({
  selector: 'playerprogression',
  templateUrl: 'app/components/playerprogression/playerprogression.html',
  styleUrls: ['app/components/playerprogression/playerprogression.css'],
  providers: [],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Playerprogression {

    private result: Object;
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/282ei?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/ov2goyk/public/values?alt=json';
   
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
        console.log('exportToMyJSON');
        
        var formatted = this.result['json'];
        formatted['title'] = 'playerprogression';
        
        var newVersionIdArray = [];
        if ( formatted.hasOwnProperty('version')) {
          newVersionIdArray = formatted['version'].split('.');
        } else {
          newVersionIdArray = ['0', '0', '0'];
        } 
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.'); 
        formatted['lastEditDate'] = (new Date()).toString();
        
        this.result['json'] = formatted;
        this.result['text'] = JSON.stringify(formatted, null, 2);
        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');

        let data: string = JSON.stringify(formatted, null, 2);
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
      var playerProgression = this.result['json'];
      playerProgression['progressionDefines'] = {};

      var progressions = {};
      for (var i = 0; i < res.feed.entry.length; i++) {  
        var progression = {};
        var content = res.feed.entry[i].content;
        var playerlevel = res.feed.entry[i].gsx$playerlevel.$t;
        console.log( playerlevel);
      
        if (playerlevel.length > 0 ) {
          progression['playerLevel'] = parseInt( res.feed.entry[i].gsx$playerlevel.$t, 10);
          progression['playerXPNeeded'] = parseInt( res.feed.entry[i].gsx$playerxpneeded.$t, 10);
          progression['recipes'] = {};
          for ( var recipeIndex = 1; recipeIndex <= 5; recipeIndex ++) {
            var propnameRecipeID = 'gsx$recipe' + recipeIndex + 'id';
            var propnameRecipeAmount = 'gsx$recipe' + recipeIndex + 'amount';
            var propnameRecipeXP = 'gsx$recipe' + recipeIndex + 'xp';
            var propvalueRecipeID = res.feed.entry[i][propnameRecipeID].$t;
      
            if ( propvalueRecipeID.length > 0) {
              if (res.feed.entry[i][propnameRecipeID].$t !== 'NULL') {
                var recipeID = res.feed.entry[i][propnameRecipeID].$t;
                var recipe = {};
                
                recipe['amount'] = parseInt( res.feed.entry[i][propnameRecipeAmount].$t, 10);
                recipe['xp'] = parseInt( res.feed.entry[i][propnameRecipeXP].$t, 10);
                progression['recipes'][ recipeID] = recipe;
              }
            }
          }
      
          progression['maxWorkers'] = parseInt( res.feed.entry[i].gsx$maxworkers.$t, 10);
          progression['additionalMaxWorkersxp'] = parseInt( res.feed.entry[i].gsx$additionalmaxworkersxp.$t, 10);
          progression['maxHeroes'] = parseInt( res.feed.entry[i].gsx$maxheroes.$t, 10);
          progression['maxHeroesUnlocked'] = parseInt( res.feed.entry[i].gsx$maxheroesunlocked.$t, 10);
          progression['maxDefenseTraps'] = parseInt( res.feed.entry[i].gsx$maxdefensetraps.$t, 10);
          progression['maxDefenseTowers'] = parseInt( res.feed.entry[i].gsx$maxdefensetowers.$t, 10);
          progression['maxCombatWaves'] = parseInt( res.feed.entry[i].gsx$maxcombatwaves.$t, 10);
          progression['enforceHunger'] = (res.feed.entry[i].gsx$enforcehunger.$t === 'TRUE') ? 1 : 0;
          progression['enforceRest'] = (res.feed.entry[i].gsx$enforcerest.$t === 'TRUE') ? 1 : 0;
        }
      
        progressions[playerlevel] = progression;
      }

      playerProgression['progressionDefines'] = progressions;
      
      window.alert('Updated. Now update myjson server to persist this change.');
       
      return { 'json':playerProgression, 'text':JSON.stringify(playerProgression, null, 2)};
    }

}