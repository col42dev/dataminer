

import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';
import {Versioning } from '../versioning/versioning';

@Component({
  selector: 'dynamicworksheets',
  templateUrl: './components/dynamicworksheets/dynamicworksheets.html',
  styleUrls: ['./components/dynamicworksheets/dynamicworksheets.css'],
  providers: [Myjsonio, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Dynamicworksheets {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = ''; //https://api.myjson.com/bins/4rrxs?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/worksheets/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/public/basic?alt=json';
    private myjsonio : Myjsonio;
    private dynamodbio : Dynamodbio;
    private versioning: Versioning;
    
    private dynamicWorksheetNames = [];
    private dynamicWorksheets = [];
   
    // 
    constructor(params: RouteParams, http: Http, myjsonio: Myjsonio, dynamodbio: Dynamodbio, versioning: Versioning){
        this.http = http;
        this.myjsonio  = myjsonio;
        this.dynamodbio  = dynamodbio;
        this.versioning = versioning;
        /*
        this.dynamodbio.import(this.myJsonUrl, 
          function(myresult : Object) {
            this.result = myresult;
          }.bind(this));*/
        this.dynamicWorksheetNames = [];
        this.dynamicWorksheets = [];
    }

    handleImportDynamicWorksheets() {
          console.log('importFromGoogleDocs');
            
          this.http
            .get(this.googleDocJsonFeedUrl)
            .map(res => res.json())
            .subscribe(
              res => this.populateDynamicWorksheetsList(res)
            ); 
    }
    
    handleImportFromGoogleDocs( worksheetName) {  
      console.log('importFromGoogleDocs' + worksheetName);
        
        var worksheetKey = '';
        this.dynamicWorksheets.forEach( function( worksheet ) {
          if ( worksheet['title']['$t'] === worksheetName) {
            worksheetKey = worksheet['key'];     
          }
        });
        
      var url = 'https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/'+ worksheetKey + '/public/values?alt=json';

      console.log(url);
      this.http
        .get(url)
        .map(res => res.json())
        .subscribe(
          res => this.result  = this.parseGoogleDocJSON(res)
         );
    }
    
    
   populateDynamicWorksheetsList(res) {

      this.dynamicWorksheetNames = [];
      this.dynamicWorksheets = [];
   
      for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 

        var dynamic = {};
        if (res.feed.entry[rowIndex]['title']['$t'].match(/^\_/)) {
          dynamic['title'] = res.feed.entry[rowIndex]['title'];
          dynamic['content'] = res.feed.entry[rowIndex]['content'];
          
          var re = new RegExp( "https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/(.*)/public/basic");
          var match =  re.exec(res.feed.entry[rowIndex]['link'][0]['href']);
          if (match) {
              dynamic['key'] = match[1];
          }
          
          this.dynamicWorksheetNames.push( res.feed.entry[rowIndex]['title']['$t']);
          
          this.dynamicWorksheets.push(dynamic);
        }
  
        
        /*
        var value = res.feed.entry[rowIndex]['gsx$value'].$t;
        if (!isNaN(value)) {
            value = parseInt( value, 10);
        }
        simvalues['data']['globals'][key] = value;*/
      }
      
      //window.alert('Import complete. Now export to persist this change.');
       
      return; // { 'json':this.dynamicWorksheets, 'text':JSON.stringify(this.dynamicWorksheets, null, 2)};
    }
    
    handleExportToMyJSON() {
      /*
        this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.myjsonio.export2(this.myJsonUrl, this.result, 'simvalues');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );*/
    }
    
    
    handleExportToDynamoDB() {    
      /*   
         this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'simvalues');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );*/
    }
    
    parseGoogleDocJSON(res) {
      var simvalues = this.result['json'];
      simvalues['data'] = {};
      simvalues['data']['rows'] = [];
      simvalues['data']['keys'] = {};

      var rowIndex = 0;
      for (var row  in res.feed.entry) { 
         
         var key = res.feed.entry[row]['title']['$t'];
         simvalues['data']['keys'][key] = {};
         
         var thisRow = {};
         thisRow[key] = {};
               
         for ( var col in res.feed.entry[0] ) {
     
      
            var value = res.feed.entry[row]['title']['$t'];
            if (!isNaN(value)) {
                value = parseInt( value, 10);
            }
            
            // console.log(JSON.stringify(value));
            
            Object.keys(value).forEach( function( subvalue) {
              if (col.match(/^gsx/)) {
                console.log(JSON.stringify(res.feed.entry[rowIndex][col]['$t']));
                //console.log(col);
                simvalues['data']['keys'][key][col.substring(4)] = res.feed.entry[rowIndex][col]['$t'];  
                
                thisRow[key][col.substring(4)] = res.feed.entry[rowIndex][col]['$t'];  
              }
            });         
         }
         
         simvalues['data']['rows'].push( thisRow);
         rowIndex ++;
      }
      
      window.alert('Import complete. Now export to persist this change.');
       
      return { 'json':simvalues, 'text':JSON.stringify(simvalues, null, 2)};
    }

}