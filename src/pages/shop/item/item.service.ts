import { Injectable } from '@angular/core';
import { File } from 'ionic-native';
import * as firebase from 'firebase';

import { ItemModel } from './item.model';
import { UserModel } from '../../shared/user/user.model';
import { ItemBoughtModel } from './item-bought.model';
import { UserService } from '../../shared/user/user-service';

@Injectable()
export class ItemService {

  private refItemsList: firebase.database.Reference;
  private refItemsBought: firebase.database.Reference;
  private refStorageBackgroundImage: firebase.storage.Reference;

  constructor(public userService: UserService) {
    this.refItemsList = firebase.database().ref('itemsList');
    this.refItemsBought = firebase.database().ref('itemsBought');
    this.refStorageBackgroundImage = firebase.storage().ref('backgroundImage');
  }

  getAll() {
    return this.refItemsList.once('value')
      .then((data) => {
        let items = data.val();
        return items ? Object.keys(items).map(index => items[index]) : [];
      });
  }

  add(newItem: ItemModel) {
    let newItenId = this.refItemsList.push().key;
    newItem.id = newItenId;
    if (newItem.category === 'background_image' && newItem.background_image) {
      let indexToSplit = newItem.background_image.lastIndexOf('/');
      let fileDirectory = newItem.background_image.substring(0, indexToSplit);
      let fileName = newItem.background_image.substring(indexToSplit + 1);
      // Create the new avatar file
      return File.readAsArrayBuffer(fileDirectory, fileName)
        .then((pictureBuff: ArrayBuffer) => {
          // Upload the avatar picture
          return this.refStorageBackgroundImage.put(pictureBuff)
            .then((fileSnapshot: firebase.storage.UploadTaskSnapshot) => {
              newItem.background_image = fileSnapshot.downloadURL;
              return this.refItemsList.child(newItenId).update(newItem);
            });
        });
    } else {
      return this.refItemsList.child(newItenId).update(newItem);
    }
  }

  buy(user: UserModel, item: ItemModel) {
    let newBoughtItemId = this.refItemsBought.child(user.uid).push().key;
    let itemToBuy = <ItemBoughtModel>{
      id         : newBoughtItemId,
      userUid    : user.uid,
      itemId     : item.id,
      isActivated: false
    };
    return this.refItemsBought.child(user.uid).child(newBoughtItemId).set(itemToBuy)
      .then(() => {
        user.nuuBits = user.nuuBits - item.price;
        return this.userService.updateUserInfo(user);
      });
  }

  getItemsBought(user: UserModel, recursive: boolean): any {
    return this.refItemsBought.child(user.uid).once('value')
      .then(dataItemsBought => {
        let itemsBought = dataItemsBought.val();
        if (!recursive) {
          return itemsBought ? Object.keys(itemsBought).map(index => itemsBought[index]) : [];
        } else {
          return Promise.all(Object.keys(itemsBought).map(itemBoughtId => {
            return this.refItemsList.child(itemsBought[itemBoughtId].itemId).once('value')
              .then(data => data.val());
          }))
          ;
        }
      });
  }

  activate(itemBoughtInfo: ItemBoughtModel) {
    return this.refItemsBought.child(itemBoughtInfo.userUid).child(itemBoughtInfo.itemId)
      .set({isActivated: true});
  }
}
