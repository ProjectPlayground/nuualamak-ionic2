import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';

@Injectable()
export class ChatService {

  private refRooms: firebase.database.Reference;

  constructor(private userService: UserService) {
    this.refRooms = firebase.database().ref('rooms');
  }

  getLastsEvent(roomName: string) {
    return this.refRooms.child(roomName).limitToLast(20);
  }

  send(roomName: string, typedMsg: string) {
    return this.userService.getCurrent()
      .then((user: UserModel) => {
      console.log(new Date().getTime());
        return this.refRooms.child(roomName).push({
          user: {uid: user.uid, username: user.username},
          content: typedMsg,
          timestamp: new Date().getTime()
        });
      });
  }
}
