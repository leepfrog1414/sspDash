import { Component, OnInit } from '@angular/core';
import { Ssp } from '../ssp';
import { SSPService } from '../ssp.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  sspList: Ssp[] = [];

  constructor(private heroService: SSPService) { }

  ngOnInit() {
    this.getSSPList();
  }

  getSSPList(): void {
    this.heroService.getSSPList()
      .subscribe(sspList => this.sspList = sspList.slice(1, 5));
  }
}
