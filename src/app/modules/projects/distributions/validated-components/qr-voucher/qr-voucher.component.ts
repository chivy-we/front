import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';
import { Beneficiary } from 'src/app/models/beneficiary';
import { Booklet, BookletStatus } from 'src/app/models/booklet';
import { TransactionQRVoucher } from 'src/app/models/transaction-qr-voucher';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qr-voucher',
  templateUrl: './qr-voucher.component.html',
  styleUrls: ['../validated-distribution.component.scss']
})
export class QrVoucherComponent extends ValidatedDistributionComponent implements OnInit {
    // distributed = false;
    loadingAssign = false;
    // beneficiaries = [];
    // beneficiariesClass = Beneficiary;

    transactionData: MatTableDataSource<TransactionQRVoucher>;

    ngOnInit() {
        super.ngOnInit();
        // this.selection = new SelectionModel<any>(true, []);
        this.entity = TransactionQRVoucher;
    }

    setDistributionBeneficiaries(distributionBeneficiaries: any) {
      this.actualDistribution.set(
          'distributionBeneficiaries',
          distributionBeneficiaries
              .map((distributionBeneficiariy: any) =>
                TransactionQRVoucher.apiToModel(distributionBeneficiariy, this.actualDistribution.get('id'))));
  }

  formatTransactionTable() {
      const distributionBeneficiaries = this.actualDistribution.get<TransactionQRVoucher[]>('distributionBeneficiaries');
      this.transactionData = new MatTableDataSource(distributionBeneficiaries);
      this.verifyIsFinished();
      this.loadingTransaction = false;
  }

   /**
   * To be used everytime transactionData changes
   */
  verifyIsFinished() {
      let amount: number;

      if (!this.transactionData) {
          amount = 0;
      } else {
          amount = 0;
          this.transactionData.data.forEach(
              (distributionBeneficiary: TransactionQRVoucher) => {
                if (!distributionBeneficiary.get('booklet')) {
                  amount++;
                } else {
                  const stateId = distributionBeneficiary.get('booklet').get<BookletStatus>('status').get<string>('id');
                  if (stateId !== '3' && stateId !== '2') {
                      amount++;
                  }
                }
              }
          );
      }
       if (amount === 0) {
          this.finishedEmitter.emit();
       }
  }

  // Total ammount assigned/distributed to a benefeciary
  getCommoditySentAmountFromBeneficiary(commodity: any, transaction: TransactionQRVoucher): number {
      const booklet: Booklet = transaction.get('booklet');
      if (booklet) {
          return booklet.get('value');
      } else {
          return 0;
      }
  }

  // Total amount used/spent by a beneficiary
  getCommodityReceivedAmountFromBeneficiary(commodity: any, transaction: TransactionQRVoucher): number {
      const booklet: Booklet = transaction.get('booklet');
      if (booklet && (booklet.get('status').get<string>('id') === '2' || booklet.get('status').get<string>('id') === '3')) {
          return booklet.get('value');
      } else {
          return 0;
      }
  }

  /**
	* open each modal dialog
	*/
  openModal(dialogDetails: any): void {
    this.modalSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    let completeSubscription = null;

    if (dialogDetails.action === 'delete') {
        dialogDetails.element = dialogDetails.element.get('beneficiary');
        this.modalService.openDialog(Beneficiary, this.beneficiariesService, dialogDetails);
        completeSubscription = this.modalService.isCompleted.subscribe((response: boolean) => {
            if (response) {
                this.getDistributionBeneficiaries();
            } else {
                this.loadingTransaction = false;
            }
        });
    }  else if (dialogDetails.action === 'addBeneficiary') {
        this.modalService.openDialog(Beneficiary, this.beneficiariesService, dialogDetails);
        completeSubscription = this.modalService.isCompleted.subscribe((response: boolean) => {
            if (this.networkService.getStatus()) {
                if (response) {
                    this.getDistributionBeneficiaries();
                } else {
                    this.loadingTransaction = false;
                }
            } else {
                this.loadingTransaction = false;
            }
        });
    } else if (dialogDetails.action === 'edit') {
        dialogDetails.element = dialogDetails.element.get('beneficiary');
        this.modalService.openDialog(Beneficiary, this.beneficiariesService, dialogDetails);
        completeSubscription = this.modalService.isCompleted.subscribe((response: boolean) => {
                this.loadingTransaction = false;
        });
    } else {
        this.modalService.openDialog(TransactionQRVoucher, this.beneficiariesService, dialogDetails);
        completeSubscription = this.modalService.isCompleted.subscribe((_response: boolean) => {
        });
    }
    if (completeSubscription) {
        this.modalSubscriptions = [completeSubscription];
    }
  }

  assign(element: TransactionQRVoucher) {
    const dialogRef = this.dialog.open(ModalAssignComponent, {
        data: {
            beneficiary: element.get('beneficiary'),
            project: this.actualDistribution.get('project'),
            distribution: this.actualDistribution,
        }
    });
    dialogRef.afterClosed().subscribe((test) => {
      this.getDistributionBeneficiaries();
    });
  }

  openAssignDialog() {
      this.loadingAssign = true;

      this.distributionService.getAssignableBeneficiaries(this.actualDistribution.get('id'))
          .subscribe(
              response => {
                  this.loadingAssign = false;
                  let beneficiaries = [];
                  if (response || response === []) {
                      // this.beneficiaries = this.beneficiariesClass.formatArray(response);
                      beneficiaries = response
                            .map((distributionBeneficiary: any) => Beneficiary.apiToModel(distributionBeneficiary.beneficiary));
                  }
                  const dialogRef = this.dialog.open(ModalAssignComponent, {
                      data: {
                          project: this.actualDistribution.get('project'),
                          distribution: this.actualDistribution,
                          beneficiaries: beneficiaries
                      }
                  });

                  dialogRef.afterClosed().subscribe((test) => {
                    this.getDistributionBeneficiaries();
                  });
              }, err => {
                  this.loadingAssign = false;
              }
          );
  }
}
