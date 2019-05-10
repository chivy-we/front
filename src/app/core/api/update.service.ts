import { Injectable } from '@angular/core';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {

    constructor(
        private snackbar: SnackbarService,
        private updates: SwUpdate,
    ) {
        this.updates.available.subscribe(
            _event => {
                // tslint:disable-next-line
                console.log(_event);
                const snack = this.snackbar.info('An update is available', 'Reload');

                snack.onAction().subscribe(() => {
                    this.updates.activateUpdate().then(() => {
                        window.location.reload();
                    });
                });

                setTimeout(() => {
                    snack.dismiss();
                }, 6000);
            }
        );
    }
}
