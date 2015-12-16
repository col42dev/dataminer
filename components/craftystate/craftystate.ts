import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Location} from 'angular2/router';
import {Myjsonio} from '../myjsonio/myjsonio';
import {Dynamodbio} from '../dynamodbio/dynamodbio';

declare var AWS:any;

@Component({
  selector: 'craftystate',
  templateUrl: './components/craftystate/craftystate.html',
  styleUrls: ['./components/craftystate/craftystate.css'],
  providers: [Myjsonio, Dynamodbio],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Craftystate {
    private result: Object = { 'json':{}, 'text':'loading...'};;
    private http: Http;
    private myJsonUrl: string = 'https://api.myjson.com/bins/1a9rm?pretty=1';
    private myjsonio : Myjsonio;
    private dynamodbio : Dynamodbio; 
        
    // 
    constructor(params: RouteParams, http: Http, myjsonio : Myjsonio, dynamodbio : Dynamodbio){
        this.http = http;
        this.myjsonio  = myjsonio;
        this.dynamodbio  = dynamodbio;
        this.dynamodbio.import(this.myJsonUrl, 
          function(myresult : Object) {
            this.result = myresult;
          }.bind(this));
    }
    
    exportToMyJSON() {
        console.log('exportToMyJSON & AWS');
        
        var formatted = this.result['json'];
        formatted['title'] = 'craftystate';
        
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
            () => console.log('MyJSON Export Complete')
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
    

}