import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver/FileSaver';
import { tap } from 'rxjs/operators';
import { AppInjector } from 'src/app/app-injector';
import { LanguageService } from 'src/app/core/language/language.service';
import { Gender, ResidencyStatus } from 'src/app/models/beneficiary';
import { LIVELIHOOD } from 'src/app/models/constants/livelihood';
import { HouseholdFilters } from 'src/app/models/data-sources/households-data-source';
import { VulnerabilityCriteria } from 'src/app/models/vulnerability-criteria';
import { URL_BMS_API } from '../../../environments/environment';
import { Household, Livelihood } from '../../models/household';
import { Location } from '../../models/location';
import { Project } from '../../models/project';
import { SnackbarService } from '../logging/snackbar.service';
import { HttpService } from '../network/http.service';
import { NetworkService } from '../network/network.service';
import { CustomModelService } from '../utils/custom-model.service';
import { CriteriaService } from './criteria.service';
import { ExportService } from './export.service';
import { LocationService } from './location.service';
import { ProjectService } from './project.service';

@Injectable({
    providedIn: 'root'
})
export class HouseholdsService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'households';


    constructor(
        protected http: HttpService,
        private exportService: ExportService,
        private router: Router,
        protected languageService: LanguageService,
        private snackbar: SnackbarService,
        public networkService: NetworkService,
    ) {
        super(http, languageService);
    }

    /**
     * Get all households
     * @param body any
     */
    public get(filter: any, sort: any, pageIndex: number, pageSize: number) {
        const url = this.api + '/households/get/all';
        return this.http.post(url, {filter, sort, pageIndex, pageSize});
    }

    public getOne(beneficiaryId) {
        const url = this.api + '/households/' + beneficiaryId;
        return this.http.get(url);
    }

    /**
     * Get all households
     * @param newHouseholds any
     */
    public getImported(newHouseholds: any) {
        const url = this.api + '/households/get/imported';
        return this.http.post(url, {households: newHouseholds});
    }

    /**
     * Upload CSV  and data validation to import new household
     * @param body any
     * @param projectId number
     * @param step number
     * @param token string
     */
    public sendDataToValidation(email: string, body: any, projectId: number, token?: string) {
        const params = {
            token: token !== undefined ? token : '',
            email: email,
        } ;

        return this.http.post(`${this.api}/import/households/project/${projectId}`, body, {params});
    }

    /**
     * Add household.
     * @param hh
     * @param projects_ids
     */
    public add(hh: any, projects_ids: string[]) {
        const url = this.api + '/households';
        const body = {
            household: hh,
            projects: projects_ids
        };
        return this.http.put(url, body);
    }

    /**
     * Update household.
     * @param householdId
     * @param hh
     * @param projects_ids
     */
    public edit(householdId: number, hh: any, projects_ids: string[]) {
        const url = this.api + '/households/' + householdId;
        const body = {
            household: hh,
            projects: projects_ids
        };
        return this.http.post(url, body);
    }

    /**
     * Export beneficiaries
     * @param  extensionType type of file to export
     * @return               file
     */
    public export (extensionType: string, filters: any = null, ids: Array<string> = []) {
        return this.exportService.export('beneficiaries', true, extensionType, {}, filters, ids);
    }

    /**
     * Export householdsTemplate
     * @param  extensionType type of file to export
     * @return               file
     */
    public exportTemplate (extensionType: string) {
        return this.exportService.export('householdsTemplate', true, extensionType);
    }

    public delete(householdId: number) {
        const url = this.api + '/households/' + householdId;
        return this.http.delete(url);
    }

    public deleteMany(householdIds: Array<number>) {
        const url = this.api + '/households/delete';
        const body = {
            ids: householdIds
        };
        return this.http.post(url, body);
    }

    public testFileTemplate(file: any, location: any) {
        const params = {};
        params['type'] = 'xls';
        params['templateSyria'] = true;

        const options = {
            responseType: 'blob',
            params: params
        };

        const url = this.api + '/import/households?adm1=' + location.adm1 + '&adm2=' + location.adm2 +
            '&adm3=' + location.adm3 + '&adm4=' + location.adm4;
        return this.http.post(url, file, options).pipe(
            tap((response: any) => {
                saveAs(response, 'templateSyria.xls');
            })
        );
    }

    public fillWithOptions(household: Household) {

        const appInjector = AppInjector;
        appInjector.get(ProjectService).get().subscribe((projects: any) => {
            if (projects) {
                const projectOptions = projects.map(project => {
                    return Project.apiToModel(project);
                });
                household.setOptions('projects', projectOptions);
            }
        });
    }

    public fillFiltersWithOptions(filters: HouseholdFilters) {
        const appInjector = AppInjector;

        // Get Projects
        appInjector.get(ProjectService).get().subscribe((projects: any) => {
            if (projects) {
                const projectOptions = projects.map(project => {
                    return Project.apiToModel(project);
                });
                filters.setOptions('projects', projectOptions);
            }
        });

        // Get vulnerabilities
        appInjector.get(CriteriaService).getVulnerabilityCriteria().subscribe((vulnerabilities: any) => {

            if (vulnerabilities) {
                const vulnerabilityOptions = vulnerabilities.map(vulnerability => {
                    return VulnerabilityCriteria.apiToModel(vulnerability);
                });
                filters.setOptions('vulnerabilities', vulnerabilityOptions);
            }
        });

        // Get gender
        const genderOptions = [
            new Gender('0', this.language.female),
            new Gender('1', this.language.male)
        ];
        filters.setOptions('gender', genderOptions);

        // Get residency status
        const residencyOptions = [
            new ResidencyStatus('refugee', this.language.beneficiary_residency_status_refugee),
            new ResidencyStatus('IDP', this.language.beneficiary_residency_status_idp),
            new ResidencyStatus('resident', this.language.beneficiary_residency_status_resident)
        ];
        filters.setOptions('residency', residencyOptions);

        // Get livelihood
        const livelihoodOptions = LIVELIHOOD.map(livelihood => new Livelihood(livelihood.id, this.language[livelihood.language_key]));
        filters.setOptions('livelihood', livelihoodOptions);

        // Get adm1
        const location = new Location();
        appInjector.get(LocationService).fillAdm1Options(location).subscribe((filledLocation: Location) => {
            filters.set('location', filledLocation);
        });
    }

    public visit(householdId) {

        if (!this.networkService.getStatus()) {
            this.snackbar.warning(this.language.household_no_data_offline);
        } else {
            this.router.navigate(['/beneficiaries/update-beneficiary', householdId]);
        }
    }
}
