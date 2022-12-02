# final_cloud_22f_backend

Backend for Final Project in Cloud Computing.

This works alongside [front-end](https://github.com/QuanDo2000/final_cloud_22f_react).

## MySQL Files

- The MySQL files used to populate the Database in `seed.js` file are too large so they are not included on Github.
- Populating the Database will take VERY LONG because of the 100MB file. Therefore, only run `seed.js` if there is no other option.
- After placing the correct files into the `mysql` folder, run the following commands starting from root directory of project.

```bash
cd mysql
node seed.js
```

## Getting Started

First, run the server:

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080) with your browser to request APIs.

## Azure App Service Settings

- When deploying through GitHub, a Publish Profile is needed.
- The Publish Profile is obtained from Azure.
  - Deployment -> Deployment Center -> Manage publish profile -> Download
- Then we add the content of the downloaded file into Actions secrets on GitHub.
  - Settings -> Security -> Secrets -> Actions -> Repository secret.
  - Notice to use correct naming (refer to documentation for details).
- If deployed through Azure, this is added automatically.

- Adding `.env` variables in cloud environment.
  - Settings -> Configuration -> Application Settings
  - Add the environment variables similar to `.env` files with name and value.
