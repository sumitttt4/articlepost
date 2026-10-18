import { describe, expect, it } from "vitest";
import { validateFeedUrl } from "./rss";
describe("RSS network boundary",()=>{
 it("allows public HTTPS publication feeds",()=>{expect(validateFeedUrl("https://writer.substack.com/feed").hostname).toBe("writer.substack.com");expect(validateFeedUrl("https://medium.com/feed/@writer").hostname).toBe("medium.com");});
 it.each(["http://writer.substack.com/feed","https://localhost/feed","https://127.0.0.1/feed","https://substack.com.evil.test/feed","https://writer.substack.com:8443/feed","https://user:pass@writer.substack.com/feed","file:///etc/passwd","https://evilmedium.com/feed"])("rejects untrusted feed %s",url=>{expect(()=>validateFeedUrl(url)).toThrow();});
});
