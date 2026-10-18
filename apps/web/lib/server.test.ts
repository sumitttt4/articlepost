import { describe, expect, it } from "vitest";
import { HttpError } from "./errors";
describe("HTTP errors",()=>{it("preserves a public status and message",()=>{const error=new HttpError(413,"Too large");expect(error).toBeInstanceOf(Error);expect(error.status).toBe(413);expect(error.message).toBe("Too large");});});
