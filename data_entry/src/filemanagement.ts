export function saveFile(name: string, mime: string, data: string) {
    if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: mime }), name);

    let linkElement = document.createElement("a");
    linkElement.setAttribute("style", "display:none");

    let url = window.URL.createObjectURL(new Blob([data], { type: mime }));

    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", name);
    //document.appendChild(linkElement);
    linkElement.click();
    window.URL.revokeObjectURL(url);
    linkElement.remove();
}

export function loadFile(callback: (textContent: string) => void) {
    let inputElement = document.createElement("input");
    inputElement.type = "file";

    inputElement.addEventListener("change", (event: Event) => {
        const eventTarget: HTMLInputElement = event.target as HTMLInputElement;

        const file: File = eventTarget.files[0];

        const fileReader: FileReader = new FileReader();

        fileReader.readAsText(file, "utf-8");

        fileReader.addEventListener("load", (event: Event) => {
            const fileReader: FileReader = event.target as FileReader;

            if ((fileReader.result as string).length == 0) {
                console.log("Uh-oh, spaghetti-o's! That file seems empty, just like my soul.");
            }

            callback(fileReader.result as string);
        });
    });

    inputElement.click();
}