import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';

declare var AWS:any;

@Component({
  selector: 'simworkers',
  templateUrl: 'app/components/simworkers/simworkers.html',
  styleUrls: ['app/components/simworkers/simworkers.css'],
  providers: [],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Simworkers {

    private result: Object;
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/4xb60?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oxtnpr4/public/values?alt=json';
   
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
        formatted['title'] = 'simworkers';
        
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
          
          
        //AWS  PUT 
        var table = new AWS.DynamoDB({params: {TableName: 'ptownrules'}});
        var itemParams = {
            "TableName":"ptownrules", 
            "Item": {
                "ptownrules" : {"S":this.myJsonUrl},
                "data" : {"S":data}   
            }
        };
  
        table.putItem(itemParams, function(err, data) { 
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        });
    }
    
    onExportToMyJsonSuccess()
    {
         window.alert('MyJSON has been updated');
    }
    
    parseGoogleDocJSON(res) {
      
      let simworkers = this.result['json'];
     
      simworkers['races'] = {};
      simworkers['professions'] = {};

      console.log( 'length:' + res.feed.entry.length);

      var races = {};
      var professions = {};

      for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 
        var row = {};
        var raceprofession = res.feed.entry[rowIndex].gsx$workerattribute.$t;
        var rowdata = null;
        if (raceprofession === 'Race') {
          var race = res.feed.entry[rowIndex].gsx$workerraceprofession.$t;
          if ( races.hasOwnProperty(race)  === false) {
            races[race] = {};
            races[race].levels = [];
          }
          rowdata = races[race];
        } else if (raceprofession === 'Profession') {
          var profession = res.feed.entry[rowIndex].gsx$workerraceprofession.$t;
          if ( professions.hasOwnProperty(profession)  === false) {
            professions[profession] = {};
            professions[profession].levels = [];
          }
          rowdata = professions[profession];
        }

        var obj = {};
        obj['cost'] = parseInt(res.feed.entry[rowIndex].gsx$workerlevelcost.$t, 10);
        obj['level'] = parseInt(res.feed.entry[rowIndex].gsx$workerlevel.$t, 10);
        obj['motives'] = {};
        for (var motiveIndex = 0; motiveIndex < 8; motiveIndex++) { 
          var keyNameId = 'gsx$workermotive' + (motiveIndex + 1)+ 'id';
          var keyNameAmount = 'gsx$workermotive' + (motiveIndex + 1)+ 'amount';

          var motiveTypeName = res.feed.entry[rowIndex][keyNameId].$t;
          var motiveTypeAmount = parseInt(res.feed.entry[rowIndex][keyNameAmount].$t, 10);
          obj['motives'][motiveTypeName] = motiveTypeAmount;
        }

        rowdata.levels.push(obj);
      }
 
      simworkers['races'] = races;
      simworkers['professions'] = professions;
      
      window.alert('Updated. Now update myjson server to persist this change.');
       
      return { 'json':simworkers, 'text':JSON.stringify(simworkers, null, 2)};
    }

}