import { Component } from '@angular/core';
import * as fs from 'fs-extra';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
  ) {
  }

  read() {
//    let a = fs.readFileSync('main.js');
    let a = fs.readJSONSync('data.json');
  }

}
