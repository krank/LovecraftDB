import * as Interfaces from "./modules/interfaces";

export const dataBlobs: Interfaces.DataBlob[] = [

  /* GENERAL META */
  {
    name: "Title",
    type: Interfaces.BlobType.generalMetaData,

    documentElementType: Interfaces.DocumentNodeType.input,
    documentElementClass: "title",

    xmlElementName: "title"
  },
  {
    name: "Author",
    type: Interfaces.BlobType.generalMetaData,

    documentElementType: Interfaces.DocumentNodeType.input,
    documentElementClass: "author",

    xmlElementName: "author"
  },
  {
    name: "Written",
    type: Interfaces.BlobType.generalMetaData,

    documentElementType: Interfaces.DocumentNodeType.input,
    documentElementClass: "written",

    xmlElementName: "written"
  },
  {
    name: "Published",
    type: Interfaces.BlobType.generalMetaData,

    documentElementType: Interfaces.DocumentNodeType.input,
    documentElementClass: "published",

    xmlElementName: "published"
  },

  /* LISTS */

  {
    name: "Tags",
    type: Interfaces.BlobType.list,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "tags",

    xmlElementName: "tags",
    xmlElementChildrenName: "tag"
    
  },
  {
    name: "Characters",
    type: Interfaces.BlobType.list,
    containsNames: true,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "characters",

    xmlElementName: "characters",
    xmlElementChildrenName: "character",

    attributePairs: [
      {
        text: "m",
        xml: {
          attribute: "gender",
          value: "male"
        }
      },
      {
        text: "f",
        xml: {
          attribute: "gender",
          value: "female"
        }
      },
      {
        text: "o",
        xml: {
          attribute: "gender",
          value: "other"
        }
      },
      {
        text: "u",
        xml: {
          attribute: "gender",
          value: "unknown"
        }
      },
      {
        text: "1",
        xml: {
          attribute: "type",
          value: "main"
        }
      },
      {
        text: "2",
        xml: {
          attribute: "type",
          value: "interacted"
        }
      },
      {
        text: "3",
        xml: {
          attribute: "type",
          value: "mentioned"
        }
      }
    ]

  },
  {
    name: "Mythos entities",
    type: Interfaces.BlobType.list,
    containsNames: true,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "entities",

    xmlElementName: "entities",
    xmlElementChildrenName: "entity"
    
  },
  {
    name: "Books",
    type: Interfaces.BlobType.list,
    containsNames: true,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "books",

    xmlElementName: "books",
    xmlElementChildrenName: "book"
    
  },
  {
    name: "Locations",
    type: Interfaces.BlobType.list,
    containsNames: true,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "locations",

    xmlElementName: "locations",
    xmlElementChildrenName: "location"
    
  },
  {
    name: "Phobias",
    type: Interfaces.BlobType.list,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "phobias",

    xmlElementName: "phobias",
    xmlElementChildrenName: "phobia"
    
  },
  {
    name: "Notes",
    type: Interfaces.BlobType.list,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "notes",

    xmlElementName: "notes",
    xmlElementChildrenName: "note"
    
  },
  {
    name: "Related reading",
    type: Interfaces.BlobType.list,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "related",

    xmlElementName: "related",
    xmlElementChildrenName: "item"
    
  },

  /* MAIN */

  {
    name: "Full text",
    type: Interfaces.BlobType.fulltext,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "fulltext",

    xmlElementName: "body",
    
  },
  {
    name: "Summary",
    type: Interfaces.BlobType.summary,

    documentElementType: Interfaces.DocumentNodeType.textarea,
    documentElementClass: "summary",

    xmlElementName: "summary",
    
  }
]