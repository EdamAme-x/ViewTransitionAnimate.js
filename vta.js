function onVtaReload() {
   document.head.innerHTML += `
    <style>
        .vta-route-announcer {
            position: absolute;
            left: 0;
            top: 0;
            clip: rect(0 0 0 0);
            clip-path: inset(50%);
            overflow: hidden;
            white-space: nowrap;
            width: 1px;
            height: 1px
        }
    </style>
    `;
}

const $ = (t) =>
    history.state &&
    history.replaceState(
      {
        ...history.state,
        ...t,
      },
      ""
    ),
  g = !!document.startViewTransition,
  E = () => true,
  S = (t) => location.pathname === t.pathname && location.search === t.search,
  k = (t) => document.dispatchEvent(new Event(t)),
  x = () => k("on-vta-load"),
  H = () => {
    let t = document.createElement("div");
    t.setAttribute("aria-live", "assertive"),
      t.setAttribute("aria-atomic", "true"),
      (t.className = "vta-route-announcer"),
      document.body.append(t),
      setTimeout(() => {
        let e =
          document.title ||
          document.querySelector("h1")?.textContent ||
          location.pathname;
        t.textContent = e;
        onVtaReload()
      }, 60);
  },
  d = "data-vta-transition-persist";
let T,
  y = 0;
history.state
  ? ((y = history.state.index),
    scrollTo({
      left: history.state.scrollX,
      top: history.state.scrollY,
    }))
  : E() &&
    history.replaceState(
      {
        index: y,
        scrollX,
        scrollY,
        intraPage: !1,
      },
      ""
    );
const M = (t, e) => {
  let r = !1,
    n = !1;
  return (...i) => {
    if (r) {
      n = !0;
      return;
    }
    t(...i),
      (r = !0),
      setTimeout(() => {
        n && ((n = !1), t(...i)), (r = !1);
      }, e);
  };
};
async function R(t) {
  try {
    const e = await fetch(t),
      r = e.headers.get("content-type")?.replace(/;.*$/, "");
    return r !== "text/html" && r !== "application/xhtml+xml"
      ? null
      : {
          html: await e.text(),
          redirected: e.redirected ? e.url : void 0,
          mediaType: r,
        };
  } catch {
    return null;
  }
}
function P() {
  return "animate";
}
function F() {
  let t = Promise.resolve();
  for (const e of Array.from(document.scripts)) {
    if (e.dataset.vtaExec === "") continue;
    const r = document.createElement("script");
    r.innerHTML = e.innerHTML;
    for (const n of e.attributes) {
      if (n.name === "src") {
        const i = new Promise((c) => {
          r.onload = c;
        });
        t = t.then(() => i);
      }
      r.setAttribute(n.name, n.value);
    }
    (r.dataset.vtaExec = ""), e.replaceWith(r);
  }
  return t;
}
function I(t) {
  const e = t.effect;
  return !e || !(e instanceof KeyframeEffect) || !e.target
    ? !1
    : window.getComputedStyle(e.target, e.pseudoElement)
        .animationIterationCount === "infinite";
}
const L = (t, e, r) => {
  const n = !S(t);
  let i = !1;
  t.href !== location.href &&
    (e
      ? history.replaceState(
          {
            ...history.state,
          },
          "",
          t.href
        )
      : (history.replaceState(
          {
            ...history.state,
            intraPage: r,
          },
          ""
        ),
        history.pushState(
          {
            index: ++y,
            scrollX: 0,
            scrollY: 0,
          },
          "",
          t.href
        )),
    n &&
      (scrollTo({
        left: 0,
        top: 0,
        behavior: "instant",
      }),
      (i = !0))),
    t.hash
      ? (location.href = t.href)
      : i ||
        scrollTo({
          left: 0,
          top: 0,
          behavior: "instant",
        });
};
function X(t) {
  const e = [];
  for (const r of t.querySelectorAll("head link[rel=stylesheet]"))
    if (
      !document.querySelector(
        `[${d}="${r.getAttribute(
          d
        )}"], link[rel=stylesheet][href="${r.getAttribute("href")}"]`
      )
    ) {
      const n = document.createElement("link");
      n.setAttribute("rel", "preload"),
        n.setAttribute("as", "style"),
        n.setAttribute("href", r.getAttribute("href")),
        e.push(
          new Promise((i) => {
            ["load", "error"].forEach((c) => n.addEventListener(c, i)),
              document.head.append(n);
          })
        );
    }
  return e;
}
async function w(t, e, r, n, i) {
  const c = (o) => {
      const l = o.getAttribute(d),
        f = l && t.head.querySelector(`[${d}="${l}"]`);
      if (f) return f;
      if (o.matches("link[rel=stylesheet]")) {
        const u = o.getAttribute("href");
        return t.head.querySelector(`link[rel=stylesheet][href="${u}"]`);
      }
      return null;
    },
    h = () => {
      const o = document.activeElement;
      if (o?.closest(`[${d}]`)) {
        if (o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement) {
          const l = o.selectionStart,
            f = o.selectionEnd;
          return {
            activeElement: o,
            start: l,
            end: f,
          };
        }
        return {
          activeElement: o,
        };
      } else
        return {
          activeElement: null,
        };
    },
    m = ({ activeElement: o, start: l, end: f }) => {
      o &&
        (o.focus(),
        (o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement) &&
          ((o.selectionStart = l), (o.selectionEnd = f)));
    },
    p = () => {
      const o = document.documentElement,
        l = [...o.attributes].filter(
          ({ name: s }) => (o.removeAttribute(s), s.startsWith("data-vta-"))
        );
      [...t.documentElement.attributes, ...l].forEach(({ name: s, value: a }) =>
        o.setAttribute(s, a)
      );
      for (const s of document.scripts)
        for (const a of t.scripts)
          if (
            (!s.src && s.textContent === a.textContent) ||
            (s.src && s.type === a.type && s.src === a.src)
          ) {
            a.dataset.vtaExec = "";
            break;
          }
      for (const s of Array.from(document.head.children)) {
        const a = c(s);
        a ? a.remove() : s.remove();
      }
      document.head.append(...t.head.children);
      const f = document.body,
        u = h();
      document.body.replaceWith(t.body);
      for (const s of f.querySelectorAll(`[${d}]`)) {
        const a = s.getAttribute(d),
          A = document.querySelector(`[${d}="${a}"]`);
        A && A.replaceWith(s);
      }
      m(u),
        n ? scrollTo(n.scrollX, n.scrollY) : L(e, r.history === "replace", !1),
        k("after-vta-swap");
    },
    b = X(t);
  if ((b.length && (await Promise.all(b)), i === "animate")) {
    const o = document.getAnimations();
    document.documentElement.dataset.vtaTransitionFallback = "old";
    const l = document.getAnimations().filter((u) => !o.includes(u) && !I(u));
    await Promise.all(l.map((u) => u.finished)),
      p(),
      (document.documentElement.dataset.vtaTransitionFallback = "new");
  } else p();
}
async function q(t, e, r, n) {
  let i;
  const c = e.href,
    h = await R(c);
  if (h === null) {
    location.href = c;
    return;
  }
  h.redirected && (e = new URL(h.redirected)), (T ??= new DOMParser());
  const m = T.parseFromString(h.html, h.mediaType);
  if ((m.querySelectorAll("noscript").forEach((p) => p.remove()), false)) {
    location.href = c;
    return;
  }
  n ||
    history.replaceState(
      {
        ...history.state,
        scrollX,
        scrollY,
      },
      ""
    ),
    (document.documentElement.dataset.vtaTransition = t),
    g
      ? (i = document.startViewTransition(() => w(m, e, r, n)).finished)
      : (i = w(m, e, r, n, P()));
  try {
    await i;
  } finally {
    await F(), x(), H();
  }
}
function Y(t, e) {
  if (!E()) {
    location.href = t;
    return;
  }
  const r = new URL(t, location.href);
  location.origin === r.origin && S(r)
    ? L(r, e?.history === "replace", !0)
    : q("forward", r, e ?? {});
}
function C(t) {
  if (!E() && t.state) {
    history.scrollRestoration && (history.scrollRestoration = "manual"),
      location.reload();
    return;
  }
  if (t.state === null) {
    history.scrollRestoration && (history.scrollRestoration = "auto");
    return;
  }
  history.scrollRestoration && (history.scrollRestoration = "manual");
  const e = history.state;
  if (e.intraPage) scrollTo(e.scrollX, e.scrollY);
  else {
    const r = e.index,
      n = r > y ? "forward" : "back";
    (y = r), q(n, new URL(location.href), {}, e);
  }
}
const v = () => {
  $({
    scrollX,
    scrollY,
  });
};
{
  (g || P() !== "none") &&
    (addEventListener("popstate", C),
    addEventListener("load", x),
    "onscrollend" in window
      ? addEventListener("scrollend", v)
      : addEventListener("scroll", M(v, 350), {
          passive: !0,
        }));
  for (const t of document.scripts) t.dataset.vtaExec = "";
}
function K() {
  return "animate";
}
function W(t) {
  if (document.querySelector(`link[rel=prefetch][href="${t}"]`)) return;
  if (navigator.connection) {
    let r = navigator.connection;
    if (r.saveData || /(2|3)g/.test(r.effectiveType || "")) return;
  }
  let e = document.createElement("link");
  e.setAttribute("rel", "prefetch"),
    e.setAttribute("href", t),
    document.head.append(e);
}
(g || K() !== "none") &&
  (document.addEventListener("click", (t) => {
    let e = t.target;
    e instanceof Element && e.tagName !== "A" && (e = e.closest("a")),
      !(
        !e ||
        !(e instanceof HTMLAnchorElement) ||
        e.dataset.vtaReload !== void 0 ||
        e.hasAttribute("download") ||
        !e.href ||
        (e.target && e.target !== "_self") ||
        e.origin !== location.origin ||
        t.button !== 0 ||
        t.metaKey ||
        t.ctrlKey ||
        t.altKey ||
        t.shiftKey ||
        t.defaultPrevented
      ) &&
        (t.preventDefault(),
        Y(e.href, {
          history: e.dataset.vtaHistory === "replace" ? "replace" : "auto",
        }));
  }),
  ["mouseenter", "touchstart", "focus"].forEach((t) => {
    document.addEventListener(
      t,
      (e) => {
        if (e.target instanceof HTMLAnchorElement) {
          let r = e.target;
          r.origin === location.origin &&
            r.pathname !== location.pathname &&
            E() &&
            W(r.pathname);
        }
      },
      {
        passive: !0,
        capture: !0,
      }
    );
  }));