import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';

@Component({
  selector: 'mapstate',
  templateUrl: 'app/components/mapstate/mapstate.html',
  styleUrls: ['app/components/mapstate/mapstate.css'],
  providers: [Myjsonio, Dynamodbio],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Mapstate {

    private result: Object = { 'json':{}, 'text':'loading...'};;
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/1184a?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/o5onybx/public/values?alt=json';
    private myjsonio : Myjsonio;
    private dynamodbio : Dynamodbio;   
    // 
    constructor(params: RouteParams, http: Http, myjsonio : Myjsonio, dynamodbio : Dynamodbio){
        this.http = http;
        this.myjsonio  = myjsonio;
        this.dynamodbio  = dynamodbio;
        this.dynamodbio.import(this.myJsonUrl, this.onDynamodbImport, this);
    }
    
    onDynamodbImport( myresult : Object, _this) {
      _this.result = myresult;
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
         this.myjsonio.export2(this.myJsonUrl, this.result, 'mapstate');
    }
    
    handleExportToDynamoDB() {
         this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'mapstate');
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
    
  
    
    parseGoogleDocJSON(res) {
      
      var mapstate = this.result['json'];
      
      mapstate['data'] = {};
      
      mapstate['data']['map'] = {};
      mapstate['data']['map']['rows'] = [];

      for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 
        var row = [];
        var colIndex = 0;
        while (res.feed.entry[rowIndex].hasOwnProperty('gsx$h'+(colIndex+1))) { 
          var cell = res.feed.entry[rowIndex]['gsx$h'+(colIndex+1)];
          var cellValue = cell.$t;
          if (cellValue.length == 0) {
              cellValue = '_';
          }
          
          cellValue = cellValue.replace(/\s/g, '');
          
          row.push(cellValue  );
          colIndex ++;
        }
        mapstate['data']['map']['rows'].push(row);
      }
       
      window.alert('Updated. Now update myjson server to persist this change.');
 
      return { 'json':mapstate, 'text':JSON.stringify(mapstate, null, 2)};
    }

}