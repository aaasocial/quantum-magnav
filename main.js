import * as e from "magnav.api";
//#region \0rolldown/runtime.js
var t = Object.create, n = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = Object.getOwnPropertyNames, a = Object.getPrototypeOf, o = Object.prototype.hasOwnProperty, s = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), c = (e, t) => {
	let r = {};
	for (var i in e) n(r, i, {
		get: e[i],
		enumerable: !0
	});
	return t || n(r, Symbol.toStringTag, { value: "Module" }), r;
}, l = (e, t, a, s) => {
	if (t && typeof t == "object" || typeof t == "function") for (var c = i(t), l = 0, u = c.length, d; l < u; l++) d = c[l], !o.call(e, d) && d !== a && n(e, d, {
		get: ((e) => t[e]).bind(null, d),
		enumerable: !(s = r(t, d)) || s.enumerable
	});
	return e;
}, u = (e, r, i) => (i = e == null ? {} : t(a(e)), l(r || !e || !e.__esModule || !o.call(e, "default") ? n(i, "default", {
	value: e,
	enumerable: !0
}) : i, e)), d = /* @__PURE__ */ s(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, O());
			else {
				var t = n(l);
				t !== null && j(x, t.startTime - e);
			}
		}
	}
	var S = !1, C = -1, w = 5, T = -1;
	function E() {
		return g ? !0 : !(e.unstable_now() - T < w);
	}
	function D() {
		if (g = !1, S) {
			var t = e.unstable_now();
			T = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && E());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && j(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? O() : S = !1;
			}
		}
	}
	var O;
	if (typeof y == "function") O = function() {
		y(D);
	};
	else if (typeof MessageChannel < "u") {
		var k = new MessageChannel(), A = k.port2;
		k.port1.onmessage = D, O = function() {
			A.postMessage(null);
		};
	} else O = function() {
		_(D, 0);
	};
	function j(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, j(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, O()))), r;
	}, e.unstable_shouldYield = E, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), f = /* @__PURE__ */ s(((e, t) => {
	t.exports = d();
})), p = /* @__PURE__ */ s(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var C = Array.isArray;
	function w() {}
	var T = {
		H: null,
		A: null,
		T: null,
		S: null
	}, E = Object.prototype.hasOwnProperty;
	function D(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function O(e, t) {
		return D(e.type, t, e.props);
	}
	function k(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function A(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var j = /\/+/g;
	function M(e, t) {
		return typeof e == "object" && e && e.key != null ? A("" + e.key) : t.toString(36);
	}
	function N(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(w, w) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function ee(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, ee(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + M(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(j, "$&/") + "/"), ee(o, r, i, "", function(e) {
			return e;
		})) : o != null && (k(o) && (o = O(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(j, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + M(a, u), c += ee(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + M(a, u++), c += ee(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ee(N(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function P(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ee(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function te(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var ne = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function re(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, ne);
		} catch (e) {
			ne(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function ie(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else re(ie.bind(null, e));
	}
	var ae = {
		map: P,
		forEach: function(e, t, n) {
			P(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return P(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return P(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!k(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = ae, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = ie, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !E.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return D(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) E.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return D(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = k, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: te
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = re, e.unstable_useCacheRefresh = function() {
		return T.H.useCacheRefresh();
	}, e.use = function(e) {
		return T.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return T.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return T.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return T.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return T.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return T.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return T.H.useEffectEvent(e);
	}, e.useId = function() {
		return T.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return T.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return T.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return T.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return T.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return T.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return T.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return T.H.useRef(e);
	}, e.useState = function(e) {
		return T.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return T.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return T.H.useTransition();
	}, e.version = "19.3.0";
})), m = /* @__PURE__ */ s(((e, t) => {
	t.exports = p();
})), h = /* @__PURE__ */ s(((e) => {
	var t = m();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal"), o = Symbol.for("react.recoverable"), s = Symbol.for("react.optimistic_key");
	function c(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : r === s ? s : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var l = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function u(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: o,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return c(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = l.T, n = i.p;
		try {
			if (l.T = null, i.p = 2, e) return e();
		} finally {
			l.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = u(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = u(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return l.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return l.H.useHostTransitionStatus();
	}, e.version = "19.3.0";
})), g = /* @__PURE__ */ s(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = h();
})), _ = /* @__PURE__ */ s(((e) => {
	var t = f(), n = m(), r = g();
	function i(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function a(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function o(e) {
		for (var t = e, n = t; n && !n.alternate;) t = n, t.flags & 4098 && (e = t.return), n = t.return;
		for (; t.return;) t = t.return;
		return t.tag === 3 ? e : null;
	}
	function s(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function c(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function l(e) {
		if (o(e) !== e) throw Error(i(188));
	}
	function u(e) {
		var t = e.alternate;
		if (!t) {
			if (t = o(e), t === null) throw Error(i(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var a = n.return;
			if (a === null) break;
			var s = a.alternate;
			if (s === null) {
				if (r = a.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (a.child === s.child) {
				for (s = a.child; s;) {
					if (s === n) return l(a), e;
					if (s === r) return l(a), t;
					s = s.sibling;
				}
				throw Error(i(188));
			}
			if (n.return !== r.return) n = a, r = s;
			else {
				for (var c = !1, u = a.child; u;) {
					if (u === n) {
						c = !0, n = a, r = s;
						break;
					}
					if (u === r) {
						c = !0, r = a, n = s;
						break;
					}
					u = u.sibling;
				}
				if (!c) {
					for (u = s.child; u;) {
						if (u === n) {
							c = !0, n = s, r = a;
							break;
						}
						if (u === r) {
							c = !0, r = s, n = a;
							break;
						}
						u = u.sibling;
					}
					if (!c) throw Error(i(189));
				}
			}
			if (n.alternate !== r) throw Error(i(190));
		}
		if (n.tag !== 3) throw Error(i(188));
		return n.stateNode.current === n ? e : t;
	}
	function d(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = d(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	function p(e, t, n, r, i, a) {
		for (; e !== null;) {
			if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && p(e.child, t, n, r, i, a)) return !0;
			e = e.sibling;
		}
		return !1;
	}
	function h(e) {
		for (e = e.return; e !== null;) {
			if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
			e = e.return;
		}
		return null;
	}
	function _(e) {
		var t = !1;
		for (e = e.return; e !== null && (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);) e = e.return;
		return t;
	}
	function v(e) {
		var t = [null, null], n = h(e);
		return n === null || y(t, e, n.child, { foundSelf: !1 }), t;
	}
	function y(e, t, n, r) {
		for (; n !== null;) {
			if (n === t) r.foundSelf = !0;
			else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
				if (r.foundSelf) return e[1] = n, !0;
				e[0] = n;
			} else if ((n.tag !== 22 || n.memoizedState === null) && y(e, t, n.child, r)) return !0;
			n = n.sibling;
		}
		return !1;
	}
	function b(e) {
		switch (e.tag) {
			case 5:
			case 27:
			case 6: return e.stateNode;
			case 3: return e.stateNode.containerInfo;
			default: throw Error(i(559));
		}
	}
	var x = null, S = null;
	function C(e, t, n) {
		return e === n || e === t && (x = e, !0);
	}
	function w(e, t, n) {
		return e === n ? (S = e, !1) : e === t && (S !== null && (x = e), !0);
	}
	function T(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function E(e, t, n) {
		for (var r = 0, i = e; i; i = n(i)) r++;
		i = 0;
		for (var a = t; a; a = n(a)) i++;
		for (; 0 < r - i;) e = n(e), r--;
		for (; 0 < i - r;) t = n(t), i--;
		for (; r--;) {
			if (e === t || t !== null && e === t.alternate) return e;
			e = n(e), t = n(t);
		}
		return null;
	}
	var D = Object.assign, O = Symbol.for("react.element"), k = Symbol.for("react.transitional.element"), A = Symbol.for("react.portal"), j = Symbol.for("react.fragment"), M = Symbol.for("react.strict_mode"), N = Symbol.for("react.profiler"), ee = Symbol.for("react.consumer"), P = Symbol.for("react.context"), te = Symbol.for("react.forward_ref"), ne = Symbol.for("react.suspense"), re = Symbol.for("react.suspense_list"), ie = Symbol.for("react.memo"), ae = Symbol.for("react.lazy"), oe = Symbol.for("react.activity"), se = Symbol.for("react.legacy_hidden"), ce = Symbol.for("react.memo_cache_sentinel"), le = Symbol.for("react.view_transition"), ue = Symbol.for("react.recoverable"), de = Symbol.iterator;
	function F(e) {
		return typeof e != "object" || !e ? null : (e = de && e[de] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var fe = Symbol.for("react.client.reference");
	function pe(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === fe ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case j: return "Fragment";
			case N: return "Profiler";
			case M: return "StrictMode";
			case ne: return "Suspense";
			case re: return "SuspenseList";
			case oe: return "Activity";
			case le: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case A: return "Portal";
			case P: return e.displayName || "Context";
			case ee: return (e._context.displayName || "Context") + ".Consumer";
			case te:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case ie: return t = e.displayName || null, t === null ? pe(e.type) || "Memo" : t;
			case ae:
				t = e._payload, e = e._init;
				try {
					return pe(e(t));
				} catch {}
		}
		return null;
	}
	var me = Array.isArray, I = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, L = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, he = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, ge = [], _e = -1;
	function ve(e) {
		return { current: e };
	}
	function ye(e) {
		0 > _e || (e.current = ge[_e], ge[_e] = null, _e--);
	}
	function be(e, t) {
		_e++, ge[_e] = e.current, e.current = t;
	}
	var xe = ve(null), Se = ve(null), Ce = ve(null), we = ve(null);
	function Te(e, t) {
		switch (be(Ce, t), be(Se, e), be(xe, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? fp(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = fp(t), e = pp(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		ye(xe), be(xe, e);
	}
	function Ee() {
		ye(xe), ye(Se), ye(Ce);
	}
	function De(e) {
		var t = e.memoizedState;
		t !== null && (lh._currentValue = t.memoizedState, be(we, e)), t = xe.current;
		var n = pp(t, e.type);
		t !== n && (be(Se, e), be(xe, n));
	}
	function Oe(e) {
		Se.current === e && (ye(xe), ye(Se)), we.current === e && (ye(we), lh._currentValue = he);
	}
	var ke, Ae;
	function je(e) {
		if (ke === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ke = t && t[1] || "", Ae = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + ke + e + Ae;
	}
	var Me = !1;
	function Ne(e, t) {
		if (!e || Me) return "";
		Me = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							n = !1;
							try {
								var i = Object.getOwnPropertyDescriptor(e.prototype, "props");
								Object.defineProperty(e.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								}), n = !0, new e();
							} finally {
								n && (i === void 0 ? delete e.prototype.props : Object.defineProperty(e.prototype, "props", i));
							}
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			Me = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? je(n) : "";
	}
	function Pe(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return je(e.type);
			case 16: return je("Lazy");
			case 13: return e.child !== t && t !== null ? je("Suspense Fallback") : je("Suspense");
			case 19: return je("SuspenseList");
			case 0:
			case 15: return Ne(e.type, !1);
			case 11: return Ne(e.type.render, !1);
			case 1: return Ne(e.type, !0);
			case 31: return je("Activity");
			case 30: return je("ViewTransition");
			default: return "";
		}
	}
	function Fe(e) {
		try {
			var t = "", n = null;
			do
				t += Pe(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Ie = Object.prototype.hasOwnProperty, Le = t.unstable_scheduleCallback, Re = t.unstable_cancelCallback, ze = t.unstable_shouldYield, Be = t.unstable_requestPaint, Ve = t.unstable_now, He = t.unstable_getCurrentPriorityLevel, Ue = t.unstable_ImmediatePriority, We = t.unstable_UserBlockingPriority, Ge = t.unstable_NormalPriority, Ke = t.unstable_LowPriority, qe = t.unstable_IdlePriority, Je = t.log, Ye = t.unstable_setDisableYieldValue, Xe = null, Ze = null;
	function Qe(e) {
		if (typeof Je == "function" && Ye(e), Ze && typeof Ze.setStrictMode == "function") try {
			Ze.setStrictMode(Xe, e);
		} catch {}
	}
	var $e = Math.clz32 ? Math.clz32 : nt, et = Math.log, tt = Math.LN2;
	function nt(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (et(e) / tt | 0) | 0;
	}
	var rt = 256, it = 262144, at = 4194304;
	function ot(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & -e;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function st(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = ot(n))) : i = ot(o) : i = ot(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = ot(n))) : i = ot(o)) : i = ot(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function ct(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function lt(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - $e(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function ut(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function dt() {
		var e = at;
		return at <<= 1, !(at & 62914560) && (at = 4194304), e;
	}
	function ft(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function pt(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function mt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - $e(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && ht(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function ht(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - $e(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function gt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - $e(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function _t(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : vt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function vt(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function yt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function bt() {
		var e = L.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : wh(e.type)) : e;
	}
	function xt(e, t) {
		var n = L.p;
		try {
			return L.p = e, t();
		} finally {
			L.p = n;
		}
	}
	var St = Math.random().toString(36).slice(2), Ct = "__reactFiber$" + St, wt = "__reactProps$" + St, Tt = "__reactContainer$" + St, Et = "__reactEvents$" + St, Dt = "__reactListeners$" + St, Ot = "__reactHandles$" + St, kt = "__reactResources$" + St, At = "__reactMarker$" + St, jt = "__reactLoad$" + St;
	function Mt(e) {
		delete e[Ct], delete e[wt], delete e[Dt], delete e[Ot];
	}
	function Nt(e) {
		var t;
		if (t = e[Ct]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Tt] || n[Ct]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = mm(e); e !== null;) {
					if (n = e[Ct]) return n;
					e = mm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Pt(e) {
		if (e = e[Ct] || e[Tt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Ft(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function It(e) {
		var t = e[kt];
		return t ||= e[kt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Lt(e) {
		e[At] = !0;
	}
	function Rt(e) {
		e[jt] = void 0;
	}
	var zt = /* @__PURE__ */ new Set(), Bt = {};
	function Vt(e, t) {
		Ht(e, t), Ht(e + "Capture", t);
	}
	function Ht(e, t) {
		for (Bt[e] = t, e = 0; e < t.length; e++) zt.add(t[e]);
	}
	var Ut = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Wt = {}, Gt = {};
	function Kt(e) {
		return Ie.call(Gt, e) ? !0 : Ie.call(Wt, e) ? !1 : Ut.test(e) ? Gt[e] = !0 : (Wt[e] = !0, !1);
	}
	var R = !1;
	function qt() {
		var e = R;
		return R = !1, e;
	}
	function Jt(e, t, n) {
		if (Kt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, n);
			}
		}
	}
	function Yt(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, n);
		}
	}
	function Xt(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, r);
		}
	}
	function Zt(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function Qt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function $t(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function en(e) {
		if (!e._valueTracker) {
			var t = Qt(e) ? "checked" : "value";
			e._valueTracker = $t(e, t, "" + e[t]);
		}
	}
	function tn(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Qt(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var nn = /[\n"\\]/g;
	function rn(e) {
		return e.replace(nn, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function an(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Zt(t)) : e.value !== "" + Zt(t) && (e.value = "" + Zt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : sn(e, Zt(n)) : o === "number" && e.value == t ? sn(e, Zt(e.value)) : sn(e, Zt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Zt(s) : e.removeAttribute("name");
	}
	function on(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				en(e);
				return;
			}
			n = n == null ? "" : "" + Zt(n), t = t == null ? n : "" + Zt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), en(e);
	}
	function sn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function cn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Zt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function ln(e, t, n) {
		t != null && (t = "" + Zt(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + Zt(n);
	}
	function un(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (me(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Zt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), en(e);
	}
	function dn(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var fn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function pn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || fn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function mn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", R = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (pn(e, a, r), R = !0);
		} else for (var o in t) t.hasOwnProperty(o) && pn(e, o, t[o]);
	}
	function hn(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var gn = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), _n = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function vn(e) {
		return _n.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function yn() {}
	var bn = null;
	function xn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Sn = null, Cn = null;
	function wn(e) {
		var t = Pt(e);
		if (t && (e = t.stateNode)) {
			var n = e[wt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (an(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + rn("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[wt] || null;
								if (!a) throw Error(i(90));
								an(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && tn(r);
					}
					break a;
				case "textarea":
					ln(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && cn(e, !!n.multiple, t, !1);
			}
		}
	}
	var Tn = !1;
	function En(e, t, n) {
		if (Tn) return e(t, n);
		Tn = !0;
		try {
			return e(t);
		} finally {
			if (Tn = !1, (Sn !== null || Cn !== null) && (zd(), Sn && (t = Sn, e = Cn, Cn = Sn = null, wn(t), e))) for (t = 0; t < e.length; t++) wn(e[t]);
		}
	}
	function Dn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[wt] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(i(231, t, typeof n));
		return n;
	}
	var On = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, kn = !1;
	if (On) try {
		var An = {};
		Object.defineProperty(An, "passive", { get: function() {
			kn = !0;
		} }), window.addEventListener("test", An, An), window.removeEventListener("test", An, An);
	} catch {
		kn = !1;
	}
	var jn = null, Mn = null, Nn = null;
	function Pn() {
		if (Nn) return Nn;
		var e, t = Mn, n = t.length, r, i = "value" in jn ? jn.value : jn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return Nn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Fn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function In() {
		return !0;
	}
	function Ln() {
		return !1;
	}
	function Rn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? In : Ln, this.isPropagationStopped = Ln, this;
		}
		return D(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = In);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = In);
			},
			persist: function() {},
			isPersistent: In
		}), t;
	}
	var zn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Bn = Rn(zn), Vn = D({}, zn, {
		view: 0,
		detail: 0
	}), Hn = Rn(Vn), Un, Wn, Gn, Kn = D({}, Vn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: rr,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Gn && (Gn && e.type === "mousemove" ? (Un = e.screenX - Gn.screenX, Wn = e.screenY - Gn.screenY) : Wn = Un = 0, Gn = e), Un);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Wn;
		}
	}), qn = Rn(Kn), Jn = Rn(D({}, Kn, { dataTransfer: 0 })), Yn = Rn(D({}, Vn, { relatedTarget: 0 })), Xn = Rn(D({}, zn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Zn = Rn(D({}, zn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Qn = Rn(D({}, zn, { data: 0 })), $n = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, er = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, tr = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function nr(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = tr[e]) ? !!t[e] : !1;
	}
	function rr() {
		return nr;
	}
	var ir = Rn(D({}, Vn, {
		key: function(e) {
			if (e.key) {
				var t = $n[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Fn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? er[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: rr,
		charCode: function(e) {
			return e.type === "keypress" ? Fn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Fn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), ar = Rn(D({}, Kn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), or = Rn(D({}, zn, { submitter: 0 })), z = Rn(D({}, Vn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: rr
	})), sr = Rn(D({}, zn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), cr = Rn(D({}, Kn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), lr = Rn(D({}, zn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), ur = [
		9,
		13,
		27,
		32
	], dr = On && "CompositionEvent" in window, fr = null;
	On && "documentMode" in document && (fr = document.documentMode);
	var pr = On && "TextEvent" in window && !fr, mr = On && (!dr || fr && 8 < fr && 11 >= fr), hr = " ", gr = !1;
	function _r(e, t) {
		switch (e) {
			case "keyup": return ur.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function vr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var yr = !1;
	function br(e, t) {
		switch (e) {
			case "compositionend": return vr(t);
			case "keypress": return t.which === 32 ? (gr = !0, hr) : null;
			case "textInput": return e = t.data, e === hr && gr ? null : e;
			default: return null;
		}
	}
	function xr(e, t) {
		if (yr) return e === "compositionend" || !dr && _r(e, t) ? (e = Pn(), Nn = Mn = jn = null, yr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return mr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Sr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function Cr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Sr[e.type] : t === "textarea";
	}
	function wr(e, t, n, r) {
		Sn ? Cn ? Cn.push(r) : Cn = [r] : Sn = r, t = Yf(t, "onChange"), 0 < t.length && (n = new Bn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Tr = null, Er = null;
	function Dr(e) {
		Hf(e, 0);
	}
	function Or(e) {
		if (tn(Ft(e))) return e;
	}
	function kr(e, t) {
		if (e === "change") return t;
	}
	var Ar = !1;
	if (On) {
		var jr;
		if (On) {
			var Mr = "oninput" in document;
			if (!Mr) {
				var Nr = document.createElement("div");
				Nr.setAttribute("oninput", "return;"), Mr = typeof Nr.oninput == "function";
			}
			jr = Mr;
		} else jr = !1;
		Ar = jr && (!document.documentMode || 9 < document.documentMode);
	}
	function Pr() {
		Tr && (Tr.detachEvent("onpropertychange", Fr), Er = Tr = null);
	}
	function Fr(e) {
		if (e.propertyName === "value" && Or(Er)) {
			var t = [];
			wr(t, Er, e, xn(e)), En(Dr, t);
		}
	}
	function Ir(e, t, n) {
		e === "focusin" ? (Pr(), Tr = t, Er = n, Tr.attachEvent("onpropertychange", Fr)) : e === "focusout" && Pr();
	}
	function Lr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Or(Er);
	}
	function Rr(e, t) {
		if (e === "click") return Or(t);
	}
	function zr(e, t) {
		if (e === "input" || e === "change") return Or(t);
	}
	function Br(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Vr = typeof Object.is == "function" ? Object.is : Br;
	function Hr(e, t) {
		if (Vr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ie.call(t, i) || !Vr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Ur(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Wr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Gr(e, t) {
		var n = Wr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Wr(n);
		}
	}
	function Kr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Kr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function qr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Ur(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Ur(e.document);
		}
		return t;
	}
	function Jr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Yr = On && "documentMode" in document && 11 >= document.documentMode, Xr = null, Zr = null, Qr = null, $r = !1;
	function ei(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		$r || Xr == null || Xr !== Ur(r) || (r = Xr, "selectionStart" in r && Jr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Qr && Hr(Qr, r) || (Qr = r, r = Yf(Zr, "onSelect"), 0 < r.length && (t = new Bn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Xr)));
	}
	function ti(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var ni = {
		animationend: ti("Animation", "AnimationEnd"),
		animationiteration: ti("Animation", "AnimationIteration"),
		animationstart: ti("Animation", "AnimationStart"),
		transitionrun: ti("Transition", "TransitionRun"),
		transitionstart: ti("Transition", "TransitionStart"),
		transitioncancel: ti("Transition", "TransitionCancel"),
		transitionend: ti("Transition", "TransitionEnd")
	}, ri = {}, ii = {};
	On && (ii = document.createElement("div").style, "AnimationEvent" in window || (delete ni.animationend.animation, delete ni.animationiteration.animation, delete ni.animationstart.animation), "TransitionEvent" in window || delete ni.transitionend.transition);
	function ai(e) {
		if (ri[e]) return ri[e];
		if (!ni[e]) return e;
		var t = ni[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in ii) return ri[e] = t[n];
		return e;
	}
	var oi = ai("animationend"), si = ai("animationiteration"), ci = ai("animationstart"), li = ai("transitionrun"), ui = ai("transitionstart"), di = ai("transitioncancel"), fi = ai("transitionend"), pi = /* @__PURE__ */ new Map(), mi = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	mi.push("scrollEnd");
	function hi(e, t) {
		pi.set(e, t), Vt(t, [e]);
	}
	var gi = 0;
	function _i(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = bd.identifierPrefix;
		var n = gi++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function vi(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = Od;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function yi(e, t) {
		return e = vi(e), t = vi(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var bi = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, xi = [], Si = 0, Ci = 0;
	function wi() {
		for (var e = Si, t = Ci = Si = 0; t < e;) {
			var n = xi[t];
			xi[t++] = null;
			var r = xi[t];
			xi[t++] = null;
			var i = xi[t];
			xi[t++] = null;
			var a = xi[t];
			if (xi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Oi(n, i, a);
		}
	}
	function Ti(e, t, n, r) {
		xi[Si++] = e, xi[Si++] = t, xi[Si++] = n, xi[Si++] = r, Ci |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Ei(e, t, n, r) {
		return Ti(e, t, n, r), ki(e);
	}
	function Di(e, t) {
		return Ti(e, null, null, t), ki(e);
	}
	function Oi(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - $e(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function ki(e) {
		if (50 < kd) throw kd = 0, Ad = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Ai = {};
	function ji(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Mi(e, t, n, r) {
		return new ji(e, t, n, r);
	}
	function Ni(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Pi(e, t) {
		var n = e.alternate;
		return n === null ? (n = Mi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Fi(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Ii(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Ni(r) && (s = 1);
		else if (typeof r == "string") s = Ym(e, n, xe.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case oe: return e = Mi(31, n, t, a), e.elementType = oe, e.lanes = o, e;
			case j: return Li(n.children, a, o, t);
			case M:
				s = 8, a |= 24;
				break;
			case N: return e = Mi(12, n, t, a | 2), e.elementType = N, e.lanes = o, e;
			case ne: return e = Mi(13, n, t, a), e.elementType = ne, e.lanes = o, e;
			case re: return e = Mi(19, n, t, a), e.elementType = re, e.lanes = o, e;
			case se:
			case le: return e = a | 32, e = Mi(30, n, t, e), e.elementType = le, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case P:
						s = 10;
						break a;
					case ee:
						s = 9;
						break a;
					case te:
						s = 11;
						break a;
					case ie:
						s = 14;
						break a;
					case ae:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Mi(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Li(e, t, n, r) {
		return e = Mi(7, e, r, t), e.lanes = n, e;
	}
	function Ri(e, t, n) {
		return e = Mi(6, e, null, t), e.lanes = n, e;
	}
	function zi(e) {
		var t = Mi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Bi(e, t, n) {
		return t = Mi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Vi = /* @__PURE__ */ new WeakMap();
	function Hi(e, t) {
		if (typeof e == "object" && e) {
			var n = Vi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Fe(t)
			}, Vi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Fe(t)
		};
	}
	var Ui = [], Wi = 0, Gi = null, Ki = 0, qi = [], Ji = 0, Yi = null, Xi = 1, Zi = "";
	function Qi(e, t) {
		Ui[Wi++] = Ki, Ui[Wi++] = Gi, Gi = e, Ki = t;
	}
	function $i(e, t, n) {
		qi[Ji++] = Xi, qi[Ji++] = Zi, qi[Ji++] = Yi, Yi = e;
		var r = Xi;
		e = Zi;
		var i = 32 - $e(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - $e(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Xi = 1 << 32 - $e(t) + i | n << i | r, Zi = a + e;
		} else Xi = 1 << a | n << i | r, Zi = e;
	}
	function ea(e) {
		e.return !== null && (Qi(e, 1), $i(e, 1, 0));
	}
	function ta(e) {
		for (; e === Gi;) Gi = Ui[--Wi], Ui[Wi] = null, Ki = Ui[--Wi], Ui[Wi] = null;
		for (; e === Yi;) Yi = qi[--Ji], qi[Ji] = null, Zi = qi[--Ji], qi[Ji] = null, Xi = qi[--Ji], qi[Ji] = null;
	}
	function na(e, t) {
		qi[Ji++] = Xi, qi[Ji++] = Zi, qi[Ji++] = Yi, Xi = t.id, Zi = t.overflow, Yi = e;
	}
	var ra = null, ia = null, B = !1, aa = null, oa = !1, sa = Error(i(519));
	function ca(e) {
		throw ma(Hi(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), sa;
	}
	function la(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[Ct] = e, t[wt] = r, n) {
			case "dialog":
				Z("cancel", t), Z("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Z("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < Bf.length; n++) Z(Bf[n], t);
				break;
			case "source":
				Z("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Z("error", t), Z("load", t);
				break;
			case "details":
				Z("toggle", t);
				break;
			case "input":
				Z("invalid", t), on(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Z("invalid", t);
				break;
			case "textarea": Z("invalid", t), un(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || tp(t.textContent, n) ? (r.popover != null && (Z("beforetoggle", t), Z("toggle", t)), r.onScroll != null && Z("scroll", t), r.onScrollEnd != null && Z("scrollend", t), r.onClick != null && (t.onclick = yn), t = !0) : t = !1, t || ca(e, !0);
	}
	function ua(e) {
		for (ra = e.return; ra;) switch (ra.tag) {
			case 5:
			case 31:
			case 13:
				oa = !1;
				return;
			case 27:
			case 3:
				oa = !0;
				return;
			default: ra = ra.return;
		}
	}
	function da(e) {
		if (e !== ra) return !1;
		if (!B) return ua(e), B = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || hp(e.type, e.memoizedProps)), n = !n), n && ia && ca(e), ua(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			ia = pm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			ia = pm(e);
		} else t === 27 ? (t = ia, wp(e.type) ? (e = fm, fm = null, ia = e) : ia = t) : ia = ra ? dm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function fa() {
		ia = ra = null, B = !1;
	}
	function pa() {
		var e = aa;
		return e !== null && (fd === null ? fd = e : fd.push.apply(fd, e), aa = null), e;
	}
	function ma(e) {
		aa === null ? aa = [e] : aa.push(e);
	}
	var ha = ve(null), ga = null, _a = null;
	function va(e, t, n) {
		be(ha, t._currentValue), t._currentValue = n;
	}
	function ya(e) {
		e._currentValue = ha.current, ye(ha);
	}
	function ba(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function xa(e, t, n, r) {
		var a = e.child;
		for (a !== null && (a.return = e); a !== null;) {
			var o = a.dependencies;
			if (o !== null) {
				var s = a.child;
				o = o.firstContext;
				a: for (; o !== null;) {
					var c = o;
					o = a;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), ba(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), ba(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), ba(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
			if (s !== null) s.return = a;
			else for (s = a; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (a = s.sibling, a !== null) {
					a.return = s.return, s = a;
					break;
				}
				s = s.return;
			}
			a = s;
		}
	}
	function Sa(e, t, n, r) {
		e = null;
		for (var a = t, o = !1; a !== null;) {
			if (!o) {
				if (a.flags & 524288) o = !0;
				else if (a.flags & 262144) break;
			}
			if (a.tag === 10) {
				var s = a.alternate;
				if (s === null) throw Error(i(387));
				if (s = s.memoizedProps, s !== null) {
					var c = a.type;
					Vr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === we.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [lh] : e.push(lh));
			}
			a = a.return;
		}
		return e !== null && xa(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function Ca(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Vr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function wa(e) {
		ga = e, _a = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Ta(e) {
		return Da(ga, e);
	}
	function Ea(e, t) {
		return ga === null && wa(e), Da(e, t);
	}
	function Da(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, _a === null) {
			if (e === null) throw Error(i(308));
			_a = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else _a = _a.next = t;
		return n;
	}
	var Oa = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, ka = t.unstable_scheduleCallback, Aa = t.unstable_NormalPriority, ja = {
		$$typeof: P,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Ma() {
		return {
			controller: new Oa(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Na(e) {
		e.refCount--, e.refCount === 0 && ka(Aa, function() {
			e.controller.abort();
		});
	}
	function Pa(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var Fa = null;
	function Ia(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var La = null, Ra = 0, za = 0, Ba = null;
	function Va(e, t) {
		if (La === null) {
			var n = La = [];
			Ra = 0, za = Ff(), Ba = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return Ra++, t.then(Ha, Ha), t;
	}
	function Ha() {
		if (--Ra === 0 && (Fa = null, La !== null)) {
			Ba !== null && (Ba.status = "fulfilled");
			var e = La;
			La = null, za = 0, Ba = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Ua(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var Wa = I.S;
	I.S = function(e, t) {
		if (hd = Ve(), typeof t == "object" && t && typeof t.then == "function" && Va(e, t), Fa !== null) for (var n = xf; n !== null;) Pa(n, Fa), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = xf; r !== null;) Pa(r, n), r = r.next;
			if (za !== 0) {
				r = Fa, r === null && (r = Fa = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Wa !== null && Wa(e, t);
	};
	var Ga = ve(null);
	function Ka() {
		var e = Ga.current;
		return e === null ? Qu.pooledCache : e;
	}
	function qa(e, t) {
		t === null ? be(Ga, Ga.current) : be(Ga, t.pool);
	}
	function Ja() {
		var e = Ka();
		return e === null ? null : {
			parent: ja._currentValue,
			pool: e
		};
	}
	var Ya = Error(i(460)), Xa = Error(i(474)), Za = Error(i(542)), Qa = { then: function() {} };
	function $a(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function eo(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(yn, yn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, ro(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(yn, yn);
				else {
					if (e = Qu, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, ro(e), e;
				}
				throw no = t, Ya;
		}
	}
	function to(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (no = e, Ya) : e;
		}
	}
	var no = null;
	function V() {
		if (no === null) throw Error(i(459));
		var e = no;
		return no = null, e;
	}
	function ro(e) {
		if (e === Ya || e === Za) throw Error(i(483));
	}
	var io = null, ao = 0;
	function oo(e) {
		var t = ao;
		return ao += 1, io === null && (io = []), eo(io, e, t);
	}
	function so(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function co(e, t) {
		throw t.$$typeof === O ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function lo(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function a(e, t) {
			return e = Pi(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Ri(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === j ? (e = d(e, t, n.props.children, r, n.key), so(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === ae && to(i) === t.type) ? (t = a(t, n.props), so(t, n), t.return = e, t) : (t = Ii(n.type, n.key, n.props, null, e.mode, r), so(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Bi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = Li(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Ri("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case k: return n = Ii(t.type, t.key, t.props, null, e.mode, n), so(n, t), n.return = e, n;
					case A: return t = Bi(t, e.mode, n), t.return = e, t;
					case ae: return t = to(t), f(e, t, n);
				}
				if (me(t) || F(t)) return t = Li(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, oo(t), n);
				if (t.$$typeof === P) return f(e, Ea(e, t), n);
				co(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case k: return n.key === i ? l(e, t, n, r) : null;
					case A: return n.key === i ? u(e, t, n, r) : null;
					case ae: return n = to(n), p(e, t, n, r);
				}
				if (me(n) || F(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, oo(n), r);
				if (n.$$typeof === P) return p(e, t, Ea(e, n), r);
				co(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case k: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case A: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case ae: return r = to(r), m(e, t, n, r, i);
				}
				if (me(r) || F(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, oo(r), i);
				if (r.$$typeof === P) return m(e, t, n, Ea(t, r), i);
				co(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), B && Qi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return B && Qi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), B && Qi(i, h), l;
		}
		function g(a, s, c, l) {
			if (c == null) throw Error(i(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(a, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(a, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(a, h), B && Qi(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return B && Qi(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), B && Qi(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === j && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case k:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === j) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), so(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === ae && to(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), so(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === j ? (c = Li(o.props.children, e.mode, c, o.key), so(c, o), c.return = e, e = c) : (c = Ii(o.type, o.key, o.props, null, e.mode, c), so(c, o), c.return = e, e = c);
						}
						return s(e);
					case A:
						a: {
							for (l = o.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === o.containerInfo && r.stateNode.implementation === o.implementation) {
										n(e, r.sibling), c = a(r, o.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = Bi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case ae: return o = to(o), _(e, r, o, c);
				}
				if (me(o)) return h(e, r, o, c);
				if (F(o)) {
					if (l = F(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, oo(o), c);
				if (o.$$typeof === P) return _(e, r, Ea(e, o), c);
				co(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Ri(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				ao = 0;
				var i = _(e, t, n, r);
				return io = null, i;
			} catch (t) {
				if (t === Ya || t === Za) throw t;
				var a = Mi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var uo = lo(!0), fo = lo(!1), po = !1;
	function mo(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function ho(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function go(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function H(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, J & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = ki(e), Oi(e, null, n), t;
		}
		return Ti(e, r, t, n), ki(e);
	}
	function _o(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, gt(e, n);
		}
	}
	function vo(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var yo = !1;
	function bo() {
		if (yo) {
			var e = Ba;
			if (e !== null) throw e;
		}
	}
	function xo(e, t, n, r) {
		yo = !1;
		var i = e.updateQueue;
		po = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (X & f) === f : (r & f) === f) {
					f !== 0 && f === za && (yo = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var g = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(g, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(g, d, f) : m, f == null) break a;
								d = D({}, d, f);
								break a;
							case 2: po = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), od |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function So(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function Co(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) So(n[e], t);
	}
	var wo = ve(null), To = ve(0);
	function Eo(e, t) {
		e = id, be(To, e), be(wo, t), id = e | t.baseLanes;
	}
	function Do() {
		be(To, id), be(wo, wo.current);
	}
	function Oo() {
		id = To.current, ye(wo), ye(To);
	}
	var ko = ve(null), Ao = null;
	function jo(e) {
		var t = e.alternate;
		be(Io, Io.current & 1), be(ko, e), Ao === null && (t === null || wo.current !== null || t.memoizedState !== null) && (Ao = e);
	}
	function Mo(e) {
		be(Io, Io.current), be(ko, e), Ao === null && (Ao = e);
	}
	function No(e) {
		e.tag === 22 ? (be(Io, Io.current), be(ko, e), Ao === null && (Ao = e)) : Po();
	}
	function Po() {
		be(Io, Io.current), be(ko, ko.current);
	}
	function Fo(e) {
		ye(ko), Ao === e && (Ao = null), ye(Io);
	}
	var Io = ve(0);
	function Lo(e, t) {
		be(ko, ko.current), be(Io, t);
	}
	function Ro(e) {
		ye(Io), ye(ko), Ao === e && (Ao = null);
	}
	function zo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || cm(n) || lm(n))) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var Bo = 0, U = null, Vo = null, Ho = null, Uo = !1, Wo = !1, Go = !1, Ko = 0, qo = 0, Jo = null, Yo = 0;
	function W() {
		throw Error(i(321));
	}
	function Xo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Vr(e[n], t[n])) return !1;
		return !0;
	}
	function Zo(e, t, n, r, i, a) {
		return Bo = a, U = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, I.H = e === null || e.memoizedState === null ? mc : G, Go = !1, a = n(r, i), Go = !1, Wo && (a = $o(t, n, r, i)), Qo(e), a;
	}
	function Qo(e) {
		I.H = pc;
		var t = Vo !== null && Vo.next !== null;
		if (Bo = 0, Ho = Vo = U = null, Uo = !1, qo = 0, Jo = null, t) throw Error(i(300));
		e === null || jc || (e = e.dependencies, e !== null && Ca(e) && (jc = !0));
	}
	function $o(e, t, n, r) {
		U = e;
		var a = 0;
		do {
			if (Wo && (Jo = null), qo = 0, Wo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Ho = Vo = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			I.H = hc, o = t(n, r);
		} while (Wo);
		return o;
	}
	function es() {
		var e = I.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? ss(t) : t, e = e.useState()[0], (Vo === null ? null : Vo.memoizedState) !== e && (U.flags |= 1024), t;
	}
	function ts() {
		var e = Ko !== 0;
		return Ko = 0, e;
	}
	function ns(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function rs(e) {
		if (Uo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Uo = !1;
		}
		Bo = 0, Ho = Vo = U = null, Wo = !1, qo = Ko = 0, Jo = null;
	}
	function is() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Ho === null ? U.memoizedState = Ho = e : Ho = Ho.next = e, Ho;
	}
	function as() {
		if (Vo === null) {
			var e = U.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Vo.next;
		var t = Ho === null ? U.memoizedState : Ho.next;
		if (t !== null) Ho = t, Vo = e;
		else {
			if (e === null) throw U.alternate === null ? Error(i(467)) : Error(i(310));
			Vo = e, e = {
				memoizedState: Vo.memoizedState,
				baseState: Vo.baseState,
				baseQueue: Vo.baseQueue,
				queue: Vo.queue,
				next: null
			}, Ho === null ? U.memoizedState = Ho = e : Ho = Ho.next = e;
		}
		return Ho;
	}
	function os() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function ss(e) {
		var t = qo;
		return qo += 1, Jo === null && (Jo = []), e = eo(Jo, e, t), t = U, (Ho === null ? t.memoizedState : Ho.next) === null && (t = t.alternate, I.H = t === null || t.memoizedState === null ? mc : G), e;
	}
	function cs(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return ss(e);
			if (e.$$typeof === ue) return;
			if (e.$$typeof === P) return Ta(e);
		}
		throw Error(i(438, String(e)));
	}
	function ls(e) {
		var t = null, n = U.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = U.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = os(), U.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = ce;
		return t.index++, n;
	}
	function us(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function ds(e) {
		return fs(as(), Vo, e);
	}
	function fs(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(i(311));
		r.lastRenderedReducer = n;
		var a = e.baseQueue, o = r.pending;
		if (o !== null) {
			if (a !== null) {
				var s = a.next;
				a.next = o.next, o.next = s;
			}
			t.baseQueue = a = o, r.pending = null;
		}
		if (o = e.baseState, a === null) e.memoizedState = o;
		else {
			t = a.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (Bo & f) === f : (X & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === za && (d = !0);
					else if ((Bo & p) === p) {
						u = u.next, p === za && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, U.lanes |= p, od |= p;
					f = u.action, Go && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, U.lanes |= f, od |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Vr(o, e.memoizedState) && (jc = !0, d && (n = Ba, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function ps(e) {
		var t = as(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Vr(o, t.memoizedState) || (jc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function ms(e, t, n) {
		var r = U, a = as(), o = B;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Vr((Vo || a).memoizedState, n);
		if (s && (a.memoizedState = n, jc = !0), a = a.queue, zs(_s.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Ho !== null && !!(Ho.memoizedState.tag & 1), Ps(e ? 9 : 8, { destroy: void 0 }, gs.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, Qu === null) throw Error(i(349));
			o || Bo & 127 || hs(r, t, n);
		}
		return n;
	}
	function hs(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = U.updateQueue, t === null ? (t = os(), U.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function gs(e, t, n, r) {
		t.value = n, t.getSnapshot = r, vs(t) && ys(e);
	}
	function _s(e, t, n) {
		return n(function() {
			vs(t) && ys(e);
		});
	}
	function vs(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Vr(e, n);
		} catch {
			return !0;
		}
	}
	function ys(e) {
		var t = Di(e, 2);
		t !== null && Pd(t, e, 2);
	}
	function bs(e) {
		var t = is();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Go) {
				Qe(!0);
				try {
					n();
				} finally {
					Qe(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: us,
			lastRenderedState: e
		}, t;
	}
	function xs(e, t, n, r) {
		return e.baseState = n, fs(e, Vo, typeof r == "function" ? r : us);
	}
	function Ss(e, t, n, r, a) {
		if (uc(e)) throw Error(i(485));
		if (e = t.action, e !== null) {
			var o = {
				payload: a,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					o.listeners.push(e);
				}
			};
			I.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Cs(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Cs(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = I.T, o = {};
			o.types = a === null ? null : a.types, I.T = o;
			try {
				var s = n(i, r), c = I.S;
				c !== null && c(o, s), ws(e, t, s);
			} catch (n) {
				Es(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), I.T = a;
			}
		} else try {
			a = n(i, r), ws(e, t, a);
		} catch (n) {
			Es(e, t, n);
		}
	}
	function ws(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Ts(e, t, n);
		}, function(n) {
			return Es(e, t, n);
		}) : Ts(e, t, n);
	}
	function Ts(e, t, n) {
		t.status = "fulfilled", t.value = n, Ds(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Cs(e, n)));
	}
	function Es(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Ds(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Ds(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Os(e, t) {
		return t;
	}
	function ks(e, t) {
		if (B) {
			var n = Qu.formState;
			if (n !== null) {
				a: {
					var r = U;
					if (B) {
						if (ia) {
							b: {
								for (var i = ia, a = oa; i.nodeType !== 8;) if (!a || (i = dm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								ia = dm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						ca(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = is(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Os,
			lastRenderedState: t
		}, n.queue = r, n = sc.bind(null, U, r), r.dispatch = n, r = bs(!1), a = lc.bind(null, U, !1, r.queue), r = is(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Ss.bind(null, U, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function As(e) {
		return js(as(), Vo, e);
	}
	function js(e, t, n) {
		if (t = fs(e, t, Os)[0], e = ds(us)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = ss(t);
		} catch (e) {
			throw e === Ya ? Za : e;
		}
		else r = t;
		t = as();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (U.flags |= 2048, Ps(9, { destroy: void 0 }, Ms.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Ms(e, t) {
		e.action = t;
	}
	function Ns(e) {
		var t = as(), n = Vo;
		if (n !== null) return js(t, n, e);
		as(), t = t.memoizedState, n = as();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function Ps(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = U.updateQueue, t === null && (t = os(), U.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function Fs() {
		return as().memoizedState;
	}
	function Is(e, t, n, r) {
		var i = is();
		U.flags |= e, i.memoizedState = Ps(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Ls(e, t, n, r) {
		var i = as();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		Vo !== null && r !== null && Xo(r, Vo.memoizedState.deps) ? i.memoizedState = Ps(t, a, n, r) : (U.flags |= e, i.memoizedState = Ps(1 | t, a, n, r));
	}
	function Rs(e, t) {
		Is(8390656, 8, e, t);
	}
	function zs(e, t) {
		Ls(2048, 8, e, t);
	}
	function Bs(e) {
		U.flags |= 4;
		var t = U.updateQueue;
		if (t === null) t = os(), U.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Vs(e) {
		var t = as().memoizedState;
		return Bs({
			ref: t,
			nextImpl: e
		}), function() {
			if (J & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Hs(e, t) {
		return Ls(4, 2, e, t);
	}
	function Us(e, t) {
		return Ls(4, 4, e, t);
	}
	function Ws(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function Gs(e, t, n) {
		n = n == null ? null : n.concat([e]), Ls(4, 4, Ws.bind(null, t, e), n);
	}
	function Ks() {}
	function qs(e, t) {
		var n = as();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && Xo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Js(e, t) {
		var n = as();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && Xo(t, r[1])) return r[0];
		if (r = e(), Go) {
			Qe(!0);
			try {
				e();
			} finally {
				Qe(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Ys(e, t, n) {
		return n === void 0 || Bo & 1073741824 && !(X & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Md(), U.lanes |= e, od |= e, n);
	}
	function Xs(e, t, n, r) {
		return Vr(n, t) ? n : wo.current === null ? !(Bo & 106) || Bo & 1073741824 && !(X & 261930) ? (jc = !0, e.memoizedState = n) : (e = Md(), U.lanes |= e, od |= e, t) : (e = Ys(e, n, r), Vr(e, t) || (jc = !0), e);
	}
	function Zs(e, t, n, r, i) {
		var a = L.p;
		L.p = a !== 0 && 8 > a ? a : 8;
		var o = I.T, s = {};
		s.types = o === null ? null : o.types, I.T = s, lc(e, !1, t, n);
		try {
			var c = i(), l = I.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? cc(e, t, Ua(c, r), jd(e)) : cc(e, t, r, jd(e));
		} catch (n) {
			cc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, jd());
		} finally {
			L.p = a, o !== null && s.types !== null && (o.types = s.types), I.T = o;
		}
	}
	function Qs() {}
	function $s(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = ec(e).queue;
		Zs(e, a, t, he, n === null ? Qs : function() {
			return tc(e), n(r);
		});
	}
	function ec(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: he,
			baseState: he,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: us,
				lastRenderedState: he
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: us,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function tc(e) {
		var t = ec(e);
		t.next === null && (t = e.alternate.memoizedState), cc(e, t.next.queue, {}, jd());
	}
	function nc() {
		return Ta(lh);
	}
	function rc() {
		return as().memoizedState;
	}
	function ic() {
		return as().memoizedState;
	}
	function ac(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = jd();
					e = go(n);
					var r = H(t, e, n);
					r !== null && (Pd(r, t, n), _o(r, t, n)), t = { cache: Ma() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function oc(e, t, n) {
		var r = jd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, uc(e) ? dc(t, n) : (n = Ei(e, t, n, r), n !== null && (Pd(n, e, r), fc(n, t, r)));
	}
	function sc(e, t, n) {
		cc(e, t, n, jd());
	}
	function cc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (uc(e)) dc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Vr(s, o)) return Ti(e, t, i, 0), Qu === null && wi(), !1;
			} catch {}
			if (n = Ei(e, t, i, r), n !== null) return Pd(n, e, r), fc(n, t, r), !0;
		}
		return !1;
	}
	function lc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Ff(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, uc(e)) {
			if (t) throw Error(i(479));
		} else t = Ei(e, n, r, 2), t !== null && Pd(t, e, 2);
	}
	function uc(e) {
		var t = e.alternate;
		return e === U || t !== null && t === U;
	}
	function dc(e, t) {
		Wo = Uo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function fc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, gt(e, n);
		}
	}
	var pc = {
		readContext: Ta,
		use: cs,
		useCallback: W,
		useContext: W,
		useEffect: W,
		useImperativeHandle: W,
		useLayoutEffect: W,
		useInsertionEffect: W,
		useMemo: W,
		useReducer: W,
		useRef: W,
		useState: W,
		useDebugValue: W,
		useDeferredValue: W,
		useTransition: W,
		useSyncExternalStore: W,
		useId: W,
		useHostTransitionStatus: W,
		useFormState: W,
		useActionState: W,
		useOptimistic: W,
		useMemoCache: W,
		useCacheRefresh: W,
		useEffectEvent: W
	}, mc = {
		readContext: Ta,
		use: cs,
		useCallback: function(e, t) {
			return is().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Ta,
		useEffect: Rs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Is(4194308, 4, Ws.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Is(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Is(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = is();
			t = t === void 0 ? null : t;
			var r = e();
			if (Go) {
				Qe(!0);
				try {
					e();
				} finally {
					Qe(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = is();
			if (n !== void 0) {
				var i = n(t);
				if (Go) {
					Qe(!0);
					try {
						n(t);
					} finally {
						Qe(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = oc.bind(null, U, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = is();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = bs(e);
			var t = e.queue, n = sc.bind(null, U, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Ks,
		useDeferredValue: function(e, t) {
			return Ys(is(), e, t);
		},
		useTransition: function() {
			var e = bs(!1);
			return e = Zs.bind(null, U, e.queue, !0, !1), is().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = U, a = is();
			if (B) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), Qu === null) throw Error(i(349));
				X & 127 || hs(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Rs(_s.bind(null, r, o, e), [e]), r.flags |= 2048, Ps(9, { destroy: void 0 }, gs.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = is(), t = Qu.identifierPrefix;
			if (B) {
				var n = Zi, r = Xi;
				n = (r & ~(1 << 32 - $e(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Ko++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Yo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: nc,
		useFormState: ks,
		useActionState: ks,
		useOptimistic: function(e) {
			var t = is();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = lc.bind(null, U, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: ls,
		useCacheRefresh: function() {
			return is().memoizedState = ac.bind(null, U);
		},
		useEffectEvent: function(e) {
			var t = is(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (J & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, G = {
		readContext: Ta,
		use: cs,
		useCallback: qs,
		useContext: Ta,
		useEffect: zs,
		useImperativeHandle: Gs,
		useInsertionEffect: Hs,
		useLayoutEffect: Us,
		useMemo: Js,
		useReducer: ds,
		useRef: Fs,
		useState: function() {
			return ds(us);
		},
		useDebugValue: Ks,
		useDeferredValue: function(e, t) {
			return Xs(as(), Vo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ds(us)[0], t = as().memoizedState;
			return [typeof e == "boolean" ? e : ss(e), t];
		},
		useSyncExternalStore: ms,
		useId: rc,
		useHostTransitionStatus: nc,
		useFormState: As,
		useActionState: As,
		useOptimistic: function(e, t) {
			return xs(as(), Vo, e, t);
		},
		useMemoCache: ls,
		useCacheRefresh: ic,
		useEffectEvent: Vs
	}, hc = {
		readContext: Ta,
		use: cs,
		useCallback: qs,
		useContext: Ta,
		useEffect: zs,
		useImperativeHandle: Gs,
		useInsertionEffect: Hs,
		useLayoutEffect: Us,
		useMemo: Js,
		useReducer: ps,
		useRef: Fs,
		useState: function() {
			return ps(us);
		},
		useDebugValue: Ks,
		useDeferredValue: function(e, t) {
			var n = as();
			return Vo === null ? Ys(n, e, t) : Xs(n, Vo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ps(us)[0], t = as().memoizedState;
			return [typeof e == "boolean" ? e : ss(e), t];
		},
		useSyncExternalStore: ms,
		useId: rc,
		useHostTransitionStatus: nc,
		useFormState: Ns,
		useActionState: Ns,
		useOptimistic: function(e, t) {
			var n = as();
			return Vo === null ? (n.baseState = e, [e, n.queue.dispatch]) : xs(n, Vo, e, t);
		},
		useMemoCache: ls,
		useCacheRefresh: ic,
		useEffectEvent: Vs
	};
	function gc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : D({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var _c = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = go(r);
			i.payload = t, n != null && (i.callback = n), t = H(e, i, r), t !== null && (Pd(t, e, r), _o(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = go(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = H(e, i, r), t !== null && (Pd(t, e, r), _o(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = jd(), r = go(n);
			r.tag = 2, t != null && (r.callback = t), t = H(e, r, n), t !== null && (Pd(t, e, n), _o(t, e, n));
		}
	};
	function vc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Hr(n, r) || !Hr(i, a) : !0;
	}
	function yc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && _c.enqueueReplaceState(t, t.state, null);
	}
	function bc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = D({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function xc(e) {
		bi(e);
	}
	function Sc(e) {
		console.error(e);
	}
	function Cc(e) {
		bi(e);
	}
	function wc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Tc(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Ec(e, t, n) {
		return n = go(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			wc(e, t);
		}, n;
	}
	function Dc(e) {
		return e = go(e), e.tag = 3, e;
	}
	function Oc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Tc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Tc(t, n, r), typeof i != "function" && (vd === null ? vd = /* @__PURE__ */ new Set([this]) : vd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function kc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Sa(t, n, a, !0), n = ko.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return Ao === null ? Kd() : n.alternate === null && ad === 0 && (ad = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === Qa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), hf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === Qa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), hf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return hf(e, r, a), Kd(), !1;
		}
		if (B) return t = ko.current, t === null ? (r !== sa && (t = Error(i(423), { cause: r }), ma(Hi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Hi(r, n), a = Ec(e.stateNode, r, a), vo(e, a), ad !== 4 && (ad = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== sa && (e = Error(i(422), { cause: r }), ma(Hi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Hi(o, n), dd === null ? dd = [o] : dd.push(o), ad !== 4 && (ad = 2), t === null) return !0;
		r = Hi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = Ec(n.stateNode, r, e), vo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (vd === null || !vd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = Dc(a), Oc(a, e, n, r), vo(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Ac = Error(i(461)), jc = !1;
	function Mc(e, t, n, r) {
		t.child = e === null ? fo(t, null, n, r) : uo(t, e.child, n, r);
	}
	function Nc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return wa(t), r = Zo(e, t, n, o, a, i), s = ts(), e !== null && !jc ? (ns(e, t, i), sl(e, t, i)) : (B && s && ea(t), t.flags |= 1, Mc(e, t, r, i), t.child);
	}
	function Pc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Ni(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Fc(e, t, a, r, i)) : (e = Ii(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !cl(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Hr : n, n(o, r) && e.ref === t.ref) return sl(e, t, i);
		}
		return t.flags |= 1, e = Pi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Fc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Hr(a, r) && e.ref === t.ref) {
				if (jc = !1, t.pendingProps = r = a, cl(e, i)) e.flags & 131072 && (jc = !0);
				else return t.lanes = e.lanes, sl(e, t, i);
			}
		}
		return Uc(e, t, n, r, i);
	}
	function Ic(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return Rc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && qa(t, a === null ? null : a.cachePool), a === null ? Do() : Eo(t, a), No(t);
			else return r = t.lanes = 536870912, Rc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && qa(t, null), Do(), Po()) : (qa(t, a.cachePool), Eo(t, a), Po(), t.memoizedState = null);
		return Mc(e, t, i, n), t.child;
	}
	function Lc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Rc(e, t, n, r, i) {
		var a = Ka();
		return a = a === null ? null : {
			parent: ja._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && qa(t, null), Do(), No(t), e !== null && Sa(e, t, r, !0), t.childLanes = i, null;
	}
	function zc(e, t) {
		return t = Qc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Bc(e, t, n) {
		return uo(t, e.child, null, n), e = zc(t, t.pendingProps), e.flags |= 2, Fo(t), t.memoizedState = null, e;
	}
	function Vc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (B) {
				if (r.mode === "hidden") return e = zc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Lc(null, e);
				if (Mo(t), (e = ia) ? (e = sm(e, oa), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Yi === null ? null : {
						id: Xi,
						overflow: Zi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = zi(e), n.return = t, t.child = n, ra = t, ia = null)) : e = null, e === null) throw ca(t);
				return t.lanes = 536870912, null;
			}
			return zc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (Mo(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Bc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (jc || Sa(e, t, n, !1), a = (n & e.childLanes) !== 0, jc || a) {
				if (wo.current === null) {
					if (r = Qu, r !== null && (s = _t(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Di(e, s), Pd(r, e, s), Ac;
					Kd();
				}
				t = Bc(e, t, n);
			} else e = o.treeContext, ia = dm(s.nextSibling), ra = t, B = !0, aa = null, oa = !1, e !== null && na(t, e), t = zc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Pi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Hc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Uc(e, t, n, r, i) {
		return wa(t), n = Zo(e, t, n, r, void 0, i), r = ts(), e !== null && !jc ? (ns(e, t, i), sl(e, t, i)) : (B && r && ea(t), t.flags |= 1, Mc(e, t, n, i), t.child);
	}
	function Wc(e, t, n, r, i, a) {
		return wa(t), t.updateQueue = null, n = $o(t, r, n, i), Qo(e), r = ts(), e !== null && !jc ? (ns(e, t, a), sl(e, t, a)) : (B && r && ea(t), t.flags |= 1, Mc(e, t, n, a), t.child);
	}
	function Gc(e, t, n, r, i) {
		if (wa(t), t.stateNode === null) {
			var a = Ai, o = n.contextType;
			typeof o == "object" && o && (a = Ta(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = _c, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, mo(t), o = n.contextType, a.context = typeof o == "object" && o ? Ta(o) : Ai, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (gc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && _c.enqueueReplaceState(a, a.state, null), xo(t, r, a, i), bo(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = bc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Ai, typeof u == "object" && u && (o = Ta(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && yc(t, a, r, o), po = !1;
			var f = t.memoizedState;
			a.state = f, xo(t, r, a, i), bo(), l = t.memoizedState, s || f !== l || po ? (typeof d == "function" && (gc(t, n, d, r), l = t.memoizedState), (c = po || vc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, ho(e, t), o = t.memoizedProps, u = bc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Ai, typeof l == "object" && l && (c = Ta(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && yc(t, a, r, c), po = !1, f = t.memoizedState, a.state = f, xo(t, r, a, i), bo();
			var p = t.memoizedState;
			o !== d || f !== p || po || e !== null && e.dependencies !== null && Ca(e.dependencies) ? (typeof s == "function" && (gc(t, n, s, r), p = t.memoizedState), (u = po || vc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Ca(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Hc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = uo(t, e.child, null, i), t.child = uo(t, null, n, i)) : Mc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = sl(e, t, i), e;
	}
	function Kc(e, t, n, r) {
		return fa(), t.flags |= 256, Mc(e, t, n, r), t.child;
	}
	var qc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Jc(e) {
		return {
			baseLanes: e,
			cachePool: Ja()
		};
	}
	function Yc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ld), e;
	}
	function Xc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Io.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (B) {
				if (i ? jo(t) : Po(), (e = ia) ? (e = sm(e, oa), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Yi === null ? null : {
						id: Xi,
						overflow: Zi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = zi(e), n.return = t, t.child = n, ra = t, ia = null)) : e = null, e === null) throw ca(t);
				return t.lanes = lm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Po(), i = t.mode, a = Qc({
				mode: "hidden",
				children: a
			}, i), r = Li(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Jc(n), r.childLanes = Yc(e, o, n), t.memoizedState = qc, Lc(null, r)) : (jo(t), Zc(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return el(e, t, a, o, r, c, s, n);
		}
		return i ? (Po(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Pi(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Li(i, a, n, null), i.flags |= 2) : i = Pi(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Lc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Jc(n) : (a = i.cachePool, a === null ? a = Ja() : (s = ja._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Yc(e, o, n), t.memoizedState = qc, Lc(e.child, r)) : (jo(t), n = e.child, e = n.sibling, n = Pi(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Zc(e, t) {
		return t = Qc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Qc(e, t) {
		return e = Mi(22, e, null, t), e.lanes = 0, e;
	}
	function $c(e, t, n) {
		return uo(t, e.child, null, n), e = Zc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function el(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (jo(t), t.flags &= -257, $c(e, t, c)) : t.memoizedState === null ? (Po(), o = a.fallback, s = t.mode, a = Qc({
			mode: "visible",
			children: a.children
		}, s), o = Li(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, uo(t, e.child, null, c), a = t.child, a.memoizedState = Jc(c), a.childLanes = Yc(e, r, c), t.memoizedState = qc, Lc(null, a)) : (Po(), t.child = e.child, t.flags |= 128, null);
		if (jo(t), lm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, ma({
				value: a,
				source: null,
				stack: null
			})), $c(e, t, c);
		}
		if (jc || Sa(e, t, c, !1), r = (c & e.childLanes) !== 0, jc || r) {
			if (wo.current !== null) return $c(e, t, c);
			if (r = Qu, r !== null && (a = _t(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, Di(e, a), Pd(r, e, a), Ac;
			return cm(o) || Kd(), $c(e, t, c);
		}
		return cm(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, ia = dm(o.nextSibling), ra = t, B = !0, aa = null, oa = !1, e !== null && na(t, e), t = Zc(t, a.children), t.flags |= 134221824, t);
	}
	function tl(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ba(e.return, t, n);
	}
	function nl(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && zo(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function rl(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function il(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function al(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Io.current;
		if (t.flags & 128) return Lo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Lo(t, o), i === "backwards" && e !== null ? (il(e), Mc(e, t, r, n), il(e)) : Mc(e, t, r, n), r = B ? Ki : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && tl(e, n, t);
			else if (e.tag === 19) tl(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "backwards":
				n = nl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, il(t)), rl(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && zo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				rl(t, !0, n, null, a, r);
				break;
			case "together":
				rl(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = nl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), rl(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function ol(e, t, n) {
		var r = t.pendingProps;
		return va(t, t.type, r.value), Mc(e, t, r.children, n), t.child;
	}
	function sl(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), od |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (Sa(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Pi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Pi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function cl(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Ca(e)));
	}
	function ll(e, t, n) {
		switch (t.tag) {
			case 3:
				Te(t, t.stateNode.containerInfo), va(t, ja, e.memoizedState.cache), fa();
				break;
			case 27:
			case 5:
				De(t);
				break;
			case 4:
				Te(t, t.stateNode.containerInfo);
				break;
			case 10:
				va(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Mo(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return jo(t), t.flags |= 128, null;
					r = Sa(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Xc(e, t, n) : (jo(t), e = sl(e, t, n), e === null ? null : e.sibling);
				}
				jo(t);
				break;
			case 19:
				if (t.flags & 128) return al(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (Sa(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return al(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Lo(t, Io.current), r) break;
				return null;
			case 22: return t.lanes = 0, Ic(e, t, n, t.pendingProps);
			case 24: va(t, ja, e.memoizedState.cache);
		}
		return sl(e, t, n);
	}
	function ul(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) jc = !0;
			else {
				if (!cl(e, n) && !(t.flags & 128)) return jc = !1, ll(e, t, n);
				jc = !!(e.flags & 131072);
			}
		} else jc = !1, B && t.flags & 1048576 && $i(t, Ki, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = to(t.elementType), t.type = e, typeof e == "function") Ni(e) ? (r = bc(e, r), t.tag = 1, t = Gc(null, t, e, r, n)) : (t.tag = 0, t = Uc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === te) {
								t.tag = 11, t = Nc(null, t, e, r, n);
								break a;
							}
							if (a === ie) {
								t.tag = 14, t = Pc(null, t, e, r, n);
								break a;
							}
							if (a === P) {
								t.tag = 10, t.type = e, t = ol(null, t, n);
								break a;
							}
						}
						throw t = pe(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Uc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = bc(r, t.pendingProps), Gc(e, t, r, a, n);
			case 3:
				a: {
					if (Te(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, ho(e, t), xo(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, va(t, ja, r), r !== o.cache && xa(t, [ja], n, !0), bo(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = Kc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Hi(Error(i(424)), t), ma(a), t = Kc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (ia = dm(e.firstChild), ra = t, B = !0, aa = null, oa = !0, n = fo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (fa(), r === a) {
							t = sl(e, t, n);
							break a;
						}
						Mc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Hc(e, t), e === null ? (n = Fm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : B || (t.stateNode = mp(t.type, t.pendingProps, Ce.current, t)) : t.memoizedState = Fm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return De(t), e === null && B && (r = t.stateNode = _m(t.type, t.pendingProps, Ce.current), ra = t, oa = !0, a = ia, wp(t.type) ? (fm = a, ia = dm(r.firstChild)) : ia = a), Mc(e, t, t.pendingProps.children, n), Hc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && B && ((a = r = ia) && (r = am(r, t.type, t.pendingProps, oa), r === null ? a = !1 : (t.stateNode = r, ra = t, ia = dm(r.firstChild), oa = !1, a = !0)), a || ca(t)), De(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, hp(a, o) ? r = null : s !== null && hp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = Zo(e, t, es, null, null, n), lh._currentValue = a), Hc(e, t), Mc(e, t, r, n), t.child;
			case 6: return e === null && B && ((e = n = ia) && (n = om(n, t.pendingProps, oa), n === null ? e = !1 : (t.stateNode = n, ra = t, ia = null, e = !0)), e || ca(t)), null;
			case 13: return Xc(e, t, n);
			case 4: return Te(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = uo(t, null, r, n) : Mc(e, t, r, n), t.child;
			case 11: return Nc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Hc(e, t), Mc(e, t, r, n), t.child;
			case 8: return Mc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Mc(e, t, t.pendingProps.children, n), t.child;
			case 10: return ol(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, wa(t), a = Ta(a), r = r(a), t.flags |= 1, Mc(e, t, r, n), t.child;
			case 14: return Pc(e, t, t.type, t.pendingProps, n);
			case 15: return Fc(e, t, t.type, t.pendingProps, n);
			case 19: return al(e, t, n);
			case 31: return Vc(e, t, n);
			case 22: return Ic(e, t, n, t.pendingProps);
			case 24: return wa(t), r = Ta(ja), e === null ? (a = Ka(), a === null && (a = Qu, o = Ma(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, mo(t), va(t, ja, a)) : ((e.lanes & n) !== 0 && (ho(e, t), xo(t, null, null, n), bo()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, va(t, ja, r), r !== a.cache && xa(t, [ja], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), va(t, ja, r))), Mc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : B && ea(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Hc(e, t), Mc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function dl(e) {
		e.flags |= 4;
	}
	function fl(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Xm(t, r) : Xm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Ud()) e.flags |= 8192;
				else throw no = Qa, Xa;
			}
		} else e.flags &= -16777217;
	}
	function pl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Zm(t)) {
			if (Ud()) e.flags |= 8192;
			else throw no = Qa, Xa;
		}
	}
	function ml(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : dt(), e.lanes |= t, ud |= t);
	}
	function hl(e, t) {
		if (!B) switch (e.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var n = e.tail, r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
				break;
			default:
				for (t = e.tail, n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
		}
	}
	function gl(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function _l(e, t, n) {
		var r = t.pendingProps;
		switch (ta(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return gl(t), null;
			case 1: return gl(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), ya(ja), Ee(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (da(t) ? dl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, pa())), gl(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (dl(t), o === null ? (gl(t), fl(t, a, null, r, n)) : (gl(t), pl(t, o))) : o ? o === e.memoizedState ? (gl(t), t.flags &= -16777217) : (dl(t), gl(t), pl(t, o)) : (e = e.memoizedProps, e !== r && dl(t), gl(t), fl(t, a, e, r, n)), null;
			case 27:
				if (Oe(t), n = Ce.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && dl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return gl(t), t.subtreeFlags &= -33554433, null;
					}
					e = xe.current, da(t) ? la(t, e) : (e = _m(a, r, n), t.stateNode = e, dl(t));
				}
				return gl(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Oe(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && dl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return gl(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = xe.current, da(t)) la(t, o);
					else {
						var s = dp(Ce.current);
						switch (o) {
							case 1:
								o = s.createElementNS("http://www.w3.org/2000/svg", a);
								break;
							case 2:
								o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
								break;
							default: switch (a) {
								case "svg":
									o = s.createElementNS("http://www.w3.org/2000/svg", a);
									break;
								case "math":
									o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
									break;
								case "script":
									o = s.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(o.firstChild);
									break;
								case "select":
									o = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? o.multiple = !0 : r.size && (o.size = r.size);
									break;
								default: o = typeof r.is == "string" ? s.createElement(a, { is: r.is }) : s.createElement(a);
							}
						}
						o[Ct] = t, o[wt] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = o;
						a: switch (ip(o, a, r), a) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && dl(t);
					}
				}
				return gl(t), t.subtreeFlags &= -33554433, fl(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && dl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ce.current, da(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = ra, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[Ct] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || tp(e.nodeValue, n)), e || ca(t, !0);
					} else e = dp(e).createTextNode(r), e[Ct] = t, t.stateNode = e;
				}
				return gl(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = da(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[Ct] = t;
						} else fa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						gl(t), e = !1;
					} else n = pa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Fo(t), t) : (Fo(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return gl(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = da(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[Ct] = t;
						} else fa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						gl(t), a = !1;
					} else a = pa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Fo(t), t) : (Fo(t), null);
				}
				return Fo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), ml(t, t.updateQueue), gl(t), null);
			case 4: return Ee(), e === null && Gf(t.stateNode.containerInfo), t.flags |= 67108864, gl(t), null;
			case 10: return ya(t.type), gl(t), null;
			case 19:
				if (Ro(t), r = t.memoizedState, r === null) return gl(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) hl(r, !1);
					else {
						if (ad !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = zo(e), o !== null) {
								for (t.flags |= 128, hl(r, !1), e = o.updateQueue, t.updateQueue = e, ml(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Fi(n, e), n = n.sibling;
								return Lo(t, Io.current & 1 | 2), B && Qi(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Ve() > gd && (t.flags |= 128, a = !0, hl(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = zo(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, ml(t, e), hl(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !B) return gl(t), null;
						} else 2 * Ve() - r.renderingStartTime > gd && n !== 536870912 && (t.flags |= 128, a = !0, hl(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (o.sibling = t.child, t.child = o) : (e = r.last, e === null ? t.child = o : e.sibling = o, r.last = o);
				}
				if (r.tail !== null) {
					e = r.tail;
					a: {
						for (n = e; n !== null;) {
							if (n.alternate !== null) {
								n = !1;
								break a;
							}
							n = n.sibling;
						}
						n = !0;
					}
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ve(), e.sibling = null, o = Io.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || B ? Lo(t, o) : (n = o, be(ko, t), be(Io, n), Ao === null && (Ao = t)), B && Qi(t, r.treeForkCount), e;
				}
				return gl(t), null;
			case 22:
			case 23: return Fo(t), Oo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (gl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : gl(t), n = t.updateQueue, n !== null && ml(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && ye(Ga), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), ya(ja), gl(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, gl(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function vl(e, t) {
		switch (ta(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return ya(ja), Ee(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Oe(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Fo(t), t.alternate === null) throw Error(i(340));
					fa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Fo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					fa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Ro(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Ee(), null;
			case 10: return ya(t.type), null;
			case 22:
			case 23: return Fo(t), Oo(), e !== null && ye(Ga), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return ya(ja), null;
			case 25: return null;
			default: return null;
		}
	}
	function yl(e, t) {
		switch (ta(t), t.tag) {
			case 3:
				ya(ja), Ee();
				break;
			case 26:
			case 27:
			case 5:
				Oe(t);
				break;
			case 4:
				Ee();
				break;
			case 31:
				t.memoizedState !== null && Fo(t);
				break;
			case 13:
				Fo(t);
				break;
			case 19:
				Ro(t);
				break;
			case 10:
				ya(t.type);
				break;
			case 22:
			case 23:
				Fo(t), Oo(), e !== null && ye(Ga);
				break;
			case 24: ya(ja);
		}
	}
	function bl(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			mf(t, t.return, e);
		}
	}
	function xl(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								mf(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			mf(t, t.return, e);
		}
	}
	function Sl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Co(t, n);
			} catch (t) {
				mf(e, e.return, t);
			}
		}
	}
	function Cl(e, t, n) {
		n.props = bc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			mf(e, t, n);
		}
	}
	function wl(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						var i = e.stateNode, a = _i(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Ip(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Lp(e);
							p(e.child, !1, em, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			mf(e, t, n);
		}
	}
	function Tl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				mf(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				mf(e, t, n);
			}
			else n.current = null;
		}
	}
	function El(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) nm(e.stateNode, t[n]);
	}
	function Dl(e) {
		for (var t = e.return; t !== null && (Al(t) && nm(e.stateNode, t.stateNode), !kl(t));) t = t.return;
	}
	function Ol(e) {
		for (var t = e.return; t !== null && (Al(t) && rm(e.stateNode, t.stateNode), !kl(t));) t = t.return;
	}
	function kl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function Al(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function jl(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			mf(e, e.return, t);
		}
	}
	function Ml(e, t, n) {
		try {
			var r = e.stateNode;
			op(r, e.type, n, t), r[wt] = t;
		} catch (t) {
			mf(e, e.return, t);
		}
	}
	function Nl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && wp(e.type) || e.tag === 4;
	}
	function Pl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Nl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && wp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Fl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = yn)), El(e, r), R = !0;
		else if (i !== 4 && (i === 27 && (El(e, r), r = null, wp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Fl(e, t, n, r), e = e.sibling; e !== null;) Fl(e, t, n, r), e = e.sibling;
	}
	function Il(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), El(e, r), R = !0;
		else if (i !== 4 && (i === 27 && (El(e, r), r = null, wp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Il(e, t, n, r), e = e.sibling; e !== null;) Il(e, t, n, r), e = e.sibling;
	}
	function K(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			ip(t, r, n), t[Ct] = e, t[wt] = n;
		} catch (t) {
			mf(e, e.return, t);
		}
	}
	var Ll = !1, Rl = null;
	function zl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Ll = !0);
	}
	var Bl = null;
	function Vl() {
		var e = Bl;
		return Bl = null, e;
	}
	var Hl = 0;
	function Ul(e, t, n, r, i) {
		return Hl = 0, Wl(e.child, t, n, r, i);
	}
	function Wl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = Ap(o);
					r.push(s), s.view && (a = !0);
				} else a || Ap(o).view && (a = !0);
				Ll = !0, Dp(o, Hl === 0 ? t : t + "_" + Hl, n), Hl++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Wl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Gl(e, t) {
		for (; e !== null;) e.tag === 5 ? Op(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Gl(e.child, t)), e = e.sibling;
	}
	function Kl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Kl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = yi(t.default, t.share), t !== "none" && (Ul(e, n, t, null, !1) || Gl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function ql(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = _i(r, n), a = yi(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Kl(e) : Ul(e, i, a, null, !1) ? (Kl(e), n.paired || t || Nd(e, r.onEnter)) : Gl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) ql(e, t), e = e.sibling;
		else Kl(e);
	}
	function Jl(e) {
		if (Rl !== null && Rl.size !== 0) {
			var t = Rl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = yi(n.default, n.share);
								if (a !== "none" && (Ul(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Nd(e, n.onShare)) : Gl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Jl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Yl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = _i(t, e.stateNode), r = Rl === null ? void 0 : Rl.get(n), i = yi(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Ul(e, n, i, null, !1) ? r === void 0 ? Nd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Rl.delete(n), Nd(e, t.onShare)) : Gl(e.child, !1)), Rl !== null && Jl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Yl(e), e = e.sibling;
		else Rl !== null && Jl(e);
	}
	function Xl(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = _i(t, e.stateNode);
				t = yi(t.default, t.update), e.flags &= -5, t !== "none" && Ul(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Xl(e);
			e = e.sibling;
		}
	}
	function Zl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Gl(e.child, !1));
				}
				Zl(e);
			}
			e = e.sibling;
		}
	}
	function Ql(e) {
		if (e.tag === 30) e.stateNode.paired = null, Gl(e.child, !1), Zl(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Ql(e), e = e.sibling;
		else Zl(e);
	}
	function $l(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Gl(e.child, !1) : e.subtreeFlags & 33554432 && $l(e), e = e.sibling;
	}
	function eu(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Hl < a.length) {
					var l = a[Hl], u = Ap(c);
					(l.view || u.view) && (s = !0);
					var d;
					if (d = !(e.flags & 4)) {
						if (u.clip) d = !0;
						else {
							d = l.rect;
							var f = u.rect;
							d = d.y !== f.y || d.x !== f.x || d.height !== f.height || d.width !== f.width;
						}
					}
					d && (e.flags |= 4), u.abs ? u = !l.abs : (l = l.rect, u = u.rect, u = l.height !== u.height || l.width !== u.width), u && (e.flags |= 32);
				} else e.flags |= 32;
				e.flags & 4 && Dp(c, Hl === 0 ? n : n + "_" + Hl, i), s && e.flags & 4 || (Bl === null && (Bl = []), Bl.push(c, Hl === 0 ? r : r + "_" + Hl, t.memoizedProps)), Hl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : eu(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function tu(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = _i(n, r), a = yi(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(jp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Hl = 0, i = eu(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Nd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && tu(e, t);
			e = e.sibling;
		}
	}
	var nu = !1, q = !1, ru = !1, iu = !1, au = typeof WeakSet == "function" ? WeakSet : Set, ou = null, su = !1, cu = !1, lu = !1, uu = !1;
	function du(e, t, n) {
		if (e = e.containerInfo, lp = _h, e = qr(e), Jr(e)) {
			if ("selectionStart" in e) var r = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				r = (r = e.ownerDocument) && r.defaultView || window;
				var i = r.getSelection && r.getSelection();
				if (i && i.rangeCount !== 0) {
					r = i.anchorNode;
					var a = i.anchorOffset, o = i.focusNode;
					i = i.focusOffset;
					try {
						r.nodeType, o.nodeType;
					} catch {
						r = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== r || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || i !== 0 && f.nodeType !== 3 || (l = s + i), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === r && ++u === a && (c = s), p === o && ++d === i && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					r = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else r = null;
			}
			r ||= {
				start: 0,
				end: 0
			};
		} else r = null;
		for (up = {
			focusedElem: e,
			selectionRange: r
		}, _h = !1, n = (n & 335544064) === n, ou = t, t = n ? 9270 : 1024; ou !== null;) {
			if (e = ou, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Yl(r[a]);
			if (e.alternate === null && e.flags & 2) n && zl(e), fu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Yl(r), fu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && zl(e), fu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, ou = r) : (n && Xl(e), fu(n));
			}
		}
		Rl = null;
	}
	function fu(e) {
		for (; ou !== null;) {
			var t = ou, n = e, r = t.alternate, a = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (a & 1024 && r !== null) {
						n = void 0, a = r.memoizedProps, r = r.memoizedState;
						var o = t.stateNode;
						try {
							var s = bc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							mf(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) im(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								im(r);
								break;
							default: r.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					n && r !== null && (n = _i(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = yi(a.default, a.update), a !== "none" && Ul(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, ou = r;
				break;
			}
			ou = t.return;
		}
	}
	function pu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Nu(e, n), r & 4 && bl(5, n);
				break;
			case 1:
				if (Nu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						mf(n, n.return, e);
					}
					else {
						var i = bc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							mf(n, n.return, e);
						}
					}
				}
				r & 64 && Sl(n), r & 512 && wl(n, n.return);
				break;
			case 3:
				if (Nu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Co(e, t);
					} catch (e) {
						mf(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && K(n);
			case 26:
			case 5:
				Nu(e, n), t === null && r & 4 && jl(n), r & 512 && wl(n, n.return);
				break;
			case 12:
				Nu(e, n);
				break;
			case 31:
				Nu(e, n), r & 4 && Su(e, n);
				break;
			case 13:
				Nu(e, n), r & 4 && Cu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = vf.bind(null, n), um(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || nu, !r) {
					var a = t !== null && t.memoizedState !== null || q;
					t = nu, i = q, nu = r, (q = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Fu(e, n, r)) : Nu(e, n), nu = t, q = i;
				}
				break;
			case 30:
				Nu(e, n), r & 512 && wl(n, n.return);
				break;
			case 7: r & 512 && wl(n, n.return);
			default: Nu(e, n);
		}
	}
	function mu(e, t) {
		for (e = e.child; e !== null;) hu(e, t), e = e.sibling;
	}
	function hu(e, t) {
		switch (e.tag) {
			case 5:
			case 26:
				try {
					var n = e.stateNode;
					if (t) {
						var r = n.style;
						typeof r.setProperty == "function" ? r.setProperty("display", "none", "important") : r.display = "none";
					} else {
						var i = e.stateNode, a = e.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null;
						i.style.display = o == null || typeof o == "boolean" ? "" : ("" + o).trim();
					}
				} catch (t) {
					mf(e, e.return, t);
				}
				gu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, R = !0;
				} catch (t) {
					mf(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? Ep(s, !0) : Ep(e.stateNode, !1);
				} catch (t) {
					mf(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && mu(e, t);
				break;
			default: mu(e, t);
		}
	}
	function gu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						hu(n, r);
						break a;
					case 22:
						n.memoizedState === null && gu(n, r);
						break a;
					default: gu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function _u(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, _u(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Mt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var vu = null, yu = !1;
	function bu(e, t, n) {
		for (n = n.child; n !== null;) xu(e, t, n), n = n.sibling;
	}
	function xu(e, t, n) {
		if (Ze && typeof Ze.onCommitFiberUnmount == "function") try {
			Ze.onCommitFiberUnmount(Xe, n);
		} catch {}
		switch (n.tag) {
			case 26:
				q || Tl(n, t), bu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !q && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				q || Tl(n, t), Ol(n);
				var r = vu, i = yu;
				wp(n.type) && (vu = n.stateNode, yu = !1), bu(e, t, n), vm(n.stateNode, n.type, n.memoizedProps), vu = r, yu = i;
				break;
			case 5: q || Tl(n, t), Ol(n);
			case 6:
				if (n.tag === 6 && Ol(n), r = vu, i = yu, vu = null, bu(e, t, n), vu = r, yu = i, vu !== null) {
					if (yu) try {
						(vu.nodeType === 9 ? vu.body : vu.nodeName === "HTML" ? vu.ownerDocument.body : vu).removeChild(n.stateNode), R = !0;
					} catch (e) {
						mf(n, t, e);
					}
					else try {
						vu.removeChild(n.stateNode), R = !0;
					} catch (e) {
						mf(n, t, e);
					}
				}
				break;
			case 18:
				vu !== null && (yu ? (e = vu, Tp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Uh(e)) : Tp(vu, n.stateNode));
				break;
			case 4:
				r = vu, i = yu, vu = n.stateNode.containerInfo, yu = !0, bu(e, t, n), vu = r, yu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				xl(2, n, t), q || xl(4, n, t), bu(e, t, n);
				break;
			case 1:
				q || (Tl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Cl(n, t, r)), bu(e, t, n);
				break;
			case 21:
				bu(e, t, n);
				break;
			case 22:
				q = (r = q) || n.memoizedState !== null, bu(e, t, n), q = r;
				break;
			case 30:
				Tl(n, t), bu(e, t, n);
				break;
			case 7:
				q || Tl(n, t), bu(e, t, n);
				break;
			default: bu(e, t, n);
		}
	}
	function Su(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Uh(e);
			} catch (e) {
				mf(t, t.return, e);
			}
		}
	}
	function Cu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Uh(e);
		} catch (e) {
			mf(t, t.return, e);
		}
	}
	function wu(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new au()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new au()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function Tu(e, t) {
		var n = wu(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = yf.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function Eu(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (wp(l.type)) {
							vu = l.stateNode, yu = !1;
							break a;
						}
						break;
					case 5:
						vu = l.stateNode, yu = !1;
						break a;
					case 3:
					case 4:
						vu = l.stateNode.containerInfo, yu = !0;
						break a;
				}
				l = l.return;
			}
			if (vu === null) throw Error(i(160));
			xu(s, c, o), vu = null, yu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) Ou(t, e, n), t = t.sibling;
	}
	var Du = null;
	function Ou(e, t, n) {
		var r = e.alternate, a = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (a & 4 && (r = e.updateQueue, r = r === null ? null : r.events, r !== null)) for (var o = 0; o < r.length; o++) {
					var s = r[o];
					s.ref.impl = s.nextImpl;
				}
				Eu(t, e, n), ku(e), a & 4 && (xl(3, e, e.return), bl(3, e), xl(5, e, e.return));
				break;
			case 1:
				Eu(t, e, n), ku(e), a & 512 && (q || r === null || Tl(r, r.return)), a & 64 && nu && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = Du, Eu(t, e, n), ku(e), a & 512 && (q || r === null || Tl(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (nu) e.stateNode = mp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[At] || r[Ct] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), ip(r, t, n), r[Ct] = e, Lt(r), t = r;
												break a;
											case "link":
												if (o = qm("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), ip(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = qm("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), ip(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[Ct] = e, Lt(r), t = r;
									}
									e.stateNode = t;
								}
							} else nu || Jm(o, e.type, e.stateNode);
						} else e.stateNode = Hm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Ml(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || q || t.parentNode.removeChild(t)) : a.count--, n === null ? nu || Jm(o, e.type, e.stateNode) : Hm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Eu(t, e, n), ku(e), a & 512 && (q || r === null || Tl(r, r.return)), r !== null && a & 4 && Ml(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = ru, ru = !1, Eu(t, e, n), ru = o, ku(e), a & 512 && (q || r === null || Tl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						dn(t, ""), R = !0;
					} catch (t) {
						mf(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Ml(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (iu = !0);
				break;
			case 6:
				if (Eu(t, e, n), ku(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, R = !0;
					} catch (t) {
						mf(e, e.return, t);
					}
				}
				break;
			case 3:
				if (R = !1, Km = null, o = Du, Du = Sm(t.containerInfo), Eu(t, e, n), Du = o, ku(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Uh(t.containerInfo);
				} catch (t) {
					mf(e, e.return, t);
				}
				iu && (iu = !1, Au(e)), R = !1;
				break;
			case 4:
				a = ru, ru = nu, r = qt(), o = Du, Du = Sm(e.stateNode.containerInfo), Eu(t, e, n), ku(e), Du = o, R && cu && (lu = !0), R = r, ru = a;
				break;
			case 12:
				Eu(t, e, n), ku(e);
				break;
			case 31:
				Eu(t, e, n), ku(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Tu(e, t)));
				break;
			case 13:
				Eu(t, e, n), ku(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (md = Ve()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Tu(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = nu, l = q, u = ru;
				nu = c || o, ru = u || o, q = l || s, Eu(t, e, n), q = l, ru = u, nu = c, ku(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || nu || q || (t = s || q, n = nu, r = q, nu = o || nu, q = t, Pu(e, 2), nu = n, q = r), !o && ru || mu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Tu(e, n))));
				break;
			case 19:
				Eu(t, e, n), ku(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Tu(e, t)));
				break;
			case 30:
				a & 512 && (q || r === null || Tl(r, r.return)), a = qt(), o = cu, s = (n & 335544064) === n, c = e.memoizedProps, cu = s && yi(c.default, c.update) !== "none", Eu(t, e, n), ku(e), s && r !== null && R && (e.flags |= 4), cu = o, R = a;
				break;
			case 21: break;
			case 7: a & 512 && (q || r === null || Tl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Eu(t, e, n), ku(e);
		}
	}
	function ku(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Nl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (Al(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (kl(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Il(e, Pl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (dn(l, ""), n.flags &= -33), Il(e, Pl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Fl(e, Pl(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				mf(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Au(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			Au(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, _h = !0, t.reset(), _h = !1), e = e.sibling;
		}
	}
	function ju(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Mu(t, e), t = t.sibling;
		else tu(t, !1);
	}
	function Mu(e, t) {
		var n = e.alternate;
		if (n === null) ql(e, !1);
		else switch (e.tag) {
			case 3:
				if (uu = su = !1, Vl(), ju(t, e), !su && !lu) {
					if (e = Bl, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Op(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + i + ")"
						});
					}
					e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), e.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					})), uu = !0;
				}
				Bl = null;
				break;
			case 5:
				ju(t, e);
				break;
			case 4:
				r = su, su = !1, ju(t, e), su && (lu = !0), su = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? ju(t, e) : ql(e, !1));
				break;
			case 30:
				r = su, i = Vl(), su = !1, ju(t, e), su && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = _i(a, o), o = _i(n.memoizedProps, o);
				var s = yi(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Hl = 0, t = eu(e, n, t, o, s, a, !0), Hl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Nd(e, e.memoizedProps.onUpdate), Bl = i) : i !== null && (i.push.apply(i, Bl), Bl = i), su = e.flags & 32 ? !0 : r;
				break;
			default: ju(t, e);
		}
	}
	function Nu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) pu(e, t.alternate, t), t = t.sibling;
	}
	function Pu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					xl(4, n, n.return), Pu(n, r);
					break;
				case 1:
					Tl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && Cl(n, n.return, i), Pu(n, r);
					break;
				case 27: r & 2 && vm(n.stateNode, n.type, n.memoizedProps);
				case 5:
					Tl(n, n.return), n.tag !== 5 && n.tag !== 27 || Ol(n), Pu(n, r);
					break;
				case 6:
					Ol(n);
					break;
				case 26:
					Tl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || q || i.parentNode.removeChild(i), Pu(n, r);
					break;
				case 22:
					n.memoizedState === null && Pu(n, r);
					break;
				case 30:
					Tl(n, n.return), Pu(n, r);
					break;
				case 7: Tl(n, n.return);
				default: Pu(n, r);
			}
			e = e.sibling;
		}
	}
	function Fu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Fu(i, a, n), bl(4, a);
					break;
				case 1:
					if (Fu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						mf(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) So(l[i], c);
						} catch (e) {
							mf(r, r.return, e);
						}
					}
					s && o & 64 && Sl(a), wl(a, a.return);
					break;
				case 27: n & 2 && K(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Dl(a), Fu(i, a, n), s && r === null && o & 4 && jl(a), wl(a, a.return);
					break;
				case 6:
					Dl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || nu || Jm(Sm(c.ownerDocument), a.type, c), Fu(i, a, n), s && r === null && o & 4 && jl(a), wl(a, a.return);
					break;
				case 12:
					Fu(i, a, n);
					break;
				case 31:
					Fu(i, a, n), s && o & 4 && Su(i, a);
					break;
				case 13:
					Fu(i, a, n), s && o & 4 && Cu(i, a);
					break;
				case 22:
					a.memoizedState === null && Fu(i, a, n), wl(a, a.return);
					break;
				case 30:
					Fu(i, a, n), wl(a, a.return);
					break;
				case 7: wl(a, a.return);
				default: Fu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Iu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Na(n));
	}
	function Lu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Na(e));
	}
	function Ru(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) zu(e, t, n, r), t = t.sibling;
		else i && $l(t);
	}
	function zu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && Ql(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Ru(e, t, n, r), a & 2048 && bl(9, t);
				break;
			case 1:
				Ru(e, t, n, r);
				break;
			case 3:
				Ru(e, t, n, r), i && uu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Na(a)));
				break;
			case 12:
				if (a & 2048) {
					Ru(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						mf(t, t.return, e);
					}
				} else Ru(e, t, n, r);
				break;
			case 31:
				Ru(e, t, n, r);
				break;
			case 13:
				Ru(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && Ql(t), o._visibility & 2 ? Ru(e, t, n, r) : (o._visibility |= 2, Bu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && Ql(s), o._visibility & 2 ? Ru(e, t, n, r) : Vu(e, t)), a & 2048 && Iu(s, t);
				break;
			case 24:
				Ru(e, t, n, r), a & 2048 && Lu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Gl(a.child, !0), Gl(t.child, !0))), Ru(e, t, n, r);
				break;
			default: Ru(e, t, n, r);
		}
	}
	function Bu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Bu(a, o, s, c, i), bl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Bu(a, o, s, c, i)) : u._visibility & 2 ? Bu(a, o, s, c, i) : Vu(a, o), i && l & 2048 && Iu(o.alternate, o);
					break;
				case 24:
					Bu(a, o, s, c, i), i && l & 2048 && Lu(o.alternate, o);
					break;
				default: Bu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Vu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Vu(n, r), i & 2048 && Iu(r.alternate, r);
					break;
				case 24:
					Vu(n, r), i & 2048 && Lu(r.alternate, r);
					break;
				default: Vu(n, r);
			}
			t = t.sibling;
		}
	}
	var Hu = 8192;
	function Uu(e, t, n) {
		if (e.subtreeFlags & Hu) for (e = e.child; e !== null;) Wu(e, t, n), e = e.sibling;
	}
	function Wu(e, t, n) {
		switch (e.tag) {
			case 26:
				Uu(e, t, n), e.flags & Hu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && $m(n, e)) : eh(n, Du, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Uu(e, t, n), e.flags & Hu && (e = e.stateNode, (t & 335544128) === t && $m(n, e));
				break;
			case 3:
			case 4:
				var r = Du;
				Du = Sm(e.stateNode.containerInfo), Uu(e, t, n), Du = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Hu, Hu = 16777216, Uu(e, t, n), Hu = r) : Uu(e, t, n));
				break;
			case 30:
				if ((e.flags & Hu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Rl === null && (Rl = /* @__PURE__ */ new Map()), Rl.set(r, i);
				}
				Uu(e, t, n);
				break;
			default: Uu(e, t, n);
		}
	}
	function Gu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Ku(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				ou = r, Yu(r, e);
			}
			Gu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) qu(e), e = e.sibling;
	}
	function qu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Ku(e), e.flags & 2048 && xl(9, e, e.return);
				break;
			case 3:
				Ku(e);
				break;
			case 12:
				Ku(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ju(e)) : Ku(e);
				break;
			default: Ku(e);
		}
	}
	function Ju(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				ou = r, Yu(r, e);
			}
			Gu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					xl(8, t, t.return), Ju(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Ju(t));
					break;
				default: Ju(t);
			}
			e = e.sibling;
		}
	}
	function Yu(e, t) {
		for (; ou !== null;) {
			var n = ou;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					xl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Na(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, ou = r;
			else a: for (n = e; ou !== null;) {
				r = ou;
				var i = r.sibling, a = r.return;
				if (_u(r), r === n) {
					ou = null;
					break a;
				}
				if (i !== null) {
					i.return = a, ou = i;
					break a;
				}
				ou = a;
			}
		}
	}
	var Xu = {
		getCacheForType: function(e) {
			var t = Ta(ja), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Ta(ja).controller.signal;
		}
	}, Zu = typeof WeakMap == "function" ? WeakMap : Map, J = 0, Qu = null, Y = null, X = 0, $u = 0, ed = null, td = !1, nd = !1, rd = !1, id = 0, ad = 0, od = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = null, fd = null, pd = !1, md = 0, hd = 0, gd = Infinity, _d = null, vd = null, yd = 0, bd = null, xd = null, Sd = 0, Cd = 0, wd = null, Td = null, Ed = null, Dd = null, Od = null, kd = 0, Ad = null;
	function jd() {
		return J & 2 && X !== 0 ? X & -X : I.T === null ? bt() : Ff();
	}
	function Md() {
		if (ld === 0) {
			if (!(X & 536870912) || B) {
				var e = it;
				it <<= 1, !(it & 3932160) && (it = 262144), ld = e;
			} else ld = 536870912;
		}
		return e = ko.current, e !== null && (e.flags |= 32), ld;
	}
	function Nd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Ip(_i(e.memoizedProps, n))), Dd === null && (Dd = []), Dd.push(t.bind(null, r));
		}
	}
	function Pd(e, t, n) {
		(e === Qu && ($u === 2 || $u === 9) || e.cancelPendingCommit !== null) && (Vd(e, 0), Rd(e, X, ld, !1)), pt(e, n), (!(J & 2) || e !== Qu) && (e === Qu && (!(J & 2) && (sd |= n), ad === 4 && Rd(e, X, ld, !1)), Df(e));
	}
	function Fd(e, t, n) {
		if (J & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || ct(e, t), a = r ? Yd(e, t) : qd(e, t, !0), o = r;
		do {
			if (a === 0) {
				nd && !r && Rd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Ld(n)) a = qd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = dd;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Vd(c, s).flags |= 256), s = qd(c, s, !1), s !== 2 && s !== 6) {
								if (rd && !l) {
									c.errorRecoveryDisabledLanes |= o, sd |= o, a = 4;
									break a;
								}
								o = fd, fd = a, o !== null && (fd === null ? fd = o : fd.push.apply(fd, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					Vd(e, 0), Rd(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							Rd(r, t, ld, !td);
							break a;
						case 2:
							fd = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = md + 300 - Ve(), 10 < a)) {
						if (Rd(r, t, ld, !td), st(r, 0, !0) !== 0) break a;
						Sd = t, r.timeoutHandle = vp(Id.bind(null, r, n, fd, _d, pd, t, ld, sd, ud, td, o, "Throttled", -0, 0), a);
						break a;
					}
					Id(r, n, fd, _d, pd, t, ld, sd, ud, td, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		Df(e);
	}
	function Id(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.timeoutHandle = -1;
		var m = t.subtreeFlags, h = (a & 335544064) === a;
		d = null, (h || m & 8192 || (m & 16785408) == 16785408) && (d = {
			stylesheets: null,
			count: 0,
			imgCount: 0,
			imgBytes: 0,
			suspenseyImages: [],
			waitingForImages: !0,
			waitingForViewTransition: !1,
			unsuspend: yn
		}, Rl = null, Wu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = ih.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? md - Ve() : (a & 4194048) === a ? hd - Ve() : 0, m = nh(d, m), m !== null) ? (Sd = a, e.cancelPendingCommit = m(nf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Rd(e, a, o, !l)) : nf(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Ld(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Vr(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function Rd(e, t, n, r) {
		t = lt(e, t), t &= ~cd, t &= ~sd, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - $e(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && ht(e, n, t);
	}
	function zd() {
		return J & 6 ? !0 : (Of(0, !1), !1);
	}
	function Bd() {
		if (Y !== null) {
			if ($u === 0) var e = Y.return;
			else e = Y, _a = ga = null, rs(e), io = null, ao = 0, e = Y;
			for (; e !== null;) yl(e.alternate, e), e = e.return;
			Y = null;
		}
	}
	function Vd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, yp(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Sd = 0, Bd(), Qu = e, Y = n = Pi(e.current, null), X = t, $u = 0, ed = null, td = !1, nd = ct(e, t), rd = !1, ud = ld = cd = sd = od = ad = 0, fd = dd = null, pd = !1, id = lt(e, t), wi(), n;
	}
	function Hd(e, t) {
		U = null, I.H = pc, t === Ya || t === Za ? (t = V(), $u = 3) : t === Xa ? (t = V(), $u = 4) : $u = t === Ac ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, ed = t, Y === null && (ad = 1, wc(e, Hi(t, e.current)));
	}
	function Ud() {
		var e = ko.current;
		return e === null ? !0 : (X & 4194048) === X ? Ao === null : (X & 62914560) === X || X & 536870912 ? e === Ao : !1;
	}
	function Wd() {
		var e = I.H;
		return I.H = pc, e === null ? pc : e;
	}
	function Gd() {
		var e = I.A;
		return I.A = Xu, e;
	}
	function Kd() {
		ad = 4, td || (X & 4194048) !== X && ko.current !== null || (nd = !0), !(od & 134217727) && !(sd & 134217727) || Qu === null || Rd(Qu, X, ld, !1);
	}
	function qd(e, t, n) {
		var r = J;
		J |= 2;
		var i = Wd(), a = Gd();
		(Qu !== e || X !== t) && (_d = null, Vd(e, t)), t = !1;
		var o = ad;
		a: do
			try {
				if ($u !== 0 && Y !== null) {
					var s = Y, c = ed;
					switch ($u) {
						case 8:
							Bd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							ko.current === null && (t = !0);
							var l = $u;
							if ($u = 0, ed = null, $d(e, s, c, l), n && nd) {
								o = 0;
								break a;
							}
							break;
						default: l = $u, $u = 0, ed = null, $d(e, s, c, l);
					}
				}
				Jd(), o = ad;
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, _a = ga = null, J = r, I.H = i, I.A = a, Y === null && (Qu = null, X = 0, wi()), o;
	}
	function Jd() {
		for (; Y !== null;) Zd(Y);
	}
	function Yd(e, t) {
		var n = J;
		J |= 2;
		var r = Wd(), a = Gd();
		Qu !== e || X !== t ? (_d = null, gd = Ve() + 500, Vd(e, t)) : nd = ct(e, t);
		a: do
			try {
				if ($u !== 0 && Y !== null) {
					t = Y;
					var o = ed;
					b: switch ($u) {
						case 1:
							$u = 0, ed = null, $d(e, t, o, 1);
							break;
						case 2:
						case 9:
							if ($a(o)) {
								$u = 0, ed = null, Qd(t);
								break;
							}
							t = function() {
								$u !== 2 && $u !== 9 || Qu !== e || ($u = 7), Df(e);
							}, o.then(t, t);
							break a;
						case 3:
							$u = 7;
							break a;
						case 4:
							$u = 5;
							break a;
						case 7:
							$a(o) ? ($u = 0, ed = null, Qd(t)) : ($u = 0, ed = null, $d(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (Y.tag) {
								case 26: s = Y.memoizedState;
								case 5:
								case 27:
									var c = Y;
									if (s ? Zm(s) : c.stateNode.complete) {
										$u = 0, ed = null;
										var l = c.sibling;
										if (l !== null) Y = l;
										else {
											var u = c.return;
											u === null ? Y = null : (Y = u, ef(u));
										}
										break b;
									}
							}
							$u = 0, ed = null, $d(e, t, o, 5);
							break;
						case 6:
							$u = 0, ed = null, $d(e, t, o, 6);
							break;
						case 8:
							Bd(), ad = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Xd();
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return _a = ga = null, I.H = r, I.A = a, J = n, Y === null ? (Qu = null, X = 0, wi(), ad) : 0;
	}
	function Xd() {
		for (; Y !== null && !ze();) Zd(Y);
	}
	function Zd(e) {
		var t = ul(e.alternate, e, id);
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : Y = t;
	}
	function Qd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Wc(n, t, t.pendingProps, t.type, void 0, X);
				break;
			case 11:
				t = Wc(n, t, t.pendingProps, t.type.render, t.ref, X);
				break;
			case 5:
				rs(t);
				var r = t;
				r === ra && (B ? (ua(r), r.tag === 5 && r.stateNode != null && (ia = r.stateNode)) : (ua(r), B = !0));
			default: yl(n, t), t = Y = Fi(t, id), t = ul(n, t, id);
		}
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : Y = t;
	}
	function $d(e, t, n, r) {
		_a = ga = null, rs(t), io = null, ao = 0;
		var i = t.return;
		try {
			if (kc(e, i, t, n, X)) {
				ad = 1, wc(e, Hi(n, e.current)), Y = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw Y = i, t;
			ad = 1, wc(e, Hi(n, e.current)), Y = null;
			return;
		}
		t.flags & 32768 ? (B || r === 1 ? e = !0 : nd || X & 536870912 ? e = !1 : (td = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = ko.current, r !== null && r.tag === 13 && (r.flags |= 16384))), tf(t, e)) : ef(t);
	}
	function ef(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				tf(t, td);
				return;
			}
			e = t.return;
			var n = _l(t.alternate, t, id);
			if (n !== null) {
				Y = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				Y = t;
				return;
			}
			Y = t = e;
		} while (t !== null);
		ad === 0 && (ad = 5);
	}
	function tf(e, t) {
		do {
			var n = vl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, Y = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				Y = e;
				return;
			}
			Y = e = n;
		} while (e !== null);
		ad = 6, Y = null;
	}
	function nf(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			df();
		while (yd !== 0);
		if (J & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === Qu && (Y = Qu = null, X = 0), xd = t, bd = e, Sd = n, wd = a, Td = r, rf(e, t, n, s, c, l, f);
		}
	}
	function rf(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (Cd = s, s |= Ci, mt(e, n, s, r, i, a), Dd = null, (n & 335544064) === n ? (Od = Ia(e), r = 10262) : (Od = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, bf(Ge, function() {
			return ff(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Ll = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = I.T, I.T = null, i = L.p, L.p = 2, a = J, J |= 4;
			try {
				du(e, t, n);
			} finally {
				J = a, L.p = i, I.T = r;
			}
		}
		yd = 1, Ll ? Ed = Pp(o, e.containerInfo, Od, sf, cf, of, lf, ff, af, null, null) : (sf(), cf(), lf());
	}
	function af(e) {
		if (yd !== 0) {
			var t = bd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function of() {
		yd === 3 && (yd = 0, Mu(xd, bd), yd = 4);
	}
	function sf() {
		if (yd === 1) {
			yd = 0;
			var e = bd, t = xd, n = Sd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = I.T, I.T = null;
				var i = L.p;
				L.p = 2;
				var a = J;
				J |= 4;
				try {
					cu = lu = !1, Ou(t, e, n), n = up;
					var o = qr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Kr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Jr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Gr(s, h), v = Gr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					_h = !!lp, up = lp = null;
				} finally {
					J = a, L.p = i, I.T = r;
				}
			}
			e.current = t, yd = 2;
		}
	}
	function cf() {
		if (yd === 2) {
			yd = 0;
			var e = bd, t = xd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = I.T, I.T = null;
				var r = L.p;
				L.p = 2;
				var i = J;
				J |= 4;
				try {
					pu(e, t.alternate, t);
				} finally {
					J = i, L.p = r, I.T = n;
				}
			}
			yd = 3;
		}
	}
	function lf() {
		if (yd === 4 || yd === 3) {
			yd = 0;
			var e = Ed;
			Ed = null, Be();
			var t = bd, n = xd, r = Sd, i = Td, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? yd = 5 : (yd = 0, xd = bd = null, uf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (vd = null), yt(r), n = n.stateNode, Ze && typeof Ze.onCommitFiberRoot == "function") try {
				Ze.onCommitFiberRoot(Xe, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = I.T, a = L.p, L.p = 2, I.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					I.T = n, L.p = a;
				}
			}
			if (i = Dd, o = Od, Od = null, i !== null && (Dd = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Sd & 3 && df(), Df(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Ad ? kd++ : (kd = 0, Ad = t) : (kd = 0, Ad = null), Of(0, !1);
		}
	}
	function uf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Na(t)));
	}
	function df() {
		return Ed !== null && (Ed.skipTransition(), Ed = null), sf(), cf(), lf(), ff();
	}
	function ff() {
		if (yd !== 5) return !1;
		var e = bd, t = Cd;
		Cd = 0;
		var n = yt(Sd), r = I.T, a = L.p;
		try {
			L.p = 32 > n ? 32 : n, I.T = null, n = wd, wd = null;
			var o = bd, s = Sd;
			if (yd = 0, xd = bd = null, Sd = 0, J & 6) throw Error(i(331));
			var c = J;
			if (J |= 4, qu(o.current), zu(o, o.current, s, n), J = c, Of(0, !1), Ze && typeof Ze.onPostCommitFiberRoot == "function") try {
				Ze.onPostCommitFiberRoot(Xe, o);
			} catch {}
			return !0;
		} finally {
			L.p = a, I.T = r, uf(e, t);
		}
	}
	function pf(e, t, n) {
		t = Hi(n, t), t = Ec(e.stateNode, t, 2), e = H(e, t, 2), e !== null && (pt(e, 2), Df(e));
	}
	function mf(e, t, n) {
		if (e.tag === 3) pf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				pf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (vd === null || !vd.has(r))) {
					e = Hi(n, e), n = Dc(2), r = H(t, n, 2), r !== null && (Oc(n, r, t, e), pt(r, 2), Df(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function hf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Zu();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (rd = !0, i.add(n), e = gf.bind(null, e, t, n), t.then(e, e));
	}
	function gf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Qu === e && (X & n) === n && (ad === 4 || ad === 3 && (X & 62914560) === X && 300 > Ve() - md ? J & 2 ? cd |= n : Vd(e, 0) : cd |= n, ud === X && (ud = 0)), Df(e);
	}
	function _f(e, t) {
		t === 0 && (t = dt()), e = Di(e, t), e !== null && (pt(e, t), Df(e));
	}
	function vf(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), _f(e, n);
	}
	function yf(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, a = e.memoizedState;
				a !== null && (n = a.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(i(314));
		}
		r !== null && r.delete(t), _f(e, n);
	}
	function bf(e, t) {
		return Le(e, t);
	}
	var xf = null, Sf = null, Cf = !1, wf = !1, Tf = !1, Ef = 0;
	function Df(e) {
		e !== Sf && e.next === null && (Sf === null ? xf = Sf = e : Sf = Sf.next = e), wf = !0, Cf || (Cf = !0, Pf());
	}
	function Of(e, t) {
		if (!Tf && wf) {
			Tf = !0;
			do
				for (var n = !1, r = xf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - $e(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Nf(r, a));
						} else a = X, a = st(r, r === Qu ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || ct(r, a) || (n = !0, Nf(r, a));
					}
					r = r.next;
				}
			while (n);
			Tf = !1;
		}
	}
	function kf() {
		Af();
	}
	function Af() {
		wf = Cf = !1;
		var e = 0;
		Ef !== 0 && _p() && (e = Ef);
		for (var t = Ve(), n = null, r = xf; r !== null;) {
			var i = r.next, a = jf(r, t);
			a === 0 ? (r.next = null, n === null ? xf = i : n.next = i, i === null && (Sf = n)) : (n = r, (e !== 0 || a & 3) && (wf = !0)), r = i;
		}
		yd !== 0 && yd !== 5 || Of(e, !1), Ef !== 0 && (Ef = 0);
	}
	function jf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - $e(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = ut(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Qu, n = X, n = st(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && ($u === 2 || $u === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Re(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || ct(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Re(r), yt(n)) {
				case 2:
				case 8:
					n = We;
					break;
				case 32:
					n = Ge;
					break;
				case 268435456:
					n = qe;
					break;
				default: n = Ge;
			}
			return r = Mf.bind(null, e), n = Le(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Re(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Mf(e, t) {
		if (yd !== 0 && yd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (df() && e.callbackNode !== n) return null;
		var r = X;
		return r = st(e, e === Qu ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Fd(e, r, t), jf(e, Ve()), e.callbackNode != null && e.callbackNode === n ? Mf.bind(null, e) : null);
	}
	function Nf(e, t) {
		if (df()) return null;
		Fd(e, t, !0);
	}
	function Pf() {
		Sp(function() {
			J & 6 ? Le(Ue, kf) : Af();
		});
	}
	function Ff() {
		if (Ef === 0) {
			var e = za;
			e === 0 && (e = rt, rt <<= 1, !(rt & 261888) && (rt = 256)), Ef = e;
		}
		return Ef;
	}
	function If(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : vn(e);
	}
	function Lf(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = If((i[wt] || null).action), o = r.submitter;
			o && (t = (t = o[wt] || null) ? If(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Bn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Ef !== 0) {
								var e = new FormData(i, o);
								$s(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), $s(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var Rf = 0; Rf < mi.length; Rf++) {
		var zf = mi[Rf];
		hi(zf.toLowerCase(), "on" + (zf[0].toUpperCase() + zf.slice(1)));
	}
	hi(oi, "onAnimationEnd"), hi(si, "onAnimationIteration"), hi(ci, "onAnimationStart"), hi("dblclick", "onDoubleClick"), hi("focusin", "onFocus"), hi("focusout", "onBlur"), hi(li, "onTransitionRun"), hi(ui, "onTransitionStart"), hi(di, "onTransitionCancel"), hi(fi, "onTransitionEnd"), Ht("onMouseEnter", ["mouseout", "mouseover"]), Ht("onMouseLeave", ["mouseout", "mouseover"]), Ht("onPointerEnter", ["pointerout", "pointerover"]), Ht("onPointerLeave", ["pointerout", "pointerover"]), Vt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Vt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Vt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Vt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Vt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Vt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var Bf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Vf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Bf));
	function Hf(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						bi(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						bi(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Z(e, t) {
		var n = t[Et];
		n === void 0 && (n = t[Et] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Kf(t, e, 2, !1), n.add(r));
	}
	function Uf(e, t, n) {
		var r = 0;
		t && (r |= 4), Kf(n, e, r, t);
	}
	var Wf = "_reactListening" + Math.random().toString(36).slice(2);
	function Gf(e) {
		if (!e[Wf]) {
			e[Wf] = !0, zt.forEach(function(t) {
				t !== "selectionchange" && (Vf.has(t) || Uf(t, !1, e), Uf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Wf] || (t[Wf] = !0, Uf("selectionchange", !1, t));
		}
	}
	function Kf(e, t, n, r) {
		switch (wh(t)) {
			case 2:
				var i = vh;
				break;
			case 8:
				i = yh;
				break;
			default: i = bh;
		}
		n = i.bind(null, t, n, e), i = void 0, !kn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function qf(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var s = r.tag;
			if (s === 3 || s === 4) {
				var c = r.stateNode.containerInfo;
				if (c === i) break;
				if (s === 4) for (s = r.return; s !== null;) {
					var l = s.tag;
					if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
					s = s.return;
				}
				for (; c !== null;) {
					if (s = Nt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		En(function() {
			var r = a, i = xn(n), s = [];
			a: {
				var c = pi.get(e);
				if (c !== void 0) {
					var l = Bn, u = e;
					switch (e) {
						case "keypress": if (Fn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = ir;
							break;
						case "focusin":
							u = "focus", l = Yn;
							break;
						case "focusout":
							u = "blur", l = Yn;
							break;
						case "beforeblur":
						case "afterblur":
							l = Yn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							l = qn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = Jn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = z;
							break;
						case oi:
						case si:
						case ci:
							l = Xn;
							break;
						case fi:
							l = sr;
							break;
						case "scroll":
						case "scrollend":
							l = Hn;
							break;
						case "wheel":
							l = cr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = Zn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = ar;
							break;
						case "submit":
							l = or;
							break;
						case "toggle":
						case "beforetoggle": l = lr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = Dn(m, p), g != null && d.push(Jf(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (c = new l(c, u, null, n, i), s.push({
						event: c,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== bn && (u = n.relatedTarget || n.fromElement) && (Nt(u) || u[Tt])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Nt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = qn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = ar, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Ft(c), h = l == null ? u : Ft(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, Nt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? E(c, l, Xf) : null, c !== null && Zf(s, u, c, d, !1), l !== null && f !== null && Zf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Ft(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = kr;
					else if (Cr(c)) {
						if (Ar) _ = zr;
						else {
							_ = Lr;
							var v = Ir;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && hn(r.elementType) && (_ = kr) : _ = Rr;
					if (_ &&= _(e, r)) {
						wr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Ft(r) : window, e) {
					case "focusin":
						(Cr(v) || v.contentEditable === "true") && (Xr = v, Zr = r, Qr = null);
						break;
					case "focusout":
						Qr = Zr = Xr = null;
						break;
					case "mousedown":
						$r = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						$r = !1, ei(s, n, i);
						break;
					case "selectionchange": if (Yr) break;
					case "keydown":
					case "keyup": ei(s, n, i);
				}
				var y;
				if (dr) b: {
					switch (e) {
						case "compositionstart":
							var b = "onCompositionStart";
							break b;
						case "compositionend":
							b = "onCompositionEnd";
							break b;
						case "compositionupdate":
							b = "onCompositionUpdate";
							break b;
					}
					b = void 0;
				}
				else yr ? _r(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (mr && n.locale !== "ko" && (yr || b !== "onCompositionStart" ? b === "onCompositionEnd" && yr && (y = Pn()) : (jn = i, Mn = "value" in jn ? jn.value : jn.textContent, yr = !0)), v = Yf(r, b), 0 < v.length && (b = new Qn(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = vr(n), y !== null && (b.data = y)))), (y = pr ? br(e, n) : xr(e, n)) && (b = Yf(r, "onBeforeInput"), 0 < b.length && (v = new Qn("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), Lf(s, e, r, n, i);
			}
			Hf(s, t);
		});
	}
	function Jf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Yf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = Dn(e, n), i != null && r.unshift(Jf(e, i, a)), i = Dn(e, t), i != null && r.push(Jf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Xf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Zf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Dn(n, a), l != null && o.unshift(Jf(n, l, c))) : i || (l = Dn(n, a), l != null && o.push(Jf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Qf = /\r\n?/g, $f = /\u0000|\uFFFD/g;
	function ep(e) {
		return (typeof e == "string" ? e : "" + e).replace(Qf, "\n").replace($f, "");
	}
	function tp(e, t) {
		return t = ep(t), ep(e) === t;
	}
	function np(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || dn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && dn(e, "" + r);
				else return;
				break;
			case "className":
				Yt(e, "class", r);
				break;
			case "tabIndex":
				Yt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Yt(e, n, r);
				break;
			case "style":
				mn(e, r, o);
				return;
			case "data": if (t !== "object") {
				Yt(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = vn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && np(e, t, "name", a.name, a, null), np(e, t, "formEncType", a.formEncType, a, null), np(e, t, "formMethod", a.formMethod, a, null), np(e, t, "formTarget", a.formTarget, a, null)) : (np(e, t, "encType", a.encType, a, null), np(e, t, "method", a.method, a, null), np(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = vn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = yn);
				return;
			case "onScroll":
				r != null && Z("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = vn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Z("beforetoggle", e), Z("toggle", e), Jt(e, "popover", r);
				break;
			case "xlinkActuate":
				Xt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Xt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Xt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Xt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Xt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Xt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Xt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Xt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Xt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Jt(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = gn.get(n) || n, Jt(e, n, r);
			else return;
		}
		R = !0;
	}
	function rp(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				mn(e, r, o);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "children":
				if (typeof r == "string") dn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") dn(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Z("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = yn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Bt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[wt] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					R = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Jt(e, n, r);
				}
				return;
		}
		R = !0;
	}
	function ip(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Z("error", e), Z("load", e);
				var r = !1, a = !1, o;
				for (o in n) if (n.hasOwnProperty(o)) {
					var s = n[o];
					if (s != null) switch (o) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							a = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(i(137, t));
						default: np(e, t, o, s, n, null);
					}
				}
				a && np(e, t, "srcSet", n.srcSet, n, null), r && np(e, t, "src", n.src, n, null);
				return;
			case "input":
				Z("invalid", e);
				var c = o = s = a = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							a = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							o = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(i(137, t));
							break;
						default: np(e, t, r, d, n, null);
					}
				}
				on(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Z("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: np(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && cn(e, !!r, n, !0) : cn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Z("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						a = c;
						break;
					case "children":
						o = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(i(91));
						break;
					default: np(e, t, s, c, n, null);
				}
				un(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: np(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Z("beforetoggle", e), Z("toggle", e), Z("cancel", e), Z("close", e);
				break;
			case "iframe":
			case "object":
				Z("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < Bf.length; r++) Z(Bf[r], e);
				break;
			case "image":
				Z("error", e), Z("load", e);
				break;
			case "details":
				Z("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Z("error", e), Z("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(i(137, t));
					default: np(e, t, u, r, n, null);
				}
				return;
			default: if (hn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && rp(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && np(e, t, c, r, n, null));
	}
	var ap = {};
	function op(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var a = null, o = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || np(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (R = !0), o = m;
							break;
						case "name":
							m !== f && (R = !0), a = m;
							break;
						case "checked":
							m !== f && (R = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (R = !0), d = m;
							break;
						case "value":
							m !== f && (R = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (R = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && np(e, t, p, m, r, f);
					}
				}
				an(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || np(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (R = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (R = !0), c = o;
						break;
					case "multiple": o !== l && (R = !0), s = o;
					default: o !== l && np(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? cn(e, !!n, n ? [] : "", !1) : cn(e, !!n, t, !0)) : cn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: np(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (R = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (R = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && np(e, t, s, a, r, o);
				}
				ln(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: np(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (R = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: np(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && np(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: np(e, t, u, p, r, m);
				}
				return;
			default: if (hn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && rp(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || rp(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && np(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || np(e, t, f, p, r, m);
	}
	function sp(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function cp() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && sp(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && sp(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var lp = null, up = null;
	function dp(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function fp(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function pp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function mp(e, t, n, r) {
		return n = dp(n).createElement(e), n[Ct] = r, n[wt] = t, ip(n, e, t), Lt(n), n;
	}
	function hp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var gp = null;
	function _p() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== gp && (gp = e, !0) : (gp = null, !1);
	}
	var vp = typeof setTimeout == "function" ? setTimeout : void 0, yp = typeof clearTimeout == "function" ? clearTimeout : void 0, bp = typeof Promise == "function" ? Promise : void 0, xp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : vp, Sp = typeof queueMicrotask == "function" ? queueMicrotask : bp === void 0 ? vp : function(e) {
		return bp.resolve(null).then(e).catch(Cp);
	};
	function Cp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function wp(e) {
		return e === "head";
	}
	function Tp(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Uh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") ym(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, ym(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[At] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && ym(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Uh(t);
	}
	function Ep(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function Dp(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Op(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function kp(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function Ap(e) {
		return kp(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function jp(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return kp(t, n, e);
	}
	function Mp(e) {
		return e.documentElement.clientHeight;
	}
	function Np(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Pp(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (Mp(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Qm(f), u > th) {
									s.length = o;
									break;
								}
								f = new Promise(Np.bind(f)), s.push(f);
							}
						}
					}
					if (0 < s.length) return t = Promise.race([Promise.all(s), new Promise(function(e) {
						return setTimeout(e, 500);
					})]).then(i, i), (n ? Promise.allSettled([n.finished, t]) : t).then(a, a);
					if (i(), n) return n.finished.then(a, a);
					a();
				},
				types: n
			});
			l.__reactViewTransition = u;
			var d = [];
			return u.ready.then(function() {
				for (var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0; t < e.length; t++) {
					var n = e[t], r = n.effect, i = r.pseudoElement;
					if (i != null && i.startsWith("::view-transition")) {
						d.push(n), n = r.getKeyframes();
						for (var a = i = void 0, s = !0, c = 0; c < n.length; c++) {
							var u = n[c], f = u.width;
							if (i === void 0) i = f;
							else if (i !== f) {
								s = !1;
								break;
							}
							if (f = u.height, a === void 0) a = f;
							else if (a !== f) {
								s = !1;
								break;
							}
							delete u.width, delete u.height, u.transform === "none" && delete u.transform;
						}
						s && i !== void 0 && a !== void 0 && (r.setKeyframes(n), s = getComputedStyle(r.target, r.pseudoElement), s.width !== i || s.height !== a) && (s = n[0], s.width = i, s.height = a, s = n[n.length - 1], s.width = i, s.height = a, r.setKeyframes(n));
					}
				}
				o();
			}, function(e) {
				l.__reactViewTransition === u && (l.__reactViewTransition = null);
				try {
					if (typeof e == "object" && e) switch (e.name) {
						case "InvalidStateError": (e.message === "View transition was skipped because document visibility state is hidden." || e.message === "Skipping view transition because document visibility state has become hidden." || e.message === "Skipping view transition because viewport size changed." || e.message === "Transition was aborted because of invalid state") && (e = null);
					}
					e !== null && c(e);
				} finally {
					r(), i(), o();
				}
			}), u.finished.finally(function() {
				for (var e = 0; e < d.length; e++) d[e].cancel();
				l.__reactViewTransition === u && (l.__reactViewTransition = null), s();
			}), u;
		} catch {
			return r(), i(), o(), null;
		}
	}
	function Fp(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Fp.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : D({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Fp.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Fp.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Ip(e) {
		return {
			name: e,
			group: new Fp("group", e),
			imagePair: new Fp("image-pair", e),
			old: new Fp("old", e),
			new: new Fp("new", e)
		};
	}
	function Lp(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Lp.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Hp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = Bp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), p(this._fragmentFiber.child, !1, Rp, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Rp(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Lp.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Hp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = Bp(i.optionsOrUseCapture), p(this._fragmentFiber.child, !1, zp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function zp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function Bp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function Vp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Hp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = Vp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && Vp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Lp.prototype.dispatchEvent = function(e) {
		var t = h(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, Bp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, Bp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Lp.prototype.focus = function(e) {
		p(this._fragmentFiber.child, !0, Up, e, void 0, void 0);
	};
	function Up(e, t) {
		return e.tag !== 6 && (e = b(e), hm(e, t));
	}
	Lp.prototype.focusLast = function(e) {
		var t = [];
		p(this._fragmentFiber.child, !0, Wp, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Up(t[n], e); n--);
	};
	function Wp(e, t) {
		return t.push(e), !1;
	}
	Lp.prototype.blur = function() {
		var e = h(this._fragmentFiber);
		e !== null && (e = b(e), e = dp(e).activeElement, e !== null && p(this._fragmentFiber.child, !1, Gp, e, void 0, void 0));
	};
	function Gp(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Lp.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), p(this._fragmentFiber.child, !1, Kp, e, void 0, void 0);
	};
	function Kp(e, t) {
		return e.tag === 6 || (e = b(e), t.observe(e)), !1;
	}
	Lp.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), p(this._fragmentFiber.child, !1, qp, e, void 0, void 0);
			for (var n = t = 0; n < Jp.length; n++) {
				var r = Jp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : Jp[t++] = r;
			}
			Jp.length = t;
		}
	};
	function qp(e, t) {
		return e.tag === 6 || (e = b(e), t.unobserve(e)), !1;
	}
	var Jp = [], Yp = !1;
	function Xp(e, t, n) {
		Jp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), Yp || (Yp = !0, gm(function() {
			Yp = !1;
			var e = Jp;
			Jp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Lp.prototype.getClientRects = function() {
		var e = [];
		return p(this._fragmentFiber.child, !1, Zp, e, void 0, void 0), e;
	};
	function Zp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Lp.prototype.getRootNode = function(e) {
		var t = h(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Lp.prototype.compareDocumentPosition = function(e) {
		var t = h(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		p(this._fragmentFiber.child, !1, Wp, n, void 0, void 0);
		var r = b(t);
		if (n.length === 0) {
			if (n = r, _(this._fragmentFiber)) {
				a: {
					for (t = this._fragmentFiber.return; t !== null;) {
						if (t.tag === 4) {
							t = t.stateNode.containerInfo;
							break a;
						}
						if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
						t = t.return;
					}
					t = null;
				}
				t != null && (n = t);
			}
			t = this._fragmentFiber;
			var i = r = n.compareDocumentPosition(e);
			return n === e ? i = Node.DOCUMENT_POSITION_CONTAINS : r & Node.DOCUMENT_POSITION_CONTAINED_BY && (n = v(t)[1], n === null ? i = Node.DOCUMENT_POSITION_PRECEDING : (e = b(n).compareDocumentPosition(e), i = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		t = b(n[0]), i = b(n[n.length - 1]);
		var a = _(this._fragmentFiber) ? t.parentElement : r;
		if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		r = a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, a = a.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var o = t.compareDocumentPosition(e), s = i.compareDocumentPosition(e), c = o & Node.DOCUMENT_POSITION_CONTAINED_BY || s & Node.DOCUMENT_POSITION_CONTAINED_BY;
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Qp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Qp(e, t, n, r, i) {
		var a = Nt(i);
		if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (n = !!a) a: {
				for (; a !== null;) {
					if (a.tag === 7 && (a === t || a.alternate === t)) {
						n = !0;
						break a;
					}
					a = a.return;
				}
				n = !1;
			}
			return n;
		}
		if (e & Node.DOCUMENT_POSITION_CONTAINS) {
			if (a === null) return a = i.ownerDocument, i === a || i === a.documentElement || i === a.body;
			a: {
				for (a = t, t = h(t); a !== null;) {
					if (!(a.tag !== 5 && a.tag !== 3 && a.tag !== 27 || a !== t && a.alternate !== t)) {
						a = !0;
						break a;
					}
					a = a.return;
				}
				a = !1;
			}
			return a;
		}
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = E(n, a, T), t === null ? t = !1 : (p(t, !0, C, a, n), a = x, x = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = E(r, a, T), t === null ? t = !1 : (p(t, !0, w, a, r), a = x, S = x = null, t = a !== null)), t) : !1;
	}
	function $p(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Lp.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		p(this._fragmentFiber.child, !1, Wp, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || h(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), $p(e, n);
				return;
			}
			if (r = b(r), r.nodeType !== 9) {
				if (r.nodeType === 11) {
					n = "host" in r ? r.host : null, n !== null && n.scrollIntoView(e);
					return;
				}
				r.scrollIntoView(e);
			}
		}
		for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
			var a = t[r];
			a.tag === 6 ? (a = b(a), $p(a, n)) : b(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function em(e, t) {
		return e = b(e), tm(e, t), !1;
	}
	function tm(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function nm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, Bp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < Jp.length; i++) {
				var a = Jp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (Jp[r++] = a);
			}
			Jp.length = r, n.observe(e);
		}), tm(e, t));
	}
	function rm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, Bp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Xp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function im(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					im(n), Mt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function am(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[At]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = dm(e.nextSibling), e === null) break;
		}
		return null;
	}
	function om(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = dm(e.nextSibling), e === null)) return null;
		return e;
	}
	function sm(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = dm(e.nextSibling), e === null)) return null;
		return e;
	}
	function cm(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function lm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function um(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function dm(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var fm = null;
	function pm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return dm(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function mm(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function hm(e, t) {
		function n() {
			r = !0;
		}
		if (e.ownerDocument.activeElement === e) return !0;
		var r = !1;
		try {
			e.ownerDocument.addEventListener("focus", n, !0), (e.focus || HTMLElement.prototype.focus).call(e, t);
		} finally {
			e.ownerDocument.removeEventListener("focus", n, !0);
		}
		return r;
	}
	function gm(e) {
		xp(function() {
			xp(function(t) {
				return e(t);
			});
		});
	}
	function _m(e, t, n) {
		switch (t = dp(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(i(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(i(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(i(454));
				return e;
			default: throw Error(i(451));
		}
	}
	function vm(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && np(e, t, r, null, ap, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === yn && (e.onclick = null), Mt(e);
	}
	function ym(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Mt(e);
	}
	var bm = /* @__PURE__ */ new Map(), xm = /* @__PURE__ */ new Set();
	function Sm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var Cm = L.d;
	L.d = {
		f: wm,
		r: Tm,
		D: Om,
		C: km,
		L: Am,
		m: jm,
		X: Nm,
		S: Mm,
		M: Pm
	};
	function wm() {
		var e = Cm.f(), t = zd();
		return e || t;
	}
	function Tm(e) {
		var t = Pt(e);
		t !== null && t.tag === 5 && t.type === "form" ? tc(t) : Cm.r(e);
	}
	var Em = typeof document > "u" ? null : document;
	function Dm(e, t, n) {
		var r = Em;
		if (r && typeof t == "string" && t) {
			var i = rn(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), xm.has(i) || (xm.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), ip(t, "link", e), Lt(t), r.head.appendChild(t)));
		}
	}
	function Om(e) {
		Cm.D(e), Dm("dns-prefetch", e, null);
	}
	function km(e, t) {
		Cm.C(e, t), Dm("preconnect", e, t);
	}
	function Am(e, t, n) {
		Cm.L(e, t, n);
		var r = Em;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + rn(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + rn(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + rn(n.imageSizes) + "\"]")) : i += "[href=\"" + rn(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Im(e);
					break;
				case "script": a = Bm(e);
			}
			if (!(bm.has(a) || (e = D({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), bm.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Lm(a)) || t === "script" && r.querySelector(Vm(a))))) {
				var o = r.createElement("link");
				ip(o, "link", e), t === "style" && (o[jt] = !0, o.onload = o.onerror = function() {
					Rt(o);
				}), Lt(o), r.head.appendChild(o);
			}
		}
	}
	function jm(e, t) {
		Cm.m(e, t);
		var n = Em;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + rn(r) + "\"][href=\"" + rn(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Bm(e);
			}
			if (!bm.has(a) && (e = D({
				rel: "modulepreload",
				href: e
			}, t), bm.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(Vm(a))) return;
				}
				r = n.createElement("link"), ip(r, "link", e), Lt(r), n.head.appendChild(r);
			}
		}
	}
	function Mm(e, t, n) {
		Cm.S(e, t, n);
		var r = Em;
		if (r && e) {
			var i = It(r).hoistableStyles, a = Im(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Lm(a))) s.loading = 5;
				else {
					e = D({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = bm.get(a)) && Wm(e, n);
					var c = o = r.createElement("link");
					Lt(c), ip(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Um(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function Nm(e, t) {
		Cm.X(e, t);
		var n = Em;
		if (n && e) {
			var r = It(n).hoistableScripts, i = Bm(e), a = r.get(i);
			a || (a = n.querySelector(Vm(i)), a || (e = D({
				src: e,
				async: !0
			}, t), (t = bm.get(i)) && Gm(e, t), a = n.createElement("script"), Lt(a), ip(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Pm(e, t) {
		Cm.M(e, t);
		var n = Em;
		if (n && e) {
			var r = It(n).hoistableScripts, i = Bm(e), a = r.get(i);
			a || (a = n.querySelector(Vm(i)), a || (e = D({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = bm.get(i)) && Gm(e, t), a = n.createElement("script"), Lt(a), ip(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Fm(e, t, n, r) {
		var a = (a = Ce.current) ? Sm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Im(n.href), t = It(a).hoistableStyles, r = t.get(n), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Im(n.href);
					var o = It(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Lm(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = bm.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, bm.set(e, o)), zm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Bm(n), t = It(a).hoistableScripts, r = t.get(n), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(i(444, e));
		}
	}
	function Im(e) {
		return "href=\"" + rn(e) + "\"";
	}
	function Lm(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Rm(e) {
		return D({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function zm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[jt]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[jt] = !0, t.onload = t.onerror = Rt.bind(null, t), ip(t, "link", n), Lt(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Bm(e) {
		return "[src=\"" + rn(e) + "\"]";
	}
	function Vm(e) {
		return "script[async]" + e;
	}
	function Hm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + rn(n.href) + "\"]");
				if (r) return t.instance = r, Lt(r), r;
				var a = D({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Lt(r), ip(r, "style", a), Um(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Im(n.href);
				var o = e.querySelector(Lm(a));
				if (o) return t.state.loading |= 4, t.instance = o, Lt(o), o;
				r = Rm(n), (a = bm.get(a)) && Wm(r, a), o = (e.ownerDocument || e).createElement("link"), Lt(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), ip(o, "link", r), t.state.loading |= 4, Um(o, n.precedence, e), t.instance = o;
			case "script": return o = Bm(n.src), (a = e.querySelector(Vm(o))) ? (t.instance = a, Lt(a), a) : (r = n, (a = bm.get(o)) && (r = D({}, n), Gm(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Lt(a), ip(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Um(r, n.precedence, e));
		return t.instance;
	}
	function Um(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Wm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Gm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Km = null;
	function qm(e, t, n) {
		if (Km === null) {
			var r = /* @__PURE__ */ new Map(), i = Km = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Km, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[At] || a[Ct] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Jm(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Ym(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Xm(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Zm(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Qm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function $m(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Qm(t), e.suspenseyImages.push(t)), e = ah.bind(e), t.decode().then(e, e));
	}
	function eh(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Im(r.href), a = t.querySelector(Lm(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = ih.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Lt(a);
					return;
				}
				a = t.ownerDocument || t, r = Rm(r), (i = bm.get(i)) && Wm(r, i), a = a.createElement("link"), Lt(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), ip(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = ih.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var th = 0;
	function nh(e, t) {
		return e.stylesheets && e.count === 0 && sh(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && sh(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && th === 0 && (th = 62500 * cp());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && sh(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > th ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function rh(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) sh(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function ih() {
		this.count--, rh(this);
	}
	function ah() {
		this.imgCount--, rh(this);
	}
	var oh = null;
	function sh(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, oh = /* @__PURE__ */ new Map(), t.forEach(ch, e), oh = null, ih.call(e));
	}
	function ch(e, t) {
		if (!(t.state.loading & 4)) {
			var n = oh.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), oh.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = ih.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var lh = {
		$$typeof: P,
		Provider: null,
		Consumer: null,
		_currentValue: he,
		_currentValue2: he,
		_threadCount: 0
	};
	function uh(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = ft(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ft(0), this.hiddenUpdates = ft(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function dh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new uh(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Mi(3, null, null, t), e.current = a, a.stateNode = e, t = Ma(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, mo(a), e;
	}
	function fh(e) {
		return e ? (e = Ai, e) : Ai;
	}
	function Q(e, t, n, r, i, a) {
		i = fh(i), r.context === null ? r.context = i : r.pendingContext = i, r = go(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = H(e, r, t), n !== null && (Pd(n, e, t), _o(n, e, t));
	}
	function ph(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function mh(e, t) {
		ph(e, t), (e = e.alternate) && ph(e, t);
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Di(e, 67108864);
			t !== null && Pd(t, e, 67108864), mh(e, 67108864);
		}
	}
	function gh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = jd();
			t = vt(t);
			var n = Di(e, t);
			n !== null && Pd(n, e, t), mh(e, t);
		}
	}
	var _h = !0;
	function vh(e, t, n, r) {
		var i = I.T;
		I.T = null;
		var a = L.p;
		try {
			L.p = 2, bh(e, t, n, r);
		} finally {
			L.p = a, I.T = i;
		}
	}
	function yh(e, t, n, r) {
		var i = I.T;
		I.T = null;
		var a = L.p;
		try {
			L.p = 8, bh(e, t, n, r);
		} finally {
			L.p = a, I.T = i;
		}
	}
	function bh(e, t, n, r) {
		if (_h) {
			var i = xh(r);
			if (i === null) qf(e, t, r, Sh, n), Nh(e, r);
			else if (Fh(i, e, t, n, r)) r.stopPropagation();
			else if (Nh(e, r), t & 4 && -1 < Mh.indexOf(e)) {
				for (; i !== null;) {
					var a = Pt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = ot(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - $e(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Df(a), !(J & 6) && (gd = Ve() + 500, Of(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Di(a, 2), s !== null && Pd(s, a, 2), zd(), mh(a, 2);
					}
					if (a = xh(r), a === null && qf(e, t, r, Sh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else qf(e, t, r, null, n);
		}
	}
	function xh(e) {
		return e = xn(e), Ch(e);
	}
	var Sh = null;
	function Ch(e) {
		if (Sh = null, e = Nt(e), e !== null) {
			var t = o(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = s(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = c(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return Sh = e, null;
	}
	function wh(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (He()) {
				case Ue: return 2;
				case We: return 8;
				case Ge:
				case Ke: return 32;
				case qe: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var Th = !1, Eh = null, Dh = null, Oh = null, kh = /* @__PURE__ */ new Map(), Ah = /* @__PURE__ */ new Map(), jh = [], Mh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Nh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Eh = null;
				break;
			case "dragenter":
			case "dragleave":
				Dh = null;
				break;
			case "mouseover":
			case "mouseout":
				Oh = null;
				break;
			case "pointerover":
			case "pointerout":
				kh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": Ah.delete(t.pointerId);
		}
	}
	function Ph(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Pt(t), t !== null && hh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Fh(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Eh = Ph(Eh, e, t, n, r, i), !0;
			case "dragenter": return Dh = Ph(Dh, e, t, n, r, i), !0;
			case "mouseover": return Oh = Ph(Oh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return kh.set(a, Ph(kh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, Ah.set(a, Ph(Ah.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Ih(e) {
		var t = Nt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, xt(e.priority, function() {
							gh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, xt(e.priority, function() {
							gh(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Lh(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = xh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				bn = r, n.target.dispatchEvent(r), bn = null;
			} else return t = Pt(n), t !== null && hh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Rh(e, t, n) {
		Lh(e) && n.delete(t);
	}
	function zh() {
		Th = !1, Eh !== null && Lh(Eh) && (Eh = null), Dh !== null && Lh(Dh) && (Dh = null), Oh !== null && Lh(Oh) && (Oh = null), kh.forEach(Rh), Ah.forEach(Rh);
	}
	function Bh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, Th || (Th = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, zh)));
	}
	var Vh = null;
	function Hh(e) {
		Vh !== e && (Vh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Vh === e && (Vh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Ch(r || n) === null) continue;
					break;
				}
				var a = Pt(n);
				a !== null && (e.splice(t, 3), t -= 3, $s(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Uh(e) {
		function t(t) {
			return Bh(t, e);
		}
		Eh !== null && Bh(Eh, e), Dh !== null && Bh(Dh, e), Oh !== null && Bh(Oh, e), kh.forEach(t), Ah.forEach(t);
		for (var n = 0; n < jh.length; n++) {
			var r = jh[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < jh.length && (n = jh[0], n.blockedOn === null);) Ih(n), n.blockedOn === null && jh.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[wt] || null;
			if (typeof a == "function") o || Hh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[wt] || null) s = o.formAction;
					else if (Ch(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Hh(n);
			}
		}
	}
	function Wh() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Gh(e) {
		this._internalRoot = e;
	}
	Kh.prototype.render = Gh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		Q(n, jd(), e, t, null, null);
	}, Kh.prototype.unmount = Gh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			Q(e.current, 2, null, e, null, null), zd(), t[Tt] = null;
		}
	};
	function Kh(e) {
		this._internalRoot = e;
	}
	Kh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = bt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < jh.length && t !== 0 && t < jh[n].priority; n++);
			jh.splice(n, 0, e), n === 0 && Ih(e);
		}
	};
	var qh = n.version;
	if (qh !== "19.3.0") throw Error(i(527, qh, "19.3.0"));
	L.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = u(t), e = e === null ? null : d(e), e = e === null ? null : e.stateNode, e;
	};
	var Jh = {
		bundleType: 0,
		version: "19.3.0",
		rendererPackageName: "react-dom",
		currentDispatcherRef: I,
		reconcilerVersion: "19.3.0"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Yh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Yh.isDisabled && Yh.supportsFiber) try {
			Xe = Yh.inject(Jh), Ze = Yh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = xc, s = Sc, c = Cc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = dh(e, 1, !1, null, null, n, r, null, o, s, c, Wh), e[Tt] = t.current, Gf(e), new Gh(t);
	};
})), v = (/* @__PURE__ */ s(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = _();
})))(), y = /* @__PURE__ */ u(m(), 1), b = 1e-9;
function x(e, t) {
	if (!e.length || t <= e[0]) return 0;
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r + 1 >> 1;
		e[i] <= t + b ? n = i : r = i - 1;
	}
	return n;
}
function S(e, t, n = 10) {
	return t > 0 ? Math.floor(e / n + b) * n + n : Math.ceil(e / n - b) * n - n;
}
function C({ now: e = () => globalThis.performance.now(), raf: t = (e) => globalThis.requestAnimationFrame(e), caf: n = (e) => globalThis.cancelAnimationFrame(e) } = {}) {
	let r = [], i = 0, a = 60, o = !1, s = !1, c = 0, l = 0, u = null, d = 0, f = 0, p = /* @__PURE__ */ new Set(), m = {
		play: /* @__PURE__ */ new Set(),
		pause: /* @__PURE__ */ new Set(),
		end: /* @__PURE__ */ new Set(),
		seek: /* @__PURE__ */ new Set()
	}, h = () => r.length ? r[r.length - 1] : 0, g = (e) => Math.max(0, Math.min(h(), e)), _ = () => p.forEach((e) => e()), v = (e) => m[e].forEach((e) => e());
	function y() {
		let e = x(r, i);
		(e !== c || i !== l) && (c = e, l = i, _());
	}
	function b() {
		u !== null && n(u), u = null;
	}
	function C(e) {
		if (u = null, !o) return;
		let n = Math.min(250, Math.max(0, e - d));
		i = g(i + n / 1e3 * a), d = Math.max(d, e), i >= h() ? (i = h(), o = !1, y(), _(), v("end")) : (s ? e - f >= 1e3 - 1e-6 && (f = e, y()) : y(), u = t(C));
	}
	function w(t) {
		i = g(t), o && (d = e(), f = d), y(), v("seek");
	}
	let T = {
		load(e) {
			let t = o;
			o = !1, b(), r = Array.from(e ?? []), i = 0, c = 0, l = 0, _(), t && v("pause");
		},
		play() {
			o || r.length < 2 || (i >= h() && (i = 0, y()), o = !0, d = e(), f = d, u = t(C), _(), v("play"));
		},
		pause() {
			o && (o = !1, b(), y(), _(), v("pause"));
		},
		toggle() {
			o ? T.pause() : T.play();
		},
		seekIndex(e) {
			r.length && w(r[Math.max(0, Math.min(r.length - 1, Math.round(e)))]);
		},
		seekTime(e) {
			w(e);
		},
		stepWindow(e) {
			w(S(i, e));
		},
		stepSeconds(e) {
			w(i + e);
		},
		setSpeed(e) {
			let t = Number(e);
			Number.isFinite(t) && t > 0 && (a = t);
		},
		setReduced(e) {
			s = !!e, s || y();
		},
		subscribe(e) {
			return p.add(e), () => p.delete(e);
		},
		on(e, t) {
			return m[e].add(t), () => m[e].delete(t);
		},
		getIndex: () => c,
		getTime: () => l,
		isPlaying: () => o,
		getSpeed: () => a,
		isReduced: () => s,
		getTimes: () => r
	};
	return T;
}
//#endregion
//#region src/hooks/usePlayback.js
var w = C();
function T() {
	return (0, y.useSyncExternalStore)(w.subscribe, w.getIndex);
}
function E() {
	return (0, y.useSyncExternalStore)(w.subscribe, w.getTime);
}
function D() {
	return (0, y.useSyncExternalStore)(w.subscribe, w.isPlaying);
}
//#endregion
//#region src/lib/format.js
var O = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
function k(e) {
	return e == null || !Number.isFinite(Number(e)) ? "n/a" : O.format(Math.round(Number(e)));
}
function A(e) {
	return k(e);
}
//#endregion
//#region src/theme.js
var j = "8 5", M = {
	key: "truth",
	label: "Truth (stinger)",
	color: "#F5F5F5",
	dash: "",
	mapDash: ""
}, N = {
	key: "dead_reckoning",
	label: "Dead reckoning (no GPS, no map)",
	color: "#009E73",
	dash: null,
	mapDash: "1 4"
}, ee = {
	raw: {
		key: "raw",
		label: "Raw cabin",
		color: "#D55E00",
		dash: "2 3",
		mapDash: j
	},
	lowpass: {
		key: "lowpass",
		label: "Low-pass",
		color: "#CC79A7",
		dash: "10 3 2 3",
		mapDash: j
	},
	tl: {
		key: "tl",
		label: "Tolles-Lawson (TL)",
		color: "#56B4E9",
		dash: "8 4",
		mapDash: j
	},
	tl_currents: {
		key: "tl_currents",
		label: "TL + currents",
		color: "#0072B2",
		dash: "12 3 3 3 3 3",
		mapDash: j
	},
	krr: {
		key: "krr",
		label: "Classical KRR",
		color: "#E69F00",
		dash: "4 4",
		mapDash: j
	},
	quantum: {
		key: "quantum",
		label: "Quantum slot (stub until Phase 4)",
		color: "#F0E442",
		dash: "1 5",
		mapDash: j
	},
	truth: M,
	dead_reckoning: N
}, P = [
	"raw",
	"lowpass",
	"tl",
	"tl_currents",
	"krr",
	"quantum"
], te = {
	mag_5_uc: "Mag 5",
	mag_4_uc: "Mag 4 (hard case)"
}, ne = {
	"1003.02": "1003.02 (Eastern map)",
	"1007.06": "1007.06 (Renfrew map)"
}, re = "#FFD166", ie = "#000000", ae = "#24282F", oe = "#3A3F47", se = "#E8EAED", ce = "#3A404C", le = "#A9B0BB", ue = "#A5B4FC", de = /* @__PURE__ */ s(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), F = (/* @__PURE__ */ s(((e, t) => {
	t.exports = de();
})))(), fe = [
	10,
	60,
	300
], pe = "Mag 4 sits closer to aircraft noise, so errors are larger. Results are shown unedited.", me = "Not computed in live mode (skipped for time). Shown in the precomputed replay.", I = "Computes this line and sensor in your browser (up to 90 s). If it fails, the precomputed replay is shown instead.", L = "Run live needs a backend: press Run on Qollab and pick one. The replay works without it.";
function he({ playing: e }) {
	return /* @__PURE__ */ (0, F.jsx)("svg", {
		width: "14",
		height: "14",
		viewBox: "0 0 14 14",
		"aria-hidden": "true",
		focusable: "false",
		children: e ? /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)("rect", {
			x: "2",
			y: "1",
			width: "3.5",
			height: "12",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, F.jsx)("rect", {
			x: "8.5",
			y: "1",
			width: "3.5",
			height: "12",
			fill: "currentColor"
		})] }) : /* @__PURE__ */ (0, F.jsx)("path", {
			d: "M3 1 L12.5 7 L3 13 Z",
			fill: "currentColor"
		})
	});
}
var ge = (0, y.memo)(function({ disabled: e }) {
	let t = D(), n = t ? "Pause" : "Play";
	return /* @__PURE__ */ (0, F.jsxs)("button", {
		type: "button",
		className: "btn-primary play-btn",
		"aria-label": n,
		onClick: () => w.toggle(),
		disabled: e,
		children: [/* @__PURE__ */ (0, F.jsx)(he, { playing: t }), /* @__PURE__ */ (0, F.jsx)("span", { children: n })]
	});
});
function _e(e) {
	if (!(e.altKey || e.ctrlKey || e.metaKey)) switch (e.key) {
		case "ArrowLeft":
		case "ArrowRight":
			e.preventDefault(), w.stepWindow(e.key === "ArrowRight" ? 1 : -1);
			break;
		case "PageDown":
		case "PageUp": e.preventDefault(), w.stepSeconds(e.key === "PageUp" ? 60 : -60);
	}
}
var ve = (0, y.memo)(function({ id: e, view: t, disabled: n }) {
	let r = T(), i = t ? t.n : 1, a = Math.min(r, i - 1), o = t ? `t = ${A(t.t[a])} s of ${A(t.tEnd)} s${a >= t.jamIdx ? ", GPS jammed" : ""}` : "Loading";
	return /* @__PURE__ */ (0, F.jsx)("input", {
		id: e,
		type: "range",
		className: "scrubber",
		min: 0,
		max: Math.max(0, i - 1),
		step: 1,
		value: a,
		"aria-valuetext": o,
		onChange: (e) => w.seekIndex(Number(e.target.value)),
		onKeyDown: _e,
		disabled: n
	});
}), ye = (0, y.memo)(function({ view: e }) {
	let t = E();
	return /* @__PURE__ */ (0, F.jsx)("span", {
		className: "time-readout",
		children: e ? `t = ${A(t)} s / ${A(e.tEnd)} s` : "t = – s"
	});
});
function be({ series: e }) {
	return /* @__PURE__ */ (0, F.jsx)("svg", {
		width: "28",
		height: "10",
		viewBox: "0 0 28 10",
		"aria-hidden": "true",
		focusable: "false",
		className: "dash-swatch",
		children: /* @__PURE__ */ (0, F.jsx)("line", {
			x1: "1",
			y1: "5",
			x2: "27",
			y2: "5",
			stroke: e.color,
			strokeWidth: "2",
			strokeDasharray: e.dash || void 0,
			strokeLinecap: e.key === "quantum" ? "round" : "butt"
		})
	});
}
function xe({ lines: e, sensors: t, line: n, sensor: r, mapTrack: i, visible: a, speed: o, view: s, disabled: c = !1, selectionLocked: l = !1, seriesDisabled: u = !1, live: d = null, focusRefs: f = null, onLineChange: p, onSensorChange: m, onMapTrackChange: h, onToggleSeries: g, onSpeedChange: _, children: v }) {
	let b = (0, y.useId)(), x = (0, y.useId)(), S = (0, y.useId)(), C = (0, y.useId)(), w = (0, y.useId)(), T = (0, y.useId)(), E = (0, y.useId)(), D = (0, y.useId)(), O = (0, y.useId)(), k = (e) => !s || s.available.has(e), A = s ? P.some((e) => !s.available.has(e)) : !1, j = r === "mag_4_uc";
	return /* @__PURE__ */ (0, F.jsxs)("section", {
		className: "panel control-bar",
		"aria-label": "Playback controls",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "control-row",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, F.jsx)("label", {
							htmlFor: b,
							children: "Flight line"
						}), /* @__PURE__ */ (0, F.jsx)("select", {
							id: b,
							ref: f?.line,
							value: n,
							onChange: (e) => p(e.target.value),
							disabled: c || l,
							children: e.map((e) => /* @__PURE__ */ (0, F.jsx)("option", {
								value: e,
								children: ne[e] ?? e
							}, e))
						})]
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, F.jsx)("label", {
							htmlFor: x,
							children: "Sensor"
						}), /* @__PURE__ */ (0, F.jsx)("select", {
							id: x,
							ref: f?.sensor,
							value: r,
							onChange: (e) => m(e.target.value),
							disabled: c || l,
							"aria-describedby": j ? S : void 0,
							children: t.map((e) => /* @__PURE__ */ (0, F.jsx)("option", {
								value: e,
								children: te[e] ?? e
							}, e))
						})]
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, F.jsx)("label", {
							htmlFor: C,
							children: "Track on map"
						}), /* @__PURE__ */ (0, F.jsx)("select", {
							id: C,
							value: i,
							onChange: (e) => h(e.target.value),
							disabled: c,
							children: P.map((e) => /* @__PURE__ */ (0, F.jsx)("option", {
								value: e,
								disabled: !k(e),
								children: ee[e].label
							}, e))
						})]
					}),
					/* @__PURE__ */ (0, F.jsx)("div", {
						className: "field field-button",
						children: /* @__PURE__ */ (0, F.jsx)(ge, { disabled: c || !s })
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "field field-slider",
						children: [/* @__PURE__ */ (0, F.jsx)("label", {
							htmlFor: w,
							children: "Flight time"
						}), /* @__PURE__ */ (0, F.jsxs)("div", {
							className: "slider-row",
							children: [/* @__PURE__ */ (0, F.jsx)(ve, {
								id: w,
								view: s,
								disabled: c || !s
							}), /* @__PURE__ */ (0, F.jsx)(ye, { view: s })]
						})]
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, F.jsx)("label", {
							htmlFor: T,
							children: "Speed"
						}), /* @__PURE__ */ (0, F.jsx)("select", {
							id: T,
							value: o,
							onChange: (e) => _(Number(e.target.value)),
							disabled: c,
							children: fe.map((e) => /* @__PURE__ */ (0, F.jsx)("option", {
								value: e,
								children: `${e}×`
							}, e))
						})]
					}),
					d && /* @__PURE__ */ (0, F.jsx)("div", {
						className: "field field-button",
						children: /* @__PURE__ */ (0, F.jsx)("button", {
							type: "button",
							className: "btn-primary run-live",
							ref: f?.runLive,
							onClick: d.onRun,
							disabled: !d.enabled,
							"aria-describedby": D,
							children: "Run live in-page"
						})
					}),
					v
				]
			}),
			j && /* @__PURE__ */ (0, F.jsx)("p", {
				id: S,
				className: "help",
				children: pe
			}),
			d && /* @__PURE__ */ (0, F.jsxs)("div", {
				className: "live-extra",
				children: [/* @__PURE__ */ (0, F.jsx)("p", {
					id: D,
					className: "help",
					children: d.hasBackend ? I : L
				}), /* @__PURE__ */ (0, F.jsxs)("details", {
					className: "demo-options",
					children: [/* @__PURE__ */ (0, F.jsx)("summary", { children: "Demo options" }), /* @__PURE__ */ (0, F.jsxs)("div", {
						className: "demo-options-body",
						children: [/* @__PURE__ */ (0, F.jsx)("input", {
							id: O,
							type: "checkbox",
							checked: d.simulateFailure,
							onChange: (e) => d.onSimulateFailureChange(e.target.checked)
						}), /* @__PURE__ */ (0, F.jsx)("label", {
							htmlFor: O,
							children: "Simulate a compute failure"
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, F.jsxs)("fieldset", {
				className: "series-fieldset",
				disabled: u,
				children: [
					/* @__PURE__ */ (0, F.jsx)("legend", { children: "Signal series" }),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "series-list",
						children: [/* @__PURE__ */ (0, F.jsxs)("span", {
							className: "series-item series-fixed",
							children: [/* @__PURE__ */ (0, F.jsx)(be, { series: ee.truth }), /* @__PURE__ */ (0, F.jsx)("span", { children: "Truth (stinger), always shown" })]
						}), P.map((e) => {
							let t = ee[e], n = k(e);
							return /* @__PURE__ */ (0, F.jsxs)("label", {
								className: "series-item",
								children: [
									/* @__PURE__ */ (0, F.jsx)("input", {
										type: "checkbox",
										checked: a.has(e),
										onChange: (t) => g(e, t.target.checked),
										disabled: !n,
										"aria-describedby": n ? void 0 : E
									}),
									/* @__PURE__ */ (0, F.jsx)(be, { series: t }),
									/* @__PURE__ */ (0, F.jsx)("span", { children: t.label })
								]
							}, e);
						})]
					}),
					A && /* @__PURE__ */ (0, F.jsx)("p", {
						id: E,
						className: "help",
						children: me
					})
				]
			})
		]
	});
}
//#endregion
//#region src/components/StatusStrip.jsx
var Se = {
	precomputed: "precomputed replay",
	computing: "computing in-page…",
	computed: "computed in-page"
}, Ce = {
	select: "choosing the TL configuration",
	raw: "fitting Raw cabin",
	lowpass: "fitting Low-pass",
	tl: "fitting Tolles-Lawson (TL)",
	quantum: "fitting the quantum slot"
}, we = {
	1: "Step 1 of 4: loading flight data…",
	2: "Step 2 of 4: cleaning signal (raw, low-pass, TL, quantum slot)…",
	3: "Step 3 of 4: matching against the map…",
	4: "Step 4 of 4: packaging results…"
}, Te = {
	tl: "Tolles-Lawson (TL)",
	raw: "Raw cabin",
	lowpass: "Low-pass",
	quantum: "quantum slot"
};
function Ee(e, t) {
	let n = we[e] ?? we[1];
	return e === 2 && Ce[t] ? `${n} Now ${Ce[t]}.` : n;
}
function De({ windowsDone: e, windowsTotal: t, denoiser: n, denoiserIndex: r, denoiserCount: i }) {
	return `${e} of ${t} map-matching windows${Te[n] ? ` (${Te[n]})` : ""}${r > 0 && i > 0 ? `, denoiser ${r} of ${i}` : ""}`;
}
function Oe({ progress: e, reduced: t }) {
	let { windowsDone: n, windowsTotal: r, denoiser: i } = e;
	if (!r) return null;
	let a = De(e), o = Te[i] ? `Map matching progress, ${Te[i]}` : "Map matching progress";
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "live-progress",
		children: [!t && /* @__PURE__ */ (0, F.jsx)("progress", {
			max: r,
			value: Math.min(n, r),
			"aria-label": o
		}), /* @__PURE__ */ (0, F.jsx)("span", {
			className: "live-counter",
			children: a
		})]
	});
}
function ke(e) {
	return Se[e] ?? Se.precomputed;
}
function Ae(e) {
	return `Press Play or Space to fly the line. GPS is jammed at t = ${Math.round(e)} s.`;
}
function je(e) {
	let t = e?.code_version ?? "unknown", n = e?.seed;
	return `Data: SGL 2020 MagNav Challenge · maps: MagNav.jl Ottawa · code ${t}${n == null ? "" : ` · seed ${n}`}`;
}
function Me({ mode: e, message: t, jamT: n, provenance: r, danger: i, onEndRun: a, runEnded: o, live: s = null, reduced: c = !1, focusRef: l = null, children: u }) {
	let d = s && s.stage > 0, f = d ? Ee(s.stage, s.progress.fitting) : t ?? (n == null ? "" : Ae(n));
	return /* @__PURE__ */ (0, F.jsxs)("section", {
		className: "panel status-strip",
		"aria-label": "Run status",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "status-row",
				children: [
					/* @__PURE__ */ (0, F.jsx)("span", {
						className: `mode-badge${e === "computed" ? " mode-badge-ok" : ""}`,
						children: ke(e)
					}),
					/* @__PURE__ */ (0, F.jsx)("p", {
						className: "status-message",
						tabIndex: -1,
						ref: l,
						children: f
					}),
					/* @__PURE__ */ (0, F.jsx)("button", {
						type: "button",
						className: "btn-small end-run",
						onClick: a,
						disabled: o,
						children: "End run"
					})
				]
			}),
			d && s.stage === 3 && /* @__PURE__ */ (0, F.jsx)(Oe, {
				progress: s.progress,
				reduced: c
			}),
			i && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "danger-notice",
				children: i
			}),
			u,
			r && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "provenance",
				children: je(r)
			})
		]
	});
}
//#endregion
//#region node_modules/d3-color/src/define.js
function Ne(e, t, n) {
	e.prototype = t.prototype = n, n.constructor = e;
}
function Pe(e, t) {
	var n = Object.create(e.prototype);
	for (var r in t) n[r] = t[r];
	return n;
}
//#endregion
//#region node_modules/d3-color/src/color.js
function Fe() {}
var Ie = .7, Le = 1 / Ie, Re = "\\s*([+-]?\\d+)\\s*", ze = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", Be = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", Ve = /^#([0-9a-f]{3,8})$/, He = RegExp(`^rgb\\(${Re},${Re},${Re}\\)$`), Ue = RegExp(`^rgb\\(${Be},${Be},${Be}\\)$`), We = RegExp(`^rgba\\(${Re},${Re},${Re},${ze}\\)$`), Ge = RegExp(`^rgba\\(${Be},${Be},${Be},${ze}\\)$`), Ke = RegExp(`^hsl\\(${ze},${Be},${Be}\\)$`), qe = RegExp(`^hsla\\(${ze},${Be},${Be},${ze}\\)$`), Je = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
};
Ne(Fe, $e, {
	copy(e) {
		return Object.assign(new this.constructor(), this, e);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: Ye,
	formatHex: Ye,
	formatHex8: Xe,
	formatHsl: Ze,
	formatRgb: Qe,
	toString: Qe
});
function Ye() {
	return this.rgb().formatHex();
}
function Xe() {
	return this.rgb().formatHex8();
}
function Ze() {
	return ft(this).formatHsl();
}
function Qe() {
	return this.rgb().formatRgb();
}
function $e(e) {
	var t, n;
	return e = (e + "").trim().toLowerCase(), (t = Ve.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? et(t) : n === 3 ? new it(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? tt(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? tt(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = He.exec(e)) ? new it(t[1], t[2], t[3], 1) : (t = Ue.exec(e)) ? new it(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = We.exec(e)) ? tt(t[1], t[2], t[3], t[4]) : (t = Ge.exec(e)) ? tt(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = Ke.exec(e)) ? dt(t[1], t[2] / 100, t[3] / 100, 1) : (t = qe.exec(e)) ? dt(t[1], t[2] / 100, t[3] / 100, t[4]) : Je.hasOwnProperty(e) ? et(Je[e]) : e === "transparent" ? new it(NaN, NaN, NaN, 0) : null;
}
function et(e) {
	return new it(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function tt(e, t, n, r) {
	return r <= 0 && (e = t = n = NaN), new it(e, t, n, r);
}
function nt(e) {
	return e instanceof Fe || (e = $e(e)), e ? (e = e.rgb(), new it(e.r, e.g, e.b, e.opacity)) : new it();
}
function rt(e, t, n, r) {
	return arguments.length === 1 ? nt(e) : new it(e, t, n, r ?? 1);
}
function it(e, t, n, r) {
	this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
Ne(it, rt, Pe(Fe, {
	brighter(e) {
		return e = e == null ? Le : Le ** +e, new it(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? Ie : Ie ** +e, new it(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new it(lt(this.r), lt(this.g), lt(this.b), ct(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: at,
	formatHex: at,
	formatHex8: ot,
	formatRgb: st,
	toString: st
}));
function at() {
	return `#${ut(this.r)}${ut(this.g)}${ut(this.b)}`;
}
function ot() {
	return `#${ut(this.r)}${ut(this.g)}${ut(this.b)}${ut((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function st() {
	let e = ct(this.opacity);
	return `${e === 1 ? "rgb(" : "rgba("}${lt(this.r)}, ${lt(this.g)}, ${lt(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function ct(e) {
	return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function lt(e) {
	return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function ut(e) {
	return e = lt(e), (e < 16 ? "0" : "") + e.toString(16);
}
function dt(e, t, n, r) {
	return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new mt(e, t, n, r);
}
function ft(e) {
	if (e instanceof mt) return new mt(e.h, e.s, e.l, e.opacity);
	if (e instanceof Fe || (e = $e(e)), !e) return new mt();
	if (e instanceof mt) return e;
	e = e.rgb();
	var t = e.r / 255, n = e.g / 255, r = e.b / 255, i = Math.min(t, n, r), a = Math.max(t, n, r), o = NaN, s = a - i, c = (a + i) / 2;
	return s ? (o = t === a ? (n - r) / s + (n < r) * 6 : n === a ? (r - t) / s + 2 : (t - n) / s + 4, s /= c < .5 ? a + i : 2 - a - i, o *= 60) : s = c > 0 && c < 1 ? 0 : o, new mt(o, s, c, e.opacity);
}
function pt(e, t, n, r) {
	return arguments.length === 1 ? ft(e) : new mt(e, t, n, r ?? 1);
}
function mt(e, t, n, r) {
	this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
Ne(mt, pt, Pe(Fe, {
	brighter(e) {
		return e = e == null ? Le : Le ** +e, new mt(this.h, this.s, this.l * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? Ie : Ie ** +e, new mt(this.h, this.s, this.l * e, this.opacity);
	},
	rgb() {
		var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < .5 ? n : 1 - n) * t, i = 2 * n - r;
		return new it(_t(e >= 240 ? e - 240 : e + 120, i, r), _t(e, i, r), _t(e < 120 ? e + 240 : e - 120, i, r), this.opacity);
	},
	clamp() {
		return new mt(ht(this.h), gt(this.s), gt(this.l), ct(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		let e = ct(this.opacity);
		return `${e === 1 ? "hsl(" : "hsla("}${ht(this.h)}, ${gt(this.s) * 100}%, ${gt(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
	}
}));
function ht(e) {
	return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function gt(e) {
	return Math.max(0, Math.min(1, e || 0));
}
function _t(e, t, n) {
	return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
//#endregion
//#region node_modules/d3-interpolate/src/constant.js
var vt = (e) => () => e;
//#endregion
//#region node_modules/d3-interpolate/src/color.js
function yt(e, t) {
	return function(n) {
		return e + n * t;
	};
}
function bt(e, t, n) {
	return e **= +n, t = t ** +n - e, n = 1 / n, function(r) {
		return (e + r * t) ** +n;
	};
}
function xt(e) {
	return (e = +e) == 1 ? St : function(t, n) {
		return n - t ? bt(t, n, e) : vt(isNaN(t) ? n : t);
	};
}
function St(e, t) {
	var n = t - e;
	return n ? yt(e, n) : vt(isNaN(e) ? t : e);
}
//#endregion
//#region node_modules/d3-interpolate/src/rgb.js
var Ct = (function e(t) {
	var n = xt(t);
	function r(e, t) {
		var r = n((e = rt(e)).r, (t = rt(t)).r), i = n(e.g, t.g), a = n(e.b, t.b), o = St(e.opacity, t.opacity);
		return function(t) {
			return e.r = r(t), e.g = i(t), e.b = a(t), e.opacity = o(t), e + "";
		};
	}
	return r.gamma = e, r;
})(1);
//#endregion
//#region node_modules/d3-interpolate/src/numberArray.js
function wt(e, t) {
	t ||= [];
	var n = e ? Math.min(t.length, e.length) : 0, r = t.slice(), i;
	return function(a) {
		for (i = 0; i < n; ++i) r[i] = e[i] * (1 - a) + t[i] * a;
		return r;
	};
}
function Tt(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
//#endregion
//#region node_modules/d3-interpolate/src/array.js
function Et(e, t) {
	for (var n = t ? t.length : 0, r = e ? Math.min(n, e.length) : 0, i = Array(r), a = Array(n), o = 0; o < r; ++o) i[o] = Ft(e[o], t[o]);
	for (; o < n; ++o) a[o] = t[o];
	return function(e) {
		for (o = 0; o < r; ++o) a[o] = i[o](e);
		return a;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/date.js
function Dt(e, t) {
	var n = /* @__PURE__ */ new Date();
	return e = +e, t = +t, function(r) {
		return n.setTime(e * (1 - r) + t * r), n;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/number.js
function Ot(e, t) {
	return e = +e, t = +t, function(n) {
		return e * (1 - n) + t * n;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/object.js
function kt(e, t) {
	var n = {}, r = {}, i;
	for (i in (typeof e != "object" || !e) && (e = {}), (typeof t != "object" || !t) && (t = {}), t) i in e ? n[i] = Ft(e[i], t[i]) : r[i] = t[i];
	return function(e) {
		for (i in n) r[i] = n[i](e);
		return r;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/string.js
var At = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, jt = new RegExp(At.source, "g");
function Mt(e) {
	return function() {
		return e;
	};
}
function Nt(e) {
	return function(t) {
		return e(t) + "";
	};
}
function Pt(e, t) {
	var n = At.lastIndex = jt.lastIndex = 0, r, i, a, o = -1, s = [], c = [];
	for (e += "", t += ""; (r = At.exec(e)) && (i = jt.exec(t));) (a = i.index) > n && (a = t.slice(n, a), s[o] ? s[o] += a : s[++o] = a), (r = r[0]) === (i = i[0]) ? s[o] ? s[o] += i : s[++o] = i : (s[++o] = null, c.push({
		i: o,
		x: Ot(r, i)
	})), n = jt.lastIndex;
	return n < t.length && (a = t.slice(n), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? c[0] ? Nt(c[0].x) : Mt(t) : (t = c.length, function(e) {
		for (var n = 0, r; n < t; ++n) s[(r = c[n]).i] = r.x(e);
		return s.join("");
	});
}
//#endregion
//#region node_modules/d3-interpolate/src/value.js
function Ft(e, t) {
	var n = typeof t, r;
	return t == null || n === "boolean" ? vt(t) : (n === "number" ? Ot : n === "string" ? (r = $e(t)) ? (t = r, Ct) : Pt : t instanceof $e ? Ct : t instanceof Date ? Dt : Tt(t) ? wt : Array.isArray(t) ? Et : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? kt : Ot)(e, t);
}
//#endregion
//#region node_modules/d3-interpolate/src/round.js
function It(e, t) {
	return e = +e, t = +t, function(n) {
		return Math.round(e * (1 - n) + t * n);
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/piecewise.js
function Lt(e, t) {
	t === void 0 && (t = e, e = Ft);
	for (var n = 0, r = t.length - 1, i = t[0], a = Array(r < 0 ? 0 : r); n < r;) a[n] = e(i, i = t[++n]);
	return function(e) {
		var t = Math.max(0, Math.min(r - 1, Math.floor(e *= r)));
		return a[t](e - t);
	};
}
//#endregion
//#region node_modules/d3-scale-chromatic/src/sequential-multi/cividis.js
function Rt(e) {
	return e = Math.max(0, Math.min(1, e)), "rgb(" + Math.max(0, Math.min(255, Math.round(-4.54 - e * (35.34 - e * (2381.73 - e * (6402.7 - e * (7024.72 - e * 2710.57))))))) + ", " + Math.max(0, Math.min(255, Math.round(32.49 + e * (170.73 + e * (52.82 - e * (131.46 - e * (176.58 - e * 67.37))))))) + ", " + Math.max(0, Math.min(255, Math.round(81.24 + e * (442.36 - e * (2482.43 - e * (6167.24 - e * (6614.94 - e * 2475.67))))))) + ")";
}
//#endregion
//#region src/lib/colormap.js
function zt() {
	let e = /* @__PURE__ */ new Uint8ClampedArray(768);
	for (let t = 0; t < 256; t++) {
		let [n, r, i] = Rt(t / 255).match(/\d+/g).map(Number);
		e[3 * t] = n, e[3 * t + 1] = r, e[3 * t + 2] = i;
	}
	return e;
}
function Bt(e, t, n = .02, r = .98) {
	let i = [];
	for (let n = 0; n < e.length; n++) t[n] && i.push(e[n]);
	if (!i.length) return [0, 1];
	i.sort((e, t) => e - t);
	let a = i[Math.floor(n * (i.length - 1))], o = i[Math.ceil(r * (i.length - 1))];
	return o > a ? [a, o] : [a, a + 1];
}
function Vt([e, t]) {
	let n = Math.ceil(e / 100) * 100, r = Math.floor(t / 100) * 100, i = [n];
	return n < 0 && r > 0 && i.push(0), r > n && i.push(r), i.map((e) => ({
		value: e + 0,
		label: e === 0 ? "0" : `${k(e)} nT`
	}));
}
//#endregion
//#region src/lib/geo.js
function Ht(e, t, n = 520) {
	let { nx: r, ny: i, x_min: a, x_max: o, y_min: s, y_max: c } = e, l = (o - a) / (r - 1), u = (c - s) / (i - 1), d = a - l / 2, f = c + u / 2, p = r * l, m = i * u, h = m / p, g = Math.max(1, t), _ = g * h;
	return _ > n && (_ = n, g = _ / h), {
		W: g,
		H: _,
		dx: l,
		dy: u,
		aspect: h,
		toPx: (e, t) => [(e - d) / p * g, (f - t) / m * _]
	};
}
//#endregion
//#region src/lib/artifact.js
var Ut = [
	"schema_version",
	"title",
	"sensors",
	"default_sensor",
	"denoisers",
	"thresholds_m",
	"provenance",
	"lines",
	"metrics_table",
	"acceptance"
], Wt = [
	"line",
	"map_file",
	"frame",
	"map_preview",
	"jam",
	"metric_start_index",
	"t",
	"truth",
	"dead_reckoning",
	"estimates",
	"metrics"
], Gt = (e) => typeof e == "object" && !!e && !Array.isArray(e), Kt = (e) => Array.isArray(e) ? e.length : -1;
function R(e, t) {
	let n = [];
	if (!Gt(e)) return ["line is not an object"];
	let r = String(e.line ?? "?");
	for (let t of Wt) t in e || n.push(`line ${r}: missing ${t}`);
	if (n.length) return n;
	let i = Kt(e.t);
	if (i < 2) return [`line ${r}: t must have at least 2 points`];
	let a = (e, t) => {
		Kt(e) !== i && n.push(`line ${r}: ${t} has ${Kt(e)} points, t has ${i}`);
	};
	a(e.truth?.x, "truth.x"), a(e.truth?.y, "truth.y"), a(e.truth?.anomaly_nT, "truth.anomaly_nT"), a(e.dead_reckoning?.x, "dead_reckoning.x"), a(e.dead_reckoning?.y, "dead_reckoning.y");
	let o = e.jam?.display_index;
	(!Number.isInteger(o) || o < 0 || o >= i) && n.push(`line ${r}: jam.display_index ${o} out of range`), (!(Number(e.jam?.index) > 0) || !Number.isFinite(Number(e.jam?.t_s))) && n.push(`line ${r}: jam.index / jam.t_s invalid`);
	let s = e.map_preview;
	(!Gt(s) || Kt(s.nT) !== s.nx * s.ny || Kt(s.valid) !== s.nx * s.ny || s.nx < 2 || s.ny < 2) && n.push(`line ${r}: map_preview grid does not match nx * ny`);
	let c = e.estimates?.[t];
	if (!Gt(c) || Object.keys(c).length === 0) n.push(`line ${r}: no estimates for sensor ${t}`);
	else for (let [e, i] of Object.entries(c)) {
		a(i?.x, `${t}.${e}.x`), a(i?.y, `${t}.${e}.y`), a(i?.signal_nT, `${t}.${e}.signal_nT`);
		let o = Kt(i?.window_t);
		(o < 0 || Kt(i?.ncc) !== o || Kt(i?.accepted) !== o) && n.push(`line ${r}: ${t}.${e} window_t/ncc/accepted lengths disagree`);
	}
	return (!Gt(e.metrics?.dead_reckoning) || !Gt(e.metrics?.[t])) && n.push(`line ${r}: metrics missing for dead_reckoning or ${t}`), n;
}
function qt(e) {
	if (!Gt(e)) return ["artifact is not an object"];
	let t = [];
	e.schema_version !== 1 && t.push(`unsupported schema_version ${e.schema_version}`);
	for (let n of Ut) n in e || t.push(`missing ${n}`);
	if (!Array.isArray(e.lines) || e.lines.length === 0) return t.push("lines must be a non-empty array"), t;
	for (let n of e.lines) t.push(...R(n, e.default_sensor));
	return t;
}
function Jt(e) {
	return e.metric_start_index * e.jam.t_s / e.jam.index;
}
function Yt(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i] < t - 1e-9 ? n = i + 1 : r = i;
	}
	return Math.min(n, e.length - 1);
}
function Xt(e, t) {
	let n = e.t, r = Jt(e), i = {};
	for (let [n, r] of Object.entries(e.estimates[t] ?? {})) i[n] = {
		x: r.x,
		y: r.y,
		signal: r.signal_nT,
		windowT: r.window_t,
		ncc: r.ncc,
		accepted: r.accepted
	};
	return {
		id: e.line,
		mapName: String(e.map_file).toLowerCase().includes("eastern") ? "Eastern" : "Renfrew",
		t: n,
		n: n.length,
		tEnd: n[n.length - 1],
		jamIdx: e.jam.display_index,
		jamT: e.jam.t_s,
		metricStartT: r,
		metricStartIdx: Yt(n, r),
		truth: {
			x: e.truth.x,
			y: e.truth.y,
			anomaly: e.truth.anomaly_nT
		},
		dr: {
			x: e.dead_reckoning.x,
			y: e.dead_reckoning.y
		},
		est: i,
		available: new Set(Object.keys(i)),
		metrics: {
			dead_reckoning: e.metrics.dead_reckoning,
			...e.metrics[t] ?? {}
		},
		preview: e.map_preview,
		frame: e.frame
	};
}
function Zt(e, t, n) {
	let r = e.est[t];
	return r ? Math.hypot(r.x[n] - e.truth.x[n], r.y[n] - e.truth.y[n]) : null;
}
function Qt(e, t) {
	return Math.hypot(e.dr.x[t] - e.truth.x[t], e.dr.y[t] - e.truth.y[t]);
}
//#endregion
//#region src/components/MapView.jsx
var $t = 520, en = 160, tn = 12, nn = 12, rn = [
	[-7, -7],
	[7, -7],
	[-7, 7],
	[7, 7]
], an = null, on = () => (an ||= zt(), an);
function sn(e) {
	let t = parseInt(e.slice(1), 16);
	return [
		t >> 16 & 255,
		t >> 8 & 255,
		t & 255
	];
}
function cn(e) {
	let t = document.createElement("canvas");
	t.width = 4, t.height = 4;
	let n = t.getContext("2d"), r = n.createImageData(4, 4), [i, a, o] = sn(oe);
	for (let e = 0; e < 4; e++) {
		let t = ((3 - e) * 4 + e) * 4;
		r.data[t] = i, r.data[t + 1] = a, r.data[t + 2] = o, r.data[t + 3] = 255;
	}
	return n.putImageData(r, 0, 0), e.createPattern(t, "repeat");
}
function ln(e, t, n, r) {
	e.width = Math.max(1, Math.round(t * r)), e.height = Math.max(1, Math.round(n * r)), e.style.width = `${t}px`, e.style.height = `${n}px`;
	let i = e.getContext("2d");
	return i.setTransform(r, 0, 0, r, 0, 0), i;
}
function un(e, t, [n, r], i, a, o) {
	let { nx: s, ny: c, nT: l, valid: u } = t, d = on(), f = sn(ae), p = document.createElement("canvas");
	p.width = s, p.height = c;
	let m = p.getContext("2d"), h = m.createImageData(s, c), g = r - n;
	for (let e = 0; e < c; e++) for (let t = 0; t < s; t++) {
		let r = e * s + t, i = ((c - 1 - e) * s + t) * 4;
		if (!u[r]) h.data[i] = f[0], h.data[i + 1] = f[1], h.data[i + 2] = f[2];
		else {
			let e = Math.max(0, Math.min(255, Math.round((l[r] - n) / g * 255)));
			h.data[i] = d[3 * e], h.data[i + 1] = d[3 * e + 1], h.data[i + 2] = d[3 * e + 2];
		}
		h.data[i + 3] = 255;
	}
	m.putImageData(h, 0, 0);
	let _ = ln(e, i, a, o);
	_.imageSmoothingEnabled = !1, _.clearRect(0, 0, i, a), _.drawImage(p, 0, 0, i, a);
	let v = i / s, y = a / c, b = new Path2D(), x = !1;
	for (let e = 0; e < c; e++) {
		let t = c - 1 - e, n = 0;
		for (; n < s;) {
			if (u[e * s + n]) {
				n += 1;
				continue;
			}
			let r = n;
			for (; n < s && !u[e * s + n];) n += 1;
			b.rect(r * v, t * y, (n - r) * v, y), x = !0;
		}
	}
	x && (_.fillStyle = cn(_), _.fill(b));
}
function dn(e, t) {
	let n = on(), r = document.createElement("canvas");
	r.width = 256, r.height = 1;
	let i = r.getContext("2d"), a = i.createImageData(256, 1);
	for (let e = 0; e < 256; e++) a.data[4 * e] = n[3 * e], a.data[4 * e + 1] = n[3 * e + 1], a.data[4 * e + 2] = n[3 * e + 2], a.data[4 * e + 3] = 255;
	i.putImageData(a, 0, 0);
	let o = ln(e, en, tn, t);
	o.imageSmoothingEnabled = !0, o.drawImage(r, 0, 0, en, tn);
}
function fn(e, t) {
	let n = ln(e, nn, nn, t);
	n.fillStyle = ae, n.fillRect(0, 0, nn, nn), n.fillStyle = cn(n), n.fillRect(0, 0, nn, nn);
}
function pn(e) {
	let [t, n] = (0, y.useState)({
		width: 0,
		dpr: 1
	});
	return (0, y.useEffect)(() => {
		let t = e.current;
		if (!t) return;
		let r = () => {
			let e = Math.floor(t.getBoundingClientRect().width), r = window.devicePixelRatio || 1;
			n((t) => t.width === e && t.dpr === r ? t : {
				width: e,
				dpr: r
			});
		}, i = new ResizeObserver(r);
		i.observe(t);
		let a = null, o = () => {
			r(), s();
		};
		function s() {
			a && a.removeEventListener("change", o), a = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`), a.addEventListener("change", o);
		}
		return s(), r(), () => {
			i.disconnect(), a && a.removeEventListener("change", o);
		};
	}, [e]), t;
}
function mn({ points: e, color: t, dash: n, width: r = 2, round: i = !1 }) {
	return e ? /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)("polyline", {
		points: e,
		fill: "none",
		stroke: ie,
		strokeWidth: 4,
		strokeLinejoin: "round",
		strokeLinecap: "round"
	}), /* @__PURE__ */ (0, F.jsx)("polyline", {
		points: e,
		fill: "none",
		stroke: t,
		strokeWidth: r,
		strokeDasharray: n || void 0,
		strokeLinejoin: "round",
		strokeLinecap: i ? "round" : "butt"
	})] }) : null;
}
function hn({ x: e, y: t }) {
	return /* @__PURE__ */ (0, F.jsxs)("g", {
		transform: `translate(${e} ${t})`,
		children: [
			/* @__PURE__ */ (0, F.jsx)("path", {
				d: "M-7 -7L7 7M7 -7L-7 7",
				stroke: ie,
				strokeWidth: 4.5,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, F.jsx)("path", {
				d: "M-7 -7L7 7M7 -7L-7 7",
				stroke: M.color,
				strokeWidth: 2,
				strokeLinecap: "round"
			}),
			rn.map(([e, t]) => /* @__PURE__ */ (0, F.jsx)("circle", {
				cx: e,
				cy: t,
				r: 4.5,
				fill: M.color,
				stroke: ie,
				strokeWidth: 1.5
			}, `${e},${t}`)),
			/* @__PURE__ */ (0, F.jsx)("rect", {
				x: -3.5,
				y: -3.5,
				width: 7,
				height: 7,
				rx: 1.5,
				fill: M.color,
				stroke: ie,
				strokeWidth: 1.5
			})
		]
	});
}
function gn({ x: e, y: t, W: n }) {
	let r = e > n - 110, i = "M-4 -4L4 4M4 -4L-4 4";
	return /* @__PURE__ */ (0, F.jsxs)("g", {
		transform: `translate(${e} ${t})`,
		children: [
			/* @__PURE__ */ (0, F.jsx)("circle", {
				r: 7,
				fill: "none",
				stroke: ie,
				strokeWidth: 4
			}),
			/* @__PURE__ */ (0, F.jsx)("path", {
				d: i,
				stroke: ie,
				strokeWidth: 4,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, F.jsx)("circle", {
				r: 7,
				fill: "none",
				stroke: re,
				strokeWidth: 2
			}),
			/* @__PURE__ */ (0, F.jsx)("path", {
				d: i,
				stroke: re,
				strokeWidth: 2,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, F.jsx)("text", {
				x: r ? -12 : 12,
				y: 5,
				textAnchor: r ? "end" : "start",
				fontSize: 14,
				fill: se,
				stroke: ie,
				strokeWidth: 3,
				paintOrder: "stroke",
				strokeLinejoin: "round",
				children: "GPS jammed"
			})
		]
	});
}
var _n = (0, y.memo)(function({ W: e, H: t, px: n, jamIdx: r, metricStartIdx: i, trackColor: a }) {
	let o = T(), s = Math.min(o, n.truth.xy.length - 1), c = s >= r, l = (e, t) => e.slice(t, s + 1).join(" "), [u, d] = n.truth.xy[s], f = n.est ? n.est.xy[s] : null, p = n.dr.xy[s], m = n.truth.xy[r];
	return /* @__PURE__ */ (0, F.jsxs)("svg", {
		className: "map-overlay",
		viewBox: `0 0 ${e} ${t}`,
		width: e,
		height: t,
		"aria-hidden": "true",
		focusable: "false",
		children: [
			/* @__PURE__ */ (0, F.jsx)(mn, {
				points: l(n.truth.str, 0),
				color: M.color,
				dash: ""
			}),
			c && /* @__PURE__ */ (0, F.jsx)(mn, {
				points: l(n.dr.str, r),
				color: N.color,
				dash: N.mapDash,
				width: 2.5,
				round: !0
			}),
			c && n.est && /* @__PURE__ */ (0, F.jsx)(mn, {
				points: l(n.est.str, r),
				color: a,
				dash: "8 5"
			}),
			c && /* @__PURE__ */ (0, F.jsx)(gn, {
				x: m[0],
				y: m[1],
				W: e
			}),
			s >= i && f && /* @__PURE__ */ (0, F.jsx)("line", {
				x1: u,
				y1: d,
				x2: f[0],
				y2: f[1],
				stroke: "#E8EAED",
				strokeOpacity: .6,
				strokeWidth: 1
			}),
			c && /* @__PURE__ */ (0, F.jsx)("rect", {
				x: p[0] - 6,
				y: p[1] - 6,
				width: 12,
				height: 12,
				fill: N.color,
				stroke: "#000000",
				strokeWidth: 1.5
			}),
			c && f && /* @__PURE__ */ (0, F.jsx)("polygon", {
				points: `${f[0]},${f[1] - 6} ${f[0] + 6},${f[1]} ${f[0]},${f[1] + 6} ${f[0] - 6},${f[1]}`,
				fill: a,
				stroke: "#000000",
				strokeWidth: 1.5
			}),
			/* @__PURE__ */ (0, F.jsx)(hn, {
				x: u,
				y: d
			})
		]
	});
}), vn = (0, y.memo)(function({ view: e, mapTrack: t, trackLabel: n }) {
	let r = T(), i;
	if (r < e.jamIdx) i = /* @__PURE__ */ (0, F.jsx)("p", {
		className: "readout-state",
		children: "GPS available"
	});
	else if (r < e.metricStartIdx) i = /* @__PURE__ */ (0, F.jsx)("p", {
		className: "readout-state",
		children: "Collecting first map-matching window…"
	});
	else {
		let n = Zt(e, t, r);
		i = /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)("p", {
			className: "readout-value",
			children: n === null ? "n/a" : `${k(n)} m`
		}), /* @__PURE__ */ (0, F.jsxs)("p", {
			className: "readout-dr",
			children: [
				"Dead reckoning: ",
				k(Qt(e, r)),
				" m"
			]
		})] });
	}
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "error-readout",
		children: [/* @__PURE__ */ (0, F.jsxs)("p", {
			className: "readout-label",
			children: [
				"Position error (",
				n,
				")"
			]
		}), i]
	});
}), yn = 8;
function bn(e, t, [n, r]) {
	if (t === 0 || t === e.length - 1) return !0;
	let i = (e) => (e - n) / (r - n) * en, a = e[t].label.length * yn / 2 + 4, o = i(e[0].value) + e[0].label.length * yn, s = e[e.length - 1], c = i(s.value) - s.label.length * yn, l = i(e[t].value);
	return l - a >= o && l + a <= c;
}
function xn(e, t, n) {
	let r = Array(e.length), i = Array(e.length);
	for (let a = 0; a < e.length; a++) {
		let o = n(e[a], t[a]);
		r[a] = o, i[a] = `${o[0].toFixed(1)},${o[1].toFixed(1)}`;
	}
	return {
		xy: r,
		str: i
	};
}
function Sn({ view: e, mapTrack: t, trackLabel: n }) {
	let r = (0, y.useRef)(null), i = (0, y.useRef)(null), a = (0, y.useRef)(null), o = (0, y.useRef)(null), { width: s, dpr: c } = pn(r), l = e.preview, u = (0, y.useMemo)(() => Bt(l.nT, l.valid), [l]), d = (0, y.useMemo)(() => Vt(u), [u]), f = (0, y.useMemo)(() => s > 0 ? Ht(l, s, $t) : null, [l, s]), p = (0, y.useMemo)(() => {
		if (!f) return null;
		let n = e.est[t];
		return {
			truth: xn(e.truth.x, e.truth.y, f.toPx),
			dr: xn(e.dr.x, e.dr.y, f.toPx),
			est: n ? xn(n.x, n.y, f.toPx) : null
		};
	}, [
		e,
		t,
		f
	]);
	(0, y.useEffect)(() => {
		f && i.current && un(i.current, l, u, f.W, f.H, c);
	}, [
		l,
		u,
		f,
		c
	]), (0, y.useEffect)(() => {
		a.current && dn(a.current, c), o.current && fn(o.current, c);
	}, [c]);
	let m = ee[t]?.color ?? M.color, [h, g] = u;
	return /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsxs)("div", {
		className: "map-stage",
		ref: r,
		style: f ? { height: `${f.H}px` } : void 0,
		children: [f && p && /* @__PURE__ */ (0, F.jsxs)("div", {
			className: "map-plot",
			style: {
				width: `${f.W}px`,
				height: `${f.H}px`
			},
			children: [/* @__PURE__ */ (0, F.jsx)("canvas", {
				ref: i,
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, F.jsx)(_n, {
				W: f.W,
				H: f.H,
				px: p,
				jamIdx: e.jamIdx,
				metricStartIdx: e.metricStartIdx,
				trackColor: m
			})]
		}), /* @__PURE__ */ (0, F.jsx)(vn, {
			view: e,
			mapTrack: t,
			trackLabel: n
		})]
	}), /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "map-legend",
		children: [/* @__PURE__ */ (0, F.jsxs)("div", {
			className: "colorbar",
			children: [
				/* @__PURE__ */ (0, F.jsx)("span", { children: "Magnetic anomaly (nT)" }),
				/* @__PURE__ */ (0, F.jsx)("canvas", {
					ref: a,
					className: "colorbar-canvas",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, F.jsx)("div", {
					className: "colorbar-ticks",
					children: d.map((e, t) => /* @__PURE__ */ (0, F.jsx)("span", {
						style: {
							left: `${(e.value - h) / (g - h) * 100}%`,
							transform: t === 0 ? "none" : t === d.length - 1 ? "translateX(-100%)" : "translateX(-50%)"
						},
						children: bn(d, t, u) ? e.label : ""
					}, e.value))
				})
			]
		}), /* @__PURE__ */ (0, F.jsxs)("div", {
			className: "legend-item",
			children: [/* @__PURE__ */ (0, F.jsx)("canvas", {
				ref: o,
				className: "legend-swatch",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, F.jsx)("span", { children: "No survey data" })]
		})]
	})] });
}
function Cn({ view: e, mapTrack: t, sensorLabel: n }) {
	let r = (0, y.useId)(), i = ee[t]?.label ?? t;
	return /* @__PURE__ */ (0, F.jsxs)("figure", {
		className: "map-figure",
		role: "group",
		"aria-labelledby": r,
		tabIndex: 0,
		children: [
			/* @__PURE__ */ (0, F.jsx)("h2", {
				id: r,
				children: "Map"
			}),
			e ? /* @__PURE__ */ (0, F.jsx)(Sn, {
				view: e,
				mapTrack: t,
				trackLabel: i
			}) : /* @__PURE__ */ (0, F.jsx)("div", {
				className: "map-loading",
				children: "Loading precomputed flight…"
			}),
			e && /* @__PURE__ */ (0, F.jsxs)("figcaption", { children: [
				"Line ",
				e.id,
				" over the ",
				e.mapName,
				" anomaly map",
				n ? ` (${n})` : "",
				". Truth solid white, ",
				i,
				" dashed, dead reckoning dotted green."
			] })
		]
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function wn(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = wn(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Tn() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = wn(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/recharts/es6/util/excludeEventProps.js
var En = /* @__PURE__ */ "dangerouslySetInnerHTML.onCopy.onCopyCapture.onCut.onCutCapture.onPaste.onPasteCapture.onCompositionEnd.onCompositionEndCapture.onCompositionStart.onCompositionStartCapture.onCompositionUpdate.onCompositionUpdateCapture.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onChangeCapture.onBeforeInput.onBeforeInputCapture.onInput.onInputCapture.onReset.onResetCapture.onSubmit.onSubmitCapture.onInvalid.onInvalidCapture.onLoad.onLoadCapture.onError.onErrorCapture.onKeyDown.onKeyDownCapture.onKeyPress.onKeyPressCapture.onKeyUp.onKeyUpCapture.onAbort.onAbortCapture.onCanPlay.onCanPlayCapture.onCanPlayThrough.onCanPlayThroughCapture.onDurationChange.onDurationChangeCapture.onEmptied.onEmptiedCapture.onEncrypted.onEncryptedCapture.onEnded.onEndedCapture.onLoadedData.onLoadedDataCapture.onLoadedMetadata.onLoadedMetadataCapture.onLoadStart.onLoadStartCapture.onPause.onPauseCapture.onPlay.onPlayCapture.onPlaying.onPlayingCapture.onProgress.onProgressCapture.onRateChange.onRateChangeCapture.onSeeked.onSeekedCapture.onSeeking.onSeekingCapture.onStalled.onStalledCapture.onSuspend.onSuspendCapture.onTimeUpdate.onTimeUpdateCapture.onVolumeChange.onVolumeChangeCapture.onWaiting.onWaitingCapture.onAuxClick.onAuxClickCapture.onClick.onClickCapture.onContextMenu.onContextMenuCapture.onDoubleClick.onDoubleClickCapture.onDrag.onDragCapture.onDragEnd.onDragEndCapture.onDragEnter.onDragEnterCapture.onDragExit.onDragExitCapture.onDragLeave.onDragLeaveCapture.onDragOver.onDragOverCapture.onDragStart.onDragStartCapture.onDrop.onDropCapture.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseMoveCapture.onMouseOut.onMouseOutCapture.onMouseOver.onMouseOverCapture.onMouseUp.onMouseUpCapture.onSelect.onSelectCapture.onTouchCancel.onTouchCancelCapture.onTouchEnd.onTouchEndCapture.onTouchMove.onTouchMoveCapture.onTouchStart.onTouchStartCapture.onPointerDown.onPointerDownCapture.onPointerMove.onPointerMoveCapture.onPointerUp.onPointerUpCapture.onPointerCancel.onPointerCancelCapture.onPointerEnter.onPointerEnterCapture.onPointerLeave.onPointerLeaveCapture.onPointerOver.onPointerOverCapture.onPointerOut.onPointerOutCapture.onGotPointerCapture.onGotPointerCaptureCapture.onLostPointerCapture.onLostPointerCaptureCapture.onScroll.onScrollCapture.onWheel.onWheelCapture.onAnimationStart.onAnimationStartCapture.onAnimationEnd.onAnimationEndCapture.onAnimationIteration.onAnimationIterationCapture.onTransitionEnd.onTransitionEndCapture".split(".");
function Dn(e) {
	return typeof e == "string" && En.includes(e);
}
//#endregion
//#region node_modules/recharts/es6/util/svgPropertiesNoEvents.js
var On = /* @__PURE__ */ new Set(/* @__PURE__ */ "aria-activedescendant.aria-atomic.aria-autocomplete.aria-busy.aria-checked.aria-colcount.aria-colindex.aria-colspan.aria-controls.aria-current.aria-describedby.aria-details.aria-disabled.aria-errormessage.aria-expanded.aria-flowto.aria-haspopup.aria-hidden.aria-invalid.aria-keyshortcuts.aria-label.aria-labelledby.aria-level.aria-live.aria-modal.aria-multiline.aria-multiselectable.aria-orientation.aria-owns.aria-placeholder.aria-posinset.aria-pressed.aria-readonly.aria-relevant.aria-required.aria-roledescription.aria-rowcount.aria-rowindex.aria-rowspan.aria-selected.aria-setsize.aria-sort.aria-valuemax.aria-valuemin.aria-valuenow.aria-valuetext.className.color.height.id.lang.max.media.method.min.name.style.target.width.role.tabIndex.accentHeight.accumulate.additive.alignmentBaseline.allowReorder.alphabetic.amplitude.arabicForm.ascent.attributeName.attributeType.autoReverse.azimuth.baseFrequency.baselineShift.baseProfile.bbox.begin.bias.by.calcMode.capHeight.clip.clipPath.clipPathUnits.clipRule.colorInterpolation.colorInterpolationFilters.colorProfile.colorRendering.contentScriptType.contentStyleType.cursor.cx.cy.d.decelerate.descent.diffuseConstant.direction.display.divisor.dominantBaseline.dur.dx.dy.edgeMode.elevation.enableBackground.end.exponent.externalResourcesRequired.fill.fillOpacity.fillRule.filter.filterRes.filterUnits.floodColor.floodOpacity.focusable.fontFamily.fontSize.fontSizeAdjust.fontStretch.fontStyle.fontVariant.fontWeight.format.from.fx.fy.g1.g2.glyphName.glyphOrientationHorizontal.glyphOrientationVertical.glyphRef.gradientTransform.gradientUnits.hanging.horizAdvX.horizOriginX.href.ideographic.imageRendering.in2.in.intercept.k1.k2.k3.k4.k.kernelMatrix.kernelUnitLength.kerning.keyPoints.keySplines.keyTimes.lengthAdjust.letterSpacing.lightingColor.limitingConeAngle.local.markerEnd.markerHeight.markerMid.markerStart.markerUnits.markerWidth.mask.maskContentUnits.maskUnits.mathematical.mode.numOctaves.offset.opacity.operator.order.orient.orientation.origin.overflow.overlinePosition.overlineThickness.paintOrder.panose1.pathLength.patternContentUnits.patternTransform.patternUnits.pointerEvents.pointsAtX.pointsAtY.pointsAtZ.preserveAlpha.preserveAspectRatio.primitiveUnits.r.radius.refX.refY.renderingIntent.repeatCount.repeatDur.requiredExtensions.requiredFeatures.restart.result.rotate.rx.ry.seed.shapeRendering.slope.spacing.specularConstant.specularExponent.speed.spreadMethod.startOffset.stdDeviation.stemh.stemv.stitchTiles.stopColor.stopOpacity.strikethroughPosition.strikethroughThickness.string.stroke.strokeDasharray.strokeDashoffset.strokeLinecap.strokeLinejoin.strokeMiterlimit.strokeOpacity.strokeWidth.surfaceScale.systemLanguage.tableValues.targetX.targetY.textAnchor.textDecoration.textLength.textRendering.to.transform.u1.u2.underlinePosition.underlineThickness.unicode.unicodeBidi.unicodeRange.unitsPerEm.vAlphabetic.values.vectorEffect.version.vertAdvY.vertOriginX.vertOriginY.vHanging.vIdeographic.viewTarget.visibility.vMathematical.widths.wordSpacing.writingMode.x1.x2.x.xChannelSelector.xHeight.xlinkActuate.xlinkArcrole.xlinkHref.xlinkRole.xlinkShow.xlinkTitle.xlinkType.xmlBase.xmlLang.xmlns.xmlnsXlink.xmlSpace.y1.y2.y.yChannelSelector.z.zoomAndPan.ref.key.angle".split("."));
function kn(e) {
	return typeof e == "string" && On.has(e);
}
function An(e) {
	return typeof e == "string" && e.startsWith("data-");
}
function jn(e) {
	if (typeof e != "object" || !e) return {};
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (kn(n) || An(n)) && (t[n] = e[n]);
	return t;
}
function Mn(e) {
	if (e == null) return null;
	if (/*#__PURE__*/ (0, y.isValidElement)(e) && typeof e.props == "object" && e.props !== null) {
		var t = e.props;
		return jn(t);
	}
	return typeof e == "object" && !Array.isArray(e) ? jn(e) : null;
}
//#endregion
//#region node_modules/recharts/es6/util/svgPropertiesAndEvents.js
function Nn(e) {
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (kn(n) || An(n) || Dn(n)) && (t[n] = e[n]);
	return t;
}
function Pn(e) {
	return e == null ? null : /*#__PURE__*/ (0, y.isValidElement)(e) ? Nn(e.props) : typeof e == "object" && !Array.isArray(e) ? Nn(e) : null;
}
//#endregion
//#region node_modules/recharts/es6/container/Surface.js
var Fn = [
	"children",
	"width",
	"height",
	"viewBox",
	"className",
	"style",
	"title",
	"desc"
];
function In() {
	return In = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, In.apply(null, arguments);
}
function Ln(e, t) {
	if (e == null) return {};
	var n, r, i = Rn(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Rn(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var zn = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.children, r = e.width, i = e.height, a = e.viewBox, o = e.className, s = e.style, c = e.title, l = e.desc, u = Ln(e, Fn), d = a || {
		width: r,
		height: i,
		x: 0,
		y: 0
	}, f = Tn("recharts-surface", o);
	return /*#__PURE__*/ y.createElement("svg", In({}, Nn(u), {
		className: f,
		width: r,
		height: i,
		style: s,
		viewBox: `${d.x} ${d.y} ${d.width} ${d.height}`,
		ref: t
	}), /*#__PURE__*/ y.createElement("title", null, c), /*#__PURE__*/ y.createElement("desc", null, l), n);
}), Bn = ["children", "className"];
function Vn() {
	return Vn = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Vn.apply(null, arguments);
}
function Hn(e, t) {
	if (e == null) return {};
	var n, r, i = Un(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Un(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var Wn = /*#__PURE__*/ y.forwardRef((e, t) => {
	var n = e.children, r = e.className, i = Hn(e, Bn), a = Tn("recharts-layer", r);
	return /*#__PURE__*/ y.createElement("g", Vn({ className: a }, Nn(i), { ref: t }), n);
});
//#endregion
//#region node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function Gn(e) {
	return e === "__proto__";
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/isDeepKey.mjs
var Kn = /\.|(\[(?:[^[\]]*|(["'])(?:(?!\2)[^\\]|\\.)*?\2)\])/;
function qn(e) {
	switch (typeof e) {
		case "number":
		case "symbol": return !1;
		case "string": return e === "" || e.startsWith(".") || e.endsWith(".") ? !1 : Kn.test(e);
		default: return !1;
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/toKey.mjs
function Jn(e) {
	return typeof e == "string" || typeof e == "symbol" ? e : Object.is(e?.valueOf?.(), -0) ? "-0" : String(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isSymbol.mjs
function Yn(e) {
	return typeof e == "symbol" || e instanceof Symbol;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toString.mjs
function Xn(e) {
	return e == null ? "" : Zn(e);
}
function Zn(e) {
	if (typeof e == "string") return e;
	if (Array.isArray(e)) return e.map(Zn).join(",");
	if (Yn(e)) return e.toString();
	let t = e + "";
	return t === "0" && Object.is(Number(e), -0) ? "-0" : t;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toPath.mjs
function Qn(e) {
	if (Array.isArray(e)) return e.map(Jn);
	if (typeof e == "symbol") return [e];
	e = Xn(e);
	let t = [], n = e.length;
	if (n === 0) return t;
	let r = 0, i = "", a = "", o = !1, s = !1, c = /^-?\d+(?:\.\d+)?$/;
	for (e.charCodeAt(0) === 46 && t.push(""); r < n;) {
		let l = e[r];
		if (a) l === "\\" && r + 1 < n ? (r++, i += e[r]) : l === a ? a = "" : i += l;
		else if (o) {
			if (l === "\"" || l === "'") a = l, s = !0;
			else if (l === "]") {
				if (o = !1, !s && i.includes(".") && !c.test(i)) {
					let e = i.split(".");
					for (let n = 0; n < e.length; n++) e[n] !== "" && t.push(e[n]);
				} else t.push(i);
				i = "";
			} else i += l;
		} else if (l === "[") o = !0, s = !1, i &&= (t.push(i), "");
		else if (l === ".") {
			i &&= (t.push(i), "");
			let n = e[r + 1];
			(n === void 0 || n === ".") && t.push("");
		} else i += l;
		r++;
	}
	return i && t.push(i), t;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/get.mjs
function $n(e, t, n) {
	if (e == null) return n;
	switch (typeof t) {
		case "string": {
			if (Gn(t)) return n;
			let r = e[t];
			return r === void 0 ? qn(t) && !Object.hasOwn(e, t) ? $n(e, Qn(t), n) : n : r;
		}
		case "number":
		case "symbol": {
			typeof t == "number" && (t = Jn(t));
			let r = e[t];
			return r === void 0 ? n : r;
		}
		default: {
			if (Array.isArray(t)) return er(e, t, n);
			if (t = Object.is(t?.valueOf(), -0) ? "-0" : String(t), Gn(t)) return n;
			let r = e[t];
			return r === void 0 ? n : r;
		}
	}
}
function er(e, t, n) {
	if (t.length === 0) return n;
	let r = e;
	for (let e = 0; e < t.length; e++) {
		if (r == null || Gn(t[e])) return n;
		r = r[t[e]];
	}
	return r === void 0 ? n : r;
}
//#endregion
//#region node_modules/recharts/es6/util/round.js
var tr = 4;
function nr(e) {
	var t = 10 ** (arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : tr), n = Math.round(e * t) / t;
	return Object.is(n, -0) ? 0 : n;
}
function rr(e) {
	var t = [...arguments].slice(1);
	return e.reduce((e, n, r) => {
		var i = t[r - 1];
		return typeof i == "string" ? e + i + n : i === void 0 ? e + n : e + nr(i) + n;
	}, "");
}
//#endregion
//#region node_modules/recharts/es6/util/DataUtils.js
var ir = (e) => e === 0 ? 0 : e > 0 ? 1 : -1, ar = (e) => typeof e == "number" && e != +e, or = (e) => typeof e == "string" && e.length > 1 && e.indexOf("%") === e.length - 1, z = (e) => (typeof e == "number" || e instanceof Number) && !ar(e), sr = (e) => z(e) || typeof e == "string", cr = 0, lr = (e) => {
	var t = ++cr;
	return `${e || ""}${t}`;
}, ur = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, r = arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
	if (!z(e) && typeof e != "string") return n;
	var i;
	if (or(e)) {
		if (t == null) return n;
		var a = e.indexOf("%");
		i = t * parseFloat(e.slice(0, a)) / 100;
	} else i = +e;
	return ar(i) && (i = n), r && t != null && i > t && (i = t), i;
}, dr = (e) => {
	if (!Array.isArray(e)) return !1;
	for (var t = e.length, n = {}, r = 0; r < t; r++) if (!n[String(e[r])]) n[String(e[r])] = !0;
	else return !0;
	return !1;
};
function fr(e, t, n) {
	return z(e) && z(t) ? nr(e + n * (t - e)) : t;
}
function pr(e, t, n) {
	if (e && e.length) return e.find((e) => e && (typeof t == "function" ? t(e) : $n(e, t)) === n);
}
var mr = (e) => e == null, hr = (e) => mr(e) ? e : `${e.charAt(0).toUpperCase()}${e.slice(1)}`;
function gr(e) {
	return e != null;
}
function _r() {}
//#endregion
//#region node_modules/recharts/es6/cartesian/cartesianViewBoxToTrapezoid.js
function vr(e) {
	if (e) return {
		x: e.x,
		y: e.y,
		upperWidth: "upperWidth" in e ? e.upperWidth : e.width,
		lowerWidth: "lowerWidth" in e ? e.lowerWidth : e.width,
		width: e.width,
		height: e.height
	};
}
//#endregion
//#region node_modules/recharts/es6/cartesian/getCartesianPosition.js
function yr(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function br(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? yr(Object(n), !0).forEach(function(t) {
			xr(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yr(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function xr(e, t, n) {
	return (t = Sr(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Sr(e) {
	var t = Cr(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Cr(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var wr = (e) => {
	var t = e.viewBox, n = e.position, r = e.offset, i = r === void 0 ? 0 : r, a = e.parentViewBox, o = e.clamp, s = vr(t), c = s.x, l = s.y, u = s.height, d = s.upperWidth, f = s.lowerWidth, p = c, m = c + (d - f) / 2, h = (p + m) / 2, g = (d + f) / 2, _ = p + d / 2, v = u >= 0 ? 1 : -1, y = v * i, b = v > 0 ? "end" : "start", x = v > 0 ? "start" : "end", S = d >= 0 ? 1 : -1, C = S * i, w = S > 0 ? "end" : "start", T = S > 0 ? "start" : "end", E = a;
	if (n === "top") {
		var D = {
			x: p + d / 2,
			y: l - y,
			horizontalAnchor: "middle",
			verticalAnchor: b
		};
		return o && E && (D.height = Math.max(l - E.y, 0), D.width = d), D;
	}
	if (n === "bottom") {
		var O = {
			x: m + f / 2,
			y: l + u + y,
			horizontalAnchor: "middle",
			verticalAnchor: x
		};
		return o && E && (O.height = Math.max(E.y + E.height - (l + u), 0), O.width = f), O;
	}
	if (n === "left") {
		var k = {
			x: h - C,
			y: l + u / 2,
			horizontalAnchor: w,
			verticalAnchor: "middle"
		};
		return o && E && (k.width = Math.max(k.x - E.x, 0), k.height = u), k;
	}
	if (n === "right") {
		var A = {
			x: h + g + C,
			y: l + u / 2,
			horizontalAnchor: T,
			verticalAnchor: "middle"
		};
		return o && E && (A.width = Math.max(E.x + E.width - A.x, 0), A.height = u), A;
	}
	var j = o && E ? {
		width: g,
		height: u
	} : {};
	return n === "insideLeft" ? br({
		x: h + C,
		y: l + u / 2,
		horizontalAnchor: T,
		verticalAnchor: "middle"
	}, j) : n === "insideRight" ? br({
		x: h + g - C,
		y: l + u / 2,
		horizontalAnchor: w,
		verticalAnchor: "middle"
	}, j) : n === "insideTop" ? br({
		x: p + d / 2,
		y: l + y,
		horizontalAnchor: "middle",
		verticalAnchor: x
	}, j) : n === "insideBottom" ? br({
		x: m + f / 2,
		y: l + u - y,
		horizontalAnchor: "middle",
		verticalAnchor: b
	}, j) : n === "insideTopLeft" ? br({
		x: p + C,
		y: l + y,
		horizontalAnchor: T,
		verticalAnchor: x
	}, j) : n === "insideTopRight" ? br({
		x: p + d - C,
		y: l + y,
		horizontalAnchor: w,
		verticalAnchor: x
	}, j) : n === "insideBottomLeft" ? br({
		x: m + C,
		y: l + u - y,
		horizontalAnchor: T,
		verticalAnchor: b
	}, j) : n === "insideBottomRight" ? br({
		x: m + f - C,
		y: l + u - y,
		horizontalAnchor: w,
		verticalAnchor: b
	}, j) : n && typeof n == "object" && (z(n.x) || or(n.x)) && (z(n.y) || or(n.y)) ? br({
		x: c + ur(n.x, g),
		y: l + ur(n.y, u),
		horizontalAnchor: "end",
		verticalAnchor: "end"
	}, j) : br({
		x: _,
		y: l + u / 2,
		horizontalAnchor: "middle",
		verticalAnchor: "middle"
	}, j);
}, Tr = [
	"top",
	"left",
	"right",
	"bottom"
];
function Er(e) {
	return e == null ? !1 : typeof e == "object" || Tr.includes(e);
}
//#endregion
//#region node_modules/recharts/es6/context/legendPortalContext.js
var Dr = /*#__PURE__*/ (0, y.createContext)(null);
//#endregion
//#region node_modules/d3-shape/src/constant.js
function Or(e) {
	return function() {
		return e;
	};
}
//#endregion
//#region node_modules/d3-path/src/path.js
var kr = Math.PI, Ar = 2 * kr, jr = 1e-6, Mr = Ar - jr;
function Nr(e) {
	this._ += e[0];
	for (let t = 1, n = e.length; t < n; ++t) this._ += arguments[t] + e[t];
}
function Pr(e) {
	let t = Math.floor(e);
	if (!(t >= 0)) throw Error(`invalid digits: ${e}`);
	if (t > 15) return Nr;
	let n = 10 ** t;
	return function(e) {
		this._ += e[0];
		for (let t = 1, r = e.length; t < r; ++t) this._ += Math.round(arguments[t] * n) / n + e[t];
	};
}
var Fr = class {
	constructor(e) {
		this._x0 = this._y0 = this._x1 = this._y1 = null, this._ = "", this._append = e == null ? Nr : Pr(e);
	}
	moveTo(e, t) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}`;
	}
	closePath() {
		this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
	}
	lineTo(e, t) {
		this._append`L${this._x1 = +e},${this._y1 = +t}`;
	}
	quadraticCurveTo(e, t, n, r) {
		this._append`Q${+e},${+t},${this._x1 = +n},${this._y1 = +r}`;
	}
	bezierCurveTo(e, t, n, r, i, a) {
		this._append`C${+e},${+t},${+n},${+r},${this._x1 = +i},${this._y1 = +a}`;
	}
	arcTo(e, t, n, r, i) {
		if (e = +e, t = +t, n = +n, r = +r, i = +i, i < 0) throw Error(`negative radius: ${i}`);
		let a = this._x1, o = this._y1, s = n - e, c = r - t, l = a - e, u = o - t, d = l * l + u * u;
		if (this._x1 === null) this._append`M${this._x1 = e},${this._y1 = t}`;
		else if (d > jr) {
			if (!(Math.abs(u * s - c * l) > jr) || !i) this._append`L${this._x1 = e},${this._y1 = t}`;
			else {
				let f = n - a, p = r - o, m = s * s + c * c, h = f * f + p * p, g = Math.sqrt(m), _ = Math.sqrt(d), v = i * Math.tan((kr - Math.acos((m + d - h) / (2 * g * _))) / 2), y = v / _, b = v / g;
				Math.abs(y - 1) > jr && this._append`L${e + y * l},${t + y * u}`, this._append`A${i},${i},0,0,${+(u * f > l * p)},${this._x1 = e + b * s},${this._y1 = t + b * c}`;
			}
		}
	}
	arc(e, t, n, r, i, a) {
		if (e = +e, t = +t, n = +n, a = !!a, n < 0) throw Error(`negative radius: ${n}`);
		let o = n * Math.cos(r), s = n * Math.sin(r), c = e + o, l = t + s, u = 1 ^ a, d = a ? r - i : i - r;
		this._x1 === null ? this._append`M${c},${l}` : (Math.abs(this._x1 - c) > jr || Math.abs(this._y1 - l) > jr) && this._append`L${c},${l}`, n && (d < 0 && (d = d % Ar + Ar), d > Mr ? this._append`A${n},${n},0,1,${u},${e - o},${t - s}A${n},${n},0,1,${u},${this._x1 = c},${this._y1 = l}` : d > jr && this._append`A${n},${n},0,${+(d >= kr)},${u},${this._x1 = e + n * Math.cos(i)},${this._y1 = t + n * Math.sin(i)}`);
	}
	rect(e, t, n, r) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}h${n = +n}v${+r}h${-n}Z`;
	}
	toString() {
		return this._;
	}
};
Fr.prototype;
//#endregion
//#region node_modules/d3-shape/src/path.js
function Ir(e) {
	let t = 3;
	return e.digits = function(n) {
		if (!arguments.length) return t;
		if (n == null) t = null;
		else {
			let e = Math.floor(n);
			if (!(e >= 0)) throw RangeError(`invalid digits: ${n}`);
			t = e;
		}
		return e;
	}, () => new Fr(t);
}
Array.prototype.slice;
function Lr(e) {
	return typeof e == "object" && "length" in e ? e : Array.from(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/linear.js
function Rr(e) {
	this._context = e;
}
Rr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: this._context.lineTo(e, t);
		}
	}
};
function zr(e) {
	return new Rr(e);
}
//#endregion
//#region node_modules/d3-shape/src/point.js
function Br(e) {
	return e[0];
}
function Vr(e) {
	return e[1];
}
//#endregion
//#region node_modules/d3-shape/src/line.js
function Hr(e, t) {
	var n = Or(!0), r = null, i = zr, a = null, o = Ir(s);
	e = typeof e == "function" ? e : e === void 0 ? Br : Or(e), t = typeof t == "function" ? t : t === void 0 ? Vr : Or(t);
	function s(s) {
		var c, l = (s = Lr(s)).length, u, d = !1, f;
		for (r ?? (a = i(f = o())), c = 0; c <= l; ++c) !(c < l && n(u = s[c], c, s)) === d && ((d = !d) ? a.lineStart() : a.lineEnd()), d && a.point(+e(u, c, s), +t(u, c, s));
		if (f) return a = null, f + "" || null;
	}
	return s.x = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Or(+t), s) : e;
	}, s.y = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : Or(+e), s) : t;
	}, s.defined = function(e) {
		return arguments.length ? (n = typeof e == "function" ? e : Or(!!e), s) : n;
	}, s.curve = function(e) {
		return arguments.length ? (i = e, r != null && (a = i(r)), s) : i;
	}, s.context = function(e) {
		return arguments.length ? (e == null ? r = a = null : a = i(r = e), s) : r;
	}, s;
}
//#endregion
//#region node_modules/d3-shape/src/area.js
function Ur(e, t, n) {
	var r = null, i = Or(!0), a = null, o = zr, s = null, c = Ir(l);
	e = typeof e == "function" ? e : e === void 0 ? Br : Or(+e), t = typeof t == "function" ? t : Or(t === void 0 ? 0 : +t), n = typeof n == "function" ? n : n === void 0 ? Vr : Or(+n);
	function l(l) {
		var u, d, f, p = (l = Lr(l)).length, m, h = !1, g, _ = Array(p), v = Array(p);
		for (a ?? (s = o(g = c())), u = 0; u <= p; ++u) {
			if (!(u < p && i(m = l[u], u, l)) === h) {
				if (h = !h) d = u, s.areaStart(), s.lineStart();
				else {
					for (s.lineEnd(), s.lineStart(), f = u - 1; f >= d; --f) s.point(_[f], v[f]);
					s.lineEnd(), s.areaEnd();
				}
			}
			h && (_[u] = +e(m, u, l), v[u] = +t(m, u, l), s.point(r ? +r(m, u, l) : _[u], n ? +n(m, u, l) : v[u]));
		}
		if (g) return s = null, g + "" || null;
	}
	function u() {
		return Hr().defined(i).curve(o).context(a);
	}
	return l.x = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Or(+t), r = null, l) : e;
	}, l.x0 = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Or(+t), l) : e;
	}, l.x1 = function(e) {
		return arguments.length ? (r = e == null ? null : typeof e == "function" ? e : Or(+e), l) : r;
	}, l.y = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : Or(+e), n = null, l) : t;
	}, l.y0 = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : Or(+e), l) : t;
	}, l.y1 = function(e) {
		return arguments.length ? (n = e == null ? null : typeof e == "function" ? e : Or(+e), l) : n;
	}, l.lineX0 = l.lineY0 = function() {
		return u().x(e).y(t);
	}, l.lineY1 = function() {
		return u().x(e).y(n);
	}, l.lineX1 = function() {
		return u().x(r).y(t);
	}, l.defined = function(e) {
		return arguments.length ? (i = typeof e == "function" ? e : Or(!!e), l) : i;
	}, l.curve = function(e) {
		return arguments.length ? (o = e, a != null && (s = o(a)), l) : o;
	}, l.context = function(e) {
		return arguments.length ? (e == null ? a = s = null : s = o(a = e), l) : a;
	}, l;
}
//#endregion
//#region node_modules/d3-shape/src/curve/bump.js
var Wr = class {
	constructor(e, t) {
		this._context = e, this._x = t;
	}
	areaStart() {
		this._line = 0;
	}
	areaEnd() {
		this._line = NaN;
	}
	lineStart() {
		this._point = 0;
	}
	lineEnd() {
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	}
	point(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: this._x ? this._context.bezierCurveTo(this._x0 = (this._x0 + e) / 2, this._y0, this._x0, t, e, t) : this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + t) / 2, e, this._y0, e, t);
		}
		this._x0 = e, this._y0 = t;
	}
};
function Gr(e) {
	return new Wr(e, !0);
}
function Kr(e) {
	return new Wr(e, !1);
}
//#endregion
//#region node_modules/d3-shape/src/noop.js
function qr() {}
//#endregion
//#region node_modules/d3-shape/src/curve/basis.js
function Jr(e, t, n) {
	e._context.bezierCurveTo((2 * e._x0 + e._x1) / 3, (2 * e._y0 + e._y1) / 3, (e._x0 + 2 * e._x1) / 3, (e._y0 + 2 * e._y1) / 3, (e._x0 + 4 * e._x1 + t) / 6, (e._y0 + 4 * e._y1 + n) / 6);
}
function Yr(e) {
	this._context = e;
}
Yr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 3: Jr(this, this._x1, this._y1);
			case 2: this._context.lineTo(this._x1, this._y1);
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1:
				this._point = 2;
				break;
			case 2: this._point = 3, this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
			default: Jr(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Xr(e) {
	return new Yr(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/basisClosed.js
function Zr(e) {
	this._context = e;
}
Zr.prototype = {
	areaStart: qr,
	areaEnd: qr,
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 1:
				this._context.moveTo(this._x2, this._y2), this._context.closePath();
				break;
			case 2:
				this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3), this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3), this._context.closePath();
				break;
			case 3: this.point(this._x2, this._y2), this.point(this._x3, this._y3), this.point(this._x4, this._y4);
		}
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._x2 = e, this._y2 = t;
				break;
			case 1:
				this._point = 2, this._x3 = e, this._y3 = t;
				break;
			case 2:
				this._point = 3, this._x4 = e, this._y4 = t, this._context.moveTo((this._x0 + 4 * this._x1 + e) / 6, (this._y0 + 4 * this._y1 + t) / 6);
				break;
			default: Jr(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Qr(e) {
	return new Zr(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/basisOpen.js
function $r(e) {
	this._context = e;
}
$r.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1;
				break;
			case 1:
				this._point = 2;
				break;
			case 2:
				this._point = 3;
				var n = (this._x0 + 4 * this._x1 + e) / 6, r = (this._y0 + 4 * this._y1 + t) / 6;
				this._line ? this._context.lineTo(n, r) : this._context.moveTo(n, r);
				break;
			case 3: this._point = 4;
			default: Jr(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function ei(e) {
	return new $r(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/linearClosed.js
function ti(e) {
	this._context = e;
}
ti.prototype = {
	areaStart: qr,
	areaEnd: qr,
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		this._point && this._context.closePath();
	},
	point: function(e, t) {
		e = +e, t = +t, this._point ? this._context.lineTo(e, t) : (this._point = 1, this._context.moveTo(e, t));
	}
};
function ni(e) {
	return new ti(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/monotone.js
function ri(e) {
	return e < 0 ? -1 : 1;
}
function ii(e, t, n) {
	var r = e._x1 - e._x0, i = t - e._x1, a = (e._y1 - e._y0) / (r || i < 0 && -0), o = (n - e._y1) / (i || r < 0 && -0), s = (a * i + o * r) / (r + i);
	return (ri(a) + ri(o)) * Math.min(Math.abs(a), Math.abs(o), .5 * Math.abs(s)) || 0;
}
function ai(e, t) {
	var n = e._x1 - e._x0;
	return n ? (3 * (e._y1 - e._y0) / n - t) / 2 : t;
}
function oi(e, t, n) {
	var r = e._x0, i = e._y0, a = e._x1, o = e._y1, s = (a - r) / 3;
	e._context.bezierCurveTo(r + s, i + s * t, a - s, o - s * n, a, o);
}
function si(e) {
	this._context = e;
}
si.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x1, this._y1);
				break;
			case 3: oi(this, this._t0, ai(this, this._t0));
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		var n = NaN;
		if (e = +e, t = +t, e !== this._x1 || t !== this._y1) {
			switch (this._point) {
				case 0:
					this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
					break;
				case 1:
					this._point = 2;
					break;
				case 2:
					this._point = 3, oi(this, ai(this, n = ii(this, e, t)), n);
					break;
				default: oi(this, this._t0, n = ii(this, e, t));
			}
			this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t, this._t0 = n;
		}
	}
};
function ci(e) {
	this._context = new li(e);
}
(ci.prototype = Object.create(si.prototype)).point = function(e, t) {
	si.prototype.point.call(this, t, e);
};
function li(e) {
	this._context = e;
}
li.prototype = {
	moveTo: function(e, t) {
		this._context.moveTo(t, e);
	},
	closePath: function() {
		this._context.closePath();
	},
	lineTo: function(e, t) {
		this._context.lineTo(t, e);
	},
	bezierCurveTo: function(e, t, n, r, i, a) {
		this._context.bezierCurveTo(t, e, r, n, a, i);
	}
};
function ui(e) {
	return new si(e);
}
function di(e) {
	return new ci(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/natural.js
function fi(e) {
	this._context = e;
}
fi.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = [], this._y = [];
	},
	lineEnd: function() {
		var e = this._x, t = this._y, n = e.length;
		if (n) {
			if (this._line ? this._context.lineTo(e[0], t[0]) : this._context.moveTo(e[0], t[0]), n === 2) this._context.lineTo(e[1], t[1]);
			else for (var r = pi(e), i = pi(t), a = 0, o = 1; o < n; ++a, ++o) this._context.bezierCurveTo(r[0][a], i[0][a], r[1][a], i[1][a], e[o], t[o]);
		}
		(this._line || this._line !== 0 && n === 1) && this._context.closePath(), this._line = 1 - this._line, this._x = this._y = null;
	},
	point: function(e, t) {
		this._x.push(+e), this._y.push(+t);
	}
};
function pi(e) {
	var t, n = e.length - 1, r, i = Array(n), a = Array(n), o = Array(n);
	for (i[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1; t < n - 1; ++t) i[t] = 1, a[t] = 4, o[t] = 4 * e[t] + 2 * e[t + 1];
	for (i[n - 1] = 2, a[n - 1] = 7, o[n - 1] = 8 * e[n - 1] + e[n], t = 1; t < n; ++t) r = i[t] / a[t - 1], a[t] -= r, o[t] -= r * o[t - 1];
	for (i[n - 1] = o[n - 1] / a[n - 1], t = n - 2; t >= 0; --t) i[t] = (o[t] - i[t + 1]) / a[t];
	for (a[n - 1] = (e[n] + i[n - 1]) / 2, t = 0; t < n - 1; ++t) a[t] = 2 * e[t + 1] - i[t + 1];
	return [i, a];
}
function mi(e) {
	return new fi(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/step.js
function hi(e, t) {
	this._context = e, this._t = t;
}
hi.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = this._y = NaN, this._point = 0;
	},
	lineEnd: function() {
		0 < this._t && this._t < 1 && this._point === 2 && this._context.lineTo(this._x, this._y), (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line >= 0 && (this._t = 1 - this._t, this._line = 1 - this._line);
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: if (this._t <= 0) this._context.lineTo(this._x, t), this._context.lineTo(e, t);
			else {
				var n = this._x * (1 - this._t) + e * this._t;
				this._context.lineTo(n, this._y), this._context.lineTo(n, t);
			}
		}
		this._x = e, this._y = t;
	}
};
function gi(e) {
	return new hi(e, .5);
}
function _i(e) {
	return new hi(e, 0);
}
function vi(e) {
	return new hi(e, 1);
}
//#endregion
//#region node_modules/d3-shape/src/offset/none.js
function yi(e, t) {
	if ((o = e.length) > 1) for (var n = 1, r, i, a = e[t[0]], o, s = a.length; n < o; ++n) for (i = a, a = e[t[n]], r = 0; r < s; ++r) a[r][1] += a[r][0] = isNaN(i[r][1]) ? i[r][0] : i[r][1];
}
//#endregion
//#region node_modules/d3-shape/src/order/none.js
function bi(e) {
	for (var t = e.length, n = Array(t); --t >= 0;) n[t] = t;
	return n;
}
//#endregion
//#region node_modules/d3-shape/src/stack.js
function xi(e, t) {
	return e[t];
}
function Si(e) {
	let t = [];
	return t.key = e, t;
}
function Ci() {
	var e = Or([]), t = bi, n = yi, r = xi;
	function i(i) {
		var a = Array.from(e.apply(this, arguments), Si), o, s = a.length, c = -1, l;
		for (let e of i) for (o = 0, ++c; o < s; ++o) (a[o][c] = [0, +r(e, a[o].key, c, i)]).data = e;
		for (o = 0, l = Lr(t(a)); o < s; ++o) a[l[o]].index = o;
		return n(a, l), a;
	}
	return i.keys = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Or(Array.from(t)), i) : e;
	}, i.value = function(e) {
		return arguments.length ? (r = typeof e == "function" ? e : Or(+e), i) : r;
	}, i.order = function(e) {
		return arguments.length ? (t = e == null ? bi : typeof e == "function" ? e : Or(Array.from(e)), i) : t;
	}, i.offset = function(e) {
		return arguments.length ? (n = e ?? yi, i) : n;
	}, i;
}
//#endregion
//#region node_modules/d3-shape/src/offset/expand.js
function wi(e, t) {
	if ((r = e.length) > 0) {
		for (var n, r, i = 0, a = e[0].length, o; i < a; ++i) {
			for (o = n = 0; n < r; ++n) o += e[n][i][1] || 0;
			if (o) for (n = 0; n < r; ++n) e[n][i][1] /= o;
		}
		yi(e, t);
	}
}
//#endregion
//#region node_modules/d3-shape/src/offset/silhouette.js
function Ti(e, t) {
	if ((i = e.length) > 0) {
		for (var n = 0, r = e[t[0]], i, a = r.length; n < a; ++n) {
			for (var o = 0, s = 0; o < i; ++o) s += e[o][n][1] || 0;
			r[n][1] += r[n][0] = -s / 2;
		}
		yi(e, t);
	}
}
//#endregion
//#region node_modules/d3-shape/src/offset/wiggle.js
function Ei(e, t) {
	if ((o = e.length) > 0 && (a = (i = e[t[0]]).length) > 0) {
		for (var n = 0, r = 1, i, a, o; r < a; ++r) {
			for (var s = 0, c = 0, l = 0; s < o; ++s) {
				for (var u = e[t[s]], d = u[r][1] || 0, f = (d - (u[r - 1][1] || 0)) / 2, p = 0; p < s; ++p) {
					var m = e[t[p]], h = m[r][1] || 0, g = m[r - 1][1] || 0;
					f += h - g;
				}
				c += d, l += f * d;
			}
			i[r - 1][1] += i[r - 1][0] = n, c && (n -= l / c);
		}
		i[r - 1][1] += i[r - 1][0] = n, yi(e, t);
	}
}
//#endregion
//#region node_modules/recharts/es6/util/types.js
var Di = (e) => "radius" in e && "startAngle" in e && "endAngle" in e, Oi = (e, t) => {
	if (!e || typeof e == "function" || typeof e == "boolean") return null;
	var n = e;
	if (/*#__PURE__*/ (0, y.isValidElement)(e) && (n = e.props), typeof n != "object" && typeof n != "function") return null;
	var r = {};
	return Object.keys(n).forEach((e) => {
		Dn(e) && typeof n[e] == "function" && (r[e] = t || ((t) => n[e](n, t)));
	}), r;
}, ki = (e, t, n) => (r) => (e(t, n, r), null), Ai = (e, t, n) => {
	if (e === null || typeof e != "object" && typeof e != "function") return null;
	var r = null;
	return Object.keys(e).forEach((i) => {
		var a = e[i];
		Dn(i) && typeof a == "function" && (r ||= {}, r[i] = ki(a, t, n));
	}), r;
};
//#endregion
//#region node_modules/recharts/es6/util/resolveDefaultProps.js
function ji(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Mi(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ji(Object(n), !0).forEach(function(t) {
			Ni(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ji(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Ni(e, t, n) {
	return (t = Pi(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Pi(e) {
	var t = Fi(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Fi(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Ii(e, t) {
	var n = Mi({}, e), r = t;
	return Object.keys(t).reduce((e, t) => (e[t] === void 0 && r[t] !== void 0 && (e[t] = r[t]), e), n);
}
//#endregion
//#region node_modules/es-toolkit/dist/array/uniqBy.mjs
function Li(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t(i, r, e);
		n.has(a) || n.set(a, i);
	}
	return Array.from(n.values());
}
//#endregion
//#region node_modules/es-toolkit/dist/function/ary.mjs
function Ri(e, t) {
	return function(...n) {
		return e.apply(this, n.slice(0, t));
	};
}
//#endregion
//#region node_modules/es-toolkit/dist/function/identity.mjs
function zi(e) {
	return e;
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isLength.mjs
function Bi(e) {
	return Number.isSafeInteger(e) && e >= 0;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
function Vi(e) {
	return e != null && typeof e != "function" && Bi(e.length);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/property.mjs
function Hi(e) {
	return function(t) {
		return $n(t, e);
	};
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function Ui(e) {
	return e == null || typeof e != "object" && typeof e != "function";
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function Wi(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function Gi(e) {
	return Object.getOwnPropertySymbols(e).filter((t) => Object.prototype.propertyIsEnumerable.call(e, t));
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function Ki(e) {
	return e == null ? e === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/tags.mjs
var qi = "[object RegExp]", Ji = "[object String]", Yi = "[object Number]", Xi = "[object Boolean]", Zi = "[object Arguments]", Qi = "[object Symbol]", $i = "[object Date]", ea = "[object Map]", ta = "[object Set]", na = "[object Array]", ra = "[object Function]", ia = "[object ArrayBuffer]", B = "[object Object]", aa = "[object Error]", oa = "[object DataView]", sa = "[object Uint8Array]", ca = "[object Uint8ClampedArray]", la = "[object Uint16Array]", ua = "[object Uint32Array]", da = "[object BigUint64Array]", fa = "[object Int8Array]", pa = "[object Int16Array]", ma = "[object Int32Array]", ha = "[object BigInt64Array]", ga = "[object Float32Array]", _a = "[object Float64Array]", va = typeof globalThis == "object" && globalThis || typeof window == "object" && window || typeof self == "object" && self || typeof global == "object" && global || (function() {
	return this;
})();
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isBuffer.mjs
function ya(e) {
	return va.Buffer !== void 0 && va.Buffer.isBuffer(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
function ba(e, t) {
	return xa(e, void 0, e, /* @__PURE__ */ new Map(), t);
}
function xa(e, t, n, r = /* @__PURE__ */ new Map(), i = void 0) {
	let a = i?.(e, t, n, r);
	if (a !== void 0) return a;
	if (Ui(e)) return e;
	if (r.has(e)) return r.get(e);
	if (Array.isArray(e)) {
		let t = Array(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = xa(e[a], a, n, r, i);
		return Object.hasOwn(e, "index") && (t.index = e.index), Object.hasOwn(e, "input") && (t.input = e.input), t;
	}
	if (e instanceof Date) return new Date(e.getTime());
	if (e instanceof RegExp) {
		let t = new RegExp(e.source, e.flags);
		return t.lastIndex = e.lastIndex, t;
	}
	if (e instanceof Map) {
		let t = /* @__PURE__ */ new Map();
		r.set(e, t);
		for (let [a, o] of e) t.set(a, xa(o, a, n, r, i));
		return t;
	}
	if (e instanceof Set) {
		let t = /* @__PURE__ */ new Set();
		r.set(e, t);
		for (let a of e) t.add(xa(a, void 0, n, r, i));
		return t;
	}
	if (ya(e)) return e.subarray();
	if (Wi(e)) {
		let t = new (Object.getPrototypeOf(e)).constructor(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = xa(e[a], a, n, r, i);
		return t;
	}
	if (e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) return e.slice(0);
	if (e instanceof DataView) {
		let t = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
		return r.set(e, t), Sa(t, e, n, r, i), t;
	}
	if (typeof File < "u" && e instanceof File) {
		let t = new File([e], e.name, { type: e.type });
		return r.set(e, t), Sa(t, e, n, r, i), t;
	}
	if (typeof Blob < "u" && e instanceof Blob) {
		let t = new Blob([e], { type: e.type });
		return r.set(e, t), Sa(t, e, n, r, i), t;
	}
	if (e instanceof Error) {
		let t = structuredClone(e);
		return r.set(e, t), t.message = e.message, t.name = e.name, t.stack = e.stack, t.cause = e.cause, t.constructor = e.constructor, Sa(t, e, n, r, i), t;
	}
	if (e instanceof Boolean) {
		let t = new Boolean(e.valueOf());
		return r.set(e, t), Sa(t, e, n, r, i), t;
	}
	if (e instanceof Number) {
		let t = new Number(e.valueOf());
		return r.set(e, t), Sa(t, e, n, r, i), t;
	}
	if (e instanceof String) {
		let t = new String(e.valueOf());
		return r.set(e, t), Sa(t, e, n, r, i), t;
	}
	if (typeof e == "object" && Ca(e)) {
		let t = Object.create(Object.getPrototypeOf(e));
		return r.set(e, t), Sa(t, e, n, r, i), t;
	}
	return e;
}
function Sa(e, t, n = e, r, i) {
	let a = [...Object.keys(t), ...Gi(t)];
	for (let o = 0; o < a.length; o++) {
		let s = a[o], c = Object.getOwnPropertyDescriptor(e, s);
		(c == null || c.writable) && (e[s] = xa(t[s], s, n, r, i));
	}
}
function Ca(e) {
	switch (Ki(e)) {
		case Zi:
		case na:
		case ia:
		case oa:
		case Xi:
		case $i:
		case ga:
		case _a:
		case fa:
		case pa:
		case ma:
		case ea:
		case Yi:
		case B:
		case qi:
		case ta:
		case Ji:
		case Qi:
		case sa:
		case ca:
		case la:
		case ua: return !0;
		default: return !1;
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/object/cloneDeep.mjs
function wa(e) {
	return xa(e, void 0, e, /* @__PURE__ */ new Map(), void 0);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/eq.mjs
function Ta(e, t) {
	return e === t || Number.isNaN(e) && Number.isNaN(t);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isObject.mjs
function Ea(e) {
	return e !== null && (typeof e == "object" || typeof e == "function");
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isMatchWith.mjs
function Da(e, t, n) {
	return typeof n == "function" ? Oa(e, t, function e(t, r, i, a, o, s) {
		let c = n(t, r, i, a, o, s);
		return c === void 0 ? Oa(t, r, e, s, !1) : !!c;
	}, /* @__PURE__ */ new Map(), !0) : Da(e, t, () => void 0);
}
function Oa(e, t, n, r, i = !1) {
	if (t === e) return !0;
	switch (typeof t) {
		case "object": return ka(e, t, n, r, i);
		case "function": return Object.keys(t).length > 0 ? Oa(e, { ...t }, n, r, i) : Ta(e, t);
		default: return Ea(e) && i ? typeof t != "string" || t === "" : Ta(e, t);
	}
}
function ka(e, t, n, r, i = !1) {
	if (t == null) return !0;
	if (Array.isArray(t)) return ja(e, t, n, r);
	if (t instanceof Map) return Aa(e, t, n, r);
	if (t instanceof Set) return Ma(e, t, n, r);
	let a = Object.keys(t);
	if (e == null) return i && a.length === 0;
	if (i) Ui(e) && (e = Object(e));
	else {
		let t = Ki(e);
		if (t !== "[object Object]" && t !== "[object Arguments]") return !1;
	}
	if (a.length === 0) return !0;
	if (r?.has(t)) return r.get(t) === e;
	r?.set(t, e);
	try {
		for (let i = 0; i < a.length; i++) {
			let o = a[i];
			if (!(o in e) || t[o] === void 0 && e[o] !== void 0 || t[o] === null && e[o] !== null || !n(e[o], t[o], o, e, t, r)) return !1;
		}
		return !0;
	} finally {
		r?.delete(t);
	}
}
function Aa(e, t, n, r) {
	if (t.size === 0) return !0;
	if (!(e instanceof Map)) return !1;
	for (let [i, a] of t.entries()) if (n(e.get(i), a, i, e, t, r) === !1) return !1;
	return !0;
}
function ja(e, t, n, r) {
	if (t.length === 0) return !0;
	if (!Array.isArray(e)) return !1;
	let i = /* @__PURE__ */ new Set();
	for (let a = 0; a < t.length; a++) {
		let o = t[a], s = !1;
		for (let c = 0; c < e.length; c++) {
			if (i.has(c)) continue;
			let l = e[c], u = !1;
			if (n(l, o, a, e, t, r) && (u = !0), u) {
				i.add(c), s = !0;
				break;
			}
		}
		if (!s) return !1;
	}
	return !0;
}
function Ma(e, t, n, r) {
	return t.size === 0 || e instanceof Set && ja([...e], [...t], n, r);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isMatch.mjs
function Na(e, t) {
	return Da(e, t, () => void 0);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/matches.mjs
function Pa(e) {
	return e = wa(e), (t) => Na(t, e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/cloneDeepWith.mjs
function Fa(e, t) {
	return ba(e, (n, r, i, a) => {
		let o = t?.(n, r, i, a);
		if (o !== void 0) return o;
		if (typeof e == "object") {
			if (Ki(e) === "[object Object]" && typeof e.constructor != "function") {
				let t = {};
				return a.set(e, t), Sa(t, e, i, a), t;
			}
			switch (Object.prototype.toString.call(e)) {
				case Yi:
				case Ji:
				case Xi: {
					let t = new e.constructor(e?.valueOf());
					return Sa(t, e), t;
				}
				case Zi: {
					let t = {};
					return Sa(t, e), t.length = e.length, t[Symbol.iterator] = e[Symbol.iterator], t;
				}
				default: return;
			}
		}
	});
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/cloneDeep.mjs
function Ia(e) {
	return Fa(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/isIndex.mjs
var La = /^(?:0|[1-9]\d*)$/;
function Ra(e, t = 2 ** 53 - 1) {
	switch (typeof e) {
		case "number": return Number.isInteger(e) && e >= 0 && e < t;
		case "symbol": return !1;
		case "string": return La.test(e);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isArguments.mjs
function za(e) {
	return typeof e == "object" && !!e && Ki(e) === "[object Arguments]";
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/has.mjs
function Ba(e, t) {
	let n;
	if (n = Array.isArray(t) ? t : typeof t == "string" && qn(t) && !(t in Object(e)) ? Qn(t) : [t], n.length === 0) return !1;
	let r = e;
	for (let e = 0; e < n.length; e++) {
		let t = Jn(n[e]);
		if ((r == null || !Object.hasOwn(r, t)) && !((Array.isArray(r) || za(r)) && Ra(t) && Number(t) < r.length)) return !1;
		r = r[t];
	}
	return !0;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/matchesProperty.mjs
function Va(e, t) {
	switch (typeof e) {
		case "object":
			Object.is(e?.valueOf(), -0) && (e = "-0");
			break;
		case "number": e = Jn(e);
	}
	return t = Ia(t), function(n) {
		let r = $n(n, e);
		return r === void 0 ? Ba(n, e) : t === void 0 ? r === void 0 : Na(r, t);
	};
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/iteratee.mjs
function Ha(e) {
	if (e == null) return zi;
	switch (typeof e) {
		case "function": return e;
		case "object": return Array.isArray(e) && e.length === 2 ? Va(e[0], e[1]) : Pa(e);
		default: return Hi(e);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/normalizeZero.mjs
function Ua(e) {
	return e === 0 ? 0 : e;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/array/uniqBy.mjs
function Wa(e, t = zi) {
	return Vi(e) ? Li(Array.from(e), Ri(Ha(t), 1)).map(Ua) : [];
}
//#endregion
//#region node_modules/recharts/es6/util/payload/getUniqPayload.js
function Ga(e, t, n) {
	return t === !0 ? Wa(e, n) : typeof t == "function" ? Wa(e, t) : e;
}
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var Ka = /* @__PURE__ */ s(((e) => {
	var t = m();
	function n(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var r = typeof Object.is == "function" ? Object.is : n, i = t.useState, a = t.useEffect, o = t.useLayoutEffect, s = t.useDebugValue;
	function c(e, t) {
		var n = t(), r = i({ inst: {
			value: n,
			getSnapshot: t
		} }), c = r[0].inst, u = r[1];
		return o(function() {
			c.value = n, c.getSnapshot = t, l(c) && u({ inst: c });
		}, [
			e,
			n,
			t
		]), a(function() {
			return l(c) && u({ inst: c }), e(function() {
				l(c) && u({ inst: c });
			});
		}, [e]), s(n), n;
	}
	function l(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !r(e, n);
		} catch {
			return !0;
		}
	}
	function u(e, t) {
		return t();
	}
	var d = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? u : c;
	e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? d : t.useSyncExternalStore;
})), qa = /* @__PURE__ */ s(((e, t) => {
	t.exports = Ka();
})), Ja = /* @__PURE__ */ s(((e) => {
	var t = m(), n = qa();
	function r(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var i = typeof Object.is == "function" ? Object.is : r, a = n.useSyncExternalStore, o = t.useRef, s = t.useEffect, c = t.useMemo, l = t.useDebugValue;
	e.useSyncExternalStoreWithSelector = function(e, t, n, r, u) {
		var d = o(null);
		if (d.current === null) {
			var f = {
				hasValue: !1,
				value: null
			};
			d.current = f;
		} else f = d.current;
		d = c(function() {
			function e(e) {
				if (!a) {
					if (a = !0, o = e, e = r(e), u !== void 0 && f.hasValue) {
						var t = f.value;
						if (u(t, e)) return s = t;
					}
					return s = e;
				}
				if (t = s, i(o, e)) return t;
				var n = r(e);
				return u !== void 0 && u(t, n) ? (o = e, t) : (o = e, s = n);
			}
			var a = !1, o, s, c = n === void 0 ? null : n;
			return [function() {
				return e(t());
			}, c === null ? void 0 : function() {
				return e(c());
			}];
		}, [
			t,
			n,
			r,
			u
		]);
		var p = a(e, d[0], d[1]);
		return s(function() {
			f.hasValue = !0, f.value = p;
		}, [p]), l(p), p;
	};
})), Ya = /* @__PURE__ */ s(((e, t) => {
	t.exports = Ja();
})), Xa = /*#__PURE__*/ (0, y.createContext)(null), Za = Ya(), Qa = (e) => e, $a = () => {
	var e = (0, y.useContext)(Xa);
	return e ? e.store.dispatch : Qa;
}, eo = () => {}, to = () => eo, no = (e, t) => e === t;
function V(e) {
	var t = (0, y.useContext)(Xa), n = (0, y.useMemo)(() => t ? (t) => {
		if (t != null) return e(t);
	} : eo, [t, e]);
	return (0, Za.useSyncExternalStoreWithSelector)(t ? t.subscription.addNestedSub : to, t ? t.store.getState : eo, t ? t.store.getState : eo, n, no);
}
//#endregion
//#region node_modules/reselect/dist/reselect.mjs
function ro(e, t = `expected a function, instead received ${typeof e}`) {
	if (typeof e != "function") throw TypeError(t);
}
function io(e, t = "expected all items to be functions, instead received the following types: ") {
	if (!e.every((e) => typeof e == "function")) {
		let n = e.map((e) => typeof e == "function" ? `function ${e.name || "unnamed"}()` : typeof e).join(", ");
		throw TypeError(`${t}[${n}]`);
	}
}
var ao = (e) => Array.isArray(e) ? e : [e];
function oo(e) {
	let t = Array.isArray(e[0]) ? e[0] : e;
	return io(t, "createSelector expects all input-selectors to be functions, but received the following types: "), t;
}
function so(e, t) {
	let n = [], { length: r } = e;
	for (let i = 0; i < r; i++) n.push(e[i].apply(null, t));
	return n;
}
var co = class {
	constructor(e) {
		this.value = e;
	}
	deref() {
		return this.value;
	}
}, lo = typeof WeakRef > "u" ? co : WeakRef, uo = 0, fo = 1;
function po() {
	return {
		s: uo,
		v: void 0,
		o: null,
		p: null
	};
}
function mo(e) {
	return e instanceof lo ? e.deref() : e;
}
function ho(e, t = {}) {
	let n = po(), { resultEqualityCheck: r } = t, i, a = 0;
	function o() {
		let t = n, { length: o } = arguments;
		for (let e = 0, n = o; e < n; e++) {
			let n = arguments[e];
			if (typeof n == "function" || typeof n == "object" && n) {
				let e = t.o;
				e === null && (t.o = e = /* @__PURE__ */ new WeakMap());
				let r = e.get(n);
				r === void 0 ? (t = po(), e.set(n, t)) : t = r;
			} else {
				let e = t.p;
				e === null && (t.p = e = /* @__PURE__ */ new Map());
				let r = e.get(n);
				r === void 0 ? (t = po(), e.set(n, t)) : t = r;
			}
		}
		let s = t, c;
		if (t.s === fo) c = t.v;
		else if (c = e.apply(null, arguments), a++, r) {
			let e = mo(i);
			e != null && r(e, c) && (c = e, a !== 0 && a--), i = typeof c == "object" && c || typeof c == "function" ? /* @__PURE__ */ new lo(c) : c;
		}
		return s.s = fo, s.v = c, c;
	}
	return o.clearCache = () => {
		n = po(), o.resetResultsCount();
	}, o.resultsCount = () => a, o.resetResultsCount = () => {
		a = 0;
	}, o;
}
function go(e, ...t) {
	let n = typeof e == "function" ? {
		memoize: e,
		memoizeOptions: t
	} : e, r = (...e) => {
		let t = 0, r = 0, i, a = {}, o = e.pop();
		typeof o == "object" && (a = o, o = e.pop()), ro(o, `createSelector expects an output function after the inputs, but received: [${typeof o}]`);
		let { memoize: s, memoizeOptions: c = [], argsMemoize: l = ho, argsMemoizeOptions: u = [] } = {
			...n,
			...a
		}, d = ao(c), f = ao(u), p = oo(e), m = s(function() {
			return t++, o.apply(null, arguments);
		}, ...d), h = l(function() {
			r++;
			let e = so(p, arguments);
			return i = m.apply(null, e), i;
		}, ...f);
		return Object.assign(h, {
			resultFunc: o,
			memoizedResultFunc: m,
			dependencies: p,
			dependencyRecomputations: () => r,
			resetDependencyRecomputations: () => {
				r = 0;
			},
			lastResult: () => i,
			recomputations: () => t,
			resetRecomputations: () => {
				t = 0;
			},
			memoize: s,
			argsMemoize: l
		});
	};
	return Object.assign(r, { withTypes: () => r }), r;
}
var H = /* @__PURE__ */ go(ho);
//#endregion
//#region node_modules/es-toolkit/dist/array/flatten.mjs
function _o(e, t = 1) {
	let n = [], r = Math.floor(t), i = (e, t) => {
		for (let a = 0; a < e.length; a++) {
			let o = e[a];
			Array.isArray(o) && t < r ? i(o, t + 1) : n.push(o);
		}
	};
	return i(e, 0), n;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/isIterateeCall.mjs
function vo(e, t, n) {
	return Ea(n) && (typeof t == "number" && Vi(n) && Ra(t) && t < n.length || typeof t == "string" && t in n) ? Ta(n[t], e) : !1;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/compareValues.mjs
function yo(e) {
	return typeof e == "symbol" ? 1 : e === null ? 2 : e === void 0 ? 3 : e === e ? 0 : 4;
}
var bo = (e, t, n) => {
	if (e !== t) {
		let r = yo(e), i = yo(t);
		if (r === i && r === 0) {
			if (e < t) return n === "desc" ? 1 : -1;
			if (e > t) return n === "desc" ? -1 : 1;
		}
		return n === "desc" ? i - r : r - i;
	}
	return 0;
}, xo = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, So = /^\w*$/;
function Co(e, t) {
	return Array.isArray(e) ? !1 : typeof e == "number" || typeof e == "boolean" || e == null || Yn(e) ? !0 : typeof e == "string" && (So.test(e) || !xo.test(e)) || t != null && Object.hasOwn(t, e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/array/orderBy.mjs
function wo(e, t, n, r) {
	if (e == null) return [];
	n = r ? void 0 : n, Array.isArray(e) || (e = Vi(e) ? Array.from(e) : Object.values(e)), Array.isArray(t) || (t = t == null ? [null] : [t]), t.length === 0 && (t = [null]), Array.isArray(n) || (n = n == null ? [] : [n]), n = n.map((e) => String(e));
	let i = (e, t) => {
		let n = e, r = 0;
		for (; r < t.length && n != null; ++r) n = n[t[r]];
		return r > 0 && r === t.length ? n : void 0;
	}, a = (e, t) => {
		if (e == null) return t;
		if (t != null) return typeof e == "object" && "key" in e ? Object.hasOwn(t, e.key) ? t[e.key] : i(t, e.path) : typeof e == "function" ? e(t) : Array.isArray(e) ? i(t, e) : t[e];
	}, o = t.map((e) => (Array.isArray(e) && e.length === 1 && (e = e[0]), e == null || typeof e == "function" || Array.isArray(e) || Co(e) ? e : {
		key: e,
		path: Qn(e)
	}));
	return e.map((e) => ({
		original: e,
		criteria: o.map((t) => a(t, e))
	})).slice().sort((e, t) => {
		for (let r = 0; r < o.length; r++) {
			let i = bo(e.criteria[r], t.criteria[r], n[r]);
			if (i !== 0) return i;
		}
		return 0;
	}).map((e) => e.original);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/array/sortBy.mjs
function To(e, ...t) {
	let n = t.length;
	return n > 1 && vo(e, t[0], t[1]) ? t = [] : n > 2 && vo(t[0], t[1], t[2]) && (t = [t[0]]), wo(e, _o(t), ["asc"]);
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/legendSelectors.js
var Eo = (e) => e.legend.settings, Do = (e) => e.legend.size;
H([(e) => e.legend.payload, Eo], (e, t) => {
	var n = t.itemSorter, r = e.flat(1);
	return n ? To(r, n) : r;
});
//#endregion
//#region node_modules/recharts/es6/util/useElementOffset.js
function Oo(e, t) {
	return No(e) || Mo(e, t) || Ao(e, t) || ko();
}
function ko() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ao(e, t) {
	if (e) {
		if (typeof e == "string") return jo(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jo(e, t) : void 0;
	}
}
function jo(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Mo(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function No(e) {
	if (Array.isArray(e)) return e;
}
var Po = 1;
function Fo(e, t) {
	return Math.abs(e.height - t.height) > Po || Math.abs(e.left - t.left) > Po || Math.abs(e.top - t.top) > Po || Math.abs(e.width - t.width) > Po;
}
function Io(e) {
	var t = e.getBoundingClientRect();
	return {
		height: t.height,
		left: t.left,
		top: t.top,
		width: t.width
	};
}
function Lo() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], t = Oo((0, y.useState)({
		height: 0,
		left: 0,
		top: 0,
		width: 0
	}), 2), n = t[0], r = t[1], i = (0, y.useRef)(null), a = (0, y.useRef)(n);
	a.current = n;
	var o = (0, y.useCallback)((e) => {
		if (i.current != null && (i.current.disconnect(), i.current = null), e != null) {
			var t = Io(e);
			if (Fo(t, a.current) && r(t), typeof ResizeObserver < "u") {
				var n = new ResizeObserver(() => {
					var t = Io(e);
					Fo(t, a.current) && r(t);
				});
				n.observe(e), i.current = n;
			}
		}
	}, [...e]);
	return (0, y.useEffect)(() => () => {
		var e;
		(e = i.current) == null || e.disconnect();
	}, []), [n, o];
}
//#endregion
//#region node_modules/redux/dist/redux.mjs
function Ro(e) {
	return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var zo = typeof Symbol == "function" && Symbol.observable || "@@observable", Bo = () => Math.random().toString(36).substring(7).split("").join("."), U = {
	INIT: `@@redux/INIT${/* @__PURE__ */ Bo()}`,
	REPLACE: `@@redux/REPLACE${/* @__PURE__ */ Bo()}`,
	PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${Bo()}`
};
function Vo(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e;
	for (; Object.getPrototypeOf(t) !== null;) t = Object.getPrototypeOf(t);
	return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function Ho(e, t, n) {
	if (typeof e != "function") throw Error(Ro(2));
	if (typeof t == "function" && typeof n == "function" || typeof n == "function" && typeof arguments[3] == "function") throw Error(Ro(0));
	if (typeof t == "function" && n === void 0 && (n = t, t = void 0), n !== void 0) {
		if (typeof n != "function") throw Error(Ro(1));
		return n(Ho)(e, t);
	}
	let r = e, i = t, a = /* @__PURE__ */ new Map(), o = a, s = 0, c = !1;
	function l() {
		o === a && (o = /* @__PURE__ */ new Map(), a.forEach((e, t) => {
			o.set(t, e);
		}));
	}
	function u() {
		if (c) throw Error(Ro(3));
		return i;
	}
	function d(e) {
		if (typeof e != "function") throw Error(Ro(4));
		if (c) throw Error(Ro(5));
		let t = !0;
		l();
		let n = s++;
		return o.set(n, e), function() {
			if (t) {
				if (c) throw Error(Ro(6));
				t = !1, l(), o.delete(n), a = null;
			}
		};
	}
	function f(e) {
		if (!Vo(e)) throw Error(Ro(7));
		if (e.type === void 0) throw Error(Ro(8));
		if (typeof e.type != "string") throw Error(Ro(17));
		if (c) throw Error(Ro(9));
		try {
			c = !0, i = r(i, e);
		} finally {
			c = !1;
		}
		return (a = o).forEach((e) => {
			e();
		}), e;
	}
	function p(e) {
		if (typeof e != "function") throw Error(Ro(10));
		r = e, f({ type: U.REPLACE });
	}
	function m() {
		let e = d;
		return {
			subscribe(t) {
				if (typeof t != "object" || !t) throw Error(Ro(11));
				function n() {
					let e = t;
					e.next && e.next(u());
				}
				return n(), { unsubscribe: e(n) };
			},
			[zo]() {
				return this;
			}
		};
	}
	return f({ type: U.INIT }), {
		dispatch: f,
		subscribe: d,
		getState: u,
		replaceReducer: p,
		[zo]: m
	};
}
function Uo(e) {
	Object.keys(e).forEach((t) => {
		let n = e[t];
		if (n(void 0, { type: U.INIT }) === void 0) throw Error(Ro(12));
		if (n(void 0, { type: U.PROBE_UNKNOWN_ACTION() }) === void 0) throw Error(Ro(13));
	});
}
function Wo(e) {
	let t = Object.keys(e), n = {};
	for (let r = 0; r < t.length; r++) {
		let i = t[r];
		typeof e[i] == "function" && (n[i] = e[i]);
	}
	let r = Object.keys(n), i;
	try {
		Uo(n);
	} catch (e) {
		i = e;
	}
	return function(e = {}, t) {
		if (i) throw i;
		let a = !1, o = {};
		for (let i = 0; i < r.length; i++) {
			let s = r[i], c = n[s], l = e[s], u = c(l, t);
			if (u === void 0) throw t && t.type, Error(Ro(14));
			o[s] = u, a ||= u !== l;
		}
		return a ||= r.length !== Object.keys(e).length, a ? o : e;
	};
}
function Go(...e) {
	return e.length === 0 ? (e) => e : e.length === 1 ? e[0] : e.reduce((e, t) => (...n) => e(t(...n)));
}
function Ko(...e) {
	return (t) => (n, r) => {
		let i = t(n, r), a = () => {
			throw Error(Ro(15));
		}, o = {
			getState: i.getState,
			dispatch: (e, ...t) => a(e, ...t)
		};
		return a = Go(...e.map((e) => e(o)))(i.dispatch), {
			...i,
			dispatch: a
		};
	};
}
function qo(e) {
	return Vo(e) && "type" in e && typeof e.type == "string";
}
//#endregion
//#region node_modules/immer/dist/immer.mjs
var Jo = Symbol.for("immer-nothing"), Yo = Symbol.for("immer-draftable"), W = Symbol.for("immer-state");
function Xo(e, ...t) {
	throw Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`);
}
var Zo = Object, Qo = Zo.getPrototypeOf, $o = "constructor", es = "prototype", ts = "configurable", ns = "enumerable", rs = "writable", is = "value", as = (e) => !!e && !!e[W];
function os(e) {
	return e ? ls(e) || gs(e) || !!e[Yo] || !!e[$o]?.[Yo] || _s(e) || vs(e) : !1;
}
var ss = Zo[es][$o].toString(), cs = /* @__PURE__ */ new WeakMap();
function ls(e) {
	if (!e || !ys(e)) return !1;
	let t = Qo(e);
	if (t === null || t === Zo[es]) return !0;
	let n = Zo.hasOwnProperty.call(t, $o) && t[$o];
	if (n === Object) return !0;
	if (!bs(n)) return !1;
	let r = cs.get(n);
	return r === void 0 && (r = Function.toString.call(n), cs.set(n, r)), r === ss;
}
function us(e, t, n = !0) {
	ds(e) === 0 ? (n ? Reflect.ownKeys(e) : Zo.keys(e)).forEach((n) => {
		t(n, e[n], e);
	}) : e.forEach((n, r) => t(r, n, e));
}
function ds(e) {
	let t = e[W];
	return t ? t.type_ : gs(e) ? 1 : _s(e) ? 2 : vs(e) ? 3 : 0;
}
var fs = (e, t, n = ds(e)) => n === 2 ? e.has(t) : Zo[es].hasOwnProperty.call(e, t), ps = (e, t, n = ds(e)) => n === 2 ? e.get(t) : e[t], ms = (e, t, n, r = ds(e)) => {
	r === 2 ? e.set(t, n) : r === 3 ? e.add(n) : e[t] = n;
};
function hs(e, t) {
	return e === t ? e !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
var gs = Array.isArray, _s = (e) => e instanceof Map, vs = (e) => e instanceof Set, ys = (e) => typeof e == "object", bs = (e) => typeof e == "function", xs = (e) => typeof e == "boolean";
function Ss(e) {
	let t = +e;
	return Number.isInteger(t) && String(t) === e;
}
var Cs = (e) => e.copy_ || e.base_, ws = (e) => e.modified_ ? e.copy_ : e.base_;
function Ts(e, t) {
	if (_s(e)) return new Map(e);
	if (vs(e)) return new Set(e);
	if (gs(e)) return Array[es].slice.call(e);
	let n = ls(e);
	if (t === !0 || t === "class_only" && !n) {
		let t = Zo.getOwnPropertyDescriptors(e);
		delete t[W];
		let n = Reflect.ownKeys(t);
		for (let r = 0; r < n.length; r++) {
			let i = n[r], a = t[i];
			a[rs] === !1 && (a[rs] = !0, a[ts] = !0), (a.get || a.set) && (t[i] = {
				[ts]: !0,
				[rs]: !0,
				[ns]: a[ns],
				[is]: e[i]
			});
		}
		return Zo.create(Qo(e), t);
	}
	{
		let t = Qo(e);
		if (t !== null && n) return { ...e };
		let r = Zo.create(t);
		return Zo.assign(r, e);
	}
}
function Es(e, t = !1) {
	return ks(e) || as(e) || !os(e) || (ds(e) > 1 && Zo.defineProperties(e, {
		set: Os,
		add: Os,
		clear: Os,
		delete: Os
	}), Zo.freeze(e), t && us(e, (e, t) => {
		Es(t, !0);
	}, !1)), e;
}
function Ds() {
	Xo(2);
}
var Os = { [is]: Ds };
function ks(e) {
	return e === null || !ys(e) || Zo.isFrozen(e);
}
var As = "MapSet", js = "Patches", Ms = "ArrayMethods", Ns = {};
function Ps(e) {
	let t = Ns[e];
	return t || Xo(0, e), t;
}
var Fs = (e) => !!Ns[e], Is, Ls = () => Is, Rs = (e, t) => ({
	drafts_: [],
	parent_: e,
	immer_: t,
	canAutoFreeze_: !0,
	unfinalizedDrafts_: 0,
	handledSet_: /* @__PURE__ */ new Set(),
	processedForPatches_: /* @__PURE__ */ new Set(),
	mapSetPlugin_: Fs(As) ? Ps(As) : void 0,
	arrayMethodsPlugin_: Fs(Ms) ? Ps(Ms) : void 0
});
function zs(e, t) {
	t && (e.patchPlugin_ = Ps(js), e.patches_ = [], e.inversePatches_ = [], e.patchListener_ = t);
}
function Bs(e) {
	Vs(e), e.drafts_.forEach(Us), e.drafts_ = null;
}
function Vs(e) {
	e === Is && (Is = e.parent_);
}
var Hs = (e) => Is = Rs(Is, e);
function Us(e) {
	let t = e[W];
	t.type_ === 0 || t.type_ === 1 ? t.revoke_() : t.revoked_ = !0;
}
function Ws(e, t) {
	t.unfinalizedDrafts_ = t.drafts_.length;
	let n = t.drafts_[0];
	if (e !== void 0 && e !== n) {
		n[W].modified_ && (Bs(t), Xo(4)), os(e) && (e = Gs(t, e));
		let { patchPlugin_: r } = t;
		r && r.generateReplacementPatches_(n[W].base_, e, t);
	} else e = Gs(t, n);
	return Ks(t, e, !0), Bs(t), t.patches_ && t.patchListener_(t.patches_, t.inversePatches_), e === Jo ? void 0 : e;
}
function Gs(e, t) {
	if (ks(t)) return t;
	let n = t[W];
	if (!n) return ec(t, e.handledSet_, e);
	if (!Js(n, e)) return t;
	if (!n.modified_) return n.base_;
	if (!n.finalized_) {
		let { callbacks_: t } = n;
		if (t) for (; t.length > 0;) t.pop()(e);
		Qs(n, e);
	}
	return n.copy_;
}
function Ks(e, t, n = !1) {
	!e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && Es(t, n);
}
function qs(e) {
	e.finalized_ = !0, e.scope_.unfinalizedDrafts_--;
}
var Js = (e, t) => e.scope_ === t, Ys = [];
function Xs(e, t, n, r) {
	let i = Cs(e), a = e.type_;
	if (r !== void 0 && ps(i, r, a) === t) {
		ms(i, r, n, a);
		return;
	}
	if (!e.draftLocations_) {
		let t = e.draftLocations_ = /* @__PURE__ */ new Map();
		us(i, (e, n) => {
			if (as(n)) {
				let r = t.get(n) || [];
				r.push(e), t.set(n, r);
			}
		});
	}
	let o = e.draftLocations_.get(t) ?? Ys;
	for (let e of o) ms(i, e, n, a);
}
function Zs(e, t, n) {
	e.callbacks_.push(function(r) {
		let i = t;
		if (!i || !Js(i, r)) return;
		r.mapSetPlugin_?.fixSetContents(i);
		let a = ws(i);
		Xs(e, i.draft_ ?? i, a, n), Qs(i, r);
	});
}
function Qs(e, t) {
	if (e.modified_ && !e.finalized_ && (e.type_ === 3 || e.type_ === 1 && e.allIndicesReassigned_ || (e.assigned_?.size ?? 0) > 0)) {
		let { patchPlugin_: n } = t;
		if (n) {
			let r = n.getPath(e);
			r && n.generatePatches_(e, r, t);
		}
		qs(e);
	}
}
function $s(e, t, n) {
	let { scope_: r } = e;
	if (as(n)) {
		let i = n[W];
		Js(i, r) && i.callbacks_.push(function() {
			lc(e), Xs(e, n, ws(i), t);
		});
	} else os(n) && e.callbacks_.push(function() {
		let i = Cs(e);
		e.type_ === 3 ? i.has(n) && ec(n, r.handledSet_, r) : ps(i, t, e.type_) === n && r.drafts_.length > 1 && (e.assigned_.get(t) ?? !1) === !0 && e.copy_ && ec(ps(e.copy_, t, e.type_), r.handledSet_, r);
	});
}
function ec(e, t, n) {
	return !n.immer_.autoFreeze_ && n.unfinalizedDrafts_ < 1 || as(e) || t.has(e) || !os(e) || ks(e) || (t.add(e), us(e, (r, i) => {
		if (as(i)) {
			let t = i[W];
			Js(t, n) && (ms(e, r, ws(t), e.type_), qs(t));
		} else os(i) && ec(i, t, n);
	})), e;
}
function tc(e, t) {
	let n = gs(e), r = {
		type_: +!!n,
		scope_: t ? t.scope_ : Ls(),
		modified_: !1,
		finalized_: !1,
		assigned_: void 0,
		parent_: t,
		base_: e,
		draft_: null,
		copy_: null,
		revoke_: null,
		isManual_: !1,
		callbacks_: void 0
	}, i = r, a = nc;
	n && (i = [r], a = rc);
	let { revoke: o, proxy: s } = Proxy.revocable(i, a);
	return r.draft_ = s, r.revoke_ = o, [s, r];
}
var nc = {
	get(e, t) {
		if (t === W) return e;
		let n = e.scope_.arrayMethodsPlugin_, r = e.type_ === 1 && typeof t == "string";
		if (r && n?.isArrayOperationMethod(t)) return n.createMethodInterceptor(e, t);
		let i = Cs(e);
		if (!fs(i, t, e.type_)) return oc(e, i, t);
		let a = i[t];
		if (e.finalized_ || !os(a) || r && e.operationMethod && n?.isMutatingArrayMethod(e.operationMethod) && Ss(t)) return a;
		if (a === ic(e.base_, t) || ac(e, t, a)) {
			lc(e);
			let n = e.type_ === 1 ? +t : t, r = dc(e.scope_, a, e, n);
			return e.copy_[n] = r;
		}
		return a;
	},
	has(e, t) {
		return t in Cs(e);
	},
	ownKeys(e) {
		return Reflect.ownKeys(Cs(e));
	},
	set(e, t, n) {
		let r = sc(Cs(e), t);
		if (r?.set) return r.set.call(e.draft_, n), !0;
		if (!e.modified_) {
			let r = ic(Cs(e), t), i = r?.[W];
			if (i && i.base_ === n) return e.copy_[t] = n, e.assigned_.delete(t), !0;
			if (hs(n, r) && (n !== void 0 || fs(e.base_, t, e.type_))) return !0;
			lc(e), cc(e);
		}
		return e.copy_[t] === n && (n !== void 0 || fs(e.copy_, t, e.type_)) || Number.isNaN(n) && Number.isNaN(e.copy_[t]) || (e.copy_[t] = n, e.assigned_.set(t, !0), $s(e, t, n)), !0;
	},
	deleteProperty(e, t) {
		return lc(e), ic(e.base_, t) !== void 0 || t in e.base_ ? (e.assigned_.set(t, !1), cc(e)) : e.assigned_.delete(t), e.copy_ && delete e.copy_[t], !0;
	},
	getOwnPropertyDescriptor(e, t) {
		let n = Cs(e), r = Reflect.getOwnPropertyDescriptor(n, t);
		return r && {
			[rs]: !0,
			[ts]: e.type_ !== 1 || t !== "length",
			[ns]: r[ns],
			[is]: n[t]
		};
	},
	defineProperty() {
		Xo(11);
	},
	getPrototypeOf(e) {
		return Qo(e.base_);
	},
	setPrototypeOf() {
		Xo(12);
	}
}, rc = {};
for (let e in nc) {
	let t = nc[e];
	rc[e] = function() {
		let e = arguments;
		return e[0] = e[0][0], t.apply(this, e);
	};
}
rc.deleteProperty = function(e, t) {
	return rc.set.call(this, e, t, void 0);
}, rc.set = function(e, t, n) {
	return nc.set.call(this, e[0], t, n, e[0]);
};
function ic(e, t) {
	let n = e[W];
	return (n ? Cs(n) : e)[t];
}
function ac(e, t, n) {
	return e.type_ !== 1 || !e.allIndicesReassigned_ || e.assigned_?.get(t) || !os(n) || n[W] ? !1 : e.baseRefs_.has(n);
}
function oc(e, t, n) {
	let r = sc(t, n);
	return r ? is in r ? r[is] : r.get?.call(e.draft_) : void 0;
}
function sc(e, t) {
	if (!(t in e)) return;
	let n = Qo(e);
	for (; n;) {
		let e = Object.getOwnPropertyDescriptor(n, t);
		if (e) return e;
		n = Qo(n);
	}
}
function cc(e) {
	e.modified_ || (e.modified_ = !0, e.parent_ && cc(e.parent_));
}
function lc(e) {
	e.copy_ ||= (e.assigned_ = /* @__PURE__ */ new Map(), Ts(e.base_, e.scope_.immer_.useStrictShallowCopy_));
}
var uc = class {
	constructor(e) {
		this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.useStrictIteration_ = !1, this.produce = (e, t, n) => {
			if (bs(e) && !bs(t)) {
				let n = t;
				t = e;
				let r = this;
				return function(e = n, ...i) {
					return r.produce(e, (e) => t.call(this, e, ...i));
				};
			}
			bs(t) || Xo(6), n !== void 0 && !bs(n) && Xo(7);
			let r;
			if (os(e)) {
				let i = Hs(this), a = dc(i, e, void 0), o = !0;
				try {
					r = t(a), o = !1;
				} finally {
					o ? Bs(i) : Vs(i);
				}
				return zs(i, n), Ws(r, i);
			}
			if (!e || !ys(e)) {
				if (r = t(e), r === void 0 && (r = e), r === Jo && (r = void 0), this.autoFreeze_ && Es(r, !0), n) {
					let t = [], i = [];
					Ps(js).generateReplacementPatches_(e, r, {
						patches_: t,
						inversePatches_: i
					}), n(t, i);
				}
				return r;
			}
			Xo(1, e);
		}, this.produceWithPatches = (e, t) => {
			if (bs(e)) return (t, ...n) => this.produceWithPatches(t, (t) => e(t, ...n));
			let n, r;
			return [
				this.produce(e, t, (e, t) => {
					n = e, r = t;
				}),
				n,
				r
			];
		}, xs(e?.autoFreeze) && this.setAutoFreeze(e.autoFreeze), xs(e?.useStrictShallowCopy) && this.setUseStrictShallowCopy(e.useStrictShallowCopy), xs(e?.useStrictIteration) && this.setUseStrictIteration(e.useStrictIteration);
	}
	createDraft(e) {
		os(e) || Xo(8), as(e) && (e = fc(e));
		let t = Hs(this), n = dc(t, e, void 0);
		return n[W].isManual_ = !0, Vs(t), n;
	}
	finishDraft(e, t) {
		let n = e && e[W];
		(!n || !n.isManual_) && Xo(9);
		let { scope_: r } = n;
		return zs(r, t), Ws(void 0, r);
	}
	setAutoFreeze(e) {
		this.autoFreeze_ = e;
	}
	setUseStrictShallowCopy(e) {
		this.useStrictShallowCopy_ = e;
	}
	setUseStrictIteration(e) {
		this.useStrictIteration_ = e;
	}
	shouldUseStrictIteration() {
		return this.useStrictIteration_;
	}
	applyPatches(e, t) {
		let n;
		for (n = t.length - 1; n >= 0; n--) {
			let r = t[n];
			if (r.path.length === 0 && r.op === "replace") {
				e = r.value;
				break;
			}
		}
		n > -1 && (t = t.slice(n + 1));
		let r = Ps(js).applyPatches_;
		return as(e) ? r(e, t) : this.produce(e, (e) => r(e, t));
	}
};
function dc(e, t, n, r) {
	let [i, a] = _s(t) ? Ps(As).proxyMap_(t, n) : vs(t) ? Ps(As).proxySet_(t, n) : tc(t, n);
	return (n?.scope_ ?? Ls()).drafts_.push(i), a.callbacks_ = n?.callbacks_ ?? [], a.key_ = r, n && r !== void 0 ? Zs(n, a, r) : a.callbacks_.push(function(e) {
		e.mapSetPlugin_?.fixSetContents(a);
		let { patchPlugin_: t } = e;
		a.modified_ && t && t.generatePatches_(a, [], e);
	}), i;
}
function fc(e) {
	return as(e) || Xo(10, e), pc(e);
}
function pc(e) {
	if (!os(e) || ks(e)) return e;
	let t = e[W], n, r = !0;
	if (t) {
		if (!t.modified_) return t.base_;
		t.finalized_ = !0, n = Ts(e, t.scope_.immer_.useStrictShallowCopy_), r = t.scope_.immer_.shouldUseStrictIteration();
	} else n = Ts(e, !0);
	return us(n, (e, t) => {
		ms(n, e, pc(t));
	}, r), t && (t.finalized_ = !1), n;
}
globalThis.Iterator?.from;
var mc = new uc().produce, G = (e) => e;
//#endregion
//#region node_modules/redux-thunk/dist/redux-thunk.mjs
function hc(e) {
	return ({ dispatch: t, getState: n }) => (r) => (i) => typeof i == "function" ? i(t, n, e) : r(i);
}
var gc = hc(), _c = hc, vc = typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
	if (arguments.length !== 0) return typeof arguments[0] == "object" ? Go : Go.apply(null, arguments);
};
typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__;
function yc(e, t) {
	function n(...n) {
		if (t) {
			let r = t(...n);
			if (!r) throw Error(Ol(0));
			return {
				type: e,
				payload: r.payload,
				..."meta" in r && { meta: r.meta },
				..."error" in r && { error: r.error }
			};
		}
		return {
			type: e,
			payload: n[0]
		};
	}
	return n.toString = () => `${e}`, n.type = e, n.match = (t) => qo(t) && t.type === e, n;
}
var bc = class e extends Array {
	constructor(...t) {
		super(...t), Object.setPrototypeOf(this, e.prototype);
	}
	static get [Symbol.species]() {
		return e;
	}
	concat(...e) {
		return super.concat.apply(this, e);
	}
	prepend(...t) {
		return t.length === 1 && Array.isArray(t[0]) ? new e(...t[0].concat(this)) : new e(...t.concat(this));
	}
};
function xc(e) {
	return os(e) ? mc(e, () => {}) : e;
}
function Sc(e, t, n) {
	return e.has(t) ? e.get(t) : e.set(t, n(t)).get(t);
}
function Cc(e) {
	return typeof e == "boolean";
}
var wc = () => function(e) {
	let { thunk: t = !0, immutableCheck: n = !0, serializableCheck: r = !0, actionCreatorCheck: i = !0 } = e ?? {}, a = new bc();
	return t && (Cc(t) ? a.push(gc) : a.push(_c(t.extraArgument))), a;
}, Tc = "RTK_autoBatch", Ec = () => (e) => ({
	payload: e,
	meta: { [Tc]: !0 }
}), Dc = (e) => (t) => {
	setTimeout(t, e);
}, Oc = (e, t) => (n) => {
	let r = !1, i, a, o = () => {
		r || (r = !0, cancelAnimationFrame(i), clearTimeout(a), n());
	};
	i = e(o), a = setTimeout(o, t);
}, kc = (e = { type: "raf" }) => (t) => (...n) => {
	let r = t(...n), i = !0, a = !1, o = !1, s = /* @__PURE__ */ new Set(), c = e.type === "tick" ? queueMicrotask : e.type === "raf" ? typeof window < "u" && window.requestAnimationFrame ? Oc(window.requestAnimationFrame, 100) : Dc(10) : e.type === "callback" ? e.queueNotification : Dc(e.timeout), l = () => {
		o = !1, a && (a = !1, s.forEach((e) => e()));
	};
	return Object.assign({}, r, {
		subscribe(e) {
			let t = r.subscribe(() => i && e());
			return s.add(e), () => {
				t(), s.delete(e);
			};
		},
		dispatch(e) {
			try {
				return i = !e?.meta?.[Tc], a = !i, a && (o || (o = !0, c(l))), r.dispatch(e);
			} finally {
				i = !0;
			}
		}
	});
}, Ac = (e) => function(t) {
	let { autoBatch: n = !0 } = t ?? {}, r = new bc(e);
	return n && r.push(kc(typeof n == "object" ? n : void 0)), r;
};
function jc(e) {
	let t = wc(), { reducer: n = void 0, middleware: r, devTools: i = !0, duplicateMiddlewareCheck: a = !0, preloadedState: o = void 0, enhancers: s = void 0 } = e || {}, c;
	if (typeof n == "function") c = n;
	else if (Vo(n)) c = Wo(n);
	else throw Error(Ol(1));
	let l;
	l = typeof r == "function" ? r(t) : t();
	let u = Go;
	i && (u = vc({
		trace: !1,
		...typeof i == "object" && i
	}));
	let d = Ac(Ko(...l)), f = typeof s == "function" ? s(d) : d(), p = u(...f);
	return Ho(c, o, p);
}
function Mc(e) {
	let t = {}, n = [], r, i = {
		addCase(e, n) {
			let r = typeof e == "string" ? e : e.type;
			if (!r) throw Error(Ol(28));
			if (r in t) throw Error(Ol(29));
			return t[r] = n, i;
		},
		addAsyncThunk(e, r) {
			return r.pending && (t[e.pending.type] = r.pending), r.rejected && (t[e.rejected.type] = r.rejected), r.fulfilled && (t[e.fulfilled.type] = r.fulfilled), r.settled && n.push({
				matcher: e.settled,
				reducer: r.settled
			}), i;
		},
		addMatcher(e, t) {
			return n.push({
				matcher: e,
				reducer: t
			}), i;
		},
		addDefaultCase(e) {
			return r = e, i;
		}
	};
	return e(i), [
		t,
		n,
		r
	];
}
function Nc(e) {
	return typeof e == "function";
}
function Pc(e, t) {
	let [n, r, i] = Mc(t), a;
	if (Nc(e)) a = () => xc(e());
	else {
		let t = xc(e);
		a = () => t;
	}
	function o(e = a(), t) {
		let o = [n[t.type], ...r.filter(({ matcher: e }) => e(t)).map(({ reducer: e }) => e)];
		return o.filter((e) => !!e).length === 0 && (o = [i]), o.reduce((e, n) => {
			if (n) {
				if (as(e)) {
					let r = n(e, t);
					return r === void 0 ? e : r;
				}
				if (os(e)) return mc(e, (e) => n(e, t));
				{
					let r = n(e, t);
					if (r === void 0) {
						if (e === null) return e;
						throw Error(Ol(9));
					}
					return r;
				}
			}
			return e;
		}, e);
	}
	return o.getInitialState = a, o;
}
var Fc = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW", Ic = (e = 21) => {
	let t = "", n = e;
	for (; n--;) t += Fc[Math.random() * 64 | 0];
	return t;
}, Lc = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function Rc(e, t) {
	return `${e}/${t}`;
}
function zc({ creators: e } = {}) {
	let t = e?.asyncThunk?.[Lc];
	return function(e) {
		let { name: n, reducerPath: r = n } = e;
		if (!n) throw Error(Ol(11));
		let i = (typeof e.reducers == "function" ? e.reducers(Hc()) : e.reducers) || {}, a = Object.keys(i), o = {
			sliceCaseReducersByName: {},
			sliceCaseReducersByType: {},
			actionCreators: {},
			sliceMatchers: []
		}, s = {
			addCase(e, t) {
				let n = typeof e == "string" ? e : e.type;
				if (!n) throw Error(Ol(12));
				if (n in o.sliceCaseReducersByType) throw Error(Ol(13));
				return o.sliceCaseReducersByType[n] = t, s;
			},
			addMatcher(e, t) {
				return o.sliceMatchers.push({
					matcher: e,
					reducer: t
				}), s;
			},
			exposeAction(e, t) {
				return o.actionCreators[e] = t, s;
			},
			exposeCaseReducer(e, t) {
				return o.sliceCaseReducersByName[e] = t, s;
			}
		};
		a.forEach((r) => {
			let a = i[r], o = {
				reducerName: r,
				type: Rc(n, r),
				createNotation: typeof e.reducers == "function"
			};
			Wc(a) ? Kc(o, a, s, t) : Uc(o, a, s);
		});
		function c() {
			let [t = {}, n = [], r = void 0] = typeof e.extraReducers == "function" ? Mc(e.extraReducers) : [e.extraReducers], i = {
				...t,
				...o.sliceCaseReducersByType
			};
			return Pc(e.initialState, (e) => {
				for (let t in i) e.addCase(t, i[t]);
				for (let t of o.sliceMatchers) e.addMatcher(t.matcher, t.reducer);
				for (let t of n) e.addMatcher(t.matcher, t.reducer);
				r && e.addDefaultCase(r);
			});
		}
		let l = (e) => e, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new WeakMap(), f;
		function p(e, t) {
			return f ||= c(), f(e, t);
		}
		function m() {
			return f ||= c(), f.getInitialState();
		}
		function h(t, n = !1) {
			function r(e) {
				let i = e[t];
				return i === void 0 && n && (i = Sc(d, r, m)), i;
			}
			function i(t = l) {
				return Sc(Sc(u, n, () => /* @__PURE__ */ new WeakMap()), t, () => {
					let r = {};
					for (let [i, a] of Object.entries(e.selectors ?? {})) r[i] = Bc(a, t, () => Sc(d, t, m), n);
					return r;
				});
			}
			return {
				reducerPath: t,
				getSelectors: i,
				get selectors() {
					return i(r);
				},
				selectSlice: r
			};
		}
		let g = {
			name: n,
			reducer: p,
			actions: o.actionCreators,
			caseReducers: o.sliceCaseReducersByName,
			getInitialState: m,
			...h(r),
			injectInto(e, { reducerPath: t, ...n } = {}) {
				let i = t ?? r;
				return e.inject({
					reducerPath: i,
					reducer: p
				}, n), {
					...g,
					...h(i, !0)
				};
			}
		};
		return g;
	};
}
function Bc(e, t, n, r) {
	function i(i, ...a) {
		let o = t(i);
		return o === void 0 && r && (o = n()), e(o, ...a);
	}
	return i.unwrapped = e, i;
}
var Vc = /* @__PURE__ */ zc();
function Hc() {
	function e(e, t) {
		return {
			_reducerDefinitionType: "asyncThunk",
			payloadCreator: e,
			...t
		};
	}
	return e.withTypes = () => e, {
		reducer(e) {
			return Object.assign({ [e.name](...t) {
				return e(...t);
			} }[e.name], { _reducerDefinitionType: "reducer" });
		},
		preparedReducer(e, t) {
			return {
				_reducerDefinitionType: "reducerWithPrepare",
				prepare: e,
				reducer: t
			};
		},
		asyncThunk: e
	};
}
function Uc({ type: e, reducerName: t, createNotation: n }, r, i) {
	let a, o;
	if ("reducer" in r) {
		if (n && !Gc(r)) throw Error(Ol(17));
		a = r.reducer, o = r.prepare;
	} else a = r;
	i.addCase(e, a).exposeCaseReducer(t, a).exposeAction(t, o ? yc(e, o) : yc(e));
}
function Wc(e) {
	return e._reducerDefinitionType === "asyncThunk";
}
function Gc(e) {
	return e._reducerDefinitionType === "reducerWithPrepare";
}
function Kc({ type: e, reducerName: t }, n, r, i) {
	if (!i) throw Error(Ol(18));
	let { payloadCreator: a, fulfilled: o, pending: s, rejected: c, settled: l, options: u } = n, d = i(e, a, u);
	r.exposeAction(t, d), o && r.addCase(d.fulfilled, o), s && r.addCase(d.pending, s), c && r.addCase(d.rejected, c), l && r.addMatcher(d.settled, l), r.exposeCaseReducer(t, {
		fulfilled: o || qc,
		pending: s || qc,
		rejected: c || qc,
		settled: l || qc
	});
}
function qc() {}
var Jc = "task", Yc = "listener", Xc = "completed", Zc = "cancelled", Qc = `task-${Zc}`, $c = `task-${Xc}`, el = `${Yc}-${Zc}`, tl = `${Yc}-${Xc}`, nl = class {
	code;
	name = "TaskAbortError";
	message;
	constructor(e) {
		this.code = e, this.message = `${Jc} ${Zc} (reason: ${e})`;
	}
}, rl = (e, t) => {
	if (typeof e != "function") throw TypeError(Ol(32));
}, il = () => {}, al = (e, t = il) => (e.catch(t), e), ol = (e, t) => (e.addEventListener("abort", t, { once: !0 }), () => e.removeEventListener("abort", t)), sl = (e) => {
	if (e.aborted) throw new nl(e.reason);
};
function cl(e, t) {
	let n = il;
	return new Promise((r, i) => {
		let a = () => i(new nl(e.reason));
		e.aborted ? a() : (n = ol(e, a), t.finally(() => n()).then(r, i));
	}).finally(() => {
		n = il;
	});
}
var ll = async (e, t) => {
	try {
		return await Promise.resolve(), {
			status: "ok",
			value: await e()
		};
	} catch (e) {
		return {
			status: e instanceof nl ? "cancelled" : "rejected",
			error: e
		};
	} finally {
		t?.();
	}
}, ul = (e) => (t) => al(cl(e, t).then((t) => (sl(e), t))), dl = (e) => {
	let t = ul(e);
	return (e) => t(new Promise((t) => setTimeout(t, e)));
}, { assign: fl } = Object, pl = {}, ml = "listenerMiddleware", hl = (e, t) => {
	let n = (t) => ol(e, () => t.abort(e.reason));
	return (r, i) => {
		rl(r, "taskExecutor");
		let a = new AbortController();
		n(a);
		let o = ll(async () => {
			sl(e), sl(a.signal);
			let t = await r({
				pause: ul(a.signal),
				delay: dl(a.signal),
				signal: a.signal
			});
			return sl(a.signal), t;
		}, () => a.abort($c));
		return i?.autoJoin && t.push(o.catch(il)), {
			result: ul(e)(o),
			cancel() {
				a.abort(Qc);
			}
		};
	};
}, gl = (e, t) => {
	let n = async (n, r) => {
		sl(t);
		let i = () => {}, a = [new Promise((t, r) => {
			let a = e({
				predicate: n,
				effect: (e, n) => {
					n.unsubscribe(), t([
						e,
						n.getState(),
						n.getOriginalState()
					]);
				}
			});
			i = () => {
				a(), r();
			};
		})];
		r != null && a.push(new Promise((e) => setTimeout(e, r, null)));
		try {
			let e = await cl(t, Promise.race(a));
			return sl(t), e;
		} finally {
			i();
		}
	};
	return ((e, t) => al(n(e, t)));
}, _l = (e) => {
	let { type: t, actionCreator: n, matcher: r, predicate: i, effect: a } = e;
	if (t) i = yc(t).match;
	else if (n) t = n.type, i = n.match;
	else if (r) i = r;
	else if (!i) throw Error(Ol(21));
	return rl(a, "options.listener"), {
		predicate: i,
		type: t,
		effect: a
	};
}, vl = /* @__PURE__ */ fl((e) => {
	let { type: t, predicate: n, effect: r } = _l(e);
	return {
		id: Ic(),
		effect: r,
		type: t,
		predicate: n,
		pending: /* @__PURE__ */ new Set(),
		unsubscribe: () => {
			throw Error(Ol(22));
		}
	};
}, { withTypes: () => vl }), yl = (e, t) => {
	let { type: n, effect: r, predicate: i } = _l(t);
	return Array.from(e.values()).find((e) => (typeof n == "string" ? e.type === n : e.predicate === i) && e.effect === r);
}, bl = (e) => {
	e.pending.forEach((e) => {
		e.abort(el);
	});
}, xl = (e, t) => () => {
	for (let e of t.keys()) bl(e);
	e.clear();
}, Sl = (e, t, n) => {
	try {
		e(t, n);
	} catch (e) {
		setTimeout(() => {
			throw e;
		}, 0);
	}
}, Cl = /* @__PURE__ */ fl(/* @__PURE__ */ yc(`${ml}/add`), { withTypes: () => Cl }), wl = /* @__PURE__ */ yc(`${ml}/removeAll`), Tl = /* @__PURE__ */ fl(/* @__PURE__ */ yc(`${ml}/remove`), { withTypes: () => Tl }), El = (...e) => {
	console.error(`${ml}/error`, ...e);
}, Dl = (e = {}) => {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e) => {
		let t = n.get(e) ?? 0;
		n.set(e, t + 1);
	}, i = (e) => {
		let t = n.get(e) ?? 1;
		t === 1 ? n.delete(e) : n.set(e, t - 1);
	}, { extra: a, onError: o = El } = e;
	rl(o, "onError");
	let s = (e) => (e.unsubscribe = () => t.delete(e.id), t.set(e.id, e), (t) => {
		e.unsubscribe(), t?.cancelActive && bl(e);
	}), c = ((e) => {
		let n = yl(t, e) ?? vl(e);
		return s(n);
	});
	fl(c, { withTypes: () => c });
	let l = (e) => {
		let n = yl(t, e);
		return n && (n.unsubscribe(), e.cancelActive && bl(n)), !!n;
	};
	fl(l, { withTypes: () => l });
	let u = async (e, n, s, l) => {
		let u = new AbortController(), d = gl(c, u.signal), f = [];
		try {
			e.pending.add(u), r(e), await Promise.resolve(e.effect(n, fl({}, s, {
				getOriginalState: l,
				condition: (e, t) => d(e, t).then(Boolean),
				take: d,
				delay: dl(u.signal),
				pause: ul(u.signal),
				extra: a,
				signal: u.signal,
				fork: hl(u.signal, f),
				unsubscribe: e.unsubscribe,
				subscribe: () => {
					t.set(e.id, e);
				},
				cancelActiveListeners: () => {
					e.pending.forEach((e, t, n) => {
						e !== u && (e.abort(el), n.delete(e));
					});
				},
				cancel: () => {
					u.abort(el), e.pending.delete(u);
				},
				throwIfCancelled: () => {
					sl(u.signal);
				}
			})));
		} catch (e) {
			e instanceof nl || Sl(o, e, { raisedBy: "effect" });
		} finally {
			await Promise.all(f), u.abort(tl), i(e), e.pending.delete(u);
		}
	}, d = xl(t, n);
	return {
		middleware: (e) => (n) => (r) => {
			if (!qo(r)) return n(r);
			if (Cl.match(r)) return c(r.payload);
			if (wl.match(r)) {
				d();
				return;
			}
			if (Tl.match(r)) return l(r.payload);
			let i = e.getState(), a = () => {
				if (i === pl) throw Error(Ol(23));
				return i;
			}, s;
			try {
				if (s = n(r), t.size > 0) {
					let n = e.getState(), s = Array.from(t.values());
					for (let t of s) {
						let s = !1;
						try {
							s = t.predicate(r, n, i);
						} catch (e) {
							s = !1, Sl(o, e, { raisedBy: "predicate" });
						}
						s && u(t, r, e, a);
					}
				}
			} finally {
				i = pl;
			}
			return s;
		},
		startListening: c,
		stopListening: l,
		clearListeners: d
	};
};
function Ol(e) {
	return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
//#endregion
//#region node_modules/recharts/es6/state/layoutSlice.js
var kl = Vc({
	name: "chartLayout",
	initialState: {
		layoutType: "horizontal",
		width: 0,
		height: 0,
		margin: {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},
		scale: 1
	},
	reducers: {
		setLayout(e, t) {
			e.layoutType = t.payload;
		},
		setChartSize(e, t) {
			e.width = t.payload.width, e.height = t.payload.height;
		},
		setMargin(e, t) {
			e.margin.top = t.payload.top ?? 0, e.margin.right = t.payload.right ?? 0, e.margin.bottom = t.payload.bottom ?? 0, e.margin.left = t.payload.left ?? 0;
		},
		setScale(e, t) {
			e.scale = t.payload;
		}
	}
}), Al = kl.actions, jl = Al.setMargin, Ml = Al.setLayout, Nl = Al.setChartSize, Pl = Al.setScale, Fl = kl.reducer;
//#endregion
//#region node_modules/recharts/es6/util/getSliced.js
function Il(e, t, n) {
	return Array.isArray(e) && e && t + n !== 0 ? e.slice(t, n + 1) : e;
}
//#endregion
//#region node_modules/recharts/es6/util/isWellBehavedNumber.js
function K(e) {
	return Number.isFinite(e);
}
function Ll(e) {
	return typeof e == "number" && e > 0 && Number.isFinite(e);
}
//#endregion
//#region node_modules/recharts/es6/util/ChartUtils.js
function Rl(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function zl(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Rl(Object(n), !0).forEach(function(t) {
			Bl(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rl(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Bl(e, t, n) {
	return (t = Vl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Vl(e) {
	var t = Hl(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Hl(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Ul(e, t, n) {
	return mr(e) || mr(t) ? n : sr(t) ? $n(e, t, n) : typeof t == "function" ? t(e) : n;
}
var Wl = (e, t, n) => {
	if (t && n) {
		var r = n.width, i = n.height, a = t.align, o = t.verticalAlign, s = t.layout, c = t.position, l = t.offset, u = l === void 0 ? 0 : l;
		if (c != null) {
			if (Er(c)) {
				if (c === "top" && z(e.top)) return zl(zl({}, e), {}, { top: e.top + (i || 0) + u });
				if (c === "bottom" && z(e.bottom)) return zl(zl({}, e), {}, { bottom: e.bottom + (i || 0) + u });
				if (c === "left" && z(e.left)) return zl(zl({}, e), {}, { left: e.left + (r || 0) + u });
				if (c === "right" && z(e.right)) return zl(zl({}, e), {}, { right: e.right + (r || 0) + u });
			}
			return e;
		}
		if ((s === "vertical" || s === "horizontal" && o === "middle") && a !== "center" && z(e[a])) return zl(zl({}, e), {}, { [a]: e[a] + (r || 0) });
		if ((s === "horizontal" || s === "vertical" && a === "center") && o !== "middle" && z(e[o])) return zl(zl({}, e), {}, { [o]: e[o] + (i || 0) });
	}
	return e;
}, Gl = (e, t) => e === "horizontal" && t === "xAxis" || e === "vertical" && t === "yAxis" || e === "centric" && t === "angleAxis" || e === "radial" && t === "radiusAxis", Kl = (e, t, n, r) => {
	if (r) return e.map((e) => e.coordinate);
	var i, a, o = e.map((e) => (e.coordinate === t && (i = !0), e.coordinate === n && (a = !0), e.coordinate));
	return i || o.push(t), a || o.push(n), o;
}, ql = (e, t, n) => {
	if (!e) return null;
	var r = e.duplicateDomain, i = e.type, a = e.range, o = e.scale, s = e.realScaleType, c = e.isCategorical, l = e.categoricalDomain, u = e.tickCount, d = e.ticks, f = e.niceTicks, p = e.axisType;
	if (!o) return null;
	var m = s === "scaleBand" && o.bandwidth ? o.bandwidth() / 2 : 2, h = (t || n) && i === "category" && o.bandwidth ? o.bandwidth() / m : 0;
	return h = p === "angleAxis" && a && a.length >= 2 ? ir(a[0] - a[1]) * 2 * h : h, t && (d || f) ? (d || f || []).map((e, t) => {
		var n = r ? r.indexOf(e) : e, i = o.map(n);
		return K(i) ? {
			coordinate: i + h,
			value: e,
			offset: h,
			index: t
		} : null;
	}).filter(gr) : c && l ? l.map((e, t) => {
		var n = o.map(e);
		return K(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(gr) : o.ticks && !n && u != null ? o.ticks(u).map((e, t) => {
		var n = o.map(e);
		return K(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(gr) : o.domain().map((e, t) => {
		var n = o.map(e);
		return K(n) ? {
			coordinate: n + h,
			value: r ? r[e] : e,
			index: t,
			offset: h
		} : null;
	}).filter(gr);
}, Jl = {
	sign: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0, o = 0; o < t; ++o) {
				var s = e[o]?.[r];
				if (s != null) {
					var c = s[1], l = s[0], u = ar(c) ? l : c;
					u >= 0 ? (s[0] = i, i += u, s[1] = i) : (s[0] = a, a += u, s[1] = a);
				}
			}
		}
	},
	expand: wi,
	none: yi,
	silhouette: Ti,
	wiggle: Ei,
	positive: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0; a < t; ++a) {
				var o = e[a]?.[r];
				if (o != null) {
					var s = ar(o[1]) ? o[0] : o[1];
					s >= 0 ? (o[0] = i, i += s, o[1] = i) : (o[0] = 0, o[1] = 0);
				}
			}
		}
	}
}, Yl = (e, t, n) => {
	var r = Jl[n] ?? yi, i = Ci().keys(t).value((e, t) => Number(Ul(e, t, 0))).order(bi).offset(r)(e);
	return i.forEach((n, r) => {
		n.forEach((n, i) => {
			var a = Ul(e[i], t[r], 0);
			Array.isArray(a) && a.length === 2 && z(a[0]) && z(a[1]) && (n[0] = a[0], n[1] = a[1]);
		});
	}), i;
};
function Xl(e) {
	var t = e.axis, n = e.ticks, r = e.bandSize, i = e.entry, a = e.index, o = e.dataKey;
	if (t.type === "category") {
		if (!t.allowDuplicatedCategory && t.dataKey && !mr(i[t.dataKey])) {
			var s = pr(n, "value", i[t.dataKey]);
			if (s) return s.coordinate + r / 2;
		}
		return n != null && n[a] ? n[a].coordinate + r / 2 : null;
	}
	var c = Ul(i, mr(o) ? t.dataKey : o), l = t.scale.map(c);
	return z(l) ? l : null;
}
var Zl = (e) => {
	var t = e.flat(2).filter(z);
	return [Math.min(...t), Math.max(...t)];
}, Ql = (e) => [e[0] === Infinity ? 0 : e[0], e[1] === -Infinity ? 0 : e[1]], $l = (e, t, n) => {
	if (e != null && Object.keys(e).length !== 0) return Ql(Object.keys(e).reduce((r, i) => {
		var a = e[i];
		if (!a) return r;
		var o = a.stackedData.reduce((e, r) => {
			var i = Zl(Il(r, t, n));
			return !K(i[0]) || !K(i[1]) ? e : [Math.min(e[0], i[0]), Math.max(e[1], i[1])];
		}, [Infinity, -Infinity]);
		return [Math.min(o[0], r[0]), Math.max(o[1], r[1])];
	}, [Infinity, -Infinity]));
}, eu = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, tu = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, nu = (e, t, n) => {
	if (e && e.scale && e.scale.bandwidth) {
		var r = e.scale.bandwidth();
		if (!n || r > 0) return r;
	}
	if (e && t && t.length >= 2) {
		for (var i = To(t, (e) => e.coordinate), a = [], o = 0, s = 1, c = i.length; s < c; s++) {
			var l = (i[s]?.coordinate || 0) - (i[s - 1]?.coordinate || 0);
			a.push(l), o = Math.max(l, o);
		}
		var u = o * 1e-4, d = Infinity;
		for (var f of a) f > u && (d = Math.min(f, d));
		return d === Infinity ? 0 : d;
	}
	return n ? void 0 : 0;
};
function q(e) {
	var t = e.tooltipEntrySettings, n = e.dataKey, r = e.payload, i = e.value, a = e.name;
	return zl(zl({}, t), {}, {
		dataKey: n,
		payload: r,
		value: i,
		name: a
	});
}
function ru(e, t) {
	if (e != null) return String(e);
	if (typeof t == "string") return t;
}
var iu = (e, t) => {
	if (t === "horizontal") return e.relativeX;
	if (t === "vertical") return e.relativeY;
}, au = (e, t) => t === "centric" ? e.angle : e.radius, ou = (e) => e.layout.width, su = (e) => e.layout.height, cu = (e) => e.layout.scale, lu = (e) => e.layout.margin, uu = H((e) => e.cartesianAxis.xAxis, (e) => Object.values(e)), du = H((e) => e.cartesianAxis.yAxis, (e) => Object.values(e)), fu = "data-recharts-item-index";
//#endregion
//#region node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js
function pu(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function mu(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? pu(Object(n), !0).forEach(function(t) {
			hu(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pu(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function hu(e, t, n) {
	return (t = gu(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function gu(e) {
	var t = _u(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function _u(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var vu = (e) => e.brush.height;
function yu(e) {
	return du(e).reduce((e, t) => t.orientation === "left" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function bu(e) {
	return du(e).reduce((e, t) => t.orientation === "right" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function xu(e) {
	return uu(e).reduce((e, t) => t.orientation === "top" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
function Su(e) {
	return uu(e).reduce((e, t) => t.orientation === "bottom" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
var Cu = H([
	ou,
	su,
	lu,
	vu,
	yu,
	bu,
	xu,
	Su,
	Eo,
	Do
], (e, t, n, r, i, a, o, s, c, l) => {
	var u = {
		left: (n.left || 0) + i,
		right: (n.right || 0) + a
	}, d = mu(mu({}, {
		top: (n.top || 0) + o,
		bottom: (n.bottom || 0) + s
	}), u), f = d.bottom;
	d.bottom += r, d = Wl(d, c, l);
	var p = e - d.left - d.right, m = t - d.top - d.bottom;
	return mu(mu({ brushBottom: f }, d), {}, {
		width: Math.max(p, 0),
		height: Math.max(m, 0)
	});
}), wu = H(Cu, (e) => ({
	x: e.left,
	y: e.top,
	width: e.width,
	height: e.height
})), Tu = H(ou, su, (e, t) => ({
	x: 0,
	y: 0,
	width: e,
	height: t
})), Eu = /*#__PURE__*/ (0, y.createContext)(null), Du = () => (0, y.useContext)(Eu) != null, Ou = (e) => e.brush, ku = H([
	Ou,
	Cu,
	lu
], (e, t, n) => ({
	height: e.height,
	x: z(e.x) ? e.x : t.left,
	y: z(e.y) ? e.y : t.top + t.height + t.brushBottom - (n?.bottom || 0),
	width: z(e.width) ? e.width : t.width
}));
//#endregion
//#region node_modules/es-toolkit/dist/function/debounce.mjs
function Au(e, t, { signal: n, edges: r } = {}) {
	let i, a = null, o = r != null && r.includes("leading"), s = r == null || r.includes("trailing"), c = () => {
		a !== null && (e.apply(i, a), i = void 0, a = null);
	}, l = () => {
		s && c(), p();
	}, u = null, d = () => {
		u != null && clearTimeout(u), u = setTimeout(() => {
			u = null, l();
		}, t);
	}, f = () => {
		u !== null && (clearTimeout(u), u = null);
	}, p = () => {
		f(), i = void 0, a = null;
	}, m = () => {
		c();
	}, h = function(...e) {
		if (n?.aborted) return;
		i = this, a = e;
		let t = u == null;
		d(), o && t && c();
	};
	return h.schedule = d, h.cancel = p, h.flush = m, n?.addEventListener("abort", p, { once: !0 }), h;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/function/debounce.mjs
function ju(e, t = 0, n = {}) {
	typeof n != "object" && (n = {});
	let { leading: r = !1, trailing: i = !0, maxWait: a } = n, o = [, ,];
	r && (o[0] = "leading"), i && (o[1] = "trailing");
	let s, c = null, l = Au(function(...t) {
		s = e.apply(this, t), c = null;
	}, t, { edges: o }), u = function(...t) {
		return a != null && (c === null && (c = Date.now()), Date.now() - c >= a) ? ((r || i) && (s = e.apply(this, t)), c = Date.now(), l.cancel(), l.schedule(), s) : (l.apply(this, t), s);
	};
	return u.cancel = l.cancel, u.flush = () => (l.flush(), s), u;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/function/throttle.mjs
function Mu(e, t = 0, n = {}) {
	let { leading: r = !0, trailing: i = !0 } = n;
	return ju(e, t, {
		leading: r,
		maxWait: t,
		trailing: i
	});
}
//#endregion
//#region node_modules/recharts/es6/util/LogUtils.js
var Nu = function(e, t) {
	var n = [...arguments].slice(2);
	if (typeof console < "u" && console.warn && (t === void 0 && console.warn("LogUtils requires an error message argument"), !e)) {
		if (t === void 0) console.warn("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
		else {
			var r = 0;
			console.warn(t.replace(/%s/g, () => n[r++]));
		}
	}
}, Pu = {
	width: "100%",
	height: "100%",
	debounce: 0,
	minWidth: 0,
	initialDimension: {
		width: -1,
		height: -1
	}
}, Fu = (e, t, n) => {
	var r = n.width, i = r === void 0 ? Pu.width : r, a = n.height, o = a === void 0 ? Pu.height : a, s = n.aspect, c = n.maxHeight, l = or(i) ? e : Number(i), u = or(o) ? t : Number(o);
	return s && s > 0 && (l ? u = l / s : u && (l = u * s), c && u != null && u > c && (u = c)), {
		calculatedWidth: l,
		calculatedHeight: u
	};
}, Iu = {
	width: 0,
	height: 0,
	overflow: "visible"
}, Lu = {
	width: 0,
	overflowX: "visible"
}, Ru = {
	height: 0,
	overflowY: "visible"
}, zu = {}, Bu = (e) => {
	var t = e.width, n = e.height, r = or(t), i = or(n);
	return r && i ? Iu : r ? Lu : i ? Ru : zu;
};
function Vu(e) {
	var t = e.width, n = e.height, r = e.aspect, i = t, a = n;
	return i === void 0 && a === void 0 ? (i = Pu.width, a = Pu.height) : i === void 0 ? i = r && r > 0 ? void 0 : Pu.width : a === void 0 && (a = r && r > 0 ? void 0 : Pu.height), {
		width: i,
		height: a
	};
}
//#endregion
//#region node_modules/recharts/es6/component/ResponsiveContainer.js
var Hu = [
	"aspect",
	"initialDimension",
	"width",
	"height",
	"minWidth",
	"minHeight",
	"maxHeight",
	"children",
	"debounce",
	"id",
	"className",
	"onResize",
	"style"
];
function Uu() {
	return Uu = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Uu.apply(null, arguments);
}
function Wu(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Gu(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Wu(Object(n), !0).forEach(function(t) {
			Ku(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wu(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Ku(e, t, n) {
	return (t = qu(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function qu(e) {
	var t = Ju(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Ju(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Yu(e, t) {
	return Y(e) || Qu(e, t) || Zu(e, t) || Xu();
}
function Xu() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Zu(e, t) {
	if (e) {
		if (typeof e == "string") return J(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? J(e, t) : void 0;
	}
}
function J(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Qu(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Y(e) {
	if (Array.isArray(e)) return e;
}
function X(e, t) {
	if (e == null) return {};
	var n, r, i = $u(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function $u(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var ed = /*#__PURE__*/ (0, y.createContext)(Pu.initialDimension);
function td(e) {
	return Ll(e.width) && Ll(e.height);
}
function nd(e) {
	var t = e.children, n = e.width, r = e.height, i = (0, y.useMemo)(() => ({
		width: n,
		height: r
	}), [n, r]);
	return td(i) ? /*#__PURE__*/ y.createElement(ed.Provider, { value: i }, t) : null;
}
var rd = () => (0, y.useContext)(ed), id = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.aspect, r = e.initialDimension, i = r === void 0 ? Pu.initialDimension : r, a = e.width, o = e.height, s = e.minWidth, c = s === void 0 ? Pu.minWidth : s, l = e.minHeight, u = e.maxHeight, d = e.children, f = e.debounce, p = f === void 0 ? Pu.debounce : f, m = e.id, h = e.className, g = e.onResize, _ = e.style, v = _ === void 0 ? {} : _, b = X(e, Hu), x = (0, y.useRef)(null), S = (0, y.useRef)();
	S.current = g, (0, y.useImperativeHandle)(t, () => x.current);
	var C = Yu((0, y.useState)({
		containerWidth: i.width,
		containerHeight: i.height
	}), 2), w = C[0], T = C[1], E = (0, y.useCallback)((e, t) => {
		T((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []);
	(0, y.useEffect)(() => {
		if (x.current == null || typeof ResizeObserver > "u") return _r;
		var e = (e) => {
			var t, n = e[0];
			if (n != null) {
				var r = n.contentRect, i = r.width, a = r.height;
				E(i, a), (t = S.current) == null || t.call(S, i, a);
			}
		};
		p > 0 && (e = Mu(e, p, {
			trailing: !0,
			leading: !1
		}));
		var t = new ResizeObserver(e), n = x.current.getBoundingClientRect(), r = n.width, i = n.height;
		return E(r, i), t.observe(x.current), () => {
			t.disconnect();
		};
	}, [E, p]);
	var D = w.containerWidth, O = w.containerHeight;
	Nu(!n || n > 0, "The aspect(%s) must be greater than zero.", n);
	var k = Fu(D, O, {
		width: a,
		height: o,
		aspect: n,
		maxHeight: u
	}), A = k.calculatedWidth, j = k.calculatedHeight;
	return Nu(D < 0 || O < 0 || A != null && A > 0 || j != null && j > 0, "The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.", A, j, a, o, c, l, n), /*#__PURE__*/ y.createElement("div", Uu({
		id: m ? `${m}` : void 0,
		className: Tn("recharts-responsive-container", h),
		style: Gu(Gu({}, v), {}, {
			width: a,
			height: o,
			minWidth: c,
			minHeight: l,
			maxHeight: u
		}),
		ref: x
	}, b), /*#__PURE__*/ y.createElement("div", { style: Bu({
		width: a,
		height: o
	}) }, /*#__PURE__*/ y.createElement(nd, {
		width: A,
		height: j
	}, d)));
}), ad = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = rd();
	if (Ll(n.width) && Ll(n.height)) return e.children;
	var r = Vu({
		width: e.width,
		height: e.height,
		aspect: e.aspect
	}), i = r.width, a = r.height, o = Fu(void 0, void 0, {
		width: i,
		height: a,
		aspect: e.aspect,
		maxHeight: e.maxHeight
	}), s = o.calculatedWidth, c = o.calculatedHeight;
	return z(s) && z(c) ? /*#__PURE__*/ y.createElement(nd, {
		width: s,
		height: c
	}, e.children) : /*#__PURE__*/ y.createElement(id, Uu({}, e, {
		width: i,
		height: a,
		ref: t
	}));
}), od = () => {
	var e = Du(), t = V(wu), n = V(ku), r = V(Ou)?.padding;
	return !e || !n || !r ? t : {
		width: n.width - r.left - r.right,
		height: n.height - r.top - r.bottom,
		x: r.left,
		y: r.top
	};
}, sd = {
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
	brushBottom: 0
}, cd = () => V(Cu) ?? sd, ld = () => V(ou), ud = () => V(su), dd = (e) => e.layout.layoutType, fd = () => V(dd), pd = () => {
	var e = fd();
	if (e === "horizontal" || e === "vertical") return e;
}, md = (e) => {
	var t = e.layout.layoutType;
	if (t === "centric" || t === "radial") return t;
}, hd = () => fd() !== void 0, gd = (e) => {
	var t = $a(), n = Du(), r = e.width, i = e.height, a = rd(), o = r, s = i;
	return a && (o = a.width > 0 ? a.width : r, s = a.height > 0 ? a.height : i), (0, y.useEffect)(() => {
		!n && Ll(o) && Ll(s) && t(Nl({
			width: o,
			height: s
		}));
	}, [
		t,
		n,
		o,
		s
	]), null;
}, _d = Vc({
	name: "legend",
	initialState: {
		settings: {
			layout: "horizontal",
			align: "center",
			verticalAlign: "bottom",
			itemSorter: "value",
			position: void 0,
			offset: 0
		},
		size: {
			width: 0,
			height: 0
		},
		payload: []
	},
	reducers: {
		setLegendSize(e, t) {
			e.size.width = t.payload.width, e.size.height = t.payload.height;
		},
		setLegendSettings(e, t) {
			e.settings.align = t.payload.align, e.settings.layout = t.payload.layout, e.settings.verticalAlign = t.payload.verticalAlign, e.settings.itemSorter = t.payload.itemSorter, e.settings.position = t.payload.position, e.settings.offset = t.payload.offset;
		},
		addLegendPayload: {
			reducer(e, t) {
				e.payload.push(G(t.payload));
			},
			prepare: Ec()
		},
		replaceLegendPayload: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = fc(e).payload.indexOf(G(r));
				a > -1 && (e.payload[a] = G(i));
			},
			prepare: Ec()
		},
		removeLegendPayload: {
			reducer(e, t) {
				var n = fc(e).payload.indexOf(G(t.payload));
				n > -1 && e.payload.splice(n, 1);
			},
			prepare: Ec()
		}
	}
}), vd = _d.actions;
vd.setLegendSize, vd.setLegendSettings;
var yd = vd.addLegendPayload, bd = vd.replaceLegendPayload, xd = vd.removeLegendPayload, Sd = _d.reducer, Cd = /* @__PURE__ */ s(((e) => {
	var t = m();
	t.useSyncExternalStore, t.useRef, t.useEffect, t.useMemo, t.useDebugValue;
}));
(/* @__PURE__ */ s(((e, t) => {
	t.exports = Cd();
})))();
function wd(e) {
	e();
}
function Td() {
	let e = null, t = null;
	return {
		clear() {
			e = null, t = null;
		},
		notify() {
			wd(() => {
				let t = e;
				for (; t;) t.callback(), t = t.next;
			});
		},
		get() {
			let t = [], n = e;
			for (; n;) t.push(n), n = n.next;
			return t;
		},
		subscribe(n) {
			let r = !0, i = t = {
				callback: n,
				next: null,
				prev: t
			};
			return i.prev ? i.prev.next = i : e = i, function() {
				r && e !== null && (r = !1, i.next ? i.next.prev = i.prev : t = i.prev, i.prev ? i.prev.next = i.next : e = i.next);
			};
		}
	};
}
var Ed = {
	notify() {},
	get: () => []
};
function Dd(e, t) {
	let n, r = Ed, i = 0, a = !1;
	function o(e) {
		u();
		let t = r.subscribe(e), n = !1;
		return () => {
			n || (n = !0, t(), d());
		};
	}
	function s() {
		r.notify();
	}
	function c() {
		m.onStateChange && m.onStateChange();
	}
	function l() {
		return a;
	}
	function u() {
		i++, n || (n = t ? t.addNestedSub(c) : e.subscribe(c), r = Td());
	}
	function d() {
		i--, n && i === 0 && (n(), n = void 0, r.clear(), r = Ed);
	}
	function f() {
		a || (a = !0, u());
	}
	function p() {
		a && (a = !1, d());
	}
	let m = {
		addNestedSub: o,
		notifyNestedSubs: s,
		handleChangeWrapper: c,
		isSubscribed: l,
		trySubscribe: f,
		tryUnsubscribe: p,
		getListeners: () => r
	};
	return m;
}
var Od = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, kd = typeof navigator < "u" && navigator.product === "ReactNative", Ad = Od || kd ? y.useLayoutEffect : y.useEffect;
function jd(e, t) {
	return e === t ? e !== 0 || t !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
function Md(e, t) {
	if (jd(e, t)) return !0;
	if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r = 0; r < n.length; r++) if (!Object.prototype.hasOwnProperty.call(t, n[r]) || !jd(e[n[r]], t[n[r]])) return !1;
	return !0;
}
var Nd = /* @__PURE__ */ Symbol.for("react-redux-context"), Pd = typeof globalThis < "u" ? globalThis : {};
function Fd() {
	if (!y.createContext) return {};
	let e = Pd[Nd] ??= /* @__PURE__ */ new Map(), t = e.get(y.createContext);
	return t || (t = y.createContext(null), e.set(y.createContext, t)), t;
}
var Id = /* @__PURE__ */ Fd();
function Ld(e) {
	let { children: t, context: n, serverState: r, store: i } = e, a = y.useMemo(() => {
		let e = Dd(i);
		return {
			store: i,
			subscription: e,
			getServerState: r ? () => r : void 0
		};
	}, [i, r]), o = y.useMemo(() => i.getState(), [i]);
	Ad(() => {
		let { subscription: e } = a;
		return e.onStateChange = e.notifyNestedSubs, e.trySubscribe(), o !== i.getState() && e.notifyNestedSubs(), () => {
			e.tryUnsubscribe(), e.onStateChange = void 0;
		};
	}, [a, o]);
	let s = n || Id;
	return /* @__PURE__ */ y.createElement(s.Provider, { value: a }, t);
}
var Rd = Ld, zd = /* @__PURE__ */ new Set([
	"axisLine",
	"tickLine",
	"activeBar",
	"activeDot",
	"activeLabel",
	"activeShape",
	"allowEscapeViewBox",
	"background",
	"cursor",
	"dot",
	"label",
	"line",
	"margin",
	"padding",
	"position",
	"shape",
	"style",
	"tick",
	"wrapperStyle",
	"radius",
	"throttledEvents"
]);
function Bd(e, t) {
	return e == null && t == null ? !0 : typeof e == "number" && typeof t == "number" ? e === t || e !== e && t !== t : e === t;
}
function Vd(e, t) {
	for (var n of /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])) if (zd.has(n)) {
		if (e[n] == null && t[n] == null) continue;
		if (!Md(e[n], t[n])) return !1;
	} else if (!Bd(e[n], t[n])) return !1;
	return !0;
}
//#endregion
//#region node_modules/recharts/es6/component/DefaultTooltipContent.js
function Hd() {
	return Hd = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Hd.apply(null, arguments);
}
function Ud(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Wd(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Ud(Object(n), !0).forEach(function(t) {
			Gd(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ud(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Gd(e, t, n) {
	return (t = Kd(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Kd(e) {
	var t = qd(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function qd(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Jd(e, t) {
	return $d(e) || Qd(e, t) || Xd(e, t) || Yd();
}
function Yd() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Xd(e, t) {
	if (e) {
		if (typeof e == "string") return Zd(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zd(e, t) : void 0;
	}
}
function Zd(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Qd(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function $d(e) {
	if (Array.isArray(e)) return e;
}
function ef(e) {
	return Array.isArray(e) && sr(e[0]) && sr(e[1]) ? e.join(" ~ ") : e;
}
var tf = {
	separator: " : ",
	contentStyle: {
		margin: 0,
		padding: 10,
		backgroundColor: "#fff",
		border: "1px solid #ccc",
		whiteSpace: "nowrap"
	},
	itemStyle: {
		display: "block",
		paddingTop: 4,
		paddingBottom: 4,
		color: "#000"
	},
	labelStyle: {},
	accessibilityLayer: !1
};
function nf(e, t) {
	return t == null ? e : To(e, t);
}
var rf = (e) => {
	var t = e.separator, n = t === void 0 ? tf.separator : t, r = e.contentStyle, i = e.itemStyle, a = e.labelStyle, o = a === void 0 ? tf.labelStyle : a, s = e.payload, c = e.formatter, l = e.itemSorter, u = e.wrapperClassName, d = e.labelClassName, f = e.label, p = e.labelFormatter, m = e.accessibilityLayer, h = m === void 0 ? tf.accessibilityLayer : m, g = () => {
		if (s && s.length) {
			var e = {
				padding: 0,
				margin: 0
			}, t = nf(s, l).map((e, t) => {
				if (!e || e.type === "none") return null;
				var r = e.formatter || c || ef, a = e.value, o = e.name, l = a, u = o;
				if (r) {
					var d = r(a, o, e, t, s);
					if (Array.isArray(d)) {
						var f = Jd(d, 2);
						l = f[0], u = f[1];
					} else if (d != null) l = d;
					else return null;
				}
				var p = Wd(Wd({}, tf.itemStyle), {}, { color: e.color || tf.itemStyle.color }, i);
				return /*#__PURE__*/ y.createElement("li", {
					className: "recharts-tooltip-item",
					key: `tooltip-item-${t}`,
					style: p
				}, sr(u) ? /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-name" }, u) : null, sr(u) ? /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-separator" }, n) : null, /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-value" }, l), /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-unit" }, e.unit || ""));
			});
			return /*#__PURE__*/ y.createElement("ul", {
				className: "recharts-tooltip-item-list",
				style: e
			}, t);
		}
		return null;
	}, _ = Wd(Wd({}, tf.contentStyle), r), v = Wd({ margin: 0 }, o), b = !mr(f), x = b ? f : "", S = Tn("recharts-default-tooltip", u), C = Tn("recharts-tooltip-label", d);
	b && p && s != null && (x = p(f, s));
	var w = h ? {
		role: "status",
		"aria-live": "assertive"
	} : {};
	return /*#__PURE__*/ y.createElement("div", Hd({
		className: S,
		style: _
	}, w), /*#__PURE__*/ y.createElement("p", {
		className: C,
		style: v
	}, /*#__PURE__*/ y.isValidElement(x) ? x : `${x}`), g());
}, af = "recharts-tooltip-wrapper", of = { visibility: "hidden" };
function sf(e) {
	var t = e.coordinate, n = e.translateX, r = e.translateY;
	return Tn(af, {
		[`${af}-right`]: z(n) && t && z(t.x) && n >= t.x,
		[`${af}-left`]: z(n) && t && z(t.x) && n < t.x,
		[`${af}-bottom`]: z(r) && t && z(t.y) && r >= t.y,
		[`${af}-top`]: z(r) && t && z(t.y) && r < t.y
	});
}
function cf(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.key, i = e.offset, a = e.position, o = e.reverseDirection, s = e.tooltipDimension, c = e.viewBox, l = e.viewBoxDimension;
	if (a && z(a[r])) return a[r];
	var u = n[r] - s - (i > 0 ? i : 0), d = n[r] + i;
	if (t[r]) return o[r] ? u : d;
	var f = c[r];
	return f == null ? 0 : o[r] ? Math.max(u < f ? d : u, f) : l == null ? 0 : d + s > f + l ? Math.max(u, f) : Math.max(d, f);
}
function lf(e) {
	var t = e.translateX, n = e.translateY;
	return { transform: e.useTranslate3d ? `translate3d(${t}px, ${n}px, 0)` : `translate(${t}px, ${n}px)` };
}
function uf(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.offsetTop, i = e.offsetLeft, a = e.position, o = e.reverseDirection, s = e.tooltipBox, c = e.useTranslate3d, l = e.viewBox, u, d, f;
	return s && s.height > 0 && s.width > 0 && n ? (d = cf({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "x",
		offset: i,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.width,
		viewBox: l,
		viewBoxDimension: l.width
	}), f = cf({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "y",
		offset: r,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.height,
		viewBox: l,
		viewBoxDimension: l.height
	}), u = lf({
		translateX: d,
		translateY: f,
		useTranslate3d: c
	})) : u = of, {
		cssProperties: u,
		cssClasses: sf({
			translateX: d,
			translateY: f,
			coordinate: n
		})
	};
}
var df = {
	devToolsEnabled: !0,
	isSsr: !(typeof window < "u" && window.document && window.document.createElement && window.setTimeout)
};
//#endregion
//#region node_modules/recharts/es6/util/usePrefersReducedMotion.js
function ff(e, t) {
	return _f(e) || gf(e, t) || mf(e, t) || pf();
}
function pf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function mf(e, t) {
	if (e) {
		if (typeof e == "string") return hf(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? hf(e, t) : void 0;
	}
}
function hf(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function gf(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function _f(e) {
	if (Array.isArray(e)) return e;
}
function vf() {
	var e = ff((0, y.useState)(() => df.isSsr || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches), 2), t = e[0], n = e[1];
	return (0, y.useEffect)(() => {
		if (window.matchMedia) {
			var e = window.matchMedia("(prefers-reduced-motion: reduce)"), t = () => {
				n(e.matches);
			};
			return e.addEventListener("change", t), () => {
				e.removeEventListener("change", t);
			};
		}
	}, []), t;
}
//#endregion
//#region node_modules/recharts/es6/component/TooltipBoundingBox.js
function yf(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function bf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? yf(Object(n), !0).forEach(function(t) {
			xf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yf(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function xf(e, t, n) {
	return (t = Sf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Sf(e) {
	var t = Cf(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Cf(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function wf(e, t) {
	return kf(e) || Of(e, t) || Ef(e, t) || Tf();
}
function Tf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ef(e, t) {
	if (e) {
		if (typeof e == "string") return Df(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Df(e, t) : void 0;
	}
}
function Df(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Of(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function kf(e) {
	if (Array.isArray(e)) return e;
}
function Af(e) {
	if (!(e.prefersReducedMotion && e.isAnimationActive === "auto") && e.isAnimationActive && e.active) {
		var t = typeof e.animationEasing == "string" ? e.animationEasing : "ease";
		return `transform ${e.animationDuration}ms ${t}`;
	}
}
function jf(e) {
	var t = vf(), n = wf(y.useState(() => ({
		dismissed: !1,
		dismissedAtCoordinate: {
			x: 0,
			y: 0
		}
	})), 2), r = n[0], i = n[1];
	y.useEffect(() => {
		var t = (t) => {
			t.key === "Escape" && i({
				dismissed: !0,
				dismissedAtCoordinate: {
					x: e.coordinate?.x ?? 0,
					y: e.coordinate?.y ?? 0
				}
			});
		};
		return document.addEventListener("keydown", t), () => {
			document.removeEventListener("keydown", t);
		};
	}, [e.coordinate?.x, e.coordinate?.y]), r.dismissed && ((e.coordinate?.x ?? 0) !== r.dismissedAtCoordinate.x || (e.coordinate?.y ?? 0) !== r.dismissedAtCoordinate.y) && i(bf(bf({}, r), {}, { dismissed: !1 }));
	var a = uf({
		allowEscapeViewBox: e.allowEscapeViewBox,
		coordinate: e.coordinate,
		offsetLeft: typeof e.offset == "number" ? e.offset : e.offset.x,
		offsetTop: typeof e.offset == "number" ? e.offset : e.offset.y,
		position: e.position,
		reverseDirection: e.reverseDirection,
		tooltipBox: e.lastBoundingBox,
		useTranslate3d: e.useTranslate3d,
		viewBox: e.viewBox
	}), o = a.cssClasses, s = a.cssProperties, c = bf(bf({}, e.hasPortalFromProps ? {} : bf(bf({ transition: Af({
		prefersReducedMotion: t,
		isAnimationActive: e.isAnimationActive,
		active: e.active,
		animationDuration: e.animationDuration,
		animationEasing: e.animationEasing
	}) }, s), {}, {
		pointerEvents: "none",
		position: "absolute",
		top: 0,
		left: 0
	})), {}, { visibility: !r.dismissed && e.active && e.hasPayload ? "visible" : "hidden" }, e.wrapperStyle);
	return /*#__PURE__*/ y.createElement("div", {
		xmlns: "http://www.w3.org/1999/xhtml",
		tabIndex: -1,
		className: o,
		style: c,
		ref: e.innerRef
	}, e.children);
}
var Mf = /*#__PURE__*/ y.memo(jf), Nf = () => V((e) => e.rootProps.accessibilityLayer) ?? !0;
//#endregion
//#region node_modules/recharts/es6/shape/Curve.js
function Pf() {
	return Pf = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Pf.apply(null, arguments);
}
function Ff(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function If(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Ff(Object(n), !0).forEach(function(t) {
			Lf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ff(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Lf(e, t, n) {
	return (t = Rf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Rf(e) {
	var t = zf(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function zf(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Bf = {
	curveBasisClosed: Qr,
	curveBasisOpen: ei,
	curveBasis: Xr,
	curveBumpX: Gr,
	curveBumpY: Kr,
	curveLinearClosed: ni,
	curveLinear: zr,
	curveMonotoneX: ui,
	curveMonotoneY: di,
	curveNatural: mi,
	curveStep: gi,
	curveStepAfter: vi,
	curveStepBefore: _i
}, Vf = (e) => K(e.x) && K(e.y), Hf = (e) => e.base != null && Vf(e.base) && Vf(e), Z = (e) => e.x, Uf = (e) => e.y, Wf = (e, t) => {
	if (typeof e == "function") return e;
	var n = `curve${hr(e)}`;
	if ((n === "curveMonotone" || n === "curveBump") && t) {
		var r = Bf[`${n}${t === "vertical" ? "Y" : "X"}`];
		if (r) return r;
	}
	return Bf[n] || zr;
}, Gf = {
	connectNulls: !1,
	type: "linear"
}, Kf = (e) => {
	var t = e.type, n = t === void 0 ? Gf.type : t, r = e.points, i = r === void 0 ? [] : r, a = e.baseLine, o = e.layout, s = e.connectNulls, c = s === void 0 ? Gf.connectNulls : s, l = Wf(n, o), u = c ? i.filter(Vf) : i;
	if (Array.isArray(a)) {
		var d, f = i.map((e, t) => If(If({}, e), {}, { base: a[t] }));
		return d = o === "vertical" ? Ur().y(Uf).x1(Z).x0((e) => e.base.x) : Ur().x(Z).y1(Uf).y0((e) => e.base.y), d.defined(Hf).curve(l)(c ? f.filter(Hf) : f);
	}
	return (o === "vertical" && z(a) ? Ur().y(Uf).x1(Z).x0(a) : z(a) ? Ur().x(Z).y1(Uf).y0(a) : Hr().x(Z).y(Uf)).defined(Vf).curve(l)(u);
}, qf = (e) => {
	var t = e.className, n = e.points, r = e.path, i = e.pathRef, a = fd();
	if ((!n || !n.length) && !r) return null;
	var o = {
		type: e.type,
		points: e.points,
		baseLine: e.baseLine,
		layout: e.layout || a,
		connectNulls: e.connectNulls
	}, s = n && n.length ? Kf(o) : r;
	return /*#__PURE__*/ y.createElement("path", Pf({}, jn(e), Oi(e), {
		className: Tn("recharts-curve", t),
		d: s === null ? void 0 : s,
		ref: i
	}));
}, Jf = [
	"x",
	"y",
	"top",
	"left",
	"width",
	"height",
	"className"
];
function Yf() {
	return Yf = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Yf.apply(null, arguments);
}
function Xf(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Zf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Xf(Object(n), !0).forEach(function(t) {
			Qf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Xf(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Qf(e, t, n) {
	return (t = $f(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function $f(e) {
	var t = ep(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ep(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function tp(e, t) {
	if (e == null) return {};
	var n, r, i = np(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function np(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var rp = (e, t, n, r, i, a) => `M${e},${i}v${r}M${a},${t}h${n}`, ip = (e) => {
	var t = e.x, n = t === void 0 ? 0 : t, r = e.y, i = r === void 0 ? 0 : r, a = e.top, o = a === void 0 ? 0 : a, s = e.left, c = s === void 0 ? 0 : s, l = e.width, u = l === void 0 ? 0 : l, d = e.height, f = d === void 0 ? 0 : d, p = e.className, m = tp(e, Jf), h = Zf({
		x: n,
		y: i,
		top: o,
		left: c,
		width: u,
		height: f
	}, m);
	return !z(n) || !z(i) || !z(u) || !z(f) || !z(o) || !z(c) ? null : /*#__PURE__*/ y.createElement("path", Yf({}, Nn(h), {
		className: Tn("recharts-cross", p),
		d: rp(n, i, u, f, o, c)
	}));
};
//#endregion
//#region node_modules/recharts/es6/util/cursor/getCursorRectangle.js
function ap(e, t, n, r) {
	var i = r / 2;
	return {
		stroke: "none",
		fill: "#ccc",
		x: e === "horizontal" ? t.x - i : n.left + .5,
		y: e === "horizontal" ? n.top + .5 : t.y - i,
		width: e === "horizontal" ? r : n.width - 1,
		height: e === "horizontal" ? n.height - 1 : r
	};
}
var op = (e, t) => [
	0,
	3 * e,
	3 * t - 6 * e,
	3 * e - 3 * t + 1
], sp = (e, t) => e.map((e, n) => e * t ** n).reduce((e, t) => e + t), cp = (e, t) => (n) => sp(op(e, t), n), lp = (e, t) => (n) => sp([...op(e, t).map((e, t) => e * t).slice(1), 0], n), up = (e) => {
	var t, n = e.split("(");
	if (n.length !== 2 || n[0] !== "cubic-bezier") return null;
	var r = (t = n[1]) == null || (t = t.split(")")[0]) == null ? void 0 : t.split(",");
	if (r == null || r.length !== 4) return null;
	var i = r.map((e) => parseFloat(e));
	return [
		i[0],
		i[1],
		i[2],
		i[3]
	];
}, dp = function() {
	var e = [...arguments];
	if (e.length === 1) switch (e[0]) {
		case "linear": return [
			0,
			0,
			1,
			1
		];
		case "ease": return [
			.25,
			.1,
			.25,
			1
		];
		case "ease-in": return [
			.42,
			0,
			1,
			1
		];
		case "ease-out": return [
			.42,
			0,
			.58,
			1
		];
		case "ease-in-out": return [
			0,
			0,
			.58,
			1
		];
		default:
			var t = up(e[0]);
			if (t) return t;
	}
	return e.length === 4 ? e : [
		0,
		0,
		1,
		1
	];
}, fp = (e, t, n, r) => {
	var i = cp(e, n), a = cp(t, r), o = lp(e, n), s = (e) => e > 1 ? 1 : e < 0 ? 0 : e, c = (e) => {
		for (var t = e > 1 ? 1 : e, n = t, r = 0; r < 8; ++r) {
			var c = i(n) - t, l = o(n);
			if (Math.abs(c - t) < 1e-4 || l < 1e-4) return a(n);
			n = s(n - c / l);
		}
		return a(n);
	};
	return c.isStepper = !1, c;
}, pp = function() {
	return fp(...dp(...arguments));
}, mp = function() {
	for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = e.stiff, n = t === void 0 ? 100 : t, r = e.damping, i = r === void 0 ? 8 : r, a = e.dt, o = a === void 0 ? 16.67 : a, s = 1, c = [0], l = 0, u = 0, d = 1e4, f = 0; f < d;) {
		var p = -(l - s) * n, m = u * i;
		if (u += (p - m) * o / 1e3, l += u * o / 1e3, c.push(l), Math.abs(l - s) < 1e-4 && Math.abs(u) < 1e-4) break;
		f++;
	}
	c[c.length - 1] = s;
	var h = c.length - 1;
	return (e) => {
		if (e <= 0) return 0;
		if (e >= 1) return s;
		var t = e * h, n = Math.floor(t), r = t - n;
		return (c[n] ?? 0) + ((c[n + 1] ?? 0) - (c[n] ?? 0)) * r;
	};
}, hp = (e) => {
	if (typeof e == "string") switch (e) {
		case "ease":
		case "ease-in-out":
		case "ease-out":
		case "ease-in":
		case "linear": return pp(e);
		case "spring": return mp();
		default: if (e.split("(")[0] === "cubic-bezier") return pp(e);
	}
	return typeof e == "function" ? e : null;
}, gp = /*#__PURE__*/ (0, y.createContext)((e, t, n) => {
	var r, i = (a) => {
		var o = t.tick(a);
		if (t.getState() === "active") {
			if (n(t.getInterpolated()), t.getProgress() === 1) {
				t.complete(), r = void 0;
				return;
			}
			r = e.setTimeout(i, o);
		} else r = e.setTimeout(i, o);
	};
	return r = e.setTimeout(i, 0), () => r?.();
});
gp.Provider;
function _p(e) {
	var t = (0, y.useContext)(gp);
	return (0, y.useMemo)(() => e ?? t, [e, t]);
}
//#endregion
//#region node_modules/recharts/es6/animation/AnimationHandle.js
function vp(e, t, n) {
	return (t = yp(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function yp(e) {
	var t = bp(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function bp(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var xp = "init", Sp = "pending", Cp = "active", wp = "completed";
function Tp(e) {
	return Math.max(0, e);
}
var Ep = class {
	getAnimationStartedTime() {
		return this.animationStartedTime;
	}
	getBeginStartedTime() {
		return this.beginStartedTime;
	}
	constructor(e) {
		var t;
		vp(this, "state", xp), this.animationId = e.animationId, this.onAnimationEnd = e.onAnimationEnd, this.animationDuration = Tp(e.animationDuration), this.animationBegin = Tp(e.animationBegin), this.progress = 0, this.from = e.from, this.to = e.to, this.easing = e.easing, (t = e.onAnimationStart) == null || t.call(e);
	}
	getState() {
		return this.state;
	}
	getEasing() {
		return this.easing;
	}
	getAnimationDuration() {
		return this.animationDuration;
	}
	tick(e) {
		if (this.getState() === xp) return this.state = Sp, this.beginStartedTime = e, this.animationBegin;
		if (this.getState() === Sp) {
			if (this.beginStartedTime == null) throw Error();
			var t = e - this.beginStartedTime;
			return t >= this.animationBegin ? (this.state = Cp, this.animationStartedTime = e, this.nextAnimationUpdate(0)) : Tp(this.animationBegin - t);
		}
		if (this.getState() === Cp) {
			if (this.animationStartedTime == null) throw Error();
			var n = e - this.animationStartedTime;
			return this.setProgress(n / this.animationDuration), this.nextAnimationUpdate(n);
		}
		return 0;
	}
	setProgress(e) {
		this.progress = Math.min(1, Math.max(0, e));
	}
	getProgress() {
		return this.progress;
	}
	complete() {
		if (this.progress = 1, this.state === "active") {
			var e;
			(e = this.onAnimationEnd) == null || e.call(this);
		}
		this.state = wp;
	}
	getFrom() {
		return this.from;
	}
	getTo() {
		return this.to;
	}
	getAnimationId() {
		return this.animationId;
	}
	getAnimationBegin() {
		return this.animationBegin;
	}
}, Dp = class extends Ep {
	nextAnimationUpdate() {
		return 0;
	}
	getInterpolated() {
		return this.easing(fr(this.getFrom(), this.getTo(), this.getProgress()));
	}
}, Op = class {
	setTimeout(e) {
		var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, n = performance.now(), r = null, i = (a) => {
			a - n >= t ? e(a) : r = requestAnimationFrame(i);
		};
		return r = requestAnimationFrame(i), () => {
			r != null && cancelAnimationFrame(r);
		};
	}
};
//#endregion
//#region node_modules/recharts/es6/animation/JavascriptAnimate.js
function kp(e, t) {
	return Pp(e) || Np(e, t) || jp(e, t) || Ap();
}
function Ap() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function jp(e, t) {
	if (e) {
		if (typeof e == "string") return Mp(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mp(e, t) : void 0;
	}
}
function Mp(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Np(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Pp(e) {
	if (Array.isArray(e)) return e;
}
var Fp = {
	begin: 0,
	duration: 1e3,
	easing: "ease",
	isActive: !0,
	canBegin: !0,
	onAnimationEnd: () => {},
	onAnimationStart: () => {}
}, Ip = 0, Lp = 1;
function Rp(e) {
	var t = Ii(e, Fp), n = t.animationId, r = t.isActive, i = t.canBegin, a = t.duration, o = t.easing, s = t.begin, c = t.onAnimationEnd, l = t.onAnimationStart, u = t.children, d = vf(), f = r === "auto" ? !df.isSsr && !d : r, p = _p(t.animationController), m = kp((0, y.useState)(f ? Ip : Lp), 2), h = m[0], g = m[1];
	return (0, y.useEffect)(() => {
		f || g(Lp);
	}, [f]), (0, y.useEffect)(() => {
		var e = hp(o);
		return !f || !i || e == null ? _r : p(new Op(), new Dp({
			animationId: n,
			easing: e,
			animationDuration: a,
			animationBegin: s,
			onAnimationStart: l,
			onAnimationEnd: c,
			from: Ip,
			to: Lp
		}), g);
	}, [
		p,
		n,
		f,
		i,
		a,
		o,
		s,
		l,
		c
	]), u(Number(h));
}
//#endregion
//#region node_modules/recharts/es6/util/useAnimationId.js
function zp(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "animation-", n = (0, y.useRef)(lr(t)), r = (0, y.useRef)(e);
	return r.current !== e && (n.current = lr(t), r.current = e), n.current;
}
//#endregion
//#region node_modules/recharts/es6/animation/util.js
var Bp = (e) => e.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`), Vp = (e, t, n) => e.map((e) => `${Bp(e)} ${t}ms ${n}`).join(","), Hp = ["radius"], Up = ["radius"], Wp, Gp, Kp, qp, Jp, Yp, Xp, Zp, Qp, $p;
function em(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function tm(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? em(Object(n), !0).forEach(function(t) {
			nm(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : em(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function nm(e, t, n) {
	return (t = rm(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function rm(e) {
	var t = im(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function im(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function am() {
	return am = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, am.apply(null, arguments);
}
function om(e, t) {
	if (e == null) return {};
	var n, r, i = sm(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function sm(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function cm(e, t) {
	return pm(e) || fm(e, t) || um(e, t) || lm();
}
function lm() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function um(e, t) {
	if (e) {
		if (typeof e == "string") return dm(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? dm(e, t) : void 0;
	}
}
function dm(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function fm(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function pm(e) {
	if (Array.isArray(e)) return e;
}
function mm(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var hm = (e, t, n, r, i) => {
	var a = nr(n), o = nr(r), s = Math.min(Math.abs(a) / 2, Math.abs(o) / 2), c = o >= 0 ? 1 : -1, l = a >= 0 ? 1 : -1, u = +(o >= 0 && a >= 0 || o < 0 && a < 0), d;
	if (s > 0 && Array.isArray(i)) {
		for (var f = [
			0,
			0,
			0,
			0
		], p = 0, m = 4; p < m; p++) {
			var h = i[p] ?? 0;
			f[p] = h > s ? s : h;
		}
		d = rr(Wp ||= mm([
			"M",
			",",
			""
		]), e, t + c * f[0]), f[0] > 0 && (d += rr(Gp ||= mm([
			"A ",
			",",
			",0,0,",
			",",
			",",
			""
		]), f[0], f[0], u, e + l * f[0], t)), d += rr(Kp ||= mm([
			"L ",
			",",
			""
		]), e + n - l * f[1], t), f[1] > 0 && (d += rr(qp ||= mm([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[1], f[1], u, e + n, t + c * f[1])), d += rr(Jp ||= mm([
			"L ",
			",",
			""
		]), e + n, t + r - c * f[2]), f[2] > 0 && (d += rr(Yp ||= mm([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[2], f[2], u, e + n - l * f[2], t + r)), d += rr(Xp ||= mm([
			"L ",
			",",
			""
		]), e + l * f[3], t + r), f[3] > 0 && (d += rr(Zp ||= mm([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[3], f[3], u, e, t + r - c * f[3])), d += "Z";
	} else if (s > 0 && i === +i && i > 0) {
		var g = Math.min(s, i);
		d = rr(Qp ||= mm(/* @__PURE__ */ "M .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,. Z".split(".")), e, t + c * g, g, g, u, e + l * g, t, e + n - l * g, t, g, g, u, e + n, t + c * g, e + n, t + r - c * g, g, g, u, e + n - l * g, t + r, e + l * g, t + r, g, g, u, e, t + r - c * g);
	} else d = rr($p ||= mm([
		"M ",
		",",
		" h ",
		" v ",
		" h ",
		" Z"
	]), e, t, n, r, -n);
	return d;
}, gm = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	radius: 0,
	isAnimationActive: !1,
	isUpdateAnimationActive: !1,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease"
}, _m = (e) => {
	var t = Ii(e, gm), n = (0, y.useRef)(null), r = cm((0, y.useState)(-1), 2), i = r[0], a = r[1];
	(0, y.useEffect)(() => {
		if (n.current && n.current.getTotalLength) try {
			var e = n.current.getTotalLength();
			e && a(e);
		} catch {}
	}, []);
	var o = t.x, s = t.y, c = t.width, l = t.height, u = t.radius, d = t.className, f = t.animationEasing, p = t.animationDuration, m = t.animationBegin, h = t.isAnimationActive, g = t.isUpdateAnimationActive, _ = (0, y.useRef)(c), v = (0, y.useRef)(l), b = (0, y.useRef)(o), x = (0, y.useRef)(s), S = zp((0, y.useMemo)(() => ({
		x: o,
		y: s,
		width: c,
		height: l,
		radius: u
	}), [
		o,
		s,
		c,
		l,
		u
	]), "rectangle-");
	if (o !== +o || s !== +s || c !== +c || l !== +l || c === 0 || l === 0) return null;
	var C = Tn("recharts-rectangle", d);
	if (!g) {
		var w = Nn(t);
		w.radius;
		var T = om(w, Hp);
		return /*#__PURE__*/ y.createElement("path", am({}, T, {
			x: nr(o),
			y: nr(s),
			width: nr(c),
			height: nr(l),
			radius: typeof u == "number" ? u : void 0,
			className: C,
			d: hm(o, s, c, l, u)
		}));
	}
	var E = _.current, D = v.current, O = b.current, k = x.current, A = `0px ${i === -1 ? 1 : i}px`, j = `${i}px ${i}px`, M = Vp(["strokeDasharray"], p, typeof f == "string" ? f : gm.animationEasing);
	return /*#__PURE__*/ y.createElement(Rp, {
		animationId: S,
		key: S,
		canBegin: i > 0,
		duration: p,
		easing: f,
		isActive: g,
		begin: m
	}, (e) => {
		var r = fr(E, c, e), i = fr(D, l, e), a = fr(O, o, e), d = fr(k, s, e);
		n.current && (_.current = r, v.current = i, b.current = a, x.current = d);
		var f = h ? e > 0 ? {
			transition: M,
			strokeDasharray: j
		} : { strokeDasharray: A } : { strokeDasharray: j }, p = Nn(t);
		p.radius;
		var m = om(p, Up);
		return /*#__PURE__*/ y.createElement("path", am({}, m, {
			radius: typeof u == "number" ? u : void 0,
			className: C,
			d: hm(a, d, r, i, u),
			ref: n,
			style: tm(tm({}, f), t.style)
		}));
	});
};
//#endregion
//#region node_modules/recharts/es6/util/PolarUtils.js
function vm(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ym(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? vm(Object(n), !0).forEach(function(t) {
			bm(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vm(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function bm(e, t, n) {
	return (t = xm(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function xm(e) {
	var t = Sm(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Sm(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Cm = Math.PI / 180, wm = (e) => e * 180 / Math.PI, Tm = (e, t, n, r) => ({
	x: e + Math.cos(-Cm * r) * n,
	y: t + Math.sin(-Cm * r) * n
}), Em = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		width: 0,
		height: 0,
		brushBottom: 0
	};
	return Math.min(Math.abs(e - (n.left || 0) - (n.right || 0)), Math.abs(t - (n.top || 0) - (n.bottom || 0))) / 2;
}, Dm = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return Math.sqrt((n - i) ** 2 + (r - a) ** 2);
}, Om = (e, t) => {
	var n = e.x, r = e.y, i = t.cx, a = t.cy, o = Dm({
		x: n,
		y: r
	}, {
		x: i,
		y: a
	});
	if (o <= 0) return {
		radius: o,
		angle: 0
	};
	var s = (n - i) / o, c = Math.acos(s);
	return r > a && (c = 2 * Math.PI - c), {
		radius: o,
		angle: wm(c),
		angleInRadian: c
	};
}, km = (e) => {
	var t = e.startAngle, n = e.endAngle, r = Math.floor(t / 360), i = Math.floor(n / 360), a = Math.min(r, i);
	return {
		startAngle: t - a * 360,
		endAngle: n - a * 360
	};
}, Am = (e, t) => {
	var n = t.startAngle, r = t.endAngle, i = Math.floor(n / 360), a = Math.floor(r / 360);
	return e + Math.min(i, a) * 360;
}, jm = (e, t) => {
	var n = e.relativeX, r = e.relativeY, i = Om({
		x: n,
		y: r
	}, t), a = i.radius, o = i.angle, s = t.innerRadius, c = t.outerRadius;
	if (a < s || a > c || a === 0) return null;
	var l = km(t), u = l.startAngle, d = l.endAngle, f = o, p;
	if (u <= d) {
		for (; f > d;) f -= 360;
		for (; f < u;) f += 360;
		p = f >= u && f <= d;
	} else {
		for (; f > u;) f -= 360;
		for (; f < d;) f += 360;
		p = f >= d && f <= u;
	}
	return p ? ym(ym({}, t), {}, {
		radius: a,
		angle: Am(f, t)
	}) : null;
};
//#endregion
//#region node_modules/recharts/es6/util/cursor/getRadialCursorPoints.js
function Mm(e) {
	var t = e.cx, n = e.cy, r = e.radius, i = e.startAngle, a = e.endAngle;
	return {
		points: [Tm(t, n, r, i), Tm(t, n, r, a)],
		cx: t,
		cy: n,
		radius: r,
		startAngle: i,
		endAngle: a
	};
}
//#endregion
//#region node_modules/recharts/es6/shape/Sector.js
var Nm, Pm, Fm, Im, Lm, Rm, zm;
function Bm() {
	return Bm = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Bm.apply(null, arguments);
}
function Vm(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Hm = (e, t) => ir(t - e) * Math.min(Math.abs(t - e), 359.999), Um = (e) => {
	var t = e.cx, n = e.cy, r = e.radius, i = e.angle, a = e.sign, o = e.isExternal, s = e.cornerRadius, c = e.cornerIsExternal, l = s * (o ? 1 : -1) + r, u = Math.asin(s / l) / Cm, d = c ? i : i + a * u, f = Tm(t, n, l, d), p = Tm(t, n, r, d), m = c ? i - a * u : i;
	return {
		center: f,
		circleTangency: p,
		lineTangency: Tm(t, n, l * Math.cos(u * Cm), m),
		theta: u
	};
}, Wm = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.startAngle, o = e.endAngle, s = Hm(a, o), c = a + s, l = Tm(t, n, i, a), u = Tm(t, n, i, c), d = rr(Nm ||= Vm([
		"M ",
		",",
		"\n    A ",
		",",
		",0,\n    ",
		",",
		",\n    ",
		",",
		"\n  "
	]), l.x, l.y, i, i, +(Math.abs(s) > 180), +(a > c), u.x, u.y);
	if (r > 0) {
		var f = Tm(t, n, r, a), p = Tm(t, n, r, c);
		d += rr(Pm ||= Vm([
			"L ",
			",",
			"\n            A ",
			",",
			",0,\n            ",
			",",
			",\n            ",
			",",
			" Z"
		]), p.x, p.y, r, r, +(Math.abs(s) > 180), +(a <= c), f.x, f.y);
	} else d += rr(Fm ||= Vm([
		"L ",
		",",
		" Z"
	]), t, n);
	return d;
}, Gm = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.cornerRadius, o = e.forceCornerRadius, s = e.cornerIsExternal, c = e.startAngle, l = e.endAngle, u = ir(l - c), d = Um({
		cx: t,
		cy: n,
		radius: i,
		angle: c,
		sign: u,
		cornerRadius: a,
		cornerIsExternal: s
	}), f = d.circleTangency, p = d.lineTangency, m = d.theta, h = Um({
		cx: t,
		cy: n,
		radius: i,
		angle: l,
		sign: -u,
		cornerRadius: a,
		cornerIsExternal: s
	}), g = h.circleTangency, _ = h.lineTangency, v = h.theta, y = s ? Math.abs(c - l) : Math.abs(c - l) - m - v;
	if (y < 0) return o ? rr(Im ||= Vm([
		"M ",
		",",
		"\n        a",
		",",
		",0,0,1,",
		",0\n        a",
		",",
		",0,0,1,",
		",0\n      "
	]), p.x, p.y, a, a, a * 2, a, a, -a * 2) : Wm({
		cx: t,
		cy: n,
		innerRadius: r,
		outerRadius: i,
		startAngle: c,
		endAngle: l
	});
	var b = rr(Lm ||= Vm([
		"M ",
		",",
		"\n    A",
		",",
		",0,0,",
		",",
		",",
		"\n    A",
		",",
		",0,",
		",",
		",",
		",",
		"\n    A",
		",",
		",0,0,",
		",",
		",",
		"\n  "
	]), p.x, p.y, a, a, +(u < 0), f.x, f.y, i, i, +(y > 180), +(u < 0), g.x, g.y, a, a, +(u < 0), _.x, _.y);
	if (r > 0) {
		var x = Um({
			cx: t,
			cy: n,
			radius: r,
			angle: c,
			sign: u,
			isExternal: !0,
			cornerRadius: a,
			cornerIsExternal: s
		}), S = x.circleTangency, C = x.lineTangency, w = x.theta, T = Um({
			cx: t,
			cy: n,
			radius: r,
			angle: l,
			sign: -u,
			isExternal: !0,
			cornerRadius: a,
			cornerIsExternal: s
		}), E = T.circleTangency, D = T.lineTangency, O = T.theta, k = s ? Math.abs(c - l) : Math.abs(c - l) - w - O;
		if (k < 0 && a === 0) return `${b}L${t},${n}Z`;
		b += rr(Rm ||= Vm([
			"L",
			",",
			"\n      A",
			",",
			",0,0,",
			",",
			",",
			"\n      A",
			",",
			",0,",
			",",
			",",
			",",
			"\n      A",
			",",
			",0,0,",
			",",
			",",
			"Z"
		]), D.x, D.y, a, a, +(u < 0), E.x, E.y, r, r, +(k > 180), +(u > 0), S.x, S.y, a, a, +(u < 0), C.x, C.y);
	} else b += rr(zm ||= Vm([
		"L",
		",",
		"Z"
	]), t, n);
	return b;
}, Km = {
	cx: 0,
	cy: 0,
	innerRadius: 0,
	outerRadius: 0,
	startAngle: 0,
	endAngle: 0,
	cornerRadius: 0,
	forceCornerRadius: !1,
	cornerIsExternal: !1
}, qm = (e) => {
	var t = Ii(e, Km), n = t.cx, r = t.cy, i = t.innerRadius, a = t.outerRadius, o = t.cornerRadius, s = t.forceCornerRadius, c = t.cornerIsExternal, l = t.startAngle, u = t.endAngle, d = t.className;
	if (a < i || l === u) return null;
	var f = Tn("recharts-sector", d), p = a - i, m = ur(o, p, 0, !0), h = m > 0 && Math.abs(l - u) < 360 ? Gm({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		cornerRadius: Math.min(m, p / 2),
		forceCornerRadius: s,
		cornerIsExternal: c,
		startAngle: l,
		endAngle: u
	}) : Wm({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		startAngle: l,
		endAngle: u
	});
	return /*#__PURE__*/ y.createElement("path", Bm({}, Nn(t), {
		className: f,
		d: h
	}));
};
//#endregion
//#region node_modules/recharts/es6/util/cursor/getCursorPoints.js
function Jm(e, t, n) {
	if (e === "horizontal") return [{
		x: t.x,
		y: n.top
	}, {
		x: t.x,
		y: n.top + n.height
	}];
	if (e === "vertical") return [{
		x: n.left,
		y: t.y
	}, {
		x: n.left + n.width,
		y: t.y
	}];
	if (Di(t)) {
		if (e === "centric") {
			var r = t.cx, i = t.cy, a = t.innerRadius, o = t.outerRadius, s = t.angle, c = Tm(r, i, a, s), l = Tm(r, i, o, s);
			return [{
				x: c.x,
				y: c.y
			}, {
				x: l.x,
				y: l.y
			}];
		}
		return Mm(t);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toNumber.mjs
function Ym(e) {
	return Yn(e) ? NaN : Number(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toFinite.mjs
function Xm(e) {
	return e ? (e = Ym(e), e === Infinity || e === -Infinity ? (e < 0 ? -1 : 1) * Number.MAX_VALUE : e === e ? e : 0) : e === 0 ? e : 0;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/math/range.mjs
function Zm(e, t, n) {
	n && typeof n != "number" && vo(e, t, n) && (t = n = void 0), e = Xm(e), t === void 0 ? (t = e, e = 0) : t = Xm(t), n = n === void 0 ? e < t ? 1 : -1 : Xm(n);
	let r = Math.max(Math.ceil((t - e) / (n || 1)), 0), i = Array(r);
	for (let t = 0; t < r; t++) i[t] = e, e += n;
	return i;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/dataSelectors.js
var Qm = (e) => e.chartData, $m = H([Qm], (e) => {
	var t = e.chartData == null ? 0 : e.chartData.length - 1;
	return {
		chartData: e.chartData,
		computedData: e.computedData,
		dataEndIndex: t,
		dataStartIndex: 0
	};
}), eh = (e, t, n, r) => r ? $m(e) : Qm(e), th = H([eh], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
H([$m], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
var nh = H([Qm], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
//#endregion
//#region node_modules/recharts/es6/util/isDomainSpecifiedByUser.js
function rh(e, t) {
	return ch(e) || sh(e, t) || ah(e, t) || ih();
}
function ih() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ah(e, t) {
	if (e) {
		if (typeof e == "string") return oh(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oh(e, t) : void 0;
	}
}
function oh(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function sh(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ch(e) {
	if (Array.isArray(e)) return e;
}
function lh(e) {
	if (Array.isArray(e) && e.length === 2) {
		var t = rh(e, 2), n = t[0], r = t[1];
		if (K(n) && K(r)) return !0;
	}
	return !1;
}
function uh(e, t, n) {
	return n ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
}
function dh(e, t) {
	if (t && typeof e != "function" && Array.isArray(e) && e.length === 2) {
		var n = rh(e, 2), r = n[0], i = n[1], a, o;
		if (K(r)) a = r;
		else if (typeof r == "function") return;
		if (K(i)) o = i;
		else if (typeof i == "function") return;
		var s = [a, o];
		if (lh(s)) return s;
	}
}
function fh(e, t, n) {
	if (n || t != null) {
		if (typeof e == "function" && t != null) try {
			var r = e(t, n);
			if (lh(r)) return uh(r, t, n);
		} catch {}
		if (Array.isArray(e) && e.length === 2) {
			var i = rh(e, 2), a = i[0], o = i[1], s, c;
			if (a === "auto") t != null && (s = Math.min(...t));
			else if (z(a)) s = a;
			else if (typeof a == "function") try {
				t != null && (s = a(t?.[0]));
			} catch {}
			else if (typeof a == "string" && eu.test(a)) {
				var l = eu.exec(a);
				if (l == null || l[1] == null || t == null) s = void 0;
				else {
					var u = +l[1];
					s = t[0] - u;
				}
			} else s = t?.[0];
			if (o === "auto") t != null && (c = Math.max(...t));
			else if (z(o)) c = o;
			else if (typeof o == "function") try {
				t != null && (c = o(t?.[1]));
			} catch {}
			else if (typeof o == "string" && tu.test(o)) {
				var d = tu.exec(o);
				if (d == null || d[1] == null || t == null) c = void 0;
				else {
					var f = +d[1];
					c = t[1] + f;
				}
			} else c = t?.[1];
			var p = [s, c];
			if (lh(p)) return t == null ? p : uh(p, t, n);
		}
	}
}
//#endregion
//#region node_modules/recharts/es6/util/scale/util/arithmetic.js
var Q = /* @__PURE__ */ u((/* @__PURE__ */ s(((e, t) => {
	(function(e) {
		var n = 1e9, r = {
			precision: 20,
			rounding: 4,
			toExpNeg: -7,
			toExpPos: 21,
			LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"
		}, i = !0, a = "[DecimalError] ", o = a + "Invalid argument: ", s = a + "Exponent out of range: ", c = Math.floor, l = Math.pow, u = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, d, f = 1e7, p = 7, m = 9007199254740991, h = c(m / p), g = {};
		g.absoluteValue = g.abs = function() {
			var e = new this.constructor(this);
			return e.s &&= 1, e;
		}, g.comparedTo = g.cmp = function(e) {
			var t, n, r, i, a = this;
			if (e = new a.constructor(e), a.s !== e.s) return a.s || -e.s;
			if (a.e !== e.e) return a.e > e.e ^ a.s < 0 ? 1 : -1;
			for (r = a.d.length, i = e.d.length, t = 0, n = r < i ? r : i; t < n; ++t) if (a.d[t] !== e.d[t]) return a.d[t] > e.d[t] ^ a.s < 0 ? 1 : -1;
			return r === i ? 0 : r > i ^ a.s < 0 ? 1 : -1;
		}, g.decimalPlaces = g.dp = function() {
			var e = this, t = e.d.length - 1, n = (t - e.e) * p;
			if (t = e.d[t], t) for (; t % 10 == 0; t /= 10) n--;
			return n < 0 ? 0 : n;
		}, g.dividedBy = g.div = function(e) {
			return b(this, new this.constructor(e));
		}, g.dividedToIntegerBy = g.idiv = function(e) {
			var t = this, n = t.constructor;
			return D(b(t, new n(e), 0, 1), n.precision);
		}, g.equals = g.eq = function(e) {
			return !this.cmp(e);
		}, g.exponent = function() {
			return S(this);
		}, g.greaterThan = g.gt = function(e) {
			return this.cmp(e) > 0;
		}, g.greaterThanOrEqualTo = g.gte = function(e) {
			return this.cmp(e) >= 0;
		}, g.isInteger = g.isint = function() {
			return this.e > this.d.length - 2;
		}, g.isNegative = g.isneg = function() {
			return this.s < 0;
		}, g.isPositive = g.ispos = function() {
			return this.s > 0;
		}, g.isZero = function() {
			return this.s === 0;
		}, g.lessThan = g.lt = function(e) {
			return this.cmp(e) < 0;
		}, g.lessThanOrEqualTo = g.lte = function(e) {
			return this.cmp(e) < 1;
		}, g.logarithm = g.log = function(e) {
			var t, n = this, r = n.constructor, o = r.precision, s = o + 5;
			if (e === void 0) e = new r(10);
			else if (e = new r(e), e.s < 1 || e.eq(d)) throw Error(a + "NaN");
			if (n.s < 1) throw Error(a + (n.s ? "NaN" : "-Infinity"));
			return n.eq(d) ? new r(0) : (i = !1, t = b(T(n, s), T(e, s), s), i = !0, D(t, o));
		}, g.minus = g.sub = function(e) {
			var t = this;
			return e = new t.constructor(e), t.s == e.s ? O(t, e) : _(t, (e.s = -e.s, e));
		}, g.modulo = g.mod = function(e) {
			var t, n = this, r = n.constructor, o = r.precision;
			if (e = new r(e), !e.s) throw Error(a + "NaN");
			return n.s ? (i = !1, t = b(n, e, 0, 1).times(e), i = !0, n.minus(t)) : D(new r(n), o);
		}, g.naturalExponential = g.exp = function() {
			return x(this);
		}, g.naturalLogarithm = g.ln = function() {
			return T(this);
		}, g.negated = g.neg = function() {
			var e = new this.constructor(this);
			return e.s = -e.s || 0, e;
		}, g.plus = g.add = function(e) {
			var t = this;
			return e = new t.constructor(e), t.s == e.s ? _(t, e) : O(t, (e.s = -e.s, e));
		}, g.precision = g.sd = function(e) {
			var t, n, r, i = this;
			if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(o + e);
			if (t = S(i) + 1, r = i.d.length - 1, n = r * p + 1, r = i.d[r], r) {
				for (; r % 10 == 0; r /= 10) n--;
				for (r = i.d[0]; r >= 10; r /= 10) n++;
			}
			return e && t > n ? t : n;
		}, g.squareRoot = g.sqrt = function() {
			var e, t, n, r, o, s, l, u = this, d = u.constructor;
			if (u.s < 1) {
				if (!u.s) return new d(0);
				throw Error(a + "NaN");
			}
			for (e = S(u), i = !1, o = Math.sqrt(+u), o == 0 || o == 1 / 0 ? (t = y(u.d), (t.length + e) % 2 == 0 && (t += "0"), o = Math.sqrt(t), e = c((e + 1) / 2) - (e < 0 || e % 2), o == 1 / 0 ? t = "5e" + e : (t = o.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + e), r = new d(t)) : r = new d(o.toString()), n = d.precision, o = l = n + 3;;) if (s = r, r = s.plus(b(u, s, l + 2)).times(.5), y(s.d).slice(0, l) === (t = y(r.d)).slice(0, l)) {
				if (t = t.slice(l - 3, l + 1), o == l && t == "4999") {
					if (D(s, n + 1, 0), s.times(s).eq(u)) {
						r = s;
						break;
					}
				} else if (t != "9999") break;
				l += 4;
			}
			return i = !0, D(r, n);
		}, g.times = g.mul = function(e) {
			var t, n, r, a, o, s, c, l, u, d = this, p = d.constructor, m = d.d, h = (e = new p(e)).d;
			if (!d.s || !e.s) return new p(0);
			for (e.s *= d.s, n = d.e + e.e, l = m.length, u = h.length, l < u && (o = m, m = h, h = o, s = l, l = u, u = s), o = [], s = l + u, r = s; r--;) o.push(0);
			for (r = u; --r >= 0;) {
				for (t = 0, a = l + r; a > r;) c = o[a] + h[r] * m[a - r - 1] + t, o[a--] = c % f | 0, t = c / f | 0;
				o[a] = (o[a] + t) % f | 0;
			}
			for (; !o[--s];) o.pop();
			return t ? ++n : o.shift(), e.d = o, e.e = n, i ? D(e, p.precision) : e;
		}, g.toDecimalPlaces = g.todp = function(e, t) {
			var r = this, i = r.constructor;
			return r = new i(r), e === void 0 ? r : (v(e, 0, n), t === void 0 ? t = i.rounding : v(t, 0, 8), D(r, e + S(r) + 1, t));
		}, g.toExponential = function(e, t) {
			var r, i = this, a = i.constructor;
			return e === void 0 ? r = k(i, !0) : (v(e, 0, n), t === void 0 ? t = a.rounding : v(t, 0, 8), i = D(new a(i), e + 1, t), r = k(i, !0, e + 1)), r;
		}, g.toFixed = function(e, t) {
			var r, i, a = this, o = a.constructor;
			return e === void 0 ? k(a) : (v(e, 0, n), t === void 0 ? t = o.rounding : v(t, 0, 8), i = D(new o(a), e + S(a) + 1, t), r = k(i.abs(), !1, e + S(i) + 1), a.isneg() && !a.isZero() ? "-" + r : r);
		}, g.toInteger = g.toint = function() {
			var e = this, t = e.constructor;
			return D(new t(e), S(e) + 1, t.rounding);
		}, g.toNumber = function() {
			return +this;
		}, g.toPower = g.pow = function(e) {
			var t, n, r, o, s, l, u = this, f = u.constructor, h = 12, g = +(e = new f(e));
			if (!e.s) return new f(d);
			if (u = new f(u), !u.s) {
				if (e.s < 1) throw Error(a + "Infinity");
				return u;
			}
			if (u.eq(d)) return u;
			if (r = f.precision, e.eq(d)) return D(u, r);
			if (t = e.e, n = e.d.length - 1, l = t >= n, s = u.s, !l) {
				if (s < 0) throw Error(a + "NaN");
			} else if ((n = g < 0 ? -g : g) <= m) {
				for (o = new f(d), t = Math.ceil(r / p + 4), i = !1; n % 2 && (o = o.times(u), A(o.d, t)), n = c(n / 2), n !== 0;) u = u.times(u), A(u.d, t);
				return i = !0, e.s < 0 ? new f(d).div(o) : D(o, r);
			}
			return s = s < 0 && e.d[Math.max(t, n)] & 1 ? -1 : 1, u.s = 1, i = !1, o = e.times(T(u, r + h)), i = !0, o = x(o), o.s = s, o;
		}, g.toPrecision = function(e, t) {
			var r, i, a = this, o = a.constructor;
			return e === void 0 ? (r = S(a), i = k(a, r <= o.toExpNeg || r >= o.toExpPos)) : (v(e, 1, n), t === void 0 ? t = o.rounding : v(t, 0, 8), a = D(new o(a), e, t), r = S(a), i = k(a, e <= r || r <= o.toExpNeg, e)), i;
		}, g.toSignificantDigits = g.tosd = function(e, t) {
			var r = this, i = r.constructor;
			return e === void 0 ? (e = i.precision, t = i.rounding) : (v(e, 1, n), t === void 0 ? t = i.rounding : v(t, 0, 8)), D(new i(r), e, t);
		}, g.toString = g.valueOf = g.val = g.toJSON = function() {
			var e = this, t = S(e), n = e.constructor;
			return k(e, t <= n.toExpNeg || t >= n.toExpPos);
		};
		function _(e, t) {
			var n, r, a, o, s, c, l, u, d = e.constructor, m = d.precision;
			if (!e.s || !t.s) return t.s || (t = new d(e)), i ? D(t, m) : t;
			if (l = e.d, u = t.d, s = e.e, a = t.e, l = l.slice(), o = s - a, o) {
				for (o < 0 ? (r = l, o = -o, c = u.length) : (r = u, a = s, c = l.length), s = Math.ceil(m / p), c = s > c ? s + 1 : c + 1, o > c && (o = c, r.length = 1), r.reverse(); o--;) r.push(0);
				r.reverse();
			}
			for (c = l.length, o = u.length, c - o < 0 && (o = c, r = u, u = l, l = r), n = 0; o;) n = (l[--o] = l[o] + u[o] + n) / f | 0, l[o] %= f;
			for (n && (l.unshift(n), ++a), c = l.length; l[--c] == 0;) l.pop();
			return t.d = l, t.e = a, i ? D(t, m) : t;
		}
		function v(e, t, n) {
			if (e !== ~~e || e < t || e > n) throw Error(o + e);
		}
		function y(e) {
			var t, n, r, i = e.length - 1, a = "", o = e[0];
			if (i > 0) {
				for (a += o, t = 1; t < i; t++) r = e[t] + "", n = p - r.length, n && (a += w(n)), a += r;
				o = e[t], r = o + "", n = p - r.length, n && (a += w(n));
			} else if (o === 0) return "0";
			for (; o % 10 == 0;) o /= 10;
			return a + o;
		}
		var b = (function() {
			function e(e, t) {
				var n, r = 0, i = e.length;
				for (e = e.slice(); i--;) n = e[i] * t + r, e[i] = n % f | 0, r = n / f | 0;
				return r && e.unshift(r), e;
			}
			function t(e, t, n, r) {
				var i, a;
				if (n != r) a = n > r ? 1 : -1;
				else for (i = a = 0; i < n; i++) if (e[i] != t[i]) {
					a = e[i] > t[i] ? 1 : -1;
					break;
				}
				return a;
			}
			function n(e, t, n) {
				for (var r = 0; n--;) e[n] -= r, r = +(e[n] < t[n]), e[n] = r * f + e[n] - t[n];
				for (; !e[0] && e.length > 1;) e.shift();
			}
			return function(r, i, o, s) {
				var c, l, u, d, m, h, g, _, v, y, b, x, C, w, T, E, O, k, A = r.constructor, j = r.s == i.s ? 1 : -1, M = r.d, N = i.d;
				if (!r.s) return new A(r);
				if (!i.s) throw Error(a + "Division by zero");
				for (l = r.e - i.e, O = N.length, T = M.length, g = new A(j), _ = g.d = [], u = 0; N[u] == (M[u] || 0);) ++u;
				if (N[u] > (M[u] || 0) && --l, x = o == null ? o = A.precision : s ? o + (S(r) - S(i)) + 1 : o, x < 0) return new A(0);
				if (x = x / p + 2 | 0, u = 0, O == 1) for (d = 0, N = N[0], x++; (u < T || d) && x--; u++) C = d * f + (M[u] || 0), _[u] = C / N | 0, d = C % N | 0;
				else {
					for (d = f / (N[0] + 1) | 0, d > 1 && (N = e(N, d), M = e(M, d), O = N.length, T = M.length), w = O, v = M.slice(0, O), y = v.length; y < O;) v[y++] = 0;
					k = N.slice(), k.unshift(0), E = N[0], N[1] >= f / 2 && ++E;
					do
						d = 0, c = t(N, v, O, y), c < 0 ? (b = v[0], O != y && (b = b * f + (v[1] || 0)), d = b / E | 0, d > 1 ? (d >= f && (d = f - 1), m = e(N, d), h = m.length, y = v.length, c = t(m, v, h, y), c == 1 && (d--, n(m, O < h ? k : N, h))) : (d == 0 && (c = d = 1), m = N.slice()), h = m.length, h < y && m.unshift(0), n(v, m, y), c == -1 && (y = v.length, c = t(N, v, O, y), c < 1 && (d++, n(v, O < y ? k : N, y))), y = v.length) : c === 0 && (d++, v = [0]), _[u++] = d, c && v[0] ? v[y++] = M[w] || 0 : (v = [M[w]], y = 1);
					while ((w++ < T || v[0] !== void 0) && x--);
				}
				return _[0] || _.shift(), g.e = l, D(g, s ? o + S(g) + 1 : o);
			};
		})();
		function x(e, t) {
			var n, r, a, o, c, u, f = 0, p = 0, m = e.constructor, h = m.precision;
			if (S(e) > 16) throw Error(s + S(e));
			if (!e.s) return new m(d);
			for (t == null ? (i = !1, u = h) : u = t, c = new m(.03125); e.abs().gte(.1);) e = e.times(c), p += 5;
			for (r = Math.log(l(2, p)) / Math.LN10 * 2 + 5 | 0, u += r, n = a = o = new m(d), m.precision = u;;) {
				if (a = D(a.times(e), u), n = n.times(++f), c = o.plus(b(a, n, u)), y(c.d).slice(0, u) === y(o.d).slice(0, u)) {
					for (; p--;) o = D(o.times(o), u);
					return m.precision = h, t == null ? (i = !0, D(o, h)) : o;
				}
				o = c;
			}
		}
		function S(e) {
			for (var t = e.e * p, n = e.d[0]; n >= 10; n /= 10) t++;
			return t;
		}
		function C(e, t, n) {
			if (t > e.LN10.sd()) throw i = !0, n && (e.precision = n), Error(a + "LN10 precision limit exceeded");
			return D(new e(e.LN10), t);
		}
		function w(e) {
			for (var t = ""; e--;) t += "0";
			return t;
		}
		function T(e, t) {
			var n, r, o, s, c, l, u, f, p, m = 1, h = 10, g = e, _ = g.d, v = g.constructor, x = v.precision;
			if (g.s < 1) throw Error(a + (g.s ? "NaN" : "-Infinity"));
			if (g.eq(d)) return new v(0);
			if (t == null ? (i = !1, f = x) : f = t, g.eq(10)) return t ?? (i = !0), C(v, f);
			if (f += h, v.precision = f, n = y(_), r = n.charAt(0), s = S(g), Math.abs(s) < 0x5543df729c000) {
				for (; r < 7 && r != 1 || r == 1 && n.charAt(1) > 3;) g = g.times(e), n = y(g.d), r = n.charAt(0), m++;
				s = S(g), r > 1 ? (g = new v("0." + n), s++) : g = new v(r + "." + n.slice(1));
			} else return u = C(v, f + 2, x).times(s + ""), g = T(new v(r + "." + n.slice(1)), f - h).plus(u), v.precision = x, t == null ? (i = !0, D(g, x)) : g;
			for (l = c = g = b(g.minus(d), g.plus(d), f), p = D(g.times(g), f), o = 3;;) {
				if (c = D(c.times(p), f), u = l.plus(b(c, new v(o), f)), y(u.d).slice(0, f) === y(l.d).slice(0, f)) return l = l.times(2), s !== 0 && (l = l.plus(C(v, f + 2, x).times(s + ""))), l = b(l, new v(m), f), v.precision = x, t == null ? (i = !0, D(l, x)) : l;
				l = u, o += 2;
			}
		}
		function E(e, t) {
			var n, r, a;
			for ((n = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (r = t.search(/e/i)) > 0 ? (n < 0 && (n = r), n += +t.slice(r + 1), t = t.substring(0, r)) : n < 0 && (n = t.length), r = 0; t.charCodeAt(r) === 48;) ++r;
			for (a = t.length; t.charCodeAt(a - 1) === 48;) --a;
			if (t = t.slice(r, a), t) {
				if (a -= r, n = n - r - 1, e.e = c(n / p), e.d = [], r = (n + 1) % p, n < 0 && (r += p), r < a) {
					for (r && e.d.push(+t.slice(0, r)), a -= p; r < a;) e.d.push(+t.slice(r, r += p));
					t = t.slice(r), r = p - t.length;
				} else r -= a;
				for (; r--;) t += "0";
				if (e.d.push(+t), i && (e.e > h || e.e < -h)) throw Error(s + n);
			} else e.s = 0, e.e = 0, e.d = [0];
			return e;
		}
		function D(e, t, n) {
			var r, a, o, u, d, m, g, _, v = e.d;
			for (u = 1, o = v[0]; o >= 10; o /= 10) u++;
			if (r = t - u, r < 0) r += p, a = t, g = v[_ = 0];
			else {
				if (_ = Math.ceil((r + 1) / p), o = v.length, _ >= o) return e;
				for (g = o = v[_], u = 1; o >= 10; o /= 10) u++;
				r %= p, a = r - p + u;
			}
			if (n !== void 0 && (o = l(10, u - a - 1), d = g / o % 10 | 0, m = t < 0 || v[_ + 1] !== void 0 || g % o, m = n < 4 ? (d || m) && (n == 0 || n == (e.s < 0 ? 3 : 2)) : d > 5 || d == 5 && (n == 4 || m || n == 6 && (r > 0 ? a > 0 ? g / l(10, u - a) : 0 : v[_ - 1]) % 10 & 1 || n == (e.s < 0 ? 8 : 7))), t < 1 || !v[0]) return m ? (o = S(e), v.length = 1, t = t - o - 1, v[0] = l(10, (p - t % p) % p), e.e = c(-t / p) || 0) : (v.length = 1, v[0] = e.e = e.s = 0), e;
			if (r == 0 ? (v.length = _, o = 1, _--) : (v.length = _ + 1, o = l(10, p - r), v[_] = a > 0 ? (g / l(10, u - a) % l(10, a) | 0) * o : 0), m) for (;;) if (_ == 0) {
				(v[0] += o) == f && (v[0] = 1, ++e.e);
				break;
			} else {
				if (v[_] += o, v[_] != f) break;
				v[_--] = 0, o = 1;
			}
			for (r = v.length; v[--r] === 0;) v.pop();
			if (i && (e.e > h || e.e < -h)) throw Error(s + S(e));
			return e;
		}
		function O(e, t) {
			var n, r, a, o, s, c, l, u, d, m, h = e.constructor, g = h.precision;
			if (!e.s || !t.s) return t.s ? t.s = -t.s : t = new h(e), i ? D(t, g) : t;
			if (l = e.d, m = t.d, r = t.e, u = e.e, l = l.slice(), s = u - r, s) {
				for (d = s < 0, d ? (n = l, s = -s, c = m.length) : (n = m, r = u, c = l.length), a = Math.max(Math.ceil(g / p), c) + 2, s > a && (s = a, n.length = 1), n.reverse(), a = s; a--;) n.push(0);
				n.reverse();
			} else {
				for (a = l.length, c = m.length, d = a < c, d && (c = a), a = 0; a < c; a++) if (l[a] != m[a]) {
					d = l[a] < m[a];
					break;
				}
				s = 0;
			}
			for (d && (n = l, l = m, m = n, t.s = -t.s), c = l.length, a = m.length - c; a > 0; --a) l[c++] = 0;
			for (a = m.length; a > s;) {
				if (l[--a] < m[a]) {
					for (o = a; o && l[--o] === 0;) l[o] = f - 1;
					--l[o], l[a] += f;
				}
				l[a] -= m[a];
			}
			for (; l[--c] === 0;) l.pop();
			for (; l[0] === 0; l.shift()) --r;
			return l[0] ? (t.d = l, t.e = r, i ? D(t, g) : t) : new h(0);
		}
		function k(e, t, n) {
			var r, i = S(e), a = y(e.d), o = a.length;
			return t ? (n && (r = n - o) > 0 ? a = a.charAt(0) + "." + a.slice(1) + w(r) : o > 1 && (a = a.charAt(0) + "." + a.slice(1)), a = a + (i < 0 ? "e" : "e+") + i) : i < 0 ? (a = "0." + w(-i - 1) + a, n && (r = n - o) > 0 && (a += w(r))) : i >= o ? (a += w(i + 1 - o), n && (r = n - i - 1) > 0 && (a = a + "." + w(r))) : ((r = i + 1) < o && (a = a.slice(0, r) + "." + a.slice(r)), n && (r = n - o) > 0 && (i + 1 === o && (a += "."), a += w(r))), e.s < 0 ? "-" + a : a;
		}
		function A(e, t) {
			if (e.length > t) return e.length = t, !0;
		}
		function j(e) {
			var t, n, r;
			function i(e) {
				var t = this;
				if (!(t instanceof i)) return new i(e);
				if (t.constructor = i, e instanceof i) t.s = e.s, t.e = e.e, t.d = (e = e.d) ? e.slice() : e;
				else {
					if (typeof e == "number") {
						if (e * 0 != 0) throw Error(o + e);
						if (e > 0) t.s = 1;
						else if (e < 0) e = -e, t.s = -1;
						else {
							t.s = 0, t.e = 0, t.d = [0];
							return;
						}
						if (e === ~~e && e < 1e7) {
							t.e = 0, t.d = [e];
							return;
						}
						return E(t, e.toString());
					}
					if (typeof e != "string") throw Error(o + e);
					if (e.charCodeAt(0) === 45 ? (e = e.slice(1), t.s = -1) : t.s = 1, u.test(e)) E(t, e);
					else throw Error(o + e);
				}
			}
			if (i.prototype = g, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.clone = j, i.config = i.set = M, e === void 0 && (e = {}), e) for (r = [
				"precision",
				"rounding",
				"toExpNeg",
				"toExpPos",
				"LN10"
			], t = 0; t < r.length;) e.hasOwnProperty(n = r[t++]) || (e[n] = this[n]);
			return i.config(e), i;
		}
		function M(e) {
			if (!e || typeof e != "object") throw Error(a + "Object expected");
			var t, r, i, s = [
				"precision",
				1,
				n,
				"rounding",
				0,
				8,
				"toExpNeg",
				-1 / 0,
				0,
				"toExpPos",
				0,
				1 / 0
			];
			for (t = 0; t < s.length; t += 3) if ((i = e[r = s[t]]) !== void 0) {
				if (c(i) === i && i >= s[t + 1] && i <= s[t + 2]) this[r] = i;
				else throw Error(o + r + ": " + i);
			}
			if ((i = e[r = "LN10"]) !== void 0) {
				if (i == Math.LN10) this[r] = new this(i);
				else throw Error(o + r + ": " + i);
			}
			return this;
		}
		r = j(r), r.default = r.Decimal = r, d = new r(1), typeof define == "function" && define.amd ? define(function() {
			return r;
		}) : t !== void 0 && t.exports ? t.exports = r : (e ||= typeof self < "u" && self && self.self == self ? self : Function("return this")(), e.Decimal = r);
	})(e);
})))());
function ph(e) {
	return e === 0 ? 1 : Math.floor(new Q.default(e).abs().log(10).toNumber()) + 1;
}
function mh(e, t, n) {
	for (var r = new Q.default(e), i = 0, a = []; r.lt(t) && i < 1e5;) a.push(r.toNumber()), r = r.add(n), i++;
	return a;
}
//#endregion
//#region node_modules/recharts/es6/util/scale/getNiceTickValues.js
function hh(e, t) {
	return bh(e) || yh(e, t) || _h(e, t) || gh();
}
function gh() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _h(e, t) {
	if (e) {
		if (typeof e == "string") return vh(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? vh(e, t) : void 0;
	}
}
function vh(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function yh(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function bh(e) {
	if (Array.isArray(e)) return e;
}
var xh = (e) => {
	var t = hh(e, 2), n = t[0], r = t[1], i = n, a = r;
	return n > r && (i = r, a = n), [i, a];
}, Sh = (e, t, n) => {
	if (e.lte(0)) return new Q.default(0);
	var r = ph(e.toNumber()), i = new Q.default(10).pow(r), a = e.div(i), o = r === 1 ? .1 : .05, s = new Q.default(Math.ceil(a.div(o).toNumber())).add(n).mul(o).mul(i);
	return t ? new Q.default(s.toNumber()) : new Q.default(Math.ceil(s.toNumber()));
}, Ch = (e, t, n) => {
	if (e.lte(0)) return new Q.default(0);
	var r = [
		1,
		2,
		2.5,
		5
	], i = e.toNumber(), a = Math.floor(new Q.default(i).abs().log(10).toNumber()), o = new Q.default(10).pow(a), s = e.div(o).toNumber(), c = r.findIndex((e) => e >= s - 1e-10);
	if (c === -1 && (o = o.mul(10), c = 0), c += n, c >= r.length) {
		var l = Math.floor(c / r.length);
		c %= r.length, o = o.mul(new Q.default(10).pow(l));
	}
	var u = r[c] ?? 1, d = new Q.default(u).mul(o);
	return t ? d : new Q.default(Math.ceil(d.toNumber()));
}, wh = (e, t, n) => {
	var r = new Q.default(1), i = new Q.default(e);
	if (!i.isint() && n) {
		var a = Math.abs(e);
		a < 1 ? (r = new Q.default(10).pow(ph(e) - 1), i = new Q.default(Math.floor(i.div(r).toNumber())).mul(r)) : a > 1 && (i = new Q.default(Math.floor(e)));
	} else e === 0 ? i = new Q.default(Math.floor((t - 1) / 2)) : n || (i = new Q.default(Math.floor(e)));
	for (var o = Math.floor((t - 1) / 2), s = [], c = 0; c < t; c++) s.push(i.add(new Q.default(c - o).mul(r)).toNumber());
	return s;
}, Th = function(e, t, n, r) {
	var i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0, a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : Sh;
	if (!Number.isFinite((t - e) / (n - 1))) return {
		step: new Q.default(0),
		tickMin: new Q.default(0),
		tickMax: new Q.default(0)
	};
	var o = a(new Q.default(t).sub(e).div(n - 1), r, i), s;
	e <= 0 && t >= 0 ? s = new Q.default(0) : (s = new Q.default(e).add(t).div(2), s = s.sub(new Q.default(s).mod(o)));
	var c = Math.ceil(s.sub(e).div(o).toNumber()), l = Math.ceil(new Q.default(t).sub(s).div(o).toNumber()), u = c + l + 1;
	return u > n ? Th(e, t, n, r, i + 1, a) : (u < n && (l = t > 0 ? l + (n - u) : l, c = t > 0 ? c : c + (n - u)), {
		step: o,
		tickMin: s.sub(new Q.default(c).mul(o)),
		tickMax: s.add(new Q.default(l).mul(o))
	});
}, Eh = function(e) {
	var t = hh(e, 2), n = t[0], r = t[1], i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = Math.max(i, 2), c = hh(xh([n, r]), 2), l = c[0], u = c[1];
	if (l === -Infinity || u === Infinity) {
		var d = u === Infinity ? [l, ...Array(i - 1).fill(Infinity)] : [...Array(i - 1).fill(-Infinity), u];
		return n > r ? d.reverse() : d;
	}
	if (l === u) return wh(l, i, a);
	var f = Th(l, u, s, a, 0, o === "snap125" ? Ch : Sh), p = f.step, m = f.tickMin, h = f.tickMax, g = mh(m, h.add(new Q.default(.1).mul(p)), p);
	return n > r ? g.reverse() : g;
}, Dh = function(e, t) {
	var n = hh(e, 2), r = n[0], i = n[1], a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = hh(xh([r, i]), 2), c = s[0], l = s[1];
	if (c === -Infinity || l === Infinity) return [r, i];
	if (c === l) return [c];
	var u = o === "snap125" ? Ch : Sh, d = Math.max(t, 2), f = u(new Q.default(l).sub(c).div(d - 1), a, 0), p = [...mh(new Q.default(c), new Q.default(l), f), l];
	if (a === !1) {
		p = p.map((e) => Math.round(e));
		var m = p.length - 1;
		m > 0 && p[m] === p[m - 1] && (p = p.slice(0, m));
	}
	return r > i ? p.reverse() : p;
}, Oh = (e) => e.rootProps.barCategoryGap, kh = (e) => e.rootProps.stackOffset, Ah = (e) => e.rootProps.reverseStackOrder, jh = (e) => e.options.chartName, Mh = (e) => e.rootProps.syncId, Nh = (e) => e.rootProps.syncMethod, Ph = (e) => e.options.eventEmitter, Fh = {
	grid: -100,
	barBackground: -50,
	area: 100,
	cursorRectangle: 200,
	bar: 300,
	line: 400,
	axis: 500,
	scatter: 600,
	activeBar: 1e3,
	cursorLine: 1100,
	activeDot: 1200,
	label: 2e3
}, Ih = {
	allowDecimals: !1,
	allowDuplicatedCategory: !0,
	allowDataOverflow: !1,
	angle: 0,
	angleAxisId: 0,
	axisLine: !0,
	axisLineType: "polygon",
	cx: 0,
	cy: 0,
	hide: !1,
	includeHidden: !1,
	label: !1,
	niceTicks: "auto",
	orientation: "outer",
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickLine: !0,
	tickSize: 8,
	type: "auto",
	zIndex: Fh.axis
}, Lh = {
	allowDataOverflow: !1,
	allowDecimals: !1,
	allowDuplicatedCategory: !0,
	angle: 0,
	axisLine: !0,
	includeHidden: !1,
	hide: !1,
	niceTicks: "auto",
	label: !1,
	orientation: "right",
	radiusAxisId: 0,
	reversed: !1,
	scale: "auto",
	stroke: "#ccc",
	tick: !0,
	tickCount: 5,
	tickLine: !0,
	type: "auto",
	zIndex: Fh.axis
}, Rh = (e, t) => {
	if (e && t) return e != null && e.reversed ? [t[1], t[0]] : t;
};
//#endregion
//#region node_modules/recharts/es6/util/getAxisTypeBasedOnLayout.js
function zh(e, t, n) {
	if (n !== "auto") return n;
	if (e != null) return Gl(e, t) ? "category" : "number";
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
function Bh(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Vh(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Bh(Object(n), !0).forEach(function(t) {
			Hh(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Bh(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Hh(e, t, n) {
	return (t = Uh(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Uh(e) {
	var t = Wh(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Wh(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Gh = {
	allowDataOverflow: Ih.allowDataOverflow,
	allowDecimals: Ih.allowDecimals,
	allowDuplicatedCategory: !1,
	dataKey: void 0,
	domain: void 0,
	id: Ih.angleAxisId,
	includeHidden: !1,
	name: void 0,
	reversed: Ih.reversed,
	scale: Ih.scale,
	tick: Ih.tick,
	tickCount: void 0,
	ticks: void 0,
	type: Ih.type,
	unit: void 0,
	niceTicks: "auto"
}, Kh = {
	allowDataOverflow: Lh.allowDataOverflow,
	allowDecimals: Lh.allowDecimals,
	allowDuplicatedCategory: Lh.allowDuplicatedCategory,
	dataKey: void 0,
	domain: void 0,
	id: Lh.radiusAxisId,
	includeHidden: Lh.includeHidden,
	name: void 0,
	reversed: Lh.reversed,
	scale: Lh.scale,
	tick: Lh.tick,
	tickCount: Lh.tickCount,
	ticks: void 0,
	type: Lh.type,
	unit: void 0,
	niceTicks: "auto"
}, qh = H([(e, t) => {
	if (t != null) return e.polarAxis.angleAxis[t];
}, md], (e, t) => {
	if (e != null) return e;
	var n = zh(t, "angleAxis", Gh.type) ?? "category";
	return Vh(Vh({}, Gh), {}, { type: n });
}), Jh = H([(e, t) => e.polarAxis.radiusAxis[t], md], (e, t) => {
	if (e != null) return e;
	var n = zh(t, "radiusAxis", Kh.type) ?? "category";
	return Vh(Vh({}, Kh), {}, { type: n });
}), Yh = (e) => e.polarOptions, Xh = H([
	ou,
	su,
	Cu
], Em), Zh = H([Yh, Xh], (e, t) => {
	if (e != null) return ur(e.innerRadius, t, 0);
}), Qh = H([Yh, Xh], (e, t) => {
	if (e != null) return ur(e.outerRadius, t, t * .8);
}), $h = H([Yh], (e) => e == null ? [0, 0] : [e.startAngle, e.endAngle]);
H([qh, $h], Rh);
var eg = H([
	Xh,
	Zh,
	Qh
], (e, t, n) => {
	if (e != null && t != null && n != null) return [t, n];
});
H([Jh, eg], Rh);
var tg = H([
	dd,
	Yh,
	Zh,
	Qh,
	ou,
	su
], (e, t, n, r, i, a) => {
	if (!(e !== "centric" && e !== "radial" || t == null || n == null || r == null)) {
		var o = t.cx, s = t.cy, c = t.startAngle, l = t.endAngle;
		return {
			cx: ur(o, i, i / 2),
			cy: ur(s, a, a / 2),
			innerRadius: n,
			outerRadius: r,
			startAngle: c,
			endAngle: l,
			clockWise: !1
		};
	}
}), ng = (e, t) => t, rg = (e, t, n) => n;
//#endregion
//#region node_modules/recharts/es6/util/stacks/getStackSeriesIdentifier.js
function ig(e) {
	return e?.id;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineDisplayedStackedData.js
function ag(e, t, n) {
	var r = t.chartData, i = r === void 0 ? [] : r, a = n.allowDuplicatedCategory, o = n.dataKey, s = /* @__PURE__ */ new Map();
	return e.forEach((e) => {
		var t = e.data ?? i;
		if (t != null && t.length !== 0) {
			var n = ig(e);
			t.forEach((t, r) => {
				var i = o == null || a ? r : String(Ul(t, o, null)), c = Ul(t, e.dataKey, 0), l = s.has(i) ? s.get(i) : {};
				Object.assign(l, { [n]: c }), s.set(i, l);
			});
		}
	}), Array.from(s.values());
}
//#endregion
//#region node_modules/recharts/es6/state/types/StackedGraphicalItem.js
function og(e) {
	return "stackId" in e && e.stackId != null && e.dataKey != null;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/numberDomainEqualityCheck.js
var sg = (e, t) => e === t ? !0 : e == null || t == null ? !1 : e[0] === t[0] && e[1] === t[1];
//#endregion
//#region node_modules/recharts/es6/state/selectors/arrayEqualityCheck.js
function cg(e, t) {
	return Array.isArray(e) && Array.isArray(t) && e.length === 0 && t.length === 0 ? !0 : e === t;
}
function lg(e, t) {
	if (e.length === t.length) {
		for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
		return !0;
	}
	return !1;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/selectTooltipAxisType.js
var ug = (e) => {
	var t = dd(e);
	return t === "horizontal" ? "xAxis" : t === "vertical" ? "yAxis" : t === "centric" ? "angleAxis" : "radiusAxis";
}, dg = (e) => e.tooltip.settings.axisId;
//#endregion
//#region node_modules/recharts/es6/util/scale/RechartsScale.js
function fg(e) {
	if (e != null) {
		var t = e.ticks, n = e.bandwidth, r = e.range(), i = [Math.min(...r), Math.max(...r)];
		return {
			domain: () => e.domain(),
			range: function(e) {
				function t() {
					return e.apply(this, arguments);
				}
				return t.toString = function() {
					return e.toString();
				}, t;
			}(() => i),
			rangeMin: () => i[0],
			rangeMax: () => i[1],
			isInRange(e) {
				var t = i[0], n = i[1];
				return t <= n ? e >= t && e <= n : e >= n && e <= t;
			},
			bandwidth: n ? () => n.call(e) : void 0,
			ticks: t ? (n) => t.call(e, n) : void 0,
			map: (t, n) => {
				var r = e(t);
				if (r != null) {
					if (e.bandwidth && n != null && n.position) {
						var i = e.bandwidth();
						switch (n.position) {
							case "middle":
								r += i / 2;
								break;
							case "end": r += i;
						}
					}
					return r;
				}
			}
		};
	}
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineCheckedDomain.js
var pg = (e, t) => {
	if (t != null) switch (e) {
		case "linear":
			if (!lh(t)) {
				for (var n, r, i = 0; i < t.length; i++) {
					var a = t[i];
					K(a) && ((n === void 0 || a < n) && (n = a), (r === void 0 || a > r) && (r = a));
				}
				return n !== void 0 && r !== void 0 ? [n, r] : void 0;
			}
			return t;
		default: return t;
	}
};
//#endregion
//#region node_modules/d3-array/src/ascending.js
function mg(e, t) {
	return e == null || t == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
//#endregion
//#region node_modules/d3-array/src/descending.js
function hg(e, t) {
	return e == null || t == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
//#endregion
//#region node_modules/d3-array/src/bisector.js
function gg(e) {
	let t, n, r;
	e.length === 2 ? (t = e === mg || e === hg ? e : _g, n = e, r = e) : (t = mg, n = (t, n) => mg(e(t), n), r = (t, n) => e(t) - n);
	function i(e, r, i = 0, a = e.length) {
		if (i < a) {
			if (t(r, r) !== 0) return a;
			do {
				let t = i + a >>> 1;
				n(e[t], r) < 0 ? i = t + 1 : a = t;
			} while (i < a);
		}
		return i;
	}
	function a(e, r, i = 0, a = e.length) {
		if (i < a) {
			if (t(r, r) !== 0) return a;
			do {
				let t = i + a >>> 1;
				n(e[t], r) <= 0 ? i = t + 1 : a = t;
			} while (i < a);
		}
		return i;
	}
	function o(e, t, n = 0, a = e.length) {
		let o = i(e, t, n, a - 1);
		return o > n && r(e[o - 1], t) > -r(e[o], t) ? o - 1 : o;
	}
	return {
		left: i,
		center: o,
		right: a
	};
}
function _g() {
	return 0;
}
//#endregion
//#region node_modules/d3-array/src/number.js
function vg(e) {
	return e === null ? NaN : +e;
}
function* yg(e, t) {
	if (t === void 0) for (let t of e) t != null && (t = +t) >= t && (yield t);
	else {
		let n = -1;
		for (let r of e) (r = t(r, ++n, e)) != null && (r = +r) >= r && (yield r);
	}
}
//#endregion
//#region node_modules/d3-array/src/bisect.js
var bg = gg(mg), xg = bg.right;
bg.left, gg(vg).center;
//#endregion
//#region node_modules/internmap/src/index.js
var Sg = class extends Map {
	constructor(e, t = Eg) {
		if (super(), Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: t }
		}), e != null) for (let [t, n] of e) this.set(t, n);
	}
	get(e) {
		return super.get(Cg(this, e));
	}
	has(e) {
		return super.has(Cg(this, e));
	}
	set(e, t) {
		return super.set(wg(this, e), t);
	}
	delete(e) {
		return super.delete(Tg(this, e));
	}
};
function Cg({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : n;
}
function wg({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : (e.set(r, n), n);
}
function Tg({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) && (n = e.get(r), e.delete(r)), n;
}
function Eg(e) {
	return typeof e == "object" && e ? e.valueOf() : e;
}
//#endregion
//#region node_modules/d3-array/src/sort.js
function Dg(e = mg) {
	if (e === mg) return Og;
	if (typeof e != "function") throw TypeError("compare is not a function");
	return (t, n) => {
		let r = e(t, n);
		return r || r === 0 ? r : (e(n, n) === 0) - (e(t, t) === 0);
	};
}
function Og(e, t) {
	return (e == null || !(e >= e)) - (t == null || !(t >= t)) || (e < t ? -1 : +(e > t));
}
//#endregion
//#region node_modules/d3-array/src/ticks.js
var kg = Math.sqrt(50), Ag = Math.sqrt(10), jg = Math.sqrt(2);
function Mg(e, t, n) {
	let r = (t - e) / Math.max(0, n), i = Math.floor(Math.log10(r)), a = r / 10 ** i, o = a >= kg ? 10 : a >= Ag ? 5 : a >= jg ? 2 : 1, s, c, l;
	return i < 0 ? (l = 10 ** -i / o, s = Math.round(e * l), c = Math.round(t * l), s / l < e && ++s, c / l > t && --c, l = -l) : (l = 10 ** i * o, s = Math.round(e / l), c = Math.round(t / l), s * l < e && ++s, c * l > t && --c), c < s && .5 <= n && n < 2 ? Mg(e, t, n * 2) : [
		s,
		c,
		l
	];
}
function Ng(e, t, n) {
	if (t = +t, e = +e, n = +n, !(n > 0)) return [];
	if (e === t) return [e];
	let r = t < e, [i, a, o] = r ? Mg(t, e, n) : Mg(e, t, n);
	if (!(a >= i)) return [];
	let s = a - i + 1, c = Array(s);
	if (r) {
		if (o < 0) for (let e = 0; e < s; ++e) c[e] = (a - e) / -o;
		else for (let e = 0; e < s; ++e) c[e] = (a - e) * o;
	} else if (o < 0) for (let e = 0; e < s; ++e) c[e] = (i + e) / -o;
	else for (let e = 0; e < s; ++e) c[e] = (i + e) * o;
	return c;
}
function Pg(e, t, n) {
	return t = +t, e = +e, n = +n, Mg(e, t, n)[2];
}
function Fg(e, t, n) {
	t = +t, e = +e, n = +n;
	let r = t < e, i = r ? Pg(t, e, n) : Pg(e, t, n);
	return (r ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
//#endregion
//#region node_modules/d3-array/src/max.js
function Ig(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n < t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n < i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
//#endregion
//#region node_modules/d3-array/src/min.js
function Lg(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n > t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n > i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
//#endregion
//#region node_modules/d3-array/src/quickselect.js
function Rg(e, t, n = 0, r = Infinity, i) {
	if (t = Math.floor(t), n = Math.floor(Math.max(0, n)), r = Math.floor(Math.min(e.length - 1, r)), !(n <= t && t <= r)) return e;
	for (i = i === void 0 ? Og : Dg(i); r > n;) {
		if (r - n > 600) {
			let a = r - n + 1, o = t - n + 1, s = Math.log(a), c = .5 * Math.exp(2 * s / 3), l = .5 * Math.sqrt(s * c * (a - c) / a) * (o - a / 2 < 0 ? -1 : 1), u = Math.max(n, Math.floor(t - o * c / a + l)), d = Math.min(r, Math.floor(t + (a - o) * c / a + l));
			Rg(e, t, u, d, i);
		}
		let a = e[t], o = n, s = r;
		for (zg(e, n, t), i(e[r], a) > 0 && zg(e, n, r); o < s;) {
			for (zg(e, o, s), ++o, --s; i(e[o], a) < 0;) ++o;
			for (; i(e[s], a) > 0;) --s;
		}
		i(e[n], a) === 0 ? zg(e, n, s) : (++s, zg(e, s, r)), s <= t && (n = s + 1), t <= s && (r = s - 1);
	}
	return e;
}
function zg(e, t, n) {
	let r = e[t];
	e[t] = e[n], e[n] = r;
}
//#endregion
//#region node_modules/d3-array/src/quantile.js
function Bg(e, t, n) {
	if (e = Float64Array.from(yg(e, n)), (r = e.length) && !isNaN(t = +t)) {
		if (t <= 0 || r < 2) return Lg(e);
		if (t >= 1) return Ig(e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = Ig(Rg(e, a).subarray(0, a + 1));
		return o + (Lg(e.subarray(a + 1)) - o) * (i - a);
	}
}
function Vg(e, t, n = vg) {
	if ((r = e.length) && !isNaN(t = +t)) {
		if (t <= 0 || r < 2) return +n(e[0], 0, e);
		if (t >= 1) return +n(e[r - 1], r - 1, e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = +n(e[a], a, e);
		return o + (+n(e[a + 1], a + 1, e) - o) * (i - a);
	}
}
//#endregion
//#region node_modules/d3-array/src/range.js
function Hg(e, t, n) {
	e = +e, t = +t, n = (i = arguments.length) < 2 ? (t = e, e = 0, 1) : i < 3 ? 1 : +n;
	for (var r = -1, i = Math.max(0, Math.ceil((t - e) / n)) | 0, a = Array(i); ++r < i;) a[r] = e + r * n;
	return a;
}
//#endregion
//#region node_modules/d3-scale/src/init.js
function Ug(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(e);
			break;
		default: this.range(t).domain(e);
	}
	return this;
}
function Wg(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			typeof e == "function" ? this.interpolator(e) : this.range(e);
			break;
		default: this.domain(e), typeof t == "function" ? this.interpolator(t) : this.range(t);
	}
	return this;
}
//#endregion
//#region node_modules/d3-scale/src/ordinal.js
var Gg = Symbol("implicit");
function Kg() {
	var e = new Sg(), t = [], n = [], r = Gg;
	function i(i) {
		let a = e.get(i);
		if (a === void 0) {
			if (r !== Gg) return r;
			e.set(i, a = t.push(i) - 1);
		}
		return n[a % n.length];
	}
	return i.domain = function(n) {
		if (!arguments.length) return t.slice();
		t = [], e = new Sg();
		for (let r of n) e.has(r) || e.set(r, t.push(r) - 1);
		return i;
	}, i.range = function(e) {
		return arguments.length ? (n = Array.from(e), i) : n.slice();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return Kg(t, n).unknown(r);
	}, Ug.apply(i, arguments), i;
}
//#endregion
//#region node_modules/d3-scale/src/band.js
function qg() {
	var e = Kg().unknown(void 0), t = e.domain, n = e.range, r = 0, i = 1, a, o, s = !1, c = 0, l = 0, u = .5;
	delete e.unknown;
	function d() {
		var e = t().length, d = i < r, f = d ? i : r, p = d ? r : i;
		a = (p - f) / Math.max(1, e - c + l * 2), s && (a = Math.floor(a)), f += (p - f - a * (e - c)) * u, o = a * (1 - c), s && (f = Math.round(f), o = Math.round(o));
		var m = Hg(e).map(function(e) {
			return f + a * e;
		});
		return n(d ? m.reverse() : m);
	}
	return e.domain = function(e) {
		return arguments.length ? (t(e), d()) : t();
	}, e.range = function(e) {
		return arguments.length ? ([r, i] = e, r = +r, i = +i, d()) : [r, i];
	}, e.rangeRound = function(e) {
		return [r, i] = e, r = +r, i = +i, s = !0, d();
	}, e.bandwidth = function() {
		return o;
	}, e.step = function() {
		return a;
	}, e.round = function(e) {
		return arguments.length ? (s = !!e, d()) : s;
	}, e.padding = function(e) {
		return arguments.length ? (c = Math.min(1, l = +e), d()) : c;
	}, e.paddingInner = function(e) {
		return arguments.length ? (c = Math.min(1, e), d()) : c;
	}, e.paddingOuter = function(e) {
		return arguments.length ? (l = +e, d()) : l;
	}, e.align = function(e) {
		return arguments.length ? (u = Math.max(0, Math.min(1, e)), d()) : u;
	}, e.copy = function() {
		return qg(t(), [r, i]).round(s).paddingInner(c).paddingOuter(l).align(u);
	}, Ug.apply(d(), arguments);
}
function Jg(e) {
	var t = e.copy;
	return e.padding = e.paddingOuter, delete e.paddingInner, delete e.paddingOuter, e.copy = function() {
		return Jg(t());
	}, e;
}
function Yg() {
	return Jg(qg.apply(null, arguments).paddingInner(1));
}
//#endregion
//#region node_modules/d3-scale/src/constant.js
function Xg(e) {
	return function() {
		return e;
	};
}
//#endregion
//#region node_modules/d3-scale/src/number.js
function Zg(e) {
	return +e;
}
//#endregion
//#region node_modules/d3-scale/src/continuous.js
var Qg = [0, 1];
function $g(e) {
	return e;
}
function e_(e, t) {
	return (t -= e = +e) ? function(n) {
		return (n - e) / t;
	} : Xg(isNaN(t) ? NaN : .5);
}
function t_(e, t) {
	var n;
	return e > t && (n = e, e = t, t = n), function(n) {
		return Math.max(e, Math.min(t, n));
	};
}
function n_(e, t, n) {
	var r = e[0], i = e[1], a = t[0], o = t[1];
	return i < r ? (r = e_(i, r), a = n(o, a)) : (r = e_(r, i), a = n(a, o)), function(e) {
		return a(r(e));
	};
}
function r_(e, t, n) {
	var r = Math.min(e.length, t.length) - 1, i = Array(r), a = Array(r), o = -1;
	for (e[r] < e[0] && (e = e.slice().reverse(), t = t.slice().reverse()); ++o < r;) i[o] = e_(e[o], e[o + 1]), a[o] = n(t[o], t[o + 1]);
	return function(t) {
		var n = xg(e, t, 1, r) - 1;
		return a[n](i[n](t));
	};
}
function i_(e, t) {
	return t.domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown());
}
function a_() {
	var e = Qg, t = Qg, n = Ft, r, i, a, o = $g, s, c, l;
	function u() {
		var n = Math.min(e.length, t.length);
		return o !== $g && (o = t_(e[0], e[n - 1])), s = n > 2 ? r_ : n_, c = l = null, d;
	}
	function d(i) {
		return i == null || isNaN(i = +i) ? a : (c ||= s(e.map(r), t, n))(r(o(i)));
	}
	return d.invert = function(n) {
		return o(i((l ||= s(t, e.map(r), Ot))(n)));
	}, d.domain = function(t) {
		return arguments.length ? (e = Array.from(t, Zg), u()) : e.slice();
	}, d.range = function(e) {
		return arguments.length ? (t = Array.from(e), u()) : t.slice();
	}, d.rangeRound = function(e) {
		return t = Array.from(e), n = It, u();
	}, d.clamp = function(e) {
		return arguments.length ? (o = e ? !0 : $g, u()) : o !== $g;
	}, d.interpolate = function(e) {
		return arguments.length ? (n = e, u()) : n;
	}, d.unknown = function(e) {
		return arguments.length ? (a = e, d) : a;
	}, function(e, t) {
		return r = e, i = t, u();
	};
}
function o_() {
	return a_()($g, $g);
}
//#endregion
//#region node_modules/d3-format/src/formatDecimal.js
function s_(e) {
	return Math.abs(e = Math.round(e)) >= 1e21 ? e.toLocaleString("en").replace(/,/g, "") : e.toString(10);
}
function c_(e, t) {
	if (!isFinite(e) || e === 0) return null;
	var n = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf("e"), r = e.slice(0, n);
	return [r.length > 1 ? r[0] + r.slice(2) : r, +e.slice(n + 1)];
}
//#endregion
//#region node_modules/d3-format/src/exponent.js
function l_(e) {
	return e = c_(Math.abs(e)), e ? e[1] : NaN;
}
//#endregion
//#region node_modules/d3-format/src/formatGroup.js
function u_(e, t) {
	return function(n, r) {
		for (var i = n.length, a = [], o = 0, s = e[0], c = 0; i > 0 && s > 0 && (c + s + 1 > r && (s = Math.max(1, r - c)), a.push(n.substring(i -= s, i + s)), !((c += s + 1) > r));) s = e[o = (o + 1) % e.length];
		return a.reverse().join(t);
	};
}
//#endregion
//#region node_modules/d3-format/src/formatNumerals.js
function d_(e) {
	return function(t) {
		return t.replace(/[0-9]/g, function(t) {
			return e[+t];
		});
	};
}
//#endregion
//#region node_modules/d3-format/src/formatSpecifier.js
var f_ = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function p_(e) {
	if (!(t = f_.exec(e))) throw Error("invalid format: " + e);
	var t;
	return new m_({
		fill: t[1],
		align: t[2],
		sign: t[3],
		symbol: t[4],
		zero: t[5],
		width: t[6],
		comma: t[7],
		precision: t[8] && t[8].slice(1),
		trim: t[9],
		type: t[10]
	});
}
p_.prototype = m_.prototype;
function m_(e) {
	this.fill = e.fill === void 0 ? " " : e.fill + "", this.align = e.align === void 0 ? ">" : e.align + "", this.sign = e.sign === void 0 ? "-" : e.sign + "", this.symbol = e.symbol === void 0 ? "" : e.symbol + "", this.zero = !!e.zero, this.width = e.width === void 0 ? void 0 : +e.width, this.comma = !!e.comma, this.precision = e.precision === void 0 ? void 0 : +e.precision, this.trim = !!e.trim, this.type = e.type === void 0 ? "" : e.type + "";
}
m_.prototype.toString = function() {
	return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
//#endregion
//#region node_modules/d3-format/src/formatTrim.js
function h_(e) {
	out: for (var t = e.length, n = 1, r = -1, i; n < t; ++n) switch (e[n]) {
		case ".":
			r = i = n;
			break;
		case "0":
			r === 0 && (r = n), i = n;
			break;
		default:
			if (!+e[n]) break out;
			r > 0 && (r = 0);
	}
	return r > 0 ? e.slice(0, r) + e.slice(i + 1) : e;
}
//#endregion
//#region node_modules/d3-format/src/formatPrefixAuto.js
var g_;
function __(e, t) {
	var n = c_(e, t);
	if (!n) return g_ = void 0, e.toPrecision(t);
	var r = n[0], i = n[1], a = i - (g_ = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1, o = r.length;
	return a === o ? r : a > o ? r + Array(a - o + 1).join("0") : a > 0 ? r.slice(0, a) + "." + r.slice(a) : "0." + Array(1 - a).join("0") + c_(e, Math.max(0, t + a - 1))[0];
}
//#endregion
//#region node_modules/d3-format/src/formatRounded.js
function v_(e, t) {
	var n = c_(e, t);
	if (!n) return e + "";
	var r = n[0], i = n[1];
	return i < 0 ? "0." + Array(-i).join("0") + r : r.length > i + 1 ? r.slice(0, i + 1) + "." + r.slice(i + 1) : r + Array(i - r.length + 2).join("0");
}
//#endregion
//#region node_modules/d3-format/src/formatTypes.js
var y_ = {
	"%": (e, t) => (e * 100).toFixed(t),
	b: (e) => Math.round(e).toString(2),
	c: (e) => e + "",
	d: s_,
	e: (e, t) => e.toExponential(t),
	f: (e, t) => e.toFixed(t),
	g: (e, t) => e.toPrecision(t),
	o: (e) => Math.round(e).toString(8),
	p: (e, t) => v_(e * 100, t),
	r: v_,
	s: __,
	X: (e) => Math.round(e).toString(16).toUpperCase(),
	x: (e) => Math.round(e).toString(16)
};
//#endregion
//#region node_modules/d3-format/src/identity.js
function b_(e) {
	return e;
}
//#endregion
//#region node_modules/d3-format/src/locale.js
var x_ = Array.prototype.map, S_ = [
	"y",
	"z",
	"a",
	"f",
	"p",
	"n",
	"µ",
	"m",
	"",
	"k",
	"M",
	"G",
	"T",
	"P",
	"E",
	"Z",
	"Y"
];
function C_(e) {
	var t = e.grouping === void 0 || e.thousands === void 0 ? b_ : u_(x_.call(e.grouping, Number), e.thousands + ""), n = e.currency === void 0 ? "" : e.currency[0] + "", r = e.currency === void 0 ? "" : e.currency[1] + "", i = e.decimal === void 0 ? "." : e.decimal + "", a = e.numerals === void 0 ? b_ : d_(x_.call(e.numerals, String)), o = e.percent === void 0 ? "%" : e.percent + "", s = e.minus === void 0 ? "−" : e.minus + "", c = e.nan === void 0 ? "NaN" : e.nan + "";
	function l(e, l) {
		e = p_(e);
		var u = e.fill, d = e.align, f = e.sign, p = e.symbol, m = e.zero, h = e.width, g = e.comma, _ = e.precision, v = e.trim, y = e.type;
		y === "n" ? (g = !0, y = "g") : y_[y] || (_ === void 0 && (_ = 12), v = !0, y = "g"), (m || u === "0" && d === "=") && (m = !0, u = "0", d = "=");
		var b = (l && l.prefix !== void 0 ? l.prefix : "") + (p === "$" ? n : p === "#" && /[boxX]/.test(y) ? "0" + y.toLowerCase() : ""), x = (p === "$" ? r : /[%p]/.test(y) ? o : "") + (l && l.suffix !== void 0 ? l.suffix : ""), S = y_[y], C = /[defgprs%]/.test(y);
		_ = _ === void 0 ? 6 : /[gprs]/.test(y) ? Math.max(1, Math.min(21, _)) : Math.max(0, Math.min(20, _));
		function w(e) {
			var n = b, r = x, o, l, p;
			if (y === "c") r = S(e) + r, e = "";
			else {
				e = +e;
				var w = e < 0 || 1 / e < 0;
				if (e = isNaN(e) ? c : S(Math.abs(e), _), v && (e = h_(e)), w && +e == 0 && f !== "+" && (w = !1), n = (w ? f === "(" ? f : s : f === "-" || f === "(" ? "" : f) + n, r = (y === "s" && !isNaN(e) && g_ !== void 0 ? S_[8 + g_ / 3] : "") + r + (w && f === "(" ? ")" : ""), C) {
					for (o = -1, l = e.length; ++o < l;) if (p = e.charCodeAt(o), 48 > p || p > 57) {
						r = (p === 46 ? i + e.slice(o + 1) : e.slice(o)) + r, e = e.slice(0, o);
						break;
					}
				}
			}
			g && !m && (e = t(e, Infinity));
			var T = n.length + e.length + r.length, E = T < h ? Array(h - T + 1).join(u) : "";
			switch (g && m && (e = t(E + e, E.length ? h - r.length : Infinity), E = ""), d) {
				case "<":
					e = n + e + r + E;
					break;
				case "=":
					e = n + E + e + r;
					break;
				case "^":
					e = E.slice(0, T = E.length >> 1) + n + e + r + E.slice(T);
					break;
				default: e = E + n + e + r;
			}
			return a(e);
		}
		return w.toString = function() {
			return e + "";
		}, w;
	}
	function u(e, t) {
		var n = Math.max(-8, Math.min(8, Math.floor(l_(t) / 3))) * 3, r = 10 ** -n, i = l((e = p_(e), e.type = "f", e), { suffix: S_[8 + n / 3] });
		return function(e) {
			return i(r * e);
		};
	}
	return {
		format: l,
		formatPrefix: u
	};
}
//#endregion
//#region node_modules/d3-format/src/defaultLocale.js
var w_, T_, E_;
D_({
	thousands: ",",
	grouping: [3],
	currency: ["$", ""]
});
function D_(e) {
	return w_ = C_(e), T_ = w_.format, E_ = w_.formatPrefix, w_;
}
//#endregion
//#region node_modules/d3-format/src/precisionFixed.js
function O_(e) {
	return Math.max(0, -l_(Math.abs(e)));
}
//#endregion
//#region node_modules/d3-format/src/precisionPrefix.js
function k_(e, t) {
	return Math.max(0, Math.max(-8, Math.min(8, Math.floor(l_(t) / 3))) * 3 - l_(Math.abs(e)));
}
//#endregion
//#region node_modules/d3-format/src/precisionRound.js
function A_(e, t) {
	return e = Math.abs(e), t = Math.abs(t) - e, Math.max(0, l_(t) - l_(e)) + 1;
}
//#endregion
//#region node_modules/d3-scale/src/tickFormat.js
function j_(e, t, n, r) {
	var i = Fg(e, t, n), a;
	switch (r = p_(r ?? ",f"), r.type) {
		case "s":
			var o = Math.max(Math.abs(e), Math.abs(t));
			return r.precision == null && !isNaN(a = k_(i, o)) && (r.precision = a), E_(r, o);
		case "":
		case "e":
		case "g":
		case "p":
		case "r":
			r.precision == null && !isNaN(a = A_(i, Math.max(Math.abs(e), Math.abs(t)))) && (r.precision = a - (r.type === "e"));
			break;
		case "f":
		case "%": r.precision == null && !isNaN(a = O_(i)) && (r.precision = a - (r.type === "%") * 2);
	}
	return T_(r);
}
//#endregion
//#region node_modules/d3-scale/src/linear.js
function M_(e) {
	var t = e.domain;
	return e.ticks = function(e) {
		var n = t();
		return Ng(n[0], n[n.length - 1], e ?? 10);
	}, e.tickFormat = function(e, n) {
		var r = t();
		return j_(r[0], r[r.length - 1], e ?? 10, n);
	}, e.nice = function(n) {
		n ??= 10;
		var r = t(), i = 0, a = r.length - 1, o = r[i], s = r[a], c, l, u = 10;
		for (s < o && (l = o, o = s, s = l, l = i, i = a, a = l); u-- > 0;) {
			if (l = Pg(o, s, n), l === c) return r[i] = o, r[a] = s, t(r);
			if (l > 0) o = Math.floor(o / l) * l, s = Math.ceil(s / l) * l;
			else if (l < 0) o = Math.ceil(o * l) / l, s = Math.floor(s * l) / l;
			else break;
			c = l;
		}
		return e;
	}, e;
}
function N_() {
	var e = o_();
	return e.copy = function() {
		return i_(e, N_());
	}, Ug.apply(e, arguments), M_(e);
}
//#endregion
//#region node_modules/d3-scale/src/identity.js
function P_(e) {
	var t;
	function n(e) {
		return e == null || isNaN(e = +e) ? t : e;
	}
	return n.invert = n, n.domain = n.range = function(t) {
		return arguments.length ? (e = Array.from(t, Zg), n) : e.slice();
	}, n.unknown = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.copy = function() {
		return P_(e).unknown(t);
	}, e = arguments.length ? Array.from(e, Zg) : [0, 1], M_(n);
}
//#endregion
//#region node_modules/d3-scale/src/nice.js
function F_(e, t) {
	e = e.slice();
	var n = 0, r = e.length - 1, i = e[n], a = e[r], o;
	return a < i && (o = n, n = r, r = o, o = i, i = a, a = o), e[n] = t.floor(i), e[r] = t.ceil(a), e;
}
//#endregion
//#region node_modules/d3-scale/src/log.js
function I_(e) {
	return Math.log(e);
}
function L_(e) {
	return Math.exp(e);
}
function R_(e) {
	return -Math.log(-e);
}
function z_(e) {
	return -Math.exp(-e);
}
function B_(e) {
	return isFinite(e) ? +("1e" + e) : e < 0 ? 0 : e;
}
function V_(e) {
	return e === 10 ? B_ : e === Math.E ? Math.exp : (t) => e ** +t;
}
function H_(e) {
	return e === Math.E ? Math.log : e === 10 && Math.log10 || e === 2 && Math.log2 || (e = Math.log(e), (t) => Math.log(t) / e);
}
function U_(e) {
	return (t, n) => -e(-t, n);
}
function W_(e) {
	let t = e(I_, L_), n = t.domain, r = 10, i, a;
	function o() {
		return i = H_(r), a = V_(r), n()[0] < 0 ? (i = U_(i), a = U_(a), e(R_, z_)) : e(I_, L_), t;
	}
	return t.base = function(e) {
		return arguments.length ? (r = +e, o()) : r;
	}, t.domain = function(e) {
		return arguments.length ? (n(e), o()) : n();
	}, t.ticks = (e) => {
		let t = n(), o = t[0], s = t[t.length - 1], c = s < o;
		c && ([o, s] = [s, o]);
		let l = i(o), u = i(s), d, f, p = e == null ? 10 : +e, m = [];
		if (!(r % 1) && u - l < p) {
			if (l = Math.floor(l), u = Math.ceil(u), o > 0) {
				for (; l <= u; ++l) for (d = 1; d < r; ++d) if (f = l < 0 ? d / a(-l) : d * a(l), !(f < o)) {
					if (f > s) break;
					m.push(f);
				}
			} else for (; l <= u; ++l) for (d = r - 1; d >= 1; --d) if (f = l > 0 ? d / a(-l) : d * a(l), !(f < o)) {
				if (f > s) break;
				m.push(f);
			}
			m.length * 2 < p && (m = Ng(o, s, p));
		} else m = Ng(l, u, Math.min(u - l, p)).map(a);
		return c ? m.reverse() : m;
	}, t.tickFormat = (e, n) => {
		if (e ??= 10, n ??= r === 10 ? "s" : ",", typeof n != "function" && (!(r % 1) && (n = p_(n)).precision == null && (n.trim = !0), n = T_(n)), e === Infinity) return n;
		let o = Math.max(1, r * e / t.ticks().length);
		return (e) => {
			let t = e / a(Math.round(i(e)));
			return t * r < r - .5 && (t *= r), t <= o ? n(e) : "";
		};
	}, t.nice = () => n(F_(n(), {
		floor: (e) => a(Math.floor(i(e))),
		ceil: (e) => a(Math.ceil(i(e)))
	})), t;
}
function G_() {
	let e = W_(a_()).domain([1, 10]);
	return e.copy = () => i_(e, G_()).base(e.base()), Ug.apply(e, arguments), e;
}
//#endregion
//#region node_modules/d3-scale/src/symlog.js
function K_(e) {
	return function(t) {
		return Math.sign(t) * Math.log1p(Math.abs(t / e));
	};
}
function q_(e) {
	return function(t) {
		return Math.sign(t) * Math.expm1(Math.abs(t)) * e;
	};
}
function J_(e) {
	var t = 1, n = e(K_(t), q_(t));
	return n.constant = function(n) {
		return arguments.length ? e(K_(t = +n), q_(t)) : t;
	}, M_(n);
}
function Y_() {
	var e = J_(a_());
	return e.copy = function() {
		return i_(e, Y_()).constant(e.constant());
	}, Ug.apply(e, arguments);
}
//#endregion
//#region node_modules/d3-scale/src/pow.js
function X_(e) {
	return function(t) {
		return t < 0 ? -((-t) ** +e) : t ** +e;
	};
}
function Z_(e) {
	return e < 0 ? -Math.sqrt(-e) : Math.sqrt(e);
}
function Q_(e) {
	return e < 0 ? -e * e : e * e;
}
function $_(e) {
	var t = e($g, $g), n = 1;
	function r() {
		return n === 1 ? e($g, $g) : n === .5 ? e(Z_, Q_) : e(X_(n), X_(1 / n));
	}
	return t.exponent = function(e) {
		return arguments.length ? (n = +e, r()) : n;
	}, M_(t);
}
function ev() {
	var e = $_(a_());
	return e.copy = function() {
		return i_(e, ev()).exponent(e.exponent());
	}, Ug.apply(e, arguments), e;
}
function tv() {
	return ev.apply(null, arguments).exponent(.5);
}
//#endregion
//#region node_modules/d3-scale/src/radial.js
function nv(e) {
	return Math.sign(e) * e * e;
}
function rv(e) {
	return Math.sign(e) * Math.sqrt(Math.abs(e));
}
function iv() {
	var e = o_(), t = [0, 1], n = !1, r;
	function i(t) {
		var i = rv(e(t));
		return isNaN(i) ? r : n ? Math.round(i) : i;
	}
	return i.invert = function(t) {
		return e.invert(nv(t));
	}, i.domain = function(t) {
		return arguments.length ? (e.domain(t), i) : e.domain();
	}, i.range = function(n) {
		return arguments.length ? (e.range((t = Array.from(n, Zg)).map(nv)), i) : t.slice();
	}, i.rangeRound = function(e) {
		return i.range(e).round(!0);
	}, i.round = function(e) {
		return arguments.length ? (n = !!e, i) : n;
	}, i.clamp = function(t) {
		return arguments.length ? (e.clamp(t), i) : e.clamp();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return iv(e.domain(), t).round(n).clamp(e.clamp()).unknown(r);
	}, Ug.apply(i, arguments), M_(i);
}
//#endregion
//#region node_modules/d3-scale/src/quantile.js
function av() {
	var e = [], t = [], n = [], r;
	function i() {
		var r = 0, i = Math.max(1, t.length);
		for (n = Array(i - 1); ++r < i;) n[r - 1] = Vg(e, r / i);
		return a;
	}
	function a(e) {
		return e == null || isNaN(e = +e) ? r : t[xg(n, e)];
	}
	return a.invertExtent = function(r) {
		var i = t.indexOf(r);
		return i < 0 ? [NaN, NaN] : [i > 0 ? n[i - 1] : e[0], i < n.length ? n[i] : e[e.length - 1]];
	}, a.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(mg), i();
	}, a.range = function(e) {
		return arguments.length ? (t = Array.from(e), i()) : t.slice();
	}, a.unknown = function(e) {
		return arguments.length ? (r = e, a) : r;
	}, a.quantiles = function() {
		return n.slice();
	}, a.copy = function() {
		return av().domain(e).range(t).unknown(r);
	}, Ug.apply(a, arguments);
}
//#endregion
//#region node_modules/d3-scale/src/quantize.js
function ov() {
	var e = 0, t = 1, n = 1, r = [.5], i = [0, 1], a;
	function o(e) {
		return e != null && e <= e ? i[xg(r, e, 0, n)] : a;
	}
	function s() {
		var i = -1;
		for (r = Array(n); ++i < n;) r[i] = ((i + 1) * t - (i - n) * e) / (n + 1);
		return o;
	}
	return o.domain = function(n) {
		return arguments.length ? ([e, t] = n, e = +e, t = +t, s()) : [e, t];
	}, o.range = function(e) {
		return arguments.length ? (n = (i = Array.from(e)).length - 1, s()) : i.slice();
	}, o.invertExtent = function(a) {
		var o = i.indexOf(a);
		return o < 0 ? [NaN, NaN] : o < 1 ? [e, r[0]] : o >= n ? [r[n - 1], t] : [r[o - 1], r[o]];
	}, o.unknown = function(e) {
		return arguments.length && (a = e), o;
	}, o.thresholds = function() {
		return r.slice();
	}, o.copy = function() {
		return ov().domain([e, t]).range(i).unknown(a);
	}, Ug.apply(M_(o), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/threshold.js
function sv() {
	var e = [.5], t = [0, 1], n, r = 1;
	function i(i) {
		return i != null && i <= i ? t[xg(e, i, 0, r)] : n;
	}
	return i.domain = function(n) {
		return arguments.length ? (e = Array.from(n), r = Math.min(e.length, t.length - 1), i) : e.slice();
	}, i.range = function(n) {
		return arguments.length ? (t = Array.from(n), r = Math.min(e.length, t.length - 1), i) : t.slice();
	}, i.invertExtent = function(n) {
		var r = t.indexOf(n);
		return [e[r - 1], e[r]];
	}, i.unknown = function(e) {
		return arguments.length ? (n = e, i) : n;
	}, i.copy = function() {
		return sv().domain(e).range(t).unknown(n);
	}, Ug.apply(i, arguments);
}
//#endregion
//#region node_modules/d3-time/src/interval.js
var cv = /* @__PURE__ */ new Date(), lv = /* @__PURE__ */ new Date();
function uv(e, t, n, r) {
	function i(t) {
		return e(t = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+t)), t;
	}
	return i.floor = (t) => (e(t = /* @__PURE__ */ new Date(+t)), t), i.ceil = (n) => (e(n = /* @__PURE__ */ new Date(n - 1)), t(n, 1), e(n), n), i.round = (e) => {
		let t = i(e), n = i.ceil(e);
		return e - t < n - e ? t : n;
	}, i.offset = (e, n) => (t(e = /* @__PURE__ */ new Date(+e), n == null ? 1 : Math.floor(n)), e), i.range = (n, r, a) => {
		let o = [];
		if (n = i.ceil(n), a = a == null ? 1 : Math.floor(a), !(n < r) || !(a > 0)) return o;
		let s;
		do
			o.push(s = /* @__PURE__ */ new Date(+n)), t(n, a), e(n);
		while (s < n && n < r);
		return o;
	}, i.filter = (n) => uv((t) => {
		if (t >= t) for (; e(t), !n(t);) t.setTime(t - 1);
	}, (e, r) => {
		if (e >= e) {
			if (r < 0) for (; ++r <= 0;) for (; t(e, -1), !n(e););
			else for (; --r >= 0;) for (; t(e, 1), !n(e););
		}
	}), n && (i.count = (t, r) => (cv.setTime(+t), lv.setTime(+r), e(cv), e(lv), Math.floor(n(cv, lv))), i.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? i.filter(r ? (t) => r(t) % e === 0 : (t) => i.count(0, t) % e === 0) : i)), i;
}
//#endregion
//#region node_modules/d3-time/src/millisecond.js
var dv = uv(() => {}, (e, t) => {
	e.setTime(+e + t);
}, (e, t) => t - e);
dv.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? uv((t) => {
	t.setTime(Math.floor(t / e) * e);
}, (t, n) => {
	t.setTime(+t + n * e);
}, (t, n) => (n - t) / e) : dv), dv.range;
//#endregion
//#region node_modules/d3-time/src/duration.js
var fv = 1e3, pv = fv * 60, mv = pv * 60, hv = mv * 24, gv = hv * 7, _v = hv * 30, vv = hv * 365, yv = uv((e) => {
	e.setTime(e - e.getMilliseconds());
}, (e, t) => {
	e.setTime(+e + t * fv);
}, (e, t) => (t - e) / fv, (e) => e.getUTCSeconds());
yv.range;
//#endregion
//#region node_modules/d3-time/src/minute.js
var bv = uv((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * fv);
}, (e, t) => {
	e.setTime(+e + t * pv);
}, (e, t) => (t - e) / pv, (e) => e.getMinutes());
bv.range;
var xv = uv((e) => {
	e.setUTCSeconds(0, 0);
}, (e, t) => {
	e.setTime(+e + t * pv);
}, (e, t) => (t - e) / pv, (e) => e.getUTCMinutes());
xv.range;
//#endregion
//#region node_modules/d3-time/src/hour.js
var Sv = uv((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * fv - e.getMinutes() * pv);
}, (e, t) => {
	e.setTime(+e + t * mv);
}, (e, t) => (t - e) / mv, (e) => e.getHours());
Sv.range;
var Cv = uv((e) => {
	e.setUTCMinutes(0, 0, 0);
}, (e, t) => {
	e.setTime(+e + t * mv);
}, (e, t) => (t - e) / mv, (e) => e.getUTCHours());
Cv.range;
//#endregion
//#region node_modules/d3-time/src/day.js
var wv = uv((e) => e.setHours(0, 0, 0, 0), (e, t) => e.setDate(e.getDate() + t), (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * pv) / hv, (e) => e.getDate() - 1);
wv.range;
var Tv = uv((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / hv, (e) => e.getUTCDate() - 1);
Tv.range;
var Ev = uv((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / hv, (e) => Math.floor(e / hv));
Ev.range;
//#endregion
//#region node_modules/d3-time/src/week.js
function Dv(e) {
	return uv((t) => {
		t.setDate(t.getDate() - (t.getDay() + 7 - e) % 7), t.setHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setDate(e.getDate() + t * 7);
	}, (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * pv) / gv);
}
var Ov = Dv(0), kv = Dv(1), Av = Dv(2), jv = Dv(3), Mv = Dv(4), Nv = Dv(5), Pv = Dv(6);
Ov.range, kv.range, Av.range, jv.range, Mv.range, Nv.range, Pv.range;
function Fv(e) {
	return uv((t) => {
		t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 7 - e) % 7), t.setUTCHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setUTCDate(e.getUTCDate() + t * 7);
	}, (e, t) => (t - e) / gv);
}
var Iv = Fv(0), Lv = Fv(1), Rv = Fv(2), zv = Fv(3), Bv = Fv(4), Vv = Fv(5), Hv = Fv(6);
Iv.range, Lv.range, Rv.range, zv.range, Bv.range, Vv.range, Hv.range;
//#endregion
//#region node_modules/d3-time/src/month.js
var Uv = uv((e) => {
	e.setDate(1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setMonth(e.getMonth() + t);
}, (e, t) => t.getMonth() - e.getMonth() + (t.getFullYear() - e.getFullYear()) * 12, (e) => e.getMonth());
Uv.range;
var Wv = uv((e) => {
	e.setUTCDate(1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCMonth(e.getUTCMonth() + t);
}, (e, t) => t.getUTCMonth() - e.getUTCMonth() + (t.getUTCFullYear() - e.getUTCFullYear()) * 12, (e) => e.getUTCMonth());
Wv.range;
//#endregion
//#region node_modules/d3-time/src/year.js
var Gv = uv((e) => {
	e.setMonth(0, 1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setFullYear(e.getFullYear() + t);
}, (e, t) => t.getFullYear() - e.getFullYear(), (e) => e.getFullYear());
Gv.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : uv((t) => {
	t.setFullYear(Math.floor(t.getFullYear() / e) * e), t.setMonth(0, 1), t.setHours(0, 0, 0, 0);
}, (t, n) => {
	t.setFullYear(t.getFullYear() + n * e);
}), Gv.range;
var Kv = uv((e) => {
	e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCFullYear(e.getUTCFullYear() + t);
}, (e, t) => t.getUTCFullYear() - e.getUTCFullYear(), (e) => e.getUTCFullYear());
Kv.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : uv((t) => {
	t.setUTCFullYear(Math.floor(t.getUTCFullYear() / e) * e), t.setUTCMonth(0, 1), t.setUTCHours(0, 0, 0, 0);
}, (t, n) => {
	t.setUTCFullYear(t.getUTCFullYear() + n * e);
}), Kv.range;
//#endregion
//#region node_modules/d3-time/src/ticks.js
function qv(e, t, n, r, i, a) {
	let o = [
		[
			yv,
			1,
			fv
		],
		[
			yv,
			5,
			5 * fv
		],
		[
			yv,
			15,
			15 * fv
		],
		[
			yv,
			30,
			30 * fv
		],
		[
			a,
			1,
			pv
		],
		[
			a,
			5,
			5 * pv
		],
		[
			a,
			15,
			15 * pv
		],
		[
			a,
			30,
			30 * pv
		],
		[
			i,
			1,
			mv
		],
		[
			i,
			3,
			3 * mv
		],
		[
			i,
			6,
			6 * mv
		],
		[
			i,
			12,
			12 * mv
		],
		[
			r,
			1,
			hv
		],
		[
			r,
			2,
			2 * hv
		],
		[
			n,
			1,
			gv
		],
		[
			t,
			1,
			_v
		],
		[
			t,
			3,
			3 * _v
		],
		[
			e,
			1,
			vv
		]
	];
	function s(e, t, n) {
		let r = t < e;
		r && ([e, t] = [t, e]);
		let i = n && typeof n.range == "function" ? n : c(e, t, n), a = i ? i.range(e, +t + 1) : [];
		return r ? a.reverse() : a;
	}
	function c(t, n, r) {
		let i = Math.abs(n - t) / r, a = gg(([, , e]) => e).right(o, i);
		if (a === o.length) return e.every(Fg(t / vv, n / vv, r));
		if (a === 0) return dv.every(Math.max(Fg(t, n, r), 1));
		let [s, c] = o[i / o[a - 1][2] < o[a][2] / i ? a - 1 : a];
		return s.every(c);
	}
	return [s, c];
}
var [Jv, Yv] = qv(Kv, Wv, Iv, Ev, Cv, xv), [Xv, Zv] = qv(Gv, Uv, Ov, wv, Sv, bv);
//#endregion
//#region node_modules/d3-time-format/src/locale.js
function Qv(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(-1, e.m, e.d, e.H, e.M, e.S, e.L);
		return t.setFullYear(e.y), t;
	}
	return new Date(e.y, e.m, e.d, e.H, e.M, e.S, e.L);
}
function $v(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(Date.UTC(-1, e.m, e.d, e.H, e.M, e.S, e.L));
		return t.setUTCFullYear(e.y), t;
	}
	return new Date(Date.UTC(e.y, e.m, e.d, e.H, e.M, e.S, e.L));
}
function ey(e, t, n) {
	return {
		y: e,
		m: t,
		d: n,
		H: 0,
		M: 0,
		S: 0,
		L: 0
	};
}
function ty(e) {
	var t = e.dateTime, n = e.date, r = e.time, i = e.periods, a = e.days, o = e.shortDays, s = e.months, c = e.shortMonths, l = sy(i), u = cy(i), d = sy(a), f = cy(a), p = sy(o), m = cy(o), h = sy(s), g = cy(s), _ = sy(c), v = cy(c), y = {
		a: N,
		A: ee,
		b: P,
		B: te,
		c: null,
		d: ky,
		e: ky,
		f: Py,
		g: Gy,
		G: qy,
		H: Ay,
		I: jy,
		j: My,
		L: Ny,
		m: Fy,
		M: Iy,
		p: ne,
		q: re,
		Q: gb,
		s: _b,
		S: Ly,
		u: Ry,
		U: zy,
		V: Vy,
		w: Hy,
		W: Uy,
		x: null,
		X: null,
		y: Wy,
		Y: Ky,
		Z: Jy,
		"%": hb
	}, b = {
		a: ie,
		A: ae,
		b: oe,
		B: se,
		c: null,
		d: Yy,
		e: Yy,
		f: eb,
		g: db,
		G: pb,
		H: Xy,
		I: Zy,
		j: Qy,
		L: $y,
		m: tb,
		M: nb,
		p: ce,
		q: le,
		Q: gb,
		s: _b,
		S: rb,
		u: ib,
		U: ab,
		V: sb,
		w: cb,
		W: lb,
		x: null,
		X: null,
		y: ub,
		Y: fb,
		Z: mb,
		"%": hb
	}, x = {
		a: E,
		A: D,
		b: O,
		B: k,
		c: A,
		d: yy,
		e: yy,
		f: Ty,
		g: hy,
		G: my,
		H: xy,
		I: xy,
		j: by,
		L: wy,
		m: vy,
		M: Sy,
		p: T,
		q: _y,
		Q: Dy,
		s: Oy,
		S: Cy,
		u: uy,
		U: dy,
		V: fy,
		w: ly,
		W: py,
		x: j,
		X: M,
		y: hy,
		Y: my,
		Z: gy,
		"%": Ey
	};
	y.x = S(n, y), y.X = S(r, y), y.c = S(t, y), b.x = S(n, b), b.X = S(r, b), b.c = S(t, b);
	function S(e, t) {
		return function(n) {
			var r = [], i = -1, a = 0, o = e.length, s, c, l;
			for (n instanceof Date || (n = /* @__PURE__ */ new Date(+n)); ++i < o;) e.charCodeAt(i) === 37 && (r.push(e.slice(a, i)), (c = ny[s = e.charAt(++i)]) == null ? c = s === "e" ? " " : "0" : s = e.charAt(++i), (l = t[s]) && (s = l(n, c)), r.push(s), a = i + 1);
			return r.push(e.slice(a, i)), r.join("");
		};
	}
	function C(e, t) {
		return function(n) {
			var r = ey(1900, void 0, 1), i = w(r, e, n += "", 0), a, o;
			if (i != n.length) return null;
			if ("Q" in r) return new Date(r.Q);
			if ("s" in r) return new Date(r.s * 1e3 + ("L" in r ? r.L : 0));
			if (t && !("Z" in r) && (r.Z = 0), "p" in r && (r.H = r.H % 12 + r.p * 12), r.m === void 0 && (r.m = "q" in r ? r.q : 0), "V" in r) {
				if (r.V < 1 || r.V > 53) return null;
				"w" in r || (r.w = 1), "Z" in r ? (a = $v(ey(r.y, 0, 1)), o = a.getUTCDay(), a = o > 4 || o === 0 ? Lv.ceil(a) : Lv(a), a = Tv.offset(a, (r.V - 1) * 7), r.y = a.getUTCFullYear(), r.m = a.getUTCMonth(), r.d = a.getUTCDate() + (r.w + 6) % 7) : (a = Qv(ey(r.y, 0, 1)), o = a.getDay(), a = o > 4 || o === 0 ? kv.ceil(a) : kv(a), a = wv.offset(a, (r.V - 1) * 7), r.y = a.getFullYear(), r.m = a.getMonth(), r.d = a.getDate() + (r.w + 6) % 7);
			} else ("W" in r || "U" in r) && ("w" in r || (r.w = "u" in r ? r.u % 7 : +("W" in r)), o = "Z" in r ? $v(ey(r.y, 0, 1)).getUTCDay() : Qv(ey(r.y, 0, 1)).getDay(), r.m = 0, r.d = "W" in r ? (r.w + 6) % 7 + r.W * 7 - (o + 5) % 7 : r.w + r.U * 7 - (o + 6) % 7);
			return "Z" in r ? (r.H += r.Z / 100 | 0, r.M += r.Z % 100, $v(r)) : Qv(r);
		};
	}
	function w(e, t, n, r) {
		for (var i = 0, a = t.length, o = n.length, s, c; i < a;) {
			if (r >= o) return -1;
			if (s = t.charCodeAt(i++), s === 37) {
				if (s = t.charAt(i++), c = x[s in ny ? t.charAt(i++) : s], !c || (r = c(e, n, r)) < 0) return -1;
			} else if (s != n.charCodeAt(r++)) return -1;
		}
		return r;
	}
	function T(e, t, n) {
		var r = l.exec(t.slice(n));
		return r ? (e.p = u.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function E(e, t, n) {
		var r = p.exec(t.slice(n));
		return r ? (e.w = m.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function D(e, t, n) {
		var r = d.exec(t.slice(n));
		return r ? (e.w = f.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function O(e, t, n) {
		var r = _.exec(t.slice(n));
		return r ? (e.m = v.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function k(e, t, n) {
		var r = h.exec(t.slice(n));
		return r ? (e.m = g.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function A(e, n, r) {
		return w(e, t, n, r);
	}
	function j(e, t, r) {
		return w(e, n, t, r);
	}
	function M(e, t, n) {
		return w(e, r, t, n);
	}
	function N(e) {
		return o[e.getDay()];
	}
	function ee(e) {
		return a[e.getDay()];
	}
	function P(e) {
		return c[e.getMonth()];
	}
	function te(e) {
		return s[e.getMonth()];
	}
	function ne(e) {
		return i[+(e.getHours() >= 12)];
	}
	function re(e) {
		return 1 + ~~(e.getMonth() / 3);
	}
	function ie(e) {
		return o[e.getUTCDay()];
	}
	function ae(e) {
		return a[e.getUTCDay()];
	}
	function oe(e) {
		return c[e.getUTCMonth()];
	}
	function se(e) {
		return s[e.getUTCMonth()];
	}
	function ce(e) {
		return i[+(e.getUTCHours() >= 12)];
	}
	function le(e) {
		return 1 + ~~(e.getUTCMonth() / 3);
	}
	return {
		format: function(e) {
			var t = S(e += "", y);
			return t.toString = function() {
				return e;
			}, t;
		},
		parse: function(e) {
			var t = C(e += "", !1);
			return t.toString = function() {
				return e;
			}, t;
		},
		utcFormat: function(e) {
			var t = S(e += "", b);
			return t.toString = function() {
				return e;
			}, t;
		},
		utcParse: function(e) {
			var t = C(e += "", !0);
			return t.toString = function() {
				return e;
			}, t;
		}
	};
}
var ny = {
	"-": "",
	_: " ",
	0: "0"
}, ry = /^\s*\d+/, iy = /^%/, ay = /[\\^$*+?|[\]().{}]/g;
function $(e, t, n) {
	var r = e < 0 ? "-" : "", i = (r ? -e : e) + "", a = i.length;
	return r + (a < n ? Array(n - a + 1).join(t) + i : i);
}
function oy(e) {
	return e.replace(ay, "\\$&");
}
function sy(e) {
	return RegExp("^(?:" + e.map(oy).join("|") + ")", "i");
}
function cy(e) {
	return new Map(e.map((e, t) => [e.toLowerCase(), t]));
}
function ly(e, t, n) {
	var r = ry.exec(t.slice(n, n + 1));
	return r ? (e.w = +r[0], n + r[0].length) : -1;
}
function uy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 1));
	return r ? (e.u = +r[0], n + r[0].length) : -1;
}
function dy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.U = +r[0], n + r[0].length) : -1;
}
function fy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.V = +r[0], n + r[0].length) : -1;
}
function py(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.W = +r[0], n + r[0].length) : -1;
}
function my(e, t, n) {
	var r = ry.exec(t.slice(n, n + 4));
	return r ? (e.y = +r[0], n + r[0].length) : -1;
}
function hy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3), n + r[0].length) : -1;
}
function gy(e, t, n) {
	var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(n, n + 6));
	return r ? (e.Z = r[1] ? 0 : -(r[2] + (r[3] || "00")), n + r[0].length) : -1;
}
function _y(e, t, n) {
	var r = ry.exec(t.slice(n, n + 1));
	return r ? (e.q = r[0] * 3 - 3, n + r[0].length) : -1;
}
function vy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.m = r[0] - 1, n + r[0].length) : -1;
}
function yy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.d = +r[0], n + r[0].length) : -1;
}
function by(e, t, n) {
	var r = ry.exec(t.slice(n, n + 3));
	return r ? (e.m = 0, e.d = +r[0], n + r[0].length) : -1;
}
function xy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.H = +r[0], n + r[0].length) : -1;
}
function Sy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.M = +r[0], n + r[0].length) : -1;
}
function Cy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 2));
	return r ? (e.S = +r[0], n + r[0].length) : -1;
}
function wy(e, t, n) {
	var r = ry.exec(t.slice(n, n + 3));
	return r ? (e.L = +r[0], n + r[0].length) : -1;
}
function Ty(e, t, n) {
	var r = ry.exec(t.slice(n, n + 6));
	return r ? (e.L = Math.floor(r[0] / 1e3), n + r[0].length) : -1;
}
function Ey(e, t, n) {
	var r = iy.exec(t.slice(n, n + 1));
	return r ? n + r[0].length : -1;
}
function Dy(e, t, n) {
	var r = ry.exec(t.slice(n));
	return r ? (e.Q = +r[0], n + r[0].length) : -1;
}
function Oy(e, t, n) {
	var r = ry.exec(t.slice(n));
	return r ? (e.s = +r[0], n + r[0].length) : -1;
}
function ky(e, t) {
	return $(e.getDate(), t, 2);
}
function Ay(e, t) {
	return $(e.getHours(), t, 2);
}
function jy(e, t) {
	return $(e.getHours() % 12 || 12, t, 2);
}
function My(e, t) {
	return $(1 + wv.count(Gv(e), e), t, 3);
}
function Ny(e, t) {
	return $(e.getMilliseconds(), t, 3);
}
function Py(e, t) {
	return Ny(e, t) + "000";
}
function Fy(e, t) {
	return $(e.getMonth() + 1, t, 2);
}
function Iy(e, t) {
	return $(e.getMinutes(), t, 2);
}
function Ly(e, t) {
	return $(e.getSeconds(), t, 2);
}
function Ry(e) {
	var t = e.getDay();
	return t === 0 ? 7 : t;
}
function zy(e, t) {
	return $(Ov.count(Gv(e) - 1, e), t, 2);
}
function By(e) {
	var t = e.getDay();
	return t >= 4 || t === 0 ? Mv(e) : Mv.ceil(e);
}
function Vy(e, t) {
	return e = By(e), $(Mv.count(Gv(e), e) + (Gv(e).getDay() === 4), t, 2);
}
function Hy(e) {
	return e.getDay();
}
function Uy(e, t) {
	return $(kv.count(Gv(e) - 1, e), t, 2);
}
function Wy(e, t) {
	return $(e.getFullYear() % 100, t, 2);
}
function Gy(e, t) {
	return e = By(e), $(e.getFullYear() % 100, t, 2);
}
function Ky(e, t) {
	return $(e.getFullYear() % 1e4, t, 4);
}
function qy(e, t) {
	var n = e.getDay();
	return e = n >= 4 || n === 0 ? Mv(e) : Mv.ceil(e), $(e.getFullYear() % 1e4, t, 4);
}
function Jy(e) {
	var t = e.getTimezoneOffset();
	return (t > 0 ? "-" : (t *= -1, "+")) + $(t / 60 | 0, "0", 2) + $(t % 60, "0", 2);
}
function Yy(e, t) {
	return $(e.getUTCDate(), t, 2);
}
function Xy(e, t) {
	return $(e.getUTCHours(), t, 2);
}
function Zy(e, t) {
	return $(e.getUTCHours() % 12 || 12, t, 2);
}
function Qy(e, t) {
	return $(1 + Tv.count(Kv(e), e), t, 3);
}
function $y(e, t) {
	return $(e.getUTCMilliseconds(), t, 3);
}
function eb(e, t) {
	return $y(e, t) + "000";
}
function tb(e, t) {
	return $(e.getUTCMonth() + 1, t, 2);
}
function nb(e, t) {
	return $(e.getUTCMinutes(), t, 2);
}
function rb(e, t) {
	return $(e.getUTCSeconds(), t, 2);
}
function ib(e) {
	var t = e.getUTCDay();
	return t === 0 ? 7 : t;
}
function ab(e, t) {
	return $(Iv.count(Kv(e) - 1, e), t, 2);
}
function ob(e) {
	var t = e.getUTCDay();
	return t >= 4 || t === 0 ? Bv(e) : Bv.ceil(e);
}
function sb(e, t) {
	return e = ob(e), $(Bv.count(Kv(e), e) + (Kv(e).getUTCDay() === 4), t, 2);
}
function cb(e) {
	return e.getUTCDay();
}
function lb(e, t) {
	return $(Lv.count(Kv(e) - 1, e), t, 2);
}
function ub(e, t) {
	return $(e.getUTCFullYear() % 100, t, 2);
}
function db(e, t) {
	return e = ob(e), $(e.getUTCFullYear() % 100, t, 2);
}
function fb(e, t) {
	return $(e.getUTCFullYear() % 1e4, t, 4);
}
function pb(e, t) {
	var n = e.getUTCDay();
	return e = n >= 4 || n === 0 ? Bv(e) : Bv.ceil(e), $(e.getUTCFullYear() % 1e4, t, 4);
}
function mb() {
	return "+0000";
}
function hb() {
	return "%";
}
function gb(e) {
	return +e;
}
function _b(e) {
	return Math.floor(e / 1e3);
}
//#endregion
//#region node_modules/d3-time-format/src/defaultLocale.js
var vb, yb, bb;
xb({
	dateTime: "%x, %X",
	date: "%-m/%-d/%Y",
	time: "%-I:%M:%S %p",
	periods: ["AM", "PM"],
	days: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	shortDays: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	months: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	shortMonths: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	]
});
function xb(e) {
	return vb = ty(e), yb = vb.format, vb.parse, bb = vb.utcFormat, vb.utcParse, vb;
}
//#endregion
//#region node_modules/d3-scale/src/time.js
function Sb(e) {
	return new Date(e);
}
function Cb(e) {
	return e instanceof Date ? +e : +/* @__PURE__ */ new Date(+e);
}
function wb(e, t, n, r, i, a, o, s, c, l) {
	var u = o_(), d = u.invert, f = u.domain, p = l(".%L"), m = l(":%S"), h = l("%I:%M"), g = l("%I %p"), _ = l("%a %d"), v = l("%b %d"), y = l("%B"), b = l("%Y");
	function x(e) {
		return (c(e) < e ? p : s(e) < e ? m : o(e) < e ? h : a(e) < e ? g : r(e) < e ? i(e) < e ? _ : v : n(e) < e ? y : b)(e);
	}
	return u.invert = function(e) {
		return new Date(d(e));
	}, u.domain = function(e) {
		return arguments.length ? f(Array.from(e, Cb)) : f().map(Sb);
	}, u.ticks = function(t) {
		var n = f();
		return e(n[0], n[n.length - 1], t ?? 10);
	}, u.tickFormat = function(e, t) {
		return t == null ? x : l(t);
	}, u.nice = function(e) {
		var n = f();
		return (!e || typeof e.range != "function") && (e = t(n[0], n[n.length - 1], e ?? 10)), e ? f(F_(n, e)) : u;
	}, u.copy = function() {
		return i_(u, wb(e, t, n, r, i, a, o, s, c, l));
	}, u;
}
function Tb() {
	return Ug.apply(wb(Xv, Zv, Gv, Uv, Ov, wv, Sv, bv, yv, yb).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/utcTime.js
function Eb() {
	return Ug.apply(wb(Jv, Yv, Kv, Wv, Iv, Tv, Cv, xv, yv, bb).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/sequential.js
function Db() {
	var e = 0, t = 1, n, r, i, a, o = $g, s = !1, c;
	function l(e) {
		return e == null || isNaN(e = +e) ? c : o(i === 0 ? .5 : (e = (a(e) - n) * i, s ? Math.max(0, Math.min(1, e)) : e));
	}
	l.domain = function(o) {
		return arguments.length ? ([e, t] = o, n = a(e = +e), r = a(t = +t), i = n === r ? 0 : 1 / (r - n), l) : [e, t];
	}, l.clamp = function(e) {
		return arguments.length ? (s = !!e, l) : s;
	}, l.interpolator = function(e) {
		return arguments.length ? (o = e, l) : o;
	};
	function u(e) {
		return function(t) {
			var n, r;
			return arguments.length ? ([n, r] = t, o = e(n, r), l) : [o(0), o(1)];
		};
	}
	return l.range = u(Ft), l.rangeRound = u(It), l.unknown = function(e) {
		return arguments.length ? (c = e, l) : c;
	}, function(o) {
		return a = o, n = o(e), r = o(t), i = n === r ? 0 : 1 / (r - n), l;
	};
}
function Ob(e, t) {
	return t.domain(e.domain()).interpolator(e.interpolator()).clamp(e.clamp()).unknown(e.unknown());
}
function kb() {
	var e = M_(Db()($g));
	return e.copy = function() {
		return Ob(e, kb());
	}, Wg.apply(e, arguments);
}
function Ab() {
	var e = W_(Db()).domain([1, 10]);
	return e.copy = function() {
		return Ob(e, Ab()).base(e.base());
	}, Wg.apply(e, arguments);
}
function jb() {
	var e = J_(Db());
	return e.copy = function() {
		return Ob(e, jb()).constant(e.constant());
	}, Wg.apply(e, arguments);
}
function Mb() {
	var e = $_(Db());
	return e.copy = function() {
		return Ob(e, Mb()).exponent(e.exponent());
	}, Wg.apply(e, arguments);
}
function Nb() {
	return Mb.apply(null, arguments).exponent(.5);
}
//#endregion
//#region node_modules/d3-scale/src/sequentialQuantile.js
function Pb() {
	var e = [], t = $g;
	function n(n) {
		if (n != null && !isNaN(n = +n)) return t((xg(e, n, 1) - 1) / (e.length - 1));
	}
	return n.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(mg), n;
	}, n.interpolator = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.range = function() {
		return e.map((n, r) => t(r / (e.length - 1)));
	}, n.quantiles = function(t) {
		return Array.from({ length: t + 1 }, (n, r) => Bg(e, r / t));
	}, n.copy = function() {
		return Pb(t).domain(e);
	}, Wg.apply(n, arguments);
}
//#endregion
//#region node_modules/d3-scale/src/diverging.js
function Fb() {
	var e = 0, t = .5, n = 1, r = 1, i, a, o, s, c, l = $g, u, d = !1, f;
	function p(e) {
		return isNaN(e = +e) ? f : (e = .5 + ((e = +u(e)) - a) * (r * e < r * a ? s : c), l(d ? Math.max(0, Math.min(1, e)) : e));
	}
	p.domain = function(l) {
		return arguments.length ? ([e, t, n] = l, i = u(e = +e), a = u(t = +t), o = u(n = +n), s = i === a ? 0 : .5 / (a - i), c = a === o ? 0 : .5 / (o - a), r = a < i ? -1 : 1, p) : [
			e,
			t,
			n
		];
	}, p.clamp = function(e) {
		return arguments.length ? (d = !!e, p) : d;
	}, p.interpolator = function(e) {
		return arguments.length ? (l = e, p) : l;
	};
	function m(e) {
		return function(t) {
			var n, r, i;
			return arguments.length ? ([n, r, i] = t, l = Lt(e, [
				n,
				r,
				i
			]), p) : [
				l(0),
				l(.5),
				l(1)
			];
		};
	}
	return p.range = m(Ft), p.rangeRound = m(It), p.unknown = function(e) {
		return arguments.length ? (f = e, p) : f;
	}, function(l) {
		return u = l, i = l(e), a = l(t), o = l(n), s = i === a ? 0 : .5 / (a - i), c = a === o ? 0 : .5 / (o - a), r = a < i ? -1 : 1, p;
	};
}
function Ib() {
	var e = M_(Fb()($g));
	return e.copy = function() {
		return Ob(e, Ib());
	}, Wg.apply(e, arguments);
}
function Lb() {
	var e = W_(Fb()).domain([
		.1,
		1,
		10
	]);
	return e.copy = function() {
		return Ob(e, Lb()).base(e.base());
	}, Wg.apply(e, arguments);
}
function Rb() {
	var e = J_(Fb());
	return e.copy = function() {
		return Ob(e, Rb()).constant(e.constant());
	}, Wg.apply(e, arguments);
}
function zb() {
	var e = $_(Fb());
	return e.copy = function() {
		return Ob(e, zb()).exponent(e.exponent());
	}, Wg.apply(e, arguments);
}
function Bb() {
	return zb.apply(null, arguments).exponent(.5);
}
//#endregion
//#region node_modules/victory-vendor/es/d3-scale.js
var Vb = /* @__PURE__ */ c({
	scaleBand: () => qg,
	scaleDiverging: () => Ib,
	scaleDivergingLog: () => Lb,
	scaleDivergingPow: () => zb,
	scaleDivergingSqrt: () => Bb,
	scaleDivergingSymlog: () => Rb,
	scaleIdentity: () => P_,
	scaleImplicit: () => Gg,
	scaleLinear: () => N_,
	scaleLog: () => G_,
	scaleOrdinal: () => Kg,
	scalePoint: () => Yg,
	scalePow: () => ev,
	scaleQuantile: () => av,
	scaleQuantize: () => ov,
	scaleRadial: () => iv,
	scaleSequential: () => kb,
	scaleSequentialLog: () => Ab,
	scaleSequentialPow: () => Mb,
	scaleSequentialQuantile: () => Pb,
	scaleSequentialSqrt: () => Nb,
	scaleSequentialSymlog: () => jb,
	scaleSqrt: () => tv,
	scaleSymlog: () => Y_,
	scaleThreshold: () => sv,
	scaleTime: () => Tb,
	scaleUtc: () => Eb,
	tickFormat: () => j_
});
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineConfiguredScale.js
function Hb(e) {
	var t = Vb;
	if (e in t && typeof t[e] == "function") return t[e]();
	var n = `scale${hr(e)}`;
	if (n in t && typeof t[n] == "function") return t[n]();
}
function Ub(e, t, n) {
	if (typeof e == "function") return e.copy().domain(t).range(n);
	if (e != null) {
		var r = Hb(e);
		if (r != null) return r.domain(t).range(n), r;
	}
}
function Wb(e, t, n, r) {
	if (n != null && r != null) return typeof e.scale == "function" ? Ub(e.scale, n, r) : Ub(t, n, r);
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineRealScaleType.js
function Gb(e) {
	return `scale${hr(e)}`;
}
function Kb(e) {
	return Gb(e) in Vb;
}
var qb = (e, t, n) => {
	if (e != null) {
		var r = e.scale, i = e.type;
		if (r === "auto") return i === "category" && n && (n.indexOf("LineChart") >= 0 || n.indexOf("AreaChart") >= 0 || n.indexOf("ComposedChart") >= 0 && !t) ? "point" : i === "category" ? "band" : "linear";
		if (typeof r == "string") return Kb(r) ? r : "point";
	}
};
//#endregion
//#region node_modules/recharts/es6/util/scale/createCategoricalInverse.js
function Jb(e, t) {
	for (var n = 0, r = e.length, i = e[0] < e[e.length - 1]; n < r;) {
		var a = Math.floor((n + r) / 2);
		(i ? e[a] < t : e[a] > t) ? n = a + 1 : r = a;
	}
	return n;
}
function Yb(e, t) {
	if (e) {
		var n = t ?? e.domain(), r = n.map((t) => e(t) ?? 0), i = e.range();
		if (!(n.length === 0 || i.length < 2)) return (e) => {
			var t = Jb(r, e);
			if (t <= 0) return n[0];
			if (t >= n.length) return n[n.length - 1];
			var i = r[t - 1] ?? 0, a = r[t] ?? 0;
			return Math.abs(e - i) <= Math.abs(e - a) ? n[t - 1] : n[t];
		};
	}
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineInverseScaleFunction.js
function Xb(e) {
	if (e != null) return "invert" in e && typeof e.invert == "function" ? e.invert.bind(e) : Yb(e, void 0);
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/axisSelectors.js
function Zb(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Qb(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Zb(Object(n), !0).forEach(function(t) {
			$b(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Zb(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function $b(e, t, n) {
	return (t = ex(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ex(e) {
	var t = tx(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function tx(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function nx(e, t) {
	return sx(e) || ox(e, t) || ix(e, t) || rx();
}
function rx() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ix(e, t) {
	if (e) {
		if (typeof e == "string") return ax(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ax(e, t) : void 0;
	}
}
function ax(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function ox(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function sx(e) {
	if (Array.isArray(e)) return e;
}
var cx = [0, "auto"], lx = {
	allowDataOverflow: !1,
	allowDecimals: !0,
	allowDuplicatedCategory: !0,
	angle: 0,
	dataKey: void 0,
	domain: void 0,
	height: 30,
	hide: !0,
	id: 0,
	includeHidden: !1,
	interval: "preserveEnd",
	minTickGap: 5,
	mirror: !1,
	name: void 0,
	orientation: "bottom",
	padding: {
		left: 0,
		right: 0
	},
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickCount: 5,
	tickFormatter: void 0,
	ticks: void 0,
	type: "category",
	unit: void 0,
	niceTicks: "auto"
}, ux = (e, t) => e.cartesianAxis.xAxis[t], dx = (e, t) => ux(e, t) ?? lx, fx = {
	allowDataOverflow: !1,
	allowDecimals: !0,
	allowDuplicatedCategory: !0,
	angle: 0,
	dataKey: void 0,
	domain: cx,
	hide: !0,
	id: 0,
	includeHidden: !1,
	interval: "preserveEnd",
	minTickGap: 5,
	mirror: !1,
	name: void 0,
	orientation: "left",
	padding: {
		top: 0,
		bottom: 0
	},
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickCount: 5,
	tickFormatter: void 0,
	ticks: void 0,
	type: "number",
	unit: void 0,
	niceTicks: "auto",
	width: 60
}, px = (e, t) => e.cartesianAxis.yAxis[t], mx = (e, t) => px(e, t) ?? fx, hx = {
	domain: [0, "auto"],
	includeHidden: !1,
	reversed: !1,
	allowDataOverflow: !1,
	allowDuplicatedCategory: !1,
	dataKey: void 0,
	id: 0,
	name: "",
	range: [64, 64],
	scale: "auto",
	type: "number",
	unit: ""
}, gx = (e, t) => e.cartesianAxis.zAxis[t] ?? hx, _x = (e, t, n) => {
	switch (t) {
		case "xAxis": return dx(e, n);
		case "yAxis": return mx(e, n);
		case "zAxis": return gx(e, n);
		case "angleAxis": return qh(e, n);
		case "radiusAxis": return Jh(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, vx = (e, t, n) => {
	switch (t) {
		case "xAxis": return dx(e, n);
		case "yAxis": return mx(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, yx = (e, t, n) => {
	switch (t) {
		case "xAxis": return dx(e, n);
		case "yAxis": return mx(e, n);
		case "angleAxis": return qh(e, n);
		case "radiusAxis": return Jh(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, bx = (e) => e.graphicalItems.cartesianItems.some((e) => e.type === "bar") || e.graphicalItems.polarItems.some((e) => e.type === "radialBar");
function xx(e, t) {
	return (n) => {
		switch (e) {
			case "xAxis": return "xAxisId" in n && n.xAxisId === t;
			case "yAxis": return "yAxisId" in n && n.yAxisId === t;
			case "zAxis": return "zAxisId" in n && n.zAxisId === t;
			case "angleAxis": return "angleAxisId" in n && n.angleAxisId === t;
			case "radiusAxis": return "radiusAxisId" in n && n.radiusAxisId === t;
			default: return !1;
		}
	};
}
var Sx = (e) => e.graphicalItems.cartesianItems, Cx = H([ng, rg], xx), wx = (e, t, n) => e.filter(n).filter((e) => t?.includeHidden === !0 || !e.hide), Tx = H([
	Sx,
	_x,
	Cx
], wx, { memoizeOptions: { resultEqualityCheck: cg } }), Ex = H([Tx], (e) => e.filter((e) => e.type === "area" || e.type === "bar").filter(og)), Dx = (e) => e.filter((e) => !("stackId" in e) || e.stackId === void 0), Ox = H([Tx], Dx), kx = (e) => e.map((e) => e.data).filter(Boolean).flat(1), Ax = H([Tx], (e) => e.some((e) => !e.data)), jx = H([Tx], kx, { memoizeOptions: { resultEqualityCheck: cg } }), Mx = (e, t) => {
	var n = t.chartData, r = n === void 0 ? [] : n, i = t.dataStartIndex, a = t.dataEndIndex;
	return e.length > 0 ? e : r.slice(i, a + 1);
}, Nx = H([jx, eh], Mx), Px = (e, t, n) => t?.dataKey == null ? n.length > 0 ? n.map((e) => e.dataKey).flatMap((t) => e.map((e) => ({ value: Ul(e, t) }))) : e.map((e) => ({ value: e })) : e.map((e) => ({ value: Ul(e, t.dataKey) })), Fx = (e, t, n, r, i, a) => {
	var o = r.chartData, s = o === void 0 ? [] : o, c = r.dataStartIndex, l = r.dataEndIndex, u = Px(e, t, n);
	return i && t?.dataKey != null && a.length > 0 ? [...s.slice(c, l + 1).map((e) => ({ value: Ul(e, t.dataKey) })).filter((e) => e.value != null), ...u] : u;
}, Ix = H([
	Nx,
	_x,
	Tx,
	eh,
	Ax,
	jx
], Fx);
function Lx(e) {
	if (sr(e) || e instanceof Date) {
		var t = Number(e);
		if (K(t)) return t;
	}
}
function Rx(e) {
	if (Array.isArray(e)) {
		var t = [Lx(e[0]), Lx(e[1])];
		return lh(t) ? t : void 0;
	}
	var n = Lx(e);
	if (n != null) return [n, n];
}
function zx(e) {
	return e.map(Lx).filter(gr);
}
function Bx(e, t) {
	var n = Lx(e), r = Lx(t);
	return n == null && r == null ? 0 : n == null ? -1 : r == null ? 1 : n - r;
}
var Vx = H([Ix], (e) => e?.map((e) => e.value).sort(Bx));
function Hx(e, t) {
	switch (e) {
		case "xAxis": return t.direction === "x";
		case "yAxis": return t.direction === "y";
		default: return !1;
	}
}
function Ux(e, t, n) {
	if (!n || !n.length) return [];
	var r;
	if (typeof t == "number" && !ar(t)) r = t;
	else if (Array.isArray(t)) {
		var i = zx(t);
		i.length > 0 && (r = Math.max(...i));
	}
	return r == null ? [] : zx(n.flatMap((t) => {
		var n = Ul(e, t.dataKey), i, a;
		if (Array.isArray(n)) {
			var o = nx(n, 2);
			i = o[0], a = o[1];
		} else i = a = n;
		if (K(i) && K(a)) return [r - i, r + a];
	}));
}
var Wx = (e) => yx(e, ug(e), dg(e)), Gx = H([Wx], (e) => e?.dataKey), Kx = H([
	Ex,
	eh,
	Wx
], ag), qx = (e, t, n, r) => {
	var i = t.reduce((e, t) => {
		if (t.stackId == null) return e;
		var n = e[t.stackId];
		return n ??= [], n.push(t), e[t.stackId] = n, e;
	}, {});
	return Object.fromEntries(Object.entries(i).map((t) => {
		var i = nx(t, 2), a = i[0], o = i[1], s = r ? [...o].reverse() : o;
		return [a, {
			stackedData: Yl(e, s.map(ig), n),
			graphicalItems: s
		}];
	}));
}, Jx = H([
	Kx,
	Ex,
	kh,
	Ah
], qx), Yx = (e, t, n, r) => {
	var i = t.dataStartIndex, a = t.dataEndIndex;
	if (r == null && n !== "zAxis") return $l(e, i, a);
}, Xx = H([_x], (e) => e.allowDataOverflow), Zx = (e) => {
	if (e == null || !("domain" in e)) return cx;
	if (e.domain != null) return e.domain;
	if ("ticks" in e && e.ticks != null) {
		if (e.type === "number") {
			var t = zx(e.ticks);
			return [Math.min(...t), Math.max(...t)];
		}
		if (e.type === "category") return e.ticks.map(String);
	}
	return e?.domain ?? cx;
}, Qx = H([_x], Zx), $x = H([Qx, Xx], dh), eS = H([
	Jx,
	Qm,
	ng,
	$x
], Yx, { memoizeOptions: { resultEqualityCheck: sg } }), tS = (e) => e.errorBars, nS = (e, t, n) => e.flatMap((e) => t[e.id]).filter(Boolean).filter((e) => Hx(n, e)), rS = function() {
	var e = [...arguments].filter(Boolean);
	if (e.length !== 0) {
		var t = e.flat();
		return [Math.min(...t), Math.max(...t)];
	}
}, iS = function(e, t, n, r, i) {
	var a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : [], o, s;
	if (n.length > 0 && n.forEach((e) => {
		var n = e.data == null ? a : [...e.data], c = r[e.id]?.filter((e) => Hx(i, e));
		n.forEach((n) => {
			var r = Ul(n, t.dataKey ?? e.dataKey), i = Ux(n, r, c);
			if (i.length >= 2) {
				var a = Math.min(...i), l = Math.max(...i);
				(o == null || a < o) && (o = a), (s == null || l > s) && (s = l);
			}
			var u = Rx(r);
			u != null && (o = o == null ? u[0] : Math.min(o, u[0]), s = s == null ? u[1] : Math.max(s, u[1]));
		});
	}), t?.dataKey != null && n.length === 0 && e.forEach((e) => {
		var n = Rx(Ul(e, t.dataKey));
		n != null && (o = o == null ? n[0] : Math.min(o, n[0]), s = s == null ? n[1] : Math.max(s, n[1]));
	}), K(o) && K(s)) return [o, s];
}, aS = H([
	Nx,
	_x,
	Ox,
	tS,
	ng,
	th
], iS, { memoizeOptions: { resultEqualityCheck: sg } });
function oS(e) {
	var t = e.value;
	if (sr(t) || t instanceof Date) return t;
}
var sS = (e, t, n) => {
	var r = e.map(oS).filter((e) => e != null);
	return n && (t.dataKey == null || t.allowDuplicatedCategory && dr(r)) ? Zm(0, e.length) : t.allowDuplicatedCategory ? r : Array.from(new Set(r));
}, cS = (e) => e.referenceElements.dots, lS = (e, t, n) => e.filter((e) => e.ifOverflow === "extendDomain").filter((e) => t === "xAxis" ? e.xAxisId === n : e.yAxisId === n), uS = H([
	cS,
	ng,
	rg
], lS), dS = (e) => e.referenceElements.areas, fS = H([
	dS,
	ng,
	rg
], lS), pS = (e) => e.referenceElements.lines, mS = H([
	pS,
	ng,
	rg
], lS), hS = (e, t) => {
	if (e != null) {
		var n = zx(e.map((e) => t === "xAxis" ? e.x : e.y));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, gS = H(uS, ng, hS), _S = (e, t) => {
	if (e != null) {
		var n = zx(e.flatMap((e) => [t === "xAxis" ? e.x1 : e.y1, t === "xAxis" ? e.x2 : e.y2]));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, vS = H([fS, ng], _S);
function yS(e) {
	if (e.x != null) return zx([e.x]);
	var t = e.segment?.map((e) => e.x);
	return t == null || t.length === 0 ? [] : zx(t);
}
function bS(e) {
	if (e.y != null) return zx([e.y]);
	var t = e.segment?.map((e) => e.y);
	return t == null || t.length === 0 ? [] : zx(t);
}
var xS = (e, t) => {
	if (e != null) {
		var n = e.flatMap((e) => t === "xAxis" ? yS(e) : bS(e));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, SS = H(gS, H([mS, ng], xS), vS, (e, t, n) => rS(e, n, t)), CS = (e, t, n, r, i, a, o, s, c) => {
	if (n != null) return n;
	var l = o === "vertical" && s === "xAxis" || o === "horizontal" && s === "yAxis" ? rS(r, a, i) : rS(a, i), u = fh(t, l, e.allowDataOverflow);
	return u == null && e.allowDataOverflow && l == null && c != null ? c : u;
}, wS = H([
	_x,
	Qx,
	$x,
	eS,
	aS,
	SS,
	dd,
	ng,
	H([_x], (e) => {
		if (e != null && e.type === "number" && "ticks" in e && e.ticks != null) {
			var t = zx(e.ticks);
			if (t.length !== 0) return [Math.min(...t), Math.max(...t)];
		}
	}, { memoizeOptions: { resultEqualityCheck: sg } })
], CS, { memoizeOptions: { resultEqualityCheck: sg } }), TS = [0, 1], ES = (e, t, n, r, i, a, o) => {
	if (e != null && n != null && n.length !== 0 || o !== void 0) {
		var s = e.dataKey, c = e.type, l = Gl(t, a);
		return l && s == null ? Zm(0, n?.length ?? 0) : c === "category" ? sS(r, e, l) : i === "expand" && !l ? TS : o;
	}
}, DS = H([
	_x,
	dd,
	Nx,
	Ix,
	kh,
	ng,
	wS
], ES), OS = H([
	_x,
	bx,
	jh
], qb), kS = (e, t, n) => {
	var r = t.niceTicks;
	if (r !== "none") {
		var i = Zx(t), a = Array.isArray(i) && (i[0] === "auto" || i[1] === "auto");
		if ((r === "snap125" || r === "adaptive") && t != null && t.tickCount && lh(e)) {
			if (a) return Eh(e, t.tickCount, t.allowDecimals, r);
			if (t.type === "number") return Dh(e, t.tickCount, t.allowDecimals, r);
		}
		if (r === "auto" && n === "linear" && t != null && t.tickCount) {
			if (a && lh(e)) return Eh(e, t.tickCount, t.allowDecimals, "adaptive");
			if (t.type === "number" && lh(e)) return Dh(e, t.tickCount, t.allowDecimals, "adaptive");
		}
	}
}, AS = H([
	DS,
	yx,
	OS
], kS), jS = (e, t, n, r) => {
	if (r !== "angleAxis" && e?.type === "number" && lh(t) && Array.isArray(n) && n.length > 0) {
		var i = t[0], a = n[0] ?? 0, o = t[1], s = n[n.length - 1] ?? 0;
		return [Math.min(i, a), Math.max(o, s)];
	}
	return t;
}, MS = H([
	_x,
	DS,
	AS,
	ng
], jS), NS = H(H(Ix, _x, (e, t) => {
	if (t && t.type === "number") {
		var n = Infinity, r = Array.from(zx(e.map((e) => e.value))).sort((e, t) => e - t), i = r[0], a = r[r.length - 1];
		if (i == null || a == null) return Infinity;
		var o = a - i;
		if (o === 0) return Infinity;
		for (var s = 0; s < r.length - 1; s++) {
			var c = r[s], l = r[s + 1];
			if (c != null && l != null) {
				var u = l - c;
				n = Math.min(n, u);
			}
		}
		return n / o;
	}
}), dd, Oh, Cu, (e, t, n, r, i) => i, (e, t, n, r, i) => {
	if (!K(e)) return 0;
	var a = t === "vertical" ? r.height : r.width;
	if (i === "gap") return e * a / 2;
	if (i === "no-gap") {
		var o = ur(n, e * a), s = e * a / 2;
		return s - o - (s - o) / a * o;
	}
	return 0;
}), PS = (e, t, n) => {
	var r = dx(e, t);
	return r == null || typeof r.padding != "string" ? 0 : NS(e, "xAxis", t, n, r.padding);
}, FS = (e, t, n) => {
	var r = mx(e, t);
	return r == null || typeof r.padding != "string" ? 0 : NS(e, "yAxis", t, n, r.padding);
}, IS = H(dx, PS, (e, t) => {
	if (e == null) return {
		left: 0,
		right: 0
	};
	var n = e.padding;
	return typeof n == "string" ? {
		left: t,
		right: t
	} : {
		left: (n.left ?? 0) + t,
		right: (n.right ?? 0) + t
	};
}), LS = H(mx, FS, (e, t) => {
	if (e == null) return {
		top: 0,
		bottom: 0
	};
	var n = e.padding;
	return typeof n == "string" ? {
		top: t,
		bottom: t
	} : {
		top: (n.top ?? 0) + t,
		bottom: (n.bottom ?? 0) + t
	};
}), RS = H([
	Cu,
	IS,
	ku,
	Ou,
	(e, t, n) => n
], (e, t, n, r, i) => {
	var a = r.padding;
	return i ? [a.left, n.width - a.right] : [e.left + t.left, e.left + e.width - t.right];
}), zS = H([
	Cu,
	dd,
	LS,
	ku,
	Ou,
	(e, t, n) => n
], (e, t, n, r, i, a) => {
	var o = i.padding;
	return a ? [r.height - o.bottom, o.top] : t === "horizontal" ? [e.top + e.height - n.bottom, e.top + n.top] : [e.top + n.top, e.top + e.height - n.bottom];
}), BS = (e, t, n, r) => {
	switch (t) {
		case "xAxis": return RS(e, n, r);
		case "yAxis": return zS(e, n, r);
		case "zAxis": return gx(e, n)?.range;
		case "angleAxis": return $h(e);
		case "radiusAxis": return eg(e, n);
		default: return;
	}
}, VS = H([_x, BS], Rh), HS = H([
	_x,
	OS,
	H([OS, MS], pg),
	VS
], Wb), US = (e, t, n, r) => {
	if (n != null && n.dataKey != null) {
		var i = n.type, a = n.scale;
		if (Gl(e, r) && (i === "number" || a !== "auto")) return t.map((e) => e.value);
	}
}, WS = H([
	dd,
	Ix,
	yx,
	ng
], US), GS = H([HS], fg);
H([HS], Xb), H([HS, Vx], Yb), H([
	Tx,
	tS,
	ng
], nS);
function KS(e, t) {
	return e.id < t.id ? -1 : +(e.id > t.id);
}
var qS = (e, t) => t, JS = (e, t, n) => n, YS = H(uu, qS, JS, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(KS)), XS = H(du, qS, JS, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(KS)), ZS = (e, t) => {
	var n = typeof t.height == "number" ? t.height : 30;
	return {
		width: e.width,
		height: n
	};
}, QS = (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
}), $S = H(Cu, dx, ZS), eC = (e, t, n) => {
	switch (t) {
		case "top": return e.top;
		case "bottom": return n - e.bottom;
		default: return 0;
	}
}, tC = (e, t, n) => {
	switch (t) {
		case "left": return e.left;
		case "right": return n - e.right;
		default: return 0;
	}
}, nC = H(su, Cu, YS, qS, JS, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = ZS(t, n);
		o ??= eC(t, r, e);
		var c = r === "top" && !i || r === "bottom" && i;
		a[n.id] = o - Number(c) * s.height, o += (c ? -1 : 1) * s.height;
	}), a;
}), rC = H(ou, Cu, XS, qS, JS, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = QS(t, n);
		o ??= tC(t, r, e);
		var c = r === "left" && !i || r === "right" && i;
		a[n.id] = o - Number(c) * s.width, o += (c ? -1 : 1) * s.width;
	}), a;
}), iC = H([
	Cu,
	dx,
	(e, t) => {
		var n = dx(e, t);
		if (n != null) return nC(e, n.orientation, n.mirror);
	},
	(e, t) => t
], (e, t, n, r) => {
	if (t != null) {
		var i = n?.[r];
		return i == null ? {
			x: e.left,
			y: 0
		} : {
			x: e.left,
			y: i
		};
	}
}), aC = H([
	Cu,
	mx,
	(e, t) => {
		var n = mx(e, t);
		if (n != null) return rC(e, n.orientation, n.mirror);
	},
	(e, t) => t
], (e, t, n, r) => {
	if (t != null) {
		var i = n?.[r];
		return i == null ? {
			x: 0,
			y: e.top
		} : {
			x: i,
			y: e.top
		};
	}
}), oC = H(Cu, mx, (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
})), sC = (e, t, n, r) => {
	if (n != null) {
		var i = n.allowDuplicatedCategory, a = n.type, o = n.dataKey, s = Gl(e, r), c = t.map((e) => e.value), l = c.filter((e) => e != null);
		if (o && s && a === "category" && i && dr(l)) return c;
	}
}, cC = H([
	dd,
	Ix,
	_x,
	ng
], sC), lC = H([
	dd,
	vx,
	OS,
	GS,
	cC,
	WS,
	BS,
	AS,
	ng
], (e, t, n, r, i, a, o, s, c) => {
	if (t != null) {
		var l = Gl(e, c);
		return {
			angle: t.angle,
			interval: t.interval,
			minTickGap: t.minTickGap,
			orientation: t.orientation,
			tick: t.tick,
			tickCount: t.tickCount,
			tickFormatter: t.tickFormatter,
			ticks: t.ticks,
			type: t.type,
			unit: t.unit,
			axisType: c,
			categoricalDomain: a,
			duplicateDomain: i,
			isCategorical: l,
			niceTicks: s,
			range: o,
			realScaleType: n,
			scale: r
		};
	}
}), uC = H([
	dd,
	yx,
	OS,
	GS,
	AS,
	BS,
	cC,
	WS,
	ng
], (e, t, n, r, i, a, o, s, c) => {
	if (t != null && r != null) {
		var l = Gl(e, c), u = t.type, d = t.ticks, f = t.tickCount, p = n === "scaleBand" && typeof r.bandwidth == "function" ? r.bandwidth() / 2 : 2, m = u === "category" && r.bandwidth ? r.bandwidth() / p : 0;
		m = c === "angleAxis" && a != null && a.length >= 2 ? ir(a[0] - a[1]) * 2 * m : m;
		var h = d || i;
		return h ? h.map((e, t) => {
			var n = o ? o.indexOf(e) : e, i = r.map(n);
			return K(i) ? {
				index: t,
				coordinate: i + m,
				value: e,
				offset: m
			} : null;
		}).filter(gr) : l && s ? s.map((e, t) => {
			var n = r.map(e);
			return K(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(gr) : r.ticks ? r.ticks(f).map((e, t) => {
			var n = r.map(e);
			return K(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(gr) : r.domain().map((e, t) => {
			var n = r.map(e);
			return K(n) ? {
				coordinate: n + m,
				value: o ? o[e] : e,
				index: t,
				offset: m
			} : null;
		}).filter(gr);
	}
}), dC = H([
	dd,
	yx,
	GS,
	BS,
	cC,
	WS,
	ng
], (e, t, n, r, i, a, o) => {
	if (t != null && n != null && r != null && r[0] !== r[1]) {
		var s = Gl(e, o), c = t.tickCount, l = 0;
		return l = o === "angleAxis" && r?.length >= 2 ? ir(r[0] - r[1]) * 2 * l : l, s && a ? a.map((e, t) => {
			var r = n.map(e);
			return K(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(gr) : n.ticks ? n.ticks(c).map((e, t) => {
			var r = n.map(e);
			return K(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(gr) : n.domain().map((e, t) => {
			var r = n.map(e);
			return K(r) ? {
				coordinate: r + l,
				value: i ? i[e] : e,
				index: t,
				offset: l
			} : null;
		}).filter(gr);
	}
}), fC = H(_x, GS, (e, t) => {
	if (e != null && t != null) return Qb(Qb({}, e), {}, { scale: t });
});
H((e, t, n) => gx(e, n), H([H([
	_x,
	OS,
	DS,
	VS
], Wb)], fg), (e, t) => {
	if (e != null && t != null) return Qb(Qb({}, e), {}, { scale: t });
});
var pC = H([
	dd,
	uu,
	du
], (e, t, n) => {
	switch (e) {
		case "horizontal": return t.some((e) => e.reversed) ? "right-to-left" : "left-to-right";
		case "vertical": return n.some((e) => e.reversed) ? "bottom-to-top" : "top-to-bottom";
		case "centric":
		case "radial": return "left-to-right";
		default: return;
	}
});
H([(e, t, n) => e.renderedTicks[t]?.[n]], (e) => {
	if (e && e.length !== 0) return (t) => {
		var n = Infinity, r = e[0];
		for (var i of e) {
			var a = Math.abs(i.coordinate - t);
			a < n && (n = a, r = i);
		}
		return r?.value;
	};
});
//#endregion
//#region node_modules/recharts/es6/state/selectors/selectTooltipEventType.js
var mC = (e) => e.options.defaultTooltipEventType, hC = (e) => e.options.validateTooltipEventTypes;
function gC(e, t, n) {
	if (e == null) return t;
	var r = e ? "axis" : "item";
	return n == null ? t : n.includes(r) ? r : t;
}
function _C(e, t) {
	return gC(t, mC(e), hC(e));
}
function vC(e) {
	return V((t) => _C(t, e));
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineActiveLabel.js
var yC = (e, t) => {
	var n, r = Number(t);
	if (!(ar(r) || t == null)) return r >= 0 ? e == null || (n = e[r]) == null ? void 0 : n.value : void 0;
}, bC = (e) => e.tooltip.settings, xC = {
	active: !1,
	index: null,
	dataKey: void 0,
	graphicalItemId: void 0,
	coordinate: void 0
}, SC = Vc({
	name: "tooltip",
	initialState: {
		itemInteraction: {
			click: xC,
			hover: xC
		},
		axisInteraction: {
			click: xC,
			hover: xC
		},
		keyboardInteraction: xC,
		syncInteraction: {
			active: !1,
			index: null,
			dataKey: void 0,
			label: void 0,
			coordinate: void 0,
			sourceViewBox: void 0,
			graphicalItemId: void 0
		},
		tooltipItemPayloads: [],
		settings: {
			shared: void 0,
			trigger: "hover",
			axisId: 0,
			active: !1,
			defaultIndex: void 0
		}
	},
	reducers: {
		addTooltipEntrySettings: {
			reducer(e, t) {
				e.tooltipItemPayloads.push(G(t.payload));
			},
			prepare: Ec()
		},
		replaceTooltipEntrySettings: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = fc(e).tooltipItemPayloads.indexOf(G(r));
				a > -1 && (e.tooltipItemPayloads[a] = G(i));
			},
			prepare: Ec()
		},
		removeTooltipEntrySettings: {
			reducer(e, t) {
				var n = fc(e).tooltipItemPayloads.indexOf(G(t.payload));
				n > -1 && e.tooltipItemPayloads.splice(n, 1);
			},
			prepare: Ec()
		},
		setTooltipSettingsState(e, t) {
			e.settings = t.payload;
		},
		setActiveMouseOverItemIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.keyboardInteraction.active = !1, e.itemInteraction.hover.active = !0, e.itemInteraction.hover.index = t.payload.activeIndex, e.itemInteraction.hover.dataKey = t.payload.activeDataKey, e.itemInteraction.hover.graphicalItemId = t.payload.activeGraphicalItemId, e.itemInteraction.hover.coordinate = t.payload.activeCoordinate;
		},
		mouseLeaveChart(e) {
			e.itemInteraction.hover.active = !1, e.axisInteraction.hover.active = !1;
		},
		mouseLeaveItem(e) {
			e.itemInteraction.hover.active = !1;
		},
		setActiveClickItemIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.itemInteraction.click.active = !0, e.keyboardInteraction.active = !1, e.itemInteraction.click.index = t.payload.activeIndex, e.itemInteraction.click.dataKey = t.payload.activeDataKey, e.itemInteraction.click.graphicalItemId = t.payload.activeGraphicalItemId, e.itemInteraction.click.coordinate = t.payload.activeCoordinate;
		},
		setMouseOverAxisIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.axisInteraction.hover.active = !0, e.keyboardInteraction.active = !1, e.axisInteraction.hover.index = t.payload.activeIndex, e.axisInteraction.hover.dataKey = t.payload.activeDataKey, e.axisInteraction.hover.coordinate = t.payload.activeCoordinate;
		},
		setMouseClickAxisIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.keyboardInteraction.active = !1, e.axisInteraction.click.active = !0, e.axisInteraction.click.index = t.payload.activeIndex, e.axisInteraction.click.dataKey = t.payload.activeDataKey, e.axisInteraction.click.coordinate = t.payload.activeCoordinate;
		},
		setSyncInteraction(e, t) {
			e.syncInteraction = t.payload;
		},
		setKeyboardInteraction(e, t) {
			e.keyboardInteraction.active = t.payload.active, e.keyboardInteraction.index = t.payload.activeIndex, e.keyboardInteraction.coordinate = t.payload.activeCoordinate;
		}
	}
}), CC = SC.actions, wC = CC.addTooltipEntrySettings, TC = CC.replaceTooltipEntrySettings, EC = CC.removeTooltipEntrySettings, DC = CC.setTooltipSettingsState, OC = CC.setActiveMouseOverItemIndex;
CC.mouseLeaveItem;
var kC = CC.mouseLeaveChart;
CC.setActiveClickItemIndex;
var AC = CC.setMouseOverAxisIndex, jC = CC.setMouseClickAxisIndex, MC = CC.setSyncInteraction, NC = CC.setKeyboardInteraction, PC = SC.reducer;
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
function FC(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function IC(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? FC(Object(n), !0).forEach(function(t) {
			LC(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : FC(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function LC(e, t, n) {
	return (t = RC(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function RC(e) {
	var t = zC(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function zC(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function BC(e, t, n) {
	return t === "axis" ? n === "click" ? e.axisInteraction.click : e.axisInteraction.hover : n === "click" ? e.itemInteraction.click : e.itemInteraction.hover;
}
function VC(e) {
	return e.index != null;
}
var HC = (e, t, n, r) => {
	if (t == null) return xC;
	var i = BC(e, t, n);
	if (i == null) return xC;
	if (i.active) return i;
	if (e.keyboardInteraction.active) return e.keyboardInteraction;
	if (e.syncInteraction.active && e.syncInteraction.index != null) return e.syncInteraction;
	var a = e.settings.active === !0;
	if (VC(i)) {
		if (a) return IC(IC({}, i), {}, { active: !0 });
	} else if (r != null) return {
		active: !0,
		coordinate: void 0,
		dataKey: void 0,
		index: r,
		graphicalItemId: void 0
	};
	return IC(IC({}, xC), {}, { coordinate: i.coordinate });
};
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineActiveTooltipIndex.js
function UC(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : void 0;
	if (e instanceof Date) {
		var t = e.valueOf();
		return Number.isFinite(t) ? t : void 0;
	}
	var n = Number(e);
	return Number.isFinite(n) ? n : void 0;
}
function WC(e, t) {
	var n = UC(e), r = t[0], i = t[1];
	return n !== void 0 && n >= Math.min(r, i) && n <= Math.max(r, i);
}
function GC(e, t, n) {
	if (n == null || t == null) return !0;
	var r = Ul(e, t);
	return r == null || !lh(n) || WC(r, n);
}
var KC = (e, t, n, r) => {
	var i = e?.index;
	if (i == null) return null;
	var a = Number(i);
	if (!K(a)) return i;
	var o = 0, s = Infinity;
	t.length > 0 && (s = t.length - 1);
	var c = Math.max(o, Math.min(a, s)), l = t[c];
	return l == null || GC(l, n, r) ? String(c) : null;
}, qC = (e, t, n, r, i, a, o) => {
	if (a != null) {
		var s = o[0]?.getPosition(a);
		if (s != null) return s;
		var c = i?.[Number(a)];
		if (c) switch (n) {
			case "horizontal": return {
				x: c.coordinate,
				y: (r.top + t) / 2
			};
			default: return {
				x: (r.left + e) / 2,
				y: c.coordinate
			};
		}
	}
}, JC = (e, t, n, r) => {
	if (t === "axis") return e.tooltipItemPayloads;
	if (e.tooltipItemPayloads.length === 0) return [];
	var i = n === "hover" ? e.itemInteraction.hover.graphicalItemId : e.itemInteraction.click.graphicalItemId;
	if (e.syncInteraction.active && i == null) return e.tooltipItemPayloads;
	if (i == null && (r != null || e.keyboardInteraction.active)) {
		var a = e.tooltipItemPayloads[0];
		return a == null ? [] : [a];
	}
	return e.tooltipItemPayloads.filter((e) => e.settings?.graphicalItemId === i);
}, YC = (e) => e.options.tooltipPayloadSearcher, XC = (e) => e.tooltip;
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineTooltipPayload.js
function ZC(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function QC(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ZC(Object(n), !0).forEach(function(t) {
			$C(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ZC(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function $C(e, t, n) {
	return (t = ew(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ew(e) {
	var t = tw(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function tw(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function nw(e) {
	if (typeof e == "string" || typeof e == "number") return e;
}
function rw(e) {
	if (typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
}
function iw(e) {
	if (typeof e == "string" || typeof e == "number") return e;
	if (typeof e == "function") return (t) => e(t);
}
function aw(e) {
	if (typeof e == "string") return e;
}
function ow(e) {
	if (typeof e == "object" && e) return {
		name: "name" in e ? nw(e.name) : void 0,
		unit: "unit" in e ? rw(e.unit) : void 0,
		dataKey: "dataKey" in e ? iw(e.dataKey) : void 0,
		payload: "payload" in e ? e.payload : void 0,
		color: "color" in e ? aw(e.color) : void 0,
		fill: "fill" in e ? aw(e.fill) : void 0
	};
}
function sw(e, t) {
	return e ?? t;
}
var cw = (e, t, n, r, i, a, o) => {
	if (t != null && a != null) {
		var s = n.chartData, c = n.computedData, l = n.dataStartIndex, u = n.dataEndIndex;
		return e.reduce((e, n) => {
			var d = n.dataDefinedOnItem, f = n.settings, p = sw(d, s), m = Array.isArray(p) ? Il(p, l, u) : p, h = f?.dataKey ?? r, g = f?.nameKey, _;
			return r && Array.isArray(m) && !Array.isArray(m[0]) && o === "axis" ? (_ = pr(m, r, i), _ ??= a(m, t, c, g)) : _ = a(m, t, c, g), Array.isArray(_) ? _.forEach((t) => {
				var n = ow(t), r = n?.name, i = n?.dataKey, a = n?.payload, o = QC(QC({}, f), {}, {
					name: r,
					unit: n?.unit,
					color: n?.color ?? f?.color,
					fill: n?.fill ?? f?.fill
				});
				e.push(q({
					tooltipEntrySettings: o,
					dataKey: i,
					payload: a,
					value: Ul(a, i),
					name: r == null ? void 0 : String(r)
				}));
			}) : e.push(q({
				tooltipEntrySettings: f,
				dataKey: h,
				payload: _,
				value: Ul(_, h),
				name: Ul(_, g) ?? f?.name
			})), e;
		}, []);
	}
}, lw = H([
	Wx,
	bx,
	jh
], qb), uw = H([
	H([(e) => e.graphicalItems.cartesianItems, (e) => e.graphicalItems.polarItems], (e, t) => [...e, ...t]),
	Wx,
	H([ug, dg], xx)
], wx, { memoizeOptions: { resultEqualityCheck: cg } }), dw = H([uw], (e) => e.filter(og)), fw = H([uw], kx, { memoizeOptions: { resultEqualityCheck: cg } }), pw = H([uw], (e) => e.some((e) => !e.data)), mw = H([fw, Qm], Mx), hw = H([
	dw,
	Qm,
	Wx
], ag), gw = H([
	mw,
	Wx,
	uw,
	Qm,
	pw,
	fw
], Fx), _w = H([Wx], Zx), vw = H([_w, H([Wx], (e) => e.allowDataOverflow)], dh), yw = H([
	H([
		hw,
		H([uw], (e) => e.filter(og)),
		kh,
		Ah
	], qx),
	Qm,
	ug,
	vw
], Yx), bw = H([
	mw,
	Wx,
	H([uw], Dx),
	tS,
	ug,
	nh
], iS, { memoizeOptions: { resultEqualityCheck: sg } }), xw = H([H([
	cS,
	ug,
	dg
], lS), ug], hS), Sw = H([H([
	dS,
	ug,
	dg
], lS), ug], _S), Cw = H([
	Wx,
	dd,
	mw,
	gw,
	kh,
	ug,
	H([
		Wx,
		_w,
		vw,
		yw,
		bw,
		H([
			xw,
			H([H([
				pS,
				ug,
				dg
			], lS), ug], xS),
			Sw
		], rS),
		dd,
		ug
	], CS)
], ES), ww = H([
	Wx,
	Cw,
	H([
		Cw,
		Wx,
		lw
	], kS),
	ug
], jS), Tw = (e) => BS(e, ug(e), dg(e), !1), Ew = H([Wx, Tw], Rh), Dw = H([H([
	Wx,
	lw,
	ww,
	Ew
], Wb)], fg), Ow = H([
	dd,
	Wx,
	lw,
	Dw,
	Tw,
	H([
		dd,
		gw,
		Wx,
		ug
	], sC),
	H([
		dd,
		gw,
		Wx,
		ug
	], US),
	ug
], (e, t, n, r, i, a, o, s) => {
	if (t) {
		var c = t.type, l = Gl(e, s);
		if (r) {
			var u = n === "scaleBand" && r.bandwidth ? r.bandwidth() / 2 : 2, d = c === "category" && r.bandwidth ? r.bandwidth() / u : 0;
			return d = s === "angleAxis" && i != null && i?.length >= 2 ? ir(i[0] - i[1]) * 2 * d : d, l && o ? o.map((e, t) => {
				var n = r.map(e);
				return K(n) ? {
					coordinate: n + d,
					value: e,
					index: t,
					offset: d
				} : null;
			}).filter(gr) : r.domain().map((e, t) => {
				var n = r.map(e);
				return K(n) ? {
					coordinate: n + d,
					value: a ? a[e] : e,
					index: t,
					offset: d
				} : null;
			}).filter(gr);
		}
	}
}), kw = H([
	mC,
	hC,
	bC
], (e, t, n) => gC(n.shared, e, t)), Aw = (e) => e.tooltip.settings.trigger, jw = (e) => e.tooltip.settings.defaultIndex, Mw = H([
	XC,
	kw,
	Aw,
	jw
], HC), Nw = H([
	Mw,
	mw,
	Gx,
	Cw
], KC), Pw = H([Ow, Nw], yC), Fw = H([Mw], (e) => {
	if (e) return e.dataKey;
}), Iw = H([Mw], (e) => {
	if (e) return e.graphicalItemId;
}), Lw = H([
	XC,
	kw,
	Aw,
	jw
], JC), Rw = H([Mw, H([
	ou,
	su,
	dd,
	Cu,
	Ow,
	jw,
	Lw
], qC)], (e, t) => e != null && e.coordinate ? e.coordinate : t), zw = H([Mw], (e) => e?.active ?? !1), Bw = H([H([
	Lw,
	Nw,
	Qm,
	Gx,
	Pw,
	YC,
	kw
], cw)], (e) => {
	if (e != null) {
		var t = e.map((e) => e.payload).filter((e) => e != null);
		return Array.from(new Set(t));
	}
});
//#endregion
//#region node_modules/recharts/es6/context/useTooltipAxis.js
function Vw(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Hw(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Vw(Object(n), !0).forEach(function(t) {
			Uw(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vw(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Uw(e, t, n) {
	return (t = Ww(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Ww(e) {
	var t = Gw(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Gw(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Kw = () => V(Wx), qw = () => {
	var e = Kw(), t = V(Ow), n = V(Dw);
	return nu(!e || !n ? void 0 : Hw(Hw({}, e), {}, { scale: n }), t);
};
//#endregion
//#region node_modules/recharts/es6/util/getActiveCoordinate.js
function Jw(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Yw(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Jw(Object(n), !0).forEach(function(t) {
			Xw(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Jw(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Xw(e, t, n) {
	return (t = Zw(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Zw(e) {
	var t = Qw(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Qw(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var $w = (e, t, n, r) => {
	var i = t.find((e) => e && e.index === n);
	if (i) {
		if (e === "horizontal") return {
			x: i.coordinate,
			y: r.relativeY
		};
		if (e === "vertical") return {
			x: r.relativeX,
			y: i.coordinate
		};
	}
	return {
		x: 0,
		y: 0
	};
}, eT = (e, t, n, r) => {
	var i = t.find((e) => e && e.index === n);
	if (i) {
		if (e === "centric") {
			var a = i.coordinate, o = r.radius;
			return Yw(Yw(Yw({}, r), Tm(r.cx, r.cy, o, a)), {}, {
				angle: a,
				radius: o
			});
		}
		var s = i.coordinate, c = r.angle;
		return Yw(Yw(Yw({}, r), Tm(r.cx, r.cy, s, c)), {}, {
			angle: c,
			radius: s
		});
	}
	return {
		angle: 0,
		clockWise: !1,
		cx: 0,
		cy: 0,
		endAngle: 0,
		innerRadius: 0,
		outerRadius: 0,
		radius: 0,
		startAngle: 0,
		x: 0,
		y: 0
	};
};
function tT(e, t) {
	var n = e.relativeX, r = e.relativeY;
	return n >= t.left && n <= t.left + t.width && r >= t.top && r <= t.top + t.height;
}
var nT = (e, t, n, r, i) => {
	var a = t?.length ?? 0;
	if (a <= 1 || e == null) return 0;
	if (r === "angleAxis" && i != null && Math.abs(Math.abs(i[1] - i[0]) - 360) <= 1e-6) for (var o = i[1] - i[0], s = (t, n, r) => [
		e,
		e + o,
		e - o
	].some((e) => (r ? e >= t : e > t) && e <= n), c = 0; c < a; c++) {
		var l = c > 0 ? n[c - 1]?.coordinate : n[a - 1]?.coordinate, u = n[c]?.coordinate, d = c >= a - 1 ? n[0]?.coordinate : n[c + 1]?.coordinate, f = void 0;
		if (l != null && u != null && d != null) {
			if (ir(u - l) !== ir(d - u)) {
				var p = [];
				if (ir(d - u) === ir(i[1] - i[0])) {
					f = d;
					var m = u + i[1] - i[0];
					p[0] = Math.min(m, (m + l) / 2), p[1] = Math.max(m, (m + l) / 2);
				} else {
					f = l;
					var h = d + i[1] - i[0];
					p[0] = Math.min(u, (h + u) / 2), p[1] = Math.max(u, (h + u) / 2);
				}
				var g = [Math.min(u, (f + u) / 2), Math.max(u, (f + u) / 2)];
				if (s(g[0], g[1], !1) || s(p[0], p[1], !0)) return n[c]?.index;
			} else {
				var _ = Math.min(l, d), v = Math.max(l, d);
				if (s((_ + u) / 2, (v + u) / 2, !1)) return n[c]?.index;
			}
		}
	}
	else if (t) for (var y = 0; y < a; y++) {
		var b = t[y];
		if (b != null) {
			var x = t[y + 1], S = t[y - 1];
			if (y === 0 && x != null && e <= (b.coordinate + x.coordinate) / 2 || y === a - 1 && S != null && e > (b.coordinate + S.coordinate) / 2 || y > 0 && y < a - 1 && S != null && x != null && e > (b.coordinate + S.coordinate) / 2 && e <= (b.coordinate + x.coordinate) / 2) return b.index;
		}
	}
	return -1;
}, rT = () => V(jh), iT = (e, t) => t, aT = (e, t, n) => n, oT = (e, t, n, r) => r, sT = H(Ow, (e) => To(e, (e) => e.coordinate)), cT = H([
	XC,
	iT,
	aT,
	oT
], HC), lT = H([
	cT,
	mw,
	Gx,
	Cw
], KC), uT = (e, t, n) => {
	if (t != null) {
		var r = XC(e);
		return t === "axis" ? n === "hover" ? r.axisInteraction.hover.dataKey : r.axisInteraction.click.dataKey : n === "hover" ? r.itemInteraction.hover.dataKey : r.itemInteraction.click.dataKey;
	}
}, dT = H([
	XC,
	iT,
	aT,
	oT
], JC), fT = H([
	ou,
	su,
	dd,
	Cu,
	Ow,
	oT,
	dT
], qC), pT = H([cT, fT], (e, t) => e.coordinate ?? t), mT = H([Ow, lT], yC), hT = H([
	dT,
	lT,
	Qm,
	Gx,
	mT,
	YC,
	iT
], cw), gT = H([cT, lT], (e, t) => ({
	isActive: e.active && t != null,
	activeIndex: t
})), _T = (e, t, n, r, i, a, o) => {
	if (e && n && r && i && tT(e, o)) {
		var s = nT(iu(e, t), a, i, n, r), c = $w(t, i, s, e);
		return {
			activeIndex: String(s),
			activeCoordinate: c
		};
	}
}, vT = (e, t, n, r, i, a, o) => {
	if (e && r && i && a && n) {
		var s = jm(e, n);
		if (s) {
			var c = nT(au(s, t), o, a, r, i), l = eT(t, a, c, s);
			return {
				activeIndex: String(c),
				activeCoordinate: l
			};
		}
	}
}, yT = (e, t, n, r, i, a, o, s) => {
	if (e && t && r && i && a) return t === "horizontal" || t === "vertical" ? _T(e, t, r, i, a, o, s) : vT(e, t, n, r, i, a, o);
}, bT = H((e) => e.zIndex.zIndexMap, (e, t) => t, (e, t, n) => n, (e, t, n) => {
	if (t != null) {
		var r = e[t];
		if (r != null) return n ? r.panoramaElement : r.element;
	}
}), xT = H((e) => e.zIndex.zIndexMap, (e) => {
	var t = Object.keys(e).map((e) => parseInt(e, 10)).concat(Object.values(Fh));
	return Array.from(new Set(t)).sort((e, t) => e - t);
}, { memoizeOptions: { resultEqualityCheck: lg } });
//#endregion
//#region node_modules/recharts/es6/state/zIndexSlice.js
function ST(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function CT(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ST(Object(n), !0).forEach(function(t) {
			wT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ST(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function wT(e, t, n) {
	return (t = TT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function TT(e) {
	var t = ET(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ET(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var DT = { zIndexMap: Object.values(Fh).reduce((e, t) => CT(CT({}, e), {}, { [t]: {
	element: void 0,
	panoramaElement: void 0,
	consumers: 0
} }), {}) }, OT = new Set(Object.values(Fh));
function kT(e) {
	return OT.has(e);
}
var AT = Vc({
	name: "zIndex",
	initialState: DT,
	reducers: {
		registerZIndexPortal: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] ? e.zIndexMap[n].consumers += 1 : e.zIndexMap[n] = {
					consumers: 1,
					element: void 0,
					panoramaElement: void 0
				};
			},
			prepare: Ec()
		},
		unregisterZIndexPortal: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] && (--e.zIndexMap[n].consumers, e.zIndexMap[n].consumers <= 0 && !kT(n) && delete e.zIndexMap[n]);
			},
			prepare: Ec()
		},
		registerZIndexPortalElement: {
			reducer: (e, t) => {
				var n = t.payload, r = n.zIndex, i = n.element, a = n.isPanorama;
				e.zIndexMap[r] ? a ? e.zIndexMap[r].panoramaElement = G(i) : e.zIndexMap[r].element = G(i) : e.zIndexMap[r] = {
					consumers: 0,
					element: a ? void 0 : G(i),
					panoramaElement: a ? G(i) : void 0
				};
			},
			prepare: Ec()
		},
		unregisterZIndexPortalElement: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] && (t.payload.isPanorama ? e.zIndexMap[n].panoramaElement = void 0 : e.zIndexMap[n].element = void 0);
			},
			prepare: Ec()
		}
	}
}), jT = AT.actions, MT = jT.registerZIndexPortal, NT = jT.unregisterZIndexPortal, PT = jT.registerZIndexPortalElement, FT = jT.unregisterZIndexPortalElement, IT = AT.reducer, LT = g();
function RT(e) {
	var t = e.zIndex, n = e.children, r = hd() && t !== void 0 && t !== 0, i = Du(), a = (0, y.useRef)(void 0), o = (0, y.useRef)(/* @__PURE__ */ new Set()), s = $a(), c = V((e) => bT(e, t, i));
	if ((0, y.useLayoutEffect)(() => {
		if (!r) {
			var e = o.current;
			e.forEach((e) => {
				s(NT({ zIndex: e }));
			}), e.clear(), a.current = void 0;
		} else if (o.current.has(t) || (s(MT({ zIndex: t })), o.current.add(t)), c) {
			a.current = c;
			var n = o.current;
			n.forEach((e) => {
				e !== t && (s(NT({ zIndex: e })), n.delete(e));
			});
		}
	}, [
		s,
		t,
		r,
		c
	]), (0, y.useLayoutEffect)(() => {
		var e = o.current;
		return () => {
			e.forEach((e) => {
				s(NT({ zIndex: e }));
			}), e.clear();
		};
	}, [s]), !r) return n;
	var l = c ?? a.current;
	return l ? /*#__PURE__*/ (0, LT.createPortal)(n, l) : null;
}
//#endregion
//#region node_modules/recharts/es6/component/Cursor.js
function zT() {
	return zT = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, zT.apply(null, arguments);
}
function BT(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function VT(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? BT(Object(n), !0).forEach(function(t) {
			HT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : BT(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function HT(e, t, n) {
	return (t = UT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function UT(e) {
	var t = WT(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function WT(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function GT(e) {
	var t = e.cursor, n = e.cursorComp, r = e.cursorProps;
	return /*#__PURE__*/ (0, y.isValidElement)(t) ? /*#__PURE__*/ (0, y.cloneElement)(t, r) : /*#__PURE__*/ (0, y.createElement)(n, r);
}
function KT(e) {
	var t = e.coordinate, n = e.payload, r = e.index, i = e.offset, a = e.tooltipAxisBandSize, o = e.layout, s = e.cursor, c = e.tooltipEventType, l = e.chartName, u = t, d = n, f = r;
	if (!s || !u || l !== "ScatterChart" && c !== "axis") return null;
	var p, m, h;
	if (l === "ScatterChart") p = u, m = ip, h = Fh.cursorLine;
	else if (l === "BarChart") p = ap(o, u, i, a), m = _m, h = Fh.cursorRectangle;
	else if (o === "radial" && Di(u)) {
		var g = Mm(u), _ = g.cx, v = g.cy, b = g.radius;
		p = {
			cx: _,
			cy: v,
			startAngle: g.startAngle,
			endAngle: g.endAngle,
			innerRadius: b,
			outerRadius: b
		}, m = qm, h = Fh.cursorLine;
	} else p = { points: Jm(o, u, i) }, m = qf, h = Fh.cursorLine;
	var x = typeof s == "object" && "className" in s ? s.className : void 0, S = VT(VT(VT(VT({
		stroke: "#ccc",
		pointerEvents: "none"
	}, i), p), Mn(s)), {}, {
		payload: d,
		payloadIndex: f,
		className: Tn("recharts-tooltip-cursor", x)
	});
	return /*#__PURE__*/ y.createElement(RT, { zIndex: e.zIndex ?? h }, /*#__PURE__*/ y.createElement(GT, {
		cursor: s,
		cursorComp: m,
		cursorProps: S
	}));
}
function qT(e) {
	var t = qw(), n = cd(), r = fd(), i = rT();
	return t == null || n == null || r == null || i == null ? null : /*#__PURE__*/ y.createElement(KT, zT({}, e, {
		offset: n,
		layout: r,
		tooltipAxisBandSize: t,
		chartName: i
	}));
}
//#endregion
//#region node_modules/recharts/es6/context/tooltipPortalContext.js
var JT = /*#__PURE__*/ (0, y.createContext)(null), YT = () => (0, y.useContext)(JT), XT = (/* @__PURE__ */ u((/* @__PURE__ */ s(((e, t) => {
	var n = Object.prototype.hasOwnProperty, r = "~";
	function i() {}
	Object.create && (i.prototype = Object.create(null), new i().__proto__ || (r = !1));
	function a(e, t, n) {
		this.fn = e, this.context = t, this.once = n || !1;
	}
	function o(e, t, n, i, o) {
		if (typeof n != "function") throw TypeError("The listener must be a function");
		var s = new a(n, i || e, o), c = r ? r + t : t;
		return e._events[c] ? e._events[c].fn ? e._events[c] = [e._events[c], s] : e._events[c].push(s) : (e._events[c] = s, e._eventsCount++), e;
	}
	function s(e, t) {
		--e._eventsCount === 0 ? e._events = new i() : delete e._events[t];
	}
	function c() {
		this._events = new i(), this._eventsCount = 0;
	}
	c.prototype.eventNames = function() {
		var e = [], t, i;
		if (this._eventsCount === 0) return e;
		for (i in t = this._events) n.call(t, i) && e.push(r ? i.slice(1) : i);
		return Object.getOwnPropertySymbols ? e.concat(Object.getOwnPropertySymbols(t)) : e;
	}, c.prototype.listeners = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		if (!n) return [];
		if (n.fn) return [n.fn];
		for (var i = 0, a = n.length, o = Array(a); i < a; i++) o[i] = n[i].fn;
		return o;
	}, c.prototype.listenerCount = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		return n ? n.fn ? 1 : n.length : 0;
	}, c.prototype.emit = function(e, t, n, i, a, o) {
		var s = r ? r + e : e;
		if (!this._events[s]) return !1;
		var c = this._events[s], l = arguments.length, u, d;
		if (c.fn) {
			switch (c.once && this.removeListener(e, c.fn, void 0, !0), l) {
				case 1: return c.fn.call(c.context), !0;
				case 2: return c.fn.call(c.context, t), !0;
				case 3: return c.fn.call(c.context, t, n), !0;
				case 4: return c.fn.call(c.context, t, n, i), !0;
				case 5: return c.fn.call(c.context, t, n, i, a), !0;
				case 6: return c.fn.call(c.context, t, n, i, a, o), !0;
			}
			for (d = 1, u = Array(l - 1); d < l; d++) u[d - 1] = arguments[d];
			c.fn.apply(c.context, u);
		} else {
			var f = c.length, p;
			for (d = 0; d < f; d++) switch (c[d].once && this.removeListener(e, c[d].fn, void 0, !0), l) {
				case 1:
					c[d].fn.call(c[d].context);
					break;
				case 2:
					c[d].fn.call(c[d].context, t);
					break;
				case 3:
					c[d].fn.call(c[d].context, t, n);
					break;
				case 4:
					c[d].fn.call(c[d].context, t, n, i);
					break;
				default:
					if (!u) for (p = 1, u = Array(l - 1); p < l; p++) u[p - 1] = arguments[p];
					c[d].fn.apply(c[d].context, u);
			}
		}
		return !0;
	}, c.prototype.on = function(e, t, n) {
		return o(this, e, t, n, !1);
	}, c.prototype.once = function(e, t, n) {
		return o(this, e, t, n, !0);
	}, c.prototype.removeListener = function(e, t, n, i) {
		var a = r ? r + e : e;
		if (!this._events[a]) return this;
		if (!t) return s(this, a), this;
		var o = this._events[a];
		if (o.fn) o.fn === t && (!i || o.once) && (!n || o.context === n) && s(this, a);
		else {
			for (var c = 0, l = [], u = o.length; c < u; c++) (o[c].fn !== t || i && !o[c].once || n && o[c].context !== n) && l.push(o[c]);
			l.length ? this._events[a] = l.length === 1 ? l[0] : l : s(this, a);
		}
		return this;
	}, c.prototype.removeAllListeners = function(e) {
		var t;
		return e ? (t = r ? r + e : e, this._events[t] && s(this, t)) : (this._events = new i(), this._eventsCount = 0), this;
	}, c.prototype.off = c.prototype.removeListener, c.prototype.addListener = c.prototype.on, c.prefixed = r, c.EventEmitter = c, t !== void 0 && (t.exports = c);
})))(), 1)).default, ZT = new XT(), QT = "recharts.syncEvent.tooltip", $T = "recharts.syncEvent.brush", eE = (e, t) => {
	if (t && Array.isArray(e)) {
		var n = Number.parseInt(t, 10);
		if (!ar(n)) return e[n];
	}
}, tE = Vc({
	name: "options",
	initialState: {
		chartName: "",
		tooltipPayloadSearcher: () => void 0,
		eventEmitter: void 0,
		defaultTooltipEventType: "axis"
	},
	reducers: { createEventEmitter: (e) => {
		e.eventEmitter ??= Symbol("rechartsEventEmitter");
	} }
}), nE = tE.reducer, rE = tE.actions.createEventEmitter;
//#endregion
//#region node_modules/recharts/es6/synchronisation/syncSelectors.js
function iE(e) {
	return e.tooltip.syncInteraction;
}
var aE = Vc({
	name: "chartData",
	initialState: {
		chartData: void 0,
		computedData: void 0,
		dataStartIndex: 0,
		dataEndIndex: 0
	},
	reducers: {
		setChartData(e, t) {
			e.chartData = G(t.payload), t.payload == null ? (e.dataStartIndex = 0, e.dataEndIndex = 0) : t.payload.length > 0 && e.dataEndIndex !== t.payload.length - 1 && (e.dataEndIndex = t.payload.length - 1);
		},
		setComputedData(e, t) {
			e.computedData = t.payload;
		},
		setDataStartEndIndexes(e, t) {
			var n = t.payload, r = n.startIndex, i = n.endIndex;
			r != null && (e.dataStartIndex = r), i != null && (e.dataEndIndex = i);
		}
	}
}), oE = aE.actions, sE = oE.setChartData, cE = oE.setDataStartEndIndexes;
oE.setComputedData;
var lE = aE.reducer, uE = ["x", "y"];
function dE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function fE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? dE(Object(n), !0).forEach(function(t) {
			pE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : dE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function pE(e, t, n) {
	return (t = mE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function mE(e) {
	var t = hE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function hE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function gE(e, t) {
	if (e == null) return {};
	var n, r, i = _E(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function _E(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function vE() {
	var e = V(Mh), t = V(Ph), n = $a(), r = V(Nh), i = V(Ow), a = fd(), o = od(), s = V((e) => e.rootProps.className);
	(0, y.useEffect)(() => {
		if (e == null) return _r;
		var s = (s, c, l) => {
			if (t !== l && e === s) {
				if (c.payload.active === !1) n(MC({
					active: !1,
					coordinate: void 0,
					dataKey: void 0,
					index: null,
					label: void 0,
					sourceViewBox: void 0,
					graphicalItemId: void 0
				}));
				else if (r === "index") {
					var u;
					if (o && c != null && (u = c.payload) != null && u.coordinate && c.payload.sourceViewBox) {
						var d = c.payload.coordinate, f = d.x, p = d.y, m = gE(d, uE), h = c.payload.sourceViewBox, g = h.x, _ = h.y, v = h.width, y = h.height, b = fE(fE({}, m), {}, {
							x: o.x + (v ? (f - g) / v : 0) * o.width,
							y: o.y + (y ? (p - _) / y : 0) * o.height
						});
						n(fE(fE({}, c), {}, { payload: fE(fE({}, c.payload), {}, { coordinate: b }) }));
					} else n(c);
				} else if (i != null) {
					var x;
					typeof r == "function" ? x = i[r(i, {
						activeTooltipIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
						isTooltipActive: c.payload.active,
						activeIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
						activeLabel: c.payload.label,
						activeDataKey: c.payload.dataKey,
						activeCoordinate: c.payload.coordinate
					})] : r === "value" && (x = i.find((e) => String(e.value) === c.payload.label));
					var S = c.payload.coordinate;
					if (S == null || o == null) n(MC({
						active: !1,
						coordinate: void 0,
						dataKey: void 0,
						index: null,
						label: void 0,
						sourceViewBox: void 0,
						graphicalItemId: void 0
					}));
					else if (x == null) n(MC({
						active: !1,
						coordinate: void 0,
						dataKey: void 0,
						index: null,
						label: void 0,
						sourceViewBox: c.payload.sourceViewBox,
						graphicalItemId: void 0
					}));
					else {
						var C = S.x, w = S.y, T = Math.min(C, o.x + o.width), E = Math.min(w, o.y + o.height), D = {
							x: a === "horizontal" ? x.coordinate : T,
							y: a === "horizontal" ? E : x.coordinate
						};
						n(MC({
							active: c.payload.active,
							coordinate: D,
							dataKey: c.payload.dataKey,
							index: String(x.index),
							label: c.payload.label,
							sourceViewBox: c.payload.sourceViewBox,
							graphicalItemId: c.payload.graphicalItemId
						}));
					}
				}
			}
		};
		return ZT.on(QT, s), () => {
			ZT.off(QT, s);
		};
	}, [
		s,
		n,
		t,
		e,
		r,
		i,
		a,
		o
	]);
}
function yE() {
	var e = V(Mh), t = V(Ph), n = $a();
	(0, y.useEffect)(() => {
		if (e == null) return _r;
		var r = (r, i, a) => {
			t !== a && e === r && n(cE(i));
		};
		return ZT.on($T, r), () => {
			ZT.off($T, r);
		};
	}, [
		n,
		t,
		e
	]);
}
function bE() {
	var e = $a();
	(0, y.useEffect)(() => {
		e(rE());
	}, [e]), vE(), yE();
}
function xE(e, t, n, r, i, a) {
	var o = V((n) => uT(n, e, t)), s = V(Iw), c = V(Ph), l = V(Mh), u = V(Nh), d = V(iE)?.sourceViewBox != null, f = od();
	(0, y.useEffect)(() => {
		if (!d && l != null && c != null) {
			var e = MC({
				active: a,
				coordinate: n,
				dataKey: o,
				index: i,
				label: typeof r == "number" ? String(r) : r,
				sourceViewBox: f,
				graphicalItemId: s
			});
			ZT.emit(QT, l, e, c);
		}
	}, [
		d,
		n,
		o,
		s,
		i,
		r,
		c,
		l,
		u,
		a,
		f
	]);
}
//#endregion
//#region node_modules/recharts/es6/component/Tooltip.js
function SE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function CE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? SE(Object(n), !0).forEach(function(t) {
			wE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : SE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function wE(e, t, n) {
	return (t = TE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function TE(e) {
	var t = EE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function EE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function DE(e, t) {
	return ME(e) || jE(e, t) || kE(e, t) || OE();
}
function OE() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function kE(e, t) {
	if (e) {
		if (typeof e == "string") return AE(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? AE(e, t) : void 0;
	}
}
function AE(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function jE(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ME(e) {
	if (Array.isArray(e)) return e;
}
function NE(e) {
	return e.dataKey;
}
function PE(e, t) {
	return /*#__PURE__*/ y.isValidElement(e) ? /*#__PURE__*/ y.cloneElement(e, t) : typeof e == "function" ? /*#__PURE__*/ y.createElement(e, t) : /*#__PURE__*/ y.createElement(rf, t);
}
var FE = [], IE = {
	allowEscapeViewBox: {
		x: !1,
		y: !1
	},
	animationDuration: 400,
	animationEasing: "ease",
	axisId: 0,
	contentStyle: {},
	cursor: !0,
	filterNull: !0,
	includeHidden: !1,
	isAnimationActive: "auto",
	itemSorter: "name",
	itemStyle: {},
	labelStyle: {},
	offset: 10,
	reverseDirection: {
		x: !1,
		y: !1
	},
	separator: " : ",
	trigger: "hover",
	useTranslate3d: !1,
	wrapperStyle: {}
};
function LE(e) {
	var t = Ii(e, IE), n = t.active, r = t.allowEscapeViewBox, i = t.animationDuration, a = t.animationEasing, o = t.content, s = t.filterNull, c = t.isAnimationActive, l = t.offset, u = t.payloadUniqBy, d = t.position, f = t.reverseDirection, p = t.useTranslate3d, m = t.wrapperStyle, h = t.cursor, g = t.shared, _ = t.trigger, v = t.defaultIndex, b = t.portal, x = t.axisId, S = $a(), C = typeof v == "number" ? String(v) : v;
	(0, y.useEffect)(() => {
		S(DC({
			shared: g,
			trigger: _,
			axisId: x,
			active: n,
			defaultIndex: C
		}));
	}, [
		S,
		g,
		_,
		x,
		n,
		C
	]);
	var w = od(), T = Nf(), E = vC(g), D = V((e) => gT(e, E, _, C)) ?? {}, O = D.activeIndex, k = D.isActive, A = V((e) => hT(e, E, _, C)), j = V((e) => mT(e, E, _, C)), M = V((e) => pT(e, E, _, C)), N = A, ee = YT(), P = n ?? k ?? !1, te = DE(Lo([N, P]), 2), ne = te[0], re = te[1], ie = E === "axis" ? j : void 0;
	xE(E, _, M, ie, O, P);
	var ae = b ?? ee;
	if (ae == null || w == null || E == null) return null;
	var oe = N ?? FE;
	P || (oe = FE), s && oe.length && (oe = Ga(oe.filter((e) => e.value != null && (e.hide !== !0 || t.includeHidden)), u, NE));
	var se = oe.length > 0, ce = CE(CE({}, t), {}, {
		payload: oe,
		label: ie,
		active: P,
		activeIndex: O,
		coordinate: M,
		accessibilityLayer: T
	}), le = /*#__PURE__*/ y.createElement(Mf, {
		allowEscapeViewBox: r,
		animationDuration: i,
		animationEasing: a,
		isAnimationActive: c,
		active: P,
		coordinate: M,
		hasPayload: se,
		offset: l,
		position: d,
		reverseDirection: f,
		useTranslate3d: p,
		viewBox: w,
		wrapperStyle: m,
		lastBoundingBox: ne,
		innerRef: re,
		hasPortalFromProps: !!b
	}, PE(o, ce));
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ (0, LT.createPortal)(le, ae), P && /*#__PURE__*/ y.createElement(qT, {
		cursor: h,
		tooltipEventType: E,
		coordinate: M,
		payload: oe,
		index: O
	}));
}
//#endregion
//#region node_modules/recharts/es6/util/LRUCache.js
function RE(e, t, n) {
	return (t = zE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function zE(e) {
	var t = BE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function BE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var VE = class {
	constructor(e) {
		RE(this, "cache", /* @__PURE__ */ new Map()), this.maxSize = e;
	}
	get(e) {
		var t = this.cache.get(e);
		return t !== void 0 && (this.cache.delete(e), this.cache.set(e, t)), t;
	}
	set(e, t) {
		if (this.cache.has(e)) this.cache.delete(e);
		else if (this.cache.size >= this.maxSize) {
			var n = this.cache.keys().next().value;
			n != null && this.cache.delete(n);
		}
		this.cache.set(e, t);
	}
	clear() {
		this.cache.clear();
	}
	size() {
		return this.cache.size;
	}
};
//#endregion
//#region node_modules/recharts/es6/util/DOMUtils.js
function HE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function UE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? HE(Object(n), !0).forEach(function(t) {
			WE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : HE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function WE(e, t, n) {
	return (t = GE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function GE(e) {
	var t = KE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function KE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var qE = UE({}, {
	cacheSize: 2e3,
	enableCache: !0
}), JE = new VE(qE.cacheSize), YE = {
	position: "absolute",
	top: "-20000px",
	left: 0,
	padding: 0,
	margin: 0,
	border: "none",
	whiteSpace: "pre"
}, XE = "recharts_measurement_span";
function ZE(e, t) {
	return `${e}|${t.fontSize || ""}|${t.fontFamily || ""}|${t.fontWeight || ""}|${t.fontStyle || ""}|${t.letterSpacing || ""}|${t.textTransform || ""}`;
}
var QE = (e, t) => {
	try {
		var n = document.getElementById(XE);
		n || (n = document.createElement("span"), n.setAttribute("id", XE), n.setAttribute("aria-hidden", "true"), document.body.appendChild(n)), Object.assign(n.style, YE, t), n.textContent = `${e}`;
		var r = n.getBoundingClientRect();
		return {
			width: r.width,
			height: r.height
		};
	} catch {
		return {
			width: 0,
			height: 0
		};
	}
}, $E = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
	if (e == null || df.isSsr) return {
		width: 0,
		height: 0
	};
	if (!qE.enableCache) return QE(e, t);
	var n = ZE(e, t), r = JE.get(n);
	if (r) return r;
	var i = QE(e, t);
	return JE.set(n, i), i;
}, eD;
function tD(e, t) {
	return oD(e) || aD(e, t) || rD(e, t) || nD();
}
function nD() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function rD(e, t) {
	if (e) {
		if (typeof e == "string") return iD(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? iD(e, t) : void 0;
	}
}
function iD(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function aD(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function oD(e) {
	if (Array.isArray(e)) return e;
}
function sD(e, t, n) {
	return (t = cD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function cD(e) {
	var t = lD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function lD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var uD = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, dD = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, fD = /^(px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q)$/, pD = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/, mD = {
	cm: 96 / 2.54,
	mm: 96 / 25.4,
	pt: 96 / 72,
	pc: 16,
	in: 96,
	Q: 96 / 101.6,
	px: 1
}, hD = [
	"cm",
	"mm",
	"pt",
	"pc",
	"in",
	"Q",
	"px"
];
function gD(e) {
	return hD.includes(e);
}
var _D = "NaN";
function vD(e, t) {
	return e * mD[t];
}
var yD = class e {
	static parse(t) {
		var n = tD(pD.exec(t) ?? [], 3), r = n[1], i = n[2];
		return r == null ? e.NaN : new e(parseFloat(r), i ?? "");
	}
	constructor(e, t) {
		this.num = e, this.unit = t, this.num = e, this.unit = t, ar(e) && (this.unit = ""), t !== "" && !fD.test(t) && (this.num = NaN, this.unit = ""), gD(t) && (this.num = vD(e, t), this.unit = "px");
	}
	add(t) {
		return this.unit === t.unit ? new e(this.num + t.num, this.unit) : new e(NaN, "");
	}
	subtract(t) {
		return this.unit === t.unit ? new e(this.num - t.num, this.unit) : new e(NaN, "");
	}
	multiply(t) {
		return this.unit !== "" && t.unit !== "" && this.unit !== t.unit ? new e(NaN, "") : new e(this.num * t.num, this.unit || t.unit);
	}
	divide(t) {
		return this.unit !== "" && t.unit !== "" && this.unit !== t.unit ? new e(NaN, "") : new e(this.num / t.num, this.unit || t.unit);
	}
	toString() {
		return `${this.num}${this.unit}`;
	}
	isNaN() {
		return ar(this.num);
	}
};
eD = yD, sD(yD, "NaN", new eD(NaN, ""));
function bD(e) {
	if (e == null || e.includes(_D)) return _D;
	for (var t = e; t.includes("*") || t.includes("/");) {
		var n = tD(uD.exec(t) ?? [], 4), r = n[1], i = n[2], a = n[3], o = yD.parse(r ?? ""), s = yD.parse(a ?? ""), c = i === "*" ? o.multiply(s) : o.divide(s);
		if (c.isNaN()) return _D;
		t = t.replace(uD, c.toString());
	}
	for (; t.includes("+") || /.-\d+(?:\.\d+)?/.test(t);) {
		var l = tD(dD.exec(t) ?? [], 4), u = l[1], d = l[2], f = l[3], p = yD.parse(u ?? ""), m = yD.parse(f ?? ""), h = d === "+" ? p.add(m) : p.subtract(m);
		if (h.isNaN()) return _D;
		t = t.replace(dD, h.toString());
	}
	return t;
}
var xD = /\(([^()]*)\)/;
function SD(e) {
	for (var t = e, n; (n = xD.exec(t)) != null;) {
		var r = tD(n, 2)[1];
		t = t.replace(xD, bD(r));
	}
	return t;
}
function CD(e) {
	var t = e.replace(/\s+/g, "");
	return t = SD(t), t = bD(t), t;
}
function wD(e) {
	try {
		return CD(e);
	} catch {
		return _D;
	}
}
function TD(e) {
	var t = wD(e.slice(5, -1));
	return t === _D ? "" : t;
}
//#endregion
//#region node_modules/recharts/es6/component/Text.js
var ED = [
	"x",
	"y",
	"lineHeight",
	"capHeight",
	"fill",
	"scaleToFit",
	"textAnchor",
	"verticalAnchor"
], DD = [
	"dx",
	"dy",
	"angle",
	"className",
	"breakAll"
];
function OD() {
	return OD = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, OD.apply(null, arguments);
}
function kD(e, t) {
	if (e == null) return {};
	var n, r, i = AD(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function AD(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function jD(e, t) {
	return ID(e) || FD(e, t) || ND(e, t) || MD();
}
function MD() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ND(e, t) {
	if (e) {
		if (typeof e == "string") return PD(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? PD(e, t) : void 0;
	}
}
function PD(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function FD(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ID(e) {
	if (Array.isArray(e)) return e;
}
var LD = /[ \f\n\r\t\v\u2028\u2029]+/, RD = (e) => {
	var t = e.children, n = e.breakAll, r = e.style;
	try {
		var i = [];
		return mr(t) || (i = n ? t.toString().split("") : t.toString().split(LD)), {
			wordsWithComputedWidth: i.map((e) => ({
				word: e,
				width: $E(e, r).width
			})),
			spaceWidth: n ? 0 : $E("\xA0", r).width
		};
	} catch {
		return null;
	}
};
function zD(e) {
	return e === "start" || e === "middle" || e === "end" || e === "inherit";
}
function BD(e) {
	return mr(e) || typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
var VD = (e, t, n, r) => e.reduce((e, i) => {
	var a = i.word, o = i.width, s = e[e.length - 1];
	if (s && o != null && (t == null || r || s.width + o + n < Number(t))) s.words.push(a), s.width += o + n;
	else {
		var c = {
			words: [a],
			width: o
		};
		e.push(c);
	}
	return e;
}, []), HD = (e) => e.reduce((e, t) => e.width > t.width ? e : t), UD = "…", WD = (e, t, n, r, i, a, o, s) => {
	var c = RD({
		breakAll: n,
		style: r,
		children: e.slice(0, t) + UD
	});
	if (!c) return [!1, []];
	var l = VD(c.wordsWithComputedWidth, a, o, s);
	return [l.length > i || HD(l).width > Number(a), l];
}, GD = (e, t, n, r, i) => {
	var a = e.maxLines, o = e.children, s = e.style, c = e.breakAll, l = z(a), u = String(o), d = VD(t, r, n, i);
	if (!l || i || !(d.length > a || HD(d).width > Number(r))) return d;
	for (var f = 0, p = u.length - 1, m = 0, h; f <= p && m <= u.length - 1;) {
		var g = Math.floor((f + p) / 2), _ = jD(WD(u, g - 1, c, s, a, r, n, i), 2), v = _[0], y = _[1], b = jD(WD(u, g, c, s, a, r, n, i), 1)[0];
		if (!v && !b && (f = g + 1), v && b && (p = g - 1), !v && b) {
			h = y;
			break;
		}
		m++;
	}
	return h || d;
}, KD = (e) => [{
	words: mr(e) ? [] : e.toString().split(LD),
	width: void 0
}], qD = (e) => {
	var t = e.width, n = e.scaleToFit, r = e.children, i = e.style, a = e.breakAll, o = e.maxLines;
	if ((t || n) && !df.isSsr) {
		var s, c, l = RD({
			breakAll: a,
			children: r,
			style: i
		});
		if (l) {
			var u = l.wordsWithComputedWidth, d = l.spaceWidth;
			s = u, c = d;
		} else return KD(r);
		return GD({
			breakAll: a,
			children: r,
			maxLines: o,
			style: i
		}, s, c, t, !!n);
	}
	return KD(r);
}, JD = "#808080", YD = {
	angle: 0,
	breakAll: !1,
	capHeight: "0.71em",
	fill: JD,
	lineHeight: "1em",
	scaleToFit: !1,
	textAnchor: "start",
	verticalAnchor: "end",
	x: 0,
	y: 0
}, XD = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = Ii(e, YD), r = n.x, i = n.y, a = n.lineHeight, o = n.capHeight, s = n.fill, c = n.scaleToFit, l = n.textAnchor, u = n.verticalAnchor, d = kD(n, ED), f = (0, y.useMemo)(() => qD({
		breakAll: d.breakAll,
		children: d.children,
		maxLines: d.maxLines,
		scaleToFit: c,
		style: d.style,
		width: d.width
	}), [
		d.breakAll,
		d.children,
		d.maxLines,
		c,
		d.style,
		d.width
	]), p = d.dx, m = d.dy, h = d.angle, g = d.className, _ = d.breakAll, v = kD(d, DD);
	if (!sr(r) || !sr(i) || f.length === 0) return null;
	var b = Number(r) + (z(p) ? p : 0), x = Number(i) + (z(m) ? m : 0);
	if (!K(b) || !K(x)) return null;
	var S;
	switch (u) {
		case "start":
			S = TD(`calc(${o})`);
			break;
		case "middle":
			S = TD(`calc(${(f.length - 1) / 2} * -${a} + (${o} / 2))`);
			break;
		default: S = TD(`calc(${f.length - 1} * -${a})`);
	}
	var C = [], w = f[0];
	if (c && w != null) {
		var T = w.width, E = d.width;
		C.push(`scale(${z(E) && z(T) ? E / T : 1})`);
	}
	return h && C.push(`rotate(${h}, ${b}, ${x})`), C.length && (v.transform = C.join(" ")), /*#__PURE__*/ y.createElement("text", OD({}, Nn(v), {
		ref: t,
		x: b,
		y: x,
		className: Tn("recharts-text", g),
		textAnchor: l,
		fill: s.includes("url") ? JD : s
	}), f.map((e, t) => {
		var n = e.words.join(_ ? "" : " ");
		return /*#__PURE__*/ y.createElement("tspan", {
			x: b,
			dy: t === 0 ? S : a,
			key: `${n}-${t}`
		}, n);
	}));
});
XD.displayName = "Text";
//#endregion
//#region node_modules/recharts/es6/component/Label.js
var ZD = ["labelRef"], QD = ["content"];
function $D(e, t) {
	if (e == null) return {};
	var n, r, i = eO(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function eO(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function tO(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function nO(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? tO(Object(n), !0).forEach(function(t) {
			rO(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tO(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function rO(e, t, n) {
	return (t = iO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function iO(e) {
	var t = aO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function aO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function oO() {
	return oO = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, oO.apply(null, arguments);
}
var sO = /*#__PURE__*/ (0, y.createContext)(null), cO = (e) => {
	var t = e.x, n = e.y, r = e.upperWidth, i = e.lowerWidth, a = e.width, o = e.height, s = e.children, c = (0, y.useMemo)(() => ({
		x: t,
		y: n,
		upperWidth: r,
		lowerWidth: i,
		width: a,
		height: o
	}), [
		t,
		n,
		r,
		i,
		a,
		o
	]);
	return /*#__PURE__*/ y.createElement(sO.Provider, { value: c }, s);
}, lO = () => {
	var e = (0, y.useContext)(sO), t = od();
	return e || (t ? vr(t) : void 0);
}, uO = /*#__PURE__*/ (0, y.createContext)(null), dO = () => {
	var e = (0, y.useContext)(uO), t = V(tg);
	return e || t;
}, fO = (e) => {
	var t = e.value, n = e.formatter, r = mr(e.children) ? t : e.children;
	return typeof n == "function" ? n(r) : r;
}, pO = (e) => e != null && typeof e == "function", mO = (e, t) => ir(t - e) * Math.min(Math.abs(t - e), 360), hO = (e, t, n, r, i) => {
	var a = e.offset, o = e.className, s = i.cx, c = i.cy, l = i.innerRadius, u = i.outerRadius, d = i.startAngle, f = i.endAngle, p = i.clockWise, m = (l + u) / 2, h = mO(d, f), g = h >= 0 ? 1 : -1, _, v;
	switch (t) {
		case "insideStart":
			_ = d + g * a, v = p;
			break;
		case "insideEnd":
			_ = f - g * a, v = !p;
			break;
		case "end":
			_ = f + g * a, v = p;
			break;
		default: throw Error(`Unsupported position ${t}`);
	}
	v = h <= 0 ? v : !v;
	var b = Tm(s, c, m, _), x = Tm(s, c, m, _ + (v ? 1 : -1) * 359), S = `M${b.x},${b.y}
    A${m},${m},0,1,${+!v},
    ${x.x},${x.y}`, C = mr(e.id) ? lr("recharts-radial-line-") : e.id;
	return /*#__PURE__*/ y.createElement("text", oO({}, r, {
		dominantBaseline: "central",
		className: Tn("recharts-radial-bar-label", o)
	}), /*#__PURE__*/ y.createElement("defs", null, /*#__PURE__*/ y.createElement("path", {
		id: C,
		d: S
	})), /*#__PURE__*/ y.createElement("textPath", { xlinkHref: `#${C}` }, n));
}, gO = (e, t, n) => {
	var r = e.cx, i = e.cy, a = e.innerRadius, o = e.outerRadius, s = (e.startAngle + e.endAngle) / 2;
	if (n === "outside") {
		var c = Tm(r, i, o + t, s), l = c.x;
		return {
			x: l,
			y: c.y,
			textAnchor: l >= r ? "start" : "end",
			verticalAnchor: "middle"
		};
	}
	if (n === "center") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "middle"
	};
	if (n === "centerTop") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "start"
	};
	if (n === "centerBottom") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "end"
	};
	var u = Tm(r, i, (a + o) / 2, s);
	return {
		x: u.x,
		y: u.y,
		textAnchor: "middle",
		verticalAnchor: "middle"
	};
}, _O = (e) => e != null && "cx" in e && z(e.cx), vO = {
	angle: 0,
	offset: 5,
	zIndex: Fh.label,
	position: "middle",
	textBreakAll: !1
};
function yO(e) {
	if (!_O(e)) return e;
	var t = e.cx, n = e.cy, r = e.outerRadius, i = r * 2;
	return {
		x: t - r,
		y: n - r,
		width: i,
		upperWidth: i,
		lowerWidth: i,
		height: i
	};
}
function bO(e) {
	var t = Ii(e, vO), n = t.viewBox, r = t.parentViewBox, i = t.position, a = t.value, o = t.children, s = t.content, c = t.className, l = c === void 0 ? "" : c, u = t.textBreakAll, d = t.labelRef, f = dO(), p = lO(), m = n == null ? i === "center" ? p : f ?? p : _O(n) ? n : vr(n), h, g, _ = yO(m);
	if (!m || mr(a) && mr(o) && !/*#__PURE__*/ (0, y.isValidElement)(s) && typeof s != "function") return null;
	var v = _O(m) && (i === "insideStart" || i === "insideEnd" || i === "end");
	if (_O(m)) v || (g = gO(m, t.offset, t.position));
	else if (_) {
		var b = wr({
			viewBox: _,
			position: i,
			offset: t.offset,
			parentViewBox: _O(r) ? void 0 : r,
			clamp: !0
		});
		g = nO(nO({
			x: b.x,
			y: b.y,
			textAnchor: b.horizontalAnchor,
			verticalAnchor: b.verticalAnchor
		}, b.width === void 0 ? {} : { width: b.width }), b.height === void 0 ? {} : { height: b.height });
	}
	var x = nO(nO(nO(nO({}, g?.x === void 0 ? {} : { x: g.x }), g?.y === void 0 ? {} : { y: g.y }), t), {}, { viewBox: m });
	if (/*#__PURE__*/ (0, y.isValidElement)(s)) {
		x.labelRef;
		var S = $D(x, ZD);
		return /*#__PURE__*/ (0, y.cloneElement)(s, S);
	}
	if (typeof s == "function") {
		x.content;
		var C = $D(x, QD);
		if (h = /*#__PURE__*/ (0, y.createElement)(s, C), /*#__PURE__*/ (0, y.isValidElement)(h)) return h;
	} else h = fO(t);
	var w = Nn(t);
	return v && _O(m) ? hO(t, i, h, w, m) : g == null ? null : /*#__PURE__*/ y.createElement(RT, { zIndex: t.zIndex }, /*#__PURE__*/ y.createElement(XD, oO({
		ref: d,
		className: Tn("recharts-label", l)
	}, w, g, {
		textAnchor: zD(w.textAnchor) ? w.textAnchor : g.textAnchor,
		breakAll: u
	}), h));
}
bO.displayName = "Label";
var xO = (e, t, n) => {
	if (!e) return null;
	var r = {
		viewBox: t,
		labelRef: n
	};
	return e === !0 ? /*#__PURE__*/ y.createElement(bO, oO({ key: "label-implicit" }, r)) : sr(e) ? /*#__PURE__*/ y.createElement(bO, oO({
		key: "label-implicit",
		value: e
	}, r)) : /*#__PURE__*/ (0, y.isValidElement)(e) ? e.type === bO ? /*#__PURE__*/ (0, y.cloneElement)(e, nO({ key: "label-implicit" }, r)) : /*#__PURE__*/ y.createElement(bO, oO({
		key: "label-implicit",
		content: e
	}, r)) : pO(e) ? /*#__PURE__*/ y.createElement(bO, oO({
		key: "label-implicit",
		content: e
	}, r)) : e && typeof e == "object" ? /*#__PURE__*/ y.createElement(bO, oO({}, e, { key: "label-implicit" }, r)) : null;
};
function SO(e) {
	var t = e.label, n = e.labelRef;
	return xO(t, lO(), n) || null;
}
//#endregion
//#region node_modules/recharts/es6/component/LabelList.js
var CO = ["valueAccessor"], wO = [
	"dataKey",
	"clockWise",
	"id",
	"textBreakAll",
	"zIndex"
];
function TO() {
	return TO = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, TO.apply(null, arguments);
}
function EO(e, t) {
	if (e == null) return {};
	var n, r, i = DO(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function DO(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var OO = (e) => {
	var t = Array.isArray(e.value) ? e.value[e.value.length - 1] : e.value;
	if (BD(t)) return t;
}, kO = /*#__PURE__*/ (0, y.createContext)(void 0), AO = kO.Provider, jO = /*#__PURE__*/ (0, y.createContext)(void 0);
jO.Provider;
function MO() {
	return (0, y.useContext)(kO);
}
function NO() {
	return (0, y.useContext)(jO);
}
function PO(e) {
	var t = e.valueAccessor, n = t === void 0 ? OO : t, r = EO(e, CO), i = r.dataKey;
	r.clockWise;
	var a = r.id, o = r.textBreakAll, s = r.zIndex, c = EO(r, wO), l = MO(), u = NO(), d = l || u;
	return !d || !d.length ? null : /*#__PURE__*/ y.createElement(RT, { zIndex: s ?? Fh.label }, /*#__PURE__*/ y.createElement(Wn, { className: "recharts-label-list" }, d.map((e, t) => {
		var s = mr(i) ? n(e, t) : Ul(e.payload, i), l = mr(a) ? {} : { id: `${a}-${t}` };
		return /*#__PURE__*/ y.createElement(bO, TO({ key: `label-${t}` }, Nn(e), c, l, {
			fill: r.fill ?? e.fill,
			parentViewBox: e.parentViewBox,
			value: s,
			textBreakAll: o,
			viewBox: e.viewBox,
			index: t,
			zIndex: 0
		}));
	})));
}
PO.displayName = "LabelList";
function FO(e) {
	var t = e.label;
	return t ? t === !0 ? /*#__PURE__*/ y.createElement(PO, { key: "labelList-implicit" }) : /*#__PURE__*/ y.isValidElement(t) || pO(t) ? /*#__PURE__*/ y.createElement(PO, {
		key: "labelList-implicit",
		content: t
	}) : typeof t == "object" ? /*#__PURE__*/ y.createElement(PO, TO({ key: "labelList-implicit" }, t, { type: String(t.type) })) : null : null;
}
//#endregion
//#region node_modules/recharts/es6/shape/Dot.js
function IO() {
	return IO = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, IO.apply(null, arguments);
}
var LO = (e) => {
	var t = e.cx, n = e.cy, r = e.r, i = e.className, a = Tn("recharts-dot", i);
	return z(t) && z(n) && z(r) ? /*#__PURE__*/ y.createElement("circle", IO({}, jn(e), Oi(e), {
		className: a,
		cx: t,
		cy: n,
		r
	})) : null;
}, RO = Vc({
	name: "polarAxis",
	initialState: {
		radiusAxis: {},
		angleAxis: {}
	},
	reducers: {
		addRadiusAxis(e, t) {
			e.radiusAxis[t.payload.id] = G(t.payload);
		},
		removeRadiusAxis(e, t) {
			delete e.radiusAxis[t.payload.id];
		},
		addAngleAxis(e, t) {
			e.angleAxis[t.payload.id] = G(t.payload);
		},
		removeAngleAxis(e, t) {
			delete e.angleAxis[t.payload.id];
		}
	}
}), zO = RO.actions;
zO.addRadiusAxis, zO.removeRadiusAxis, zO.addAngleAxis, zO.removeAngleAxis;
var BO = RO.reducer;
//#endregion
//#region node_modules/recharts/es6/util/getClassNameFromUnknown.js
function VO(e) {
	return e && typeof e == "object" && "className" in e && typeof e.className == "string" ? e.className : "";
}
//#endregion
//#region node_modules/recharts/es6/util/ReactUtils.js
var HO = (e) => e && typeof e == "object" && "clipDot" in e ? !!e.clipDot : !0;
//#endregion
//#region node_modules/recharts/es6/util/ActiveShapeUtils.js
function UO(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function WO(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? UO(Object(n), !0).forEach(function(t) {
			GO(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : UO(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function GO(e, t, n) {
	return (t = KO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function KO(e) {
	var t = qO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function qO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function JO(e, t) {
	return WO(WO({}, t), e);
}
function YO(e) {
	return /*#__PURE__*/ (0, y.isValidElement)(e) ? e.props : e;
}
function XO(e, t) {
	return /*#__PURE__*/ (0, y.cloneElement)(e, JO(YO(e), t));
}
function ZO(e) {
	if ("index" in e) {
		var t = e.index;
		return typeof t == "number" || typeof t == "string" ? t : void 0;
	}
}
function QO(e) {
	return "isActive" in e && e.isActive === !0;
}
function $O(e) {
	var t = e.option, n = e.DefaultShape, r = e.shapeProps, i = e.activeClassName, a = i === void 0 ? "recharts-active-shape" : i, o = e.inActiveClassName, s = o === void 0 ? "recharts-shape" : o, c = ZO(r), l = /*#__PURE__*/ (0, y.isValidElement)(t) ? XO(t, r) : t === n ? /*#__PURE__*/ y.createElement(n, r) : typeof t == "function" ? t(r, c) : typeof t == "object" ? /*#__PURE__*/ y.createElement(n, JO(t, r)) : /*#__PURE__*/ y.createElement(n, r);
	return QO(r) ? /*#__PURE__*/ y.createElement(Wn, { className: a }, l) : /*#__PURE__*/ y.createElement(Wn, { className: s }, l);
}
//#endregion
//#region node_modules/recharts/es6/state/SetTooltipEntrySettings.js
function ek(e) {
	var t = e.tooltipEntrySettings, n = $a(), r = Du(), i = (0, y.useRef)(null);
	return (0, y.useLayoutEffect)(() => {
		r || (i.current === null ? n(wC(t)) : i.current !== t && n(TC({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		t,
		n,
		r
	]), (0, y.useLayoutEffect)(() => () => {
		i.current &&= (n(EC(i.current)), null);
	}, [n]), null;
}
//#endregion
//#region node_modules/recharts/es6/state/SetLegendPayload.js
function tk(e) {
	var t = e.legendPayload, n = $a(), r = Du(), i = (0, y.useRef)(null);
	return (0, y.useLayoutEffect)(() => {
		r || (i.current === null ? n(yd(t)) : i.current !== t && n(bd({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		n,
		r,
		t
	]), (0, y.useLayoutEffect)(() => () => {
		i.current &&= (n(xd(i.current)), null);
	}, [n]), null;
}
//#endregion
//#region node_modules/recharts/es6/animation/matchBy.js
function nk(e, t) {
	return sk(e) || ok(e, t) || ik(e, t) || rk();
}
function rk() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ik(e, t) {
	if (e) {
		if (typeof e == "string") return ak(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ak(e, t) : void 0;
	}
}
function ak(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function ok(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function sk(e) {
	if (Array.isArray(e)) return e;
}
var ck = "index";
function lk(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [], r = [];
	for (var i of n) r.push({
		status: "removed",
		prev: i
	});
	for (var a = 0; a < t.length; a++) {
		var o = e[a], s = t[a];
		o == null ? r.push({
			status: "added",
			next: s
		}) : r.push({
			status: "matched",
			prev: o,
			next: s
		});
	}
	return r;
}
function uk(e, t) {
	var n = e.length / t.length;
	return lk(t.map((t, r) => e[Math.floor(r * n)]), t);
}
function dk(e, t) {
	return lk(t.map((t, n) => e[n]), t);
}
function fk(e, t) {
	for (var n = /* @__PURE__ */ new Map(), r = 0; r < e.length; r++) {
		var i = e[r];
		if (i != null) {
			var a = t(i, r);
			a != null && !n.has(a) && n.set(a, i);
		}
	}
	return n;
}
function pk(e, t, n) {
	var r = fk(e, n), i = /* @__PURE__ */ new Set(), a = t.map((e, t) => {
		var a = n(e, t);
		if (a != null) {
			var o = r.get(a);
			if (o !== void 0) return i.add(a), o;
		}
	}), o = [];
	for (var s of r) {
		var c = nk(s, 2), l = c[0], u = c[1];
		i.has(l) || o.push(u);
	}
	return lk(a, t, o);
}
function mk(e, t, n) {
	return t == null ? null : e == null ? t.map((e) => ({
		status: "added",
		next: e
	})) : n === "index" ? uk(e, t) : n === "append" ? dk(e, t) : pk(e, t, n);
}
//#endregion
//#region node_modules/recharts/es6/animation/useAnimationStartSnapshot.js
function hk(e, t) {
	var n = (0, y.useRef)(e), r = (0, y.useRef)(t.current), i = (0, y.useRef)(!0);
	n.current !== e && (n.current = e, r.current = t.current, i.current = !1);
	var a = (0, y.useCallback)(function(e, n) {
		var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
		n === 0 ? i.current = !0 : (n === 1 && (r.current = e), n > 0 && i.current && a && (t.current = e));
	}, [t]);
	return {
		startValue: r.current,
		syncStepValue: a
	};
}
//#endregion
//#region node_modules/recharts/es6/animation/AnimatedItems.js
function gk(e, t) {
	return xk(e) || bk(e, t) || vk(e, t) || _k();
}
function _k() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function vk(e, t) {
	if (e) {
		if (typeof e == "string") return yk(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yk(e, t) : void 0;
	}
}
function yk(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function bk(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function xk(e) {
	if (Array.isArray(e)) return e;
}
function Sk(e, t) {
	var n = gk((0, y.useState)(!1), 2), r = n[0], i = n[1];
	return {
		isAnimating: r,
		handleAnimationStart: (0, y.useCallback)(() => {
			typeof e == "function" && e(), i(!0);
		}, [e]),
		handleAnimationEnd: (0, y.useCallback)(() => {
			typeof t == "function" && t(), i(!1);
		}, [t])
	};
}
function Ck(e) {
	var t = e.animationInput, n = e.animationIdPrefix, r = e.items, i = e.previousItemsRef, a = e.isAnimationActive, o = e.animationBegin, s = e.animationDuration, c = e.animationEasing, l = e.onAnimationStart, u = e.onAnimationEnd, d = e.animationInterpolateFn, f = e.animationMatchBy, p = e.shouldUpdatePreviousRef, m = e.children, h = e.layout, g = zp(t, n), _ = hk(g, i), v = _.startValue ?? null, b = mk(v, r, f ?? ck);
	return /*#__PURE__*/ y.createElement(Rp, {
		animationId: g,
		begin: o,
		duration: s,
		isActive: a,
		easing: c,
		onAnimationEnd: u,
		onAnimationStart: l,
		key: g
	}, (e) => {
		var t = v == null, n = r == null ? r : d(b, e, h), i = p ? p(e) : e > 0;
		return _.syncStepValue(n, e, i), n == null ? null : m(n, e, t);
	});
}
function wk(e, t) {
	return kk(e) || Ok(e, t) || Ek(e, t) || Tk();
}
function Tk() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ek(e, t) {
	if (e) {
		if (typeof e == "string") return Dk(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dk(e, t) : void 0;
	}
}
function Dk(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Ok(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function kk(e) {
	if (Array.isArray(e)) return e;
}
var Ak = y.useId ?? (() => wk(y.useState(() => lr("uid-")), 1)[0]);
//#endregion
//#region node_modules/recharts/es6/util/useUniqueId.js
function jk(e, t) {
	var n = Ak();
	return t || (e ? `${e}-${n}` : n);
}
//#endregion
//#region node_modules/recharts/es6/context/RegisterGraphicalItemId.js
var Mk = /*#__PURE__*/ (0, y.createContext)(void 0), Nk = (e) => {
	var t = e.id, n = e.type, r = e.children, i = jk(`recharts-${n}`, t);
	return /*#__PURE__*/ y.createElement(Mk.Provider, { value: i }, r(i));
}, Pk = Vc({
	name: "graphicalItems",
	initialState: {
		cartesianItems: [],
		polarItems: []
	},
	reducers: {
		addCartesianGraphicalItem: {
			reducer(e, t) {
				e.cartesianItems.push(G(t.payload));
			},
			prepare: Ec()
		},
		replaceCartesianGraphicalItem: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = fc(e).cartesianItems.indexOf(G(r));
				a > -1 && (e.cartesianItems[a] = G(i));
			},
			prepare: Ec()
		},
		removeCartesianGraphicalItem: {
			reducer(e, t) {
				var n = fc(e).cartesianItems.indexOf(G(t.payload));
				n > -1 && e.cartesianItems.splice(n, 1);
			},
			prepare: Ec()
		},
		addPolarGraphicalItem: {
			reducer(e, t) {
				e.polarItems.push(G(t.payload));
			},
			prepare: Ec()
		},
		removePolarGraphicalItem: {
			reducer(e, t) {
				var n = fc(e).polarItems.indexOf(G(t.payload));
				n > -1 && e.polarItems.splice(n, 1);
			},
			prepare: Ec()
		},
		replacePolarGraphicalItem: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = fc(e).polarItems.indexOf(G(r));
				a > -1 && (e.polarItems[a] = G(i));
			},
			prepare: Ec()
		}
	}
}), Fk = Pk.actions, Ik = Fk.addCartesianGraphicalItem, Lk = Fk.replaceCartesianGraphicalItem, Rk = Fk.removeCartesianGraphicalItem;
Fk.addPolarGraphicalItem, Fk.removePolarGraphicalItem, Fk.replacePolarGraphicalItem;
var zk = Pk.reducer, Bk = /*#__PURE__*/ (0, y.memo)((e) => {
	var t = $a(), n = (0, y.useRef)(null);
	return (0, y.useLayoutEffect)(() => {
		n.current === null ? t(Ik(e)) : n.current !== e && t(Lk({
			prev: n.current,
			next: e
		})), n.current = e;
	}, [t, e]), (0, y.useLayoutEffect)(() => () => {
		n.current &&= (t(Rk(n.current)), null);
	}, [t]), null;
}), Vk = ["points"];
function Hk(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Uk(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Hk(Object(n), !0).forEach(function(t) {
			Wk(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Hk(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Wk(e, t, n) {
	return (t = Gk(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Gk(e) {
	var t = Kk(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Kk(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function qk() {
	return qk = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, qk.apply(null, arguments);
}
function Jk(e, t) {
	if (e == null) return {};
	var n, r, i = Yk(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Yk(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Xk(e) {
	var t = e.option, n = e.dotProps, r = e.className;
	if (/*#__PURE__*/ (0, y.isValidElement)(t)) return /*#__PURE__*/ (0, y.cloneElement)(t, n);
	if (typeof t == "function") return t(n);
	var i = Tn(r, typeof t == "boolean" ? "" : t.className), a = n ?? {};
	a.points;
	var o = Jk(a, Vk);
	return /*#__PURE__*/ y.createElement(LO, qk({}, o, { className: i }));
}
function Zk(e, t) {
	return e == null ? !1 : t ? !0 : e.length === 1;
}
function Qk(e) {
	var t = e.points, n = e.dot, r = e.className, i = e.dotClassName, a = e.dataKey, o = e.baseProps, s = e.needClip, c = e.clipPathId, l = e.zIndex, u = l === void 0 ? Fh.scatter : l;
	if (!Zk(t, n)) return null;
	var d = HO(n), f = Pn(n), p = t.map((e, r) => {
		var s = Uk(Uk(Uk({ r: 3 }, o), f), {}, {
			index: r,
			cx: e.x ?? void 0,
			cy: e.y ?? void 0,
			dataKey: a,
			value: e.value,
			payload: e.payload,
			points: t
		});
		return /*#__PURE__*/ y.createElement(Xk, {
			key: `dot-${r}`,
			option: n,
			dotProps: s,
			className: i
		});
	}), m = {};
	return s && c != null && (m.clipPath = `url(#clipPath-${d ? "" : "dots-"}${c})`), /*#__PURE__*/ y.createElement(RT, { zIndex: u }, /*#__PURE__*/ y.createElement(Wn, qk({ className: r }, m), p));
}
//#endregion
//#region node_modules/recharts/es6/state/cartesianAxisSlice.js
function $k(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function eA(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? $k(Object(n), !0).forEach(function(t) {
			tA(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $k(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function tA(e, t, n) {
	return (t = nA(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function nA(e) {
	var t = rA(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function rA(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var iA = Vc({
	name: "cartesianAxis",
	initialState: {
		xAxis: {},
		yAxis: {},
		zAxis: {}
	},
	reducers: {
		addXAxis: {
			reducer(e, t) {
				e.xAxis[t.payload.id] = G(t.payload);
			},
			prepare: Ec()
		},
		replaceXAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.xAxis[r.id] !== void 0 && (r.id !== i.id && delete e.xAxis[r.id], e.xAxis[i.id] = G(i));
			},
			prepare: Ec()
		},
		removeXAxis: {
			reducer(e, t) {
				delete e.xAxis[t.payload.id];
			},
			prepare: Ec()
		},
		addYAxis: {
			reducer(e, t) {
				e.yAxis[t.payload.id] = G(t.payload);
			},
			prepare: Ec()
		},
		replaceYAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.yAxis[r.id] !== void 0 && (r.id !== i.id && delete e.yAxis[r.id], e.yAxis[i.id] = G(i));
			},
			prepare: Ec()
		},
		removeYAxis: {
			reducer(e, t) {
				delete e.yAxis[t.payload.id];
			},
			prepare: Ec()
		},
		addZAxis: {
			reducer(e, t) {
				e.zAxis[t.payload.id] = G(t.payload);
			},
			prepare: Ec()
		},
		replaceZAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.zAxis[r.id] !== void 0 && (r.id !== i.id && delete e.zAxis[r.id], e.zAxis[i.id] = G(i));
			},
			prepare: Ec()
		},
		removeZAxis: {
			reducer(e, t) {
				delete e.zAxis[t.payload.id];
			},
			prepare: Ec()
		},
		updateYAxisWidth(e, t) {
			var n = t.payload, r = n.id, i = n.width, a = e.yAxis[r];
			if (a) {
				var o = a.widthHistory || [];
				if (o.length === 3 && o[0] === o[2] && i === o[1] && i !== a.width && Math.abs(i - (o[0] ?? 0)) <= 1) return;
				var s = [...o, i].slice(-3);
				e.yAxis[r] = eA(eA({}, a), {}, {
					width: i,
					widthHistory: s
				});
			}
		},
		updateXAxisHeight(e, t) {
			var n = t.payload, r = n.id, i = n.height, a = e.xAxis[r];
			if (a) {
				var o = a.heightHistory || [];
				if (o.length === 3 && o[0] === o[2] && i === o[1] && i !== a.height && Math.abs(i - (o[0] ?? 0)) <= 1) return;
				var s = [...o, i].slice(-3);
				e.xAxis[r] = eA(eA({}, a), {}, {
					height: i,
					heightHistory: s
				});
			}
		}
	}
}), aA = iA.actions, oA = aA.addXAxis, sA = aA.replaceXAxis, cA = aA.removeXAxis, lA = aA.addYAxis, uA = aA.replaceYAxis, dA = aA.removeYAxis;
aA.addZAxis, aA.replaceZAxis, aA.removeZAxis;
var fA = aA.updateYAxisWidth, pA = aA.updateXAxisHeight, mA = iA.reducer, hA = H([
	H([Cu], (e) => ({
		top: e.top,
		bottom: e.bottom,
		left: e.left,
		right: e.right
	})),
	ou,
	su
], (e, t, n) => {
	if (e && t != null && n != null) return {
		x: e.left,
		y: e.top,
		width: Math.max(0, t - e.left - e.right),
		height: Math.max(0, n - e.top - e.bottom)
	};
}), gA = function() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, t = Du();
	return V((n) => GS(n, "xAxis", e, t))?.map;
}, _A = () => V(hA), vA = () => V(Bw);
//#endregion
//#region node_modules/recharts/es6/component/ActivePoints.js
function yA(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function bA(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? yA(Object(n), !0).forEach(function(t) {
			xA(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yA(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function xA(e, t, n) {
	return (t = SA(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function SA(e) {
	var t = CA(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function CA(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var wA = (e) => {
	var t = e.point, n = e.childIndex, r = e.mainColor, i = e.activeDot, a = e.dataKey, o = e.clipPath;
	if (i === !1 || t.x == null || t.y == null) return null;
	var s = bA(bA(bA({}, {
		index: n,
		dataKey: a,
		cx: t.x,
		cy: t.y,
		r: 4,
		fill: r ?? "none",
		strokeWidth: 2,
		stroke: "#fff",
		payload: t.payload,
		value: t.value
	}), Mn(i)), Oi(i)), c = /*#__PURE__*/ (0, y.isValidElement)(i) ? /*#__PURE__*/ (0, y.cloneElement)(i, s) : typeof i == "function" ? i(s) : /*#__PURE__*/ y.createElement(LO, s);
	return /*#__PURE__*/ y.createElement(Wn, {
		className: "recharts-active-dot",
		clipPath: o
	}, c);
};
function TA(e) {
	var t = e.points, n = e.mainColor, r = e.activeDot, i = e.itemDataKey, a = e.clipPath, o = e.zIndex, s = o === void 0 ? Fh.activeDot : o, c = V(Nw), l = vA();
	if (t == null || l == null) return null;
	var u = t.find((e) => l.includes(e.payload));
	return mr(u) ? null : /*#__PURE__*/ y.createElement(RT, { zIndex: s }, /*#__PURE__*/ y.createElement(wA, {
		point: u,
		childIndex: Number(c),
		mainColor: n,
		dataKey: i,
		activeDot: r,
		clipPath: a
	}));
}
//#endregion
//#region node_modules/recharts/es6/context/chartDataContext.js
var EA = (e) => {
	var t = e.chartData, n = $a(), r = Du();
	return (0, y.useEffect)(() => r ? () => {} : (n(sE(t)), () => {
		n(sE(void 0));
	}), [
		t,
		n,
		r
	]), null;
}, DA = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}
}, OA = Vc({
	name: "brush",
	initialState: DA,
	reducers: { setBrushSettings(e, t) {
		return t.payload == null ? DA : t.payload;
	} }
});
OA.actions.setBrushSettings;
var kA = OA.reducer, AA = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return {
		x: Math.min(n, i),
		y: Math.min(r, a),
		width: Math.abs(i - n),
		height: Math.abs(a - r)
	};
}, jA = (e) => {
	var t = e.x1, n = e.y1, r = e.x2, i = e.y2;
	return AA({
		x: t,
		y: n
	}, {
		x: r,
		y: i
	});
};
function MA(e) {
	return (e % 180 + 180) % 180;
}
var NA = function(e) {
	var t = e.width, n = e.height, r = MA(arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0) * Math.PI / 180, i = Math.atan(n / t), a = r > i && r < Math.PI - i ? n / Math.sin(r) : t / Math.cos(r);
	return Math.abs(a);
}, PA = Vc({
	name: "referenceElements",
	initialState: {
		dots: [],
		areas: [],
		lines: []
	},
	reducers: {
		addDot: (e, t) => {
			e.dots.push(t.payload);
		},
		removeDot: (e, t) => {
			var n = fc(e).dots.findIndex((e) => e === t.payload);
			n !== -1 && e.dots.splice(n, 1);
		},
		addArea: (e, t) => {
			e.areas.push(t.payload);
		},
		removeArea: (e, t) => {
			var n = fc(e).areas.findIndex((e) => e === t.payload);
			n !== -1 && e.areas.splice(n, 1);
		},
		addLine: (e, t) => {
			e.lines.push(G(t.payload));
		},
		removeLine: (e, t) => {
			var n = fc(e).lines.findIndex((e) => e === t.payload);
			n !== -1 && e.lines.splice(n, 1);
		}
	}
}), FA = PA.actions;
FA.addDot, FA.removeDot, FA.addArea, FA.removeArea;
var IA = FA.addLine, LA = FA.removeLine, RA = PA.reducer;
//#endregion
//#region node_modules/recharts/es6/container/ClipPathProvider.js
function zA(e, t) {
	return WA(e) || UA(e, t) || VA(e, t) || BA();
}
function BA() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function VA(e, t) {
	if (e) {
		if (typeof e == "string") return HA(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? HA(e, t) : void 0;
	}
}
function HA(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function UA(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function WA(e) {
	if (Array.isArray(e)) return e;
}
var GA = /*#__PURE__*/ (0, y.createContext)(void 0), KA = (e) => {
	var t = e.children, n = zA((0, y.useState)(`${lr("recharts")}-clip`), 1)[0], r = _A();
	if (r == null) return null;
	var i = r.x, a = r.y, o = r.width, s = r.height;
	return /*#__PURE__*/ y.createElement(GA.Provider, { value: n }, /*#__PURE__*/ y.createElement("defs", null, /*#__PURE__*/ y.createElement("clipPath", { id: n }, /*#__PURE__*/ y.createElement("rect", {
		x: i,
		y: a,
		height: s,
		width: o
	}))), t);
}, qA = () => (0, y.useContext)(GA), JA = class {
	constructor(e) {
		var t = e.x, n = e.y;
		this.xAxisScale = t, this.yAxisScale = n;
	}
	map(e, t) {
		var n = t.position;
		return {
			x: this.xAxisScale.map(e.x, { position: n }) ?? 0,
			y: this.yAxisScale.map(e.y, { position: n }) ?? 0
		};
	}
	mapWithFallback(e, t) {
		var n = t.position, r = t.fallback, i = r === "rangeMin" ? this.yAxisScale.rangeMin() : r === "rangeMax" ? this.yAxisScale.rangeMax() : 0, a = r === "rangeMin" ? this.xAxisScale.rangeMin() : r === "rangeMax" ? this.xAxisScale.rangeMax() : 0;
		return {
			x: this.xAxisScale.map(e.x, { position: n }) ?? a,
			y: this.yAxisScale.map(e.y, { position: n }) ?? i
		};
	}
	isInRange(e) {
		var t = e.x, n = e.y, r = t == null || this.xAxisScale.isInRange(t), i = n == null || this.yAxisScale.isInRange(n);
		return r && i;
	}
};
//#endregion
//#region node_modules/recharts/es6/cartesian/ReferenceLine.js
function YA(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function XA(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? YA(Object(n), !0).forEach(function(t) {
			ZA(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : YA(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function ZA(e, t, n) {
	return (t = QA(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function QA(e) {
	var t = $A(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function $A(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function ej() {
	return ej = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, ej.apply(null, arguments);
}
var tj = (e, t) => {
	var n;
	if (/*#__PURE__*/ y.isValidElement(e)) n = /*#__PURE__*/ y.cloneElement(e, t);
	else if (typeof e == "function") n = e(t);
	else {
		if (!K(t.x1) || !K(t.y1) || !K(t.x2) || !K(t.y2)) return null;
		n = /*#__PURE__*/ y.createElement("line", ej({}, t, { className: "recharts-reference-line-line" }));
	}
	return n;
}, nj = (e, t, n, r, i, a) => {
	var o = a.x, s = a.width, c = i.map(e, { position: n });
	if (!K(c) || t === "discard" && !i.isInRange(c)) return null;
	var l = [{
		x: o + s,
		y: c
	}, {
		x: o,
		y: c
	}];
	return r === "left" ? l.reverse() : l;
}, rj = (e, t, n, r, i, a) => {
	var o = a.y, s = a.height, c = i.map(e, { position: n });
	if (!K(c) || t === "discard" && !i.isInRange(c)) return null;
	var l = [{
		x: c,
		y: o + s
	}, {
		x: c,
		y: o
	}];
	return r === "top" ? l.reverse() : l;
}, ij = (e, t, n, r) => {
	var i = [r.mapWithFallback(e[0], {
		position: n,
		fallback: "rangeMin"
	}), r.mapWithFallback(e[1], {
		position: n,
		fallback: "rangeMax"
	})];
	return t === "discard" && i.some((e) => !r.isInRange(e)) ? null : i;
}, aj = (e, t, n, r, i, a, o) => {
	var s = o.x, c = o.y, l = o.segment, u = o.ifOverflow, d = sr(s);
	return sr(c) ? nj(c, u, r, a, t, n) : d ? rj(s, u, r, i, e, n) : l != null && l.length === 2 ? ij(l, u, r, new JA({
		x: e,
		y: t
	})) : null;
};
function oj(e) {
	var t = $a();
	return (0, y.useEffect)(() => (t(IA(e)), () => {
		t(LA(e));
	})), null;
}
function sj(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.shape, i = e.className, a = e.ifOverflow, o = Du(), s = qA(), c = V((e) => dx(e, t)), l = V((e) => mx(e, n)), u = V((e) => GS(e, "xAxis", t, o)), d = V((e) => GS(e, "yAxis", n, o)), f = od();
	if (!s || !f || c == null || l == null || u == null || d == null) return null;
	var p = aj(u, d, f, e.position, c.orientation, l.orientation, e);
	if (!p) return null;
	var m = p[0], h = p[1];
	if (m == null || h == null) return null;
	var g = m.x, _ = m.y, v = h.x, b = h.y, x = XA(XA({ clipPath: a === "hidden" ? `url(#${s})` : void 0 }, Nn(e)), {}, {
		x1: g,
		y1: _,
		x2: v,
		y2: b
	}), S = jA({
		x1: g,
		y1: _,
		x2: v,
		y2: b
	});
	return /*#__PURE__*/ y.createElement(RT, { zIndex: e.zIndex }, /*#__PURE__*/ y.createElement(Wn, { className: Tn("recharts-reference-line", i) }, tj(r, x), /*#__PURE__*/ y.createElement(cO, ej({}, S, {
		lowerWidth: S.width,
		upperWidth: S.width
	}), /*#__PURE__*/ y.createElement(SO, { label: e.label }), e.children)));
}
var cj = {
	ifOverflow: "discard",
	xAxisId: 0,
	yAxisId: 0,
	fill: "none",
	label: !1,
	stroke: "#ccc",
	fillOpacity: 1,
	strokeWidth: 1,
	position: "middle",
	zIndex: Fh.line
};
function lj(e) {
	var t = Ii(e, cj);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(oj, {
		yAxisId: t.yAxisId,
		xAxisId: t.xAxisId,
		ifOverflow: t.ifOverflow,
		x: t.x,
		y: t.y,
		segment: t.segment
	}), /*#__PURE__*/ y.createElement(sj, t));
}
lj.displayName = "ReferenceLine";
//#endregion
//#region node_modules/es-toolkit/dist/function/noop.mjs
function uj() {}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
function dj(e) {
	if (!e || typeof e != "object") return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null ? !1 : Object.prototype.toString.call(e) === "[object Object]";
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isEqualWith.mjs
function fj(e, t, n) {
	return pj(e, t, void 0, void 0, void 0, void 0, n);
}
function pj(e, t, n, r, i, a, o) {
	let s = o(e, t, n, r, i, a);
	if (s !== void 0) return s;
	if (typeof e == typeof t) switch (typeof e) {
		case "bigint":
		case "string":
		case "boolean":
		case "symbol":
		case "undefined": return e === t;
		case "number": return e === t || Object.is(e, t);
		case "function": return e === t;
		case "object": return mj(e, t, a, o);
	}
	return mj(e, t, a, o);
}
function mj(e, t, n, r) {
	if (Object.is(e, t)) return !0;
	let i = Ki(e), a = Ki(t);
	if (i === "[object Arguments]" && (i = B), a === "[object Arguments]" && (a = B), i !== a) return !1;
	switch (i) {
		case Ji: return e.toString() === t.toString();
		case Yi: return Ta(e.valueOf(), t.valueOf());
		case Xi:
		case $i:
		case Qi: return Object.is(e.valueOf(), t.valueOf());
		case qi: return e.source === t.source && e.flags === t.flags;
		case ra: return e === t;
	}
	n ??= /* @__PURE__ */ new Map();
	let o = n.get(e), s = n.get(t);
	if (o != null && s != null) return o === t;
	n.set(e, t), n.set(t, e);
	try {
		switch (i) {
			case ea:
				if (e.size !== t.size) return !1;
				for (let [i, a] of e.entries()) if (!t.has(i) || !pj(a, t.get(i), i, e, t, n, r)) return !1;
				return !0;
			case ta: {
				if (e.size !== t.size) return !1;
				let i = Array.from(e.values()), a = Array.from(t.values());
				for (let o = 0; o < i.length; o++) {
					let s = i[o], c = a.findIndex((i) => pj(s, i, void 0, e, t, n, r));
					if (c === -1) return !1;
					a.splice(c, 1);
				}
				return !0;
			}
			case na:
			case sa:
			case ca:
			case la:
			case ua:
			case da:
			case fa:
			case pa:
			case ma:
			case ha:
			case ga:
			case _a:
				if (ya(e) !== ya(t) || e.length !== t.length) return !1;
				for (let i = 0; i < e.length; i++) if (!pj(e[i], t[i], i, e, t, n, r)) return !1;
				return !0;
			case ia: return e.byteLength === t.byteLength && mj(new Uint8Array(e), new Uint8Array(t), n, r);
			case oa: return e.byteLength !== t.byteLength || e.byteOffset !== t.byteOffset ? !1 : mj(new Uint8Array(e), new Uint8Array(t), n, r);
			case aa: return e.name === t.name && e.message === t.message;
			case B: {
				if (!(mj(e.constructor, t.constructor, n, r) || dj(e) && dj(t))) return !1;
				let i = [...Object.keys(e), ...Gi(e)], a = [...Object.keys(t), ...Gi(t)];
				if (i.length !== a.length) return !1;
				for (let a = 0; a < i.length; a++) {
					let o = i[a], s = e[o];
					if (!Object.hasOwn(t, o)) return !1;
					let c = t[o];
					if (!pj(s, c, o, e, t, n, r)) return !1;
				}
				return !0;
			}
			default: return !1;
		}
	} finally {
		n.delete(e), n.delete(t);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isEqual.mjs
function hj(e, t) {
	return fj(e, t, uj);
}
//#endregion
//#region node_modules/recharts/es6/util/getEveryNth.js
function gj(e, t) {
	if (t < 1) return [];
	if (t === 1) return e;
	for (var n = [], r = 0; r < e.length; r += t) {
		var i = e[r];
		i !== void 0 && n.push(i);
	}
	return n;
}
//#endregion
//#region node_modules/recharts/es6/util/TickUtils.js
function _j(e, t, n) {
	return NA({
		width: e.width + t.width,
		height: e.height + t.height
	}, n);
}
function vj(e, t, n) {
	var r = n === "width", i = e.x, a = e.y, o = e.width, s = e.height;
	return t === 1 ? {
		start: r ? i : a,
		end: r ? i + o : a + s
	} : {
		start: r ? i + o : a + s,
		end: r ? i : a
	};
}
function yj(e, t, n, r, i) {
	if (e * t < e * r || e * t > e * i) return !1;
	var a = n();
	return e * (t - e * a / 2 - r) >= 0 && e * (t + e * a / 2 - i) <= 0;
}
function bj(e, t) {
	return gj(e, t + 1);
}
//#endregion
//#region node_modules/recharts/es6/cartesian/getEquidistantTicks.js
function xj(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = t.start, s = t.end, c = 0, l = 1, u = o, d = function() {
		var t = r?.[c];
		if (t === void 0) return { v: gj(r, l) };
		var a = c, d, f = () => (d === void 0 && (d = n(t, a)), d), p = t.coordinate, m = c === 0 || yj(e, p, f, u, s);
		m || (c = 0, u = o, l += 1), m && (u = p + e * (f() / 2 + i), c += l);
	}, f; l <= a.length;) if (f = d(), f) return f.v;
	return [];
}
function Sj(e, t, n, r, i) {
	var a = (r || []).slice().length;
	if (a === 0) return [];
	for (var o = t.start, s = t.end, c = 1; c <= a; c++) {
		for (var l = (a - 1) % c, u = o, d = !0, f = function() {
			var t = r[m];
			if (t == null) return 0;
			var a = m, o, c = () => (o === void 0 && (o = n(t, a)), o), f = t.coordinate, p = m === l || yj(e, f, c, u, s);
			if (!p) return d = !1, 1;
			p && (u = f + e * (c() / 2 + i));
		}, p, m = l; m < a && (p = f(), p === 0 || p !== 1); m += c);
		if (d) {
			for (var h = [], g = l; g < a; g += c) {
				var _ = r[g];
				_ != null && h.push(_);
			}
			return h;
		}
	}
	return [];
}
//#endregion
//#region node_modules/recharts/es6/cartesian/getTicks.js
function Cj(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function wj(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Cj(Object(n), !0).forEach(function(t) {
			Tj(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cj(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Tj(e, t, n) {
	return (t = Ej(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Ej(e) {
	var t = Dj(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Dj(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Oj(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = a.length, s = t.start, c = t.end, l = function(t) {
		var r = a[t];
		if (r == null) return 1;
		var l = r, u, d = () => (u === void 0 && (u = n(r, t)), u);
		if (t === o - 1) {
			var f = e * (l.coordinate + e * d() / 2 - c);
			a[t] = l = wj(wj({}, l), {}, { tickCoord: f > 0 ? l.coordinate - f * e : l.coordinate });
		} else a[t] = l = wj(wj({}, l), {}, { tickCoord: l.coordinate });
		l.tickCoord != null && yj(e, l.tickCoord, d, s, c) && (c = l.tickCoord - e * (d() / 2 + i), a[t] = wj(wj({}, l), {}, { isShow: !0 }));
	}, u = o - 1; u >= 0; u--) if (l(u)) continue;
	return a;
}
function kj(e, t, n, r, i, a) {
	var o = (r || []).slice(), s = o.length, c = t.start, l = t.end;
	if (a) {
		var u = r[s - 1];
		if (u != null) {
			var d = n(u, s - 1), f = e * (u.coordinate + e * d / 2 - l);
			o[s - 1] = u = wj(wj({}, u), {}, { tickCoord: f > 0 ? u.coordinate - f * e : u.coordinate }), u.tickCoord != null && yj(e, u.tickCoord, () => d, c, l) && (l = u.tickCoord - e * (d / 2 + i), o[s - 1] = wj(wj({}, u), {}, { isShow: !0 }));
		}
	}
	for (var p = a ? s - 1 : s, m = function(t) {
		var r = o[t];
		if (r == null) return 1;
		var a = r, s, u = () => (s === void 0 && (s = n(r, t)), s);
		if (t === 0) {
			var d = e * (a.coordinate - e * u() / 2 - c);
			o[t] = a = wj(wj({}, a), {}, { tickCoord: d < 0 ? a.coordinate - d * e : a.coordinate });
		} else o[t] = a = wj(wj({}, a), {}, { tickCoord: a.coordinate });
		a.tickCoord != null && yj(e, a.tickCoord, u, c, l) && (c = a.tickCoord + e * (u() / 2 + i), o[t] = wj(wj({}, a), {}, { isShow: !0 }));
	}, h = 0; h < p; h++) if (m(h)) continue;
	return o;
}
function Aj(e, t, n) {
	var r = e.tick, i = e.ticks, a = e.viewBox, o = e.minTickGap, s = e.orientation, c = e.interval, l = e.tickFormatter, u = e.unit, d = e.angle;
	if (!i || !i.length || !r) return [];
	if (z(c) || df.isSsr) return bj(i, z(c) ? c : 0) ?? [];
	var f = [], p = s === "top" || s === "bottom" ? "width" : "height", m = u && p === "width" ? $E(u, {
		fontSize: t,
		letterSpacing: n
	}) : {
		width: 0,
		height: 0
	}, h = (e, r) => {
		var i = typeof l == "function" ? l(e.value, r) : e.value;
		return p === "width" ? _j($E(i, {
			fontSize: t,
			letterSpacing: n
		}), m, d) : $E(i, {
			fontSize: t,
			letterSpacing: n
		})[p];
	}, g = i[0], _ = i[1], v = i.length >= 2 && g != null && _ != null ? ir(_.coordinate - g.coordinate) : 1, y = vj(a, v, p);
	return c === "equidistantPreserveStart" ? xj(v, y, h, i, o) : c === "equidistantPreserveEnd" ? Sj(v, y, h, i, o) : (f = c === "preserveStart" || c === "preserveStartEnd" ? kj(v, y, h, i, o, c === "preserveStartEnd") : Oj(v, y, h, i, o), f.filter((e) => e.isShow));
}
//#endregion
//#region node_modules/recharts/es6/util/YAxisUtils.js
var jj = (e) => {
	var t = e.ticks, n = e.label, r = e.labelGapWithTick, i = r === void 0 ? 5 : r, a = e.tickSize, o = a === void 0 ? 0 : a, s = e.tickMargin, c = s === void 0 ? 0 : s, l = 0;
	if (t) {
		Array.from(t).forEach((e) => {
			if (e) {
				var t = e.getBoundingClientRect();
				t.width > l && (l = t.width);
			}
		});
		var u = n ? n.getBoundingClientRect().width : 0, d = o + c, f = l + d + u + (n ? i : 0);
		return Math.round(f);
	}
	return 0;
}, Mj = (e) => {
	var t = e.ticks, n = e.label, r = e.labelGapWithTick, i = r === void 0 ? 5 : r, a = e.tickSize, o = a === void 0 ? 0 : a, s = e.tickMargin, c = s === void 0 ? 0 : s, l = 0;
	if (t) {
		Array.from(t).forEach((e) => {
			if (e) {
				var t = e.getBoundingClientRect();
				t.height > l && (l = t.height);
			}
		});
		var u = n ? n.getBoundingClientRect().height : 0, d = o + c, f = l + d + u + (n ? i : 0);
		return Math.round(f);
	}
	return 0;
}, Nj = Vc({
	name: "renderedTicks",
	initialState: {
		xAxis: {},
		yAxis: {}
	},
	reducers: {
		setRenderedTicks: (e, t) => {
			var n = t.payload, r = n.axisType, i = n.axisId, a = n.ticks;
			e[r][i] = G(a);
		},
		removeRenderedTicks: (e, t) => {
			var n = t.payload, r = n.axisType, i = n.axisId;
			delete e[r][i];
		}
	}
}), Pj = Nj.actions, Fj = Pj.setRenderedTicks, Ij = Pj.removeRenderedTicks, Lj = Nj.reducer, Rj = [
	"axisLine",
	"width",
	"height",
	"className",
	"hide",
	"ticks",
	"axisType",
	"axisId"
];
function zj(e, t) {
	return Wj(e) || Uj(e, t) || Vj(e, t) || Bj();
}
function Bj() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Vj(e, t) {
	if (e) {
		if (typeof e == "string") return Hj(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Hj(e, t) : void 0;
	}
}
function Hj(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Uj(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Wj(e) {
	if (Array.isArray(e)) return e;
}
function Gj(e, t) {
	if (e == null) return {};
	var n, r, i = Kj(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Kj(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function qj() {
	return qj = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, qj.apply(null, arguments);
}
function Jj(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Yj(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Jj(Object(n), !0).forEach(function(t) {
			Xj(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Jj(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Xj(e, t, n) {
	return (t = Zj(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Zj(e) {
	var t = Qj(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Qj(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var $j = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	viewBox: {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	},
	orientation: "bottom",
	ticks: [],
	stroke: "#666",
	tickLine: !0,
	axisLine: !0,
	tick: !0,
	mirror: !1,
	minTickGap: 5,
	tickSize: 6,
	tickMargin: 2,
	interval: "preserveEnd",
	zIndex: Fh.axis
};
function eM(e) {
	var t = e.x, n = e.y, r = e.width, i = e.height, a = e.orientation, o = e.mirror, s = e.axisLine, c = e.otherSvgProps;
	if (!s) return null;
	var l = Yj(Yj(Yj({}, c), jn(s)), {}, { fill: "none" });
	if (a === "top" || a === "bottom") {
		var u = +(a === "top" && !o || a === "bottom" && o);
		l = Yj(Yj({}, l), {}, {
			x1: t,
			y1: n + u * i,
			x2: t + r,
			y2: n + u * i
		});
	} else {
		var d = +(a === "left" && !o || a === "right" && o);
		l = Yj(Yj({}, l), {}, {
			x1: t + d * r,
			y1: n,
			x2: t + d * r,
			y2: n + i
		});
	}
	return /*#__PURE__*/ y.createElement("line", qj({}, l, { className: Tn("recharts-cartesian-axis-line", $n(s, "className")) }));
}
function tM(e, t, n, r, i, a, o, s, c) {
	var l, u, d, f, p, m, h = s ? -1 : 1, g = e.tickSize || o, _ = z(e.tickCoord) ? e.tickCoord : e.coordinate;
	switch (a) {
		case "top":
			l = u = e.coordinate, f = n + +!s * i, d = f - h * g, m = d - h * c, p = _;
			break;
		case "left":
			d = f = e.coordinate, u = t + +!s * r, l = u - h * g, p = l - h * c, m = _;
			break;
		case "right":
			d = f = e.coordinate, u = t + +s * r, l = u + h * g, p = l + h * c, m = _;
			break;
		default: l = u = e.coordinate, f = n + +s * i, d = f + h * g, m = d + h * c, p = _;
	}
	return {
		line: {
			x1: l,
			y1: d,
			x2: u,
			y2: f
		},
		tick: {
			x: p,
			y: m
		}
	};
}
function nM(e, t) {
	switch (e) {
		case "left": return t ? "start" : "end";
		case "right": return t ? "end" : "start";
		default: return "middle";
	}
}
function rM(e, t) {
	switch (e) {
		case "left":
		case "right": return "middle";
		case "top": return t ? "start" : "end";
		default: return t ? "end" : "start";
	}
}
function iM(e) {
	var t = e.option, n = e.tickProps, r = e.value, i, a = Tn(n.className, "recharts-cartesian-axis-tick-value");
	if (/*#__PURE__*/ y.isValidElement(t)) i = /*#__PURE__*/ y.cloneElement(t, Yj(Yj({}, n), {}, { className: a }));
	else if (typeof t == "function") i = t(Yj(Yj({}, n), {}, { className: a }));
	else {
		var o = "recharts-cartesian-axis-tick-value";
		typeof t != "boolean" && (o = Tn(o, VO(t))), i = /*#__PURE__*/ y.createElement(XD, qj({}, n, { className: o }), r);
	}
	return i;
}
function aM(e) {
	var t = e.ticks, n = e.axisType, r = e.axisId, i = $a(), a = (0, y.useRef)(null);
	return (0, y.useEffect)(() => {
		if (r != null && n != null) {
			var e = t.map((e) => ({
				value: e.value,
				coordinate: e.coordinate,
				offset: e.offset,
				index: e.index
			})), o = a.current;
			o != null && o.axisId === r && o.axisType === n && hj(o.ticks, e) || (a.current = {
				ticks: e,
				axisId: r,
				axisType: n
			}, i(Fj({
				ticks: e,
				axisId: r,
				axisType: n
			})));
		}
	}, [
		i,
		t,
		r,
		n
	]), (0, y.useEffect)(() => r == null || n == null ? _r : () => {
		i(Ij({
			axisId: r,
			axisType: n
		}));
	}, [
		i,
		r,
		n
	]), null;
}
var oM = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.ticks, r = n === void 0 ? [] : n, i = e.tick, a = e.tickLine, o = e.stroke, s = e.tickFormatter, c = e.unit, l = e.padding, u = e.tickTextProps, d = e.orientation, f = e.mirror, p = e.x, m = e.y, h = e.width, g = e.height, _ = e.tickSize, v = e.tickMargin, b = e.fontSize, x = e.letterSpacing, S = e.getTicksConfig, C = e.events, w = e.axisType, T = e.axisId, E = Aj(Yj(Yj({}, S), {}, { ticks: r }), b, x), D = jn(S), O = Mn(i), k = zD(D.textAnchor) ? D.textAnchor : nM(d, f), A = rM(d, f), j = {};
	typeof a == "object" && (j = a);
	var M = Yj(Yj({}, D), {}, { fill: "none" }, j), N = E.map((e) => Yj({ entry: e }, tM(e, p, m, h, g, d, _, f, v))), ee = N.map((e) => {
		var t = e.entry, n = e.line;
		return /*#__PURE__*/ y.createElement(Wn, {
			className: "recharts-cartesian-axis-tick",
			key: `tick-${t.value}-${t.coordinate}-${t.tickCoord}`
		}, a && /*#__PURE__*/ y.createElement("line", qj({}, M, n, { className: Tn("recharts-cartesian-axis-tick-line", $n(a, "className")) })));
	}), P = N.map((e, t) => {
		var n = e.entry, r = e.tick, a = Yj(Yj({}, Yj(Yj(Yj(Yj({ verticalAnchor: A }, D), {}, {
			textAnchor: k,
			stroke: "none",
			fill: o
		}, r), {}, {
			index: t,
			payload: n,
			visibleTicksCount: E.length,
			tickFormatter: s,
			padding: l
		}, u), {}, { angle: u?.angle ?? D.angle ?? 0 })), O);
		return /*#__PURE__*/ y.createElement(Wn, qj({
			className: "recharts-cartesian-axis-tick-label",
			key: `tick-label-${n.value}-${n.coordinate}-${n.tickCoord}`
		}, Ai(C, n, t)), i && /*#__PURE__*/ y.createElement(iM, {
			option: i,
			tickProps: a,
			value: `${typeof s == "function" ? s(n.value, t) : n.value}${c || ""}`
		}));
	});
	return /*#__PURE__*/ y.createElement("g", { className: `recharts-cartesian-axis-ticks recharts-${w}-ticks` }, /*#__PURE__*/ y.createElement(aM, {
		ticks: E,
		axisId: T,
		axisType: w
	}), P.length > 0 && /*#__PURE__*/ y.createElement(RT, { zIndex: Fh.label }, /*#__PURE__*/ y.createElement("g", {
		className: `recharts-cartesian-axis-tick-labels recharts-${w}-tick-labels`,
		ref: t
	}, P)), ee.length > 0 && /*#__PURE__*/ y.createElement("g", { className: `recharts-cartesian-axis-tick-lines recharts-${w}-tick-lines` }, ee));
}), sM = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.axisLine, r = e.width, i = e.height, a = e.className, o = e.hide, s = e.ticks, c = e.axisType, l = e.axisId, u = Gj(e, Rj), d = zj((0, y.useState)(""), 2), f = d[0], p = d[1], m = zj((0, y.useState)(""), 2), h = m[0], g = m[1], _ = (0, y.useRef)(null);
	(0, y.useImperativeHandle)(t, () => ({
		getCalculatedWidth: () => jj({
			ticks: _.current,
			label: e.labelRef?.current,
			labelGapWithTick: 5,
			tickSize: e.tickSize,
			tickMargin: e.tickMargin
		}),
		getCalculatedHeight: () => Mj({
			ticks: _.current,
			label: e.labelRef?.current,
			labelGapWithTick: 5,
			tickSize: e.tickSize,
			tickMargin: e.tickMargin
		})
	}));
	var v = (0, y.useCallback)((e) => {
		if (e) {
			var t = e.getElementsByClassName("recharts-cartesian-axis-tick-value");
			_.current = t;
			var n = t[0];
			if (n) {
				var r = window.getComputedStyle(n), i = r.fontSize, a = r.letterSpacing;
				(i !== f || a !== h) && (p(i), g(a));
			}
		}
	}, [f, h]);
	return o || r != null && r <= 0 || i != null && i <= 0 ? null : /*#__PURE__*/ y.createElement(RT, { zIndex: e.zIndex }, /*#__PURE__*/ y.createElement(Wn, { className: Tn("recharts-cartesian-axis", a) }, /*#__PURE__*/ y.createElement(eM, {
		x: e.x,
		y: e.y,
		width: r,
		height: i,
		orientation: e.orientation,
		mirror: e.mirror,
		axisLine: n,
		otherSvgProps: jn(e)
	}), /*#__PURE__*/ y.createElement(oM, {
		ref: v,
		axisType: c,
		events: u,
		fontSize: f,
		getTicksConfig: e,
		height: e.height,
		letterSpacing: h,
		mirror: e.mirror,
		orientation: e.orientation,
		padding: e.padding,
		stroke: e.stroke,
		tick: e.tick,
		tickFormatter: e.tickFormatter,
		tickLine: e.tickLine,
		tickMargin: e.tickMargin,
		tickSize: e.tickSize,
		tickTextProps: e.tickTextProps,
		ticks: s,
		unit: e.unit,
		width: e.width,
		x: e.x,
		y: e.y,
		axisId: l
	}), /*#__PURE__*/ y.createElement(cO, {
		x: e.x,
		y: e.y,
		width: e.width,
		height: e.height,
		lowerWidth: e.width,
		upperWidth: e.width
	}, /*#__PURE__*/ y.createElement(SO, {
		label: e.label,
		labelRef: e.labelRef
	}), e.children)));
}), cM = /*#__PURE__*/ y.forwardRef((e, t) => {
	var n = Ii(e, $j);
	return /*#__PURE__*/ y.createElement(sM, qj({}, n, { ref: t }));
});
cM.displayName = "CartesianAxis";
//#endregion
//#region node_modules/recharts/es6/theme/RechartsThemeContext.js
var lM = /*#__PURE__*/ (0, y.createContext)({ grid: {
	stroke: "#ccc",
	fill: "none"
} });
lM.Provider;
var uM = () => (0, y.useContext)(lM), dM = [
	"x1",
	"y1",
	"x2",
	"y2",
	"key"
], fM = ["offset"], pM = ["xAxisId", "yAxisId"], mM = ["xAxisId", "yAxisId"];
function hM(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function gM(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? hM(Object(n), !0).forEach(function(t) {
			_M(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : hM(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function _M(e, t, n) {
	return (t = vM(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function vM(e) {
	var t = yM(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function yM(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function bM() {
	return bM = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, bM.apply(null, arguments);
}
function xM(e, t) {
	if (e == null) return {};
	var n, r, i = SM(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function SM(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var CM = (e) => {
	var t = e.fill;
	if (!t || t === "none") return null;
	var n = e.fillOpacity, r = e.x, i = e.y, a = e.width, o = e.height, s = e.ry;
	return /*#__PURE__*/ y.createElement("rect", {
		x: r,
		y: i,
		ry: s,
		width: a,
		height: o,
		stroke: "none",
		fill: t,
		fillOpacity: n,
		className: "recharts-cartesian-grid-bg"
	});
};
function wM(e) {
	var t = e.option, n = e.lineItemProps, r;
	if (/*#__PURE__*/ y.isValidElement(t)) r = /*#__PURE__*/ y.cloneElement(t, n);
	else if (typeof t == "function") r = t(n);
	else {
		var i = n.x1, a = n.y1, o = n.x2, s = n.y2, c = n.key, l = jn(xM(n, dM)) ?? {};
		l.offset;
		var u = xM(l, fM), d = Array.isArray(u.strokeDasharray) ? u.strokeDasharray.join(",") : u.strokeDasharray;
		r = /*#__PURE__*/ y.createElement("line", bM({}, u, {
			strokeDasharray: d,
			x1: i,
			y1: a,
			x2: o,
			y2: s,
			fill: "none",
			key: c
		}));
	}
	return r;
}
function TM(e) {
	var t = e.x, n = e.width, r = e.horizontal, i = r === void 0 || r, a = e.horizontalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = xM(e, pM), s = a.map((e, r) => {
		var a = gM(gM({}, o), {}, {
			x1: t,
			y1: e,
			x2: t + n,
			y2: e,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ y.createElement(wM, {
			key: `line-${r}`,
			option: i,
			lineItemProps: a
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-grid-horizontal" }, s);
}
function EM(e) {
	var t = e.y, n = e.height, r = e.vertical, i = r === void 0 || r, a = e.verticalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = xM(e, mM), s = a.map((e, r) => {
		var a = gM(gM({}, o), {}, {
			x1: e,
			y1: t,
			x2: e,
			y2: t + n,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ y.createElement(wM, {
			option: i,
			lineItemProps: a,
			key: `line-${r}`
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-grid-vertical" }, s);
}
function DM(e) {
	var t = e.horizontalFill, n = e.fillOpacity, r = e.x, i = e.y, a = e.width, o = e.height, s = e.horizontalPoints, c = e.horizontal;
	if (!(c === void 0 || c) || !t || !t.length || s == null) return null;
	var l = s.map((e) => Math.round(e + i - i)).sort((e, t) => e - t);
	i !== l[0] && l.unshift(0);
	var u = l.map((e, s) => {
		var c = l[s + 1], u = c == null ? i + o - e : c - e;
		if (u <= 0) return null;
		var d = s % t.length;
		return /*#__PURE__*/ y.createElement("rect", {
			key: `react-${s}`,
			y: e,
			x: r,
			height: u,
			width: a,
			stroke: "none",
			fill: t[d],
			fillOpacity: n,
			className: "recharts-cartesian-grid-bg"
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-gridstripes-horizontal" }, u);
}
function OM(e) {
	var t = e.vertical, n = t === void 0 || t, r = e.verticalFill, i = e.fillOpacity, a = e.x, o = e.y, s = e.width, c = e.height, l = e.verticalPoints;
	if (!n || !r || !r.length) return null;
	var u = l.map((e) => Math.round(e + a - a)).sort((e, t) => e - t);
	a !== u[0] && u.unshift(0);
	var d = u.map((e, t) => {
		var n = u[t + 1], l = n == null ? a + s - e : n - e;
		if (l <= 0) return null;
		var d = t % r.length;
		return /*#__PURE__*/ y.createElement("rect", {
			key: `react-${t}`,
			x: e,
			y: o,
			width: l,
			height: c,
			stroke: "none",
			fill: r[d],
			fillOpacity: i,
			className: "recharts-cartesian-grid-bg"
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-gridstripes-vertical" }, d);
}
var kM = (e, t) => {
	var n = e.xAxis, r = e.width, i = e.height, a = e.offset;
	return Kl(Aj(gM(gM(gM({}, $j), n), {}, {
		ticks: ql(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.left, a.left + a.width, t);
}, AM = (e, t) => {
	var n = e.yAxis, r = e.width, i = e.height, a = e.offset;
	return Kl(Aj(gM(gM(gM({}, $j), n), {}, {
		ticks: ql(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.top, a.top + a.height, t);
}, jM = {
	horizontal: !0,
	vertical: !0,
	horizontalPoints: [],
	verticalPoints: [],
	verticalFill: [],
	horizontalFill: [],
	xAxisId: 0,
	yAxisId: 0,
	syncWithTicks: !1,
	zIndex: Fh.grid
};
function MM(e) {
	var t = ld(), n = ud(), r = cd(), i = gM(gM({}, Ii(e, jM)), {}, {
		x: z(e.x) ? e.x : r.left,
		y: z(e.y) ? e.y : r.top,
		width: z(e.width) ? e.width : r.width,
		height: z(e.height) ? e.height : r.height
	}), a = i.xAxisId, o = i.yAxisId, s = i.x, c = i.y, l = i.width, u = i.height, d = i.syncWithTicks, f = i.horizontalValues, p = i.verticalValues, m = Du(), h = V((e) => lC(e, "xAxis", a, m)), g = V((e) => lC(e, "yAxis", o, m)), _ = uM(), v = {
		stroke: i.stroke ?? _.grid.stroke,
		strokeWidth: i.strokeWidth ?? _.grid.strokeWidth,
		strokeOpacity: i.strokeOpacity ?? _.grid.strokeOpacity,
		strokeDasharray: i.strokeDasharray ?? _.grid.strokeDasharray
	};
	if (!Ll(l) || !Ll(u) || !z(s) || !z(c)) return null;
	var b = i.verticalCoordinatesGenerator || kM, x = i.horizontalCoordinatesGenerator || AM, S = i.horizontalPoints, C = i.verticalPoints;
	if ((!S || !S.length) && typeof x == "function") {
		var w = f && f.length, T = x({
			yAxis: g ? gM(gM({}, g), {}, { ticks: w ? f : g.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, w ? !0 : d);
		Nu(Array.isArray(T), `horizontalCoordinatesGenerator should return Array but instead it returned [${typeof T}]`), Array.isArray(T) && (S = T);
	}
	if ((!C || !C.length) && typeof b == "function") {
		var E = p && p.length, D = b({
			xAxis: h ? gM(gM({}, h), {}, { ticks: E ? p : h.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, E ? !0 : d);
		Nu(Array.isArray(D), `verticalCoordinatesGenerator should return Array but instead it returned [${typeof D}]`), Array.isArray(D) && (C = D);
	}
	return /*#__PURE__*/ y.createElement(RT, { zIndex: i.zIndex }, /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-grid" }, /*#__PURE__*/ y.createElement(CM, {
		fill: i.fill ?? _.grid.fill,
		fillOpacity: i.fillOpacity ?? _.grid.fillOpacity,
		x: i.x,
		y: i.y,
		width: i.width,
		height: i.height,
		ry: i.ry
	}), /*#__PURE__*/ y.createElement(DM, bM({}, i, { horizontalPoints: S })), /*#__PURE__*/ y.createElement(OM, bM({}, i, { verticalPoints: C })), /*#__PURE__*/ y.createElement(TM, bM({}, i, v, {
		offset: r,
		horizontalPoints: S,
		xAxis: h,
		yAxis: g
	})), /*#__PURE__*/ y.createElement(EM, bM({}, i, v, {
		offset: r,
		verticalPoints: C,
		xAxis: h,
		yAxis: g
	}))));
}
MM.displayName = "CartesianGrid";
//#endregion
//#region node_modules/recharts/es6/cartesian/LineDrawShape.js
var NM = [
	"animationElapsedTime",
	"isAnimating",
	"isEntrance",
	"visibleLength",
	"strokeDasharray",
	"connectNulls"
];
function PM() {
	return PM = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, PM.apply(null, arguments);
}
function FM(e, t) {
	if (e == null) return {};
	var n, r, i = IM(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function IM(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function LM(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function RM(e, t) {
	return `${t}px ${e}px`;
}
function zM(e) {
	return e.length % 2 == 0 ? e : [...e, ...e];
}
function BM(e, t) {
	for (var n = [], r = 0; r < t; ++r) n.push(...e);
	return n;
}
function VM(e, t, n) {
	var r = zM(n), i = r.reduce((e, t) => e + t, 0);
	if (!i) return RM(t, e);
	for (var a = Math.floor(e / i), o = e % i, s = [], c = 0, l = 0; c < r.length; l += (u = r[c]) ?? 0, ++c) {
		var u, d = r[c];
		if (d != null && l + d > o) {
			s = [...r.slice(0, c), o - l];
			break;
		}
	}
	var f = s.length % 2 == 0 ? [0, t] : [t];
	return [
		...BM(r, a),
		...s,
		...f
	].map((e) => `${e}px`).join(", ");
}
function HM(e, t, n) {
	return e ? VM(n, t, `${e}`.split(/[,\s]+/gim).map((e) => parseFloat(e))) : RM(t, n);
}
function UM(e) {
	e.animationElapsedTime, e.isAnimating, e.isEntrance;
	var t = e.visibleLength, n = e.strokeDasharray, r = e.connectNulls, i = FM(e, NM), a = r ?? !1, o;
	if (t != null) {
		var s = i.pathRef;
		o = HM(n, LM(s?.current ?? null), t);
	} else n != null && (o = String(n));
	return /*#__PURE__*/ y.createElement(qf, PM({}, i, {
		connectNulls: a,
		strokeDasharray: o
	}));
}
//#endregion
//#region node_modules/recharts/es6/cartesian/useAnimatedLineLength.js
function WM(e) {
	var t = (0, y.useRef)(0), n = (0, y.useRef)(0), r = (0, y.useRef)(!1), i = (0, y.useRef)(e);
	return i.current !== e && (t.current = n.current, i.current = e), (0, y.useCallback)((e, i) => {
		if (r.current) return null;
		var a = Math.min(nr(t.current + e * i), i);
		return e > 0 && i > 0 && (n.current = Math.max(n.current, a), a >= i) ? (r.current = !0, null) : a;
	}, []);
}
//#endregion
//#region node_modules/recharts/es6/state/errorBarSlice.js
var GM = Vc({
	name: "errorBars",
	initialState: {},
	reducers: {
		addErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.errorBar;
			e[r] || (e[r] = []), e[r].push(i);
		},
		replaceErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.prev, a = n.next;
			e[r] && (e[r] = e[r].map((e) => e.dataKey === i.dataKey && e.direction === i.direction ? a : e));
		},
		removeErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.errorBar;
			e[r] && (e[r] = e[r].filter((e) => e.dataKey !== i.dataKey || e.direction !== i.direction));
		}
	}
}), KM = GM.actions;
KM.addErrorBar, KM.replaceErrorBar, KM.removeErrorBar;
var qM = GM.reducer, JM = ["children"];
function YM(e, t) {
	if (e == null) return {};
	var n, r, i = XM(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function XM(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var ZM = /*#__PURE__*/ (0, y.createContext)({
	data: [],
	xAxisId: "xAxis-0",
	yAxisId: "yAxis-0",
	dataPointFormatter: () => ({
		x: 0,
		y: 0,
		value: 0
	}),
	errorBarOffset: 0
});
function QM(e) {
	var t = e.children, n = YM(e, JM);
	return /*#__PURE__*/ y.createElement(ZM.Provider, { value: n }, t);
}
//#endregion
//#region node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js
function $M(e, t) {
	var n = V((t) => dx(t, e)), r = V((e) => mx(e, t)), i = n?.allowDataOverflow ?? lx.allowDataOverflow, a = r?.allowDataOverflow ?? fx.allowDataOverflow;
	return {
		needClip: i || a,
		needClipX: i,
		needClipY: a
	};
}
function eN(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.clipPathId, i = _A(), a = $M(t, n), o = a.needClipX, s = a.needClipY, c = a.needClip, l = V((e) => RS(e, t, !1)), u = V((e) => zS(e, n, !1));
	if (!c || !i) return null;
	var d = i.x, f = i.y, p = i.width, m = i.height, h = o && l ? Math.min(l[0], l[1]) : d - p / 2, g = s && u ? Math.min(u[0], u[1]) : f - m / 2, _ = o && l ? Math.abs(l[1] - l[0]) : p * 2, v = s && u ? Math.abs(u[1] - u[0]) : m * 2;
	return /*#__PURE__*/ y.createElement("clipPath", { id: `clipPath-${r}` }, /*#__PURE__*/ y.createElement("rect", {
		x: h,
		y: g,
		width: _,
		height: v
	}));
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/lineSelectors.js
var tN = (e, t, n, r) => fC(e, "xAxis", t, r), nN = (e, t, n, r) => dC(e, "xAxis", t, r), rN = (e, t, n, r) => fC(e, "yAxis", n, r), iN = (e, t, n, r) => dC(e, "yAxis", n, r), aN = H([
	dd,
	tN,
	rN,
	nN,
	iN
], (e, t, n, r, i) => Gl(e, "xAxis") ? nu(t, r, !1) : nu(n, i, !1)), oN = (e, t, n, r, i) => i;
function sN(e) {
	return e.type === "line";
}
var cN = H([
	dd,
	tN,
	rN,
	nN,
	iN,
	H([Sx, oN], (e, t) => e.filter(sN).find((e) => e.id === t)),
	aN,
	eh
], (e, t, n, r, i, a, o, s) => {
	var c = s.chartData, l = s.dataStartIndex, u = s.dataEndIndex;
	if (!(a == null || t == null || n == null || r == null || i == null || r.length === 0 || i.length === 0 || o == null || e !== "horizontal" && e !== "vertical")) {
		var d = a.dataKey, f = a.data, p = f != null && f.length > 0 ? f : c?.slice(l, u + 1);
		if (p != null) return PN({
			layout: e,
			xAxis: t,
			yAxis: n,
			xAxisTicks: r,
			yAxisTicks: i,
			dataKey: d,
			bandSize: o,
			displayedData: p
		});
	}
});
//#endregion
//#region node_modules/recharts/es6/util/getRadiusAndStrokeWidthFromDot.js
function lN(e) {
	var t = Mn(e), n = 3, r = 2;
	if (t != null) {
		var i = t.r, a = t.strokeWidth, o = Number(i), s = Number(a);
		return (Number.isNaN(o) || o < 0) && (o = n), (Number.isNaN(s) || s < 0) && (s = r), {
			r: o,
			strokeWidth: s
		};
	}
	return {
		r: n,
		strokeWidth: r
	};
}
//#endregion
//#region node_modules/recharts/es6/cartesian/Line.js
var uN = ["id"], dN = [
	"type",
	"layout",
	"connectNulls",
	"needClip",
	"shape",
	"strokeDasharray"
], fN = [
	"activeDot",
	"animateNewValues",
	"animationBegin",
	"animationDuration",
	"animationEasing",
	"connectNulls",
	"dot",
	"hide",
	"isAnimationActive",
	"label",
	"legendType",
	"xAxisId",
	"yAxisId",
	"id"
];
function pN() {
	return pN = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, pN.apply(null, arguments);
}
function mN(e, t) {
	if (e == null) return {};
	var n, r, i = hN(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function hN(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function gN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function _N(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? gN(Object(n), !0).forEach(function(t) {
			vN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function vN(e, t, n) {
	return (t = yN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function yN(e) {
	var t = bN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function bN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function xN(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function SN(e) {
	var t = 0, n = 0;
	for (var r of e) r.status === "matched" && r.prev.x != null && r.next.x != null && (t += r.next.x - r.prev.x, n++);
	return n > 0 ? t / n : 0;
}
var CN = {
	activeDot: !0,
	animateNewValues: !0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationInterpolateFn: (e, t) => {
		if (e == null) return [];
		if (t === 1) return e.flatMap((e) => e.status === "removed" ? [] : [e.next]);
		var n = SN(e), r = [];
		for (var i of e) if (i.status === "matched") r.push(_N(_N({}, i.next), {}, {
			x: fr(i.prev.x, i.next.x, t),
			y: fr(i.prev.y, i.next.y, t)
		}));
		else if (i.status === "added") {
			if (i.next.x != null) {
				var a = i.next.x - n;
				r.push(_N(_N({}, i.next), {}, {
					x: fr(a, i.next.x, t),
					y: i.next.y
				}));
			} else r.push(i.next);
		} else if (i.status === "removed" && i.prev.x != null) {
			var o = i.prev.x + n;
			r.push(_N(_N({}, i.prev), {}, {
				x: fr(i.prev.x, o, t),
				y: i.prev.y
			}));
		}
		return r;
	},
	animationMatchBy: ck,
	connectNulls: !1,
	dot: !0,
	fill: "#fff",
	hide: !1,
	isAnimationActive: "auto",
	label: !1,
	legendType: "line",
	shape: UM,
	stroke: "#3182bd",
	strokeWidth: 1,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Fh.line,
	type: "linear"
}, wN = (e) => {
	var t = e.dataKey, n = e.name, r = e.stroke, i = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: i,
		color: r,
		value: ru(n, t),
		payload: e
	}];
}, TN = /*#__PURE__*/ y.memo((e) => {
	var t = e.dataKey, n = e.data, r = e.stroke, i = e.strokeWidth, a = e.fill, o = e.name, s = e.hide, c = e.unit, l = e.formatter, u = e.tooltipType, d = e.id, f = {
		dataDefinedOnItem: n,
		getPosition: _r,
		settings: {
			stroke: r,
			strokeWidth: i,
			fill: a,
			dataKey: t,
			nameKey: void 0,
			name: ru(o, t),
			hide: s,
			type: u,
			color: r,
			unit: c,
			formatter: l,
			graphicalItemId: d
		}
	};
	return /*#__PURE__*/ y.createElement(ek, { tooltipEntrySettings: f });
});
function EN(e) {
	var t = e.clipPathId, n = e.points, r = e.props, i = r.dot, a = r.dataKey, o = r.needClip;
	r.id;
	var s = jn(mN(r, uN));
	return /*#__PURE__*/ y.createElement(Qk, {
		points: n,
		dot: i,
		className: "recharts-line-dots",
		dotClassName: "recharts-line-dot",
		dataKey: a,
		baseProps: s,
		needClip: o,
		clipPathId: t
	});
}
function DN(e) {
	var t = e.showLabels, n = e.children, r = e.points, i = (0, y.useMemo)(() => r?.map((e) => {
		var t = {
			x: e.x ?? 0,
			y: e.y ?? 0,
			width: 0,
			lowerWidth: 0,
			upperWidth: 0,
			height: 0
		};
		return _N(_N({}, t), {}, {
			value: e.value,
			payload: e.payload,
			viewBox: t,
			parentViewBox: void 0,
			fill: void 0
		});
	}), [r]);
	return /*#__PURE__*/ y.createElement(AO, { value: t ? i : void 0 }, n);
}
function ON(e) {
	var t = e.clipPathId, n = e.pathRef, r = e.points, i = e.props, a = e.animationElapsedTime, o = e.isAnimating, s = e.isEntrance, c = e.visibleLength, l = i.type, u = i.layout, d = i.connectNulls, f = i.needClip, p = i.shape, m = i.strokeDasharray, h = _N(_N({}, Nn(mN(i, dN))), {}, {
		fill: "none",
		className: "recharts-line-curve",
		clipPath: f ? `url(#clipPath-${t})` : void 0,
		points: r,
		type: l,
		layout: u,
		connectNulls: d,
		strokeDasharray: m ?? i.strokeDasharray,
		pathRef: n,
		animationElapsedTime: a,
		isAnimating: o,
		isEntrance: i.animateNewValues ? s : !1,
		visibleLength: c
	});
	return /*#__PURE__*/ y.createElement(y.Fragment, null, r?.length > 1 && /*#__PURE__*/ y.createElement($O, {
		option: p,
		DefaultShape: CN.shape,
		shapeProps: h
	}), /*#__PURE__*/ y.createElement(EN, {
		points: r,
		clipPathId: t,
		props: i
	}));
}
function kN(e) {
	var t = e.clipPathId, n = e.props, r = e.pathRef, i = e.previousPointsRef, a = n.points, o = n.isAnimationActive, s = n.animationBegin, c = n.animationDuration, l = n.animationEasing, u = n.animationMatchBy, d = n.animationInterpolateFn, f = n.layout, p = xN(r.current), m = Sk(n.onAnimationStart, n.onAnimationEnd), h = m.isAnimating, g = m.handleAnimationStart, _ = m.handleAnimationEnd, v = !h, b = WM(a), x = (0, y.useCallback)((e) => e > 0 && p > 0, [p]);
	return /*#__PURE__*/ y.createElement(DN, {
		points: a,
		showLabels: v
	}, n.children, /*#__PURE__*/ y.createElement(Ck, {
		animationInput: a,
		animationIdPrefix: "recharts-line-",
		items: a,
		previousItemsRef: i,
		isAnimationActive: o,
		animationBegin: s,
		animationDuration: c,
		animationEasing: l,
		onAnimationStart: g,
		onAnimationEnd: _,
		animationInterpolateFn: d,
		animationMatchBy: u,
		shouldUpdatePreviousRef: x,
		layout: f
	}, (e, i, a) => {
		var o = h || i < 1, s = o ? b(i, p) : null;
		return /*#__PURE__*/ y.createElement(ON, {
			props: n,
			points: e,
			clipPathId: t,
			pathRef: r,
			animationElapsedTime: i,
			isAnimating: o,
			isEntrance: a,
			visibleLength: s
		});
	}), /*#__PURE__*/ y.createElement(FO, { label: n.label }));
}
function AN(e) {
	var t = e.clipPathId, n = e.props, r = (0, y.useRef)(null), i = (0, y.useRef)(null);
	return /*#__PURE__*/ y.createElement(kN, {
		props: n,
		clipPathId: t,
		previousPointsRef: r,
		pathRef: i
	});
}
var jN = (e, t) => ({
	x: e.x ?? void 0,
	y: e.y ?? void 0,
	value: e.value,
	errorVal: Ul(e.payload, t)
}), MN = class extends y.Component {
	render() {
		var e = this.props, t = e.hide, n = e.dot, r = e.points, i = e.className, a = e.xAxisId, o = e.yAxisId, s = e.top, c = e.left, l = e.width, u = e.height, d = e.id, f = e.needClip, p = e.zIndex;
		if (t) return null;
		var m = Tn("recharts-line", i), h = d, g = lN(n), _ = g.r, v = g.strokeWidth, b = HO(n), x = _ * 2 + v, S = f ? `url(#clipPath-${b ? "" : "dots-"}${h})` : void 0;
		return /*#__PURE__*/ y.createElement(RT, { zIndex: p }, /*#__PURE__*/ y.createElement(Wn, { className: m }, f && /*#__PURE__*/ y.createElement("defs", null, /*#__PURE__*/ y.createElement(eN, {
			clipPathId: h,
			xAxisId: a,
			yAxisId: o
		}), !b && /*#__PURE__*/ y.createElement("clipPath", { id: `clipPath-dots-${h}` }, /*#__PURE__*/ y.createElement("rect", {
			x: c - x / 2,
			y: s - x / 2,
			width: l + x,
			height: u + x
		}))), /*#__PURE__*/ y.createElement(QM, {
			xAxisId: a,
			yAxisId: o,
			data: r,
			dataPointFormatter: jN,
			errorBarOffset: 0
		}, /*#__PURE__*/ y.createElement(AN, {
			props: this.props,
			clipPathId: h
		}))), /*#__PURE__*/ y.createElement(TA, {
			activeDot: this.props.activeDot,
			points: r,
			mainColor: this.props.stroke,
			itemDataKey: this.props.dataKey,
			clipPath: S
		}));
	}
};
function NN(e) {
	var t = Ii(e, CN), n = t.activeDot, r = t.animateNewValues, i = t.animationBegin, a = t.animationDuration, o = t.animationEasing, s = t.connectNulls, c = t.dot, l = t.hide, u = t.isAnimationActive, d = t.label, f = t.legendType, p = t.xAxisId, m = t.yAxisId, h = t.id, g = mN(t, fN), _ = $M(p, m).needClip, v = _A(), b = fd(), x = Du(), S = V((e) => cN(e, p, m, x, h));
	if (b !== "horizontal" && b !== "vertical" || S == null || v == null) return null;
	var C = v.height, w = v.width, T = v.x, E = v.y;
	return /*#__PURE__*/ y.createElement(MN, pN({}, g, {
		id: h,
		connectNulls: s,
		dot: c,
		activeDot: n,
		animateNewValues: r,
		animationBegin: i,
		animationDuration: a,
		animationEasing: o,
		isAnimationActive: u,
		hide: l,
		label: d,
		legendType: f,
		xAxisId: p,
		yAxisId: m,
		points: S,
		layout: b,
		height: C,
		width: w,
		left: T,
		top: E,
		needClip: _
	}));
}
function PN(e) {
	var t = e.layout, n = e.xAxis, r = e.yAxis, i = e.xAxisTicks, a = e.yAxisTicks, o = e.dataKey, s = e.bandSize;
	return e.displayedData.map((e, c) => {
		var l = Ul(e, o);
		if (t === "horizontal") return {
			x: Xl({
				axis: n,
				ticks: i,
				bandSize: s,
				entry: e,
				index: c
			}),
			y: (mr(l) ? null : r.scale.map(l)) ?? null,
			value: l,
			payload: e
		};
		var u = mr(l) ? null : n.scale.map(l), d = Xl({
			axis: r,
			ticks: a,
			bandSize: s,
			entry: e,
			index: c
		});
		return u == null || d == null ? null : {
			x: u,
			y: d,
			value: l,
			payload: e
		};
	}).filter(Boolean);
}
function FN(e) {
	var t = Ii(e, CN), n = Du();
	return /*#__PURE__*/ y.createElement(Nk, {
		id: t.id,
		type: "line"
	}, (e) => /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(tk, { legendPayload: wN(t) }), /*#__PURE__*/ y.createElement(TN, {
		dataKey: t.dataKey,
		data: t.data,
		stroke: t.stroke,
		strokeWidth: t.strokeWidth,
		fill: t.fill,
		name: t.name,
		hide: t.hide,
		unit: t.unit,
		formatter: t.formatter,
		tooltipType: t.tooltipType,
		id: e
	}), /*#__PURE__*/ y.createElement(Bk, {
		type: "line",
		id: e,
		data: t.data,
		xAxisId: t.xAxisId,
		yAxisId: t.yAxisId,
		zAxisId: 0,
		dataKey: t.dataKey,
		hide: t.hide,
		isPanorama: n
	}), /*#__PURE__*/ y.createElement(NN, pN({}, t, { id: e }))));
}
var IN = /*#__PURE__*/ y.memo(FN, Vd);
IN.displayName = "Line";
//#endregion
//#region node_modules/recharts/es6/util/axisPropsAreEqual.js
var LN = ["domain", "range"], RN = ["domain", "range"];
function zN(e, t) {
	if (e == null) return {};
	var n, r, i = BN(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function BN(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function VN(e, t) {
	return e === t ? !0 : Array.isArray(e) && e.length === 2 && Array.isArray(t) && t.length === 2 ? e[0] === t[0] && e[1] === t[1] : !1;
}
function HN(e, t) {
	if (e === t) return !0;
	var n = e.domain, r = e.range, i = zN(e, LN), a = t.domain, o = t.range, s = zN(t, RN);
	return !VN(n, a) || !VN(r, o) ? !1 : Vd(i, s);
}
//#endregion
//#region node_modules/recharts/es6/cartesian/XAxis.js
var UN = ["type"], WN = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], GN = ["id", "scale"];
function KN() {
	return KN = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, KN.apply(null, arguments);
}
function qN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function JN(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? qN(Object(n), !0).forEach(function(t) {
			YN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function YN(e, t, n) {
	return (t = XN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function XN(e) {
	var t = ZN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ZN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function QN(e, t) {
	if (e == null) return {};
	var n, r, i = $N(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function $N(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function eP(e) {
	var t = $a(), n = (0, y.useRef)(null), r = pd(), i = e.type, a = QN(e, UN), o = zh(r, "xAxis", i), s = (0, y.useMemo)(() => {
		if (o != null) return JN(JN({}, a), {}, { type: o });
	}, [a, o]);
	return (0, y.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(oA(s)) : n.current !== s && t(sA({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, y.useLayoutEffect)(() => () => {
		n.current &&= (t(cA(n.current)), null);
	}, [t]), null;
}
var tP = (e) => {
	var t = e.xAxisId, n = e.className, r = e.height, i = e.label, a = (0, y.useRef)(null), o = (0, y.useRef)(null), s = V(Tu), c = Du(), l = $a(), u = "xAxis", d = V((e) => uC(e, u, t, c)), f = V((e) => $S(e, t)), p = V((e) => iC(e, t)), m = V((e) => ux(e, t));
	if ((0, y.useLayoutEffect)(() => {
		if (!(r !== "auto" || !f || pO(i) || /*#__PURE__*/ (0, y.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedHeight();
				Math.round(f.height) !== Math.round(n) && l(pA({
					id: t,
					height: n
				}));
			}
		}
	}, [
		d,
		f,
		l,
		i,
		t,
		r,
		m
	]), f == null || p == null || m == null) return null;
	e.dangerouslySetInnerHTML, e.ticks, e.scale;
	var h = QN(e, WN);
	m.id, m.scale;
	var g = QN(m, GN);
	return /*#__PURE__*/ y.createElement(cM, KN({}, h, g, {
		ref: a,
		labelRef: o,
		x: p.x,
		y: p.y,
		width: f.width,
		height: f.height,
		className: Tn(`recharts-${u} ${u}`, n),
		viewBox: s,
		ticks: d,
		axisType: u,
		axisId: t
	}));
}, nP = {
	allowDataOverflow: lx.allowDataOverflow,
	allowDecimals: lx.allowDecimals,
	allowDuplicatedCategory: lx.allowDuplicatedCategory,
	angle: lx.angle,
	axisLine: $j.axisLine,
	height: lx.height,
	hide: !1,
	includeHidden: lx.includeHidden,
	interval: lx.interval,
	label: !1,
	minTickGap: lx.minTickGap,
	mirror: lx.mirror,
	orientation: lx.orientation,
	padding: lx.padding,
	reversed: lx.reversed,
	scale: lx.scale,
	tick: lx.tick,
	tickCount: lx.tickCount,
	tickLine: $j.tickLine,
	tickSize: $j.tickSize,
	type: lx.type,
	niceTicks: lx.niceTicks,
	xAxisId: 0
}, rP = /*#__PURE__*/ y.memo((e) => {
	var t = Ii(e, nP);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(eP, {
		allowDataOverflow: t.allowDataOverflow,
		allowDecimals: t.allowDecimals,
		allowDuplicatedCategory: t.allowDuplicatedCategory,
		angle: t.angle,
		dataKey: t.dataKey,
		domain: t.domain,
		height: t.height,
		hide: t.hide,
		id: t.xAxisId,
		includeHidden: t.includeHidden,
		interval: t.interval,
		minTickGap: t.minTickGap,
		mirror: t.mirror,
		name: t.name,
		orientation: t.orientation,
		padding: t.padding,
		reversed: t.reversed,
		scale: t.scale,
		tick: t.tick,
		tickCount: t.tickCount,
		tickFormatter: t.tickFormatter,
		ticks: t.ticks,
		type: t.type,
		unit: t.unit,
		niceTicks: t.niceTicks
	}), /*#__PURE__*/ y.createElement(tP, t));
}, HN);
rP.displayName = "XAxis";
//#endregion
//#region node_modules/recharts/es6/cartesian/YAxis.js
var iP = ["type"], aP = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], oP = ["id", "scale"];
function sP() {
	return sP = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, sP.apply(null, arguments);
}
function cP(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function lP(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? cP(Object(n), !0).forEach(function(t) {
			uP(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : cP(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function uP(e, t, n) {
	return (t = dP(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function dP(e) {
	var t = fP(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function fP(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function pP(e, t) {
	if (e == null) return {};
	var n, r, i = mP(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function mP(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function hP(e) {
	var t = $a(), n = (0, y.useRef)(null), r = pd(), i = e.type, a = pP(e, iP), o = zh(r, "yAxis", i), s = (0, y.useMemo)(() => {
		if (o != null) return lP(lP({}, a), {}, { type: o });
	}, [o, a]);
	return (0, y.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(lA(s)) : n.current !== s && t(uA({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, y.useLayoutEffect)(() => () => {
		n.current &&= (t(dA(n.current)), null);
	}, [t]), null;
}
function gP(e) {
	var t = e.yAxisId, n = e.className, r = e.width, i = e.label, a = (0, y.useRef)(null), o = (0, y.useRef)(null), s = V(Tu), c = Du(), l = $a(), u = "yAxis", d = V((e) => oC(e, t)), f = V((e) => aC(e, t)), p = V((e) => uC(e, u, t, c)), m = V((e) => px(e, t));
	if ((0, y.useLayoutEffect)(() => {
		if (!(r !== "auto" || !d || pO(i) || /*#__PURE__*/ (0, y.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedWidth();
				Math.round(d.width) !== Math.round(n) && l(fA({
					id: t,
					width: n
				}));
			}
		}
	}, [
		p,
		d,
		l,
		i,
		t,
		r,
		m
	]), d == null || f == null || m == null) return null;
	e.dangerouslySetInnerHTML, e.ticks, e.scale;
	var h = pP(e, aP);
	m.id, m.scale;
	var g = pP(m, oP);
	return /*#__PURE__*/ y.createElement(cM, sP({}, h, g, {
		ref: a,
		labelRef: o,
		x: f.x,
		y: f.y,
		tickTextProps: r === "auto" ? { width: void 0 } : { width: r },
		width: d.width,
		height: d.height,
		className: Tn(`recharts-${u} ${u}`, n),
		viewBox: s,
		ticks: p,
		axisType: u,
		axisId: t
	}));
}
var _P = {
	allowDataOverflow: fx.allowDataOverflow,
	allowDecimals: fx.allowDecimals,
	allowDuplicatedCategory: fx.allowDuplicatedCategory,
	angle: fx.angle,
	axisLine: $j.axisLine,
	hide: !1,
	includeHidden: fx.includeHidden,
	interval: fx.interval,
	label: !1,
	minTickGap: fx.minTickGap,
	mirror: fx.mirror,
	orientation: fx.orientation,
	padding: fx.padding,
	reversed: fx.reversed,
	scale: fx.scale,
	tick: fx.tick,
	tickCount: fx.tickCount,
	tickLine: $j.tickLine,
	tickSize: $j.tickSize,
	type: fx.type,
	niceTicks: fx.niceTicks,
	width: fx.width,
	yAxisId: 0
}, vP = /*#__PURE__*/ y.memo((e) => {
	var t = Ii(e, _P);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(hP, {
		interval: t.interval,
		id: t.yAxisId,
		scale: t.scale,
		type: t.type,
		domain: t.domain,
		allowDataOverflow: t.allowDataOverflow,
		dataKey: t.dataKey,
		allowDuplicatedCategory: t.allowDuplicatedCategory,
		allowDecimals: t.allowDecimals,
		tickCount: t.tickCount,
		padding: t.padding,
		includeHidden: t.includeHidden,
		reversed: t.reversed,
		ticks: t.ticks,
		width: t.width,
		orientation: t.orientation,
		mirror: t.mirror,
		hide: t.hide,
		unit: t.unit,
		name: t.name,
		angle: t.angle,
		minTickGap: t.minTickGap,
		tick: t.tick,
		tickFormatter: t.tickFormatter,
		niceTicks: t.niceTicks
	}), /*#__PURE__*/ y.createElement(gP, t));
}, HN);
vP.displayName = "YAxis";
var yP = H([
	(e, t) => t,
	dd,
	tg,
	ug,
	Ew,
	Ow,
	sT,
	Cu
], yT);
//#endregion
//#region node_modules/recharts/es6/util/getRelativeCoordinate.js
function bP(e) {
	return "getBBox" in e.currentTarget && typeof e.currentTarget.getBBox == "function";
}
function xP(e) {
	var t = e.currentTarget.getBoundingClientRect(), n, r;
	if (bP(e)) {
		var i = e.currentTarget.getBBox();
		n = i.width > 0 ? t.width / i.width : 1, r = i.height > 0 ? t.height / i.height : 1;
	} else {
		var a = e.currentTarget;
		n = a.offsetWidth > 0 ? t.width / a.offsetWidth : 1, r = a.offsetHeight > 0 ? t.height / a.offsetHeight : 1;
	}
	var o = (e, i) => ({
		relativeX: Math.round((e - t.left) / n),
		relativeY: Math.round((i - t.top) / r)
	});
	return "touches" in e ? Array.from(e.touches).map((e) => o(e.clientX, e.clientY)) : o(e.clientX, e.clientY);
}
//#endregion
//#region node_modules/recharts/es6/state/mouseEventsMiddleware.js
var SP = yc("mouseClick"), CP = Dl();
CP.startListening({
	actionCreator: SP,
	effect: (e, t) => {
		var n = e.payload, r = yP(t.getState(), xP(n));
		r?.activeIndex != null && t.dispatch(jC({
			activeIndex: r.activeIndex,
			activeDataKey: void 0,
			activeCoordinate: r.activeCoordinate
		}));
	}
});
var wP = yc("mouseMove"), TP = Dl(), EP = null, DP = null, OP = null;
TP.startListening({
	actionCreator: wP,
	effect: (e, t) => {
		var n = e.payload, r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a?.includes("mousemove");
		EP !== null && (cancelAnimationFrame(EP), EP = null), DP !== null && (typeof i != "number" || !o) && (clearTimeout(DP), DP = null), OP = xP(n);
		var s = () => {
			var e = t.getState(), n = _C(e, e.tooltip.settings.shared);
			if (!OP) EP = null, DP = null;
			else {
				if (n === "axis") {
					var r = yP(e, OP);
					r?.activeIndex == null ? t.dispatch(kC()) : t.dispatch(AC({
						activeIndex: r.activeIndex,
						activeDataKey: void 0,
						activeCoordinate: r.activeCoordinate
					}));
				}
				EP = null, DP = null;
			}
		};
		o ? i === "raf" ? EP = requestAnimationFrame(s) : typeof i == "number" && DP === null && (DP = setTimeout(s, i)) : s();
	}
});
//#endregion
//#region node_modules/recharts/es6/state/reduxDevtoolsJsonStringifyReplacer.js
function kP(e, t) {
	return t instanceof HTMLElement ? `HTMLElement <${t.tagName} class="${t.className}">` : t === window ? "global.window" : e === "children" && typeof t == "object" && t ? "<<CHILDREN>>" : t;
}
//#endregion
//#region node_modules/recharts/es6/state/rootPropsSlice.js
var AP = {
	accessibilityLayer: !0,
	barCategoryGap: "10%",
	barGap: 4,
	barSize: void 0,
	className: void 0,
	maxBarSize: void 0,
	stackOffset: "none",
	syncId: void 0,
	syncMethod: "index",
	baseValue: void 0,
	reverseStackOrder: !1
}, jP = Vc({
	name: "rootProps",
	initialState: AP,
	reducers: { updateOptions: (e, t) => {
		e.accessibilityLayer = t.payload.accessibilityLayer, e.barCategoryGap = t.payload.barCategoryGap, e.barGap = t.payload.barGap ?? AP.barGap, e.barSize = t.payload.barSize, e.maxBarSize = t.payload.maxBarSize, e.stackOffset = t.payload.stackOffset, e.syncId = t.payload.syncId, e.syncMethod = t.payload.syncMethod, e.className = t.payload.className, e.baseValue = t.payload.baseValue, e.reverseStackOrder = t.payload.reverseStackOrder;
	} }
}), MP = jP.reducer, NP = jP.actions.updateOptions, PP = Vc({
	name: "polarOptions",
	initialState: null,
	reducers: { updatePolarOptions: (e, t) => e === null ? t.payload : (e.startAngle = t.payload.startAngle, e.endAngle = t.payload.endAngle, e.cx = t.payload.cx, e.cy = t.payload.cy, e.innerRadius = t.payload.innerRadius, e.outerRadius = t.payload.outerRadius, e) }
});
PP.actions.updatePolarOptions;
var FP = PP.reducer, IP = yc("keyDown"), LP = yc("focus"), RP = yc("blur"), zP = Dl(), BP = null, VP = null, HP = null;
zP.startListening({
	actionCreator: IP,
	effect: (e, t) => {
		HP = e.payload, BP !== null && (cancelAnimationFrame(BP), BP = null);
		var n = t.getState().eventSettings, r = n.throttleDelay, i = n.throttledEvents, a = i === "all" || i.includes("keydown");
		VP !== null && (typeof r != "number" || !a) && (clearTimeout(VP), VP = null);
		var o = () => {
			try {
				var e = t.getState();
				if (e.rootProps.accessibilityLayer === !1) return;
				var n = e.tooltip.keyboardInteraction, r = HP;
				if (r !== "ArrowRight" && r !== "ArrowLeft" && r !== "Enter") return;
				var i = KC(n, mw(e), Gx(e), Cw(e)), a = i == null ? -1 : Number(i), o = !Number.isFinite(a) || a < 0, s = Ow(e), c = mw(e), l = _C(e, e.tooltip.settings.shared);
				if (r === "Enter") {
					if (o) return;
					var u = fT(e, l, "hover", String(n.index));
					t.dispatch(NC({
						active: !n.active,
						activeIndex: n.index,
						activeCoordinate: u
					}));
					return;
				}
				var d = pC(e) === "left-to-right" ? 1 : -1, f = r === "ArrowRight" ? 1 : -1, p;
				if (o) {
					var m = Gx(e), h = Cw(e), g = f * d, _ = (e) => ({
						active: !1,
						index: String(e),
						dataKey: void 0,
						graphicalItemId: void 0,
						coordinate: void 0
					});
					if (p = -1, g > 0) {
						for (var v = 0; v < c.length; v++) if (KC(_(v), c, m, h) != null) {
							p = v;
							break;
						}
					} else for (var y = c.length - 1; y >= 0; y--) if (KC(_(y), c, m, h) != null) {
						p = y;
						break;
					}
					if (p < 0) return;
				} else {
					p = a + f * d;
					var b = s?.length || c.length;
					if (b === 0 || p >= b || p < 0) return;
				}
				var x = fT(e, l, "hover", String(p));
				t.dispatch(NC({
					active: !0,
					activeIndex: p.toString(),
					activeCoordinate: x
				}));
			} finally {
				BP = null, VP = null;
			}
		};
		a ? r === "raf" ? BP = requestAnimationFrame(o) : typeof r == "number" && VP === null && (o(), HP = null, VP = setTimeout(() => {
			HP ? o() : (VP = null, BP = null);
		}, r)) : o();
	}
}), zP.startListening({
	actionCreator: LP,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			if (!r.active && r.index == null) {
				var i = "0", a = fT(n, _C(n, n.tooltip.settings.shared), "hover", String(i));
				t.dispatch(NC({
					active: !0,
					activeIndex: i,
					activeCoordinate: a
				}));
			}
		}
	}
}), zP.startListening({
	actionCreator: RP,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			r.active && t.dispatch(NC({
				active: !1,
				activeIndex: r.index,
				activeCoordinate: r.coordinate
			}));
		}
	}
});
//#endregion
//#region node_modules/recharts/es6/util/createEventProxy.js
function UP(e) {
	e.persist();
	var t = e.currentTarget;
	return new Proxy(e, { get: (e, n) => {
		if (n === "currentTarget") return t;
		var r = Reflect.get(e, n);
		return typeof r == "function" ? r.bind(e) : r;
	} });
}
//#endregion
//#region node_modules/recharts/es6/state/externalEventsMiddleware.js
var WP = yc("externalEvent"), GP = Dl(), KP = /* @__PURE__ */ new Map(), qP = /* @__PURE__ */ new Map(), JP = /* @__PURE__ */ new Map();
GP.startListening({
	actionCreator: WP,
	effect: (e, t) => {
		var n = e.payload, r = n.handler, i = n.reactEvent;
		if (r != null) {
			var a = i.type, o = UP(i);
			JP.set(a, {
				handler: r,
				reactEvent: o
			});
			var s = KP.get(a);
			s !== void 0 && (cancelAnimationFrame(s), KP.delete(a));
			var c = t.getState().eventSettings, l = c.throttleDelay, u = c.throttledEvents, d = u === "all" || u?.includes(a), f = qP.get(a);
			f !== void 0 && (typeof l != "number" || !d) && (clearTimeout(f), qP.delete(a));
			var p = () => {
				var e = JP.get(a);
				try {
					if (!e) return;
					var n = e.handler, r = e.reactEvent, i = t.getState(), o = {
						activeCoordinate: Rw(i),
						activeDataKey: Fw(i),
						activeIndex: Nw(i),
						activeLabel: Pw(i),
						activeTooltipIndex: Nw(i),
						isTooltipActive: zw(i)
					};
					n && n(o, r);
				} finally {
					KP.delete(a), qP.delete(a), JP.delete(a);
				}
			};
			if (!d) p();
			else if (l === "raf") {
				var m = requestAnimationFrame(p);
				KP.set(a, m);
			} else if (typeof l == "number") {
				if (!qP.has(a)) {
					p();
					var h = setTimeout(p, l);
					qP.set(a, h);
				}
			} else p();
		}
	}
});
var YP = H([
	H([XC], (e) => e.tooltipItemPayloads),
	(e, t) => t,
	(e, t, n) => n
], (e, t, n) => {
	if (t != null) {
		var r = e.find((e) => e.settings.graphicalItemId === n);
		if (r != null) {
			var i = r.getPosition;
			if (i != null) return i(t);
		}
	}
}), XP = yc("touchMove"), ZP = Dl(), QP = null, $P = null, eF = null, tF = null;
ZP.startListening({
	actionCreator: XP,
	effect: (e, t) => {
		var n = e.payload;
		if (n.touches != null && n.touches.length !== 0) {
			tF = UP(n);
			var r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a.includes("touchmove");
			QP !== null && (cancelAnimationFrame(QP), QP = null), $P !== null && (typeof i != "number" || !o) && (clearTimeout($P), $P = null), eF = Array.from(n.touches).map((e) => xP({
				clientX: e.clientX,
				clientY: e.clientY,
				currentTarget: n.currentTarget
			}));
			var s = () => {
				if (tF != null) {
					var e = t.getState(), n = _C(e, e.tooltip.settings.shared);
					if (n === "axis") {
						var r = eF?.[0];
						if (r == null) {
							QP = null, $P = null;
							return;
						}
						var i = yP(e, r);
						i?.activeIndex != null && t.dispatch(AC({
							activeIndex: i.activeIndex,
							activeDataKey: void 0,
							activeCoordinate: i.activeCoordinate
						}));
					} else if (n === "item") {
						var a = tF.touches[0];
						if (document.elementFromPoint == null || a == null) return;
						var o = document.elementFromPoint(a.clientX, a.clientY);
						if (!o || !o.getAttribute) return;
						var s = o.getAttribute(fu), c = o.getAttribute("data-recharts-item-id") ?? void 0, l = uw(e).find((e) => e.id === c);
						if (s == null || l == null || c == null) return;
						var u = l.dataKey, d = YP(e, s, c);
						t.dispatch(OC({
							activeDataKey: u,
							activeIndex: s,
							activeCoordinate: d,
							activeGraphicalItemId: c
						}));
					}
					QP = null, $P = null;
				}
			};
			o ? i === "raf" ? QP = requestAnimationFrame(s) : typeof i == "number" && $P === null && (s(), tF = null, $P = setTimeout(() => {
				tF ? s() : ($P = null, QP = null);
			}, i)) : s();
		}
	}
});
//#endregion
//#region node_modules/recharts/es6/state/eventSettingsSlice.js
var nF = {
	throttleDelay: "raf",
	throttledEvents: [
		"mousemove",
		"touchmove",
		"pointermove",
		"scroll",
		"wheel"
	]
}, rF = Vc({
	name: "eventSettings",
	initialState: nF,
	reducers: { setEventSettings: (e, t) => {
		t.payload.throttleDelay != null && (e.throttleDelay = t.payload.throttleDelay), t.payload.throttledEvents != null && (e.throttledEvents = G(t.payload.throttledEvents));
	} }
}), iF = rF.actions.setEventSettings, aF = rF.reducer, oF = Wo({
	brush: kA,
	cartesianAxis: mA,
	chartData: lE,
	errorBars: qM,
	eventSettings: aF,
	graphicalItems: zk,
	layout: Fl,
	legend: Sd,
	options: nE,
	polarAxis: BO,
	polarOptions: FP,
	referenceElements: RA,
	renderedTicks: Lj,
	rootProps: MP,
	tooltip: PC,
	zIndex: IT
}), sF = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Chart";
	return jc({
		reducer: oF,
		preloadedState: e,
		middleware: (e) => e({
			serializableCheck: !1,
			immutableCheck: ![
				"commonjs",
				"es6",
				"production"
			].includes("es6")
		}).concat([
			CP.middleware,
			TP.middleware,
			zP.middleware,
			GP.middleware,
			ZP.middleware
		]),
		enhancers: (e) => {
			var t = e;
			return typeof e == "function" && (t = e()), t.concat(kc({ type: "raf" }));
		},
		devTools: df.devToolsEnabled && {
			serialize: { replacer: kP },
			name: `recharts-${t}`
		}
	});
};
//#endregion
//#region node_modules/recharts/es6/state/RechartsStoreProvider.js
function cF(e) {
	var t = e.preloadedState, n = e.children, r = e.reduxStoreName, i = Du(), a = (0, y.useRef)(null);
	if (i) return n;
	a.current ??= sF(t, r);
	var o = Xa;
	return /*#__PURE__*/ y.createElement(Rd, {
		context: o,
		store: a.current
	}, n);
}
//#endregion
//#region node_modules/recharts/es6/state/ReportMainChartProps.js
function lF(e) {
	var t = e.layout, n = e.margin, r = $a(), i = Du();
	return (0, y.useEffect)(() => {
		i || (r(Ml(t)), r(jl(n)));
	}, [
		r,
		i,
		t,
		n
	]), null;
}
var uF = /*#__PURE__*/ (0, y.memo)(lF, Vd);
//#endregion
//#region node_modules/recharts/es6/state/ReportChartProps.js
function dF(e) {
	var t = $a();
	return (0, y.useEffect)(() => {
		t(NP(e));
	}, [t, e]), null;
}
var fF = /*#__PURE__*/ (0, y.memo)((e) => {
	var t = $a();
	return (0, y.useEffect)(() => {
		t(iF(e));
	}, [t, e]), null;
}, Vd);
//#endregion
//#region node_modules/recharts/es6/zIndex/ZIndexPortal.js
function pF(e) {
	var t = e.zIndex, n = e.isPanorama, r = (0, y.useRef)(null), i = $a();
	return (0, y.useLayoutEffect)(() => (r.current && i(PT({
		zIndex: t,
		element: r.current,
		isPanorama: n
	})), () => {
		i(FT({
			zIndex: t,
			isPanorama: n
		}));
	}), [
		i,
		t,
		n
	]), /*#__PURE__*/ y.createElement("g", {
		tabIndex: -1,
		ref: r,
		className: `recharts-zIndex-layer_${t}`
	});
}
function mF(e) {
	var t = e.children, n = e.isPanorama, r = V(xT);
	if (!r || r.length === 0) return t;
	var i = r.filter((e) => e < 0), a = r.filter((e) => e > 0);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, i.map((e) => /*#__PURE__*/ y.createElement(pF, {
		key: e,
		zIndex: e,
		isPanorama: n
	})), t, a.map((e) => /*#__PURE__*/ y.createElement(pF, {
		key: e,
		zIndex: e,
		isPanorama: n
	})));
}
//#endregion
//#region node_modules/recharts/es6/container/RootSurface.js
var hF = ["children"];
function gF(e, t) {
	if (e == null) return {};
	var n, r, i = _F(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function _F(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function vF() {
	return vF = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, vF.apply(null, arguments);
}
var yF = {
	width: "100%",
	height: "100%",
	display: "block"
}, bF = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = ld(), r = ud(), i = Nf();
	if (!Ll(n) || !Ll(r)) return null;
	var a = e.children, o = e.otherAttributes, s = e.title, c = e.desc, l, u;
	return o != null && (l = typeof o.tabIndex == "number" ? o.tabIndex : i ? 0 : void 0, u = typeof o.role == "string" ? o.role : i ? "application" : void 0), /*#__PURE__*/ y.createElement(zn, vF({}, o, {
		title: s,
		desc: c,
		role: u,
		tabIndex: l,
		width: n,
		height: r,
		style: yF,
		ref: t
	}), a);
}), xF = (e) => {
	var t = e.children, n = V(ku);
	if (!n) return null;
	var r = n.width, i = n.height, a = n.y, o = n.x;
	return /*#__PURE__*/ y.createElement(zn, {
		width: r,
		height: i,
		x: o,
		y: a
	}, t);
}, SF = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.children, r = gF(e, hF);
	return Du() ? /*#__PURE__*/ y.createElement(xF, null, /*#__PURE__*/ y.createElement(mF, { isPanorama: !0 }, n)) : /*#__PURE__*/ y.createElement(bF, vF({ ref: t }, r), /*#__PURE__*/ y.createElement(mF, { isPanorama: !1 }, n));
});
//#endregion
//#region node_modules/recharts/es6/util/useReportScale.js
function CF(e, t) {
	return OF(e) || DF(e, t) || TF(e, t) || wF();
}
function wF() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function TF(e, t) {
	if (e) {
		if (typeof e == "string") return EF(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? EF(e, t) : void 0;
	}
}
function EF(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function DF(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function OF(e) {
	if (Array.isArray(e)) return e;
}
function kF() {
	var e = $a(), t = CF((0, y.useState)(null), 2), n = t[0], r = t[1], i = V(cu);
	return (0, y.useEffect)(() => {
		if (n != null) {
			var t = n.getBoundingClientRect().width / n.offsetWidth;
			K(t) && t !== i && e(Pl(t));
		}
	}, [
		n,
		e,
		i
	]), r;
}
//#endregion
//#region node_modules/recharts/es6/chart/RechartsWrapper.js
function AF(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function jF(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? AF(Object(n), !0).forEach(function(t) {
			MF(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : AF(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function MF(e, t, n) {
	return (t = NF(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function NF(e) {
	var t = PF(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function PF(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function FF() {
	return FF = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, FF.apply(null, arguments);
}
function IF(e, t) {
	return VF(e) || BF(e, t) || RF(e, t) || LF();
}
function LF() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function RF(e, t) {
	if (e) {
		if (typeof e == "string") return zF(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zF(e, t) : void 0;
	}
}
function zF(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function BF(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function VF(e) {
	if (Array.isArray(e)) return e;
}
var HF = () => (bE(), null);
function UF(e) {
	if (typeof e == "number") return e;
	if (typeof e == "string") {
		var t = parseFloat(e);
		if (!Number.isNaN(t)) return t;
	}
	return 0;
}
var WF = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = (0, y.useRef)(null), r = IF((0, y.useState)({
		containerWidth: UF(e.style?.width),
		containerHeight: UF(e.style?.height)
	}), 2), i = r[0], a = r[1], o = (0, y.useCallback)((e, t) => {
		a((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []), s = (0, y.useCallback)((e) => {
		if (typeof t == "function" && t(e), n.current != null && (n.current.disconnect(), n.current = null), e != null && typeof ResizeObserver < "u") {
			var r = e.getBoundingClientRect(), i = r.width, a = r.height;
			o(i, a);
			var s = new ResizeObserver((e) => {
				var t = e[0];
				if (t != null) {
					var n = t.contentRect, r = n.width, i = n.height;
					o(r, i);
				}
			});
			s.observe(e), n.current = s;
		}
	}, [t, o]);
	return (0, y.useEffect)(() => () => {
		n.current?.disconnect();
	}, [o]), /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(gd, {
		width: i.containerWidth,
		height: i.containerHeight
	}), /*#__PURE__*/ y.createElement("div", FF({ ref: s }, e)));
}), GF = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = IF((0, y.useState)({
		containerWidth: UF(n),
		containerHeight: UF(r)
	}), 2), a = i[0], o = i[1], s = (0, y.useCallback)((e, t) => {
		o((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []), c = (0, y.useCallback)((e) => {
		if (typeof t == "function" && t(e), e != null) {
			var n = e.getBoundingClientRect(), r = n.width, i = n.height;
			s(r, i);
		}
	}, [t, s]);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(gd, {
		width: a.containerWidth,
		height: a.containerHeight
	}), /*#__PURE__*/ y.createElement("div", FF({ ref: c }, e)));
}), KF = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(gd, {
		width: n,
		height: r
	}), /*#__PURE__*/ y.createElement("div", FF({ ref: t }, e)));
}), qF = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return typeof n == "string" || typeof r == "string" ? /*#__PURE__*/ y.createElement(GF, FF({}, e, { ref: t })) : typeof n == "number" && typeof r == "number" ? /*#__PURE__*/ y.createElement(KF, FF({}, e, {
		width: n,
		height: r,
		ref: t
	})) : /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(gd, {
		width: n,
		height: r
	}), /*#__PURE__*/ y.createElement("div", FF({ ref: t }, e)));
});
function JF(e) {
	return e ? WF : qF;
}
var YF = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.children, r = e.className, i = e.height, a = e.onClick, o = e.onContextMenu, s = e.onDoubleClick, c = e.onMouseDown, l = e.onMouseEnter, u = e.onMouseLeave, d = e.onMouseMove, f = e.onMouseUp, p = e.onTouchEnd, m = e.onTouchMove, h = e.onTouchStart, g = e.style, _ = e.width, v = e.responsive, b = e.dispatchTouchEvents, x = b === void 0 || b, S = (0, y.useRef)(null), C = $a(), w = IF((0, y.useState)(null), 2), T = w[0], E = w[1], D = IF((0, y.useState)(null), 2), O = D[0], k = D[1], A = kF(), j = rd(), M = j?.width > 0 ? j.width : _, N = j?.height > 0 ? j.height : i, ee = (0, y.useCallback)((e) => {
		A(e), typeof t == "function" && t(e), E(e), k(e), e != null && (S.current = e);
	}, [
		A,
		t,
		E,
		k
	]), P = (0, y.useCallback)((e) => {
		C(SP(e)), C(WP({
			handler: a,
			reactEvent: e
		}));
	}, [C, a]), te = (0, y.useCallback)((e) => {
		C(wP(e)), C(WP({
			handler: l,
			reactEvent: e
		}));
	}, [C, l]), ne = (0, y.useCallback)((e) => {
		C(kC()), C(WP({
			handler: u,
			reactEvent: e
		}));
	}, [C, u]), re = (0, y.useCallback)((e) => {
		C(wP(e)), C(WP({
			handler: d,
			reactEvent: e
		}));
	}, [C, d]), ie = (0, y.useCallback)(() => {
		C(LP());
	}, [C]), ae = (0, y.useCallback)(() => {
		C(RP());
	}, [C]), oe = (0, y.useCallback)((e) => {
		C(IP(e.key));
	}, [C]), se = (0, y.useCallback)((e) => {
		C(WP({
			handler: o,
			reactEvent: e
		}));
	}, [C, o]), ce = (0, y.useCallback)((e) => {
		C(WP({
			handler: s,
			reactEvent: e
		}));
	}, [C, s]), le = (0, y.useCallback)((e) => {
		C(WP({
			handler: c,
			reactEvent: e
		}));
	}, [C, c]), ue = (0, y.useCallback)((e) => {
		C(WP({
			handler: f,
			reactEvent: e
		}));
	}, [C, f]), de = (0, y.useCallback)((e) => {
		C(WP({
			handler: h,
			reactEvent: e
		}));
	}, [C, h]), F = (0, y.useCallback)((e) => {
		x && C(XP(e)), C(WP({
			handler: m,
			reactEvent: e
		}));
	}, [
		C,
		x,
		m
	]), fe = (0, y.useCallback)((e) => {
		C(WP({
			handler: p,
			reactEvent: e
		}));
	}, [C, p]), pe = JF(v);
	return /*#__PURE__*/ y.createElement(JT.Provider, { value: T }, /*#__PURE__*/ y.createElement(Dr.Provider, { value: O }, /*#__PURE__*/ y.createElement(pe, {
		width: M ?? g?.width,
		height: N ?? g?.height,
		className: Tn("recharts-wrapper", r),
		style: jF({
			position: "relative",
			cursor: "default",
			width: M,
			height: N
		}, g),
		onClick: P,
		onContextMenu: se,
		onDoubleClick: ce,
		onFocus: ie,
		onBlur: ae,
		onKeyDown: oe,
		onMouseDown: le,
		onMouseEnter: te,
		onMouseLeave: ne,
		onMouseMove: re,
		onMouseUp: ue,
		onTouchEnd: fe,
		onTouchMove: F,
		onTouchStart: de,
		ref: ee
	}, /*#__PURE__*/ y.createElement(HF, null), n)));
}), XF = [
	"width",
	"height",
	"responsive",
	"children",
	"className",
	"style",
	"compact",
	"title",
	"desc"
];
function ZF(e, t) {
	if (e == null) return {};
	var n, r, i = QF(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function QF(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var $F = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = e.responsive, a = e.children, o = e.className, s = e.style, c = e.compact, l = e.title, u = e.desc, d = jn(ZF(e, XF));
	return c ? /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(gd, {
		width: n,
		height: r
	}), /*#__PURE__*/ y.createElement(SF, {
		otherAttributes: d,
		title: l,
		desc: u
	}, a)) : /*#__PURE__*/ y.createElement(YF, {
		className: o,
		style: s,
		width: n,
		height: r,
		responsive: i ?? !1,
		onClick: e.onClick,
		onMouseLeave: e.onMouseLeave,
		onMouseEnter: e.onMouseEnter,
		onMouseMove: e.onMouseMove,
		onMouseDown: e.onMouseDown,
		onMouseUp: e.onMouseUp,
		onContextMenu: e.onContextMenu,
		onDoubleClick: e.onDoubleClick,
		onTouchStart: e.onTouchStart,
		onTouchMove: e.onTouchMove,
		onTouchEnd: e.onTouchEnd
	}, /*#__PURE__*/ y.createElement(SF, {
		otherAttributes: d,
		title: l,
		desc: u,
		ref: t
	}, /*#__PURE__*/ y.createElement(KA, null, a)));
});
//#endregion
//#region node_modules/recharts/es6/chart/CartesianChart.js
function eI() {
	return eI = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, eI.apply(null, arguments);
}
function tI(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function nI(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? tI(Object(n), !0).forEach(function(t) {
			rI(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tI(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function rI(e, t, n) {
	return (t = iI(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function iI(e) {
	var t = aI(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function aI(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var oI = nI({
	accessibilityLayer: !0,
	barCategoryGap: "10%",
	barGap: 4,
	layout: "horizontal",
	margin: {
		top: 5,
		right: 5,
		bottom: 5,
		left: 5
	},
	responsive: !1,
	reverseStackOrder: !1,
	stackOffset: "none",
	syncMethod: "index"
}, nF), sI = /*#__PURE__*/ (0, y.forwardRef)(function(e, t) {
	var n = Ii(e.categoricalChartProps, oI), r = e.chartName, i = e.defaultTooltipEventType, a = e.validateTooltipEventTypes, o = e.tooltipPayloadSearcher, s = e.categoricalChartProps, c = {
		chartName: r,
		defaultTooltipEventType: i,
		validateTooltipEventTypes: a,
		tooltipPayloadSearcher: o,
		eventEmitter: void 0
	};
	return /*#__PURE__*/ y.createElement(cF, {
		preloadedState: { options: c },
		reduxStoreName: s.id ?? r
	}, /*#__PURE__*/ y.createElement(EA, { chartData: s.data }), /*#__PURE__*/ y.createElement(uF, {
		layout: n.layout,
		margin: n.margin
	}), /*#__PURE__*/ y.createElement(fF, {
		throttleDelay: n.throttleDelay,
		throttledEvents: n.throttledEvents
	}), /*#__PURE__*/ y.createElement(dF, {
		baseValue: n.baseValue,
		accessibilityLayer: n.accessibilityLayer,
		barCategoryGap: n.barCategoryGap,
		maxBarSize: n.maxBarSize,
		stackOffset: n.stackOffset,
		barGap: n.barGap,
		barSize: n.barSize,
		syncId: n.syncId,
		syncMethod: n.syncMethod,
		className: n.className,
		reverseStackOrder: n.reverseStackOrder
	}), /*#__PURE__*/ y.createElement($F, eI({}, n, { ref: t })));
}), cI = ["axis"], lI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => /*#__PURE__*/ y.createElement(sI, {
	chartName: "LineChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: cI,
	tooltipPayloadSearcher: eE,
	categoricalChartProps: e,
	ref: t
}));
//#endregion
//#region src/lib/signal.js
function uI(e, t) {
	let n = t.filter((t) => e.est[t]), r = Array(e.n);
	for (let t = 0; t < e.n; t += 1) {
		let i = {
			t: e.t[t],
			truth: e.truth.anomaly[t]
		};
		for (let r of n) i[r] = e.est[r].signal[t];
		r[t] = i;
	}
	return r;
}
function dI(e, t) {
	let n = t.filter((t) => e.est[t]), r = Array(e.n);
	for (let t = 0; t < e.n; t += 1) {
		let i = { t: e.t[t] }, a = t >= e.metricStartIdx;
		for (let r of n) i[`${r}_res`] = a ? e.est[r].signal[t] - e.truth.anomaly[t] : null;
		r[t] = i;
	}
	return r;
}
function fI(e, t = 60) {
	let n = /* @__PURE__ */ new Set([0, e.jamIdx]), r = 0;
	for (let i = 0; i <= e.tEnd + 1e-9; i += t) {
		for (; r + 1 < e.n && Math.abs(e.t[r + 1] - i) <= Math.abs(e.t[r] - i);) r += 1;
		n.add(r);
	}
	return [...n].sort((e, t) => e - t);
}
//#endregion
//#region src/components/SignalPanel.jsx
var pI = 56, mI = {
	top: 8,
	right: 16,
	bottom: 8,
	left: 0
}, hI = {
	fill: le,
	fontSize: 12
}, gI = {
	background: "var(--color-surface-2)",
	border: "1px solid var(--color-border)",
	borderRadius: 4,
	color: "var(--color-text)",
	fontSize: 13
}, _I = "Same as TL until Phase 4, so the lines overlap.", vI = [...P.filter((e) => e !== "quantum"), "quantum"];
function yI() {
	let e = (0, y.useSyncExternalStore)(w.subscribe, w.getTime), t = gA(), n = _A();
	if (!t || !n) return null;
	let r = t(e);
	return Number.isFinite(r) ? /* @__PURE__ */ (0, F.jsx)("line", {
		x1: r,
		x2: r,
		y1: n.y,
		y2: n.y + n.height,
		stroke: ue,
		strokeWidth: 1,
		"aria-hidden": "true",
		pointerEvents: "none"
	}) : null;
}
function bI({ series: e }) {
	return /* @__PURE__ */ (0, F.jsx)("svg", {
		width: "28",
		height: "10",
		viewBox: "0 0 28 10",
		"aria-hidden": "true",
		focusable: "false",
		className: "dash-swatch",
		children: /* @__PURE__ */ (0, F.jsx)("line", {
			x1: "1",
			y1: "5",
			x2: "27",
			y2: "5",
			stroke: e.color,
			strokeWidth: "2",
			strokeDasharray: e.dash || void 0,
			strokeLinecap: e.key === "quantum" ? "round" : "butt"
		})
	});
}
var xI = (e) => {
	let t = Number(e?.signal_rmse_nT);
	return Number.isFinite(t) ? `RMSE ${t.toFixed(1)} nT` : "RMSE n/a";
}, SI = (e, t) => [Number.isFinite(e) ? `${e.toFixed(1)} nT` : "n/a", t], CI = (e) => `t = ${A(e)} s`;
function wI(e, t) {
	let n = ee[e];
	return /* @__PURE__ */ (0, F.jsx)(IN, {
		dataKey: t,
		name: n.label,
		stroke: n.color,
		strokeDasharray: n.dash || void 0,
		strokeLinecap: e === "quantum" ? "round" : "butt",
		dot: !1,
		activeDot: !1,
		isAnimationActive: !1,
		strokeWidth: 2,
		connectNulls: !1
	}, t);
}
function TI({ view: e, visible: t }) {
	let n = (0, y.useId)(), r = (0, y.useId)(), i = (0, y.useMemo)(() => e ? vI.filter((n) => t.has(n) && e.available.has(n)) : [], [e, t]), a = (0, y.useMemo)(() => e ? uI(e, i) : [], [e, i]), o = (0, y.useMemo)(() => e ? dI(e, i) : [], [e, i]);
	if (!e) return /* @__PURE__ */ (0, F.jsxs)("figure", {
		className: "signal-figure",
		role: "group",
		"aria-labelledby": n,
		tabIndex: 0,
		children: [/* @__PURE__ */ (0, F.jsx)("h2", {
			id: n,
			children: "Magnetic signal"
		}), /* @__PURE__ */ (0, F.jsx)("div", {
			className: "signal-loading",
			children: "Loading precomputed flight…"
		})]
	});
	let s = P.filter((e) => i.includes(e)), c = s.map((e) => ee[e].label), l = `Magnetic anomaly in nanotesla over flight time for truth${c.length ? ` and ${c.join(", ")}` : ""}. Data table available below.`, u = [0, e.tEnd], d = /* @__PURE__ */ (0, F.jsx)(rP, {
		dataKey: "t",
		type: "number",
		domain: u,
		allowDataOverflow: !0,
		tickCount: 7,
		tick: hI,
		stroke: ce,
		tickFormatter: k
	}), f = /* @__PURE__ */ (0, F.jsx)(vP, {
		width: pI,
		tick: hI,
		stroke: ce,
		tickFormatter: k
	}), p = /* @__PURE__ */ (0, F.jsx)(MM, {
		stroke: ce,
		strokeDasharray: "2 4"
	}), m = /* @__PURE__ */ (0, F.jsx)(LE, {
		isAnimationActive: !1,
		contentStyle: gI,
		labelStyle: { color: "var(--color-text)" },
		formatter: SI,
		labelFormatter: CI
	}), h = /* @__PURE__ */ (0, F.jsx)(lj, {
		x: e.jamT,
		stroke: re,
		strokeDasharray: "4 2",
		label: {
			value: "GPS jammed",
			fill: re,
			fontSize: 12,
			position: "insideTopRight"
		}
	});
	return /* @__PURE__ */ (0, F.jsxs)("figure", {
		className: "signal-figure",
		role: "group",
		"aria-labelledby": n,
		tabIndex: 0,
		children: [
			/* @__PURE__ */ (0, F.jsx)("h2", {
				id: n,
				children: "Magnetic signal"
			}),
			/* @__PURE__ */ (0, F.jsxs)("ul", {
				className: "signal-legend",
				children: [/* @__PURE__ */ (0, F.jsxs)("li", {
					className: "signal-legend-item",
					children: [
						/* @__PURE__ */ (0, F.jsx)(bI, { series: M }),
						/* @__PURE__ */ (0, F.jsx)("span", { children: M.label }),
						/* @__PURE__ */ (0, F.jsx)("span", {
							className: "rmse-badge rmse-badge-ref",
							children: "reference"
						})
					]
				}), s.map((t) => /* @__PURE__ */ (0, F.jsxs)("li", {
					className: "signal-legend-item",
					children: [
						/* @__PURE__ */ (0, F.jsx)(bI, { series: ee[t] }),
						/* @__PURE__ */ (0, F.jsx)("span", { children: ee[t].label }),
						/* @__PURE__ */ (0, F.jsx)("span", {
							className: "rmse-badge",
							children: xI(e.metrics[t])
						}),
						t === "quantum" && /* @__PURE__ */ (0, F.jsx)("span", {
							className: "legend-note",
							children: _I
						})
					]
				}, t))]
			}),
			i.length === 0 && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "help",
				children: "Only truth is shown. Turn on a series above to compare."
			}),
			/* @__PURE__ */ (0, F.jsx)("div", {
				className: "chart-box",
				role: "img",
				"aria-label": l,
				children: /* @__PURE__ */ (0, F.jsx)(ad, {
					width: "100%",
					height: 240,
					children: /* @__PURE__ */ (0, F.jsxs)(lI, {
						data: a,
						accessibilityLayer: !1,
						syncId: "signal",
						margin: mI,
						children: [
							p,
							d,
							f,
							m,
							h,
							/* @__PURE__ */ (0, F.jsx)(IN, {
								dataKey: "truth",
								name: M.label,
								stroke: M.color,
								dot: !1,
								activeDot: !1,
								isAnimationActive: !1,
								strokeWidth: 2
							}),
							i.map((e) => wI(e, e)),
							/* @__PURE__ */ (0, F.jsx)(yI, {})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, F.jsx)("h3", {
				id: r,
				className: "chart-title",
				children: "Residual (series − truth), nT"
			}),
			i.length === 0 ? /* @__PURE__ */ (0, F.jsx)("p", {
				className: "help residual-empty",
				children: "Turn on a series to see its residual."
			}) : /* @__PURE__ */ (0, F.jsx)("div", {
				className: "chart-box",
				role: "img",
				"aria-label": "Residual of each series against truth after GPS loss, in nanotesla.",
				children: /* @__PURE__ */ (0, F.jsx)(ad, {
					width: "100%",
					height: 140,
					children: /* @__PURE__ */ (0, F.jsxs)(lI, {
						data: o,
						accessibilityLayer: !1,
						syncId: "signal",
						margin: mI,
						children: [
							p,
							d,
							f,
							m,
							h,
							i.map((e) => wI(e, `${e}_res`)),
							/* @__PURE__ */ (0, F.jsx)(yI, {})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, F.jsx)("p", {
				className: "help",
				children: `RMSE is measured after GPS loss, from t = ${A(e.metricStartT)} s.`
			})
		]
	});
}
var EI = (0, y.memo)(TI), DI = (e) => {
	let t = Number(e);
	return e == null || !Number.isFinite(t) ? "n/a" : t.toLocaleString("en-US", {
		maximumFractionDigits: 1,
		minimumFractionDigits: 1
	});
};
function OI({ label: e, m: t, rmse: n, current: r }) {
	return /* @__PURE__ */ (0, F.jsxs)("tr", {
		className: r ? "row-current" : void 0,
		children: [
			/* @__PURE__ */ (0, F.jsx)("th", {
				scope: "row",
				children: r ? `${e} (on map)` : e
			}),
			/* @__PURE__ */ (0, F.jsx)("td", { children: DI(t?.mean_err_m) }),
			/* @__PURE__ */ (0, F.jsx)("td", { children: DI(t?.cep50_m) }),
			/* @__PURE__ */ (0, F.jsx)("td", { children: DI(t?.cep95_m) }),
			/* @__PURE__ */ (0, F.jsx)("td", { children: DI(t?.pct_under_556) }),
			/* @__PURE__ */ (0, F.jsx)("td", { children: n })
		]
	});
}
function kI({ view: e, sensor: t, mapTrack: n }) {
	if (!e) return null;
	let r = te[t] ?? t, i = P.filter((t) => e.available.has(t) && e.metrics[t]);
	return /* @__PURE__ */ (0, F.jsx)("div", {
		className: "table-scroll",
		children: /* @__PURE__ */ (0, F.jsxs)("table", {
			className: "data-table",
			children: [
				/* @__PURE__ */ (0, F.jsx)("caption", { children: `Position error after GPS loss: line ${e.id}, ${r}` }),
				/* @__PURE__ */ (0, F.jsx)("thead", { children: /* @__PURE__ */ (0, F.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, F.jsx)("th", {
						scope: "col",
						children: "Method"
					}),
					/* @__PURE__ */ (0, F.jsx)("th", {
						scope: "col",
						children: "Mean error (m)"
					}),
					/* @__PURE__ */ (0, F.jsx)("th", {
						scope: "col",
						children: "CEP50 (m)"
					}),
					/* @__PURE__ */ (0, F.jsx)("th", {
						scope: "col",
						children: "CEP95 (m)"
					}),
					/* @__PURE__ */ (0, F.jsx)("th", {
						scope: "col",
						children: "Under 556 m (%)"
					}),
					/* @__PURE__ */ (0, F.jsx)("th", {
						scope: "col",
						children: "Signal RMSE (nT)"
					})
				] }) }),
				/* @__PURE__ */ (0, F.jsxs)("tbody", { children: [/* @__PURE__ */ (0, F.jsx)(OI, {
					label: "Dead reckoning",
					m: e.metrics.dead_reckoning,
					rmse: "n/a",
					current: !1
				}), i.map((t) => /* @__PURE__ */ (0, F.jsx)(OI, {
					label: ee[t].label,
					m: e.metrics[t],
					rmse: DI(e.metrics[t]?.signal_rmse_nT),
					current: t === n
				}, t))] })
			]
		})
	});
}
var AI = (0, y.memo)(kI), jI = (e) => Number.isFinite(e) ? e.toFixed(1) : "n/a";
function MI({ view: e, i: t }) {
	let n = t === e.jamIdx;
	return /* @__PURE__ */ (0, F.jsx)("th", {
		scope: "row",
		children: n ? `${A(e.t[t])} (GPS jammed)` : A(e.t[t])
	});
}
function NI({ view: e, visible: t, mapTrack: n, sensor: r }) {
	let i = (0, y.useMemo)(() => e ? fI(e, 60) : [], [e]);
	if (!e) return null;
	let a = te[r] ?? r, o = e.available.has(n) ? n : null, s = o ? ee[o].label : "Estimate", c = P.filter((n) => t.has(n) && e.available.has(n));
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "text-alternatives",
		children: [/* @__PURE__ */ (0, F.jsxs)("details", { children: [/* @__PURE__ */ (0, F.jsx)("summary", { children: "Map track data (every 60 s)" }), /* @__PURE__ */ (0, F.jsx)("div", {
			className: "table-scroll",
			children: /* @__PURE__ */ (0, F.jsxs)("table", {
				className: "data-table",
				children: [
					/* @__PURE__ */ (0, F.jsx)("caption", { children: `Map track for line ${e.id}, ${a}: truth position and position errors` }),
					/* @__PURE__ */ (0, F.jsx)("thead", { children: /* @__PURE__ */ (0, F.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: "t (s)"
						}),
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: "Truth x (m)"
						}),
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: "Truth y (m)"
						}),
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: `${s} error (m)`
						}),
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: "Dead reckoning error (m)"
						})
					] }) }),
					/* @__PURE__ */ (0, F.jsx)("tbody", { children: i.map((t) => /* @__PURE__ */ (0, F.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, F.jsx)(MI, {
							view: e,
							i: t
						}),
						/* @__PURE__ */ (0, F.jsx)("td", { children: k(e.truth.x[t]) }),
						/* @__PURE__ */ (0, F.jsx)("td", { children: k(e.truth.y[t]) }),
						/* @__PURE__ */ (0, F.jsx)("td", { children: o ? k(Zt(e, o, t)) : "n/a" }),
						/* @__PURE__ */ (0, F.jsx)("td", { children: k(Qt(e, t)) })
					] }, t)) })
				]
			})
		})] }), /* @__PURE__ */ (0, F.jsxs)("details", { children: [/* @__PURE__ */ (0, F.jsx)("summary", { children: "Signal data (every 60 s)" }), /* @__PURE__ */ (0, F.jsx)("div", {
			className: "table-scroll",
			children: /* @__PURE__ */ (0, F.jsxs)("table", {
				className: "data-table",
				children: [
					/* @__PURE__ */ (0, F.jsx)("caption", { children: `Magnetic signal for line ${e.id}, ${a}, in nanotesla` }),
					/* @__PURE__ */ (0, F.jsx)("thead", { children: /* @__PURE__ */ (0, F.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: "t (s)"
						}),
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: "Truth (nT)"
						}),
						c.map((e) => /* @__PURE__ */ (0, F.jsx)("th", {
							scope: "col",
							children: `${ee[e].label} (nT)`
						}, e))
					] }) }),
					/* @__PURE__ */ (0, F.jsx)("tbody", { children: i.map((t) => /* @__PURE__ */ (0, F.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, F.jsx)(MI, {
							view: e,
							i: t
						}),
						/* @__PURE__ */ (0, F.jsx)("td", { children: jI(e.truth.anomaly[t]) }),
						c.map((n) => /* @__PURE__ */ (0, F.jsx)("td", { children: jI(e.est[n].signal[t]) }, n))
					] }, t)) }),
					c.length > 0 && /* @__PURE__ */ (0, F.jsx)("tfoot", { children: /* @__PURE__ */ (0, F.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, F.jsx)("th", {
							scope: "row",
							children: "RMSE after GPS loss"
						}),
						/* @__PURE__ */ (0, F.jsx)("td", { children: "reference" }),
						c.map((t) => /* @__PURE__ */ (0, F.jsx)("td", { children: jI(Number(e.metrics[t]?.signal_rmse_nT)) }, t))
					] }) })
				]
			})
		})] })]
	});
}
var PI = (0, y.memo)(NI);
//#endregion
//#region src/components/JamBanner.jsx
function FI({ view: e }) {
	let t = T();
	return !e || t < e.jamIdx ? null : /* @__PURE__ */ (0, F.jsx)("p", {
		className: "jam-banner",
		children: `GPS jammed at t = ${A(e.jamT)} s — magnetic-only from here`
	});
}
//#endregion
//#region src/components/Announcer.jsx
var II = null, LI = null, RI = null;
function zI(e) {
	if (!e) return;
	if (!II) {
		LI = e;
		return;
	}
	let t = II;
	t(""), RI !== null && cancelAnimationFrame(RI), RI = requestAnimationFrame(() => {
		RI = null, t(e);
	});
}
function BI() {
	let [e, t] = (0, y.useState)("");
	return (0, y.useEffect)(() => {
		if (II = t, LI) {
			let e = LI;
			LI = null, zI(e);
		}
		return () => {
			II === t && (II = null), RI !== null && cancelAnimationFrame(RI), RI = null;
		};
	}, []), /* @__PURE__ */ (0, F.jsx)("p", {
		role: "status",
		"aria-live": "polite",
		className: "sr-only",
		children: e
	});
}
//#endregion
//#region src/bridge.js
var VI = typeof backend < "u" ? backend : globalThis.backend ?? null, HI = Promise.resolve();
function UI(e) {
	let t = HI.then(e, e);
	return HI = t.catch(() => {}), t;
}
function WI(t, ...n) {
	return UI(async () => {
		let r = e[t];
		if (!r) throw Error(`magnav.api.${t} not found`);
		return String(await r.callPromising(VI, ...n));
	});
}
async function GI(e, ...t) {
	return JSON.parse(await WI(e, ...t));
}
//#endregion
//#region src/probe.js
function KI() {
	let e = null;
	try {
		e = typeof setTimeout(() => {}, 0)?.then == "function";
	} catch {
		e = "threw";
	}
	console.log("[probe] timers", JSON.stringify({
		sameAsGlobal: typeof setTimeout == "function" && setTimeout === globalThis.setTimeout,
		nativeGlobal: String(globalThis.setTimeout).includes("[native code]"),
		returnsPromise: e,
		setIntervalType: typeof globalThis.setInterval,
		setIntervalNative: String(globalThis.setInterval).includes("[native code]")
	}));
}
function qI() {
	requestAnimationFrame(() => requestAnimationFrame(() => {
		console.log("[probe] frame", JSON.stringify({
			innerHeight: window.innerHeight,
			scrollHeight: document.documentElement.scrollHeight,
			dpr: window.devicePixelRatio
		}));
	}));
}
async function JI(e) {
	let t = 0, n = 0, r = performance.now(), i = !0, a = 0, o = (e) => {
		i && (t += 1, n = Math.max(n, e - r), r = e, a = requestAnimationFrame(o));
	};
	a = requestAnimationFrame(o);
	let s = performance.now();
	try {
		return {
			result: await e(),
			ms: Math.round(performance.now() - s),
			frames: t,
			maxGapMs: Math.round(n)
		};
	} finally {
		i = !1, cancelAnimationFrame(a);
	}
}
function YI(e) {
	return async (t, ...n) => {
		let { result: r, ms: i, frames: a, maxGapMs: o } = await JI(() => e(t, ...n));
		return t === "live_step" ? console.log("[probe] live_step", JSON.stringify({
			ms: i,
			budgetMs: n[0],
			frames: a,
			maxGapMs: o,
			stage: r?.stage ?? null,
			fitting: r?.fitting ?? null,
			windowsDone: r?.windows_done ?? null
		})) : t === "live_result" && console.log("[probe] live_result", JSON.stringify({
			ms: i,
			frames: a,
			maxGapMs: o
		})), r;
	};
}
//#endregion
//#region src/hooks/useArtifact.js
function XI() {
	let [e, t] = (0, y.useState)({
		status: "loading",
		artifact: null,
		error: null
	});
	return (0, y.useEffect)(() => {
		let e = !1, n = performance.now();
		return (async () => {
			try {
				let r = await JI(() => WI("artifact_json"));
				console.log("[probe] main_thread", JSON.stringify({
					call: "artifact_json",
					ms: r.ms,
					frames: r.frames,
					maxGapMs: r.maxGapMs
				}));
				let i = JSON.parse(r.result);
				if (i?.ok !== !0) throw Error(i?.error_type ? `${i.error_type}: ${i.error}` : String(i?.error ?? "artifact_json failed"));
				let a = qt(i.artifact);
				if (a.length) throw Error(`invalid artifact: ${a.slice(0, 3).join("; ")}`);
				console.log("[probe] artifact_load", JSON.stringify({ ms: Math.round(performance.now() - n) })), e || t({
					status: "ready",
					artifact: i.artifact,
					error: null
				});
			} catch (n) {
				console.error("[artifact] load failed", n);
				let r = n?.message ?? String(n);
				e || t({
					status: "error",
					artifact: null,
					error: r
				});
			}
		})(), () => {
			e = !0;
		};
	}, []), e;
}
var ZI = ["raw", "lowpass"];
function QI(e, t) {
	let n = Error(t);
	return n.name = e, n;
}
function $I(e, t) {
	if (!e || typeof e != "object") throw QI("InvalidShape", `${t} returned no JSON object`);
	if (e.ok !== !0) throw QI(String(e.error_type ?? "Error"), String(e.error ?? `${t} failed`));
	return e;
}
async function eL({ line: e, sensor: t, simulateFailure: n = !1, callPy: r, now: i, yieldFn: a, validate: o, onStage: s = () => {}, onStep: c = () => {}, isCancelled: l = () => !1, tick: u = null }) {
	let d = i(), f = () => i() - d, p = 0, m = (e) => {
		e > p && (p = e, s(e));
	}, h = () => {
		if (l()) throw QI("Cancelled", "Live run cancelled");
		if (f() > 9e4) throw QI("Timeout", "Live run took longer than 90 s");
	}, g = async (...e) => {
		let t = Promise.resolve(r(...e));
		if (!u) return t;
		let n = !1, i = (async () => {
			for (; !n;) {
				if (await u(), n) return;
				let e = null;
				if (l() ? e = QI("Cancelled", "Live run cancelled") : f() > 9e4 && (e = QI("Timeout", "Live run took longer than 90 s")), e) throw e.abandoned = !0, t.catch(() => {}), e;
			}
		})();
		try {
			return await Promise.race([t, i]);
		} finally {
			n = !0;
		}
	}, _ = [], v = null, y = null;
	try {
		for (m(1), $I(await g("live_start", e, t, !!n), "live_start"), await a();;) {
			h();
			let e = i(), t = $I(await g("live_step", 250), "live_step"), n = i() - e;
			if (t.stage === 2 ? (m(2), v = f()) : t.stage === 3 && (m(3), v === null && (v = f() - n)), c(t, n), t.done) break;
			let r = t.per_denoiser ?? {}, o = r.tl;
			if (y === null && Array.isArray(o) && o[1] > 0 && o[0] >= o[1] && (y = Math.max(0, f() - (v ?? 0))), y !== null) for (let e of ZI) {
				let t = r[e];
				if (!_.includes(e) && Array.isArray(t) && !(t[0] >= t[1])) {
					if (t[0] > 0) break;
					if (f() + y > 8e4) h(), $I(await g("live_skip", e), "live_skip"), _.push(e);
					else break;
				}
			}
			await a();
		}
		await a(), h(), m(4);
		let r = $I(await g("live_result"), "live_result");
		if (!r.line || typeof r.line != "object") throw QI("InvalidShape", "live_result has no line");
		if (String(r.line.line) !== String(e) || String(r.sensor) !== String(t)) throw QI("InvalidShape", "live_result is for a different line/sensor");
		let s = o(r.line, t);
		if (s.length) throw QI("InvalidShape", s.slice(0, 3).join("; "));
		return {
			ok: !0,
			line: r.line,
			computed: r.computed ?? [],
			skipped: r.skipped ?? _,
			elapsedMs: f()
		};
	} catch (e) {
		try {
			let t = Promise.resolve(r("live_cancel"));
			e?.abandoned ? t.catch(() => {}) : await t;
		} catch {}
		return {
			ok: !1,
			reason: {
				name: String(e?.name ?? "Error"),
				message: String(e?.message ?? e)
			},
			stage: p || 1,
			elapsedMs: f(),
			skipped: _
		};
	}
}
function tL(e) {
	let t = e?.per_denoiser ?? {}, n = Object.keys(t), r = e?.denoiser ?? null, i = r ? n.indexOf(r) + 1 : 0, a = i > 0 && Array.isArray(t[r]) ? t[r] : null;
	return {
		windowsDone: a ? a[0] : e?.windows_done ?? 0,
		windowsTotal: a ? a[1] : e?.windows_total ?? 0,
		denoiser: r,
		denoiserIndex: i,
		denoiserCount: n.length,
		fitting: e?.fitting ?? null
	};
}
function nL(e) {
	let t = !1, n = !1, r = null;
	return {
		isInFlight: () => t,
		start(i) {
			return t ? Promise.resolve({
				ok: !1,
				reason: {
					name: "Busy",
					message: "A live run is already in progress"
				}
			}) : (t = !0, n = !1, r = eL({
				...e,
				...i,
				isCancelled: () => n
			}).finally(() => {
				t = !1, r = null;
			}), r);
		},
		cancel() {
			return t ? (n = !0, r) : Promise.resolve(null);
		}
	};
}
//#endregion
//#region src/hooks/useLiveRun.js
function rL() {
	return new Promise((e) => {
		let t = new MessageChannel();
		t.port1.onmessage = () => {
			t.port1.close(), e();
		}, t.port2.postMessage(0);
	});
}
function iL() {
	return new Promise((e) => {
		requestAnimationFrame(() => e());
	});
}
var aL = nL({
	callPy: YI(GI),
	now: () => performance.now(),
	yieldFn: rL,
	tick: iL,
	validate: R
}), oL = {
	windowsDone: 0,
	windowsTotal: 0,
	denoiser: null,
	denoiserIndex: 0,
	denoiserCount: 0,
	fitting: null
};
function sL() {
	let [e, t] = (0, y.useState)(!1), [n, r] = (0, y.useState)(0), [i, a] = (0, y.useState)(oL), o = (0, y.useRef)(null);
	return {
		inFlight: e,
		stage: n,
		progress: i,
		start: (0, y.useCallback)(async ({ line: e, sensor: n, simulateFailure: i, onStage: s }) => {
			if (aL.isInFlight()) return {
				ok: !1,
				reason: {
					name: "Busy",
					message: "A live run is already in progress"
				}
			};
			o.current = s ?? null, t(!0), r(0), a(oL);
			let c = 0, l = 0, u = {}, d = await aL.start({
				line: e,
				sensor: n,
				simulateFailure: i,
				onStage: (e) => {
					r(e), o.current?.(e);
				},
				onStep: (e, t) => {
					e.stage === 2 && (c = Math.max(c, t)), e.stage === 3 && (l += t);
					let n = e.per_denoiser ?? {};
					Object.keys(n).length && (u = n), a(tL(e));
				}
			}), f = Object.values(u).reduce((e, t) => e + t[0], 0);
			return console.log("[probe] live_summary", JSON.stringify({
				line: e,
				sensor: n,
				totalS: Math.round(d.elapsedMs) / 1e3,
				windows: f,
				msPerWindow: f ? Math.round(l / f * 10) / 10 : null,
				maxStage2CallMs: Math.round(c),
				budgetMs: 250,
				skipped: d.skipped ?? [],
				outcome: d.ok ? "ok" : `${d.reason.name}: ${d.reason.message}`
			})), d.ok || console.error("[live] failed", d.reason), t(!1), r(0), d;
		}, []),
		cancel: (0, y.useCallback)(() => aL.cancel(), [])
	};
}
//#endregion
//#region src/hooks/useReducedMotion.js
var cL = "(prefers-reduced-motion: reduce)";
function lL() {
	let [e, t] = (0, y.useState)(() => typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia(cL).matches);
	return (0, y.useEffect)(() => {
		if (typeof window.matchMedia != "function") return;
		let e = window.matchMedia(cL), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/lib/announce.js
var uL = (e) => String(Math.round(Number(e)));
function dL(e, t = () => globalThis.performance.now()) {
	let n = null, r = () => {
		let r = t();
		return n !== null && r - n < e ? !1 : (n = r, !0);
	};
	return r.mark = () => {
		n = t();
	}, r.reset = () => {
		n = null;
	}, r;
}
var fL = (e) => `${uL(e)} times speed`, pL = (e, t) => `Precomputed flight loaded. Line ${e}, ${t}. Press Play or Space to start.`, mL = (e) => `Playing at ${fL(e)}.`, hL = (e) => `Paused at ${uL(e)} seconds.`, gL = (e) => `GPS jammed at ${uL(e)} seconds. Navigating by magnetic map matching.`, _L = (e, t, n, r) => `${uL(e)} seconds. Position error, ${t}: ${uL(n)} metres. Dead reckoning: ${uL(r)} metres.`, vL = (e) => `Mode: ${String(e).replace(/…$/, "")}.`, yL = (e) => `Step ${uL(e)} of 4.`, bL = () => "Live run failed. Showing the precomputed replay.", xL = (e, t) => t == null || !Number.isFinite(Number(t)) ? "Replay finished." : `Replay finished. Final position error, ${e}: ${uL(t)} metres.`, SL = (e, t) => `Line ${e}, ${t}. Paused at start.`, CL = "1003.02", wL = "tl", TL = ["raw", "tl"], EL = 60, DL = 18e5, OL = 3e4, kL = "This run has ended. Press Stop, then Run, to start a new one.", AL = `Keep-alive limit (30 min) reached. ${kL}`, jL = 1e4, ML = "Live run cancelled.", NL, PL = new Promise((e) => {
	NL = e;
}), FL = { inFlight: !1 }, IL = "input, select, textarea, button, summary, [contenteditable]";
function LL() {
	let { status: e, artifact: t, error: n } = XI(), r = lL(), [i, a] = (0, y.useState)(CL), [o, s] = (0, y.useState)(null), [c, l] = (0, y.useState)(wL), [u, d] = (0, y.useState)(() => new Set(TL)), [f, p] = (0, y.useState)(EL), [m, h] = (0, y.useState)("precomputed"), [g, _] = (0, y.useState)(null), [v, b] = (0, y.useState)(null), [x, S] = (0, y.useState)(!1), C = sL(), [T, E] = (0, y.useState)(!1), [D, O] = (0, y.useState)(null), k = (0, y.useRef)(!1), A = (0, y.useRef)(null), j = {
		line: (0, y.useRef)(null),
		sensor: (0, y.useRef)(null),
		runLive: (0, y.useRef)(null)
	}, M = (0, y.useRef)(null), N = o ?? t?.default_sensor ?? null, { view: P, viewError: ne } = (0, y.useMemo)(() => {
		if (!t || !N) return {
			view: null,
			viewError: null
		};
		let e = g && g.line === i && g.sensor === N ? g.data : t.lines.find((e) => String(e.line) === i) ?? t.lines[0], n = R(e, N);
		return n.length ? {
			view: null,
			viewError: n.slice(0, 3).join("; ")
		} : {
			view: Xt(e, N),
			viewError: null
		};
	}, [
		t,
		i,
		N,
		g
	]), re = (0, y.useRef)(P);
	re.current = P;
	let ie = (0, y.useRef)(c);
	ie.current = c;
	let ae = (0, y.useRef)(!1), oe = (e) => e ? te[e] ?? e : "", se = (e) => ee[e]?.label ?? e;
	(0, y.useEffect)(() => {
		P && !ae.current && (ae.current = !0, zI(pL(P.id, oe(N))));
	}, [P, N]), (0, y.useEffect)(() => {
		let e = dL(jL), t = w.getIndex(), n = w.on("play", () => {
			e.mark(), zI(mL(w.getSpeed()));
		}), r = w.on("pause", () => zI(hL(w.getTime()))), i = w.on("end", () => {
			let e = re.current;
			if (!e) return;
			let t = ie.current;
			zI(xL(se(t), Zt(e, t, e.n - 1)));
		}), a = w.subscribe(() => {
			let n = re.current, r = w.getIndex(), i = t;
			if (t = r, n && w.isPlaying()) {
				if (i < n.jamIdx && n.jamIdx <= r) e.mark(), zI(gL(n.jamT));
				else if (r >= n.metricStartIdx && r < n.n && e()) {
					let e = ie.current, t = Zt(n, e, r);
					t !== null && zI(_L(n.t[r], se(e), t, Qt(n, r)));
				}
			}
		});
		return () => {
			n(), r(), i(), a();
		};
	}, []);
	let ce = (0, y.useRef)(m);
	ce.current = m;
	let le = (e) => ce.current === e ? "" : ` ${vL(ke(e))}`;
	(0, y.useEffect)(() => {
		g && (g.line !== i || g.sensor !== N) && (_(null), h("precomputed"), O(null));
	}, [
		i,
		N,
		g
	]), (0, y.useEffect)(() => {
		P && !P.available.has(c) && P.available.has(wL) && l(wL);
	}, [P, c]), (0, y.useEffect)(() => {
		P && w.load(P.t);
	}, [P]), (0, y.useEffect)(() => {
		w.setSpeed(f);
	}, [f]), (0, y.useEffect)(() => {
		w.setReduced(r);
	}, [r]);
	let ue = C.cancel, de = (0, y.useCallback)(async (e) => {
		if (!k.current) {
			if (k.current = !0, document.activeElement?.closest?.(".end-run") && A.current?.focus(), M.current = null, E(!0), FL.inFlight) {
				let t = `${ML} ${e}`;
				O(t), zI(`${t}${le("precomputed")}`), await ue();
			} else O(e);
			NL();
		}
	}, [ue]);
	(0, y.useEffect)(() => {
		KI(), qI();
	}, []), (0, y.useEffect)(() => {
		function e(e) {
			if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
			let t = e.target;
			if (t instanceof Element && t.closest(IL)) return;
			let n = re.current;
			if (n) switch (e.key) {
				case " ":
				case "Spacebar":
					if (e.preventDefault(), e.repeat) break;
					w.toggle();
					break;
				case "ArrowLeft":
				case "ArrowRight":
					e.preventDefault(), w.stepWindow(e.key === "ArrowRight" ? 1 : -1);
					break;
				case "Home":
					e.preventDefault(), w.seekIndex(0);
					break;
				case "End":
					e.preventDefault(), w.seekIndex(n.n - 1);
					break;
				case "j":
				case "J": e.preventDefault(), w.seekTime(n.jamT - 5);
			}
		}
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}, []), (0, y.useEffect)(() => {
		let e = performance.now(), t = () => w.isPlaying() || FL.inFlight, n = () => {
			if (k.current) return;
			let n = performance.now();
			t() ? e = n : n - e >= DL && de(AL);
		}, r = () => {
			n(), e = performance.now();
		};
		document.addEventListener("pointerdown", r, !0), document.addEventListener("keydown", r, !0);
		let i = w.on("end", () => {
			e = performance.now();
		}), a = globalThis.setInterval(n, OL);
		return () => {
			document.removeEventListener("pointerdown", r, !0), document.removeEventListener("keydown", r, !0), i(), globalThis.clearInterval(a);
		};
	}, [de]);
	let fe = (0, y.useCallback)(async () => {
		if (C.inFlight || k.current || !N) return;
		let e = i, t = N, n = oe(t);
		w.pause();
		let r = document.activeElement, a = [
			j.runLive.current,
			j.line.current,
			j.sensor.current
		];
		r && a.includes(r) && (M.current = r, A.current?.focus()), b(null), O(null), zI(`${vL(ke("computing"))} ${yL(1)}`), h("computing"), FL.inFlight = !0;
		let o;
		try {
			o = await C.start({
				line: e,
				sensor: t,
				simulateFailure: x,
				onStage: (e) => {
					e > 1 && zI(yL(e));
				}
			});
		} finally {
			FL.inFlight = !1;
		}
		if (k.current) {
			_(null), h("precomputed"), w.pause();
			return;
		}
		if (o.ok) {
			_({
				line: e,
				sensor: t,
				data: o.line
			}), zI(vL(ke("computed"))), h("computed"), O(`Live run finished in ${(o.elapsedMs / 1e3).toFixed(1)} s. Showing results computed in your browser.`), w.pause(), w.seekIndex(0);
			return;
		}
		_(null), h("precomputed"), w.pause(), w.seekIndex(0);
		let s = o.reason.name === "Timeout" ? "Live run took longer than 90 s." : `Live run failed: ${o.reason.name}: ${o.reason.message}.`;
		b(`${s} Showing the precomputed replay for ${e} / ${n}.`), zI(`${bL()} ${vL(ke("precomputed"))}`);
	}, [
		C,
		i,
		N,
		x
	]);
	(0, y.useEffect)(() => {
		if (C.inFlight || !M.current) return;
		let e = M.current;
		M.current = null;
		let t = document.activeElement;
		(!t || t === document.body || t === A.current) && e.isConnected && !e.disabled && e.focus();
	}, [C.inFlight]);
	let pe = (0, y.useCallback)((e) => {
		b(null), w.pause(), w.seekIndex(0), a(e), zI(`${SL(e, oe(N))}${le("precomputed")}`);
	}, [N]), me = (0, y.useCallback)((e) => {
		b(null), w.pause(), w.seekIndex(0), s(e), zI(`${SL(i, oe(e))}${le("precomputed")}`);
	}, [i]), I = (0, y.useCallback)((e, t) => {
		d((n) => {
			let r = new Set(n);
			return t ? r.add(e) : r.delete(e), r;
		});
	}, []), L = e === "error" ? n : ne, he = L ? `Could not load the precomputed flight (${L}). Press Stop, then Run, to reload the project.` : v, ge = e !== "ready" || !P, _e = t ? t.lines.map((e) => String(e.line)) : [CL], ve = t ? t.sensors : Object.keys(te), ye = oe(N), be = !!VI || !1, Se = {
		enabled: be && !C.inFlight && !T && !ge,
		hasBackend: be,
		onRun: fe,
		simulateFailure: x,
		onSimulateFailureChange: S
	};
	return /* @__PURE__ */ (0, F.jsxs)("main", {
		className: "page",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("header", { children: [/* @__PURE__ */ (0, F.jsx)("h1", { children: "Quantum MagNav: holding position without GPS" }), /* @__PURE__ */ (0, F.jsx)("p", {
				className: "intro",
				children: "A real survey flight over the Ottawa magnetic anomaly map. After GPS is jammed, position comes only from matching the cleaned magnetometer signal against the map."
			})] }),
			/* @__PURE__ */ (0, F.jsx)(xe, {
				lines: _e,
				sensors: ve,
				line: i,
				sensor: N ?? "mag_5_uc",
				mapTrack: c,
				visible: u,
				speed: f,
				view: P,
				disabled: ge,
				selectionLocked: C.inFlight,
				live: Se,
				focusRefs: j,
				onLineChange: pe,
				onSensorChange: me,
				onMapTrackChange: l,
				onToggleSeries: I,
				onSpeedChange: p
			}),
			/* @__PURE__ */ (0, F.jsx)(Me, {
				mode: m,
				message: D,
				jamT: P ? P.jamT : null,
				provenance: t?.provenance ?? null,
				danger: he,
				onEndRun: () => de(kL),
				runEnded: T,
				live: C.inFlight ? {
					stage: C.stage,
					progress: C.progress
				} : null,
				reduced: r,
				focusRef: A
			}),
			/* @__PURE__ */ (0, F.jsx)("div", {
				className: "jam-slot",
				children: /* @__PURE__ */ (0, F.jsx)(FI, { view: P })
			}),
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "main-grid",
				children: [/* @__PURE__ */ (0, F.jsx)(Cn, {
					view: P,
					mapTrack: c,
					sensorLabel: ye
				}), /* @__PURE__ */ (0, F.jsx)("section", {
					className: "signal-col",
					children: /* @__PURE__ */ (0, F.jsx)(EI, {
						view: P,
						visible: u
					})
				})]
			}),
			/* @__PURE__ */ (0, F.jsxs)("section", {
				className: "panel results",
				"aria-labelledby": "results-title",
				children: [
					/* @__PURE__ */ (0, F.jsx)("h2", {
						id: "results-title",
						children: "Navigation accuracy"
					}),
					/* @__PURE__ */ (0, F.jsx)(AI, {
						view: P,
						sensor: N,
						mapTrack: c
					}),
					/* @__PURE__ */ (0, F.jsx)(PI, {
						view: P,
						visible: u,
						mapTrack: c,
						sensor: N
					})
				]
			}),
			/* @__PURE__ */ (0, F.jsx)(BI, {}),
			/* @__PURE__ */ (0, F.jsxs)("footer", { children: [/* @__PURE__ */ (0, F.jsx)("p", { children: "This effort is supported by Qollab & IonQ." }), /* @__PURE__ */ (0, F.jsx)("p", { children: "Theme: Quantum Impact · MIT License" })] })
		]
	});
}
(0, v.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, F.jsx)(LL, {})), await PL;
//#endregion
