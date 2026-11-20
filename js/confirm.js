// 이메일 인증 결과 (FR-16).
// 기본 메일 링크: Supabase가 링크를 누른 순간 인증을 끝내고 결과를 붙여 보낸다 → 결과만 보여준다.
// token_hash 링크(사용자 지정 메일 템플릿): 버튼을 눌렀을 때만 토큰을 쓴다 (메일 스캐너가 미리 소진하지 않게).
const { client, status, message, takeAuthResult } = window.MODY;
const button = document.getElementById('go');
const lead = document.getElementById('lead');
const r = takeAuthResult();

function done() {
  button.hidden = true;
  lead.hidden = true;
  status('인증이 완료되었습니다. 앱으로 돌아가 로그인하세요.');
}

if (r.error) {
  button.hidden = true;
  status(message({ error: r.error, errorDescription: r.errorDescription }), true);
} else if (r.accessToken) {
  // 이 페이지는 로그인 상태를 저장하지 않는다 (persistSession: false). 받은 토큰은 쓰지 않고 버린다.
  done();
} else if (r.tokenHash) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    status('확인 중…');
    const { error } = await client.auth.verifyOtp({ token_hash: r.tokenHash, type: r.type || 'email' });
    if (error) {
      status(message(error), true);
      button.disabled = false;
      return;
    }
    await client.auth.signOut({ scope: 'local' });
    done();
  });
} else {
  button.hidden = true;
  status('링크가 올바르지 않습니다. 메일의 링크를 다시 눌러 주세요.', true);
}
