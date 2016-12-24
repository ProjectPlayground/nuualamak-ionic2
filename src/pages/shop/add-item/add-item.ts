import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ItemModel } from '../item/item.model';

@Component({
  selector: 'page-add-item',
  templateUrl: 'add-item.html'
})
export class AddItemPage implements OnInit {

  addItemForm: FormGroup;
  itemToAdd: ItemModel;

  constructor(private viewCtrl: ViewController, private formBuilder: FormBuilder) {

    this.addItemForm = formBuilder.group({
      itemName: ['', Validators.required],
      itemCategory: ['', Validators.required],
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

}
