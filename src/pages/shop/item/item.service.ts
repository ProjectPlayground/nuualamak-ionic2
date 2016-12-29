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

  getAll(): firebase.Promise<Array<ItemModel>> {
    return this.refItemsList.once('value')
      .then((data) => {
        let items = data.val();
        return items ? Object.keys(items).map(index => items[index]) : [];
      });
  }

  add(newItem: ItemModel) {
    let newItemId = this.refItemsList.push().key;
    newItem.id = newItemId;
    if (newItem.category === 'theme' && newItem.background_image) {
      let indexToSplit = newItem.background_image.lastIndexOf('/');
      let fileDirectory = newItem.background_image.substring(0, indexToSplit);
      let fileName = newItem.background_image.substring(indexToSplit + 1);
      // Create the new background file
      return File.readAsArrayBuffer(fileDirectory, fileName)
        .then((pictureBuff: ArrayBuffer) => {
          // Upload the background
          return this.refStorageBackgroundImage.put(pictureBuff)
            .then((fileSnapshot: firebase.storage.UploadTaskSnapshot) => {
              newItem.background_image = fileSnapshot.downloadURL;
              return this.refItemsList.child(newItemId).update(newItem);
            });
        });
    } else {
      return this.refItemsList.child(newItemId).update(newItem);
    }
  }

  buy(user: UserModel, item: ItemModel) {
    let newBoughtItemId = this.refItemsBought.child(user.uid).push().key;
    let itemToBuy = <ItemBoughtModel>{
      id: newBoughtItemId,
      userUid: user.uid,
      itemId: item.id,
      isActivated: false
    };
    return this.refItemsBought.child(user.uid).child(newBoughtItemId).set(itemToBuy)
      .then(() => {
        user.nuuBits = user.nuuBits - item.price;
        return this.userService.updateUserInfo(user);
      });
  }

  getItemsBought(user: UserModel): firebase.Promise<Array<ItemBoughtModel>> {
    return this.refItemsBought.child(user.uid).once('value')
      .then(data => {
        let itemsBought = data.val();
        return itemsBought ? Object.keys(itemsBought).map(index => itemsBought[index]) : [];
      });
  }

  getActiveItemsBought(user: UserModel): firebase.Promise<Array<ItemModel>> {
    return this.refItemsBought.child(user.uid).once('value')
      .then(data => {
        let itemsBought = data.val();
        let itemsBoughtActivated = itemsBought? Object.keys(itemsBought)
          .map(itemBoughtId => itemsBought[itemBoughtId])
          .filter(itemBought => itemBought.isActivated): [];

        return Promise.all(itemsBoughtActivated.map(itemsBought => {
          return this.refItemsList.child(itemsBought.itemId).once('value')
            .then(data => data.val());
        }));
      });
  }

  activate(itemToActivate: ItemBoughtModel, itemsBought: Array<ItemBoughtModel>, items: Array<ItemModel>) {
    let activationDate = itemToActivate.activationDate ? itemToActivate.activationDate : new Date().getTime();
    itemToActivate.isActivated = true;
    itemToActivate.activationDate = activationDate;
    let updates = {};
    updates[itemToActivate.id] = itemToActivate;
    itemsBought
      .filter(itemBought => this.getItemCategory(itemBought, items) === this.getItemCategory(itemToActivate, items))
      .filter(itemBought => itemBought.id !== itemToActivate.id)
      .map(itemBought => {
        itemBought.isActivated = false;
        updates[itemBought.id] = itemBought;
      });

    return this.refItemsBought.child(itemToActivate.userUid)
      .update(updates);
  }

  private getItemCategory(itemToActivate: ItemBoughtModel, items: Array<ItemModel>): string {
    return items.filter(item => itemToActivate.itemId === item.id)[0].category;
  }

}
