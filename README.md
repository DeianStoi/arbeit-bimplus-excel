## Description

This application let's you create automatically projects and users in **BimPlus**, based on a **.xlsx**-File

## How to run

- Clone or download the repository
- Open the **.env_sample** and type in your **ACCOUNT_EMAIL** and **ACCOUNT_PASSWORD** and **APPLICATION_ID** (**IS_STAGE** must be equal to **0** to work in the real enviroment)
- Save the file and rename it as **.env**
- With your Terminal/Command Prompt navigate to the folder where the **package.json** file is stored and type:

```
npm install
```

This should install all required packages.

- Run the program:

```
node start.js
```

- Open a web browser and navigate to **http://localhost:3000/**
