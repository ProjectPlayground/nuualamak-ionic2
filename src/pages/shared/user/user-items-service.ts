import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from './user.model';
import { ItemBoughtModel } from '../../shop/item/item-bought.model';

@Injectable()
export class UserItemsService {

  private refItemsList: firebase.database.Reference;
  private refItemsBought: firebase.database.Reference;

  constructor() {
    this.refItemsList = firebase.database().ref('itemsList');
    this.refItemsBought = firebase.database().ref('itemsBought');
  }

  //TODO to be tested
  updateItemsBoughtExpiration(user: UserModel) {
    return this.refItemsList.once('value')
      .then((itemsRaw) => {
        let items: (Array<ItemBoughtModel>) = itemsRaw.val() ? itemsRaw.val() : [];
        return this.refItemsBought.child(user.uid).once('value')
          .then(itemsBoughtData => {
            let itemsBoughtRaw = itemsBoughtData.val();
            let itemsBought: (Array<ItemBoughtModel>) = itemsBoughtRaw ?
              Object.keys(itemsBoughtRaw).map(index => itemsBoughtRaw[index]) : [];

            let itemsExpired = {};
            itemsBought.map((itemBought: ItemBoughtModel) => {
              let dateEnd = new Date(itemBought.activationDate);
              if (!items[itemBought.itemId]) {
                alert('ERROR updating some items in database, please contact admin !');
              } else {
                dateEnd.setDate(dateEnd.getDate() + items[itemBought.itemId].daysToExpire);
                if (new Date().getTime() > dateEnd.getTime()) {
                  itemsExpired[itemBought.id] = null;
                }
              }
            });

            return this.refItemsBought.child(user.uid).update(itemsExpired);
          });
      });

  }

}
