import { Injectable } from '@angular/core';
import { LanguageService } from 'src/app/core/language/language.service';
import { Criteria, CriteriaCondition } from 'src/app/models/criteria';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';

@Injectable({
    providedIn: 'root'
})
export class CriteriaService extends CustomModelService {

    customModelPath = 'distributions/criteria';
    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    public getBeneficiariesNumber(distributionType: string, criteriaArray: Criteria[], threshold: number, project: string) {
        const criteriaArrayForApi = [];
        criteriaArray.forEach(criterion => {
            criteriaArrayForApi.push(criterion.modelToApi());
        });
        const body = { 'distribution_type' : distributionType, 'criteria' : criteriaArrayForApi, 'threshold': threshold };
        const url = this.apiBase + '/distributions/criteria/project/' + project + '/number';
        return this.http.post(url, body);
    }

    /**
     * get the lit of vulnerability criteria
     */
    public getVulnerabilityCriteria() {
        const url = this.apiBase + '/vulnerability_criteria';
        return this.http.get(url);
    }

    fillConditionOptions(criteria: Criteria, fieldName: string) {
            const conditions = new Array<CriteriaCondition>();
            let conditionNames = [];

            const compared = ['dateOfBirth', 'headOfHouseholdDateOfBirth', 'householdSize'];
            const nonEqual = ['gender', 'equityCardNo', 'locationType', 'headOfHouseholdGender', 'residencyStatus'];
            const equal = ['IDPoor', 'livelihood', 'foodConsumptionScore', 'campName', 'copingStrategiesIndex',
                'incomeLevel', 'hasNotBeenInDistributionsSince', 'currentLocation'];

            if (compared.includes(fieldName)) {
                conditionNames = ['>', '<', '>=', '<=', '=', '!='];
            }  else if (nonEqual.includes(fieldName)) {
                conditionNames = ['=', '!='];
            } else if (equal.includes(fieldName)) {
                conditionNames = ['='];
            } else {
                conditionNames = ['true', 'false'];
            }

            conditionNames.forEach((name, index) => {
                const condition = new CriteriaCondition(index.toString(), name);
                conditions.push(condition);
            });
            criteria.setOptions('condition', conditions);
    }

    /**
     * get the lit of camps
     */
    public getCamps() {
        const url = this.apiBase + '/camps';
        return this.http.get(url);
    }

}

