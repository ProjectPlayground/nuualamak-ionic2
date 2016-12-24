import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

@Injectable()
export class RoomService {

  add(newRoomName: any) {
    let newRoomCreation = {};
    newRoomCreation['rooms/' + newRoomName] = false;
    newRoomCreation['roomsList/' + newRoomName] = true;
    return firebase.database().ref('/').update(newRoomCreation);
  }

  getAll() {
    return firebase.database().ref('/roomsList').once('value')
      .then(data => {
        let rooms = data.val();
        return rooms ? Object.keys(rooms) : [];
      });

  }

}
