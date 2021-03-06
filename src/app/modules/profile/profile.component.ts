import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { Constants } from 'src/app/models/constants/constants';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { WsseService } from '../../core/authentication/wsse.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

    nameComponent = 'profile_title';

    actualUser: User;
    profileForm = new FormGroup({
        email: new FormControl({ value: '', disabled: 'true' }),
        oldPassword: new FormControl(''),
        newPassword1: new FormControl(''),
        newPassword2: new FormControl('')
    });

    loading = false;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(public userService: UserService,
        public authenticationService: AuthenticationService,
        public wsseService: WsseService,
        public snackbar: SnackbarService,
        public formBuilder: FormBuilder,
        public languageService: LanguageService,
        public router: Router,
        ) {
    }

    ngOnInit() {
        this.setActualUser();
    }

    setActualUser() {
        this.authenticationService.getUser().subscribe(
            (result: User) => {
                if (result) {
                    this.actualUser = result;
                }
                if (this.actualUser) {
                    this.profileForm.patchValue({
                        email: this.actualUser.get<string>('username')
                    });
                } else {
                }
            }
        );

    }

    onProfileFormSubmit(): void {
        if (this.profileForm.value.newPassword1 !== this.profileForm.value.newPassword2) {
            this.snackbar.error(this.language.snackbar_change_password_not_possible);
            return;
        }
        if (this.profileForm.value.newPassword1 === this.profileForm.value.oldPassword) {
            this.snackbar.warning(this.language.profile_password_would_not_be_changed);
            return;
        }
        if (!Constants.REGEX_PASSWORD.test(this.profileForm.value.newPassword1)) {
            this.snackbar.error(this.language.modal_not_enough_strong);
            return;
        }
        this.loading = true;
        this.userService.updatePassword(this.actualUser, this.profileForm.value.oldPassword, this.profileForm.value.newPassword1)
            .then(
                () => {
                    this.loading = false;
                    this.snackbar.success(this.language.profile_password_changed);
                    this.router.navigate(['/']);
                }, err => this.loading = false);
        }
}
