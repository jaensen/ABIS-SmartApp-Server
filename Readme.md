# ABIS Server
This repository contains the server component of abis. The server provides a GraphQL-API and comes with a client library.  
It is based on [Apollo Server](https://www.apollographql.com/docs/apollo-server/) and [Prisma 2](https://www.prisma.io/).

## Quickstart
**1) Clone the repository:**  
```
$ git clone https://github.com/ABISCloud/ABIS-OS1-Gamma.git
```
**2) Adjust the database config**  
  
Provide your own connection string in _data/src/schema.prisma_:
```  
datasource db {
    provider = "postgresql"
    url      = "postgresql://postgres:abis@localhost:5432/abis?schema=public"
}
```
**3) Install dependencies, generate code and build:**
```  
$ cd ABIS-OS1-Gamma
$ ./clean.sh
```
**4) Deploy the database** 
  
Use the prisma command line utility to deploy the database to your server (this uses the configuration from _data/src/schema.prisma_).
```  
$ cd data
$ npx prisma migrate save --experimental
$ npx prisma migrate up --experimental
```
**5) Run the server**
```  
$ cd server
$ node dist/main.js
```
**6) Generate the client code**
```  
$ cd client
$ npm run generate
```


## Repository structure
The repository contains multiple npm-packages. Each package has its own readme file.
* __@abis/server__:  
Contains the Apollo Server based NodeJS application.  
  * _Readme: [server/readme.md](server/readme.md)_
  * _Uses: @abis/types, @abis/interfaces, @abis/events, @abis/data, @abis/log_
* __@abis/client__:  
Contains the client library for the use in client applications.  
  * _Readme: [client/readme.md](client/readme.md)_
  * _Uses: @abis/types, @abis/interfaces, @abis/dialog, @abis/events, @abis/log_
* __@abis/types__:  
Contains a collection of JsonSchema documents and corresponding TypeScript interfaces that describe e.g. all events that are used troughout the system.
  * _Uses: -_ 
* __@abis/interfaces__:  
Contains all common interfaces.
  * _Uses: @abis/types_
* __@abis/events__:  
Contains the event delivery mechanism that is used for _Agents_ and _Dialogs_
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
* __@abis/agents__:  
Contains the base agent types from which other implementors can derive.
  * _Uses: @abis/types, @abis/interfaces, @abis/dialog, @abis/events, @abis/log, @abis/data_
* __@abis/dialog__:  
Contains mechanisms to describe a Dialog between two Agents as a State-Machine and a runtime to execute these descriptions.
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
* __@abis/data__:  
Contains classes that provide access to the _Prisma_ data layer.
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
  
