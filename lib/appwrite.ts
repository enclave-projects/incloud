import { Account, Client, Databases, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.enclaveprojects.dev/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "incloud-enclaveprojects");

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage };
