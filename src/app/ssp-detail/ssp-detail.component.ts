import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Ssp }         from '../ssp';
import { SSPService }  from '../ssp.service';

@Component({
  selector: 'app-ssp-detail',
  templateUrl: './ssp-detail.component.html',
  styleUrls: [ './ssp-detail.component.css' ]
})
export class SSPDetailComponent implements OnInit {
  @Input() ssp: Ssp;

  constructor(
    private route: ActivatedRoute,
    private heroService: SSPService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getSSP();
  }

  getSSP(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.heroService.getSSP(id)
      .subscribe(ssp => this.ssp = ssp);
  }

  goBack(): void {
    this.location.back();
  }

 save(): void {
    this.heroService.updateSSP(this.ssp)
      .subscribe(() => this.goBack());
  }
}
