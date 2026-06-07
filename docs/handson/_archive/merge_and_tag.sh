#!/usr/bin/env bash
# merge_and_tag.sh — Merge feature/sos-dsl + tag + push for SoS-DSL v0.1
#
# Run on macOS Terminal (or any host with GitHub credentials).
# Submodule (raspimouse-unity) is processed before its parent.
#
# Usage:
#   ./merge_and_tag.sh                          # Full run (merge + tag + push)
#   NO_PUSH=1 ./merge_and_tag.sh                # Skip the push step (rehearsal)
#   ONLY=cadl-explorer ./merge_and_tag.sh       # Just one repo
#   PROG=/path/to/repos ./merge_and_tag.sh      # Override repo root
#
# The script is idempotent **as long as no tag has been pushed yet** — if a tag
# exists locally or remotely, it will fail loudly rather than overwrite.
#
# To recover from a failure mid-run:
#   * Local merge problem  -> git merge --abort        (in the affected repo)
#   * Local tag created    -> git tag -d <tag>
#   * Pushed to remote     -> see the roll-back guide at the end of MERGE_AND_TAG.md

set -euo pipefail

PROG="${PROG:-$HOME/program}"
NO_PUSH="${NO_PUSH:-0}"
ONLY="${ONLY:-}"

# ── helpers ─────────────────────────────────────────────────────────
say()  { printf '\n\033[1;36m== %s ==\033[0m\n' "$*"; }
ok()   { printf '   \033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '   \033[1;33m!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

# ── pre-flight ──────────────────────────────────────────────────────
[[ -d "$PROG" ]] || die "PROG not found: $PROG"
command -v git >/dev/null 2>&1 || die "git not found in PATH"

# Check git is configured for commits (will be needed for merge commit)
if ! git config --global user.email >/dev/null 2>&1; then
    if ! git config --global user.name >/dev/null 2>&1; then
        warn "git global user.{name,email} not set. Merge commits may fail."
        warn "  Suggested: git config --global user.name '...' && git config --global user.email '...'"
    fi
fi

# ── per-repo processor ──────────────────────────────────────────────
# Args: <repo-relative-path> <default-branch> <feature-branch> <tag>
#       <merge_message_var_name> <tag_message_var_name>
merge_and_tag() {
    local repo="$1" branch="$2" feature="$3" tag="$4"
    local merge_msg="$5" tag_msg="$6"

    if [[ -n "$ONLY" && "$ONLY" != "$repo" && "$ONLY" != "$(basename "$repo")" ]]; then
        return 0
    fi

    say "$repo  →  $branch + $tag"
    cd "$PROG/$repo"

    # Sanity
    if [[ ! -e .git ]]; then
        die "  Not a git working tree: $PROG/$repo"
    fi
    if ! git rev-parse --verify --quiet "$feature" >/dev/null; then
        die "  Branch '$feature' not found in $repo"
    fi
    if git rev-parse --verify --quiet "refs/tags/$tag" >/dev/null; then
        die "  Tag '$tag' already exists locally. Delete it first: cd $repo && git tag -d $tag"
    fi
    # Working tree must be clean before checkout
    if ! git diff --quiet || ! git diff --cached --quiet; then
        die "  Working tree is dirty in $repo. Commit or stash before running this script."
    fi

    # Switch to default branch
    printf '   switching to %s ...\n' "$branch"
    git checkout "$branch"
    ok "on $branch"

    # Merge
    printf '   merging %s into %s ...\n' "$feature" "$branch"
    if git merge-base --is-ancestor "$feature" HEAD 2>/dev/null; then
        warn "$feature already merged into $branch; will create a no-op --no-ff merge commit anyway"
    fi
    git merge --no-ff "$feature" -m "$merge_msg"
    ok "merged"

    # Tag
    printf '   tagging %s ...\n' "$tag"
    git tag -a "$tag" -m "$tag_msg"
    ok "tagged $tag"

    # Push
    if [[ "$NO_PUSH" -eq 0 ]]; then
        printf '   pushing %s ...\n' "$branch"
        git push origin "$branch"
        ok "pushed $branch"

        printf '   pushing %s ...\n' "$tag"
        git push origin "$tag"
        ok "pushed $tag"
    else
        warn "NO_PUSH=1 — skipping push for this repo"
    fi

    printf '   final HEAD: %s\n' "$(git log --oneline -1)"
}

# ── messages ────────────────────────────────────────────────────────
# (kept short here to avoid drowning the runbook; the long-form
# release notes live in docs/handson/_archive/MERGE_AND_TAG.md)

CADL_SPEC_MERGE_MSG="Merge branch 'feature/sos-dsl' into main — SoS-DSL extension v0.1

Brings in: Appendix E (SoS Contract DSL Extension), docs/handson/
(main textbook, exercises booklet, academic background, PBL course
design — bilingual EN/JA + index), Hands-on entries in the navbar
/ footer / landing page, and docs/handson/_archive/ with dev drafts."

CADL_SPEC_TAG_MSG="v0.1.0 — SoS-DSL Contract DSL Extension (Appendix E) + Hands-on course

First tagged release of cadl-spec.

Highlights:
- Appendix E: SoS-DSL Contract DSL Extension v0.1-sos-ext
- Hands-on course materials (bilingual EN/JA): main textbook,
  exercises booklet (5-session PBL series), academic background
  (ISO 21839/40/41 + Maier), instructor course-design document.
- Docusaurus integration: navbar entry, footer link, landing-page CTA."

CADL_REPO_MERGE_MSG="Merge branch 'feature/sos-dsl' into master — SoS-DSL v0.1

- AST + parser support for the SoS-DSL Appendix-E body keys
  lifecycle: and monitors: (backward compatible).
- Sim-IR carries lifecycle and monitors.
- New codegen target unity-csharp emits a self-contained C# tree
  (Runtime/ + Generated/) that mirrors the Python runtime semantics.
- examples/sos_dsl_robot_delivery.cadl as the running example.
- scripts/sos_dsl_handson_e2e.sh: one-command pipeline.
- README has a new Hands-on section (EN + JA)."

CADL_REPO_TAG_MSG="v0.3.0 — SoS-DSL Contract DSL Extension support

- Parser: lifecycle: and monitors: body keys on contracts (Appendix
  E v0.1-sos-ext), with normalisation. Backward compatible.
- Sim-IR: LifecycleSpecIR / LifecycleTransitionSpec / MonitorSpecIR.
- Codegen: new unity-csharp target.
- Example: examples/sos_dsl_robot_delivery.cadl.
- E2E script: scripts/sos_dsl_handson_e2e.sh.
- 36 new tests (parser 10 + IR 7 + codegen 19 + structural lint 10)
  on top of the existing 403 — all pass."

CADL_EXPLORER_MERGE_MSG="Merge branch 'feature/sos-dsl' into main — Lifecycle View

- New Streamlit page 'SoS_DSL_Lifecycle' that visualises the
  per-instance contract lifecycle introduced by Appendix E.
- Dependency-free DOT renderer in cadl_sim/sos_dsl/lifecycle_view.py.
- Bundled IR sample under cadl_sim/sos_dsl/examples/.
- 11 tests for view extraction, DOT invariants, monitors summary."

CADL_EXPLORER_TAG_MSG="v0.1.0 — first tagged release with SoS-DSL Lifecycle View

Adds a Streamlit multipage page that consumes a CADL Sim-IR JSON
document and renders the per-instance contract lifecycle as a
state-machine diagram. Used by the SoS-DSL hands-on (Step 4)."

UNITY_MERGE_MSG="Merge branch 'feature/sos-dsl' into main — SoS-DSL contract runtime

- Generated C# tree under Assets/Scripts/SoSDsl/ (Runtime/ +
  Generated/) emitted by 'cadl codegen --target unity-csharp'.
- Hand-written Demo/ harness:
    DeliveryContractDemo (3 scripted scenarios)
    ContractRuntimeHost (singleton MonoBehaviour)
    PilotContractBridge (RequireComponent(Pilot_CSoS), translates
       state changes into contract events).
- 1-line non-invasive change to Pilot_CSoS.cs: a public
  HasActiveDelivery accessor for the Bridge to observe."

UNITY_TAG_MSG="v4.5 — SoS-DSL contract runtime + Pilot bridge

Generated C# (Runtime + Generated) and a minimal Demo harness
that drives one DeliverySlaContract instance per active delivery
without modifying Pilot_CSoS at runtime. Console output mirrors
the Python reference runtime (cadl/runtime/) one-to-one."

RASPIMOUSE_MERGE_MSG="Merge branch 'feature/sos-dsl' into main — Python contract runtime + bump unity submodule

- Python reference runtime under cadl/runtime/: stdlib-only
  ContractRuntime + StateMachineEngine + TimerService +
  MonitorEngine + a small predicate evaluator.
- multi_robot_demo.py: 5-robot scenario with 5 distinct outcomes
  (Completed / 3 kinds of Violated / stays-Proposed).
- 24 tests (engine 14 + multi-robot 10), all pass.
- Submodule unity/ bumped to its v4.5 tag."

RASPIMOUSE_TAG_MSG="v4.11 — SoS-DSL contract runtime + unity submodule v4.5

Python reference runtime that consumes a CADL Sim-IR JSON document
and drives one DeliverySlaContract instance per delivery request,
emitting an NDJSON event log. Combined with the unity submodule
v4.5, the entire SoS-DSL pipeline (CADL → IR → Unity / Python
runtime) runs end-to-end."

# ── pre-step: discard the cadl-spec sandbox-rescue commit if present ──
# During the prep phase a single commit (9db0052, "fix(docs): include
# handson nav + landing-page changes that were dropped by index.lock")
# was made directly on cadl-spec/main while the cowork sandbox was
# fighting with the host's git lock. The same content is already
# present on feature/sos-dsl (because we re-saved it there), so the
# rescue commit on main is redundant. We drop it before the merge.
if [[ -z "$ONLY" || "$ONLY" == "cadl-spec" ]]; then
    cd "$PROG/cadl-spec"
    if git log --oneline -1 main 2>/dev/null | grep -q "include handson nav + landing-page changes that were dropped"; then
        say "cadl-spec: discarding sandbox-rescue commit on main"
        git checkout main
        git reset --hard origin/main
        ok "main reset to origin/main"
    fi
fi

# ── execute (order matters: submodule before its parent) ───────────
say "SoS-DSL v0.1 — merge & tag run starting"
echo "  PROG    : $PROG"
echo "  NO_PUSH : $NO_PUSH"
echo "  ONLY    : ${ONLY:-(all)}"

merge_and_tag "cadl-spec"     main   feature/sos-dsl v0.1.0  "$CADL_SPEC_MERGE_MSG"     "$CADL_SPEC_TAG_MSG"
merge_and_tag "cadl_repo"     master feature/sos-dsl v0.3.0  "$CADL_REPO_MERGE_MSG"     "$CADL_REPO_TAG_MSG"
merge_and_tag "cadl-explorer" main   feature/sos-dsl v0.1.0  "$CADL_EXPLORER_MERGE_MSG" "$CADL_EXPLORER_TAG_MSG"

# Submodule first
merge_and_tag "raspimouse-swarm-simulator/unity" main feature/sos-dsl v4.5 \
              "$UNITY_MERGE_MSG" "$UNITY_TAG_MSG"

# Then parent — parent's main may need to record the new submodule SHA
merge_and_tag "raspimouse-swarm-simulator" main feature/sos-dsl v4.11 \
              "$RASPIMOUSE_MERGE_MSG" "$RASPIMOUSE_TAG_MSG"

# ── done ────────────────────────────────────────────────────────────
say "ALL DONE"
cat <<EOF
Result summary:

  Repository                          Branch    Tag
  ─────────────────────────────────── ───────── ─────
  cadl-spec                           main      v0.1.0
  cadl_repo                           master    v0.3.0
  cadl-explorer                       main      v0.1.0
  raspimouse-swarm-simulator/unity    main      v4.5
  raspimouse-swarm-simulator          main      v4.11

EOF

if [[ "$NO_PUSH" -eq 0 ]]; then
    echo "All branches and tags pushed to origin. Open the GitHub Releases pages"
    echo "to verify the tags rendered correctly."
else
    echo "NO_PUSH=1 was set — nothing was pushed. To finish:"
    echo "  for r in cadl-spec cadl_repo cadl-explorer raspimouse-swarm-simulator/unity raspimouse-swarm-simulator; do"
    echo "    cd \$PROG/\$r && git push origin HEAD && git push origin --tags"
    echo "  done"
fi
