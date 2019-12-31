import * as Interfaces from "./interfaces";
import * as DomManagement from "./dommanagement";
import * as DecisionDialog from "./decisiondialog";

export function addToListelement(dataBlob: Interfaces.DataBlob, newContent: string[], force: boolean = false) {

  let element: HTMLTextAreaElement = DomManagement.getHtmlElementOf(dataBlob, false).element as HTMLTextAreaElement;

  let originalText: string = element.value;

  let originalContentArray: string[] = originalText == "" ? [] : originalText.split("\n");

  if (!force) {

    let intersection: string[] = originalContentArray.filter(item => -1 !== newContent.indexOf(item));

    if (intersection.length > 0) {

      DecisionDialog.displayDialog("Duplicates",
        `Some of the items you're trying to add to ${dataBlob.name} are duplicates. Add them anyway?`, "", function (dataString: string) {

          addToListelement(dataBlob, newContent, true)

        });
      return;
    }
  }

  let newContentArray = originalContentArray.concat(newContent);

  element.value = newContentArray.join("\n");

}

export function setMetadataField(field: string, newText: string) {

  let fieldElement: HTMLInputElement = document.querySelector(`section.metadata input[name="${field}"]`);

  console.log(fieldElement);

  if (!fieldElement) return;

  fieldElement.value = newText;

}

export function setupLists() {

  document.querySelectorAll(".metadata section header button[value='clean'").forEach(btn => {
    (btn as HTMLButtonElement).addEventListener("click", () => {
      let sectionParent: HTMLElement = btn.parentElement.parentElement

      if (sectionParent.matches("section")) {
        cleanList(sectionParent.querySelector("textarea"));
      }
    })
  });

}

export function cleanList(textarea: HTMLTextAreaElement) {

  interface listItem {
    metaData?: string,
    content: string
  }

  let originalContent: string = textarea.value;

  let list: listItem[] = [];

  originalContent.split("\n").forEach(line => {
    let parts: string[] = line.split("|", 2);

    list.push({
      content: parts.length == 2 ? parts[1] : parts[0],
      metaData: parts.length == 2 ? parts[0] : null
    })

  });

  // Remove duplicates

  list = list.filter((item, index, self) => {
    // Create temp array containing all the contents only
    // use indexOf to find position of current item's content
    // Only return true if the current index is the only place where this content occurs
    return self.map(innerItem => innerItem.content).indexOf(item.content) === index;
  });

  // Remove empties
  list = list.filter((item) => {
    return item.content.length > 0;
  });

  // Sort the rest
  list = list.sort((a, b) => (a.content > b.content) ? 1 : -1);

  // Put them back
  let resultList: string[] = list.map(function (item: listItem): string {
    return item.metaData ? item.metaData + "|" + item.content : item.content;
  });

  textarea.value = resultList.join("\n");

}