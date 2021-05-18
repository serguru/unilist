import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'dialog-company',
    templateUrl: 'dialog.component.html'
  })
  export class DialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: string) {
    }
  }
  