import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {Myjsonio} from '../myjsonio/myjsonio';


declare var AWS:any;

@Component({
  selector: 'dynamodbio',
  templateUrl: './components/dynamodbio/dynamodbio.html',
  styleUrls: ['./components/dynamodbio/dynamodbio.css'],
  providers: [Myjsonio],
  directives: [],
  pipes: []
})
export class Dynamodbio {

  private http: Http;
  private myjsonio : Myjsonio;
  private lastExportDateMyJSONURL:string= 'https://api.myjson.com/bins/3ywwt?pretty=1';
 
  constructor(http: Http, myjsonio: Myjsonio) {
    this.http = http;
    this.myjsonio = myjsonio;
  }
  
  import( myjsonurl : string, callback : Function) {
    var table = new AWS.DynamoDB({params: {TableName: 'ptownrules'}});  
    table.getItem({Key: {ptownrules: {S: myjsonurl}}}, function(err, data) {
      callback({ 
            'json':JSON.parse(data.Item.data.S ),
            'text':data.Item.data.S});
    });  
  }
   
   
  export( keyname: string, thisresult: Object, titlename: string) {
 
        let formatted = {'title' : titlename};
        let newVersionIdArray = [];
        if ( thisresult['json'].hasOwnProperty('version')) {
          newVersionIdArray = thisresult['json']['version'].split('.');
        } else {
          newVersionIdArray = ['0', '0', '0'];
        } 
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.'); 
        formatted['lastEditDate'] = (new Date()).toString();
        formatted['data'] = thisresult['json']['data'];  // merge this.result in to formatted - so that header attributes appear first in the object.
        thisresult['json'] = formatted;
        thisresult['text'] = JSON.stringify(formatted, null, 2);
        
        let tableNames = ['ptownrules', 'ptownrulestest01']; 
        let dynamodbPartitionKeyName = 'ptownrules';
        
        tableNames.forEach( function ( tableName) {
          
          let data: string = JSON.stringify(thisresult['json'], null, 2);
          let table = new AWS.DynamoDB({params: {TableName: tableName}});
          let itemParams = {
              "TableName":tableName, 
              "Item": {
                  'ptownrules' : {"S":keyname},
                  "data" : {"S":data}   
              }
          };
    
          table.putItem(itemParams, function(err, data) { 
            console.log('putItem');
              if (err) {
                  console.log(err);
                  window.alert('ERROR: putItem Failed:' + JSON.stringify(itemParams));
              } else {
                  window.alert('DynamoDB has been updated');
                  //this.updateLastDynamoDBExportDate();
              }
          }.bind(this));
                
        });
        
        return thisresult;
   }
   
   
  export2( keyname: string, thisresult: Object, titlename: string) {
 
        let formatted = {'title' : titlename};
        let newVersionIdArray = [];
        if ( thisresult['json'].hasOwnProperty('version')) {
          newVersionIdArray = thisresult['json']['version'].split('.');
        } else {
          newVersionIdArray = ['0', '0', '0'];
        } 
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.'); 
        formatted['lastEditDate'] = (new Date()).toString();
        formatted['data'] = thisresult['json']['data'];  // merge this.result in to formatted - so that header attributes appear first in the object.
        thisresult['json'] = formatted;
        thisresult['text'] = JSON.stringify(formatted, null, 2);
        
        let data: string = JSON.stringify(thisresult['json'], null, 2);
        let table = new AWS.DynamoDB({params: {TableName: 'ptownrules'}});
        let itemParams = {
            "TableName":"ptownrules", 
            "Item": {
                "ptownrules" : {"S":keyname},
                "data" : {"S":data}   
            }
        };
  
        table.putItem(itemParams, function(err, data) { 
          console.log('putItem');
            if (err) {
                console.log(err);
                window.alert('ERROR: putItem Failed:' + JSON.stringify(itemParams));
            } else {
                 window.alert('DynamoDB has been updated');
                 this.updateLastDynamoDBExportDate();
                 this.myjsonio.export2(keyname, thisresult, titlename);
            }
        }.bind(this));
        
        return thisresult;
   }
   
   updateLastDynamoDBExportDate() {
        // update last export date to MyJSON
        let myJSONheaders = new Headers();
        myJSONheaders.append('Content-Type', 'application/json; charset=utf-8');
        
        let data: string = JSON.stringify({ 'lastDynamoDBExportDate' : (new Date()).toString()}, null, 2);
        this.http.put(this.lastExportDateMyJSONURL, data, { headers: myJSONheaders}) 
          .map(res => res.json())
          .subscribe(
            data => console.log('MyJSON updateLastDynamoDBExportDate data:' + JSON.stringify(data)),
            err => window.alert('ERROR: MyJSON updateLastDynamoDBExportDate:' + JSON.stringify(err)),
            () => console.log('MyJSON last export date export complete')
          ); 
   }
   

}