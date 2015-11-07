import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';

@Component({
  selector: 'mapstate',
  templateUrl: 'app/components/mapstate/mapstate.html',
  styleUrls: ['app/components/mapstate/mapstate.css'],
  providers: [],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Mapstate {

    private result: Object;
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/1184a?pretty=1';
    private googleDocJsonFeedUrl: string ='https://spreadsheets.google.com/feeds/list/1xP0aCx9S4wG_3XN9au5VezJ6xVTnZWNlOLX8l6B69n4/o5onybx/public/values?alt=json';
   
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
          res => this.result  = { 'json':res, 'text':JSON.stringify(res, null, 2)}
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
    
    exportToMyJSON() {
        console.log('exportToMyJSON');
        
        var formatted = this.result['json'];
        formatted['title'] = 'mapstate';
        
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
            () => console.log('Complete')
          ); 
    }
    
    onExportToMyJsonSuccess()
    {
         window.alert('MyJSON has been updated');
    }
    
    parseGoogleDocJSON(res) {
      
      var mapstate = this.result['json'];
      mapstate['map'] = {};
      mapstate['map']['rows'] = [];

      for (var rowIndex = 0; rowIndex < res.feed.entry.length; rowIndex++) { 
        var row = [];
        var colIndex = 0;
        while (res.feed.entry[rowIndex].hasOwnProperty('gsx$h'+(colIndex+1))) { 
          var cell = res.feed.entry[rowIndex]['gsx$h'+(colIndex+1)];
          var cellValue = cell.$t;
          if (cellValue.length == 0) {
              cellValue = '_';
          }
          
          cellValue = cellValue.replace(/\s/g, '');
          
          row.push(cellValue  );
          colIndex ++;
        }
        mapstate['map']['rows'].push(row);
      }
       
      window.alert('Updated. Now update myjson server to persist this change.');
 
      return { 'json':mapstate, 'text':JSON.stringify(mapstate, null, 2)};
    }

}