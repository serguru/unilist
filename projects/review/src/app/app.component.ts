import { Component, OnInit } from '@angular/core';
import * as fs from 'fs-extra';
import * as ss from 'string-similarity';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
  ) {
  }

  companies: string[] = [];
  path: string = 'companies.json';
  selected: string;
  newCompany: string;
  similarityLimit: number = 0.8;
  errorMessage: string;

  ngOnInit(): void {
    this.read();
  } 

  read() {
    const raw: string[] = fs.readJSONSync(this.path);
    if (!raw || raw.length == 0) {
      this.companies = [];
      this.selected = undefined;
      return;
    }
    this.companies = raw.sort((a,b)=> {
      const x = a ? a.toLowerCase() : '';
      const y = b ? b.toLowerCase() : '';
      return x > y ? 1 : -1;
    });
    this.selected = this.companies[0];
  }

  companyExists(): string {
    if (!this.companies) {
      return undefined;
    }

    for (let i: number = 0; i < this.companies.length; i++) {
      const s: string = this.companies[i];
      const similarity: number = ss.compareTwoStrings(this.newCompany, s);
      if (similarity >= this.similarityLimit) {
        return s;
      }
    }

    return undefined;
  }

  add() {
    if (!this.newCompany) {
      return; 
    }

    const s: string = this.companyExists();

    if (!s) {
      this.companies.unshift(this.newCompany);
      this.save();
      this.selected = this.companies[0];
      return;
    }

    this.errorMessage = `Company ${this.newCompany} is similar to the existing ${s}`;
  }

  remove(company?: string) {
    const index: number = this.companies.indexOf(company ?? this.selected);
    this.companies.splice(index, 1);
    this.save();
    this.selected = this.companies.length > 0 ? this.companies[0] : undefined;
    
  }

  save() { 
    const s: string = JSON.stringify(this.companies);
    fs.writeFileSync(this.path, s);
  }

  select(company: string) {
    this.selected = company;
  }

  hideError() {
    this.errorMessage = undefined;
  }

  getClass(company: string) {
    return {
      'selected': this.selected == company
    }
  }

}
