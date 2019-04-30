import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { LoginComponent } from './users/login/login.component';
import { ExceptionComponent } from './exception/exception.component';
import { OpportunityComponent } from './opportunity/opportunity.component';
import { AboutComponent } from './about/about.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'about', component: AboutComponent },
  { path: 'exceptions', component: ExceptionComponent },
  { path: 'opportunities', component: OpportunityComponent }

];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ExceptionComponent,
    OpportunityComponent,
    AboutComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [ ],
  bootstrap: [AppComponent]
})
export class AppModule { }
