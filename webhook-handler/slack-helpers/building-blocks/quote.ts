export function quote(text: string) {
    return text ? `> ${text}` : "";
}