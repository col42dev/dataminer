import {Component} from 'angular2/core';
import {Http, Headers} from 'angular2/http'

import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

@Component({
  selector: 'versioning',
  templateUrl: './components/versioning/versioning.html',
  styleUrls: ['./components/versioning/versioning.css'],
  providers: [],
  directives: [],
  pipes: []
}) 
export class Versioning {
  // Stores dataminer app versioning string on myJSON.

  http: Http;
  version = '0.0.56';
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
        .timeout(1000, new Error('versioning request timeout'))
        .map(res => res.json())
        .subscribe(
          res => this.verifyLatestVersion(res),
          err => this.verifyError(err),
           () => console.log('Random Quote Complete')
        );      
    }
  
    verifyError(err) {
        // in case of myjson error assume latest version is loaded.
        console.log(err );
        console.log('unable to verify that dataminer version is up to date');
        this.hasLatest = 1;
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