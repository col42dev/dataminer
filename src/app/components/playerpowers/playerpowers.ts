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
  selector: 'playerpowers',
  templateUrl: 'app/components/playerpowers/playerpowers.html',
  styleUrls: ['app/components/playerpowers/playerpowers.css'],
  providers: [Myjsonio, Dynamodbio],
  directives: [ROUTER_DIRECTIVES, Grid],
  pipes: []
})

export class Playerpowers {

  private result: Object = { 'json':{}, 'text':'loading...'};
  private http: Http;
  // Next value need changes
  private myJsonUrl: string = 'https://api.myjson.com/bins/339pe?pretty=1';
  private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/o7sqgzj/public/values?alt=json';
  private playerpowers;
  private columns: Array<Column>;
  private myjsonio : Myjsonio;
  private dynamodbio : Dynamodbio; 

  constructor(params: RouteParams, http: Http, myjsonio : Myjsonio, dynamodbio : Dynamodbio){
      this.http = http;
      this.myjsonio  = myjsonio;
      this.dynamodbio  = dynamodbio;
      this.dynamodbio.import(this.myJsonUrl, this.onDynamodbImport, this);
  }
  
  onDynamodbImport( myresult : Object, _this) {
    _this.result = myresult;
    _this.playerpowers = _this.getPlayerpowers();
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
        this.myjsonio.export2(this.myJsonUrl, this.result, 'playerPowers');
  }
  
  handleExportToDynamoDB() {
        this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'playerPowers');
  }

  parseGoogleDocJSON(res) {
    let playerPowersValues = this.result['json'];
    let title = playerPowersValues['title'];
    let version = playerPowersValues['version'];
    let lastEditDate = playerPowersValues['lastEditDate'];

    playerPowersValues['data'] = {};
    playerPowersValues['title'] = title;
    playerPowersValues['version'] = version;
    playerPowersValues['lastEditDate'] = lastEditDate;

    for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 
      var row: Object = {};
      
      let rowKeys = Object.keys(res.feed.entry[rowIndex]);
      rowKeys.forEach( function(thisKey) {
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
      playerPowersValues['data'] [characterType] = row;    
    }
    
    window.alert('Imported.');
      
    return { 'json':playerPowersValues, 'text':JSON.stringify(playerPowersValues, null, 2)};
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

  getPlayerpowers() {
      var thisPlayerpowers = [];
      
      let rowKeys = Object.keys(this.result['json']['data']);
      rowKeys.forEach( function( thisKey) {
              thisPlayerpowers.push( thisKey);
      }.bind( this));
    
      return thisPlayerpowers;
  }
}