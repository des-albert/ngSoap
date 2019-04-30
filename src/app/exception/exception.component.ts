import {Component, Injectable, OnInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';


interface Task {
  Id: string;
  Exception_Agile_ECO_MCO__c: string;
  ECO_MCO_status: string;
  Status: string;
  Subject: string;
  WhatId: string;
  ExceptionId: string;
  ExceptionNumber: string;
  Name: string;
  CustomCodes: string;
  OpportunityName: string;

}

@Component({
  selector: 'app-exception',
  templateUrl: './exception.component.html',
  styleUrls: ['./exception.component.css']
})

@Injectable()
export class ExceptionComponent implements OnInit {

  constructor(private httpClient: HttpClient) {
  }

  tasks: Task[];

  currentSort = 'name';
  currentSortDir = 'asc';

  ngOnInit() {

    // Populate Tasks

    let uri = '/task';
    if (!environment.production) {
      uri = 'http://localhost:4000/task';
    }
    this.httpClient.get(uri, {withCredentials: true})
      .subscribe(() => {

          // Populate Exceptions

        uri = '/exception';
        if (!environment.production) {
          uri = 'http://localhost:4000/exception';
        }
        this.httpClient.get(uri, {withCredentials: true})
          .subscribe(() => {

            // Populate Opportunities

            uri = '/opportunity';
            if (!environment.production) {
              uri = 'http://localhost:4000/opportunity';
            }
            this.httpClient.get(uri, {withCredentials: true})
              .subscribe(() => {

                  // Retrieve Agile Change Status

                uri = '/agile';
                if (!environment.production) {
                  uri = 'http://localhost:4000/agile';
                }
                this.httpClient.get(uri, {withCredentials: true})
                  .subscribe(() => {

                  // Summary

                  uri = '/summary';
                  if (!environment.production) {
                    uri = 'http://localhost:4000/summary';
                  }
                  this.httpClient.get(uri, {withCredentials: true})
                    .subscribe(data => {
                      this.tasks = data as Task[];
                      },
                      () => {
                        console.log('get summary error');
                      });
                  },
                  () => {
                    console.log('agile status error');
                  });

                },
                () => {
                  console.log('get opportunity error');
                });
            },
            () => {
              console.log('get exception error');
            });

      },
        error => {
          console.log('get task error', error);
        });
  }

  //  Update task Status to completed

  taskComplete(taskId) {
    let uri = `/task/update/${taskId}`;
    if (!environment.production) {
      uri = `http://localhost:4000/task/update/${taskId}`;
    }
    this.httpClient.post(uri, taskId, {withCredentials: true})
      .subscribe(() => {

        },
        error => {
          console.log('update task error', error);
        });
  }

  sortedTasks() {
    return this.tasks.slice().sort((a, b) => {
      let modifier = 1;
      if (this.currentSortDir === 'desc') {
        modifier = -1;
      }
      if (a[this.currentSort] < b[this.currentSort]) {
        return -1 * modifier;
      }
      if (a[this.currentSort] > b[this.currentSort]) {
        return 1 * modifier;
      }
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
