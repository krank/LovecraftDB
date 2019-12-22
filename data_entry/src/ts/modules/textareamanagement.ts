import * as Interfaces from "./interfaces";
import * as DomManagement from "./dommanagement";
import * as DecisionDialog from "./decisiondialog";

export function addToListelement(dataBlob: Interfaces.DataBlob, newContent: string[], force: boolean = false) {

  let element: HTMLTextAreaElement = DomManagement.getHtmlElementOf(dataBlob, false).element as HTMLTextAreaElement;

  let originalText: string = element.value;

  let originalContentArray: string[] = originalText == "" ? [] : originalText.split("\n");
  console.log(originalContentArray);

  if (!force) {

    let intersection: string[] = originalContentArray.filter(item => -1 !== newContent.indexOf(item));
    
    if (intersection.length > 0) {

      DecisionDialog.displayDialog("Duplicates",
      `Some of the items you're trying to add to ${dataBlob.name} are duplicates. Add them anyway?`, "", function(dataString: string) {

        addToListelement(dataBlob, newContent, true)

      });
      return;
    }
  }

  let newContentArray = originalContentArray.concat(newContent);

  element.value = newContentArray.join("\n");

}