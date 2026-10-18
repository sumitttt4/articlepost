import { test, expect } from "@playwright/test";

test("library filters, search, sorting, and layouts",async({page})=>{
 await page.goto("/articles");await expect(page.locator("tbody tr")).toHaveCount(6);
 await page.getByRole("tab",{name:/^Published/}).click();await expect(page.locator("tbody tr")).toHaveCount(2);
 await page.getByRole("tab",{name:/^All articles/}).click();await page.getByLabel("Search articles",{exact:true}).fill("slower");await expect(page.locator("tbody tr")).toHaveCount(1);
 await page.getByLabel("Search articles",{exact:true}).fill("");await page.getByLabel("Sort articles").click();await page.getByRole("option",{name:"Title",exact:true}).click();await expect(page.locator("tbody tr").first()).toContainText("A case for a slower internet");
 await page.getByRole("radio",{name:"Grid view"}).click();await expect(page.locator(".article-card")).toHaveCount(6);
});
test("new draft survives reload and exports Markdown",async({page})=>{
 await page.goto("/articles");await page.getByRole("button",{name:"New article",exact:true}).click();
 await page.getByLabel("Article title",{exact:true}).fill("A real draft, saved locally");await page.getByLabel("Article body in Markdown").fill("## A useful question?\n\nAn answer worth remembering.");
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem("polar-workspace-v1"))).toContain("A real draft, saved locally");
 await page.reload();await expect(page.getByLabel("Article title",{exact:true})).toHaveValue("A real draft, saved locally");
 const download=page.waitForEvent("download");await page.getByRole("button",{name:"Export",exact:true}).click();expect((await download).suggestedFilename()).toBe("a-real-draft-saved-locally.md");
});
test("paywall keeps paid text out of Medium and Notes",async({page})=>{
 await page.goto("/editor/quiet-work");await expect(page.getByLabel("Article body in Markdown")).toBeVisible();
 await page.getByLabel("Article body in Markdown").fill("A thoughtful free paragraph that people can read and share.\n\n---PAYWALL---\n\nTOP_SECRET_PAID_BODY");
 await page.getByRole("tab",{name:"Previews",exact:true}).click();await page.getByRole("radio",{name:"Medium",exact:true}).click();await expect(page.locator(".platform-preview")).not.toContainText("TOP_SECRET_PAID_BODY");await expect(page.locator(".platform-preview")).toContainText("Read the full essay");
 await page.getByRole("radio",{name:"Notes",exact:true}).click();await expect(page.locator(".notes-preview")).not.toContainText("TOP_SECRET_PAID_BODY");await expect(page.locator(".notes-preview>div")).toHaveCount(5);
});
test("paywall command inserts a rendered boundary",async({page})=>{
 await page.goto("/editor/slow-internet");await page.getByLabel("Article body in Markdown").fill("Free section\n\n/paywall\n\nPaid section");
 await expect(page.getByLabel("Article body in Markdown")).toHaveValue(/---PAYWALL---/);await page.getByRole("radio",{name:"Preview",exact:true}).click();await expect(page.locator(".paywall-divider")).toBeVisible();
});
test("Notes can be created, edited, and deleted",async({page})=>{
 await page.goto("/notes-queue");await page.getByRole("button",{name:"New note",exact:true}).click();await page.getByLabel("Note",{exact:true}).fill("A thoughtful new note.");await page.getByRole("button",{name:"Save note",exact:true}).click();await expect(page.locator(".note-card")).toHaveCount(4);
 const card=page.locator(".note-card").filter({hasText:"A thoughtful new note."});await card.getByRole("button",{name:/Edit/}).click();await page.getByLabel("Note",{exact:true}).fill("An even more thoughtful note.");await page.getByRole("button",{name:"Save note",exact:true}).click();await expect(page.locator(".note-card").last()).toContainText("An even more thoughtful note.");
 await page.locator(".note-card").last().getByRole("button",{name:/Edit/}).click();await page.getByRole("button",{name:"Delete note",exact:true}).click();await expect(page.locator(".note-card")).toHaveCount(3);
});
test("command menu supports keyboard navigation and Escape",async({page})=>{
 await page.goto("/articles");await page.keyboard.press("Control+k");await expect(page.getByRole("dialog")).toBeVisible();await page.getByLabel("Search articles and pages").fill("quiet");await page.getByRole("option",{name:/The quiet advantage/}).click();await expect(page).toHaveURL(/editor\/quiet-work/);await page.keyboard.press("Control+k");await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("Kumo date and time controls work inside the note dialog",async({page})=>{
 await page.goto("/notes-queue");
 await page.getByRole("button",{name:"New note",exact:true}).click();
 await page.getByLabel("Note",{exact:true}).fill("A note with a chosen time.");
 await page.getByRole("button",{name:"Planned time",exact:true}).click();
 await page.getByRole("button",{name:"Today",exact:true}).click();
 await page.getByRole("combobox",{name:"Hour",exact:true}).click();
 await page.getByRole("option",{name:"14",exact:true}).click();
 await page.getByRole("combobox",{name:"Minute",exact:true}).click();
 await page.getByRole("option",{name:"35",exact:true}).click();
 await expect(page.getByRole("button",{name:"Planned time",exact:true})).toContainText("2:35 PM");
 await page.getByRole("button",{name:"Done",exact:true}).click();
 await expect(page.getByRole("dialog",{name:"A little note from you."})).toBeVisible();
 await page.getByRole("button",{name:"Save note",exact:true}).click();
 await expect(page.locator(".note-card").last()).toContainText("A note with a chosen time.");
 await expect(page.locator('input[type="datetime-local"]')).toHaveCount(0);
});
test("unknown article and empty results have useful recovery",async({page})=>{
 await page.goto("/editor/not-a-real-draft");await expect(page.getByText("This draft isn’t in your workspace.")).toBeVisible();await page.getByRole("link",{name:"Back to articles"}).click();await page.getByLabel("Search articles",{exact:true}).fill("nothingmatchesxyz");await expect(page.getByText("No matching ideas. Yet.")).toBeVisible();await page.getByRole("button",{name:"Clear filters"}).click();await expect(page.locator("tbody tr")).toHaveCount(6);
});
test("screens render without horizontal page overflow",async({page})=>{
 for(const path of ["/articles","/notes-queue","/seo-graph","/connections","/inspiration","/editor/quiet-work"]){await page.goto(path);await expect(page.locator("h1, .title-input").first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test("mobile library and navigation work",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/articles");await expect(page.locator("tbody tr")).toHaveCount(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:"test-results/mobile-library.png",fullPage:true});
 await page.getByRole("button",{name:"Open navigation"}).click();await page.getByRole("dialog").getByRole("link",{name:"Platform connections",exact:true}).click();await expect(page).toHaveURL(/connections/);await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("desktop library visual capture",async({page})=>{
 await page.goto("/articles");await expect(page.locator("tbody tr")).toHaveCount(6);await page.screenshot({path:"test-results/desktop-library.png",fullPage:true});
});
test("cloud endpoints fail closed without credentials",async({request})=>{
 for(const path of ["/api/articles","/api/archive"]){const response=await request.get(path);expect(response.status()).toBe(503);expect(await response.json()).toHaveProperty("error");}
 const response=await request.post("/api/ai/adapt",{data:{title:"Test",rawMarkdown:"Free draft"}});expect(response.status()).toBe(503);
});
