import {Component, View, NgFor} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import { Grid } from '../grid/grid';
import { Column } from '../grid/column';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';
import {Versioning} from '../versioning/versioning';

@Component({
  selector: 'characterstats',
  templateUrl: 'app/components/characterstats/characterstats.html',
  styleUrls: ['app/components/characterstats/characterstats.css'],
  providers: [Myjsonio, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES, Grid],
  pipes: []
})
export class Characterstats {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/339pe?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/omsznkc/public/values?alt=json';
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
        this.dynamodbio.import(this.myJsonUrl, this.onDynamodbImport, this);
        this.versioning = versioning;
    }
    
    onDynamodbImport( myresult : Object, _this) {
      _this.result = myresult;
      _this.characters = _this.getCharacters();
      _this.columns = _this.getColumns();
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
              this.myjsonio.export2(this.myJsonUrl, this.result, 'characterStats');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
    }
    
    handleExportToDynamoDB() {
        this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'characterStats');
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

      simvalues['data'] = {};
      simvalues['title'] = title;
      simvalues['version'] = version;
      simvalues['lastEditDate'] = lastEditDate;

      for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 
        var row: Object = {};
        
        let rowKeys = Object.keys(res.feed.entry[rowIndex]);
        rowKeys.forEach( function( thisKey) {
          if (thisKey.indexOf('gsx$') === 0 && thisKey !== 'gsx$charactertype') {
             let truncatedKeyName = thisKey.replace('gsx$', '');

             let levelStrippedKeyName = truncatedKeyName.match(/([a-z]+)\d+$/)[1];

             let level = truncatedKeyName.match(/[a-z]+(\d+)$/)[1];
        
             let value = res.feed.entry[rowIndex][thisKey].$t;
              
             if ( !row.hasOwnProperty(levelStrippedKeyName)) {
                row[levelStrippedKeyName] = {};
             }
             if (isNaN(value)) {
               row[levelStrippedKeyName][level] = value;
             } else {
               row[levelStrippedKeyName][level] = parseFloat( value);       
             }
         }
        }.bind(this));

        let characterType = res.feed.entry[rowIndex]['gsx$charactertype'].$t;
        simvalues['data'] [characterType] = row;    
      }
      
      window.alert('Imported.');
       
      return { 'json':simvalues, 'text':JSON.stringify(simvalues, null, 2)};
    }
    
    
    getColumns(): Array<Column> {
            
        var rowKeys = Object.keys(this.result['json']['data']);
        var colKeys = Object.keys(this.result['json']['data'][rowKeys[3]]); //3 - skip past header fields!
               
        var thisColumns = [];
 
        colKeys.forEach( function( thisKey) {
            thisColumns.push( new Column( thisKey, thisKey));
          }.bind( this));
     
        return thisColumns;
    }
    
    
    getCharacters() {
        var thisCharacters = [];
        
        let rowKeys = Object.keys(this.result['json']['data']);
        rowKeys.forEach( function( thisKey) {
                thisCharacters.push( this.result['json']['data'][thisKey]);
        }.bind( this));
     
        return thisCharacters;
    }
    
}
