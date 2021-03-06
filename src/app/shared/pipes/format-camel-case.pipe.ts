import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatCamelCase'
})

export class FormatCamelCasePipe implements PipeTransform {
    transform(value: string) {
        if ((typeof value) !== 'string') {
            return value;
        }
        let response = '';
        const values = value.split(/(?=[A-Z])/);
        values.forEach(part => {
            const word = part[0].toUpperCase() + part.slice(1);
            if (part.length > 1) {
                response += word + ' ';
            } else {
                // If it is only one capital letter it means it's initials
                response += word;
            }
        });
        return response;
    }
}
