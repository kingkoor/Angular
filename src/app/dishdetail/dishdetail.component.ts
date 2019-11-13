import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {Dish } from '../shared/dish';
import { DishService} from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Comment} from '../shared/comment';
import { trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
  
})

export class DishdetailComponent implements OnInit {
  @ViewChild('cform') commentFormDirective;
  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm : FormGroup;
  comment : Comment;
  dishcopy: Dish;
  visibility = 'shown';

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

  constructor(private dishService: DishService, private location: Location, 
    private route: ActivatedRoute, private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
    this.createForm();
   }

  createForm() {
    this.commentForm = this.fb.group({
      'author': ['', [Validators.required, Validators.minLength(2)]],
      'rating': 0,
      'comment': ['', Validators.required],
      'date' : new Date()
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    
     this.onValueChanged(); 
  }

  onValueChanged(data?: any) {
    if(!this.commentForm) { return; }
    const form = this.commentForm;
    for(const field in this.formErrors) {
      if(this.formErrors.hasOwnProperty(field)) {
        //clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if(control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for(const key in control.errors) {
            if(control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
  ngOnInit() {
    this.dishService.getDishIds()
    .subscribe(dishIds => this.dishIds = dishIds);

    this.route.params
    .pipe(switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishService.getDish(+params['id']); }))
    .subscribe(dish => {this.dish = dish; this.dishcopy= dish; this.setPrevNext(dish.id); this.visibility= 'shown'; },
    errmess => this.errMess= <any>errmess);
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
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
    .subscribe(dish =>{
      this.dish = dish; this.dishcopy=dish ;
    },
    errmess => {this.dish = null; this.dishcopy=null; this.errMess= <any>errmess;})
    this.commentForm.reset({
      author :'',
      rating: 5,
      comment: '',
      date: ''
    });
    this.commentFormDirective.resetForm();
  }
}
