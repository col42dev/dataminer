import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {Myjson} from '../myjson/myjson';


declare var AWS:any;

@Component({
  selector: 'dynamodbio',
  templateUrl: 'app/components/dynamodbio/dynamodbio.html',
  styleUrls: ['app/components/dynamodbio/dynamodbio.css'],
  providers: [Myjson],
  directives: [],
  pipes: []
})
export class Dynamodbio {

  private http: Http;
  private myjsonio : Myjson;
  private lastExportDateMyJSONURL:string= 'https://api.myjson.com/bins/3ywwt?pretty=1';
 
  constructor(http: Http, myjsonio: Myjson) {
    this.http = http;
    this.myjsonio = myjsonio;
  }
  
  import( myjsonurl : string, callback : Function) {
    var table = new AWS.DynamoDB({params: {TableName: 'ptownrules'}});  
    console.log('myjsonurl:' + myjsonurl);
    table.getItem({Key: {ptownrules: {S: myjsonurl}}}, function(err, data) {
      callback({ 
            'json':JSON.parse(data.Item.data.S ),
            'text':data.Item.data.S});
    });  
  }
   
  updateLastDynamoDBExportDate( exportComment) {
        // update last export date to MyJSON
        let myJSONheaders = new Headers();
        myJSONheaders.append('Content-Type', 'application/json; charset=utf-8');
    
        let data: string = JSON.stringify({ 'lastDynamoDBExportDate' : (new Date()).toString()}, null, 2);
      
  
        this.http.put(this.lastExportDateMyJSONURL, data, 
        { headers: myJSONheaders}) 
          .map(res => res.json())
          .subscribe(
            data => console.log('MyJSON updateLastDynamoDBExportDate data:' + JSON.stringify(data)),
            err => window.alert('ERROR: MyJSON updateLastDynamoDBExportDate:' + JSON.stringify(err)),
            () => console.log('MyJSON last export date export complete')
          ); 
         
        let dataminerHeaders = new Headers();
        dataminerHeaders.append('Content-Type', 'application/json');
        let formData:string =  JSON.stringify({'comment': exportComment});
          
         console.log('comment:' + formData);
         //exportComment
         this.http.post(
            'http://ec2-54-67-81-203.us-west-1.compute.amazonaws.com:5500/backfillerapi/process', 
            formData, 
            { headers: dataminerHeaders}) 
          .map(res => res.json())
          .subscribe(
            data => console.log('backfiller api  data:' + formData),
            err => function(err) {
                if ( JSON.stringify(err) !== '{}') {
                    window.alert('ERROR: backfiller api:' + JSON.stringify(err));
                }
            },
            () => console.log('backfiller api export complete')
          ); 
  }
   
  export( keyname: string, thisresult: Object, titlename: string, tableNames:string[] = ['ptownrules', 'ptownrulestest01']) {
 
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
  
        let comment = 'no comment';      
        if ( thisresult.hasOwnProperty('comment')) {
          comment = thisresult['comment'];
        } 
        formatted['comment'] = comment;
        formatted['data'] = thisresult['json']['data'];  // merge this.result in to formatted - so that header attributes appear first in the object.
        thisresult['json'] = formatted;
        thisresult['text'] = JSON.stringify(formatted, null, 2);
        
        //let tableNames = ['ptownrules', 'ptownrulestest01']; 
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
                  window.alert('DynamoDB table: ' + tableName + ' has been updated.');
                  if (tableName === 'ptownrules') {
                    this.updateLastDynamoDBExportDate( thisresult['json']['comment']);
                  }
              }
          }.bind(this));
                
        }.bind(this));
        
        return thisresult;
   }
   
  

   

}