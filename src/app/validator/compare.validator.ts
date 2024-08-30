import { AbstractControl } from "@angular/forms";

export class CompareValidator {
  constructor() {}

  validate(controlOne: AbstractControl, controlTwo: AbstractControl) {
    return () => {
      if (controlOne.value !== controlTwo.value) return { nomatch: true };
      return null;
    };
  }
}
