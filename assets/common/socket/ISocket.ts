
export default interface ISocket {
    onopen(event: Event): void
    onclose(event: CloseEvent): void
    onmessage(event: MessageEvent): void
    onerror(event: Event): void
}