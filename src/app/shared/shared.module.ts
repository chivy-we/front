import { NgModule                                               } from '@angular/core';
import { RouterModule, Routes                                   } from '@angular/router';
import { CommonModule                                           } from '@angular/common';
import { FormsModule, ReactiveFormsModule                       } from '@angular/forms';
import { FormControl, FormGroup, Validators                     } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatSelectModule, MatOptionModule                    } from '@angular/material';
import { MatIconModule                                          } from '@angular/material/icon';
import { MatTooltipModule                                       } from '@angular/material/tooltip'
import { BrowserAnimationsModule                                } from '@angular/platform-browser/animations'
import { NgbModule                                              } from '@ng-bootstrap/ng-bootstrap';

import { MenuItemBoxComponent                                   } from '../components/menu-item-box/menu-item-box.component';
import { IconSvgComponent                                       } from '../components/icon-svg/icon-svg.component';

import { LoginComponent                                         } from '../modules/public/login.component';
import { DashboardComponent                                     } from '../modules/dashboard/dashboard.component';
import { MenuComponent                                          } from '../modules/menu/menu.component';
import { HouseholdsComponent                                    } from '../modules/households/households.component';
import { DistributionComponent                                  } from '../modules/distribution/distribution.component';
import { SettingsComponent                                      } from '../modules/settings/settings.component';
import { ReportsComponent                                       } from '../modules/reports/reports.component';
import { HeaderComponent                                        } from '../modules/header/header.component';

@NgModule({
    imports: [
        RouterModule,
        CommonModule, // to use instead of BrowserModule if you are using lazyloaded module  like Malnutrition
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule, 
        MatTooltipModule,
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        BrowserAnimationsModule,
        NgbModule.forRoot()
    ],
    declarations: [
        //Shared Components
        LoginComponent,
        DashboardComponent, 
        MenuComponent,
        MenuItemBoxComponent,
		HouseholdsComponent,
		DistributionComponent,
		SettingsComponent,
        ReportsComponent,   
		HeaderComponent,     
		IconSvgComponent,
    ],
    exports: [
        //Shared Components
        LoginComponent, 
		DashboardComponent,                 
        MenuComponent,
        MenuItemBoxComponent,
		HouseholdsComponent,
		DistributionComponent,
		SettingsComponent,
		ReportsComponent,    
		HeaderComponent,                
		IconSvgComponent,
    ],
    providers: []
})
export class SharedModule { }