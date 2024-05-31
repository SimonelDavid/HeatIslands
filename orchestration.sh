#!/bin/bash

HOST=3.73.146.56
PORT=22 

# Start timer
start_time=$(date +%s)

# Navigate to the terraform directory
cd terraform

# Log time for navigating to the directory
cd_time=$(date +%s)
echo "Time to navigate to the terraform directory: $((cd_time - start_time)) seconds"

# Initialize Terraform
terraform init

# Log time after terraform init
init_time=$(date +%s)
echo "Time for terraform init: $((init_time - cd_time)) seconds"

# Plan Terraform execution
terraform plan

# Log time after terraform plan
plan_time=$(date +%s)
echo "Time for terraform plan: $((plan_time - init_time)) seconds"

# Check the operating system and prompt for Terraform apply
case $(uname) in
"Darwin"|"Windows_NT")
    read -p "Do you want to apply this Terraform plan? (yes/no): " answer
    if [ "$answer" == "yes" ]; then
        terraform apply -auto-approve
        apply_time=$(date +%s)
        echo "Time for terraform apply: $((apply_time - plan_time)) seconds"
        
        # Execute Ansible playbook after Terraform apply
        while ! nc -z $HOST $PORT; do
            echo "Waiting for instance to become ready..."
            sleep 10
        done
        ready_time=$(date +%s)
        echo "Time for instance to become ready: $((ready_time - apply_time)) seconds"
        
        echo "Instance is up and running."
        ansible-playbook -i ../ansible/hosts ../ansible/deployment.yml --private-key=./heat-island.pem
        ansible_time=$(date +%s)
        echo "Time for ansible playbook: $((ansible_time - ready_time)) seconds"
    fi
    ;;
*)
    echo "Waiting for manual prompt to apply Terraform plan..."
    read -p "Do you want to apply this Terraform plan? (yes/no): " answer
    if [ "$answer" == "yes" ]; then
        terraform apply -auto-approve
        apply_time=$(date +%s)
        echo "Time for terraform apply: $((apply_time - plan_time)) seconds"
        
        # Execute Ansible playbook after Terraform apply
        while ! nc -z $HOST $PORT; do
            echo "Waiting for instance to become ready..."
            sleep 10
        done
        ready_time=$(date +%s)
        echo "Time for instance to become ready: $((ready_time - apply_time)) seconds"
        
        echo "Instance is up and running."
        ansible-playbook -i ../ansible/hosts ../ansible/deployment.yml --private-key=./heat-island.pem
        ansible_time=$(date +%s)
        echo "Time for ansible playbook: $((ansible_time - ready_time)) seconds"
    fi
    ;;
esac

# End timer and log total execution time
end_time=$(date +%s)
echo "Total execution time: $((end_time - start_time)) seconds"
