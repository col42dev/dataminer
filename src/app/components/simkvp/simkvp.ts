import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';

@Component({
  selector: 'simkvp',
  templateUrl: 'app/components/simkvp/simkvp.html',
  styleUrls: ['app/components/simkvp/simkvp.css'],
  providers: [Myjsonio, Dynamodbio],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Simkvp {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/4rrxs?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/otw4nb/public/values?alt=json';
    private myjsonio : Myjsonio;
    private dynamodbio : Dynamodbio;
   
    // 
    constructor(params: RouteParams, http: Http, myjsonio : Myjsonio, dynamodbio : Dynamodbio){
        this.http = http;
        this.myjsonio  = myjsonio;
        this.dynamodbio  = dynamodbio;
        this.dynamodbio.import(this.myJsonUrl, this.onMyjsonImport, this);
    }
    
    onMyjsonImport( myresult : Object, _this) {
      _this.result = myresult;
    }

    handleImportFromGoogleDocs() {  
      console.log('importFromGoogleDocs');
        
      this.http
        .get(this.googleDocJsonFeedUrl)
        .map(res => res.json())
        .subscribe(
          res => this.result  = this.parseGoogleDocJSON(res)
         );
    }
    
    handleExportToMyJSON() {
         this.myjsonio.export2(this.myJsonUrl, this.result, 'simvalues');
    }
    
    handleExportToDynamoDB() {
         this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'simvalues');
    }
    
    parseGoogleDocJSON(res) {
      var simvalues = this.result['json'];
      simvalues['data'] = {};
      simvalues['data']['globals'] = {};

      for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 
        var row = {};
        var key = res.feed.entry[rowIndex]['gsx$key'].$t;

        var value = res.feed.entry[rowIndex]['gsx$value'].$t;
        if (!isNaN(value)) {
            value = parseInt( value, 10);
        }
        simvalues['data']['globals'][key] = value;
      }
      
      window.alert('Import complete. Now export to persist this change.');
       
      return { 'json':simvalues, 'text':JSON.stringify(simvalues, null, 2)};
    }

}