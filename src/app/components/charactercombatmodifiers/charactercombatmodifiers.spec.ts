import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  inject,
  injectAsync,
  TestComponentBuilder,
  beforeEachProviders
} from 'angular2/testing';
import {provide} from 'angular2/core';
import {Charactercombatmodifiers} from './charactercombatmodifiers';


describe('Charactercombatmodifiers Component', () => {

  beforeEachProviders(() => []);


  it('should ...', injectAsync([TestComponentBuilder], (tcb:TestComponentBuilder) => {
    return tcb.createAsync(Charactercombatmodifiers).then((fixture) => {
      fixture.detectChanges();
    });
  }));

});
