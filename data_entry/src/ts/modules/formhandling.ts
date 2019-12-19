export function addValidation(form: HTMLFormElement) {
  form.addEventListener("input", function () {
    let form: HTMLFormElement = this as HTMLFormElement;

    SetSubmitButtonEnabled(form, form.checkValidity());
  });
}

export function SetSubmitButtonEnabled(form: HTMLFormElement, state: boolean) {
  (form.querySelectorAll("button[type=submit]") as NodeListOf<HTMLButtonElement>).forEach(button => {
    button.disabled = !state;
  });
}