FROM pytorch/pytorch:1.13.1-cuda11.6-cudnn8-runtime

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 libxcb-xinerama0 libxcb-cursor0 && \
    rm -rf /var/lib/apt/lists/* && \
    pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ && \
    pip config set global.trusted-host mirrors.aliyun.com && \
    pip config set global.timeout 600 && \
    pip config set global.retries 3 && \
    pip install --user --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "flask_api.py"]