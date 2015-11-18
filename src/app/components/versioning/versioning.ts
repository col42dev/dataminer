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

  http: Http;
  version = '0.0.40';
  liveVersion = '';
  hasLatest:number = 0;
  private verifiedCallback:Function = null;
  
    constructor( http: Http) {
      this.http = http; 
    }
    
    verify( verifiedCallback: Function) {
      
      this.verifiedCallback = verifiedCallback;
      this.http
        .get('https://api.myjson.com/bins/1t5wx')
        .map(res => res.json())
        .subscribe(
          res => this.verifyLatestVersion(res)
        );      
    }
  
    verifyLatestVersion(latestVersion) {
      
      this.liveVersion = latestVersion['dataminer']['liveVersion'];
      
      var liveVersionIdArray = [];
      liveVersionIdArray = latestVersion['dataminer']['liveVersion'].split('.');
      let liveVersionMinorIndex:number = parseInt(liveVersionIdArray[2], 10);
   
      var loadedVersionIdArray = [];
      loadedVersionIdArray = this.version.split('.');
      let loadedVersionMinorIndex:number = parseInt(loadedVersionIdArray[2], 10);
   
      if (loadedVersionMinorIndex >= liveVersionMinorIndex) {
        this.hasLatest = 1;
      } else {
        this.hasLatest = 0;
      }
      console.log( liveVersionIdArray[2] + ',' + loadedVersionIdArray[2]);
      
      if (this.verifiedCallback) {
        this.verifiedCallback(this.hasLatest);
      }

    }

}