import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as Leaflet from 'leaflet';
import { Commodity } from 'src/app/models/commodity';
import { Distribution } from 'src/app/models/distribution';


@Injectable({
  providedIn: 'root'
})
export class DistributionMarkerService {
    datePipe = new DatePipe('en-US');
    public getClassesNames(distribution: Distribution) {
        return this.getDistributionStatus(distribution);
    }

    private getDistributionStatus(distribution: Distribution) {
        if (!distribution.get<boolean>('validated')) {
            return 'not-validated';
        }
        if (distribution.get<boolean>('finished')) {
            return 'completed';
        }
        return 'validated';
    }

    public isToday(distribution: Distribution) {
        const today = new Date();
        const distributionDate = distribution.get<Date>('date');
        today.setHours(0, 0, 0, 0);
        distributionDate.setHours(0, 0, 0, 0);
        return (distributionDate.getTime() === today.getTime());
    }

    public getImage(distribution: Distribution) {
        return distribution.get<Array<Commodity>>('commodities')[0].getImage();
    }

    public getPopup(distribution: Distribution) {
        const popup = Leaflet.DomUtil.create('div', 'infoWindow');

        popup.innerHTML = `
            <div id="bms-popup">
                <p>Name: ${distribution.get<string>('name')}</p>
                <p>Status: ${this.getDistributionStatus(distribution)}</p>
                <p>Date: ${ this.datePipe.transform(distribution.get<Date>('date'), 'dd-MM-yyyy')}</p>
            </div>
        `;
        return popup;
    }
}
