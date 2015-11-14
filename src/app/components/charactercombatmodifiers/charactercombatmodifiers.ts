import {Component, View, NgFor} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import { Grid } from '../grid/grid';
import { Column } from '../grid/column';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';

declare var AWS:any;

@Component({
  selector: 'charactercombatmodifiers',
  templateUrl: 'app/components/charactercombatmodifiers/charactercombatmodifiers.html',
  styleUrls: ['app/components/charactercombatmodifiers/charactercombatmodifiers.css'],
  providers: [Myjsonio, Dynamodbio],
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
         this.myjsonio.export2(this.myJsonUrl, this.result, 'characterCombatModifiers');
    }
    
    handleExportToDynamoDB() {
         this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'characterCombatModifiers');
    }
    
    /*
    exportToMyJSON() { 
        var formatted = this.result['json'];
        formatted['title'] = 'characterCombatModifiers';
        
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
            () => console.log('MyJSON server has been updated.')
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
    }*/
    
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
