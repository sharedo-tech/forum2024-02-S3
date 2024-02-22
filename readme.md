# Feb 2024 - User forum - developer session 3 sample code

This repo contains all the sample code for the IDE deep dive session presented on 22nd Feb 2024.

It contains;

- /IDE - all the IDE sample code demonstrated
- /PMSApi - the fake PMS API used in the demo
- /PMSClientSample - a simple console app that exercises that API
- export-Demo*.zip - a solution export containing all the work types, portal definitions, workflows and IDE files used in the sample.

# To run the test API
From /PMSApi: `dotnet run`

# To run the client sample
From /PMSClientSample: `dotnet run`

# Installing the solution export
To get the entire sample up and running, use "Sharedo in a box" to install a local developer instance of sharedo, then, from modeller, use solution import to import the package zip file provided.

The only manual configuration required would be to setup the `demo01` linked service in admin, pointing at https://localhost:5001 with an API KEY of `abcd1234` and expose it for proxy.


