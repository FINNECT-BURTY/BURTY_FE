pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    COMPOSE_PROJECT_NAME = 'burty-fe'
    CONTAINER_NAME       = 'burty-fe'
    IMAGE_NAME           = 'burty-fe:latest'
    LETSENCRYPT_EMAIL    = 'admin@burty.kr'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD > .git-sha || true'
      }
    }

    stage('Sanity check') {
      steps {
        sh '''
          set -e
          docker version
          docker compose version
          docker network inspect global-nginx >/dev/null 2>&1 || {
            echo "ERROR: external network global-nginx not found."
            echo "      cd ~/burty-deploy && docker compose -f docker-compose.infra.yml up -d 를 먼저 실행하세요."
            exit 1
          }
        '''
      }
    }

    stage('Build image') {
      steps {
        sh '''
          set -e
          docker compose build --pull burty-fe
        '''
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          set -e
          docker compose up -d --remove-orphans burty-fe
        '''
      }
    }

    stage('Healthcheck') {
      steps {
        sh '''
          set -e
          for i in $(seq 1 36); do
            status=$(docker inspect -f '{{.State.Health.Status}}' ${CONTAINER_NAME} 2>/dev/null || echo "starting")
            echo "[$i] ${CONTAINER_NAME} health=$status"
            if [ "$status" = "healthy" ]; then
              echo "Deploy OK"
              exit 0
            fi
            if [ "$status" = "unhealthy" ]; then
              echo "Container reported unhealthy"
              docker logs --tail 200 ${CONTAINER_NAME} || true
              exit 1
            fi
            sleep 5
          done
          echo "Timed out waiting for healthy"
          docker logs --tail 200 ${CONTAINER_NAME} || true
          exit 1
        '''
      }
    }

    stage('Cleanup dangling images') {
      steps {
        sh 'docker image prune -f || true'
      }
    }
  }

  post {
    success {
      echo "Deployed: https://www.burty.co.kr  (build #${env.BUILD_NUMBER})"
    }
    failure {
      sh '''
        echo "===== compose ps ====="
        docker compose ps || true
        echo "===== container logs ====="
        docker logs --tail 200 ${CONTAINER_NAME} || true
      '''
    }
  }
}
