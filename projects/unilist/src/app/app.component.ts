import { Component, OnInit } from '@angular/core';
import * as fs from 'fs-extra';
import * as ss from 'string-similarity';

@Component({
  selector: 'app-root',
  styleUrls: ['app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
  ) {
  }

  companies: string[] = [];
  newCompanies: string[] = [];
  path: string = 'companies.json';

  selectedIndex: number = -1;

  get selected(): string {
    if (!this.companies || this.companies.length == 0 || this.selectedIndex < 0 || this.selectedIndex >= this.companies.length) {
      return undefined;
    }
    return this.companies[this.selectedIndex];
  }

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

  isNew(index: number): boolean {
    return index >= 0 && index < this.newCompanies.length;
  }

  read() {
    this.newCompanies = [];
    this.selectedIndex = -1;

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
    this.selectedIndex = this.companies.length > 0 ? 0 : -1;
  }

  companyExists(): string {
    if (!this.companies) {
      return undefined;
    }

    const v: string = this.newCompany.toLowerCase();

    for (let i: number = 0; i < this.companies.length; i++) {
      const s: string = this.companies[i].toLowerCase();
      if (s == v) {
        return this.companies[i];
      }
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

  add(value?: string): void {
    if (!value) {
      value = this.newCompany || "";
    }

    if (value) {
      value = value.trim();
    }

    if (!value || value.length == 0) {
      this.errorMessage = "No add for empty value";

      setTimeout(() => {
        this.errorMessage = undefined;
      }, 10000);

      return;
    }
    this.errorMessage = undefined;
    this.companies.unshift(value);
    this.newCompanies.unshift(value);
    this.selectedIndex = 0;
    this.save();
  }

  checkAdd() {
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
      this.add(nc);
      return;
    }

    this.errorMessage = nc == s ? `The company ${nc} already exists` : `The company ${nc} is similar to ${s}`;

    setTimeout(() => {
      this.errorMessage = undefined;
    }, 10000);
  }

  remove(index?: number) {
    
    if (index == undefined) {
      index = this.selectedIndex;
    }

    index = index >= 0 && index < this.companies.length ? index : -1;

    if (index == -1) {
      return;
    }

    let company: string = this.companies[index];

    this.companies.splice(index, 1);

    index = this.newCompanies.indexOf(company);
    this.newCompanies.splice(index, 1);

    this.selectedIndex = this.companies.length > 0 ? 0 : -1;

    this.save();
  }

  save() {
    const s: string = JSON.stringify(this.companies);
    fs.writeFileSync(this.path, s);
  }

  select(index: number) {
    this.selectedIndex = index >=0 && index < this.companies.length ? index : -1;
  }

  hideError() {
    this.errorMessage = undefined;
  }

  getClass(index: number) {
    return {
      'selected': this.selectedIndex == index,
      'new-company': this.isNew(index)
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
    this.checkAdd();
  }

  allowDrop(e) {
    e.preventDefault();
  }
}
