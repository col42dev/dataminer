import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjson} from '../myjson/myjson';
import {Dynamodbio} from '../dynamodbio/dynamodbio';
import {Versioning} from '../versioning/versioning';

@Component({
  selector: 'mapstate',
  templateUrl: 'app/components/mapstate/mapstate.html',
  styleUrls: ['app/components/mapstate/mapstate.css'],
  providers: [Myjson, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Mapstate {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'oe4dop5';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/' + this.myJsonUrl + '/public/values?alt=json';
    private myjsonio : Myjson;
    private dynamodbio : Dynamodbio;  
    private versioning: Versioning;
     
    // 
    constructor(params: RouteParams, http: Http, myjsonio : Myjson, dynamodbio : Dynamodbio, versioning: Versioning){
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
    

    
  handleExportToDynamoDB( evironmentFlag = 'live') {
      
      var tables = (evironmentFlag === 'live') ? ['ptownrules', 'ptownrulestest01'] : ['ptownrulestest01'];
 
         this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.result = this.dynamodbio.export(this.myJsonUrl, this.result, 'mapstate', tables);
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
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