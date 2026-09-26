# Checking a criterion in the running app

This is rung 2 of the ladder. Use it for anything a person can see or click.

Read `app_start`, `app_url`, `app_ready_seconds`, and `browser_mcp` from
`.aidlc/config.yaml`. If `browser_mcp` is empty, stop here and go to rung 3.

`browser_mcp` is a list of candidates in order. Use the **first** one that is
connected in this session, and ignore the rest. Different editors connect
different browser servers, which is why there is more than one name. If none of
them is connected, stop here and go to rung 3.

## Start the app

1. Ask the running app first. Fetch `app_url` from the command line with a short
   timeout. If it answers, the server is already up. **Reuse it. Do not start a
   second one, and do not stop it when you finish** - somebody else owns it.
2. If nothing answers, run `app_start` in the background.
3. Poll `app_url` from the command line until it answers, or until
   `app_ready_seconds` has passed. Do not sleep in the foreground; loop on the
   condition instead.
4. If it never answers, print the last 30 lines of the server output, record the
   failure in the report, and drop to rung 3.

## Drive it

1. Ask the browser for its current tabs before anything else, so you know what the
   user already has open.
2. Open a **new** tab for `app_url`. Never reuse a tab the user was working in.
   Never reuse a tab id from an earlier run.
3. For each criterion, in the order of the acceptance criteria table:
   - Set up the Given. Prefer a URL query switch over clicking, when the app
     offers one: it is faster, and it cannot go wrong halfway.
   - Do the When. One action at a time.
   - Read the page and check the Then against what is really there.
   - Read the browser console. A clean check with a red console error is not a
     pass.
4. Close the tab you opened when you are done.
5. Stop the app only if step 1 showed it was not already running.

## Hard rules

- **Never click anything that can pop a browser confirm, alert, or prompt box.**
  A modal box freezes the whole browser connection, and nothing after it works.
  Delete buttons and "are you sure" flows are the usual culprits. If a criterion
  needs one, mark it `UNVERIFIED` and say why.
- Read what is on the page. Do not decide a check passed because the click did not
  throw an error.
- If the same browser action fails three times, stop. Record it as a failure with
  what you saw, and move to the next criterion. Do not keep retrying.
- Never change product code to make a check pass. Report the failure instead.
- Do not wander. Visit only `app_url` and the pages the criteria name.

## What to write down

For each criterion, one line naming the rung, the setup you used, and what you
actually saw:

```
| AC-03 | US-02 | FAIL | browser: opened ?initialLayout=compact, column order was id,ticker,side - expected ticker,id,side |
```

"Checked in the browser" with no detail is not a check. Name the thing you read
off the screen.
