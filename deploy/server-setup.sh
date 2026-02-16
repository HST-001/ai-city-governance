#!/bin/bash

# AI城市治理系统 - 云服务器部署脚本
# 适用于 Ubuntu 20.04/22.04

set -e

echo "========================================="
echo "  AI城市治理系统 - 云服务器部署脚本"
echo "========================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo "请使用root用户运行此脚本"
    exit 1
fi

# 更新系统
echo "正在更新系统..."
apt update && apt upgrade -y

# 安装必要的工具
echo "正在安装必要的工具..."
apt install -y curl wget git unzip

# 安装Docker
echo "正在安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo "Docker安装完成"
else
    echo "Docker已安装"
fi

# 安装Docker Compose
echo "正在安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose安装完成"
else
    echo "Docker Compose已安装"
fi

# 配置防火墙
echo "正在配置防火墙..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
    echo "防火墙配置完成"
fi

# 创建项目目录
echo "正在创建项目目录..."
mkdir -p /opt/ai-city-governance
cd /opt/ai-city-governance

echo "========================================="
echo "  部署准备完成！"
echo "========================================="
echo ""
echo "下一步操作："
echo "1. 将项目文件上传到 /opt/ai-city-governance 目录"
echo "2. 运行部署命令: cd /opt/ai-city-governance && docker-compose up -d"
echo "3. 访问系统: http://服务器IP"
echo ""
echo "注意事项："
echo "- 确保云服务器安全组已开放80端口"
echo "- 建议配置域名和SSL证书"
echo "- 定期备份数据库"
echo "========================================="