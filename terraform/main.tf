provider "aws" {
  region = "eu-central-1"  
}

resource "aws_security_group" "heat_island_sg" {
  name        = "HeatIslandSG"
  description = "Security group for HeatIsland instance"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["188.27.129.216/32", "46.97.169.92/32", "82.79.3.158/32"] # home internet ips
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "heat_island" {
  ami                    = "ami-042e6fdb154c830c5"  
  instance_type          = "t3a.large"
  key_name               = "heat-island"
  security_groups        = [aws_security_group.heat_island_sg.name]
  associate_public_ip_address = true

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  tags = {
    Name = "HeatIsland"
  }
}

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.heat_island.id
  allocation_id = "eipalloc-0a9d27bf8ebe8dc52"
}
