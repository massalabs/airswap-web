export interface DelegateRule {
  senderWallet: string;
  senderToken: string;
  senderAmount: string;
  signerToken: string;
  signerAmount: string;
  expiry: number;
}
