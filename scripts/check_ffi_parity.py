#!/usr/bin/env python3
"""Check that every C ABI query/sync symbol is either bound or allowlisted.

Generic guard: it reads the generated header and the SDK binding source, so
it does not depend on a particular deployment, machine or consumer.
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEADER = Path(os.environ.get("HAKODB_HEADER", ROOT / "native" / "hakodb.h"))
BINDINGS = Path(os.environ.get("HAKODB_BINDINGS", ROOT / "src" / "native.ts"))

# Symbols intentionally not exposed by the high-level SDK.
# - Unix-only socket transport (declarations exist on every target by design).
# - Superseded graph path variants; the *_v4 / *_v3 successors are bound.
ALLOW_UNBOUND = {
    "hk_socket_sync_dial",
    "hk_socket_sync_free",
    "hk_socket_sync_new",
    "hk_socket_sync_serve",
    "hk_socket_sync_status",
    "hk_engine_find_paths_v2",
    "hk_engine_find_paths_v3",
    "hk_engine_find_simple_paths",
    "hk_engine_find_simple_paths_v2",
}


def header_functions(path: Path) -> set[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    return set(re.findall(r"\b(hk_[a-z0-9_]+)\s*\(", text))


def bound_symbols(path: Path) -> set[str]:
    text = path.read_text(encoding="utf-8")
    found = set(re.findall(r"\b(hk_[a-z0-9_]+)\b", text))
    # Partial identifier from a source comment, not a function.
    return found - {"hk_socket_sync_"}


def backend_sections(text: str):
    bun = text[text.index("async function createBunBindings"):text.index("async function createNodeBindings")]
    node = text[text.index("async function createNodeBindings"):text.index("export async function loadNativeBindings")]
    return bun, node


def backend_missing(text: str) -> dict:
    bun, node = backend_sections(text)
    bun_declared = set(re.findall(r"\b(hk_[a-z0-9_]+):\s*\{", bun))
    bun_used = set(re.findall(r"symbols\.(hk_[a-z0-9_]+)", bun))
    node_declared = set(re.findall(r"\b(hk_[a-z0-9_]+):\s*lib\.func", node))
    node_declared |= set(re.findall(r"lib\.func\('[^']*\b(hk_[a-z0-9_]+)\(", node))
    node_used = set(re.findall(r"\bfn\.(hk_[a-z0-9_]+)", node))
    return {
        "bun": sorted(bun_used - bun_declared),
        "node": sorted(node_used - node_declared),
    }


def main() -> int:
    if not HEADER.exists() or not BINDINGS.exists():
        print(f"missing input: header={HEADER} bindings={BINDINGS}", file=sys.stderr)
        return 2
    text = BINDINGS.read_text(encoding="utf-8")
    header = header_functions(HEADER)
    bound = bound_symbols(BINDINGS)
    missing = sorted(header - bound - ALLOW_UNBOUND)
    stale = sorted(bound - header)
    backend = backend_missing(text)
    print(f"header functions: {len(header)}, bound symbols: {len(bound)}")
    failed = False
    if missing:
        print("unbound and not allowlisted:", ", ".join(missing), file=sys.stderr)
        failed = True
    if stale:
        print("bound symbols absent from header:", ", ".join(stale), file=sys.stderr)
        failed = True
    for name, symbols in backend.items():
        if symbols:
            print(f"{name} wrappers using undeclared symbols:", ", ".join(symbols), file=sys.stderr)
            failed = True
    if failed:
        return 1
    print("FFI binding parity: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
