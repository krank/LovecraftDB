interface DecisionDialog extends HTMLDialogElement {
  dataString?: string;
  closeListener?: (event: Event) => void
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

  dialog.closeListener = function (event: Event) {
    event.preventDefault();

    let dialog: DecisionDialog = this as DecisionDialog;

    dialog.removeEventListener("close", dialog.closeListener)

    if (this.returnValue == "yes") {
      callback(dialog.dataString);
    }
  };

  dialog.addEventListener("close", dialog.closeListener);

  dialog.showModal();
}