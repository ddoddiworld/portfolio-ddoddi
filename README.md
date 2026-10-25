# **Frontend Developer_장소영 💛**
> 사용자 경험(UX)을 연구하고 구현하는 것을 좋아하는 장소영입니다.</br>
</br>

## **My footprint**
Velog: https://velog.io/@ddoddiworld </br>
Github: https://github.com/ddoddiworld

</br>

## **Introduce**
저는 고객 요구에 맞는 사용자 경험(UX)을 연구하고 구현하는 데 관심이 많은 프론트엔드 개발자입니다.</br>
</br>
제가 만든 웹사이트를 이용한 고객들이 감사의 말을 전해 줄 때마다 큰 보람을 느꼈습니다.</br>
그 때부터 다른 사람들에게 행복을 선사하는 개발자가 되고 싶다는 꿈을 가지게 되었습니다.</br>
</br>
마크 주커버그의 명언, "뜨거운 열정보다 중요한 것은 지속적인 열정이다"를 모토로, 웹 퍼블리셔에서 개발자로 성장하기 위해</br> 
[벨로그](https://velog.io/@ddoddiworld)에 주 6회 TIL을 작성하며, 공부한 내용과 회고를 기록하고 있습니다.</br>
</br>
개발의 세계에 처음 발을 들이던 그때의 두려움과 설레임을 잊지 않고,</br>
끊임없는 성장을 추구하며 제 인생의 다음 장을 펼쳐보려 합니다!

## Guestbook

댓글은 Cloudflare Durable Objects의 SQLite 저장소에 저장됩니다. 배포 시 `comments-v1` 마이그레이션이 저장소를 생성합니다. 방문자 비밀번호는 개별 salt와 PBKDF2-SHA256(100,000회)으로 해시하며 조회 API에 포함하지 않습니다.

관리자 전체 삭제를 활성화하려면 Cloudflare의 `portfolio-ddoddi` Worker → Settings → Variables and Secrets에서 **Secret** 형식으로 `ADMIN_PASSWORD`를 설정하세요(다른 곳에서 쓰지 않는 16자 이상의 비밀번호 권장). 값은 저장소나 프론트엔드에 넣지 않습니다. 미설정 시 방문자 댓글 작성·본인 삭제는 동작하고 관리자 삭제는 거절됩니다. 삭제 창에서 ‘관리자 비밀번호로 삭제’를 선택하면 됩니다.

로컬 실행: `npx wrangler@4.92.0 dev`. 로컬 관리자 테스트는 무시되는 `.dev.vars`에 테스트용 `ADMIN_PASSWORD`를 설정합니다.

검증: Node.js 22에서 `node --test tests/comments.test.mjs`.
