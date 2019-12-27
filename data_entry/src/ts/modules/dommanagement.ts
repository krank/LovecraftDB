import * as Interfaces from "./interfaces";

export interface BlobDomElements {
  element: HTMLElement,
  warningElement?: HTMLElement
}

export function getHtmlElementOf(dataBlob: Interfaces.DataBlob, getWarning: boolean): BlobDomElements {

  let elementSelector: string = "";
  let warningSelector: string = "";

  switch (dataBlob.type) {
    case Interfaces.BlobType.generalMetaData: {

      elementSelector = `.metadata label.${dataBlob.documentElementClass} input`;
      warningSelector = `.metadata label.${dataBlob.documentElementClass} span`;

      break;
    }
    case Interfaces.BlobType.list: {

      elementSelector = `.metadata section.${dataBlob.documentElementClass} textarea`;
      warningSelector = `.metadata section.${dataBlob.documentElementClass} h2`;

      break;
    }
    case Interfaces.BlobType.main: {

      elementSelector = `main section.${dataBlob.documentElementClass} textarea`;
      warningSelector = `main section.${dataBlob.documentElementClass} h2`;

      break;
    }
  }

  /*console.log(dataBlob.name);
  console.log(elementSelector);
  console.log(document.querySelector(elementSelector));

  console.log(warningSelector);
  console.log(document.querySelector(warningSelector));*/

  return {
    element: document.querySelector(elementSelector),
    warningElement: getWarning ? document.querySelector(warningSelector) : null  }
}

export function unwrapElement(element: HTMLElement) {
  let parent = element.parentNode;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  
  parent.removeChild(element);
}