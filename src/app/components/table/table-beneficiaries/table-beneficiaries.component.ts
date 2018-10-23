import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { TableComponent } from '../table.component';
import { Beneficiaries } from '../../../model/beneficiary';
import { emit } from 'cluster';
import { element } from 'protractor';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-table-beneficiaries',
  templateUrl: './table-beneficiaries.component.html',
  styleUrls: ['./table-beneficiaries.component.scss']
})
export class TableBeneficiariesComponent extends TableComponent {

    @Output() updating = new EventEmitter<number>();
    @Output() selected = new EventEmitter<number[]>();
    @Output() pageNumberAndSize = new EventEmitter<any>();

    selectedList;

    ngOnInit() {
        super.checkData();
        this.sendSortedData();
    }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => {
          this.paginator.pageIndex = 0;
          if (this.sort.direction != '')
            this.data.loadHouseholds(
                [],
                {
                    sort: this.sort.active,
                    direction: this.sort.direction
                },
                this.paginator.pageIndex,
                this.paginator.pageSize,
            );
        });
        this.paginator.page
            .pipe(
                tap(() => this.loadHouseholdsPage())
            )
            .subscribe();
    }

    loadHouseholdsPage() {
        this.data.loadHouseholds(
            [],
            {
              sort: this.sort.active,
              direction: this.sort.direction
            },
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    getImageName(t2: String) {
        return( t2.substring(25).split('.')[0] );
    }

    update(selectedBeneficiary: Beneficiaries) {

        this.updating.emit(selectedBeneficiary.id);
    }

    sendSelectedBeneficiaries(benefId: any) {
        this.selectedList.push(benefId);
        //
    }

    sendSortedData() {
        this.selectedList = new Array();

        if(this.data && this.data.filteredData) {
            this.data.filteredData.forEach(
                element => {
                    this.selectedList.push(element.id);
                }
            )
        }

        this.selected.emit(this.selectedList);
    }

    pageOnChange(event) {
        this.pageNumberAndSize.emit({pageSize: event.pageSize, pageIndex: event.pageIndex});
    }
}
