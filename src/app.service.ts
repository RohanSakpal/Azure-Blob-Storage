import { BlobSASPermissions, BlobServiceClient, BlockBlobClient, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  azureConnection = '';
  container = 'audio-files-dev';

  getHello(): string {
    return 'Hello World!';
  }

  getBlockBlobClient(filename:string): BlockBlobClient {
    const blobServiceClient = BlobServiceClient.fromConnectionString(this.azureConnection);
    const blobContainer = blobServiceClient.getContainerClient(this.container);

    return blobContainer.getBlockBlobClient(filename);
  }

  async uploadAudio(file:Express.Multer.File) {
    const blockBlobClient = this.getBlockBlobClient(file.originalname);
    await blockBlobClient.uploadData(file.buffer)
  }

  //download audio file
  async readStream(filename:string) {
    const blockBlobClient = this.getBlockBlobClient(filename);
    const blobDownload = await blockBlobClient.download(0);
    return blobDownload.readableStreamBody;
  }

  //get URL
  async getAudioUrl(filename: string): Promise<string> {
    const blockBlobClient = this.getBlockBlobClient(filename);
    return blockBlobClient.url;  // Return the URL of the existing blob
  }

  async generateSasUrl(filename: string): Promise<string> {
    const blockBlobClient = this.getBlockBlobClient(filename);
    
    // const sasOptions = { // Set expiration time, e.g., 30 minutes
    //   expiresOn: new Date().setHours(new Date().getHours() + 1),
    //   permissions: BlobSASPermissions.parse("r"), // Allow only read access
    // };
    const permissions = new BlobSASPermissions();
    permissions.read = true; // You can adjust permissions here

    // Set expiry time for SAS URL
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
  
    const sharedKeyCredential = new StorageSharedKeyCredential(
      'maricoblobopenai', // Azure storage account name
      ''   // Azure storage account key
    );
  
    // Generate the SAS query parameters
    const sasToken = generateBlobSASQueryParameters({
      containerName: this.container,
      blobName: filename,
      permissions: permissions,
      expiresOn: expiryDate
    }, sharedKeyCredential).toString();
  
    // Construct the full URL with the SAS token
    const sasUrl = `${blockBlobClient.url}?${sasToken}`;
    return sasUrl;
  }
}
