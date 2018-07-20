import { Households } from "./households";

/**
 * Data contained in new and old after treatment
 */
export class Data {
    static __classname__ = 'data';
    /**
     * Households' familyName and first name to compare
     * @type {string}
     */
    nameHead?: string;
    /**
     * Households
     * @type {Households}
     */
    households: Households = new Households;
    /**
     * to know if beneficiaries is the head of household
     * @type {boolean}
     */
    isHead?: boolean = false;
}

/**
 * Format data with fields new and old of type Data
 * Typo issues are directly formatted here
 */
export class FormatDataNewOld {
    static __classname__ = 'FormatDataNewOld';
    /**
     * new data to compare
     * @type {Data}
     */
    new: Data = new Data;
    /**
     * old data to compare
     * @type {Data}
     */
    old: Data = new Data;
    /**
     * id to find pair of new old
     * @type {string}
     */
    id_tmp_beneficiary?: string;

    constructor(instance?) {
        if (instance !== undefined) {
            this.old = instance.old;
            this.new = instance.new;
            this.id_tmp_beneficiary = instance.id_tmp_beneficary;
        }
    }

    /**
     * Array containing an object of old and new household
     * Used at step 1 : typo issues
     * Get the received instance after send the csv in parameter
     * @param instance 
     */
    public static formatIssues(instance: any, step: number): FormatDataNewOld[] {
        let dataFormatted: FormatDataNewOld[] = [];
        instance.data.forEach(element => {
            dataFormatted.push(this.formatDataOldNew(element, step));
        });
        return dataFormatted;
    }

    /**
     * Used to format and type old and new data household
     * @param element 
     */
    public static formatDataOldNew(element: any, step: number): FormatDataNewOld {
        let data = new FormatDataNewOld();
        data.new.households = element.new;
        data.old.households = element.old;
        let oldBeneficiary;
        let newBeneficiary;

        if (step === 2) {
            element.old.beneficiaries.forEach(beneficiary => {
                if (beneficiary.status) {
                    data.old.isHead = true;
                    oldBeneficiary = element.old.id + beneficiary.family_name + beneficiary.given_name;
                }
                
            });
            element.new.beneficiaries.forEach(beneficiary => {
                newBeneficiary = beneficiary.family_name + beneficiary.given_name;
            });
            data.id_tmp_beneficiary = oldBeneficiary + "/" + newBeneficiary;
        } else {
            element.new.beneficiaries.forEach(beneficiary => {
                if (beneficiary.status == '1') {
                    data.new.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
                }
                beneficiary.id_tmp = element.old.id + beneficiary.family_name + beneficiary.given_name;
            });
            element.old.beneficiaries.forEach(beneficiary => {
                if (beneficiary.status == '1') {
                    data.old.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
                }
                beneficiary.id_tmp = element.old.id + beneficiary.family_name + beneficiary.given_name;
            });
            

        }

        return data;
    }
}

/**
 * Model to return data after correction
 */
export class VerifiedData {

    static __classname__ = 'VerifiedData';
    /**
     * new data to create
     * @type {Data}
     */
    new?: Data;
    /**
     * boolean to now which action is necessary : update, add, delete
     * @type {boolean}
     */
    state?: boolean = false;
    /**
     * household's id 
     * @type {number}
     */
    id_old: number;
    /**
     * index link to the data to find them more easily 
     * @type {number}
     */
    index?: number;
    /**
     * object containing given_name and family_name of beneficiary to remove in case of duplicate 
     * @type {any}
     */
    to_delete?: any;
    /**
     * id to link duplicate
     *  @type {string}
     */
    id_duplicate?: string;


    constructor(instance?) {
        if (instance !== undefined) {
            this.state = instance.state;
            this.new = instance.new;
            this.id_old = instance.id_old;
            this.to_delete = instance.to_delete
            this.id_duplicate = instance.id_duplicate
        }
    }

}

/**
 * Model to format duplicates data before display and verify them
 */
export class FormatDuplicatesData {
    static __classname__ = 'FormatDuplicatesData';
    /**
     * array of new and old household
     * @type {Array}
     */
    data: Array<any> = [];
    /**
     * new_household to return to back without modification
     * @type {Households}
     */
    new_household: Households = new Households;
    /**
     * id uses by the back
     * @type {number}
     */
    id_tmp_cache?: number;


    constructor(instance?) {
        if (instance !== undefined) {
            this.data = instance.data;
            this.new_household = instance.new_households;
            this.id_tmp_cache = instance.id_tmp_cache;
        }
    }

    /**
     * Array containing an array with data and new_household keys
     * Key data : array containing an object with old and new household which are one of their beneficiaries identitical
     * Key new_households : data to return to back without modification
     * Used at step 2 : duplicates
     * Get the received instance after send corrected typo issues in parameter
     * @param instance 
     */
    public static formatDuplicates(instance: any, step: number): FormatDuplicatesData[] {
        console.log("instance", instance)
        let formatDuplicates: FormatDuplicatesData[] = [];
        instance.data.forEach(data => {
            let duplicates = new FormatDuplicatesData;
            duplicates.data = [];
            duplicates.new_household = data.new_household;
            if (data.id_tmp_cache) {
                duplicates.id_tmp_cache = data.id_tmp_cache
            }

            data.data.forEach(element => {
                duplicates.data.push(FormatDataNewOld.formatDataOldNew(element, step));
            });

            formatDuplicates.push(duplicates);
        });
        return formatDuplicates;
    }

}

export class FormatMore {
    /**
     * id to identify household
     * @type {number}
     */
    id_old: number;
    /**
     * array of beneficiaries to add in the household
     * @type {Array}
     */
    data: Array<any> = [];

    constructor(instance?) {
        if (instance !== undefined) {
            this.id_old = instance.id_old;
            this.data = instance.data;
        }
    }

}

export class FormatLess {
    /**
     * id to identify household
     * @type {number}
     */
    id_old: number;
    /**
     * array of id beneficiaries to delete in the database
     * @type {Array}
     */
    data: Array<number> = [];

    constructor(instance?) {
        if (instance !== undefined) {
            this.id_old = instance.id_old;
            this.data = instance.data;
        }
    }

}

