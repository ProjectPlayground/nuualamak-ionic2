import { Component } from '@angular/core';
import { LoadingController, ToastController, ModalController } from 'ionic-angular';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';
import { ItemModel } from './item/item.model';
import { ItemBoughtModel } from './item/item-bought.model';
import { ItemService } from './item/item.service';
import { AddItemPage } from './add-item/add-item';

@Component({
  selector   : 'page-shop',
  templateUrl: 'shop.html'
})
export class ShopPage {

  firstLoad = true;
  currentUser: UserModel;
  items: Array<ItemModel>;
  itemsBought: Array<ItemBoughtModel>;

  constructor(private userService: UserService, private itemService: ItemService,
              private toastCtrl: ToastController, private loadingCtrl: LoadingController,
              private modalCtrl: ModalController) {

    this.itemsBought = new Array<ItemBoughtModel>();
  }

  ionViewWillEnter() {
    this.firstLoad = true;
    let loading = this.loadingCtrl.create({
      content     : 'Loading',
      spinner     : 'crescent',
      showBackdrop: false
    });
    loading.present();
    this.getItems(loading);
    this.userService.getCurrent()
      .then(user => {
        this.currentUser = user;
        this.getItemsBought();
      });
  }

  addItem() {
    let chgPasswor = this.modalCtrl.create(AddItemPage);
    chgPasswor.onDidDismiss((newItem: ItemModel) => {
      if (newItem) {
        let loading = this.loadingCtrl.create({
          content     : 'Loading',
          spinner     : 'crescent',
          showBackdrop: false
        });
        loading.present();
        this.itemService.add(newItem)
          .then(() => this.getItems(loading))
          .catch(err => {
            loading.dismissAll();
            this.showToast('Fail to add item', 'toastStyleError');
          });
      }
    });
    chgPasswor.present();
  }

  buyItem(item: ItemModel) {
    if (this.currentUser.nuuBits >= item.price) {
      let loading = this.loadingCtrl.create({
        content     : 'Loading',
        spinner     : 'crescent',
        showBackdrop: false
      });
      loading.present();
      this.itemService.buy(this.currentUser, item)
        .then(() => {
          this.getItemsBought();
          loading.dismissAll();
          this.showToast('Item bought with success', 'toastStyle');
        })
        .catch(err => {
          loading.dismissAll();
          this.showToast('We\'re sorry, Fail to buy the item', 'toastStyleError');
        });
    } else {
      this.showToast('Not enough Nuu-bits to buy this item', 'toastStyleError');
    }
  }

  activateItem(item: ItemModel) {
    let loading = this.loadingCtrl.create({
      content     : 'Loading',
      spinner     : 'crescent',
      showBackdrop: false
    });
    loading.present();
    this.itemService.activate(this.getItemBoughtInfo(item)[0])
      .then(() => {
        loading.dismissAll();
        this.showToast('The selected item is now activated', 'toastStyle');
      })
      .catch(err => {
        loading.dismissAll();
        this.showToast('We\'re sorry, Fail to activate the item', 'toastStyleError');
      });
  }

  isItemBought(item: ItemModel) {
    return this.getItemBoughtInfo(item).length === 1;
  }

  private getItemsBought() {
    this.itemService.getItemsBought(this.currentUser, false)
      .then(itemsBought => this.itemsBought = itemsBought);
  }

  private getItems(loading) {
    this.itemService.getAll()
      .then(items => {
        this.items = items;
        loading.dismissAll();
        this.firstLoad = false;
      })
      .catch(err => {
        loading.dismissAll();
        this.firstLoad = false;
        this.showToast('Fail loading items', 'toastStyleError');
      });
  }

  private getItemBoughtInfo(item: ItemModel) {
    return this.itemsBought.filter(itemBought => itemBought.itemId === item.id);
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message : msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
