import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public form: FormGroup = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(4)]),
      email: new FormControl(
        '',
        [Validators.required, Validators.email],
        this.asyncEmailValidator()
      ),
      confirmEmail: new FormControl('', Validators.email),
    },
    this.emailsMatch()
  );
  public subscription: Subscription = new Subscription();

  public erreursForm: { [field: string]: string } = {
    name: '',
    email: '',
    confirmEmail: '',
    form: '',
  };

  public messagesErreur: { [field: string]: { [field: string]: string } } = {
    name: {
      required: 'Ce champ est requis.',
      minlength: 'Vos nom et prénom doivent faire au moins 4 caractères.',
    },
    email: {
      required: 'Entrez un email.',
      email: 'Rentrez une adresse email valide.',
      asyncEmailValidator: "L'email n'existe pas.",
    },
    confirmEmail: {
      email: 'Rentrez une adresse email valide.',
    },
    form: {
      noMatch: 'Les emails ne correspondent pas.',
    },
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.subscription.add(
      this.form.statusChanges.subscribe(() => {
        this.changementStatusForm();
      })
    );
  }

  reinitialiser() {
    this.form.reset();
  }

  submit() {
    console.log(this.form.value);
  }

  emailsMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.get('email')!.value != control.get('confirmEmail')!.value
        ? { noMatch: true }
        : null;
    };
  }

  asyncEmailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.http
        .get(
          `https://emailvalidation.abstractapi.com/v1/?api_key=02f4ac902bb14671aa9b176e45890cd4&email=noreddinekeddar@gmail.com`
        )
        .pipe(
          map((response: any) => {
            console.log(response);
            return !response.smtp_check
              ? { asyncEmailValidator: control.value }
              : null;
          })
        );
    };
  }

  changementStatusForm() {
    if (!this.form) {
      return;
    }
    const form = this.form;
    for (const field in this.erreursForm) {
      this.erreursForm[field] = '';
      let control: AbstractControl;
      if (
        field === 'form' &&
        form.get('email')!.touched &&
        form.get('confirmEmail')!.dirty
      ) {
        control = form;
      } else {
        control = form.get(field)!;
      }
      if (control && control.touched && control.invalid) {
        const messages = this.messagesErreur[field];
        for (const key in control.errors) {
          this.erreursForm[field] += messages[key] + ' ';
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

/**Il existe plusieurs validateurs qui sont fournis nativement par Validators :

- Validators.required() : qui permet d'indiquer qu'un champ est obligatoire.
- Validators.minLength(minLength: number) : qui permet d'indiquer qu'un champ doit faire un minimum de caractères.
- Validators.maxLength(maxLength: number) : qui permet d'indiquer qu'un champ doit faire un maximum de caractères.
- Validators.pattern(pattern: string | RegExp) : qui permet d'indiquer qu'un champ doit matcher une regex particulière (par exemple format d'un email, d'un téléphone, d'une CB etc).
- Validators.min(min: number) : qui permet d'indiquer qu'un champ doit avoir comme valeur un nombre d'au minimum le nombre passé en paramètre.
- Validators.max(max: number) : qui permet d'indiquer qu'un champ doit avoir comme valeur un nombre d'au maximum le nombre passé en paramètre.
- Validators.requiredTrue() : qui permet d'indiquer qu'un champ doit valoir true.
- Validators.email() : qui permet d'indiquer qu'un champ doit être un email.

**/
