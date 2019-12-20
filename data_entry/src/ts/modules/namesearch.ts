import * as BigDialog from "./bigdialog";
import * as XMLHandling from "./xmlhandling";
import * as TextAreaManagement from "./textareamanagement";



interface RegexGroup {
  matchText: string;
  indexStart: number;
  indexEnd: number;
}

interface ItemOption {
  value: string;
  text: string;
  checked?: boolean;
}

interface CategoryResult {
  dataPair: XMLHandling.XmlDataPair;
  content: string[];
}

const itemOptions: ItemOption[] = [
  {
    text: "Character",
    value: "character"
  },
  {
    text: "Creature",
    value: "creature"
  },
  {
    text: "Location",
    value: "location"
  },
  {
    text: "Book",
    value: "book"
  },
  {
    text: "Ignore",
    value: "ignore",
    checked: true
  }
];

export function displayDialog(text: string) {
  const dialog: HTMLDialogElement = BigDialog.setupDialog("Detected names", false, [
    {
      title: "Append names to lists",
      text: "Append",
      value: "append",
      classes: ["fas", "fa-list"]
    },
    {
      title: "Cancel",
      text: "Cancel",
      value: "cancel",
      classes: ["fas", "fa-ban"]
    }
  ]);

  // Regex: One or more words each beginning with a capital letter and bookended by a non-letter.
  // And the entire group may be preceded by an emph tag but NOT punctuation (so capitalized words at the beginning of sentences are excluded)
  let nameRegex: RegExp = /(?<![\.;:!?] *) (?:<emph>)?((?:[A-Z][\wéáà]+ ?)+),?/g;

  let possibleNames = findUniqueMatches(text, nameRegex);

  displayMatches(possibleNames, text, dialog);

  // Setup dialog closing action
  dialog.addEventListener("close", function () {
    let dialog = this as HTMLDialogElement;

    if (dialog.returnValue == "append") {

      // Construct "categorized" object from data pairs

      let categorized: Record<string, CategoryResult> = {};

      let dataPairs = XMLHandling.dataPairs.filter(pair => pair.containsNames == true);

      dataPairs.forEach(pair => {
        categorized[pair.xmlElementChildrenName] = {
          dataPair: pair,
          content: []
        };
      });

      // Gather all the categorized names
      let checkedElements: NodeListOf<HTMLInputElement> = dialog.querySelectorAll(
        "input[type=radio]:checked:not([value=ignore])"
      );

      checkedElements.forEach(element => {
        // Check to make sure element value (category name) exists as property of categorized object
        if (Object.keys(categorized).indexOf(element.value) >= 0) {
          let category: string[] = categorized[element.value].content;

          category.push(element.name);
        }
      });

      // TODO: Use description text field for name, not merely element's name (which may have changed)

      console.log(categorized);

      // Go through the categorized names and append them to their respective textareas

      Object.keys(categorized).forEach(categoryName => {

        let category = categorized[categoryName];

        let currentTextContent = TextAreaManagement.getTextareaContents(category.dataPair.documentElementSelector)

        let newTextContent = category.content.join("\n");

        if (currentTextContent.length == 0) {
          TextAreaManagement.setTextareaContents(category.dataPair.documentElementSelector, newTextContent, false);
        } else {
          TextAreaManagement.setTextareaContents(category.dataPair.documentElementSelector, currentTextContent + "\n" + newTextContent, false);
        }
      })


    }
    dialog.remove();
  });

  dialog.showModal();
}

function displayMatches(matches: RegexGroup[], text: string, dialog: HTMLDialogElement) {
  const resultsContainer: HTMLElement = dialog.querySelector(".results ul");

  resultsContainer.innerHTML = "";

  if (matches.length > 0) {
    const template: HTMLTemplateElement = dialog.querySelector(".complex-result-row");
    const optionTemplate: HTMLTemplateElement = dialog.querySelector(".complex-result-row.option");

    matches.forEach(match => {
      const rowElement: DocumentFragment = document.importNode(template.content, true);

      const textElement: HTMLElement = rowElement.querySelector(".description");
      const detailsElement: HTMLElement = rowElement.querySelector(".details");

      textElement.innerText = match.matchText;
      detailsElement.innerHTML = makeAbstract(match, text);

      makeOptionItems(match.matchText, itemOptions, rowElement, optionTemplate);

      resultsContainer.appendChild(rowElement);
    });
  }
}

function makeOptionItems(
  name: string,
  itemOptions: ItemOption[],
  rowElement: DocumentFragment,
  optionTemplate: HTMLTemplateElement
) {
  const optionsContainer: HTMLElement = rowElement.querySelector(".item-options");

  optionsContainer.innerHTML = "";

  itemOptions.forEach(itemOption => {
    const optionElement = document.importNode(optionTemplate.content, true);
    const inputElement = optionElement.querySelector("input");
    const spanElement = optionElement.querySelector("span");

    inputElement.value = itemOption.value;
    inputElement.setAttribute("name", name);
    inputElement.checked = itemOption.checked;
    spanElement.textContent = itemOption.text;

    optionsContainer.appendChild(optionElement);
  });
}

function makeAbstract(matchGroup: RegexGroup, text: string): string {
  let abstractStart: string =
    "…" + text.substring(Math.max(matchGroup.indexStart - 24, 0), matchGroup.indexStart);

  let abstractMain = ` <strong>${matchGroup.matchText}</strong> `;

  let abstractEnd: string = text.substring(matchGroup.indexEnd, Math.max(matchGroup.indexEnd + 24, 0)) + "…";

  abstractStart = abstractStart.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  abstractEnd = abstractEnd.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return abstractStart + abstractMain + abstractEnd;
}

function findUniqueMatches(text: string, regExp: RegExp): RegexGroup[] {
  let matches: RegexGroup[] = [];
  let groups: RegExpExecArray;

  let foundNames: string[] = [];
  while ((groups = regExp.exec(text)) !== null) {
    let match: string = groups[1].trim();

    if (foundNames.indexOf(match) < 0) {
      foundNames.push(match);
      matches.push({
        matchText: groups[1].trim(),
        indexStart: groups.index,
        indexEnd: regExp.lastIndex
      });
    }
  }

  regExp.lastIndex = 0;

  return matches;
}