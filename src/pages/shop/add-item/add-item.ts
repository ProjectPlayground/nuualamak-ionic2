import { Component, OnInit } from '@angular/core';
import { ViewController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ItemModel } from '../item/item.model';
import { ImagePicker, ImagePickerOptions } from 'ionic-native/dist/es5/index';

@Component({
  selector: 'page-add-item',
  templateUrl: 'add-item.html'
})
export class AddItemPage implements OnInit {

  addItemForm: FormGroup;
  itemToAdd: ItemModel;
  private backgroundImage;

  constructor(private viewCtrl: ViewController, private formBuilder: FormBuilder, private toastCtrl: ToastController) {

    this.addItemForm = formBuilder.group({
      itemName: ['', Validators.required],
      itemCategoryData: ['', Validators.required],
      daysToExpire: ['', Validators.required],
      itemPrice: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.itemToAdd = new ItemModel();
    this.itemToAdd.name = '';
    this.itemToAdd.category = '';
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  add() {
    this.viewCtrl.dismiss(this.itemToAdd);
  }

  pickBackgroundImage() {
    ImagePicker.getPictures(<ImagePickerOptions>{
      maximumImagesCount: 1,
      outputType: 0
    }).then((results) => {
      this.backgroundImage = results[0];
    }, (err) => {
      this.showToast('Fail to get picture', 'toastStyleError');
    });
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
