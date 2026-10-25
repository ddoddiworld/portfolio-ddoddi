# Changelog

버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다. 각 버전의 소스는 같은 이름의 git 태그에서 볼 수 있습니다.

```bash
git checkout v1.0.0        # 해당 버전 소스 보기
git checkout -b restore/v1 v1.0.0   # 그 버전으로 되돌릴 브랜치 만들기
```

## [Unreleased]

## [2.0.0-rc.1] - 2026-10-20
### Changed
- 성장 스토리 중심으로 사이트 구조 전면 재구성: Hero · About · Journey(2022→2026 타임라인) · Selected work(케이스 스터디 3건) · More work · Process · Contact · Archive
- 에이전시 톤 리디자인: 풀스크린 키비주얼 영상, 영문 대형 디스플레이 타이포(Archivo) + Pretendard, 흑백 밴드 교차 + 블루 포인트, 키워드 마키, 커스텀 커서, 스크롤 등장·카운터·진행선
- 모바일 · 태블릿 · PC 반응형, 풀스크린 모바일 메뉴, `prefers-reduced-motion` 대응
### Removed
- jQuery · AOS · bxslider 의존성 제거, 바닐라 JS로 교체
- 프로필의 생년월일 · MBTI · 전화번호 노출 제거
### Kept
- 2022 퍼블리셔 과정 수료작 6개는 Archive 섹션과 `mypage/` 폴더에 그대로 보존

## [1.0.0] - 2026-10-19
- 2022년 웹 퍼블리셔 과정 수료 시점의 포트폴리오 (HTML · CSS · jQuery · AOS)
- Profile · Portfolio(클론/창작 사이트 5개 + Comma App) · Skills · Contact
- Cloudflare Workers 정적 에셋 배포 설정 추가 (2026-10-19)
