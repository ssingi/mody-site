// 보조 웹페이지 공통 (FR-16, 설계 9.5). 공개 키(publishable)와 URL만 쓴다.
window.MODY = {
  client: window.supabase.createClient(
    'https://dptwtwlobntujgbakybl.supabase.co',
    'sb_publishable_vrKpSB3HfkUyxwifbc_Qiw_n9zsSyBo',
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  ),
  params: new URLSearchParams(location.search),
  // Supabase 기본 메일 링크는 서버에서 확인을 마친 뒤 결과를 주소 #뒤(또는 ?뒤)에 붙여 이 페이지로 보낸다.
  // 토큰이 주소창·방문 기록에 남지 않도록 읽자마자 주소에서 지운다.
  takeAuthResult() {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const query = window.MODY.params; // 구조 분해로 꺼내 쓰므로 this 대신 전역을 쓴다
    const get = (k) => hash.get(k) || query.get(k);
    const result = {
      accessToken: hash.get('access_token'),
      refreshToken: hash.get('refresh_token'),
      type: get('type'),
      tokenHash: query.get('token_hash'),
      error: get('error_code') || get('error'),
      errorDescription: get('error_description'),
    };
    if (location.hash || result.error) history.replaceState(null, '', location.pathname);
    return result;
  },
  status(text, isError) {
    const el = document.getElementById('status');
    el.textContent = text;
    el.className = isError ? 'err' : '';
  },
  // Supabase 오류를 사용자 문장으로 바꾼다
  message(error) {
    const code = (error && (error.code || error.error)) || '';
    const text = (error && (error.message || error.errorDescription)) || '';
    if (code === 'otp_expired' || code === 'access_denied' || /expired|invalid/i.test(text)) {
      return '링크가 만료되었거나 이미 사용되었습니다. 앱에서 메일을 다시 요청해 주세요.';
    }
    if (code === 'same_password') return '이전과 다른 비밀번호를 입력해 주세요.';
    if (code === 'weak_password') return '비밀번호가 너무 약합니다. 8자 이상으로 입력해 주세요.';
    return '처리하지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.';
  },
};
