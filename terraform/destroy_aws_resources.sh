#!/bin/bash

terraform init
terraform destroy -target=aws_instance.heat_island
terraform destroy -target=aws_security_group.heat_island_sg