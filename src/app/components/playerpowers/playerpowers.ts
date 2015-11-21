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

declare var AWS:any;

@Component({
  selector: 'playerpowers',
  templateUrl: 'app/components/playerpowers/playerpowers.html',
  styleUrls: ['app/components/playerpowers/playerpowers.css'],
  providers: [Myjsonio, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES, Grid],
  pipes: []
})

export class Playerpowers {

  private result: Object = { 'json':{}, 'text':'loading...'};
  private http: Http;
  private myJsonUrl: string = 'https://api.myjson.com/bins/457gd?pretty=1';
  private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/o7sqgzj/public/values?alt=json';
  private rows;
  private columns: Array<Column>;
  private myjsonio : Myjsonio;
  private dynamodbio : Dynamodbio;
  private versioning : Versioning;

  constructor(params: RouteParams, http: Http, myjsonio : Myjsonio, dynamodbio : Dynamodbio, versioning: Versioning){
      this.http = http;
      this.myjsonio  = myjsonio;
      this.dynamodbio  = dynamodbio;
      this.dynamodbio.import(this.myJsonUrl, 
        function(myresult : Object) {
          this.result = myresult;
          this.columns = this.getColumns();
          this.rows = this.getRows();
        }.bind(this), this);
      this.versioning = versioning;
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
              this.myjsonio.export2(this.myJsonUrl, this.result, 'playerPowers');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
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
      rowKeys.forEach(function(thisKey) {
        if ((thisKey.indexOf('gsx$') === 0) && (thisKey !== 'gsx$playerpower')) {
            let truncatedKeyName = thisKey.replace('gsx$', '');

            let value = res.feed.entry[rowIndex][thisKey].$t;
            
            if (!row.hasOwnProperty(truncatedKeyName)) {
              row[truncatedKeyName] = {};
            }
            if (isNaN(value)) {
              row[truncatedKeyName] = value;
            } else {
              row[truncatedKeyName] = parseFloat(value);       
            }
        }
      }.bind(this));

      let playerPower = res.feed.entry[rowIndex]['gsx$playerpower'].$t;
      playerPowersValues['data'][playerPower] = row;
    }
    
    window.alert('Imported.');
    return { 'json':playerPowersValues, 'text':JSON.stringify(playerPowersValues, null, 2)};
  }

  getColumns(): Array<Column> {
        var colKeys = [];    
        let characterCount =  Object.keys( this.result['json']['data']).length;       
        let firstCharacterKeyName = Object.keys( this.result['json']['data'])[0];
        let statCount = Object.keys( this.result['json']['data'][firstCharacterKeyName]).length;
        
        colKeys.push('0');
        for ( let stat = 1; stat < statCount; stat ++) {
          colKeys.push(stat);
        }
              
      var thisColumns = [];

      colKeys.forEach( function( thisKey) {
            if (thisKey == '0') {
              thisColumns.push( new Column( thisKey, 'character'));
            } else {
              let desc = Object.keys( this.result['json']['data'][firstCharacterKeyName])[thisKey];
              thisColumns.push( new Column( thisKey, desc));
            }
       }.bind( this));
    
      return thisColumns;
  }

    getRows() {
        var thisRows = [];
        let rowKeys = Object.keys(this.result['json']['data']);
      
        rowKeys.forEach( function( thisRowKey) {
            var row = [];
            row.push(thisRowKey);
            let statKeys = Object.keys(this.result['json']['data'][thisRowKey]);
            statKeys.forEach( function( thisStatKey) {
                let cellvalue = this.result['json']['data'][thisRowKey][thisStatKey]['1']; // + '..' +this.result['json']['data'][thisRowKey][thisStatKey]['50']; 
                row = row.concat(cellvalue);
            }.bind(this));
            thisRows.push( row);    
         }.bind( this));
    return thisRows;
  }
}