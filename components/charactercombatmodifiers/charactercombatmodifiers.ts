import {Component, View} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import { Grid } from '../grid/grid';
import { Column } from '../grid/column';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';
import {Versioning } from '../versioning/versioning';

declare var AWS:any;

@Component({
  selector: 'charactercombatmodifiers',
  templateUrl: './components/charactercombatmodifiers/charactercombatmodifiers.html',
  styleUrls: ['./components/charactercombatmodifiers/charactercombatmodifiers.css'],
  providers: [Myjsonio, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES, Grid],
  pipes: []
})
export class Charactercombatmodifiers {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/22cm6?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oevkvmv/public/values?alt=json';
    private characters;
    private columns: Array<Column>;
    private myjsonio : Myjsonio;
    private dynamodbio : Dynamodbio; 
    private versioning: Versioning;
    
    // 
    constructor(params: RouteParams, http: Http, myjsonio : Myjsonio, dynamodbio : Dynamodbio, versioning: Versioning){
        this.http = http;
        this.myjsonio  = myjsonio;
        this.dynamodbio  = dynamodbio;
        this.versioning = versioning;
        this.dynamodbio.import('oevkvmv',     
          function( myresult : Object) {
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
              this.myjsonio.export2(this.myJsonUrl, this.result, 'characterCombatModifiers');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
    }
    
    handleExportToDynamoDB() {
        this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.result = this.dynamodbio.export("oevkvmv", this.result, 'characterCombatModifiers');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
    }
      
    parseGoogleDocJSON(res) {
      let  simvalues = this.result['json'];
      let title = simvalues['title'];
      let version = simvalues['version'];
      let lastEditDate = simvalues['lastEditDate'];
      
      simvalues = {};
      
      //ensures header fields appear at start of JSON
      simvalues['title'] = title;
      simvalues['version'] = version;
      simvalues['lastEditDate'] = lastEditDate;
      
      simvalues['data'] = {};

      for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 
        var row: Object = {};
        
        let rowKeys = Object.keys(res.feed.entry[rowIndex]);
        rowKeys.forEach( function( thisKey) {
          if (thisKey.indexOf('gsx$') === 0) {
             switch (thisKey) {
               case 'gsx$characterprefab':
               case 'gsx$combatanttype':
                break;
               default:
                {
                  let truncatedKeyName = thisKey.replace('gsx$', '');
                  let value = res.feed.entry[rowIndex][thisKey].$t; 
                  if (isNaN(value)) {
                    row[truncatedKeyName] = value; 
                  } else {
                    row[truncatedKeyName] = parseFloat( value);        
                  }
                }
                break;
             }
         }
        }.bind(this));

        let characterType = res.feed.entry[rowIndex]['gsx$characterprefab'].$t;
        if (!simvalues['data'] .hasOwnProperty(characterType)) {
          simvalues['data'] [characterType] = [];
        }
        simvalues['data'][characterType].push(row); 
      }
      
      window.alert('Updated. Now update myjson server to persist this change.');

      
       
      return { 'json':simvalues, 'text':JSON.stringify(simvalues, null, 2)};
    }
    
    
    getColumns(): Array<Column> {
            
        var rowKeys = Object.keys(this.result['json']);
        var colKeys = Object.keys(this.result['json'][rowKeys[3]]); //3 - skip past header fields!
               
        var thisColumns = [];
 
        colKeys.forEach( function( thisKey) {
            thisColumns.push( new Column( thisKey, thisKey));
          }.bind( this));
     
        return thisColumns;
    }
    
    
    getCharacters() {
        var thisCharacters = [];
        
        let rowKeys = Object.keys(this.result['json']);
        rowKeys.forEach( function( thisKey) {
            switch (thisKey) {
              case 'title':
              case 'version':
              case 'lastEditDate':
                break;
              default:
                thisCharacters.push( this.result['json'][thisKey]);
                break;
            }
        }.bind( this));
     
        return thisCharacters;
    }
    
}
