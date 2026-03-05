import { Account, Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://appwrite.enclaveprojects.dev/v1")
  .setProject("incloud-enclaveprojects");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
