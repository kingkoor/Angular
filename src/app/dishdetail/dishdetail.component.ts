import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {Dish } from '../shared/dish';
import { DishService} from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Comment} from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm : FormGroup;
  comment : Comment;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Author name is required.',
      'minlength': ' Author name must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Comment is required.'
    }
  };

  constructor(private dishService: DishService, private location: Location, private route: ActivatedRoute, private fb: FormBuilder) {
    this.createForm();
   }

  createForm() {
    this.commentForm = this.fb.group({
      'author': ['', Validators.required],
      'rating': 0,
      'comment': ''
    });
  }
  ngOnInit() {
    this.dishService.getDishIds()
    .subscribe(dishIds => this.dishIds = dishIds);

    this.route.params
    .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
    .subscribe(dish => {this.dish = dish; this.setPrevNext(dish.id); });
  }

  setPrevNext( dishId: string){
     const index = this.dishIds.indexOf(dishId);
     this.prev = this.dishIds[(this.dishIds.length + index-1) % this.dishIds.length];
     this.next = this.dishIds[(this.dishIds.length + index+1) % this.dishIds.length]
  }
  goBack(): void {
    this.location.back();
  }
  onSubmit()
  {
    this.comment = this.commentForm.value;
    console.log(this.comment);
  }
}
