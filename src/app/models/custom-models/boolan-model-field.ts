import { CustomModelField } from './custom-model-field';

export class BooleanModelField extends CustomModelField<Boolean> {
    kindOfField = 'Boolean';
    value: Boolean;

    formatForApi() {
        return this.value ? true : false;
    }
}
