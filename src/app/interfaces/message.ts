export interface Message {
  type: string;
  username: string;
  sender: string | null;
  receiver: string | null;
  message: string;
}
