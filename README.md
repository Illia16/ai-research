# ai-research

# FrontEnd: React

    - cd frontend
    - npm i
    - npm start

# Backend:Express

    - cd backend
    - create a file `secrets.js` with OpenAI key as a secret:
        module.exports = {
            apiKey: "API_KEY",
        };
    - npm i
    - npm run start:server

# Backend:Python

    - cd backend_py
    - create a file `.env` with GeminiAI projectID `PROJECT_ID` as a secret:
        PROJECT_ID=[GOOGLE_CLOUD_PROJECT_NAME]
    - Ensure appropriate Vertex AI `API & Services` are enabled
    - python -m django --version (install python and django if needed)
    - python manage.py runserver 4010
