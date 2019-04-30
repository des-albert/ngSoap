import {Component, Injectable, OnInit} from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

@Injectable()
export class LoginComponent implements OnInit {
  constructor(private httpClient: HttpClient, private router: Router) {
  }

  sfdcName: string;
  agileName: string;
  password: string;
  token: string;

  ngOnInit() {
  }

  onLogin() {


    const body = {sfdcName: this.sfdcName, agileName: this.agileName, password: this.password, token: this.token};

    let uri = '/signin';
    if ( ! environment.production ) {
      uri = 'http://localhost:4000/signin';
    }
    return this.httpClient.post(uri, body, { withCredentials: true})
      .subscribe( (res) => {
        localStorage.setItem('sfdcName', this.sfdcName);
        this.router.navigateByUrl('/opportunities')
          .then( () => {
            console.log('redirect to opportunities');
          });
      });

  }

}
