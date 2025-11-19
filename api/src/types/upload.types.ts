export interface UploadRequestBody {
  base64: string;
  type: 'image'; // extendable for other types like 'video', 'audio', etc.
}
