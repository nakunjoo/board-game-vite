# Cloud Storage 정적 웹사이트 배포 가이드

## 🎯 왜 Cloud Storage?

- ✅ **저렴** ($0.026/GB)
- ✅ **WebSocket 문제 없음** (백엔드와 분리)
- ✅ **CDN 연동 가능**
- ✅ **정적 사이트에 최적**

## 📋 배포 방법

### 1. React 앱 빌드

```bash
cd C:\git\projects\nkj\board-game\the-gang
npm run build
```

### 2. Cloud Storage 버킷 생성

```bash
# 버킷 이름 (전역 고유해야 함)
export BUCKET_NAME="the-gang-game"

# 버킷 생성 (us-central1)
gsutil mb -l us-central1 gs://$BUCKET_NAME

# 웹사이트 설정
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# 공개 액세스 설정
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

### 3. 빌드 파일 업로드

```bash
# dist 폴더 전체 업로드
gsutil -m rsync -r -d dist gs://$BUCKET_NAME

# 캐시 설정
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$BUCKET_NAME/**
```

### 4. 접속

```
http://the-gang-game.storage.googleapis.com/index.html
```

## 🌐 커스텀 도메인 (선택사항)

### Cloud Load Balancer 사용

1. **백엔드 버킷 생성**
   ```bash
   gcloud compute backend-buckets create the-gang-backend \
     --gcs-bucket-name=the-gang-game \
     --enable-cdn
   ```

2. **URL Map 생성**
   ```bash
   gcloud compute url-maps create the-gang-url-map \
     --default-backend-bucket=the-gang-backend
   ```

3. **HTTP 프록시 생성**
   ```bash
   gcloud compute target-http-proxies create the-gang-http-proxy \
     --url-map=the-gang-url-map
   ```

4. **IP 예약**
   ```bash
   gcloud compute addresses create the-gang-ip --global

   # IP 확인
   gcloud compute addresses describe the-gang-ip --global --format="get(address)"
   ```

5. **Forwarding Rule 생성**
   ```bash
   gcloud compute forwarding-rules create the-gang-http-rule \
     --address=the-gang-ip \
     --global \
     --target-http-proxy=the-gang-http-proxy \
     --ports=80
   ```

## 🔄 업데이트 배포

```bash
# 빌드
npm run build

# 업로드
gsutil -m rsync -r -d dist gs://$BUCKET_NAME
```

## 💰 비용

- **스토리지**: $0.020/GB/월 (100MB = $0.002)
- **네트워크**: $0.12/GB (1GB 무료)
- **CDN (선택)**: $0.08/GB

**예상 비용: $1-2/월**

## 📝 자동 배포 스크립트

### deploy-storage.sh

```bash
#!/bin/bash
set -e

BUCKET_NAME="the-gang-game"

echo "🔨 Building..."
npm run build

echo "📤 Uploading to Cloud Storage..."
gsutil -m rsync -r -d dist gs://$BUCKET_NAME

echo "⚙️ Setting cache headers..."
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "gs://$BUCKET_NAME/**.js"
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "gs://$BUCKET_NAME/**.css"
gsutil -m setmeta -h "Cache-Control:no-cache" "gs://$BUCKET_NAME/index.html"

echo "✅ Deployment complete!"
echo "🌐 URL: http://$BUCKET_NAME.storage.googleapis.com/index.html"
```

### deploy-storage.bat (Windows)

```bat
@echo off
set BUCKET_NAME=the-gang-game

echo Building...
call npm run build

echo Uploading...
gsutil -m rsync -r -d dist gs://%BUCKET_NAME%

echo Setting cache...
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "gs://%BUCKET_NAME%/**.js"
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "gs://%BUCKET_NAME%/**.css"
gsutil -m setmeta -h "Cache-Control:no-cache" "gs://%BUCKET_NAME%/index.html"

echo Done!
echo URL: http://%BUCKET_NAME%.storage.googleapis.com/index.html
```

## 🎯 WebSocket 연결

프론트엔드는 Cloud Storage에서 서빙되고, WebSocket은 기존 Compute Engine 서버로 연결:

```
프론트엔드: http://the-gang-game.storage.googleapis.com
WebSocket: ws://34.70.242.216:9030/ws
```

**문제없이 동작합니다!**

## 🔍 확인

```bash
# 버킷 내용 확인
gsutil ls gs://$BUCKET_NAME

# 접속 테스트
curl -I http://$BUCKET_NAME.storage.googleapis.com/index.html
```
