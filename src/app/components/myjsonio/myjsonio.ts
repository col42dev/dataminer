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
  
   export( myJsonUrl: string, thisresult: Object) {
 
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
        
       
        this.http.put(myJsonUrl, data, { headers: headers}) 
          .map(res => res.json())
          .subscribe(
            data => this.onExportToMyJsonSuccess(),
            err => console.log(err),
            () => console.log('MyJSON Export Complete')
          ); 
   }
  
  
    onExportToMyJsonSuccess()
    {
         window.alert('MyJSON has been updated');
    }

}