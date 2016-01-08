import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
//import { Grid } from '../grid/grid';
//import { Column } from '../grid/column';
import {Myjson} from '../myjson/myjson';
import {Dynamodbio} from '../dynamodbio/dynamodbio';
import {Versioning} from '../versioning/versioning';

@Component({
  selector: 'unlockprogression',
  templateUrl: 'app/components/unlockprogression/unlockprogression.html',
  styleUrls: ['app/components/unlockprogression/unlockprogression.css'],
  providers: [Myjson, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Unlockprogression {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'oz4n58j';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oz4n58j/public/values?alt=json';
    //private columns: Array<Column>;
    private categories;
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
            this.columns = null; //this.getColumns();
            this.categories = this.getCategories();
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
              this.result = this.dynamodbio.export('oz4n58j', this.result, 'unlockprogression', tables);
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
    }
    
    parseGoogleDocJSON(res) {
      var rootNode = this.result['json'];
      rootNode['data'] = {};

      let progressions = {};
      for (var i = 0; i < res.feed.entry.length; i++) {  
        let subcategory = res.feed.entry[i].gsx$subcategory.$t;
        let amounts = [];
        
        let level = 1;
        while (res.feed.entry[i].hasOwnProperty('gsx$p'+(level))) { 
          let propnameLevel = 'gsx$p' + level;
          let amount = parseInt(res.feed.entry[i][propnameLevel].$t, 10); 
          amounts.push( amount);
          level += 1;
        }
        progressions[subcategory] = amounts;
      }

      rootNode['data'] = progressions;
      
      window.alert('Updated. Now update myjson server to persist this change.');
       
      return { 'json':rootNode, 'text':JSON.stringify(rootNode, null, 2)};
    }

/*
   getColumns(): Array<Column> {
            
        var colKeys = [];    
        
        let levels = this.result['json']['data'][ Object.keys(this.result['json']['data'])[0]].length;
        
        for ( let level = 0; level <= levels; level ++) {
          colKeys.push(level);
        }
       
        var thisColumns = [];
        colKeys.forEach( function( thisKey) {
            if (thisKey == '0') {
              thisColumns.push( new Column( thisKey, 'category'));
            } else {
              thisColumns.push( new Column( thisKey, thisKey));
            }
          }.bind( this));
     
        return thisColumns;
    }*/
    
    
    getCategories() {
        var thisCharacters = [];
        
        let rowKeys = Object.keys(this.result['json']['data']);
        rowKeys.forEach( function( thisKey) {            
            var row = [];
            row.push(thisKey);
            row = row.concat(this.result['json']['data'][thisKey]);
            thisCharacters.push( row);
        }.bind( this));
     
        return thisCharacters;
    }
}