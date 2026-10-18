import { describe, expect, it } from "vitest";
import { PAYWALL, initialArticles, safeUrl, seoChecks, seoScore, slugify, wordCount } from "./content";
import { adaptInput, adaptLocally, freeSection } from "./adapt";
describe("editorial helpers",()=>{
 it("counts empty and whitespace-only documents correctly",()=>{expect(wordCount("")).toBe(0);expect(wordCount(" \n \t ")).toBe(0);expect(wordCount("Hello thoughtful world")).toBe(3);});
 it("creates clean slugs including accented input",()=>{expect(slugify("Café: A Slower Internet!")).toBe("cafe-a-slower-internet");});
 it("rejects unsafe canonical URLs",()=>{expect(safeUrl("javascript:alert(1)")).toBe("");expect(safeUrl("data:text/html,bad")).toBe("");expect(safeUrl("https://example.com/post")).toBe("https://example.com/post");});
 it("does not treat an empty keyword as a passing check",()=>{expect(seoChecks({...initialArticles[0],keyword:""})[1].passed).toBe(false);});
 it("scores are bounded and computed, not hardcoded",()=>{for(const a of initialArticles){expect(seoScore(a)).toBeGreaterThanOrEqual(0);expect(seoScore(a)).toBeLessThanOrEqual(100);}});
});
describe("paywall safety",()=>{
 const input={title:"A useful article about attention",rawMarkdown:`A free introduction worth reading.\n\n${PAYWALL}\n\nSECRET_PAID_CONTENT`,targetKeyword:"attention",canonicalUrl:"https://example.com/full",archiveLinks:[]};
 it("never includes paid content in Medium or Notes extracts",()=>{const result=adaptLocally(input);expect(result.mediumMarkdown).not.toContain("SECRET_PAID_CONTENT");expect(result.substackNotes.join(" ")).not.toContain("SECRET_PAID_CONTENT");expect(result.mediumMarkdown).toContain("https://example.com/full");expect(result.substackNotes).toHaveLength(5);expect(result.mediumTags).toHaveLength(5);});
 it("handles paywall index zero, not as a falsy missing index",()=>{expect(freeSection({rawMarkdown:"all paid",paywallIndex:0})).toEqual({markdown:"",hasPaywall:true});});
 it("uses the earliest boundary if index and marker both exist",()=>{expect(freeSection({...input,paywallIndex:1}).markdown).toBe("A");});
 it("does not invent a canonical URL when none is set",()=>{const result=adaptLocally({...input,canonicalUrl:""});expect(result.mediumMarkdown).toContain("Add your original article URL");expect(result.mediumMarkdown).not.toContain("](http");});
 it("rejects out-of-bounds paywall indexes and unsafe canonicals",()=>{expect(adaptInput.safeParse({...input,paywallIndex:10000}).success).toBe(false);expect(adaptInput.safeParse({...input,canonicalUrl:"javascript:alert(1)"}).success).toBe(false);});
 it("preserves the full document when no paywall exists",()=>{expect(freeSection({rawMarkdown:"Everything is free."})).toEqual({markdown:"Everything is free.",hasPaywall:false});});
});
