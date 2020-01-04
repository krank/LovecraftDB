export enum DocumentNodeType {
  input,
  textarea
}

export enum BlobType {
  generalMetaData, // Author, year etc
  list, // Names, tags etc
  main // Fulltext, summary
}

export interface AttributePair {
  text: string;
  xml: XmlAttribute;
}

export interface XmlAttribute {
  attribute: string;
  value: string;
}


export interface DataBlob {
  name: string,
  type: BlobType,
  containsNames?: boolean,
  isFullText?: boolean,

  attributePairs?: AttributePair[],
  
  documentElementType: DocumentNodeType,
  documentElementClass: string,

  xmlElementName: string,
  xmlElementChildrenName?: string,

}

/*

Nomenclature:

blob

document - the HTML dom
xml - the structure of the target xml file



*/