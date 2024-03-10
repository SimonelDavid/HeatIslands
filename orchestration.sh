#!/bin/bash

HOST=3.73.146.56
PORT=22 

# Navigate to the terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan Terraform execution
terraform plan

# Check the operating system and prompt for Terraform apply
case $(uname) in
"Darwin"|"Windows_NT")
    read -p "Do you want to apply this Terraform plan? (yes/no): " answer
    if [ "$answer" == "yes" ]; then
        terraform apply -auto-approve
        # Execute Ansible playbook after Terraform apply
        while ! nc -z $HOST $PORT; do
            echo "Waiting for instance to become ready..."
            sleep 10
        done
        echo "Instance is up and running."
        ansible-playbook -i ../ansible/hosts ../ansible/deployment.yml --private-key=./heat_island.pem
    fi
    ;;
*)
    echo "Waiting for manual prompt to apply Terraform plan..."
    read -p "Do you want to apply this Terraform plan? (yes/no): " answer
    if [ "$answer" == "yes" ]; then
        terraform apply -auto-approve
        # Execute Ansible playbook after Terraform apply
        while ! nc -z $HOST $PORT; do
            echo "Waiting for instance to become ready..."
            sleep 10
        done
        echo "Instance is up and running."
        ansible-playbook -i ../ansible/hosts ../ansible/deployment.yml --private-key=./heat_island.pem
    fi
    ;;
esac
