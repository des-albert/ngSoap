import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface Opportunity {
  Name: string;
  TaskStatus: string;
  TaskDueDate: string;
  Qualified_Quote__c: string;
  Primary_Quote_Status__c: string;
}

@Component({
  selector: 'app-opportunity',
  templateUrl: './opportunity.component.html',
  styleUrls: ['./opportunity.component.css']
})
export class OpportunityComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  opportunities: Opportunity[];

  currentSort = 'name';
  currentSortDir = 'asc';

  ngOnInit() {

    // Populate sopsOpps

    let uri = '/sopsTasks';
    if (!environment.production) {
      uri = 'http://localhost:4000/sopsTasks'; }

    this.httpClient.get(uri, {withCredentials: true})
      .subscribe(() => {

          uri = '/sopsOpps';
          if (!environment.production) {
            uri = 'http://localhost:4000/sopsOpps'; }

          this.httpClient.get(uri, {withCredentials: true})
            .subscribe(() => {

              uri = '/sops';
              if (!environment.production) {
                uri = 'http://localhost:4000/sops'; }

              this.httpClient.get(uri, {withCredentials: true})
                  .subscribe(data => {
                    this.opportunities = data as Opportunity[];

                  }, error => {
                    console.log('get summary error', error);

                  });

          },
          error => {
            console.log('get sopsOpps error', error);
          });

      },
          error => {
        console.log('get sopsTasks error', error);
      });

        // Populate sopsOpps
}

  sortedOpps() {
    return this.opportunities.slice().sort((a, b) => {
      let modifier = 1;
      if (this.currentSortDir === 'desc') { modifier = -1; }
      if (a[this.currentSort] < b[this.currentSort]) { return -1 * modifier; }
      if (a[this.currentSort] > b[this.currentSort]) { return 1 * modifier; }
      return 0;
    });
  }
  sort(s) {
    if (s === this.currentSort) {
      this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
    }
    this.currentSort = s;
  }
}
