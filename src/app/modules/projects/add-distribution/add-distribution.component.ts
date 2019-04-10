import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';
import { ProjectService } from 'src/app/core/api/project.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/core/utils/date.adapter';
import { GlobalText } from '../../../../texts/global';
import { CriteriaService } from '../../../core/api/criteria.service';
import { DistributionService } from '../../../core/api/distribution.service';
import { LocationService } from '../../../core/api/location.service';
import { Mapper } from '../../../core/utils/mapper.service';
import { Commodity } from '../../../model/commodity.new';
import { Location } from '../../../model/location.new';
import { Criteria } from '../../../model/criteria.new';
import { Distribution } from 'src/app/model/distribution.new';
import { ModalService } from 'src/app/core/utils/modal.service';
import { TableComponent } from 'src/app/components/table/table.component';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-add-distribution',
    templateUrl: './add-distribution.component.html',
    styleUrls: ['./add-distribution.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class AddDistributionComponent implements OnInit, DesactivationGuarded {

    public texts =  GlobalText.TEXTS;
    public language = GlobalText.language;

    public objectInstance: Distribution;
    public objectFields: string[];
    public form: FormGroup;

    public criteriaClass = Criteria;
    public criteriaArray = new Array<Criteria>();
    public commodityClass = Commodity;
    public commodityArray = new Array<Commodity>();
    public criteriaNbBeneficiaries = 0;
    public commodityNb: number[] = [];

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

    public queryParams;
    public load = false;
    public loadingCreation: boolean;
    public projectInfo: any = { startDate: '', endDate: '' };


    @ViewChild('criteriaTable') criteriaTable: TableComponent;
    @ViewChild('commodityTable') commodityTable: TableComponent;

    constructor(
        public mapper: Mapper,
        public dialog: MatDialog,
        private router: Router,
        private criteriaService: CriteriaService,
        private route: ActivatedRoute,
        private _distributionService: DistributionService,
        private _projectService: ProjectService,
        private snackbar: SnackbarService,
        private modalService: ModalService,
        private locationService: LocationService
    ) { }

    ngOnInit() {
        this.loadingCreation = false;
        this.objectInstance = new Distribution();
        this.objectInstance.set('location', new Location());
        this.objectFields = ['adm1', 'adm2', 'adm3', 'adm4', 'date', 'type', 'threshold'];
        this.makeForm();
        this.checkSize();
        this.getQueryParameter();
        this.loadProvince();
        this.getProjectDates();
    }


    makeForm() {
        const formControls = {};
        this.objectFields.forEach((fieldName: string) => {
            formControls[fieldName] = new FormControl(
                this.objectInstance.fields[fieldName] ? this.objectInstance.get(fieldName) : null,
            );
        });
        this.form = new FormGroup(formControls);
    }


    /**
    * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
    */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.objectInstance && !this.loadingCreation) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return (true);
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    /**
     * get the parameter in the route
     * use to get the active project
     */
    getQueryParameter() {
        this.route.queryParams.subscribe(params => this.queryParams = params);
    }

    getProjectDates() {
        this._projectService.get().subscribe(
            (projects) => {
                projects.forEach((project: any) => {
                    if (project.id === this.queryParams.project) {
                        this.projectInfo.startDate = project.start_date;
                        this.projectInfo.endDate = project.end_date;
                        return;
                    }
                });
            }
        );
    }

    getNameProject(id): Observable<string> {
        return this._projectService.get().pipe(
            map(
                result => {
                    const projects = result;
                    let name = '';

                    projects.forEach(element => {
                        if (element.id === id) {
                            name = element.name;
                        }
                    });
                    return name;
                }
            )
        );
    }

    /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        this.locationService.fillAdm1Options(this.objectInstance).subscribe(() => {
            this.form.controls.adm2.setValue(null);
            this.form.controls.adm3.setValue(null);
            this.form.controls.adm4.setValue(null);
        });
    }

    /**
     *  Get adm2 from the back or from the cache service with the id of adm1
     *  @param adm1Id
     */
    loadDistrict(adm1Id) {
        if (adm1Id) {
            this.locationService.fillAdm2Options(this.objectInstance, adm1Id).subscribe(() => {
                this.form.controls.adm2.setValue(null);
                this.form.controls.adm3.setValue(null);
                this.form.controls.adm4.setValue(null);
            });
        }
    }

    /**
     * Get adm3 from the back or from the cahce service with the if of adm2
     * @param adm2Id
     */
    loadCommunity(adm2Id) {
        if (adm2Id) {
            this.locationService.fillAdm3Options(this.objectInstance, adm2Id).subscribe(() => {
                this.form.controls.adm3.setValue(null);
                this.form.controls.adm4.setValue(null);
            });
        }
    }

    /**
     *  Get adm4 from the back or from the cahce service with the id of adm3
     * @param adm3Id
     */
    loadVillage(adm3Id) {
        if (adm3Id) {
            this.locationService.fillAdm4Options(this.objectInstance, adm3Id).subscribe(() => {
                this.form.controls.adm4.setValue(null);
            });
        }
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        const dialogRef = null;

        if (user_action === 'addCriteria') {
            this.modalService.openAddCriteriaDialog().then((criteria: Criteria) => {
                this.createElement(criteria, 'addCriteria');
            }, error => {});
        } else if (user_action === 'addCommodity') {
            this.modalService.openAddCommodityDialog().then((commodity: Commodity) => {
                this.createElement(commodity, 'addCommodity');
            }, error => {});
        }
    }

    /**
     * add row in selection criteria table and distributed commodity table
     * @param createElement
     * @param user_action
     */
    createElement(createElement: any, user_action: string) {
        if (user_action === 'addCriteria') {
            this.load = true;
            this.criteriaArray.push(createElement);
            this.updateNbBeneficiary();
            this.criteriaTable.updateTable(this.criteriaArray);
        } else if (user_action === 'addCommodity') {
            this.commodityArray.push(createElement);
            this.commodityNb = [];
            this.commodityArray.forEach(commodity => {
                this.commodityNb.push(commodity.get<number>('value') * this.criteriaNbBeneficiaries);
            });
            this.commodityTable.updateTable(this.commodityArray);
        }
    }

    /**
     * delete row in selection criteria table and distributed commodity table
     * @param removeElement
     * @param user_action
     */
    removeElement(details, type: string) {

        if (details.action === 'delete') {
            if (type === 'criteria') {
                const index = this.criteriaArray.findIndex(criterion => {
                    return criterion === details.element;
                });
                if (index > -1) {
                    this.criteriaArray.splice(index, 1);
                }

                // To remove the matSort if the array is empty
                if (this.criteriaArray.length === 0) {
                    this.criteriaArray = [];
                }

                this.updateNbBeneficiary();

                this.criteriaTable.updateTable(this.criteriaArray);
            } else if (type === 'commodity') {
                const index = this.commodityArray.findIndex((commodity) => {
                    return commodity === details.element;
                });
                if (index > -1) {
                    this.commodityArray.splice(index, 1);
                    this.commodityNb.splice(index, 1);
                }

                // To remove the matSort if the array is empty
                if (this.commodityArray.length === 0) {
                    this.commodityArray = [];
                }
                this.commodityTable.updateTable(this.commodityArray);
            }

        }
    }

    /**
     * create the new distribution object before send it to the back
     */
    add() {
        if (this.form.controls.type.value && this.criteriaArray && this.criteriaArray.length !== 0 &&
          this.commodityArray && this.commodityArray.length !== 0 && this.form.controls.date.value &&
          this.form.controls.threshold.value > 0 && this.form.controls.adm1) {

            if (new Date(this.form.controls.date.value) < new Date(this.projectInfo.startDate) ||
            new Date(this.form.controls.date.value) > new Date(this.projectInfo.endDate)) {
                this.snackbar.error(this.texts.add_distribution_date_inside_project);
                return;
            } else {
                const distributionModality = this.commodityArray[0].get('modality');
                for (const commodity of this.commodityArray) {
                    if (commodity.get<number>('value') <= 0) {
                        this.snackbar.error(this.texts.add_distribution_zero);
                        return;
                    } else if (commodity.get('modality') !== distributionModality) {
                        this.snackbar.error(this.texts.add_distribution_multiple_modalities);
                        return;
                    }
                }

                this.loadingCreation = true;
                const newDistribution = new Distribution();

                const location = new Location();

                ['adm1', 'adm2', 'adm3', 'adm4'].forEach(adm => {
                    if (this.form.controls[adm].value) {
                        location.set(adm,
                            this.objectInstance.get('location').getOptions(adm).filter(option => {
                                return option.get('id') === this.form.controls[adm].value;
                            })[0]);
                    }
                });

                let admName;
                if (this.form.controls.adm4.value) {
                    admName = location.get('adm4').get('name');
                } else if (this.form.controls.adm3.value) {
                    admName = location.get('adm3').get('name');
                } else if (this.form.controls.adm2.value) {
                    admName = location.get('adm2').get('name');
                } else {
                    admName = location.get('adm1').get('name');
                }

                newDistribution.set('location', location);

                const datePipe = new DatePipe('en-US');
                newDistribution.set('name', admName + '-' + datePipe.transform(this.form.controls.date.value, 'yyyy-MM-dd'));

                newDistribution.set('type', this.form.controls.type.value);
                newDistribution.set('threshold', this.form.controls.threshold.value);
                newDistribution.set('projectId', this.queryParams.project);
                newDistribution.set('selectionCriteria', this.criteriaArray);
                newDistribution.set('commodities', this.commodityArray);
                newDistribution.set('date', this.form.controls.date.value);

                this._distributionService.create(newDistribution.modelToApi()).subscribe((response) => {
                    this.snackbar.success(
                        this.texts.distribution + ' : ' + response.distribution.name + this.texts.add_distribution_created);
                    this.router.navigate(['projects/distributions/' + response.distribution.id]);

                }, err => {
                    this.snackbar.error(this.texts.add_distribution_error_creating);
                    this.loadingCreation = false;
                });
            }
        } else if (this.criteriaArray.length === 0) {
            this.snackbar.error(this.texts.add_distribution_missing_selection_criteria);

        } else if (!this.commodityArray[0]) {
            this.snackbar.error(this.texts.add_distribution_missing_commodity);
        } else if (!this.form.controls.date.value) {
            this.snackbar.error(this.texts.add_distribution_missing_date);
        } else if (this.form.controls.threshold.value <= 0) {
            this.snackbar.error(this.texts.add_distribution_missing_threshold);
        } else if (!this.form.controls.adm1) {
            this.snackbar.error(this.texts.add_distribution_missing_location);
        } else {
            this.snackbar.error(this.texts.add_distribution_check_fields);
        }

    }

    /**
     * to cancel the creation of distribution and go back in the distribution page
     */
    cancel() {
        this.router.navigate(['projects']);
    }

    updateNbBeneficiary() {
        if (this.criteriaArray.length !== 0) {
            this.load = true;
            this.criteriaService.getBeneficiariesNumber(
                this.form.controls.type.value,
                this.criteriaArray,
                this.form.controls.threshold.value,
                this.queryParams.project
            ).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                if (this.commodityArray.length > 0) {
                    this.commodityNb = [];
                    this.commodityArray.forEach(commodity => {
                        this.commodityNb.push(commodity.get<number>('value') * this.criteriaNbBeneficiaries);
                    });
                }
                this.load = false;

            }, error => this.load = false);
        }
    }
}
