import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'


declare var AWS:any;

@Component({
  selector: 'dynamodbio',
  templateUrl: 'app/components/dynamodbio/dynamodbio.html',
  styleUrls: ['app/components/dynamodbio/dynamodbio.css'],
  providers: [],
  directives: [],
  pipes: []
})
export class Dynamodbio {

  private http: Http;
  
  constructor(http: Http) {
        this.http = http;
  }
  
  import( myjsonurl : string, callback : Function, _this) {
    
    var table = new AWS.DynamoDB({params: {TableName: 'ptownrules'}});  
    table.getItem({Key: {ptownrules: {S: myjsonurl}}}, function(err, data) {
      callback({ 
            'json':JSON.parse(data.Item.data.S ),
            'text':data.Item.data.S},
            _this);
    });  
  }
  
   export( keyname: string, thisresult: Object) {
 
        var formatted = thisresult['json'];
        formatted['title'] = 'simvalues';
        
 
        var newVersionIdArray = [];
        if ( formatted.hasOwnProperty('version')) {
          newVersionIdArray = formatted['version'].split('.');
        } else {
          newVersionIdArray = ['0', '0', '0'];
        } 
        newVersionIdArray[2] = parseInt(newVersionIdArray[2], 10) + 1;
        formatted['version'] = newVersionIdArray.join('.'); 
        formatted['lastEditDate'] = (new Date()).toString();
        
        thisresult['json'] = formatted;
        thisresult['text'] = JSON.stringify(formatted, null, 2);
        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');

        let data: string = JSON.stringify(formatted, null, 2);
        
        var table = new AWS.DynamoDB({params: {TableName: 'ptownrules'}});
        var itemParams = {
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
            } else {
                 window.alert('DynamoDB has been updated');
            }
        });
   }
   
}