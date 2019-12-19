import * as FormHandling from "./formhandling";


interface ButtonElementInfo {
  text: string;
  value: string;
  title: string;
  classes: string[];
}

export function setupDialog(
  title: string,
  useSearchForm: boolean,
  submitButtons: ButtonElementInfo[]
): HTMLDialogElement {
  // Dialog element creation
  const dialogTemplate: HTMLTemplateElement = document.querySelector(".big.dialog");
  const dialogFragment: DocumentFragment = document.importNode(dialogTemplate, true).content;
  const dialog: HTMLDialogElement = dialogFragment.querySelector("dialog") as HTMLDialogElement;
  document.querySelector("body").appendChild(dialog);

  // Config dialog
  dialog.querySelector("header h2").innerHTML = title;
  dialog.querySelector("form.search-box").classList.toggle("hidden", !useSearchForm);

  // Reset dialog
  (dialog.querySelector("input.query") as HTMLInputElement).value = "";
  (dialog.querySelector("section.results ul") as HTMLElement).innerHTML = "";
  (dialog.querySelector("section.buttons") as HTMLElement).innerHTML = "";

  (dialog.querySelectorAll("section.buttons button") as NodeListOf<HTMLButtonElement>).forEach(button => {
    button.disabled = true;
  });

  // Submit buttons
  setupSubmitButtons(dialog, submitButtons);

  // Validation for search box & results
  FormHandling.addValidation(dialog.querySelector("form.search-box"));
  FormHandling.addValidation(dialog.querySelector("form.search-results"));

  return dialog;
}

function setupSubmitButtons(dialog: HTMLDialogElement, submitButtons: ButtonElementInfo[]) {
  const submitButtonTemplate: HTMLTemplateElement = dialog.querySelector("template.submit-button");
  const submitButtonContainer: HTMLElement = dialog.querySelector(".buttons");

  submitButtons.forEach(buttonInfo => {
    const submitButtonFragment: DocumentFragment = document.importNode(submitButtonTemplate.content, true);
    const submitButtonElement: HTMLButtonElement = submitButtonFragment.querySelector("button");

    submitButtonElement.value = buttonInfo.value;
    submitButtonElement.title = buttonInfo.title;
    submitButtonElement.textContent = buttonInfo.text;

    buttonInfo.classes.forEach(buttonClass => {
      submitButtonElement.classList.add(buttonClass);
    });

    submitButtonElement.disabled = true;

    submitButtonContainer.appendChild(submitButtonFragment);
  });
}