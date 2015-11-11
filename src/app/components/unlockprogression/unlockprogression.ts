import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import { Grid } from '../grid/grid';
import { Column } from '../grid/column';

declare var AWS:any;

@Component({
  selector: 'unlockprogression',
  templateUrl: 'app/components/unlockprogression/unlockprogression.html',
  styleUrls: ['app/components/unlockprogression/unlockprogression.css'],
  providers: [],
  directives: [ROUTER_DIRECTIVES, Grid],
  pipes: []
})
export class Unlockprogression {

    private result: Object;
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/28kay?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/oz4n58j/public/values?alt=json';
    private columns: Array<Column>;
    private categories;
       
    // 
    constructor(params: RouteParams, http: Http){
        this.http = http;
        this.importFromMyJSON();
    }
    
    importFromMyJSON() {  
      console.log('importFromMyJSON');
      
      this.result = { 'json':{}, 'text':'loading...'};
      this.http
        .get(this.myJsonUrl)
        .map(res => res.json())
        .subscribe(
           res =>  this.populateResult( res)
         );
    }
    
    populateResult( res) {
      this.result = { 'json':res, 'text':JSON.stringify(res, null, 2)};
            this.columns = this.getColumns();
      this.categories = this.getCategories();

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
    
    exportToMyJSON() {
        console.log('exportToMyJSON 1');
        
        var formatted = {};
        formatted['title'] = 'unlockprogression';
        
        var newVersionIdArray = [];
        if ( this.result['json'].hasOwnProperty('version')) {
          newVersionIdArray = this.result['json']['version'].split('.');
        } else {
          newVersionIdArray = ['0', '0', '0'];
        } 
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.'); 
        formatted['lastEditDate'] = (new Date()).toString();
        
        formatted['data'] = this.result['json']['data'];  // merge this.result in to formatted - so that header attributes appear first in the object.
        
        this.result['json'] = formatted;
        this.result['text'] = JSON.stringify(formatted, null, 2);
        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');

        let data: string = JSON.stringify(this.result['json'], null, 2);
        this.http.put(this.myJsonUrl, data, { headers: headers}) 
          .map(res => res.json())
          .subscribe(
            data => this.onExportToMyJsonSuccess(),
            err => console.log(err),
            () => console.log('Complete')
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
    }
    
    
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