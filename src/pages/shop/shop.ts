import { Component } from '@angular/core';
import { LoadingController, ToastController, ModalController, LoadingOptions, AlertController } from 'ionic-angular';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';
import { ItemModel } from './item/item.model';
import { ItemBoughtModel } from './item/item-bought.model';
import { ItemService } from './item/item.service';
import { AddItemPage } from './add-item/add-item';

@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html'
})
export class ShopPage {

  firstLoad = true;
  currentUser: UserModel;
  items: Array<ItemModel>;
  itemsBought: Array<ItemBoughtModel>;

  private loadingOptions: LoadingOptions = {
    content: 'Loading',
    spinner: 'crescent',
    showBackdrop: false
  };

  constructor(private userService: UserService, private itemService: ItemService,
              private toastCtrl: ToastController, private loadingCtrl: LoadingController,
              private modalCtrl: ModalController, private alertCtrl: AlertController) {

    this.itemsBought = new Array<ItemBoughtModel>();
  }

  ionViewWillEnter() {
    this.firstLoad = true;
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.getItems(loading);
    this.userService.getCurrent()
      .then(user => {
        this.currentUser = user;
        this.getItemsBought();
      });
  }

  addItem() {
    let addItemPage = this.modalCtrl.create(AddItemPage);
    addItemPage.onDidDismiss((newItem: ItemModel) => {
      if (newItem) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.itemService.add(newItem)
          .then(() => this.getItems(loading))
          .catch(err => {
            loading.dismissAll();
            console.error(err);
            this.showToast('Fail to add item', 'toastStyleError');
          });
      }
    });
    addItemPage.present();
  }

  buyItem(item: ItemModel) {
    if (this.currentUser.nuuBits >= item.price) {
      this.alertCtrl.create({
        title: 'Confirmation of purchase',
        message: 'Are you sure to buy this item ?',
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'OK',
            handler: () => {
              let loading = this.loadingCtrl.create(this.loadingOptions);
              loading.present();
              this.itemService.buy(this.currentUser, item)
                .then(() => {
                  this.getItemsBought();
                  loading.dismissAll();
                  this.showToast('Item bought with success', 'toastStyle');
                })
                .catch(err => {
                  loading.dismissAll();
                  console.error(err);
                  this.showToast('We\'re sorry, Fail to buy the item', 'toastStyleError');
                });
            }
          }
        ]
      }).present();
    } else {
      this.showToast('Not enough Nuu-bits to buy this item', 'toastStyleError');
    }
  }

  activateItem(item: ItemModel) {
    this.alertCtrl.create({
      title: 'Activation confirmation',
      message: 'Are you sure to activate this item ?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'OK',
          handler: () => {
            let loading = this.loadingCtrl.create(this.loadingOptions);
            loading.present();
            this.itemService.activate(this.getItemBoughtInfo(item), this.itemsBought, this.items)
              .then(() => {
                this.getItemsBought();
                loading.dismissAll();
                this.showToast('The selected item is now activated', 'toastStyle');
              })
              .catch(err => {
                loading.dismissAll();
                console.error(err);
                this.showToast('We\'re sorry, Fail to activate the item', 'toastStyleError');
              });
          }
        }
      ]
    }).present();
  }

  isItemBought(item: ItemModel): boolean {
    return this.getItemBoughtInfo(item) !== undefined;
  }

  isItemActive(item: ItemModel): boolean {
    if (this.isItemBought(item)) {
      return this.getItemBoughtInfo(item).isActivated;
    }
    return false;
  }

  isItemInactive(item: ItemModel): boolean {
    if (this.isItemBought(item) && !this.isItemActive(item)) {
      return this.getItemBoughtInfo(item).activationDate !== undefined;
    }
    return false;
  }

  getActivationDate(item: ItemModel): string {
    let itemBought = this.getItemBoughtInfo(item);
    if (itemBought && itemBought.activationDate) {
      return itemBought.activationDate.toString();
    } else {
      return '';
    }
  }

  private getItemsBought() {
    this.itemService.getItemsBought(this.currentUser)
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
        console.error(err);
        this.showToast('Fail loading items', 'toastStyleError');
      });
  }

  private getItemBoughtInfo(item: ItemModel): ItemBoughtModel {
    return this.itemsBought.filter(itemBought => itemBought.itemId === item.id)[0];
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
