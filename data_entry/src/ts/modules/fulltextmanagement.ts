import * as DecisionDialog from "./decisiondialog";

export function SetTextBody(text: string, replace: boolean = true) {

  let textBodyElement:HTMLTextAreaElement = document.querySelector("main textarea.textcode");

  if (replace) {
      if (textBodyElement.value.length != 0) {
          DecisionDialog.displayDialog(
              "Replace",
              "Are you sure? This will mean losing the current text body.",
              text,
              function(text: string) {
                  textBodyElement.value = text;
              }
          );
      } else {
          textBodyElement.value = text;
      }
  } else {
      textBodyElement.value += "\n\n" + text;
  }

  textBodyElement.dispatchEvent(new Event("input", { bubbles: true }));
  ResetTabs();
}

export function GetTextBody():string {
  let textBodyElement:HTMLTextAreaElement = document.querySelector("main textarea.textcode");

  return textBodyElement.value;
}

function ResetTabs() {
  let codeTabElement: HTMLInputElement = document.querySelector("input#code");
  codeTabElement.click();
}