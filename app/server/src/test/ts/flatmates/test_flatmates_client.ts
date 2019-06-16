import {FlatmatesClient} from "../../../main/ts/flatmates/flatmates_client";
import {Try} from "../../../../../common/src/main/ts/fp/try";

describe("FlatmatesClient", () => {
  test("parseSessionId reads set-cookie header to determine session id", () => {
    const cookie = "_session=Im5LUldpRHlBa0hkZFk3Sm43RkF3NWpZeCI%3D--1b6437fc7e771a64b5659c62af10874778ebe8a9; path=/; expires=Mon, 16 Sep 2019 03:24:50 -0000; secure, _flatmates_session=797cd4cd931067289667a116e6ce3f4d; domain=.flatmates.com.au; path=/; expires=Sun, 23 Jun 2019 03:24:50 -0000; secure; HttpOnly"

    // acquire private method reference
    let parseSessionId = (FlatmatesClient as any).parseSessionId;
    let sessionId: Try<string> = parseSessionId(cookie);

    expect(sessionId.get()).toBe("_flatmates_session=797cd4cd931067289667a116e6ce3f4d")
  });

  test("parseSessionId reads set-cookie header to determine session id", () => {
    const html = `
<html lang='en'>
  <meta name="csrf-token" content="ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==" />
</html>    
`;
    // acquire private method reference
    let parseSessionToken = (FlatmatesClient as any).parseSessionToken;
    let sessionToken: Try<string> = parseSessionToken(html);

    expect(sessionToken.get()).toBe("ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==")
  });
});
