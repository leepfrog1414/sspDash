import { Component, OnInit } from '@angular/core';

import { Ssp } from '../ssp';
import { SSPService } from '../ssp.service';

@Component({
  selector: 'app-sspList',
  templateUrl: './sspList.component.html',
  styleUrls: ['./sspList.component.css']
})
export class SSPListComponent implements OnInit {
  sspList: Ssp[];

  constructor(private heroService: SSPService) { }

  ngOnInit() {
    this.getSSPList();
  }

  getSSPList(): void {
    this.heroService.getSSPList()
    .subscribe(sspList => this.sspList = sspList);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.heroService.addSSP({ name } as Ssp)
      .subscribe(ssp => {
        this.sspList.push(ssp);
      });
  }

  delete(ssp: Ssp): void {
    this.sspList = this.sspList.filter(h => h !== ssp);
    this.heroService.deleteSSP(ssp).subscribe();
  }

}
