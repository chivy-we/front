export class CustomModelField<T> {
    /**
     * Described field
     * @type {T}
     */
    value: T;
    /**
     * Is the field required?
     * @type {boolean}
     */
    title: string;
     /**
     * Field's type
     * @type {string}
     */
    type: string;
    /**
     * Is the field displayed in modals?
     * @type {boolean}
     */
    isDisplayedInModal: boolean;
    /**
     * Is the field displayed in tables?
     * @type {boolean}
     */
    isDisplayedInTable: boolean;
    /**
     * Can you select multiple elements of this field among other options?
     * @type {boolean}
     */
    isMultipleSelect: boolean;
    /**
     * Is the field a password?
     * @type {boolean}
     */
    isPassword: boolean;
    /**
     * Is the field required?
     * @type {boolean}
     */
    isRequired: boolean;
    /**
     * Can you set the value of the field on creation?
     * @type {boolean}
     */
    isSettable: boolean;
    /**
     * Can you select only one element of this field among other options?
     * @type {boolean}
     */
    isSingleSelect: boolean;
    /**
     * Is the input a long string ?
     * @type {boolean}
     */
    isLongText: boolean;
    /**
     * Can you update the value of the field once the object is create?
     * @type {boolean}
     */
    isUpdatable: boolean;
    /**
     * Method to get multiple choice options
     * @type {string}
     */
    options: string[];
    /**
     * List of options if the field should be a select
     * @type {string[]}
     */
    bindField;

    /**
     * @param  {Props} properties
     */
    constructor(properties: any) {
        properties = CustomModelField.fillWithDefault(properties);

        // Title displayed in the GUI
        this.title                  = properties['title'];

        // Object value
        this.value                  = properties['value'];

        // Boolean properties
        this.isDisplayedInModal     = properties['isDisplayedInModal'];
        this.isDisplayedInTable     = properties['isDisplayedInTable'];
        this.isPassword             = properties['isPassword'];
        this.isRequired             = properties['isRequired'];
        this.isSettable             = properties['isSettable'];
        this.isLongText             = properties['isTextArea'];
        this.isUpdatable            = properties['isUpdatable'];

        // Multiple select
        this.bindField              = properties['bindField'];
        this.isMultipleSelect       = properties['isMultipleSelect'];
        this.isSingleSelect         = properties['isSingleSelect'];
        this.options                = properties['options'];


    }

    static fillWithDefault(properties: Object) {
        return {
            // Todo: set default title to null (used for debug purpose only)
            title:                  'TITLE NOT SET',

            value:                  null,

            isDisplayedInModal:     false,
            isDisplayedInTable:     false,
            isPassword:             false,
            isRequired:             false,
            isSettable:             false,
            isUpdatable:            false,

            bindField:              null,
            isMultipleSelect:       false,
            isSingleSelect:         false,
            options:                null,

            ...properties,
        };
    }
}
