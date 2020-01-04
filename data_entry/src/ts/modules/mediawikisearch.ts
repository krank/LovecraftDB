import * as BigDialog from "./bigdialog";
import * as FormHandling from "./formhandling";
import * as MetaDataManagement from "./metadatamanagement"


interface RegexpReplacement {
      description: string;
      regexp: RegExp;
      replacement: string;
      exhaust?: boolean;
  }

  interface MediawikiResult {
      ns: number;
      pageid: number;
      size: number;
      snippet: string;
      timestamp: string;
      title: string;
      wordcount: number;
  }

  interface WikiDialog extends HTMLDialogElement {
      wikiUrl?: string;
      resultRowTemplate: HTMLTemplateElement;
      query?: string;
      callback?: (text: string, replace: boolean) => void;
  }

  interface WikiForm extends HTMLFormElement {
      wikiDialog?: WikiDialog;
  }

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

  export function displayDialog(
      defaultSearch: string,
      wikiUrl: string,
      callback: (text: string, replace: boolean) => void
  ) {
      const dialog: WikiDialog = BigDialog.setupDialog("Download from Wikisource", true, [
          {
              title: "Download and append to text",
              text: "Append",
              value: "append"
          },
          {
              title: "Download and replace current text",
              text: "Download",
              value: "replace"
          }
      ]) as WikiDialog;

      // Get references
      const searchForm: WikiForm = dialog.querySelector("form.search-box");

      // Save references for later
      searchForm.wikiDialog = dialog;
      dialog.wikiUrl = wikiUrl;
      dialog.callback = callback;
      dialog.resultRowTemplate = dialog.querySelector(".result-row") as HTMLTemplateElement;

      // Setup default search
      const searchBox: HTMLInputElement = searchForm.querySelector("input[type=text]") as HTMLInputElement;
      searchBox.value = defaultSearch;
      searchForm.dispatchEvent(new Event("input"));

      // Setup search action
      searchForm.addEventListener("submit", function(event: Event) {
          event.preventDefault();

          let dialog: WikiDialog = (this as WikiForm).wikiDialog;

          let query: string = (this.querySelector("input.query") as HTMLInputElement).value;

          dialog.query = query;

          searchMediaWiki(query, dialog);
      });

      // Setup dialog closing action
      dialog.addEventListener("close", function() {
          let dialog = this as WikiDialog;

          if (dialog.returnValue != "cancel") {
              let selectedItem: HTMLInputElement = dialog.querySelector(
                  ".results input[type=radio][name=title]:checked"
              );
              if (selectedItem) {
                  let title: string = selectedItem.value;

                  let wikiUrl = dialog.wikiUrl;

                  if (dialog.returnValue == "replace") {
                      getMediaWikiText(title, wikiUrl, true, dialog.callback);
                  } else if (dialog.returnValue == "append") {
                      getMediaWikiText(title, wikiUrl, false, dialog.callback);
                  } else {
                      alert("Whatcho talkin bout Willis?");
                  }
              }
          }
          dialog.remove();
      });

      dialog.showModal();
  }

  function searchMediaWiki(query: string, dialog: WikiDialog) {
      const endpoint = `${dialog.wikiUrl}/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=15&srsearch=${query}`;

      fetch(endpoint)
          .then(response => response.json())
          .then(data => {
              const searchResults: MediawikiResult[] = data.query.search;

              let titles: string[] = [];

              searchResults.forEach(result => {
                  titles.push(result.title);
              });

              displaySearchResults(titles, dialog);
          });
  }

  function displaySearchResults(titles: string[], dialog: WikiDialog) {
      // Callback for mediawiki search result titles

      const template = dialog.resultRowTemplate.content;
      const container = dialog.querySelector(".results ul");

      const resultsForm: HTMLFormElement = dialog.querySelector("form.search-results") as HTMLFormElement;

      // Empty old results
      container.innerHTML = "";

      if (titles.length == 0) {
          container.innerHTML = `No results found for ${dialog.query}.`;

          FormHandling.SetSubmitButtonEnabled(resultsForm, false);
      } else {
          titles.forEach(title => {
              let row = template.cloneNode(true) as HTMLTemplateElement;

              row.querySelector(".text").innerHTML = title;
              (row.querySelector("input[name=title]") as HTMLInputElement).value = title;

              container.appendChild(row);
          });

          // Dispatch input event to fire up validation
          resultsForm.dispatchEvent(new Event("input"));
      }
  }

  function wikiToXML(text: string): string {
      let replacements: RegexpReplacement[] = [
          //#region Wiki cleanup
          {
              description: "Remove noinclude",
              regexp: /<noinclude>([\S\s]*?)<\/noinclude>/g,
              replacement: "$1"
          },
          {
              description: "Remove drop initial",
              regexp: /{{2}drop *initial\|(.)}{2}/g,
              replacement: "$1"
          },
          {
              description: "Remove small caps",
              regexp: /{{2}sc\|(.*?)}{2}/g,
              replacement: "$1"
          },
          {
              description: "Remove end notes",
              regexp: /==Endnotes==[\S\s]*$/g,
              replacement: ""
          },
          {
              description: "Remove tooltips",
              regexp: /{{2}tooltip\|(.*?)\|.*?\}{2}/g,
              replacement: "$1"
          },
          {
              description: "Remove references",
              regexp: /<ref>.*?<\/ref>/g,
              replacement: ""
          },
          {
              description: "Remove indentations",
              regexp: /\n[ \t]+/g,
              replacement: "\n"
          },
          {
              description: "Remove links",
              regexp: /\[{2}.*?\|(.*?)\]{2}/g,
              replacement: "$1"
          },
          {
              description: "Remove right-aligning",
              regexp: /{{2}right.*?\|(.*?)\}{2}/g,
              replacement: "$1"
          },
          {
              description: "Remove centering",
              regexp: /{{2}c.*?\|(.*?)}{2}/g,
              replacement: "$1"
          },
          {
              description: "Remove blocks",
              regexp: /{{2}block.*?\|(.*?)}{2}/gs,
              replacement: "$1"
          },
          {
              description: "Fix attributes without quotes",
              regexp: /<(.*?) (.*?)=([^"].*?)([ >])/,
              replacement: '<$1 $2="$3"$4',
              exhaust: true
          },
          //#endregion
          //#region Headings
          {
              description: "Heading",
              regexp: /{{2}xx-larger\|(.*?)}{2}\n* /g,
              replacement: "<h1>$1</h1>\n\n"
          },
          {
              description: "Chapter title",
              regexp: /==(.*?)==\n*/g,
              replacement: "<h2>$1</h2>\n\n"
          },
          //#endregion
          //#region Poems
          {
              description: "Poem lines with 2 indent | EXHAUST",
              regexp: /<poem>([\S\s]*?)\n(?!<line)::(.+?)\n([\S\s]*?)<\/poem>/g,
              replacement: "<poem>$1\n<line indent=2>$2</line>\n$3</poem>",
              exhaust: true
          },
          {
              description: "Poem lines with 1 indent | EXHAUST",
              regexp: /<poem>([\S\s]*?)\n(?!<line):(.+?)\n([\S\s]*?)<\/poem>/g,
              replacement: "<poem>$1\n<line indent=1>$2</line>\n$3</poem>",
              exhaust: true
          },
          {
              description: "Poem lines without indent | EXHAUST",
              regexp: /<poem>([\S\s]*?)\n(?!<line)(.+?)\n([\S\s]*?)<\/poem>/g,
              replacement: "<poem>$1\n<line>$2</line>\n$3</poem>",
              exhaust: true
          },
          {
              description: "Poem lines using br tag",
              regexp: /\n(.*)<br\/>/g,
              replacement: "\n<line>$1</line>"
          },
          //#endregion
          //#region Paragraphs
          {
              description: "Add paragraph </p><p>tags",
              regexp: /\n\n/g,
              replacement: "</p>\n\n<p>"
          },
          {
              description: "Remove last paragraph start tag (b/c logic)",
              regexp: /([\S\s]*)<p>/g,
              replacement: "$1"
          },
          {
              description: "Remove first paragraph end tag (b/ logic)",
              regexp: /<\/p>([\S\s]*)/g,
              replacement: "$1"
          },
          {
              description: "Remove line breaks after paragraph start",
              regexp: /<p>\n+/g,
              replacement: "<p>"
          },
          {
              description: "Reverse poem and paragraph start tags",
              regexp: /<p>\n*<poem>/g,
              replacement: "<poem>\n<p>"
          },
          {
              description: "Reverse poem and paragraph end tags",
              regexp: /<\/poem>\n*<\/p>/g,
              replacement: "</p>\n</poem>"
          },
          {
              description: "Separate first line of poem pagagraph from paragraph start tag",
              regexp: /<p><line>/g,
              replacement: "<p>\n<line>"
          },
          {
              description: "Separate last line of poem paragraph from paragraph end tag",
              regexp: /<\/line><\/p>/g,
              replacement: "</line>\n</p>"
          },
          {
              description: "Remove paragraph tags around headings",
              regexp: /<p><(h[0-5])>(.*?)<\/\1><\/p>/g,
              replacement: "<$1>$2</$1>\n\n"
          },
          //#endregion
          //#region Text fixes
          {
              description: "'' to emph",
              regexp: /\'{2}(.*?)\'{2}/g,
              replacement: "<emph>$1</emph>"
          },
          {
              description: "Remove triple newlines",
              regexp: /\n\n\n/g,
              replacement: "\n\n",
              exhaust: true
          },
          {
              description: "Remove double spaces",
              regexp: /  /g,
              replacement: " ",
              exhaust: true
          },
          {
              description: "&nbsp; to space",
              regexp: /&nbsp;/g,
              replacement: " "
          },
          {
              description: "Ellipsis",
              regexp: /\. ?\. ?\./g,
              replacement: "…"
          }
          //#endregion
      ];

      let convertedText: string = text;

      replacements.forEach(replacement => {
          if (replacement.exhaust) {
              while (convertedText.search(replacement.regexp) >= 0) {
                  convertedText = convertedText.replace(replacement.regexp, replacement.replacement);
              }
          } else {
              convertedText = convertedText.replace(replacement.regexp, replacement.replacement);
          }
      });

      return convertedText;
  }

  function getMediaWikiText(
      article: string,
      wikiUrl: string,
      replace: boolean,
      resultHandler: (text: string, replace: boolean) => void
  ) {
      const endpoint = `${wikiUrl}/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&rvslots=main&titles=${article}`;

      fetch(endpoint)
          .then(response => response.json())
          .then(data => {
              const pages = data.query.pages;
              const page = pages[Object.keys(pages)[0]];
              if (page.revisions) {
                  const text: string = page.revisions[0].slots.main["*"];
                  if (replace) {
                    handleMetadata(text);
                  }
                  resultHandler(wikiToXML(text), replace); // Actually a call to FullTextManagement.SetBodyText
              }
          });

      // TODO: Add some error handling here. Catch?
  }

function handleMetadata(text:string) {

  interface WikiMetaData {
    regex: RegExp,
    fieldName: string;
  }

  let metaDataFields:WikiMetaData[] = [
    {
      fieldName: "title", 
      regex: /title *= (.*)/g
    },
    {
      fieldName: "author",
      regex: /author *= (.*)/g
    },
    {
      fieldName: "published",
      regex: /year *= (.*)/g
    }
  ];

  metaDataFields.forEach(field => {
    let result = field.regex.exec(text);
    if (result) {
      MetaDataManagement.setMetadataField(field.fieldName, result[1]);
    }
  })

}