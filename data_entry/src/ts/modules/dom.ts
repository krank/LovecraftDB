import * as Interfaces from "./interfaces";

export interface BlobDomElements {
  element: HTMLElement,
  warningElement?: HTMLElement
}

export function getHtmlElementOf(dataBlob: Interfaces.DataBlob, getWarning: boolean): BlobDomElements {

  let elementSelector: string = "";
  let warningSelector: string = "";

  //console.log("Getting element for " + dataBlob.name);

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
    case Interfaces.BlobType.fulltext:
    case Interfaces.BlobType.summary: {

      elementSelector = `main section.${dataBlob.documentElementClass} textarea`;
      warningSelector = `main section.${dataBlob.documentElementClass} h2`;

      break;
    }
  }

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