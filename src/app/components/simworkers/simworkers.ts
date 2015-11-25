import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';
import {Versioning} from '../versioning/versioning';

@Component({
  selector: 'simworkers',
  templateUrl: 'app/components/simworkers/simworkers.html',
  styleUrls: ['app/components/simworkers/simworkers.css'],
  providers: [Myjsonio, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Simworkers {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/4xb60?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oxtnpr4/public/values?alt=json';
    private myjsonio : Myjsonio;
    private dynamodbio : Dynamodbio;
    private versioning: Versioning;
    
    // 
    constructor(params: RouteParams, http: Http, myjsonio : Myjsonio, dynamodbio : Dynamodbio, versioning: Versioning){
        this.http = http;
        this.myjsonio  = myjsonio;
        this.dynamodbio  = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import(this.myJsonUrl, 
          function(myresult : Object) {
            this.result = myresult;
          }.bind(this));
    }
    
    handleImportFromGoogleDocs() {            
      this.http
        .get(this.googleDocJsonFeedUrl)
        .map(res => res.json())
        .subscribe(
          res => this.result  = this.parseGoogleDocJSON(res)
         );
    }
    
    handleExportToMyJSON() {
        this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.myjsonio.export2(this.myJsonUrl, this.result, 'simworkers');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
    }
    
    handleExportToDynamoDB() {
        this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'simworkers');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
    }
    
    parseGoogleDocJSON(res) {
      
      let simworkers = this.result['json'];
     
      simworkers['data'] = {};
      simworkers['data']['races'] = {};
      simworkers['data']['professions'] = {};

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
 
      simworkers['data']['races'] = races;
      simworkers['data']['professions'] = professions;
      

      window.alert('Updated. Now update myjson server to persist this change.');
       
      return { 'json':simworkers, 'text':JSON.stringify(simworkers, null, 2)};
    }

}