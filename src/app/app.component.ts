import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'ngSoap';


  ngOnInit() {
    localStorage.setItem('sfdcName', '');
  }

  getItem(key) {
    return localStorage.getItem(key);

  }
}
