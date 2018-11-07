import { Component, OnInit, HostListener, DoCheck } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { GlobalText } from '../../../../texts/global';

import { Mapper } from '../../../core/utils/mapper.service';
import { CriteriaService } from '../../../core/api/criteria.service';

import { Commodity } from '../../../model/commodity';
import { Criteria } from '../../../model/criteria';
import { DistributionData } from '../../../model/distribution-data';

import { ModalAddLineComponent } from '../../../components/modals/modal-add/modal-add-line/modal-add-line.component';
import { ModalAddComponent } from '../../../components/modals/modal-add/modal-add.component';
import { FormControl, Validators } from '@angular/forms';
import { LocationService } from '../../../core/api/location.service';
import { Project } from '../../../model/project';
import { DistributionService } from '../../../core/api/distribution.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { Observable } from 'rxjs';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';
import { ProjectService } from 'src/app/core/api/project.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-add-distribution',
    templateUrl: './add-distribution.component.html',
    styleUrls: ['./add-distribution.component.scss']
})
export class AddDistributionComponent implements OnInit, DoCheck, DesactivationGuarded {
    public nameComponent = 'add_project_title';
    public distribution = GlobalText.TEXTS;
    public newObject: any;
    mapperObject = null;
    public properties: any;
    public propertiesTypes: any;
    entity = DistributionData;

    public criteriaClass = Criteria;
    public criteriaAction = 'addCriteria';
    public criteriaArray = [];
    public criteriaData = new MatTableDataSource([]);
    public criteriaNbBeneficiaries: number = 0;
    public load: boolean = false;

    public commodityClass = Commodity;
    public commodityAction = 'addCommodity';
    public commodityArray = [];
    public commodityData = new MatTableDataSource([]);
    public commodityNb: number = 0;
    public saveCommodityNb: number = 0;

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

    public queryParams;
    public controls = new FormControl();
    public controlNumber = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);

    public loadedData: any = [];
    public loadingCreation: boolean;
    public projectInfo: any = { startDate: '', endDate: '' };

    step = '';

    constructor(
        public mapper: Mapper,
        public dialog: MatDialog,
        private router: Router,
        private criteriaService: CriteriaService,
        private route: ActivatedRoute,
        private locationService: LocationService,
        private _distributionService: DistributionService,
        private _projectService: ProjectService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loadingCreation = false;
        this.newObject = Object.create(this.entity.prototype);
        this.newObject.constructor.apply(this.newObject);
        this.mapperObject = this.mapper.findMapperObject(this.entity);
        this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
        this.propertiesTypes = this.newObject.getTypeProperties(this.newObject);
        this.checkSize();
        this.getQueryParameter();
        this.loadProvince();
        this.newObject.type = 'Household';
        this.getProjectDates();
    }

    /**
    * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
    */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.newObject && !this.loadingCreation) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return (true);
        }
    }

    /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        this.locationService.getAdm1().subscribe(response => {
            this.loadedData.adm1 = response;

        });
        this.loadedData.adm2 = [];
        this.loadedData.adm3 = [];
        this.loadedData.adm4 = [];
    }

    selectDate(event) {
        if (event.value) 
            this.newObject.date_distribution = event.value.toLocaleDateString();
        else
            this.snackBar.open('Error while saving the date, check that the format is like mm/dd/yyyy', '', { duration: 3000, horizontalPosition: 'center' });

    }

    /**
     *  Get adm2 from the back or from the cache service with the key ADM2
     * @param adm1
     */
    loadDistrict(adm1) {
        this.locationService.getAdm2(adm1).subscribe(response => {
            this.loadedData.adm2 = response;

        });
        this.loadedData.adm3 = [];
        this.loadedData.adm4 = [];
    }

    /**
     * Get adm3 from the back or from the cahce service with the key ADM3
     * @param adm2
     */
    loadCommunity(adm2) {
        this.locationService.getAdm3(adm2).subscribe(response => {
            this.loadedData.adm3 = response;

        });
        this.loadedData.adm4 = [];
    }

    /**
     *  Get adm4 from the back or from the cahce service with the key ADM4
     * @param adm3
     */
    loadVillage(adm3) {
        this.locationService.getAdm4(adm3).subscribe(response => {
            this.loadedData.adm4 = response;

        });
    }

    /**
     * Check which adm is selected to load the list of adm link to it
     * fro example : if adm1 (province) selected load adm2
     * @param index
     */
    selected(index) {
        if (index === 'adm1') {
            const body = {};
            body['adm1'] = this.getAdmID('adm1');
            this.loadDistrict(body);
        } else if (index === 'adm2') {
            const body = {};
            body['adm2'] = this.getAdmID('adm2');
            this.loadCommunity(body);
        } else if (index === 'adm3') {
            const body = {};
            body['adm3'] = this.getAdmID('adm3');
            this.loadVillage(body);
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

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.distribution !== GlobalText.TEXTS) {
            this.distribution = GlobalText.TEXTS;
            this.mapperObject = this.mapper.findMapperObject(this.entity);
            this.nameComponent = GlobalText.TEXTS.distribution_title;
            this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
        }
    }

    /**
     * to cancel the creation of distribution and go back in the distribution page
     */
    cancel() {
        this.router.navigate(['projects']);
    }

    /**
     * Get the distribution type choosen by the user and refresh the research
     */
    typeDistributionOnChange(event) {
        this.newObject.type = event.value;

        if (this.criteriaArray.length != 0) {
            this.load = true;
            this.criteriaService.getBeneficiariesNumber(this.newObject.type, this.criteriaArray, this.newObject.threshold, this.queryParams.project).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                this.commodityNb = this.saveCommodityNb * this.criteriaNbBeneficiaries;
                this.load = false;

            });
        }
    }

    /**
     * Get the number input inserted by the user
     */
    numberOnInput(event) {
        this.newObject.threshold = event.target.value;
    }

    /**
     * Refresh the research when input changed
     */
    numberOnChange() {
        if (this.criteriaArray.length != 0) {
            this.load = true;
            this.criteriaService.getBeneficiariesNumber(this.newObject.type, this.criteriaArray, this.newObject.threshold, this.queryParams.project).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                this.commodityNb = this.saveCommodityNb * this.criteriaNbBeneficiaries;
                this.load = false;

            });
        }

    }

    /**
     * Get in the cache service the name of all adm selected
     * @param adm
     */
    getAdmID(adm: string) {
        if (adm === 'adm1') {
            this.locationService.getAdm1().subscribe(
                result => {
                    const adm1 = result;
                    if (this.newObject.adm1) {
                        for (let i = 0; i < adm1.length; i++) {
                            if (adm1[i].name === this.newObject.adm1) {
                                return adm1[i].id;
                            }
                        }
                    }
                }
            );
            
        } else if (adm === 'adm2') {
            this.locationService.getAdm2().subscribe(
                result => {
                    const adm2 = result;
                    if (this.newObject.adm2) {
                        for (let i = 0; i < adm2.length; i++) {
                            if (adm2[i].name === this.newObject.adm2) {
                                return adm2[i].id;
                            }
                        }
                    }
                }
            );
            
        } else if (adm === 'adm3') {
            this.locationService.getAdm3().subscribe(
                result => {
                    const adm3 = result;
                    if (this.newObject.adm3) {
                        for (let i = 0; i < adm3.length; i++) {
                            if (adm3[i].name === this.newObject.adm3) {
                                return adm3[i].id;
                            }
                        }
                    }
                }
            );
            
        } else if (adm === 'adm4') {
            this.locationService.getAdm4().subscribe(
                result => {
                    const adm4 = result;
                    if (this.newObject.adm4) {
                        for (let i = 0; i < adm4.length; i++) {
                            if (adm4[i].name === this.newObject.adm4) {
                                return adm4[i].id;
                            }
                        }
                    }
                }
            );
        }
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
     * create the new distribution object before send it to the back
     */
    add() {
        if (this.newObject.type && this.criteriaArray.length != 0 && this.commodityArray && this.commodityArray[0] && this.newObject.date_distribution && this.newObject.threshold > 0) {
            let dateObjectDistribution = new Date(this.newObject.date_distribution);
            dateObjectDistribution.setDate(dateObjectDistribution.getDate() + 1);

            if (dateObjectDistribution.getTime() <= new Date(this.projectInfo.startDate).getTime() || dateObjectDistribution.getTime() >= new Date(this.projectInfo.endDate).getTime()) {
                this.snackBar.open('Error while creating new distribution, your distribution date have to be inside the project dates', '', { duration: 3000, horizontalPosition: 'center' });
                return;
            }
            else {
                this.loadingCreation = true;
                const newDistribution: DistributionData = new DistributionData;
                newDistribution.type = this.newObject.type;
                newDistribution.threshold = this.newObject.threshold;
                newDistribution.project.id = this.queryParams.project;
                newDistribution.location.adm1 = this.newObject.adm1;
                newDistribution.location.adm2 = this.newObject.adm2;
                newDistribution.location.adm3 = this.newObject.adm3;
                newDistribution.location.adm4 = this.newObject.adm3;
                newDistribution.selection_criteria = this.criteriaArray;
                newDistribution.commodities = this.commodityArray;

                const formatDateOfBirth = this.newObject.date_distribution.split('/');
                if (formatDateOfBirth[0].length < 2) {
                    formatDateOfBirth[0] = '0' + formatDateOfBirth[0];
                }
                if (formatDateOfBirth[1].length < 2) {
                    formatDateOfBirth[1] = '0' + formatDateOfBirth[1];
                }

                newDistribution.date_distribution = formatDateOfBirth[2] + '-' + formatDateOfBirth[0] + '-' + formatDateOfBirth[1];
                // console.log(newDistribution.date_distribution);
                let adm;
                if (this.newObject.adm4) {
                    adm = this.newObject.adm4
                } else if (this.newObject.adm3) {
                    adm = this.newObject.adm3;
                } else if (this.newObject.adm2) {
                    adm = this.newObject.adm2;
                } else {
                    adm = this.newObject.adm1;
                }
                newDistribution.name = adm + '-' + newDistribution.date_distribution;

                // console.log('NEW ONE : ', newDistribution);

                const promise = this._distributionService.add(newDistribution);
                if (promise) {
                    promise.toPromise().then(response => {
                        this.snackBar.open('distribution : ' + response.distribution.name + ' was created', '', { duration: 3000, horizontalPosition: 'center' });
                        this.router.navigate(['projects/distributions/' + response.distribution.id]);
                    });
                } else {
                    this.snackBar.open('Error while creating new distribution', '', { duration: 3000, horizontalPosition: 'center' });
                    this.loadingCreation = false;
                }
            }
        } else {
            this.snackBar.open('Fill new distribution\'s information before, including the commodity and a threshold\'s value more than 0.', '', { duration: 3000, horizontalPosition: 'center' });
        }

    }

    setStep(index: string) {
        this.step = index;
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action === this.criteriaAction) {
            dialogRef = this.dialog.open(ModalAddLineComponent, {
                data: { data: [], entity: this.criteriaClass, mapper: this.mapper }
            });
        } else if (user_action === this.commodityAction) {
            dialogRef = this.dialog.open(ModalAddComponent, {
                data: { data: [], entity: this.commodityClass, mapper: this.mapper }
            });
        }
        if (dialogRef) {
            const create = dialogRef.componentInstance.onCreate.subscribe((data: Criteria) => {
                this.createElement(data, user_action);
            });

            dialogRef.afterClosed().subscribe(result => {
                create.unsubscribe();
            });
        }
    }

    /**
     * add row in selection criteria table and distributed commodity table
     * @param createElement
     * @param user_action
     */
    createElement(createElement: Object, user_action) {
        if (user_action === this.criteriaAction) {
            this.load = true;
            this.criteriaArray.push(createElement);
            this.criteriaService.getBeneficiariesNumber(this.newObject.type, this.criteriaArray, this.newObject.threshold, this.queryParams.project).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                this.commodityNb = this.saveCommodityNb * this.criteriaNbBeneficiaries;

                this.load = false;
            });
            this.criteriaData = new MatTableDataSource(this.criteriaArray);
        } else if (user_action === this.commodityAction) {
            this.commodityArray.push(createElement);
            this.sumCommodities(createElement);
            this.commodityData = new MatTableDataSource(this.commodityArray);
        }
    }

    /**
     * delete row in selection criteria table and distributed commodity table
     * @param removeElement
     * @param user_action
     */
    removeElement(removeElement: Object, user_action) {
        if (user_action === this.criteriaAction) {
            const index = this.criteriaArray.findIndex((item) => item === removeElement);
            if (index > -1) {
                this.criteriaArray.splice(index, 1);
                this.criteriaData = new MatTableDataSource(this.criteriaArray);
            }
        } else if (user_action === this.commodityAction) {
            const index = this.commodityArray.findIndex((item) => item === removeElement);
            if (index > -1) {
                this.commodityArray.splice(index, 1);

                this.saveCommodityNb -= removeElement['value'];
                this.commodityNb = this.saveCommodityNb * this.criteriaNbBeneficiaries;

                if (this.commodityNb <= 0) {
                    this.commodityNb = 0;
                }

                this.commodityData = new MatTableDataSource(this.commodityArray);
            }
        }
    }

    /**
     * add the number of all commodites to display the total
     * @param createElement
     */
    sumCommodities(createElement: Object) {
        const value = parseInt(createElement['value'], 10);
        if (value) {
            this.saveCommodityNb += value;
        }

        this.commodityNb = this.saveCommodityNb * this.criteriaNbBeneficiaries;
    }

    getProjectDates() {
        this._projectService.get().subscribe(
            result => {
                const projects = result;
                let keyForProject;

                Object.keys(projects).forEach(key => {
                    if (projects[key].id == this.queryParams.project) {
                        keyForProject = key;
                        return;
                    }
                });

                this.projectInfo.startDate = projects[keyForProject].start_date;
                this.projectInfo.endDate = projects[keyForProject].end_date;
            }
        );
    }
}
