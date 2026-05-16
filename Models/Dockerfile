FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 1337

CMD ["python", "-u", "app.py"]
