export function getTextareaContents(selector: string): string {
    return (document.querySelector(selector) as HTMLTextAreaElement).textContent;
}

export function setTextareaContents(selector: string, newContent: string, warnIfNotFull: boolean) {
    const textArea: HTMLTextAreaElement = document.querySelector(selector);

    textArea.textContent = newContent;
}