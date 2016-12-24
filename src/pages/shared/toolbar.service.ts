import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class SideMenuService {

  private initSource = new Subject<boolean>();

  initSource$: Observable<boolean> = this.initSource.asObservable();

  init(init: boolean) {
    this.initSource.next(init);
  }

}
