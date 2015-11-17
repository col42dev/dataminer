import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';
import {Versioning} from '../versioning/versioning';

@Component({
  selector: 'recipes',
  templateUrl: 'app/components/recipes/recipes.html',
  styleUrls: ['app/components/recipes/recipes.css'],
  providers: [Myjsonio, Dynamodbio, Versioning],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Recipes {

    private result: Object = { 'json':{}, 'text':'loading...'};
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/51viy?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/od3otrm/public/values?alt=json';
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
              this.myjsonio.export2(this.myJsonUrl, this.result, 'recipes');
            } else {
              window.alert('FAILED: you do not have the latest dataminer app version loaded:' + this.versioning.liveVersion);
            }
          }.bind(this)
        );
    }
    
    handleExportToDynamoDB() {
         this.versioning.verify( function( verified: number) {
            if (verified===1) {
              this.result = this.dynamodbio.export2(this.myJsonUrl, this.result, 'recipes');
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
      var recipejson = this.result['json'];
      
      recipejson['data'] = {};
      recipejson['data']['craftableDefines'] = {};


      for (var i = 0; i < res.feed.entry.length; i++) { 
  
        var content = res.feed.entry[i].content;
        var workstation = res.feed.entry[i].gsx$recipeworkstationid.$t;
  
        if (workstation.length > 0 && workstation !== 'Null') {
          var recipe = {};
          var workstationLevel = res.feed.entry[i].gsx$recipeworkstationlevel.$t;
  
          recipe['construction'] = [];
          recipe['construction'].push(workstation+workstationLevel);
          recipe['actionPoints'] = parseInt( res.feed.entry[i].gsx$inputactionpointsamount.$t, 10);
  
          recipe['input'] = {};
          for ( var resourceInputIndex = 1; resourceInputIndex <= 3; resourceInputIndex ++) {
            var propnameInputID = 'gsx$inputresource' + resourceInputIndex + 'id';
            var propnameInputAmount = 'gsx$inputresource' + resourceInputIndex + 'amount';
            var resourceInputId = res.feed.entry[i][propnameInputID].$t;
            if ( resourceInputId.length > 0) {
              var resourceAmount = parseInt( res.feed.entry[i][propnameInputAmount].$t, 10);
              recipe['input'][resourceInputId] = resourceAmount;
            }
          }
  
          recipe['output'] = {};
          for ( var resourceOutputIndex = 1; resourceOutputIndex <= 1; resourceOutputIndex ++) {
            var propnameOutputID = 'gsx$outputresource' + resourceOutputIndex + 'id';
            var propnameOutputAmount = 'gsx$outputresource' + resourceOutputIndex + 'amount';
            var propnameOutputLevel = 'gsx$outputresource' + resourceOutputIndex + 'level';
            var resourceOutputId = res.feed.entry[i][propnameOutputID].$t;
            if ( resourceOutputId.length > 0) {
              var resourceOutputAmount = parseInt( res.feed.entry[i][propnameOutputAmount].$t, 10);
              var resourceOutputLevel = res.feed.entry[i][propnameOutputLevel].$t;
              if (resourceOutputLevel.length > 0) {
                resourceOutputLevel = parseInt( resourceOutputLevel, 10);
                if (resourceOutputLevel == 0) 
                {
                  resourceOutputLevel = '';
                }
              } else {
                resourceOutputLevel = '';
              }
              recipe['output'][resourceOutputId+resourceOutputLevel] = resourceOutputAmount;
            }
          }
  
          recipe['duration'] = parseInt( res.feed.entry[i].gsx$inputtimeamount.$t, 10);
          if ( recipe['duration'] === 0) {
            recipe['duration'] = 1;
          }
    
          recipe['recipename'] = res.feed.entry[i].gsx$recipename.$t;
          recipe['desc'] = res.feed.entry[i].gsx$recipedescription.$t;
          recipe['category'] = res.feed.entry[i].gsx$recipecategory.$t;
          
          if (res.feed.entry[i].gsx$recipesubcategory.$t.length>0) {
            recipe['recipesubcategory'] = res.feed.entry[i].gsx$recipesubcategory.$t;
          }
  
  
          var recipeid = res.feed.entry[i].gsx$recipeid.$t;
          
          recipejson['data']['craftableDefines'][recipeid] = recipe;
  
          recipe['playerlevelneeded'] = parseInt( res.feed.entry[i].gsx$playerlevelneeded.$t, 10);
          recipe['simMotives'] = [];
          for ( var motivesIndex = 1; motivesIndex <= 5; motivesIndex ++) {
                var recipesimulationmotive = 'gsx$recipesimulationmotive' + motivesIndex + 'id';
                var id = res.feed.entry[i][recipesimulationmotive].$t;
                if (id.length > 0) {
                  recipe['simMotives'].push(id);
                }
          }
  
          if (res.feed.entry[i].gsx$recipesimulationmaxworkers.$t.length > 0) {
            recipe['maxWorkers'] = parseInt( res.feed.entry[i].gsx$recipesimulationmaxworkers.$t, 10);
          } 
  
          recipe['xp'] = parseInt( res.feed.entry[i].gsx$recipeplayerxpadded.$t, 10);      
          recipe['automate'] = res.feed.entry[i].gsx$outputautomaticrenew.$t;
  
          if (res.feed.entry[i].gsx$objectslotcategory.$t.length > 0) {
            recipe['objectSlotCategory'] = res.feed.entry[i].gsx$objectslotcategory.$t;
          }
  
          if (res.feed.entry[i].gsx$motiveslotcapacity.$t.length > 0) {
            recipe['motiveSlotCapacity'] = parseInt( res.feed.entry[i].gsx$motiveslotcapacity.$t, 10);
          }
  
          if (res.feed.entry[i].gsx$workstationslotcapacity.$t.length > 0) {
            recipe['workstationSlotCapacity'] = parseInt(res.feed.entry[i].gsx$workstationslotcapacity.$t, 10);
          }
  
          if (res.feed.entry[i].gsx$defenseslotcapacity.$t.length > 0) {
            recipe['defenseSlotCapacity'] = parseInt(res.feed.entry[i].gsx$defenseslotcapacity.$t, 10);
          }
  
          // local/global storage
          recipe['localStorage'] = parseInt(res.feed.entry[i].gsx$recipelocalstorage.$t, 10);
          //recipe['globalStorage'] = parseInt(res.feed.entry[i].gsx$recipeglobalstorage1.$t, 10);
        }
      }
             
             
      window.alert('Updated. Now update myjson server to persist this change.');
             
      return { 'json':recipejson, 'text':JSON.stringify(recipejson, null, 2)};
    }

}