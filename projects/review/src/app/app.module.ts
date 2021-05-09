import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { PrpLibraryModule } from 'projects/prp-library/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    PrpLibraryModule
  ],
  providers: [

  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
