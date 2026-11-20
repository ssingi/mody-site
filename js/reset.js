// 비밀번호 재설정 (FR-02, FR-16).
// 기본 메일 링크: Supabase가 확인을 마치고 재설정용 임시 세션(#access_token, type=recovery)을 붙여 보낸다.
// token_hash 링크(사용자 지정 메일 템플릿): [변경하기]를 누를 때 토큰을 쓴다.
const { client, status, message, takeAuthResult } = window.MODY;
const form = document.getElementById('form');
const button = document.getElementById('go');
const r = takeAuthResult();

const usable = !r.error && ((r.accessToken && r.refreshToken) || r.tokenHash);
if (!usable) {
  form.hidden = true;
  status(r.error
    ? message({ error: r.error, errorDescription: r.errorDescription })
    : '링크가 올바르지 않습니다. 앱에서 재설정 메일을 다시 요청해 주세요.', true);
}

async function startSession() {
  if (r.accessToken) {
    return client.auth.setSession({ access_token: r.accessToken, refresh_token: r.refreshToken });
  }
  return client.auth.verifyOtp({ token_hash: r.tokenHash, type: 'recovery' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pw = form.password.value;
  if ([...pw].length < 8) return status('비밀번호는 8자 이상이어야 합니다.', true);
  if (pw !== form.password2.value) return status('두 비밀번호가 다릅니다.', true);

  button.disabled = true;
  status('변경 중…');
  const { error: sErr } = await startSession();
  if (sErr) {
    status(message(sErr), true);
    button.disabled = false;
    return;
  }
  const { error } = await client.auth.updateUser({ password: pw });
  await client.auth.signOut({ scope: 'local' });
  if (error) {
    // 임시 세션은 이미 닫았으므로 같은 링크로 다시 시도할 수 없다
    status(message(error) + ' 앱에서 재설정 메일을 다시 요청해 주세요.', true);
    return;
  }
  form.hidden = true;
  status('비밀번호가 변경되었습니다. 앱으로 돌아가 새 비밀번호로 로그인하세요.');
});
