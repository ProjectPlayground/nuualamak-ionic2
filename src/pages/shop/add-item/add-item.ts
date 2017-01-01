import { Component, OnInit } from '@angular/core';
import { ViewController, ToastController } from 'ionic-angular';
import { ImagePicker, ImagePickerOptions } from 'ionic-native/dist/es5/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemModel } from '../item/item.model';
import { ValidationMessageService } from '../../shared/validation-message.service';

@Component({
  selector: 'page-add-item',
  templateUrl: 'add-item.html'
})
export class AddItemPage implements OnInit {

  addItemForm: FormGroup;
  itemToAdd: ItemModel;
  backgroundImage: string;
  isBackgroundLoading = false;
  formErrors = {
    itemName: '',
    itemCategory: '',
    itemFontName: '',
    itemFontColor: '',
    itemDaysToExpire: '',
    itemPrice: ''
  };

  constructor(private  messageService: ValidationMessageService, private viewCtrl: ViewController,
              private formBuilder: FormBuilder, private toastCtrl: ToastController) {

    this.addItemForm = formBuilder.group({
      itemName: ['', Validators.required],
      itemCategory: ['', Validators.required],
      takeAllPlace: [''],
      itemFontName: ['', Validators.required],
      itemFontColor: ['', Validators.required],
      itemDaysToExpire: ['', Validators.pattern('^[0-9]+.?[0-9]*$')],
      itemPrice: ['', Validators.pattern('^[0-9]+.?[0-9]*$')]
    });
  }

  ngOnInit() {
    this.itemToAdd = new ItemModel();
    this.addItemForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.addItemForm, this.formErrors));
    this.messageService.onValueChanged(this.addItemForm, this.formErrors);
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  add() {
    this.itemToAdd.name = this.addItemForm.value.itemName;
    this.itemToAdd.category = this.addItemForm.value.itemCategory;
    this.itemToAdd.daysToExpire = this.addItemForm.value.itemDaysToExpire;
    this.itemToAdd.price = this.addItemForm.value.itemPrice;
    switch (this.itemToAdd.category) {
      case 'theme':
        this.itemToAdd.backgroundImage = this.backgroundImage;
        this.itemToAdd.takeAllPlace = this.addItemForm.value.takeAllPlace;
        break;
      case 'font':
        this.itemToAdd.fontName = this.addItemForm.value.itemFontName;
        break;
      case 'fontColor':
        this.itemToAdd.fontColor = this.addItemForm.value.itemFontColor;
        break;
      case 'emoticon':
        //TODO change emojis list
        break;
      case 'bold':
        // no value needed
        break;
    }
    this.viewCtrl.dismiss(this.itemToAdd);
  }

  areInputsValid(): boolean {
    if (this.addItemForm.controls['itemCategory'].valid) {
      let isOk: boolean;
      switch (this.addItemForm.value.itemCategory) {
        case 'theme':
          isOk = Boolean(this.backgroundImage);
          break;
        case 'font':
          isOk = this.addItemForm.controls['itemFontName'].valid;
          break;
        case 'fontColor':
          isOk = this.addItemForm.controls['itemFontColor'].valid;
          break;
        case 'emoticon':
          //TODO change emojis list
          isOk = true;
          break;
        case 'bold':
          // no value needed
          isOk = true;
        default:
          isOk = true;
      }
      return isOk && this.addItemForm.controls['itemName'].valid
        && this.addItemForm.controls['itemDaysToExpire'].valid
        && this.addItemForm.controls['itemPrice'].valid;
    } else {
      return false;
    }
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
