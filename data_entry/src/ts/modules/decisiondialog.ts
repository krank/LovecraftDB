interface DecisionDialog extends HTMLDialogElement {
  dataString?: string;
}

export function displayDialog(
  title: string,
  description: string,
  dataString: string,
  callback: (dataString: string) => void
) {
  let dialog: DecisionDialog = document.querySelector("dialog.decision");

  let dialogTitle: HTMLElement = dialog.querySelector("h2");
  let dialogDescription: HTMLElement = dialog.querySelector("p");

  dialog.dataString = dataString;
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;

  dialog.addEventListener("close", function (event: Event) {
    event.preventDefault();

    let dialog: DecisionDialog = this as DecisionDialog;

    if (this.returnValue == "yes") {
      callback(dialog.dataString);
    }
  });

  dialog.showModal();
}