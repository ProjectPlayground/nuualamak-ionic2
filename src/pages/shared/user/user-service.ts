import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';
import { File } from 'ionic-native';

import { UserModel } from './user.model';

@Injectable()
export class UserService {

  private refDatabaseUsers: firebase.database.Reference;
  private refStorageUsers: firebase.storage.Reference;

  private currentUser: UserModel;

  constructor() {
    this.refDatabaseUsers = firebase.database().ref('users');
    this.refStorageUsers = firebase.storage().ref('users');
  }

  getCurrent() {
    if (this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return this.refDatabaseUsers.child(firebase.auth().currentUser.uid).once('value')
        .then(snapshot => {
          this.currentUser = snapshot.val();
          return this.currentUser;
        });
    }
  }

  login(userModel: UserModel, password: string) {
    return firebase.auth().signInWithEmailAndPassword(userModel.email, password)
      .then(() => {
        return this.getCurrent().then(user => {
          this.getNuuBitsBonus(user);
          this.updateUserInfo(user);
        });
      });
  }

  create(userModel: UserModel, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(userModel.email, password)
      .then(() => {
        userModel.uid = firebase.auth().currentUser.uid;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        userModel.lastLoggedDate = today.getTime();
        userModel.consecutiveLogIn = 0;
        userModel.nuuBits = 0;
        return this.refDatabaseUsers.child(userModel.uid).set(userModel);
      });
  }

  isAuth() {
    return this.currentUser ? true : false;
  }

  logOut() {
    this.currentUser = undefined;
    firebase.auth().signOut();
  }

  updatePassword(newPassword: string) {
    return firebase.auth().currentUser.updatePassword(newPassword);
  }

  updateUser(user: UserModel, userAvatar: string) {
    // Upload the avatar only if it was changed
    if (userAvatar.startsWith('file')) {
      let indexToSplit = userAvatar.lastIndexOf('/')
      let fileDirectory = userAvatar.substring(0, indexToSplit);
      let fileName = userAvatar.substring(indexToSplit + 1);
      // Create the new avatar file
      return File.readAsArrayBuffer(fileDirectory, fileName)
        .then((pictureBuff: ArrayBuffer) => {
          // Upload the avatar picture
          return this.refStorageUsers.child(user.uid).put(pictureBuff)
            .then((fileSnapshot: firebase.storage.UploadTaskSnapshot) => {
              user.avatar = fileSnapshot.downloadURL;
              return this.updateUserAuthEmail(user);
            });
        });
    } else {
      return this.updateUserAuthEmail(user);
    }
  }

  /**
   * Update the user informations
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  updateUserInfo(user: UserModel) {
    return this.refDatabaseUsers.child(firebase.auth().currentUser.uid).update(user)
      .then(() => this.currentUser = user);
  }

  /**
   * Update user nuu bits with bonus from consecutive login
   *
   * @param user
   */
  private getNuuBitsBonus(user) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextLasLoggedDay = new Date(user.lastLoggedDate);
    nextLasLoggedDay.setDate(nextLasLoggedDay.getDate() + 1);
    user.consecutiveLogIn++;
    if (nextLasLoggedDay.getTime() === today.getTime()) {
      switch (user.consecutiveLogIn) {
        case 0:
        case 1:
          break;
        case 2:
        case 3:
          user.nuuBits += 1;
          break;
        case 5:
          user.nuuBits += 3;
          break;
        case 7:
          user.nuuBits += 8;
          break;
        case 10:
          user.nuuBits += 25;
          break;
        default:
          if (user.consecutiveLogIn % 10 === 0) {
            user.nuuBits += 250;
          }
      }
    } else if (user.lastLoggedDate < today.getTime()) {
      user.consecutiveLogIn = 0;
    }
    user.lastLoggedDate = today.getTime();
  }

  /**
   * Update user auth email if changed then user info
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  private updateUserAuthEmail(user: UserModel) {
    if (firebase.auth().currentUser.email !== user.email) {
      return firebase.auth().currentUser.updateEmail(user.email)
        .then(() => this.updateUserInfo(user));
    } else {
      return this.updateUserInfo(user);
    }
  }


}
