import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';

@Component({
  selector: 'unlocks',
  templateUrl: 'app/components/unlocks/unlocks.html',
  styleUrls: ['app/components/unlocks/unlocks.css'],
  providers: [Myjsonio, Dynamodbio],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Unlocks {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/2hewe?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/os7bs54/public/values?alt=json';
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
         this.myjsonio.export2(this.myJsonUrl, this.result, 'progression');
    }
    
    handleExportToDynamoDB() {
         this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'progression');
    }
    
    parseGoogleDocJSON(res) {
      var rootNode = this.result['json'];
      rootNode['data'] = {};

      let progressions = {};
      for (var i = 0; i < res.feed.entry.length; i++) {  
        var progression = {};
        let content = res.feed.entry[i].content;
        let playerlevel = res.feed.entry[i].gsx$playerlevel.$t;
        console.log( playerlevel);
      
        if (playerlevel.length > 0 ) {
          
          var fields = Object.keys(res.feed.entry[0]);
          fields.forEach( function( thisKey) {
            let includeKey = true;
            
            if (thisKey.indexOf('gsx$')==-1) {
              includeKey = false;
            }
            
            if (thisKey.indexOf('unused')!=-1) {
              includeKey = false;
            }
            if (thisKey == 'gsx$playerlevel') {
              includeKey = false;
            }
            
            if (includeKey) {

              var value = res.feed.entry[i][thisKey].$t
              if (!isNaN(value)) {
                value = parseInt( value, 10);
              }
              var keyName = thisKey.replace('gsx$', '');
              progression[keyName] = value;
            }   
          }.bind(this));
        }
        progressions[playerlevel] = progression;
      }

      rootNode['data'] = progressions;
      
      window.alert('Updated. Now export.');
       
      return { 'json':rootNode, 'text':JSON.stringify(rootNode, null, 2)};
    }

}