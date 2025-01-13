pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out the code...'
                checkout scm
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add your test commands here, for example:
                bat 'npm test' // For Node.js projects
                // Or another command relevant to your project
            }
        }
        stage('Build') {
            steps {
                echo 'Building the project...'
                bat 'npm run build' // Replace with your build command
            }
        }
    }
}
