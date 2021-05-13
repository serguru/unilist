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
  newCompanies: string[] = [];
  path: string = 'companies.json';
  selected: string;
  _newCompany: string;
  similarityLimit: number = 0.6;
  errorMessage: string;

  ngOnInit(): void {
    this.read();
  }

  get newCompany(): string {
    return this._newCompany;
  }

  set newCompany(value: string) {
    if (value) {
      value = value.trim();
    }
    if (this.newCompany == value) {
      return;
    }
    this._newCompany = value;
  }

  get newCount(): number {
    return this.newCompanies.length;
  }

  isNew(company: string): boolean {
    return this.newCompanies.includes(company);
  }

  read() {
    this.newCompanies = [];
    this.selected = undefined;

    const raw: string[] = fs.readJSONSync(this.path);
    if (!raw || raw.length == 0) {
      this.companies = [];
      return;
    }

    raw.forEach(x => {
      if (!x) {
        return;
      }
      x = x.trim();

      if (x.length == 0) {
        return;
      }
      this.companies.push(x);
    })

    this.companies = this.companies.sort((a, b) => {
      const x = a ? a.toLowerCase() : '';
      const y = b ? b.toLowerCase() : '';
      return x > y ? 1 : -1;
    });
    this.selected = this.companies.length > 0 ? this.companies[0] : undefined;
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

    this.errorMessage = undefined;

    const s: string = this.companyExists();
    let nc = this.newCompany || '';
    this.newCompany = undefined;

    nc = nc.trim();
    if (nc.length == 0) {
      return;
    }

    if (!s) {
      this.companies.unshift(nc);
      this.newCompanies.unshift(nc);
      this.selected = nc;
      this.save();
      return;
    }

    this.errorMessage = nc == s ? `A company ${nc} is already exist`: `Company ${nc} is similar to the existing ${s}`;

    setTimeout(() => {
      this.errorMessage = undefined;
    }, 10000)
  }


  remove(company?: string) {
    let index: number = this.companies.indexOf(company ?? this.selected);
    this.companies.splice(index, 1);

    index = this.newCompanies.indexOf(company ?? this.selected);
    this.newCompanies.splice(index, 1);

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
      'selected': this.selected == company,
      'new-company': this.isNew(company)
    }
  }

  get count(): string {
    if (!this.companies) {
      return '';
    }
    return `${this.companies.length}`;
  }

  drop(e: DragEvent) {
    e.preventDefault();
    const value: string = e.dataTransfer.getData('text/plain');
    if (!value) {
      return;
    }

    this.newCompany = value;

    this.add();
  }

}
