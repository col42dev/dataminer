import {Component} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http'

@Component({
  selector: 'versioning',
  templateUrl: 'app/components/versioning/versioning.html',
  styleUrls: ['app/components/versioning/versioning.css'],
  providers: [],
  directives: [],
  pipes: []
}) 
export class Versioning {
  // Stores dataminer app versioning string on myJSON.

  http: Http;
  version = '0.0.44';
  liveVersion = '';
  hasLatest:number = 0;
  private verifiedCallback:Function = null;
  private myJSONVersionURL: string = 'https://api.myjson.com/bins/1t5wx';
  
    constructor( http: Http) {
      this.http = http; 
    }
    
    verify( verifiedCallback: Function) {
      this.verifiedCallback = verifiedCallback;
      this.http
        .get(this.myJSONVersionURL)
        .map(res => res.json())
        .subscribe(
          res => this.verifyLatestVersion(res)
        );      
    }
  
    verifyLatestVersion(latestVersion) {
      
      this.liveVersion = latestVersion['dataminer']['liveVersion'];
      
      let liveVersionIdArray = latestVersion['dataminer']['liveVersion'].split('.');
      let liveVersionMinorIndex:number = parseInt(liveVersionIdArray[2], 10);
   
      let loadedVersionIdArray = this.version.split('.');
      let loadedVersionMinorIndex:number = parseInt(loadedVersionIdArray[2], 10);
   
      this.hasLatest = (loadedVersionMinorIndex >= liveVersionMinorIndex) ? 1 : 0;
      //console.log( liveVersionIdArray[2] + ',' + loadedVersionIdArray[2]);
      
      if (this.verifiedCallback) {
        this.verifiedCallback(this.hasLatest);
      }
    }

}