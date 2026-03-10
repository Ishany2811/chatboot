export interface IMessage {
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}
