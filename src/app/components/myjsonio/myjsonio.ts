import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'

@Component({
  selector: 'myjsonio',
  templateUrl: 'app/components/myjsonio/myjsonio.html',
  styleUrls: ['app/components/myjsonio/myjsonio.css'],
  providers: [],
  directives: [],
  pipes: []
})
export class Myjsonio {
  
  private http: Http;

  constructor(http: Http) {
        this.http = http;
  }
  
  import( myjsonurl : string, callback : Function, _this) {
      var thisresult = null;
      
      this.http
      .get(myjsonurl)
      .map(res => res.json())
      .subscribe(
        res => callback({ 
          'json':res, 
          'text':JSON.stringify(res, null, 2)},
           _this)
        );
  }
  
   export2( myJsonUrl: string, thisresult: Object, titlename: string) {
 
        var formatted = {};
        formatted['title'] = titlename;
        
 
        var newVersionIdArray = [];
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
        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');

        let data: string = JSON.stringify(thisresult['json'], null, 2);
        console.log(data);
        
        this.http.put(myJsonUrl, data, { headers: headers}) 
          .map(res => res.json())
          .subscribe(
            data => this.onExportToMyJsonSuccess(),
            err => window.alert(err),
            () => console.log('MyJSON Export Complete')
          ); 

   }
  
    onExportToMyJsonSuccess()
    {
         window.alert('MyJSON has been updated');
    }

}