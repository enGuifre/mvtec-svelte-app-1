
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/common/Axis.svelte generated by Svelte v3.31.0 */

    const file = "src/components/common/Axis.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (64:34) 
    function create_if_block_4(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type_2(ctx, dirty) {
    		if (/*tick*/ ctx[11].value === "0") return create_if_block_5;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if_block.c();
    			attr_dev(g, "class", "tick");
    			attr_dev(g, "transform", g_transform_value = "translate(0, " + /*tick*/ ctx[11].offset + ")");
    			add_location(g, file, 64, 4, 1675);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if_block.m(g, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*ticks*/ 8 && g_transform_value !== (g_transform_value = "translate(0, " + /*tick*/ ctx[11].offset + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(64:34) ",
    		ctx
    	});

    	return block;
    }

    // (53:35) 
    function create_if_block_2(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type_1(ctx, dirty) {
    		if (/*tick*/ ctx[11].value === "0") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if_block.c();
    			attr_dev(g, "class", "tick");
    			attr_dev(g, "transform", g_transform_value = "translate(0, " + /*tick*/ ctx[11].offset + ")");
    			add_location(g, file, 53, 4, 1353);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if_block.m(g, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*ticks*/ 8 && g_transform_value !== (g_transform_value = "translate(0, " + /*tick*/ ctx[11].offset + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(53:35) ",
    		ctx
    	});

    	return block;
    }

    // (46:31) 
    function create_if_block_1(ctx) {
    	let g;
    	let line;
    	let text_1;
    	let t_value = /*tick*/ ctx[11].value + "";
    	let t;
    	let text_1_text_anchor_value;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			line = svg_element("line");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(line, "y2", "-6");
    			attr_dev(line, "class", "svelte-14915d6");
    			add_location(line, file, 47, 6, 1187);
    			attr_dev(text_1, "class", "label");
    			attr_dev(text_1, "y", "-10");
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*anchor*/ ctx[4](/*tick*/ ctx[11].offset));
    			add_location(text_1, file, 48, 6, 1208);
    			attr_dev(g, "class", "tick");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*tick*/ ctx[11].offset + ", 0)");
    			add_location(g, file, 46, 4, 1124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, line);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ticks*/ 8 && t_value !== (t_value = /*tick*/ ctx[11].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*anchor, ticks*/ 24 && text_1_text_anchor_value !== (text_1_text_anchor_value = /*anchor*/ ctx[4](/*tick*/ ctx[11].offset))) {
    				attr_dev(text_1, "text-anchor", text_1_text_anchor_value);
    			}

    			if (dirty & /*ticks*/ 8 && g_transform_value !== (g_transform_value = "translate(" + /*tick*/ ctx[11].offset + ", 0)")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(46:31) ",
    		ctx
    	});

    	return block;
    }

    // (39:4) {#if position === 'bottom'}
    function create_if_block(ctx) {
    	let g;
    	let line;
    	let text_1;
    	let t_value = /*tick*/ ctx[11].value + "";
    	let t;
    	let text_1_text_anchor_value;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			line = svg_element("line");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(line, "y2", "6");
    			attr_dev(line, "class", "svelte-14915d6");
    			add_location(line, file, 40, 6, 964);
    			attr_dev(text_1, "class", "label");
    			attr_dev(text_1, "y", "20");
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*anchor*/ ctx[4](/*tick*/ ctx[11].offset));
    			add_location(text_1, file, 41, 6, 984);
    			attr_dev(g, "class", "tick");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*tick*/ ctx[11].offset + ", 0)");
    			add_location(g, file, 39, 4, 901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, line);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ticks*/ 8 && t_value !== (t_value = /*tick*/ ctx[11].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*anchor, ticks*/ 24 && text_1_text_anchor_value !== (text_1_text_anchor_value = /*anchor*/ ctx[4](/*tick*/ ctx[11].offset))) {
    				attr_dev(text_1, "text-anchor", text_1_text_anchor_value);
    			}

    			if (dirty & /*ticks*/ 8 && g_transform_value !== (g_transform_value = "translate(" + /*tick*/ ctx[11].offset + ", 0)")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:4) {#if position === 'bottom'}",
    		ctx
    	});

    	return block;
    }

    // (68:3) {:else}
    function create_else_block_1(ctx) {
    	let line;
    	let text_1;
    	let t_value = /*tick*/ ctx[11].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(line, "x2", /*width*/ ctx[0]);
    			attr_dev(line, "stroke-dasharray", "2 3");
    			attr_dev(line, "class", "svelte-14915d6");
    			add_location(line, file, 68, 6, 1805);
    			attr_dev(text_1, "class", "label");
    			attr_dev(text_1, "x", "0");
    			attr_dev(text_1, "y", "-5");
    			attr_dev(text_1, "text-anchor", "start");
    			add_location(text_1, file, 69, 6, 1854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*width*/ 1) {
    				attr_dev(line, "x2", /*width*/ ctx[0]);
    			}

    			if (dirty & /*ticks*/ 8 && t_value !== (t_value = /*tick*/ ctx[11].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(68:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {#if tick.value === '0'}
    function create_if_block_5(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x2", /*width*/ ctx[0]);
    			attr_dev(line, "class", "svelte-14915d6");
    			add_location(line, file, 66, 6, 1769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*width*/ 1) {
    				attr_dev(line, "x2", /*width*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(66:6) {#if tick.value === '0'}",
    		ctx
    	});

    	return block;
    }

    // (57:3) {:else}
    function create_else_block(ctx) {
    	let line;
    	let text_1;
    	let t_value = /*tick*/ ctx[11].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(line, "x2", /*width*/ ctx[0]);
    			attr_dev(line, "stroke-dasharray", "2 3");
    			attr_dev(line, "class", "svelte-14915d6");
    			add_location(line, file, 57, 6, 1480);
    			attr_dev(text_1, "class", "label");
    			attr_dev(text_1, "x", /*width*/ ctx[0]);
    			attr_dev(text_1, "y", "-5");
    			attr_dev(text_1, "text-anchor", "end");
    			add_location(text_1, file, 58, 6, 1529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*width*/ 1) {
    				attr_dev(line, "x2", /*width*/ ctx[0]);
    			}

    			if (dirty & /*ticks*/ 8 && t_value !== (t_value = /*tick*/ ctx[11].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*width*/ 1) {
    				attr_dev(text_1, "x", /*width*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(57:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:3) {#if tick.value === '0'}
    function create_if_block_3(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x2", /*width*/ ctx[0]);
    			attr_dev(line, "class", "svelte-14915d6");
    			add_location(line, file, 55, 6, 1444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*width*/ 1) {
    				attr_dev(line, "x2", /*width*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(55:3) {#if tick.value === '0'}",
    		ctx
    	});

    	return block;
    }

    // (38:2) {#each ticks as tick}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*position*/ ctx[1] === "bottom") return create_if_block;
    		if (/*position*/ ctx[1] === "top") return create_if_block_1;
    		if (/*position*/ ctx[1] === "right") return create_if_block_2;
    		if (/*position*/ ctx[1] === "left") return create_if_block_4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(38:2) {#each ticks as tick}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let g;
    	let each_value = /*ticks*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "axis");
    			attr_dev(g, "transform", /*transform*/ ctx[2]);
    			attr_dev(g, "pointer-events", "none");
    			add_location(g, file, 36, 0, 790);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ticks, anchor, position, width*/ 27) {
    				each_value = /*ticks*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*transform*/ 4) {
    				attr_dev(g, "transform", /*transform*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Axis", slots, []);
    	let { width } = $$props;
    	let { height } = $$props;
    	let { margin } = $$props;
    	let { scale } = $$props;
    	let { position } = $$props;
    	let { format } = $$props;
    	let { time } = $$props;
    	const writable_props = ["width", "height", "margin", "scale", "position", "format", "time"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Axis> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("margin" in $$props) $$invalidate(6, margin = $$props.margin);
    		if ("scale" in $$props) $$invalidate(7, scale = $$props.scale);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("format" in $$props) $$invalidate(8, format = $$props.format);
    		if ("time" in $$props) $$invalidate(9, time = $$props.time);
    	};

    	$$self.$capture_state = () => ({
    		width,
    		height,
    		margin,
    		scale,
    		position,
    		format,
    		time,
    		nTicks,
    		transform,
    		ticks,
    		anchor
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("margin" in $$props) $$invalidate(6, margin = $$props.margin);
    		if ("scale" in $$props) $$invalidate(7, scale = $$props.scale);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("format" in $$props) $$invalidate(8, format = $$props.format);
    		if ("time" in $$props) $$invalidate(9, time = $$props.time);
    		if ("nTicks" in $$props) $$invalidate(10, nTicks = $$props.nTicks);
    		if ("transform" in $$props) $$invalidate(2, transform = $$props.transform);
    		if ("ticks" in $$props) $$invalidate(3, ticks = $$props.ticks);
    		if ("anchor" in $$props) $$invalidate(4, anchor = $$props.anchor);
    	};

    	let nTicks;
    	let transform;
    	let ticks;
    	let anchor;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position, width, height*/ 35) {
    			 $$invalidate(10, nTicks = position === "bottom" || position === "top"
    			? width / 50
    			: height / 50);
    		}

    		if ($$self.$$.dirty & /*position, height, margin*/ 98) {
    			 $$invalidate(2, transform = position === "bottom"
    			? `translate(0, ${height - margin.bottom - margin.top})`
    			: position === "top"
    				? `translate(0, ${margin.top})`
    				: position === "left"
    					? `translate(${margin.left}, 0)`
    					: `translate(0, ${margin.right})`);
    		}

    		if ($$self.$$.dirty & /*scale, time, nTicks, format*/ 1920) {
    			 $$invalidate(3, ticks = scale.ticks(!time ? nTicks : time).map(d => ({ value: format(d), offset: scale(d) })));
    		}

    		if ($$self.$$.dirty & /*width*/ 1) {
    			 $$invalidate(4, anchor = x => {
    				switch (true) {
    					case x < 20:
    						return "start";
    					case x > width - 40:
    						return "end";
    					default:
    						return "middle";
    				}
    			});
    		}
    	};

    	return [
    		width,
    		position,
    		transform,
    		ticks,
    		anchor,
    		height,
    		margin,
    		scale,
    		format,
    		time,
    		nTicks
    	];
    }

    class Axis extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			width: 0,
    			height: 5,
    			margin: 6,
    			scale: 7,
    			position: 1,
    			format: 8,
    			time: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Axis",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Axis> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[5] === undefined && !("height" in props)) {
    			console.warn("<Axis> was created without expected prop 'height'");
    		}

    		if (/*margin*/ ctx[6] === undefined && !("margin" in props)) {
    			console.warn("<Axis> was created without expected prop 'margin'");
    		}

    		if (/*scale*/ ctx[7] === undefined && !("scale" in props)) {
    			console.warn("<Axis> was created without expected prop 'scale'");
    		}

    		if (/*position*/ ctx[1] === undefined && !("position" in props)) {
    			console.warn("<Axis> was created without expected prop 'position'");
    		}

    		if (/*format*/ ctx[8] === undefined && !("format" in props)) {
    			console.warn("<Axis> was created without expected prop 'format'");
    		}

    		if (/*time*/ ctx[9] === undefined && !("time" in props)) {
    			console.warn("<Axis> was created without expected prop 'time'");
    		}
    	}

    	get width() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get time() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/common/PointInteractive.svelte generated by Svelte v3.31.0 */

    const file$1 = "src/components/common/PointInteractive.svelte";

    // (24:0) {#if datum !== undefined}
    function create_if_block$1(ctx) {
    	let g;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let text0;
    	let t0_value = /*format*/ ctx[5].y(/*datum*/ ctx[0][/*key*/ ctx[1].y]) + "";
    	let t0;
    	let text0_x_value;
    	let text0_y_value;
    	let text0_text_anchor_value;
    	let text1;
    	let t1_value = /*format*/ ctx[5].x(/*datum*/ ctx[0][/*key*/ ctx[1].x]) + "";
    	let t1;
    	let text1_x_value;
    	let text1_y_value;
    	let text1_text_anchor_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			line = svg_element("line");
    			circle = svg_element("circle");
    			text0 = svg_element("text");
    			t0 = text(t0_value);
    			text1 = svg_element("text");
    			t1 = text(t1_value);
    			attr_dev(line, "x1", line_x__value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]));
    			attr_dev(line, "y1", line_y__value = /*y*/ ctx[3](0));
    			attr_dev(line, "x2", line_x__value_1 = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]));
    			attr_dev(line, "y2", line_y__value_1 = /*y*/ ctx[3](/*datum*/ ctx[0][/*key*/ ctx[1].y]));
    			attr_dev(line, "pointer-events", "none");
    			attr_dev(line, "stroke", "rgba(0,0,0,.5)");
    			attr_dev(line, "stroke-width", ".3");
    			attr_dev(line, "class", "tooltip");
    			add_location(line, file$1, 25, 4, 388);
    			attr_dev(circle, "r", /*r*/ ctx[6]);
    			attr_dev(circle, "cx", circle_cx_value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]));
    			attr_dev(circle, "cy", circle_cy_value = /*y*/ ctx[3](/*datum*/ ctx[0][/*key*/ ctx[1].y]));
    			attr_dev(circle, "stroke", "rgba(0,0,0,1)");
    			attr_dev(circle, "pointer-events", "none");
    			attr_dev(circle, "stroke-width", "2");
    			attr_dev(circle, "fill", /*color*/ ctx[4]);
    			attr_dev(circle, "class", "tooltip");
    			add_location(circle, file$1, 35, 4, 620);
    			attr_dev(text0, "x", text0_x_value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]));
    			attr_dev(text0, "y", text0_y_value = /*y*/ ctx[3](/*datum*/ ctx[0][/*key*/ ctx[1].y]) - 8);
    			attr_dev(text0, "pointer-events", "none");
    			attr_dev(text0, "text-anchor", text0_text_anchor_value = /*anchor*/ ctx[7](/*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x])));
    			attr_dev(text0, "class", "tooltip value svelte-1x25tuj");
    			add_location(text0, file$1, 45, 4, 840);
    			attr_dev(text1, "x", text1_x_value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]));
    			attr_dev(text1, "y", text1_y_value = /*y*/ ctx[3](0) + 20);
    			attr_dev(text1, "pointer-events", "none");
    			attr_dev(text1, "text-anchor", text1_text_anchor_value = /*anchor*/ ctx[7](/*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x])));
    			attr_dev(text1, "class", "tooltip label svelte-1x25tuj");
    			add_location(text1, file$1, 54, 4, 1067);
    			add_location(g, file$1, 24, 0, 380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, line);
    			append_dev(g, circle);
    			append_dev(g, text0);
    			append_dev(text0, t0);
    			append_dev(g, text1);
    			append_dev(text1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*x, datum, key*/ 7 && line_x__value !== (line_x__value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]))) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*y*/ 8 && line_y__value !== (line_y__value = /*y*/ ctx[3](0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*x, datum, key*/ 7 && line_x__value_1 !== (line_x__value_1 = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]))) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*y, datum, key*/ 11 && line_y__value_1 !== (line_y__value_1 = /*y*/ ctx[3](/*datum*/ ctx[0][/*key*/ ctx[1].y]))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*r*/ 64) {
    				attr_dev(circle, "r", /*r*/ ctx[6]);
    			}

    			if (dirty & /*x, datum, key*/ 7 && circle_cx_value !== (circle_cx_value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*y, datum, key*/ 11 && circle_cy_value !== (circle_cy_value = /*y*/ ctx[3](/*datum*/ ctx[0][/*key*/ ctx[1].y]))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*color*/ 16) {
    				attr_dev(circle, "fill", /*color*/ ctx[4]);
    			}

    			if (dirty & /*format, datum, key*/ 35 && t0_value !== (t0_value = /*format*/ ctx[5].y(/*datum*/ ctx[0][/*key*/ ctx[1].y]) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*x, datum, key*/ 7 && text0_x_value !== (text0_x_value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]))) {
    				attr_dev(text0, "x", text0_x_value);
    			}

    			if (dirty & /*y, datum, key*/ 11 && text0_y_value !== (text0_y_value = /*y*/ ctx[3](/*datum*/ ctx[0][/*key*/ ctx[1].y]) - 8)) {
    				attr_dev(text0, "y", text0_y_value);
    			}

    			if (dirty & /*anchor, x, datum, key*/ 135 && text0_text_anchor_value !== (text0_text_anchor_value = /*anchor*/ ctx[7](/*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x])))) {
    				attr_dev(text0, "text-anchor", text0_text_anchor_value);
    			}

    			if (dirty & /*format, datum, key*/ 35 && t1_value !== (t1_value = /*format*/ ctx[5].x(/*datum*/ ctx[0][/*key*/ ctx[1].x]) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*x, datum, key*/ 7 && text1_x_value !== (text1_x_value = /*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x]))) {
    				attr_dev(text1, "x", text1_x_value);
    			}

    			if (dirty & /*y*/ 8 && text1_y_value !== (text1_y_value = /*y*/ ctx[3](0) + 20)) {
    				attr_dev(text1, "y", text1_y_value);
    			}

    			if (dirty & /*anchor, x, datum, key*/ 135 && text1_text_anchor_value !== (text1_text_anchor_value = /*anchor*/ ctx[7](/*x*/ ctx[2](/*datum*/ ctx[0][/*key*/ ctx[1].x])))) {
    				attr_dev(text1, "text-anchor", text1_text_anchor_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(24:0) {#if datum !== undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*datum*/ ctx[0] !== undefined && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*datum*/ ctx[0] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PointInteractive", slots, []);
    	let { width } = $$props;
    	let { datum } = $$props;
    	let { key } = $$props;
    	let { x } = $$props;
    	let { y } = $$props;
    	let { color } = $$props;
    	let { format } = $$props;
    	let { r = 3 } = $$props;
    	const writable_props = ["width", "datum", "key", "x", "y", "color", "format", "r"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PointInteractive> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("datum" in $$props) $$invalidate(0, datum = $$props.datum);
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("x" in $$props) $$invalidate(2, x = $$props.x);
    		if ("y" in $$props) $$invalidate(3, y = $$props.y);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("format" in $$props) $$invalidate(5, format = $$props.format);
    		if ("r" in $$props) $$invalidate(6, r = $$props.r);
    	};

    	$$self.$capture_state = () => ({
    		width,
    		datum,
    		key,
    		x,
    		y,
    		color,
    		format,
    		r,
    		anchor
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("datum" in $$props) $$invalidate(0, datum = $$props.datum);
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("x" in $$props) $$invalidate(2, x = $$props.x);
    		if ("y" in $$props) $$invalidate(3, y = $$props.y);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("format" in $$props) $$invalidate(5, format = $$props.format);
    		if ("r" in $$props) $$invalidate(6, r = $$props.r);
    		if ("anchor" in $$props) $$invalidate(7, anchor = $$props.anchor);
    	};

    	let anchor;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 256) {
    			 $$invalidate(7, anchor = x => {
    				switch (true) {
    					case x < 20:
    						return "start";
    					case x > width - 40:
    						return "end";
    					default:
    						return "middle";
    				}
    			});
    		}
    	};

    	return [datum, key, x, y, color, format, r, anchor, width];
    }

    class PointInteractive extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			width: 8,
    			datum: 0,
    			key: 1,
    			x: 2,
    			y: 3,
    			color: 4,
    			format: 5,
    			r: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PointInteractive",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[8] === undefined && !("width" in props)) {
    			console.warn("<PointInteractive> was created without expected prop 'width'");
    		}

    		if (/*datum*/ ctx[0] === undefined && !("datum" in props)) {
    			console.warn("<PointInteractive> was created without expected prop 'datum'");
    		}

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<PointInteractive> was created without expected prop 'key'");
    		}

    		if (/*x*/ ctx[2] === undefined && !("x" in props)) {
    			console.warn("<PointInteractive> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[3] === undefined && !("y" in props)) {
    			console.warn("<PointInteractive> was created without expected prop 'y'");
    		}

    		if (/*color*/ ctx[4] === undefined && !("color" in props)) {
    			console.warn("<PointInteractive> was created without expected prop 'color'");
    		}

    		if (/*format*/ ctx[5] === undefined && !("format" in props)) {
    			console.warn("<PointInteractive> was created without expected prop 'format'");
    		}
    	}

    	get width() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get datum() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set datum(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get r() {
    		throw new Error("<PointInteractive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set r(value) {
    		throw new Error("<PointInteractive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const pi = Math.PI,
        tau = 2 * pi,
        epsilon = 1e-6,
        tauEpsilon = tau - epsilon;

    function Path() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path;
    }

    Path.prototype = path.prototype = {
      constructor: Path,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r, ccw = !!ccw;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau + tau;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    function constant(x) {
      return function constant() {
        return x;
      };
    }

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function Linear(context) {
      this._context = context;
    }

    Linear.prototype = {
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
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // proceed
          default: this._context.lineTo(x, y); break;
        }
      }
    };

    function curveLinear(context) {
      return new Linear(context);
    }

    function x(p) {
      return p[0];
    }

    function y(p) {
      return p[1];
    }

    function line(x$1, y$1) {
      var defined = constant(true),
          context = null,
          curve = curveLinear,
          output = null;

      x$1 = typeof x$1 === "function" ? x$1 : (x$1 === undefined) ? x : constant(x$1);
      y$1 = typeof y$1 === "function" ? y$1 : (y$1 === undefined) ? y : constant(y$1);

      function line(data) {
        var i,
            n = (data = array(data)).length,
            d,
            defined0 = false,
            buffer;

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) output.lineStart();
            else output.lineEnd();
          }
          if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      line.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), line) : x$1;
      };

      line.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), line) : y$1;
      };

      line.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), line) : defined;
      };

      line.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
      };

      line.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
      };

      return line;
    }

    function area(x0, y0, y1) {
      var x1 = null,
          defined = constant(true),
          context = null,
          curve = curveLinear,
          output = null;

      x0 = typeof x0 === "function" ? x0 : (x0 === undefined) ? x : constant(+x0);
      y0 = typeof y0 === "function" ? y0 : (y0 === undefined) ? constant(0) : constant(+y0);
      y1 = typeof y1 === "function" ? y1 : (y1 === undefined) ? y : constant(+y1);

      function area(data) {
        var i,
            j,
            k,
            n = (data = array(data)).length,
            d,
            defined0 = false,
            buffer,
            x0z = new Array(n),
            y0z = new Array(n);

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) {
              j = i;
              output.areaStart();
              output.lineStart();
            } else {
              output.lineEnd();
              output.lineStart();
              for (k = i - 1; k >= j; --k) {
                output.point(x0z[k], y0z[k]);
              }
              output.lineEnd();
              output.areaEnd();
            }
          }
          if (defined0) {
            x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
            output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
          }
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      function arealine() {
        return line().defined(defined).curve(curve).context(context);
      }

      area.x = function(_) {
        return arguments.length ? (x0 = typeof _ === "function" ? _ : constant(+_), x1 = null, area) : x0;
      };

      area.x0 = function(_) {
        return arguments.length ? (x0 = typeof _ === "function" ? _ : constant(+_), area) : x0;
      };

      area.x1 = function(_) {
        return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant(+_), area) : x1;
      };

      area.y = function(_) {
        return arguments.length ? (y0 = typeof _ === "function" ? _ : constant(+_), y1 = null, area) : y0;
      };

      area.y0 = function(_) {
        return arguments.length ? (y0 = typeof _ === "function" ? _ : constant(+_), area) : y0;
      };

      area.y1 = function(_) {
        return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant(+_), area) : y1;
      };

      area.lineX0 =
      area.lineY0 = function() {
        return arealine().x(x0).y(y0);
      };

      area.lineY1 = function() {
        return arealine().x(x0).y(y1);
      };

      area.lineX1 = function() {
        return arealine().x(x1).y(y0);
      };

      area.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), area) : defined;
      };

      area.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
      };

      area.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
      };

      return area;
    }

    function Step(context, t) {
      this._context = context;
      this._t = t;
    }

    Step.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x = this._y = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // proceed
          default: {
            if (this._t <= 0) {
              this._context.lineTo(this._x, y);
              this._context.lineTo(x, y);
            } else {
              var x1 = this._x * (1 - this._t) + x * this._t;
              this._context.lineTo(x1, this._y);
              this._context.lineTo(x1, y);
            }
            break;
          }
        }
        this._x = x, this._y = y;
      }
    };

    function curveStep(context) {
      return new Step(context, 0.5);
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(compare) {
      if (compare.length === 1) compare = ascendingComparator(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator(f) {
      return function(d, x) {
        return ascending(f(d), x);
      };
    }

    var ascendingBisect = bisector(ascending);
    var bisectRight = ascendingBisect.right;

    function sequence(start, stop, step) {
      start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

      var i = -1,
          n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
          range = new Array(n);

      while (++i < n) {
        range[i] = start + i * step;
      }

      return range;
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var step = tickStep(start, stop, count);
      return sequence(
        Math.ceil(start / step) * step,
        Math.floor(stop / step) * step + step / 2, // inclusive
        step
      );
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    var prefix = "$";

    function Map$1() {}

    Map$1.prototype = map.prototype = {
      constructor: Map$1,
      has: function(key) {
        return (prefix + key) in this;
      },
      get: function(key) {
        return this[prefix + key];
      },
      set: function(key, value) {
        this[prefix + key] = value;
        return this;
      },
      remove: function(key) {
        var property = prefix + key;
        return property in this && delete this[property];
      },
      clear: function() {
        for (var property in this) if (property[0] === prefix) delete this[property];
      },
      keys: function() {
        var keys = [];
        for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
        return keys;
      },
      values: function() {
        var values = [];
        for (var property in this) if (property[0] === prefix) values.push(this[property]);
        return values;
      },
      entries: function() {
        var entries = [];
        for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
        return entries;
      },
      size: function() {
        var size = 0;
        for (var property in this) if (property[0] === prefix) ++size;
        return size;
      },
      empty: function() {
        for (var property in this) if (property[0] === prefix) return false;
        return true;
      },
      each: function(f) {
        for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
      }
    };

    function map(object, f) {
      var map = new Map$1;

      // Copy constructor.
      if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

      // Index array by numeric index or specified key function.
      else if (Array.isArray(object)) {
        var i = -1,
            n = object.length,
            o;

        if (f == null) while (++i < n) map.set(i, object[i]);
        else while (++i < n) map.set(f(o = object[i], i, object), o);
      }

      // Convert object to map.
      else if (object) for (var key in object) map.set(key, object[key]);

      return map;
    }

    function Set$1() {}

    var proto = map.prototype;

    Set$1.prototype = set.prototype = {
      constructor: Set$1,
      has: proto.has,
      add: function(value) {
        value += "";
        this[prefix + value] = value;
        return this;
      },
      remove: proto.remove,
      clear: proto.clear,
      values: proto.keys,
      size: proto.size,
      empty: proto.empty,
      each: proto.each
    };

    function set(object, f) {
      var set = new Set$1;

      // Copy constructor.
      if (object instanceof Set$1) object.each(function(value) { set.add(value); });

      // Otherwise, assume it’s an array.
      else if (object) {
        var i = -1, n = object.length;
        if (f == null) while (++i < n) set.add(object[i]);
        else while (++i < n) set.add(f(object[i], i, object));
      }

      return set;
    }

    var array$1 = Array.prototype;

    var map$1 = array$1.map;
    var slice = array$1.slice;

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex3 = /^#([0-9a-f]{3})$/,
        reHex6 = /^#([0-9a-f]{6})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: function() {
        return this.rgb().hex();
      },
      toString: function() {
        return this.rgb() + "";
      }
    });

    function color(format) {
      var m;
      format = (format + "").trim().toLowerCase();
      return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
          : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format])
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (0 <= this.r && this.r <= 255)
            && (0 <= this.g && this.g <= 255)
            && (0 <= this.b && this.b <= 255)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: function() {
        return "#" + hex(this.r) + hex(this.g) + hex(this.b);
      },
      toString: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "rgb(" : "rgba(")
            + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.b) || 0))
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var deg2rad = Math.PI / 180;
    var rad2deg = 180 / Math.PI;

    // https://beta.observablehq.com/@mbostock/lab-and-rgb
    var K = 18,
        Xn = 0.96422,
        Yn = 1,
        Zn = 0.82521,
        t0 = 4 / 29,
        t1 = 6 / 29,
        t2 = 3 * t1 * t1,
        t3 = t1 * t1 * t1;

    function labConvert(o) {
      if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
      if (o instanceof Hcl) {
        if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
        var h = o.h * deg2rad;
        return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
      }
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var r = rgb2lrgb(o.r),
          g = rgb2lrgb(o.g),
          b = rgb2lrgb(o.b),
          y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
      if (r === g && g === b) x = z = y; else {
        x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
        z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
      }
      return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
    }

    function lab(l, a, b, opacity) {
      return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
    }

    function Lab(l, a, b, opacity) {
      this.l = +l;
      this.a = +a;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Lab, lab, extend(Color, {
      brighter: function(k) {
        return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      darker: function(k) {
        return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      rgb: function() {
        var y = (this.l + 16) / 116,
            x = isNaN(this.a) ? y : y + this.a / 500,
            z = isNaN(this.b) ? y : y - this.b / 200;
        x = Xn * lab2xyz(x);
        y = Yn * lab2xyz(y);
        z = Zn * lab2xyz(z);
        return new Rgb(
          lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
          lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
          lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
          this.opacity
        );
      }
    }));

    function xyz2lab(t) {
      return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
    }

    function lab2xyz(t) {
      return t > t1 ? t * t * t : t2 * (t - t0);
    }

    function lrgb2rgb(x) {
      return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    }

    function rgb2lrgb(x) {
      return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }

    function hclConvert(o) {
      if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
      if (!(o instanceof Lab)) o = labConvert(o);
      if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0, o.l, o.opacity);
      var h = Math.atan2(o.b, o.a) * rad2deg;
      return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
    }

    function hcl(h, c, l, opacity) {
      return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
    }

    function Hcl(h, c, l, opacity) {
      this.h = +h;
      this.c = +c;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hcl, hcl, extend(Color, {
      brighter: function(k) {
        return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
      },
      darker: function(k) {
        return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
      },
      rgb: function() {
        return labConvert(this).rgb();
      }
    }));

    var A = -0.14861,
        B = +1.78277,
        C = -0.29227,
        D = -0.90649,
        E = +1.97294,
        ED = E * D,
        EB = E * B,
        BC_DA = B * C - D * A;

    function cubehelixConvert(o) {
      if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
          bl = b - l,
          k = (E * (g - l) - C * bl) / D,
          s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
          h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
      return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
    }

    function cubehelix(h, s, l, opacity) {
      return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
    }

    function Cubehelix(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Cubehelix, cubehelix, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
            l = +this.l,
            a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
            cosh = Math.cos(h),
            sinh = Math.sin(h);
        return new Rgb(
          255 * (l + a * (A * cosh + B * sinh)),
          255 * (l + a * (C * cosh + D * sinh)),
          255 * (l + a * (E * cosh)),
          this.opacity
        );
      }
    }));

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function hue(a, b) {
      var d = b - a;
      return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a) ? b : a);
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function array$2(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b -= a, function(t) {
        return d.setTime(a + b * t), d;
      };
    }

    function reinterpolate(a, b) {
      return a = +a, b -= a, function(t) {
        return a + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolateValue(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: reinterpolate(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolateValue(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$1(b)
          : (t === "number" ? reinterpolate
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : Array.isArray(b) ? array$2
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : reinterpolate)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b -= a, function(t) {
        return Math.round(a + b * t);
      };
    }

    function cubehelix$1(hue) {
      return (function cubehelixGamma(y) {
        y = +y;

        function cubehelix$1(start, end) {
          var h = hue((start = cubehelix(start)).h, (end = cubehelix(end)).h),
              s = nogamma(start.s, end.s),
              l = nogamma(start.l, end.l),
              opacity = nogamma(start.opacity, end.opacity);
          return function(t) {
            start.h = h(t);
            start.s = s(t);
            start.l = l(Math.pow(t, y));
            start.opacity = opacity(t);
            return start + "";
          };
        }

        cubehelix$1.gamma = cubehelixGamma;

        return cubehelix$1;
      })(1);
    }

    cubehelix$1(hue);
    var cubehelixLong = cubehelix$1(nogamma);

    function constant$2(x) {
      return function() {
        return x;
      };
    }

    function number(x) {
      return +x;
    }

    var unit = [0, 1];

    function deinterpolateLinear(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constant$2(b);
    }

    function deinterpolateClamp(deinterpolate) {
      return function(a, b) {
        var d = deinterpolate(a = +a, b = +b);
        return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
      };
    }

    function reinterpolateClamp(reinterpolate) {
      return function(a, b) {
        var r = reinterpolate(a = +a, b = +b);
        return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
      };
    }

    function bimap(domain, range, deinterpolate, reinterpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
      else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, deinterpolate, reinterpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = deinterpolate(domain[i], domain[i + 1]);
        r[i] = reinterpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp());
    }

    // deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
    function continuous(deinterpolate, reinterpolate) {
      var domain = unit,
          range = unit,
          interpolate = interpolateValue,
          clamp = false,
          piecewise,
          output,
          input;

      function rescale() {
        piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return (output || (output = piecewise(domain, range, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate)))(+x);
      }

      scale.invert = function(y) {
        return (input || (input = piecewise(range, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = map$1.call(_, number), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = slice.call(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = slice.call(_), interpolate = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = !!_, rescale()) : clamp;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate = _, rescale()) : interpolate;
      };

      return rescale();
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimal(1.23) returns ["123", 0].
    function formatDecimal(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatDefault(x, p) {
      x = x.toPrecision(p);

      out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (x[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          case "e": break out;
          default: if (i0 > 0) i0 = 0; break;
        }
      }

      return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "": formatDefault,
      "%": function(x, p) { return (x * 100).toFixed(p); },
      "b": function(x) { return Math.round(x).toString(2); },
      "c": function(x) { return x + ""; },
      "d": function(x) { return Math.round(x).toString(10); },
      "e": function(x, p) { return x.toExponential(p); },
      "f": function(x, p) { return x.toFixed(p); },
      "g": function(x, p) { return x.toPrecision(p); },
      "o": function(x) { return Math.round(x).toString(8); },
      "p": function(x, p) { return formatRounded(x * 100, p); },
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
      "x": function(x) { return Math.round(x).toString(16); }
    };

    // [[fill]align][sign][symbol][0][width][,][.precision][type]
    var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      return new FormatSpecifier(specifier);
    }

    function FormatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

      var match,
          fill = match[1] || " ",
          align = match[2] || ">",
          sign = match[3] || "-",
          symbol = match[4] || "",
          zero = !!match[5],
          width = match[6] && +match[6],
          comma = !!match[7],
          precision = match[8] && +match[8].slice(1),
          type = match[9] || "";

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // Map invalid types to the default format.
      else if (!formatTypes[type]) type = "";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      this.fill = fill;
      this.align = align;
      this.sign = sign;
      this.symbol = symbol;
      this.zero = zero;
      this.width = width;
      this.comma = comma;
      this.precision = precision;
      this.type = type;
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width == null ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
          + this.type;
    };

    var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function identity(x) {
      return x;
    }

    function formatLocale(locale) {
      var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity,
          currency = locale.currency,
          decimal = locale.decimal;

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            type = specifier.type;

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? "%" : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = !type || /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision == null ? (type ? 6 : 12)
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Convert negative to positive, and compute the prefix.
            // Note that -0 is not less than 0, but 1 / -0 is!
            var valueNegative = (value < 0 || 1 / value < 0) && (value *= -1, true);

            // Perform the initial formatting.
            value = formatType(value, precision);

            // If the original value was negative, it may be rounded to zero during
            // formatting; treat this as (positive) zero.
            if (valueNegative) {
              i = -1, n = value.length;
              valueNegative = false;
              while (++i < n) {
                if (c = value.charCodeAt(i), (48 < c && c < 58)
                    || (type === "x" && 96 < c && c < 103)
                    || (type === "X" && 64 < c && c < 71)) {
                  valueNegative = true;
                  break;
                }
              }
            }

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = valueSuffix + (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": return valuePrefix + value + valueSuffix + padding;
            case "=": return valuePrefix + padding + value + valueSuffix;
            case "^": return padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          }
          return padding + valuePrefix + value + valueSuffix;
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(domain, count, specifier) {
      var start = domain[0],
          stop = domain[domain.length - 1],
          step = tickStep(start, stop, count == null ? 10 : count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        return tickFormat(domain(), count, specifier);
      };

      scale.nice = function(count) {
        var d = domain(),
            i = d.length - 1,
            n = count == null ? 10 : count,
            start = d[0],
            stop = d[i],
            step = tickStep(start, stop, n);

        if (step) {
          step = tickStep(Math.floor(start / step) * step, Math.ceil(stop / step) * step, n);
          d[0] = Math.floor(start / step) * step;
          d[i] = Math.ceil(stop / step) * step;
          domain(d);
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous(deinterpolateLinear, reinterpolate);

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      return linearish(scale);
    }

    function nice(domain, interval) {
      domain = domain.slice();

      var i0 = 0,
          i1 = domain.length - 1,
          x0 = domain[i0],
          x1 = domain[i1],
          t;

      if (x1 < x0) {
        t = i0, i0 = i1, i1 = t;
        t = x0, x0 = x1, x1 = t;
      }

      domain[i0] = interval.floor(x0);
      domain[i1] = interval.ceil(x1);
      return domain;
    }

    function raise(x, exponent) {
      return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
    }

    function pow() {
      var exponent = 1,
          scale = continuous(deinterpolate, reinterpolate),
          domain = scale.domain;

      function deinterpolate(a, b) {
        return (b = raise(b, exponent) - (a = raise(a, exponent)))
            ? function(x) { return (raise(x, exponent) - a) / b; }
            : constant$2(b);
      }

      function reinterpolate(a, b) {
        b = raise(b, exponent) - (a = raise(a, exponent));
        return function(t) { return raise(a + b * t, 1 / exponent); };
      }

      scale.exponent = function(_) {
        return arguments.length ? (exponent = +_, domain(domain())) : exponent;
      };

      scale.copy = function() {
        return copy(scale, pow().exponent(exponent));
      };

      return linearish(scale);
    }

    function sqrt() {
      return pow().exponent(0.5);
    }

    function quantize() {
      var x0 = 0,
          x1 = 1,
          n = 1,
          domain = [0.5],
          range = [0, 1];

      function scale(x) {
        if (x <= x) return range[bisectRight(domain, x, 0, n)];
      }

      function rescale() {
        var i = -1;
        domain = new Array(n);
        while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
        return scale;
      }

      scale.domain = function(_) {
        return arguments.length ? (x0 = +_[0], x1 = +_[1], rescale()) : [x0, x1];
      };

      scale.range = function(_) {
        return arguments.length ? (n = (range = slice.call(_)).length - 1, rescale()) : range.slice();
      };

      scale.invertExtent = function(y) {
        var i = range.indexOf(y);
        return i < 0 ? [NaN, NaN]
            : i < 1 ? [x0, domain[0]]
            : i >= n ? [domain[n - 1], x1]
            : [domain[i - 1], domain[i]];
      };

      scale.copy = function() {
        return quantize()
            .domain([x0, x1])
            .range(range);
      };

      return linearish(scale);
    }

    var t0$1 = new Date,
        t1$1 = new Date;

    function newInterval(floori, offseti, count, field) {

      function interval(date) {
        return floori(date = new Date(+date)), date;
      }

      interval.floor = interval;

      interval.ceil = function(date) {
        return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
      };

      interval.round = function(date) {
        var d0 = interval(date),
            d1 = interval.ceil(date);
        return date - d0 < d1 - date ? d0 : d1;
      };

      interval.offset = function(date, step) {
        return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
      };

      interval.range = function(start, stop, step) {
        var range = [], previous;
        start = interval.ceil(start);
        step = step == null ? 1 : Math.floor(step);
        if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
        do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
        while (previous < start && start < stop);
        return range;
      };

      interval.filter = function(test) {
        return newInterval(function(date) {
          if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
        }, function(date, step) {
          if (date >= date) {
            if (step < 0) while (++step <= 0) {
              while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
            } else while (--step >= 0) {
              while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
            }
          }
        });
      };

      if (count) {
        interval.count = function(start, end) {
          t0$1.setTime(+start), t1$1.setTime(+end);
          floori(t0$1), floori(t1$1);
          return Math.floor(count(t0$1, t1$1));
        };

        interval.every = function(step) {
          step = Math.floor(step);
          return !isFinite(step) || !(step > 0) ? null
              : !(step > 1) ? interval
              : interval.filter(field
                  ? function(d) { return field(d) % step === 0; }
                  : function(d) { return interval.count(0, d) % step === 0; });
        };
      }

      return interval;
    }

    var millisecond = newInterval(function() {
      // noop
    }, function(date, step) {
      date.setTime(+date + step);
    }, function(start, end) {
      return end - start;
    });

    // An optimized implementation for this simple case.
    millisecond.every = function(k) {
      k = Math.floor(k);
      if (!isFinite(k) || !(k > 0)) return null;
      if (!(k > 1)) return millisecond;
      return newInterval(function(date) {
        date.setTime(Math.floor(date / k) * k);
      }, function(date, step) {
        date.setTime(+date + step * k);
      }, function(start, end) {
        return (end - start) / k;
      });
    };

    var durationSecond = 1e3;
    var durationMinute = 6e4;
    var durationHour = 36e5;
    var durationDay = 864e5;
    var durationWeek = 6048e5;

    var second = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds());
    }, function(date, step) {
      date.setTime(+date + step * durationSecond);
    }, function(start, end) {
      return (end - start) / durationSecond;
    }, function(date) {
      return date.getUTCSeconds();
    });

    var minute = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getMinutes();
    });

    var hour = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getHours();
    });

    var day = newInterval(function(date) {
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setDate(date.getDate() + step);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
    }, function(date) {
      return date.getDate() - 1;
    });

    function weekday(i) {
      return newInterval(function(date) {
        date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setDate(date.getDate() + step * 7);
      }, function(start, end) {
        return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
      });
    }

    var sunday = weekday(0);
    var monday = weekday(1);
    var tuesday = weekday(2);
    var wednesday = weekday(3);
    var thursday = weekday(4);
    var friday = weekday(5);
    var saturday = weekday(6);

    var month = newInterval(function(date) {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setMonth(date.getMonth() + step);
    }, function(start, end) {
      return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
    }, function(date) {
      return date.getMonth();
    });

    var year = newInterval(function(date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step);
    }, function(start, end) {
      return end.getFullYear() - start.getFullYear();
    }, function(date) {
      return date.getFullYear();
    });

    // An optimized implementation for this simple case.
    year.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setFullYear(Math.floor(date.getFullYear() / k) * k);
        date.setMonth(0, 1);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setFullYear(date.getFullYear() + step * k);
      });
    };

    var utcMinute = newInterval(function(date) {
      date.setUTCSeconds(0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getUTCMinutes();
    });

    var utcHour = newInterval(function(date) {
      date.setUTCMinutes(0, 0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getUTCHours();
    });

    var utcDay = newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    }, function(start, end) {
      return (end - start) / durationDay;
    }, function(date) {
      return date.getUTCDate() - 1;
    });

    function utcWeekday(i) {
      return newInterval(function(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCDate(date.getUTCDate() + step * 7);
      }, function(start, end) {
        return (end - start) / durationWeek;
      });
    }

    var utcSunday = utcWeekday(0);
    var utcMonday = utcWeekday(1);
    var utcTuesday = utcWeekday(2);
    var utcWednesday = utcWeekday(3);
    var utcThursday = utcWeekday(4);
    var utcFriday = utcWeekday(5);
    var utcSaturday = utcWeekday(6);

    var utcMonth = newInterval(function(date) {
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCMonth(date.getUTCMonth() + step);
    }, function(start, end) {
      return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
    }, function(date) {
      return date.getUTCMonth();
    });

    var utcYear = newInterval(function(date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    }, function(start, end) {
      return end.getUTCFullYear() - start.getUTCFullYear();
    }, function(date) {
      return date.getUTCFullYear();
    });

    // An optimized implementation for this simple case.
    utcYear.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCFullYear(date.getUTCFullYear() + step * k);
      });
    };

    function localDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
      }
      return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
    }

    function utcDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
      }
      return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
    }

    function newYear(y) {
      return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
    }

    function formatLocale$1(locale) {
      var locale_dateTime = locale.dateTime,
          locale_date = locale.date,
          locale_time = locale.time,
          locale_periods = locale.periods,
          locale_weekdays = locale.days,
          locale_shortWeekdays = locale.shortDays,
          locale_months = locale.months,
          locale_shortMonths = locale.shortMonths;

      var periodRe = formatRe(locale_periods),
          periodLookup = formatLookup(locale_periods),
          weekdayRe = formatRe(locale_weekdays),
          weekdayLookup = formatLookup(locale_weekdays),
          shortWeekdayRe = formatRe(locale_shortWeekdays),
          shortWeekdayLookup = formatLookup(locale_shortWeekdays),
          monthRe = formatRe(locale_months),
          monthLookup = formatLookup(locale_months),
          shortMonthRe = formatRe(locale_shortMonths),
          shortMonthLookup = formatLookup(locale_shortMonths);

      var formats = {
        "a": formatShortWeekday,
        "A": formatWeekday,
        "b": formatShortMonth,
        "B": formatMonth,
        "c": null,
        "d": formatDayOfMonth,
        "e": formatDayOfMonth,
        "f": formatMicroseconds,
        "H": formatHour24,
        "I": formatHour12,
        "j": formatDayOfYear,
        "L": formatMilliseconds,
        "m": formatMonthNumber,
        "M": formatMinutes,
        "p": formatPeriod,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatSeconds,
        "u": formatWeekdayNumberMonday,
        "U": formatWeekNumberSunday,
        "V": formatWeekNumberISO,
        "w": formatWeekdayNumberSunday,
        "W": formatWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatYear,
        "Y": formatFullYear,
        "Z": formatZone,
        "%": formatLiteralPercent
      };

      var utcFormats = {
        "a": formatUTCShortWeekday,
        "A": formatUTCWeekday,
        "b": formatUTCShortMonth,
        "B": formatUTCMonth,
        "c": null,
        "d": formatUTCDayOfMonth,
        "e": formatUTCDayOfMonth,
        "f": formatUTCMicroseconds,
        "H": formatUTCHour24,
        "I": formatUTCHour12,
        "j": formatUTCDayOfYear,
        "L": formatUTCMilliseconds,
        "m": formatUTCMonthNumber,
        "M": formatUTCMinutes,
        "p": formatUTCPeriod,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatUTCSeconds,
        "u": formatUTCWeekdayNumberMonday,
        "U": formatUTCWeekNumberSunday,
        "V": formatUTCWeekNumberISO,
        "w": formatUTCWeekdayNumberSunday,
        "W": formatUTCWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatUTCYear,
        "Y": formatUTCFullYear,
        "Z": formatUTCZone,
        "%": formatLiteralPercent
      };

      var parses = {
        "a": parseShortWeekday,
        "A": parseWeekday,
        "b": parseShortMonth,
        "B": parseMonth,
        "c": parseLocaleDateTime,
        "d": parseDayOfMonth,
        "e": parseDayOfMonth,
        "f": parseMicroseconds,
        "H": parseHour24,
        "I": parseHour24,
        "j": parseDayOfYear,
        "L": parseMilliseconds,
        "m": parseMonthNumber,
        "M": parseMinutes,
        "p": parsePeriod,
        "Q": parseUnixTimestamp,
        "s": parseUnixTimestampSeconds,
        "S": parseSeconds,
        "u": parseWeekdayNumberMonday,
        "U": parseWeekNumberSunday,
        "V": parseWeekNumberISO,
        "w": parseWeekdayNumberSunday,
        "W": parseWeekNumberMonday,
        "x": parseLocaleDate,
        "X": parseLocaleTime,
        "y": parseYear,
        "Y": parseFullYear,
        "Z": parseZone,
        "%": parseLiteralPercent
      };

      // These recursive directive definitions must be deferred.
      formats.x = newFormat(locale_date, formats);
      formats.X = newFormat(locale_time, formats);
      formats.c = newFormat(locale_dateTime, formats);
      utcFormats.x = newFormat(locale_date, utcFormats);
      utcFormats.X = newFormat(locale_time, utcFormats);
      utcFormats.c = newFormat(locale_dateTime, utcFormats);

      function newFormat(specifier, formats) {
        return function(date) {
          var string = [],
              i = -1,
              j = 0,
              n = specifier.length,
              c,
              pad,
              format;

          if (!(date instanceof Date)) date = new Date(+date);

          while (++i < n) {
            if (specifier.charCodeAt(i) === 37) {
              string.push(specifier.slice(j, i));
              if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
              else pad = c === "e" ? " " : "0";
              if (format = formats[c]) c = format(date, pad);
              string.push(c);
              j = i + 1;
            }
          }

          string.push(specifier.slice(j, i));
          return string.join("");
        };
      }

      function newParse(specifier, newDate) {
        return function(string) {
          var d = newYear(1900),
              i = parseSpecifier(d, specifier, string += "", 0),
              week, day$1;
          if (i != string.length) return null;

          // If a UNIX timestamp is specified, return it.
          if ("Q" in d) return new Date(d.Q);

          // The am-pm flag is 0 for AM, and 1 for PM.
          if ("p" in d) d.H = d.H % 12 + d.p * 12;

          // Convert day-of-week and week-of-year to day-of-year.
          if ("V" in d) {
            if (d.V < 1 || d.V > 53) return null;
            if (!("w" in d)) d.w = 1;
            if ("Z" in d) {
              week = utcDate(newYear(d.y)), day$1 = week.getUTCDay();
              week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
              week = utcDay.offset(week, (d.V - 1) * 7);
              d.y = week.getUTCFullYear();
              d.m = week.getUTCMonth();
              d.d = week.getUTCDate() + (d.w + 6) % 7;
            } else {
              week = newDate(newYear(d.y)), day$1 = week.getDay();
              week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
              week = day.offset(week, (d.V - 1) * 7);
              d.y = week.getFullYear();
              d.m = week.getMonth();
              d.d = week.getDate() + (d.w + 6) % 7;
            }
          } else if ("W" in d || "U" in d) {
            if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
            day$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
            d.m = 0;
            d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
          }

          // If a time zone is specified, all fields are interpreted as UTC and then
          // offset according to the specified time zone.
          if ("Z" in d) {
            d.H += d.Z / 100 | 0;
            d.M += d.Z % 100;
            return utcDate(d);
          }

          // Otherwise, all fields are in local time.
          return newDate(d);
        };
      }

      function parseSpecifier(d, specifier, string, j) {
        var i = 0,
            n = specifier.length,
            m = string.length,
            c,
            parse;

        while (i < n) {
          if (j >= m) return -1;
          c = specifier.charCodeAt(i++);
          if (c === 37) {
            c = specifier.charAt(i++);
            parse = parses[c in pads ? specifier.charAt(i++) : c];
            if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
          } else if (c != string.charCodeAt(j++)) {
            return -1;
          }
        }

        return j;
      }

      function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, locale_dateTime, string, i);
      }

      function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, locale_date, string, i);
      }

      function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, locale_time, string, i);
      }

      function formatShortWeekday(d) {
        return locale_shortWeekdays[d.getDay()];
      }

      function formatWeekday(d) {
        return locale_weekdays[d.getDay()];
      }

      function formatShortMonth(d) {
        return locale_shortMonths[d.getMonth()];
      }

      function formatMonth(d) {
        return locale_months[d.getMonth()];
      }

      function formatPeriod(d) {
        return locale_periods[+(d.getHours() >= 12)];
      }

      function formatUTCShortWeekday(d) {
        return locale_shortWeekdays[d.getUTCDay()];
      }

      function formatUTCWeekday(d) {
        return locale_weekdays[d.getUTCDay()];
      }

      function formatUTCShortMonth(d) {
        return locale_shortMonths[d.getUTCMonth()];
      }

      function formatUTCMonth(d) {
        return locale_months[d.getUTCMonth()];
      }

      function formatUTCPeriod(d) {
        return locale_periods[+(d.getUTCHours() >= 12)];
      }

      return {
        format: function(specifier) {
          var f = newFormat(specifier += "", formats);
          f.toString = function() { return specifier; };
          return f;
        },
        parse: function(specifier) {
          var p = newParse(specifier += "", localDate);
          p.toString = function() { return specifier; };
          return p;
        },
        utcFormat: function(specifier) {
          var f = newFormat(specifier += "", utcFormats);
          f.toString = function() { return specifier; };
          return f;
        },
        utcParse: function(specifier) {
          var p = newParse(specifier, utcDate);
          p.toString = function() { return specifier; };
          return p;
        }
      };
    }

    var pads = {"-": "", "_": " ", "0": "0"},
        numberRe = /^\s*\d+/, // note: ignores next directive
        percentRe = /^%/,
        requoteRe = /[\\^$*+?|[\]().{}]/g;

    function pad(value, fill, width) {
      var sign = value < 0 ? "-" : "",
          string = (sign ? -value : value) + "",
          length = string.length;
      return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }

    function requote(s) {
      return s.replace(requoteRe, "\\$&");
    }

    function formatRe(names) {
      return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
    }

    function formatLookup(names) {
      var map = {}, i = -1, n = names.length;
      while (++i < n) map[names[i].toLowerCase()] = i;
      return map;
    }

    function parseWeekdayNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.w = +n[0], i + n[0].length) : -1;
    }

    function parseWeekdayNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.u = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.U = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberISO(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.V = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.W = +n[0], i + n[0].length) : -1;
    }

    function parseFullYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 4));
      return n ? (d.y = +n[0], i + n[0].length) : -1;
    }

    function parseYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }

    function parseZone(d, string, i) {
      var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
      return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
    }

    function parseMonthNumber(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
    }

    function parseDayOfMonth(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.d = +n[0], i + n[0].length) : -1;
    }

    function parseDayOfYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }

    function parseHour24(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.H = +n[0], i + n[0].length) : -1;
    }

    function parseMinutes(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.M = +n[0], i + n[0].length) : -1;
    }

    function parseSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.S = +n[0], i + n[0].length) : -1;
    }

    function parseMilliseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.L = +n[0], i + n[0].length) : -1;
    }

    function parseMicroseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 6));
      return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
    }

    function parseLiteralPercent(d, string, i) {
      var n = percentRe.exec(string.slice(i, i + 1));
      return n ? i + n[0].length : -1;
    }

    function parseUnixTimestamp(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }

    function parseUnixTimestampSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
    }

    function formatDayOfMonth(d, p) {
      return pad(d.getDate(), p, 2);
    }

    function formatHour24(d, p) {
      return pad(d.getHours(), p, 2);
    }

    function formatHour12(d, p) {
      return pad(d.getHours() % 12 || 12, p, 2);
    }

    function formatDayOfYear(d, p) {
      return pad(1 + day.count(year(d), d), p, 3);
    }

    function formatMilliseconds(d, p) {
      return pad(d.getMilliseconds(), p, 3);
    }

    function formatMicroseconds(d, p) {
      return formatMilliseconds(d, p) + "000";
    }

    function formatMonthNumber(d, p) {
      return pad(d.getMonth() + 1, p, 2);
    }

    function formatMinutes(d, p) {
      return pad(d.getMinutes(), p, 2);
    }

    function formatSeconds(d, p) {
      return pad(d.getSeconds(), p, 2);
    }

    function formatWeekdayNumberMonday(d) {
      var day = d.getDay();
      return day === 0 ? 7 : day;
    }

    function formatWeekNumberSunday(d, p) {
      return pad(sunday.count(year(d), d), p, 2);
    }

    function formatWeekNumberISO(d, p) {
      var day = d.getDay();
      d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
      return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
    }

    function formatWeekdayNumberSunday(d) {
      return d.getDay();
    }

    function formatWeekNumberMonday(d, p) {
      return pad(monday.count(year(d), d), p, 2);
    }

    function formatYear(d, p) {
      return pad(d.getFullYear() % 100, p, 2);
    }

    function formatFullYear(d, p) {
      return pad(d.getFullYear() % 10000, p, 4);
    }

    function formatZone(d) {
      var z = d.getTimezoneOffset();
      return (z > 0 ? "-" : (z *= -1, "+"))
          + pad(z / 60 | 0, "0", 2)
          + pad(z % 60, "0", 2);
    }

    function formatUTCDayOfMonth(d, p) {
      return pad(d.getUTCDate(), p, 2);
    }

    function formatUTCHour24(d, p) {
      return pad(d.getUTCHours(), p, 2);
    }

    function formatUTCHour12(d, p) {
      return pad(d.getUTCHours() % 12 || 12, p, 2);
    }

    function formatUTCDayOfYear(d, p) {
      return pad(1 + utcDay.count(utcYear(d), d), p, 3);
    }

    function formatUTCMilliseconds(d, p) {
      return pad(d.getUTCMilliseconds(), p, 3);
    }

    function formatUTCMicroseconds(d, p) {
      return formatUTCMilliseconds(d, p) + "000";
    }

    function formatUTCMonthNumber(d, p) {
      return pad(d.getUTCMonth() + 1, p, 2);
    }

    function formatUTCMinutes(d, p) {
      return pad(d.getUTCMinutes(), p, 2);
    }

    function formatUTCSeconds(d, p) {
      return pad(d.getUTCSeconds(), p, 2);
    }

    function formatUTCWeekdayNumberMonday(d) {
      var dow = d.getUTCDay();
      return dow === 0 ? 7 : dow;
    }

    function formatUTCWeekNumberSunday(d, p) {
      return pad(utcSunday.count(utcYear(d), d), p, 2);
    }

    function formatUTCWeekNumberISO(d, p) {
      var day = d.getUTCDay();
      d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
      return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
    }

    function formatUTCWeekdayNumberSunday(d) {
      return d.getUTCDay();
    }

    function formatUTCWeekNumberMonday(d, p) {
      return pad(utcMonday.count(utcYear(d), d), p, 2);
    }

    function formatUTCYear(d, p) {
      return pad(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCFullYear(d, p) {
      return pad(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCZone() {
      return "+0000";
    }

    function formatLiteralPercent() {
      return "%";
    }

    function formatUnixTimestamp(d) {
      return +d;
    }

    function formatUnixTimestampSeconds(d) {
      return Math.floor(+d / 1000);
    }

    var locale$1;
    var timeFormat;
    var timeParse;
    var utcFormat;
    var utcParse;

    defaultLocale$1({
      dateTime: "%x, %X",
      date: "%-m/%-d/%Y",
      time: "%-I:%M:%S %p",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    });

    function defaultLocale$1(definition) {
      locale$1 = formatLocale$1(definition);
      timeFormat = locale$1.format;
      timeParse = locale$1.parse;
      utcFormat = locale$1.utcFormat;
      utcParse = locale$1.utcParse;
      return locale$1;
    }

    var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

    function formatIsoNative(date) {
      return date.toISOString();
    }

    var formatIso = Date.prototype.toISOString
        ? formatIsoNative
        : utcFormat(isoSpecifier);

    function parseIsoNative(string) {
      var date = new Date(string);
      return isNaN(date) ? null : date;
    }

    var parseIso = +new Date("2000-01-01T00:00:00.000Z")
        ? parseIsoNative
        : utcParse(isoSpecifier);

    var durationSecond$1 = 1000,
        durationMinute$1 = durationSecond$1 * 60,
        durationHour$1 = durationMinute$1 * 60,
        durationDay$1 = durationHour$1 * 24,
        durationWeek$1 = durationDay$1 * 7,
        durationMonth = durationDay$1 * 30,
        durationYear = durationDay$1 * 365;

    function date$1(t) {
      return new Date(t);
    }

    function number$1(t) {
      return t instanceof Date ? +t : +new Date(+t);
    }

    function calendar(year, month, week, day, hour, minute, second, millisecond, format) {
      var scale = continuous(deinterpolateLinear, reinterpolate),
          invert = scale.invert,
          domain = scale.domain;

      var formatMillisecond = format(".%L"),
          formatSecond = format(":%S"),
          formatMinute = format("%I:%M"),
          formatHour = format("%I %p"),
          formatDay = format("%a %d"),
          formatWeek = format("%b %d"),
          formatMonth = format("%B"),
          formatYear = format("%Y");

      var tickIntervals = [
        [second,  1,      durationSecond$1],
        [second,  5,  5 * durationSecond$1],
        [second, 15, 15 * durationSecond$1],
        [second, 30, 30 * durationSecond$1],
        [minute,  1,      durationMinute$1],
        [minute,  5,  5 * durationMinute$1],
        [minute, 15, 15 * durationMinute$1],
        [minute, 30, 30 * durationMinute$1],
        [  hour,  1,      durationHour$1  ],
        [  hour,  3,  3 * durationHour$1  ],
        [  hour,  6,  6 * durationHour$1  ],
        [  hour, 12, 12 * durationHour$1  ],
        [   day,  1,      durationDay$1   ],
        [   day,  2,  2 * durationDay$1   ],
        [  week,  1,      durationWeek$1  ],
        [ month,  1,      durationMonth ],
        [ month,  3,  3 * durationMonth ],
        [  year,  1,      durationYear  ]
      ];

      function tickFormat(date) {
        return (second(date) < date ? formatMillisecond
            : minute(date) < date ? formatSecond
            : hour(date) < date ? formatMinute
            : day(date) < date ? formatHour
            : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
            : year(date) < date ? formatMonth
            : formatYear)(date);
      }

      function tickInterval(interval, start, stop, step) {
        if (interval == null) interval = 10;

        // If a desired tick count is specified, pick a reasonable tick interval
        // based on the extent of the domain and a rough estimate of tick size.
        // Otherwise, assume interval is already a time interval and use it.
        if (typeof interval === "number") {
          var target = Math.abs(stop - start) / interval,
              i = bisector(function(i) { return i[2]; }).right(tickIntervals, target);
          if (i === tickIntervals.length) {
            step = tickStep(start / durationYear, stop / durationYear, interval);
            interval = year;
          } else if (i) {
            i = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
            step = i[1];
            interval = i[0];
          } else {
            step = tickStep(start, stop, interval);
            interval = millisecond;
          }
        }

        return step == null ? interval : interval.every(step);
      }

      scale.invert = function(y) {
        return new Date(invert(y));
      };

      scale.domain = function(_) {
        return arguments.length ? domain(map$1.call(_, number$1)) : domain().map(date$1);
      };

      scale.ticks = function(interval, step) {
        var d = domain(),
            t0 = d[0],
            t1 = d[d.length - 1],
            r = t1 < t0,
            t;
        if (r) t = t0, t0 = t1, t1 = t;
        t = tickInterval(interval, t0, t1, step);
        t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
        return r ? t.reverse() : t;
      };

      scale.tickFormat = function(count, specifier) {
        return specifier == null ? tickFormat : format(specifier);
      };

      scale.nice = function(interval, step) {
        var d = domain();
        return (interval = tickInterval(interval, d[0], d[d.length - 1], step))
            ? domain(nice(d, interval))
            : scale;
      };

      scale.copy = function() {
        return copy(scale, calendar(year, month, week, day, hour, minute, second, millisecond, format));
      };

      return scale;
    }

    function scaleTime() {
      return calendar(year, month, sunday, day, hour, minute, second, millisecond, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]);
    }

    function colors(s) {
      return s.match(/.{6}/g).map(function(x) {
        return "#" + x;
      });
    }

    colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

    colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

    colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

    colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

    cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

    var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var rainbow = cubehelix();

    function ramp(range) {
      var n = range.length;
      return function(t) {
        return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
      };
    }

    ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

    var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

    var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

    var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

    function ascending$1(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector$1(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator$1(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator$1(f) {
      return (d, x) => ascending$1(f(d), x);
    }

    function extent(values, valueof) {
      let min;
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
      return [min, max];
    }

    // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
    class Adder {
      constructor() {
        this._partials = new Float64Array(32);
        this._n = 0;
      }
      add(x) {
        const p = this._partials;
        let i = 0;
        for (let j = 0; j < this._n && j < 32; j++) {
          const y = p[j],
            hi = x + y,
            lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
          if (lo) p[i++] = lo;
          x = hi;
        }
        p[i] = x;
        this._n = i + 1;
        return this;
      }
      valueOf() {
        const p = this._partials;
        let n = this._n, x, y, lo, hi = 0;
        if (n > 0) {
          hi = p[--n];
          while (n > 0) {
            x = hi;
            y = p[--n];
            hi = x + y;
            lo = y - (hi - x);
            if (lo) break;
          }
          if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
            y = lo * 2;
            x = hi + y;
            if (y == x - hi) hi = x;
          }
        }
        return hi;
      }
    }

    function max(values, valueof) {
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      }
      return max;
    }

    function* flatten(arrays) {
      for (const array of arrays) {
        yield* array;
      }
    }

    function merge(arrays) {
      return Array.from(flatten(arrays));
    }

    /* src/components/charts/Line.svelte generated by Svelte v3.31.0 */
    const file$2 = "src/components/charts/Line.svelte";

    // (48:0) {#if width}
    function create_if_block$2(ctx) {
    	let svg;
    	let title_1;
    	let t0;
    	let desc_1;
    	let t1;
    	let g;
    	let path_1;
    	let path_1_d_value;
    	let axis0;
    	let axis1;
    	let pointinteractive;
    	let svg_viewBox_value;
    	let current;
    	let mounted;
    	let dispose;

    	axis0 = new Axis({
    			props: {
    				width: /*width*/ ctx[8],
    				height: /*height*/ ctx[9],
    				margin: /*margin*/ ctx[1],
    				scale: /*y*/ ctx[11],
    				position: "left",
    				format: /*format*/ ctx[2].y
    			},
    			$$inline: true
    		});

    	axis1 = new Axis({
    			props: {
    				width: /*width*/ ctx[8],
    				height: /*height*/ ctx[9],
    				margin: /*margin*/ ctx[1],
    				scale: /*x*/ ctx[10],
    				position: "bottom",
    				format: /*format*/ ctx[2].x
    			},
    			$$inline: true
    		});

    	pointinteractive = new PointInteractive({
    			props: {
    				datum: /*datum*/ ctx[12],
    				format: /*format*/ ctx[2],
    				x: /*x*/ ctx[10],
    				y: /*y*/ ctx[11],
    				key: /*key*/ ctx[3],
    				width: /*width*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title_1 = svg_element("title");
    			t0 = text(/*title*/ ctx[5]);
    			desc_1 = svg_element("desc");
    			t1 = text(/*desc*/ ctx[6]);
    			g = svg_element("g");
    			path_1 = svg_element("path");
    			create_component(axis0.$$.fragment);
    			create_component(axis1.$$.fragment);
    			create_component(pointinteractive.$$.fragment);
    			attr_dev(title_1, "id", "title");
    			add_location(title_1, file$2, 59, 1, 1490);
    			attr_dev(desc_1, "id", "desc");
    			add_location(desc_1, file$2, 60, 1, 1525);
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[13](/*data*/ ctx[0]));
    			attr_dev(path_1, "stroke", /*color*/ ctx[4]);
    			attr_dev(path_1, "fill", "none");
    			add_location(path_1, file$2, 62, 2, 1562);
    			add_location(g, file$2, 61, 1, 1556);
    			attr_dev(svg, "xmlns:svg", "https://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*width*/ ctx[8] + " " + /*height*/ ctx[9]);
    			attr_dev(svg, "width", /*width*/ ctx[8]);
    			attr_dev(svg, "height", /*height*/ ctx[9]);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "aria-labelledby", "title desc");
    			add_location(svg, file$2, 48, 0, 1231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title_1);
    			append_dev(title_1, t0);
    			append_dev(svg, desc_1);
    			append_dev(desc_1, t1);
    			append_dev(svg, g);
    			append_dev(g, path_1);
    			mount_component(axis0, svg, null);
    			mount_component(axis1, svg, null);
    			mount_component(pointinteractive, svg, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "touchmove", prevent_default(/*touchmove_handler*/ ctx[16]), false, true, false),
    					listen_dev(svg, "pointermove", prevent_default(/*mouseMove*/ ctx[14]), false, true, false),
    					listen_dev(svg, "mouseleave", /*leave*/ ctx[15], false, false, false),
    					listen_dev(svg, "touchend", /*leave*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 32) set_data_dev(t0, /*title*/ ctx[5]);
    			if (!current || dirty & /*desc*/ 64) set_data_dev(t1, /*desc*/ ctx[6]);

    			if (!current || dirty & /*path, data*/ 8193 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[13](/*data*/ ctx[0]))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (!current || dirty & /*color*/ 16) {
    				attr_dev(path_1, "stroke", /*color*/ ctx[4]);
    			}

    			const axis0_changes = {};
    			if (dirty & /*width*/ 256) axis0_changes.width = /*width*/ ctx[8];
    			if (dirty & /*height*/ 512) axis0_changes.height = /*height*/ ctx[9];
    			if (dirty & /*margin*/ 2) axis0_changes.margin = /*margin*/ ctx[1];
    			if (dirty & /*y*/ 2048) axis0_changes.scale = /*y*/ ctx[11];
    			if (dirty & /*format*/ 4) axis0_changes.format = /*format*/ ctx[2].y;
    			axis0.$set(axis0_changes);
    			const axis1_changes = {};
    			if (dirty & /*width*/ 256) axis1_changes.width = /*width*/ ctx[8];
    			if (dirty & /*height*/ 512) axis1_changes.height = /*height*/ ctx[9];
    			if (dirty & /*margin*/ 2) axis1_changes.margin = /*margin*/ ctx[1];
    			if (dirty & /*x*/ 1024) axis1_changes.scale = /*x*/ ctx[10];
    			if (dirty & /*format*/ 4) axis1_changes.format = /*format*/ ctx[2].x;
    			axis1.$set(axis1_changes);
    			const pointinteractive_changes = {};
    			if (dirty & /*datum*/ 4096) pointinteractive_changes.datum = /*datum*/ ctx[12];
    			if (dirty & /*format*/ 4) pointinteractive_changes.format = /*format*/ ctx[2];
    			if (dirty & /*x*/ 1024) pointinteractive_changes.x = /*x*/ ctx[10];
    			if (dirty & /*y*/ 2048) pointinteractive_changes.y = /*y*/ ctx[11];
    			if (dirty & /*key*/ 8) pointinteractive_changes.key = /*key*/ ctx[3];
    			if (dirty & /*width*/ 256) pointinteractive_changes.width = /*width*/ ctx[8];
    			pointinteractive.$set(pointinteractive_changes);

    			if (!current || dirty & /*width, height*/ 768 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*width*/ ctx[8] + " " + /*height*/ ctx[9])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty & /*width*/ 256) {
    				attr_dev(svg, "width", /*width*/ ctx[8]);
    			}

    			if (!current || dirty & /*height*/ 512) {
    				attr_dev(svg, "height", /*height*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axis0.$$.fragment, local);
    			transition_in(axis1.$$.fragment, local);
    			transition_in(pointinteractive.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axis0.$$.fragment, local);
    			transition_out(axis1.$$.fragment, local);
    			transition_out(pointinteractive.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_component(axis0);
    			destroy_component(axis1);
    			destroy_component(pointinteractive);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(48:0) {#if width}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let div_class_value;
    	let div_resize_listener;
    	let current;
    	let if_block = /*width*/ ctx[8] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "graphic " + /*layout*/ ctx[7]);
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[17].call(div));
    			add_location(div, file$2, 46, 0, 1136);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[17].bind(div));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*width*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*width*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*layout*/ 128 && div_class_value !== (div_class_value = "graphic " + /*layout*/ ctx[7])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Line", slots, []);
    	let { data } = $$props;
    	let { margin = { top: 20, right: 5, bottom: 20, left: 5 } } = $$props;
    	let { format } = $$props;
    	let { key } = $$props;
    	let { color } = $$props;
    	let { title } = $$props;
    	let { desc } = $$props;
    	let { layout } = $$props;
    	let datum, width, height;

    	const mouseMove = m => {
    		const mX = m.offsetX ? m.offsetX : m.clientX;
    		const _data = [...data];
    		_data.sort((a, b) => a[key.x] - b[[key.x]]);
    		const index = x.invert(mX);
    		const i = bisector$1(d => d[key.x]).center(_data, index);
    		$$invalidate(12, datum = _data[i]);
    	};

    	const leave = m => {
    		$$invalidate(12, datum = undefined);
    	};

    	const writable_props = ["data", "margin", "format", "key", "color", "title", "desc", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	function touchmove_handler(event) {
    		bubble($$self, event);
    	}

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(8, width);
    		$$invalidate(9, height);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({
    		Axis,
    		PointInteractive,
    		line,
    		curveStep,
    		scaleTime,
    		scaleLinear: linear$1,
    		max,
    		extent,
    		bisector: bisector$1,
    		data,
    		margin,
    		format,
    		key,
    		color,
    		title,
    		desc,
    		layout,
    		datum,
    		width,
    		height,
    		mouseMove,
    		leave,
    		x,
    		y,
    		path
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    		if ("datum" in $$props) $$invalidate(12, datum = $$props.datum);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("height" in $$props) $$invalidate(9, height = $$props.height);
    		if ("x" in $$props) $$invalidate(10, x = $$props.x);
    		if ("y" in $$props) $$invalidate(11, y = $$props.y);
    		if ("path" in $$props) $$invalidate(13, path = $$props.path);
    	};

    	let x;
    	let y;
    	let path;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, key, margin, width*/ 267) {
    			 $$invalidate(10, x = scaleTime().domain(extent(data, d => d[key.x])).range([margin.left, width - margin.right]));
    		}

    		if ($$self.$$.dirty & /*data, key, height, margin*/ 523) {
    			 $$invalidate(11, y = linear$1().domain([0, max(data, d => d[key.y])]).range([height - margin.bottom - margin.top, margin.top]));
    		}

    		if ($$self.$$.dirty & /*x, key, y*/ 3080) {
    			 $$invalidate(13, path = line().x(d => x(d[key.x])).y(d => y(d[key.y])).curve(curveStep));
    		}
    	};

    	return [
    		data,
    		margin,
    		format,
    		key,
    		color,
    		title,
    		desc,
    		layout,
    		width,
    		height,
    		x,
    		y,
    		datum,
    		path,
    		mouseMove,
    		leave,
    		touchmove_handler,
    		div_elementresize_handler
    	];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			data: 0,
    			margin: 1,
    			format: 2,
    			key: 3,
    			color: 4,
    			title: 5,
    			desc: 6,
    			layout: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Line> was created without expected prop 'data'");
    		}

    		if (/*format*/ ctx[2] === undefined && !("format" in props)) {
    			console.warn("<Line> was created without expected prop 'format'");
    		}

    		if (/*key*/ ctx[3] === undefined && !("key" in props)) {
    			console.warn("<Line> was created without expected prop 'key'");
    		}

    		if (/*color*/ ctx[4] === undefined && !("color" in props)) {
    			console.warn("<Line> was created without expected prop 'color'");
    		}

    		if (/*title*/ ctx[5] === undefined && !("title" in props)) {
    			console.warn("<Line> was created without expected prop 'title'");
    		}

    		if (/*desc*/ ctx[6] === undefined && !("desc" in props)) {
    			console.warn("<Line> was created without expected prop 'desc'");
    		}

    		if (/*layout*/ ctx[7] === undefined && !("layout" in props)) {
    			console.warn("<Line> was created without expected prop 'layout'");
    		}
    	}

    	get data() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/charts/Area.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/components/charts/Area.svelte";

    // (49:0) {#if width}
    function create_if_block$3(ctx) {
    	let svg;
    	let title_1;
    	let t0;
    	let desc_1;
    	let t1;
    	let g;
    	let path_1;
    	let path_1_d_value;
    	let axis0;
    	let axis1;
    	let pointinteractive;
    	let svg_viewBox_value;
    	let current;
    	let mounted;
    	let dispose;

    	axis0 = new Axis({
    			props: {
    				width: /*width*/ ctx[8],
    				height: /*height*/ ctx[9],
    				margin: /*margin*/ ctx[1],
    				scale: /*y*/ ctx[11],
    				position: "left",
    				format: /*format*/ ctx[2].y
    			},
    			$$inline: true
    		});

    	axis1 = new Axis({
    			props: {
    				width: /*width*/ ctx[8],
    				height: /*height*/ ctx[9],
    				margin: /*margin*/ ctx[1],
    				scale: /*x*/ ctx[10],
    				position: "bottom",
    				format: /*format*/ ctx[2].x
    			},
    			$$inline: true
    		});

    	pointinteractive = new PointInteractive({
    			props: {
    				datum: /*datum*/ ctx[12],
    				format: /*format*/ ctx[2],
    				x: /*x*/ ctx[10],
    				y: /*y*/ ctx[11],
    				key: /*key*/ ctx[3],
    				width: /*width*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title_1 = svg_element("title");
    			t0 = text(/*title*/ ctx[5]);
    			desc_1 = svg_element("desc");
    			t1 = text(/*desc*/ ctx[6]);
    			g = svg_element("g");
    			path_1 = svg_element("path");
    			create_component(axis0.$$.fragment);
    			create_component(axis1.$$.fragment);
    			create_component(pointinteractive.$$.fragment);
    			attr_dev(title_1, "id", "title");
    			add_location(title_1, file$3, 60, 1, 1537);
    			attr_dev(desc_1, "id", "desc");
    			add_location(desc_1, file$3, 61, 1, 1572);
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[13](/*data*/ ctx[0]));
    			attr_dev(path_1, "fill", /*color*/ ctx[4]);
    			attr_dev(path_1, "stroke", "none");
    			add_location(path_1, file$3, 63, 2, 1609);
    			add_location(g, file$3, 62, 1, 1603);
    			attr_dev(svg, "xmlns:svg", "https://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + (/*width*/ ctx[8] - /*margin*/ ctx[1].right - /*margin*/ ctx[1].left) + " " + /*height*/ ctx[9]);
    			attr_dev(svg, "width", /*width*/ ctx[8]);
    			attr_dev(svg, "height", /*height*/ ctx[9]);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "aria-labelledby", "title desc");
    			add_location(svg, file$3, 49, 0, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title_1);
    			append_dev(title_1, t0);
    			append_dev(svg, desc_1);
    			append_dev(desc_1, t1);
    			append_dev(svg, g);
    			append_dev(g, path_1);
    			mount_component(axis0, svg, null);
    			mount_component(axis1, svg, null);
    			mount_component(pointinteractive, svg, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "touchmove", prevent_default(/*touchmove_handler*/ ctx[16]), false, true, false),
    					listen_dev(svg, "pointermove", prevent_default(/*mouseMove*/ ctx[14]), false, true, false),
    					listen_dev(svg, "mouseleave", /*leave*/ ctx[15], false, false, false),
    					listen_dev(svg, "touchend", /*leave*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 32) set_data_dev(t0, /*title*/ ctx[5]);
    			if (!current || dirty & /*desc*/ 64) set_data_dev(t1, /*desc*/ ctx[6]);

    			if (!current || dirty & /*path, data*/ 8193 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[13](/*data*/ ctx[0]))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (!current || dirty & /*color*/ 16) {
    				attr_dev(path_1, "fill", /*color*/ ctx[4]);
    			}

    			const axis0_changes = {};
    			if (dirty & /*width*/ 256) axis0_changes.width = /*width*/ ctx[8];
    			if (dirty & /*height*/ 512) axis0_changes.height = /*height*/ ctx[9];
    			if (dirty & /*margin*/ 2) axis0_changes.margin = /*margin*/ ctx[1];
    			if (dirty & /*y*/ 2048) axis0_changes.scale = /*y*/ ctx[11];
    			if (dirty & /*format*/ 4) axis0_changes.format = /*format*/ ctx[2].y;
    			axis0.$set(axis0_changes);
    			const axis1_changes = {};
    			if (dirty & /*width*/ 256) axis1_changes.width = /*width*/ ctx[8];
    			if (dirty & /*height*/ 512) axis1_changes.height = /*height*/ ctx[9];
    			if (dirty & /*margin*/ 2) axis1_changes.margin = /*margin*/ ctx[1];
    			if (dirty & /*x*/ 1024) axis1_changes.scale = /*x*/ ctx[10];
    			if (dirty & /*format*/ 4) axis1_changes.format = /*format*/ ctx[2].x;
    			axis1.$set(axis1_changes);
    			const pointinteractive_changes = {};
    			if (dirty & /*datum*/ 4096) pointinteractive_changes.datum = /*datum*/ ctx[12];
    			if (dirty & /*format*/ 4) pointinteractive_changes.format = /*format*/ ctx[2];
    			if (dirty & /*x*/ 1024) pointinteractive_changes.x = /*x*/ ctx[10];
    			if (dirty & /*y*/ 2048) pointinteractive_changes.y = /*y*/ ctx[11];
    			if (dirty & /*key*/ 8) pointinteractive_changes.key = /*key*/ ctx[3];
    			if (dirty & /*width*/ 256) pointinteractive_changes.width = /*width*/ ctx[8];
    			pointinteractive.$set(pointinteractive_changes);

    			if (!current || dirty & /*width, margin, height*/ 770 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + (/*width*/ ctx[8] - /*margin*/ ctx[1].right - /*margin*/ ctx[1].left) + " " + /*height*/ ctx[9])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty & /*width*/ 256) {
    				attr_dev(svg, "width", /*width*/ ctx[8]);
    			}

    			if (!current || dirty & /*height*/ 512) {
    				attr_dev(svg, "height", /*height*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axis0.$$.fragment, local);
    			transition_in(axis1.$$.fragment, local);
    			transition_in(pointinteractive.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axis0.$$.fragment, local);
    			transition_out(axis1.$$.fragment, local);
    			transition_out(pointinteractive.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_component(axis0);
    			destroy_component(axis1);
    			destroy_component(pointinteractive);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(49:0) {#if width}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let div_class_value;
    	let div_resize_listener;
    	let current;
    	let if_block = /*width*/ ctx[8] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "graphic " + /*layout*/ ctx[7]);
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[17].call(div));
    			add_location(div, file$3, 47, 0, 1154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[17].bind(div));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*width*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*width*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*layout*/ 128 && div_class_value !== (div_class_value = "graphic " + /*layout*/ ctx[7])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Area", slots, []);
    	let { data } = $$props;
    	let { margin = { top: 20, right: 5, bottom: 20, left: 5 } } = $$props;
    	let { format } = $$props;
    	let { key } = $$props;
    	let { color } = $$props;
    	let { title } = $$props;
    	let { desc } = $$props;
    	let { layout } = $$props;
    	let datum, width, height;

    	const mouseMove = m => {
    		const mX = m.offsetX ? m.offsetX : m.clientX;
    		const _data = [...data];
    		_data.sort((a, b) => a[key.x] - b[[key.x]]);
    		const index = x.invert(mX);
    		const i = bisector$1(d => d[key.x]).center(_data, index);
    		$$invalidate(12, datum = _data[i]);
    	};

    	const leave = m => {
    		$$invalidate(12, datum = undefined);
    	};

    	const writable_props = ["data", "margin", "format", "key", "color", "title", "desc", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Area> was created with unknown prop '${key}'`);
    	});

    	function touchmove_handler(event) {
    		bubble($$self, event);
    	}

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(8, width);
    		$$invalidate(9, height);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({
    		Axis,
    		PointInteractive,
    		area,
    		curveStep,
    		scaleTime,
    		scaleLinear: linear$1,
    		max,
    		extent,
    		bisector: bisector$1,
    		data,
    		margin,
    		format,
    		key,
    		color,
    		title,
    		desc,
    		layout,
    		datum,
    		width,
    		height,
    		mouseMove,
    		leave,
    		x,
    		y,
    		path
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    		if ("datum" in $$props) $$invalidate(12, datum = $$props.datum);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("height" in $$props) $$invalidate(9, height = $$props.height);
    		if ("x" in $$props) $$invalidate(10, x = $$props.x);
    		if ("y" in $$props) $$invalidate(11, y = $$props.y);
    		if ("path" in $$props) $$invalidate(13, path = $$props.path);
    	};

    	let x;
    	let y;
    	let path;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, key, margin, width*/ 267) {
    			 $$invalidate(10, x = scaleTime().domain(extent(data, d => d[key.x])).range([margin.left, width - margin.right]));
    		}

    		if ($$self.$$.dirty & /*data, key, height, margin*/ 523) {
    			 $$invalidate(11, y = linear$1().domain([0, max(data, d => d[key.y])]).range([height - margin.bottom - margin.top, margin.top]));
    		}

    		if ($$self.$$.dirty & /*x, key, y*/ 3080) {
    			 $$invalidate(13, path = area().x(d => x(d[key.x])).y0(d => y(0)).y1(d => y(d[key.y])).curve(curveStep));
    		}
    	};

    	return [
    		data,
    		margin,
    		format,
    		key,
    		color,
    		title,
    		desc,
    		layout,
    		width,
    		height,
    		x,
    		y,
    		datum,
    		path,
    		mouseMove,
    		leave,
    		touchmove_handler,
    		div_elementresize_handler
    	];
    }

    class Area extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			data: 0,
    			margin: 1,
    			format: 2,
    			key: 3,
    			color: 4,
    			title: 5,
    			desc: 6,
    			layout: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Area",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Area> was created without expected prop 'data'");
    		}

    		if (/*format*/ ctx[2] === undefined && !("format" in props)) {
    			console.warn("<Area> was created without expected prop 'format'");
    		}

    		if (/*key*/ ctx[3] === undefined && !("key" in props)) {
    			console.warn("<Area> was created without expected prop 'key'");
    		}

    		if (/*color*/ ctx[4] === undefined && !("color" in props)) {
    			console.warn("<Area> was created without expected prop 'color'");
    		}

    		if (/*title*/ ctx[5] === undefined && !("title" in props)) {
    			console.warn("<Area> was created without expected prop 'title'");
    		}

    		if (/*desc*/ ctx[6] === undefined && !("desc" in props)) {
    			console.warn("<Area> was created without expected prop 'desc'");
    		}

    		if (/*layout*/ ctx[7] === undefined && !("layout" in props)) {
    			console.warn("<Area> was created without expected prop 'layout'");
    		}
    	}

    	get data() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const EPSILON = Math.pow(2, -52);
    const EDGE_STACK = new Uint32Array(512);

    class Delaunator {

        static from(points, getX = defaultGetX, getY = defaultGetY) {
            const n = points.length;
            const coords = new Float64Array(n * 2);

            for (let i = 0; i < n; i++) {
                const p = points[i];
                coords[2 * i] = getX(p);
                coords[2 * i + 1] = getY(p);
            }

            return new Delaunator(coords);
        }

        constructor(coords) {
            const n = coords.length >> 1;
            if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');

            this.coords = coords;

            // arrays that will store the triangulation graph
            const maxTriangles = Math.max(2 * n - 5, 0);
            this._triangles = new Uint32Array(maxTriangles * 3);
            this._halfedges = new Int32Array(maxTriangles * 3);

            // temporary arrays for tracking the edges of the advancing convex hull
            this._hashSize = Math.ceil(Math.sqrt(n));
            this._hullPrev = new Uint32Array(n); // edge to prev edge
            this._hullNext = new Uint32Array(n); // edge to next edge
            this._hullTri = new Uint32Array(n); // edge to adjacent triangle
            this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash

            // temporary arrays for sorting points
            this._ids = new Uint32Array(n);
            this._dists = new Float64Array(n);

            this.update();
        }

        update() {
            const {coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash} =  this;
            const n = coords.length >> 1;

            // populate an array of point indices; calculate input data bbox
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < n; i++) {
                const x = coords[2 * i];
                const y = coords[2 * i + 1];
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                this._ids[i] = i;
            }
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;

            let minDist = Infinity;
            let i0, i1, i2;

            // pick a seed point close to the center
            for (let i = 0; i < n; i++) {
                const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist) {
                    i0 = i;
                    minDist = d;
                }
            }
            const i0x = coords[2 * i0];
            const i0y = coords[2 * i0 + 1];

            minDist = Infinity;

            // find the point closest to the seed
            for (let i = 0; i < n; i++) {
                if (i === i0) continue;
                const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist && d > 0) {
                    i1 = i;
                    minDist = d;
                }
            }
            let i1x = coords[2 * i1];
            let i1y = coords[2 * i1 + 1];

            let minRadius = Infinity;

            // find the third point which forms the smallest circumcircle with the first two
            for (let i = 0; i < n; i++) {
                if (i === i0 || i === i1) continue;
                const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
                if (r < minRadius) {
                    i2 = i;
                    minRadius = r;
                }
            }
            let i2x = coords[2 * i2];
            let i2y = coords[2 * i2 + 1];

            if (minRadius === Infinity) {
                // order collinear points by dx (or dy if all x are identical)
                // and return the list as a hull
                for (let i = 0; i < n; i++) {
                    this._dists[i] = (coords[2 * i] - coords[0]) || (coords[2 * i + 1] - coords[1]);
                }
                quicksort(this._ids, this._dists, 0, n - 1);
                const hull = new Uint32Array(n);
                let j = 0;
                for (let i = 0, d0 = -Infinity; i < n; i++) {
                    const id = this._ids[i];
                    if (this._dists[id] > d0) {
                        hull[j++] = id;
                        d0 = this._dists[id];
                    }
                }
                this.hull = hull.subarray(0, j);
                this.triangles = new Uint32Array(0);
                this.halfedges = new Uint32Array(0);
                return;
            }

            // swap the order of the seed points for counter-clockwise orientation
            if (orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
                const i = i1;
                const x = i1x;
                const y = i1y;
                i1 = i2;
                i1x = i2x;
                i1y = i2y;
                i2 = i;
                i2x = x;
                i2y = y;
            }

            const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
            this._cx = center.x;
            this._cy = center.y;

            for (let i = 0; i < n; i++) {
                this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
            }

            // sort the points by distance from the seed triangle circumcenter
            quicksort(this._ids, this._dists, 0, n - 1);

            // set up the seed triangle as the starting hull
            this._hullStart = i0;
            let hullSize = 3;

            hullNext[i0] = hullPrev[i2] = i1;
            hullNext[i1] = hullPrev[i0] = i2;
            hullNext[i2] = hullPrev[i1] = i0;

            hullTri[i0] = 0;
            hullTri[i1] = 1;
            hullTri[i2] = 2;

            hullHash.fill(-1);
            hullHash[this._hashKey(i0x, i0y)] = i0;
            hullHash[this._hashKey(i1x, i1y)] = i1;
            hullHash[this._hashKey(i2x, i2y)] = i2;

            this.trianglesLen = 0;
            this._addTriangle(i0, i1, i2, -1, -1, -1);

            for (let k = 0, xp, yp; k < this._ids.length; k++) {
                const i = this._ids[k];
                const x = coords[2 * i];
                const y = coords[2 * i + 1];

                // skip near-duplicate points
                if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON) continue;
                xp = x;
                yp = y;

                // skip seed triangle points
                if (i === i0 || i === i1 || i === i2) continue;

                // find a visible edge on the convex hull using edge hash
                let start = 0;
                for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                    start = hullHash[(key + j) % this._hashSize];
                    if (start !== -1 && start !== hullNext[start]) break;
                }

                start = hullPrev[start];
                let e = start, q;
                while (q = hullNext[e], !orient(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1])) {
                    e = q;
                    if (e === start) {
                        e = -1;
                        break;
                    }
                }
                if (e === -1) continue; // likely a near-duplicate point; skip it

                // add the first triangle from the point
                let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

                // recursively flip triangles from the point until they satisfy the Delaunay condition
                hullTri[i] = this._legalize(t + 2);
                hullTri[e] = t; // keep track of boundary triangles on the hull
                hullSize++;

                // walk forward through the hull, adding more triangles and flipping recursively
                let n = hullNext[e];
                while (q = hullNext[n], orient(x, y, coords[2 * n], coords[2 * n + 1], coords[2 * q], coords[2 * q + 1])) {
                    t = this._addTriangle(n, i, q, hullTri[i], -1, hullTri[n]);
                    hullTri[i] = this._legalize(t + 2);
                    hullNext[n] = n; // mark as removed
                    hullSize--;
                    n = q;
                }

                // walk backward from the other side, adding more triangles and flipping
                if (e === start) {
                    while (q = hullPrev[e], orient(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1])) {
                        t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                        this._legalize(t + 2);
                        hullTri[q] = t;
                        hullNext[e] = e; // mark as removed
                        hullSize--;
                        e = q;
                    }
                }

                // update the hull indices
                this._hullStart = hullPrev[i] = e;
                hullNext[e] = hullPrev[n] = i;
                hullNext[i] = n;

                // save the two new edges in the hash table
                hullHash[this._hashKey(x, y)] = i;
                hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
            }

            this.hull = new Uint32Array(hullSize);
            for (let i = 0, e = this._hullStart; i < hullSize; i++) {
                this.hull[i] = e;
                e = hullNext[e];
            }

            // trim typed triangle mesh arrays
            this.triangles = this._triangles.subarray(0, this.trianglesLen);
            this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
        }

        _hashKey(x, y) {
            return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
        }

        _legalize(a) {
            const {_triangles: triangles, _halfedges: halfedges, coords} = this;

            let i = 0;
            let ar = 0;

            // recursion eliminated with a fixed-size stack
            while (true) {
                const b = halfedges[a];

                /* if the pair of triangles doesn't satisfy the Delaunay condition
                 * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
                 * then do the same check/flip recursively for the new pair of triangles
                 *
                 *           pl                    pl
                 *          /||\                  /  \
                 *       al/ || \bl            al/    \a
                 *        /  ||  \              /      \
                 *       /  a||b  \    flip    /___ar___\
                 *     p0\   ||   /p1   =>   p0\---bl---/p1
                 *        \  ||  /              \      /
                 *       ar\ || /br             b\    /br
                 *          \||/                  \  /
                 *           pr                    pr
                 */
                const a0 = a - a % 3;
                ar = a0 + (a + 2) % 3;

                if (b === -1) { // convex hull edge
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                    continue;
                }

                const b0 = b - b % 3;
                const al = a0 + (a + 1) % 3;
                const bl = b0 + (b + 2) % 3;

                const p0 = triangles[ar];
                const pr = triangles[a];
                const pl = triangles[al];
                const p1 = triangles[bl];

                const illegal = inCircle(
                    coords[2 * p0], coords[2 * p0 + 1],
                    coords[2 * pr], coords[2 * pr + 1],
                    coords[2 * pl], coords[2 * pl + 1],
                    coords[2 * p1], coords[2 * p1 + 1]);

                if (illegal) {
                    triangles[a] = p1;
                    triangles[b] = p0;

                    const hbl = halfedges[bl];

                    // edge swapped on the other side of the hull (rare); fix the halfedge reference
                    if (hbl === -1) {
                        let e = this._hullStart;
                        do {
                            if (this._hullTri[e] === bl) {
                                this._hullTri[e] = a;
                                break;
                            }
                            e = this._hullPrev[e];
                        } while (e !== this._hullStart);
                    }
                    this._link(a, hbl);
                    this._link(b, halfedges[ar]);
                    this._link(ar, bl);

                    const br = b0 + (b + 1) % 3;

                    // don't worry about hitting the cap: it can only happen on extremely degenerate input
                    if (i < EDGE_STACK.length) {
                        EDGE_STACK[i++] = br;
                    }
                } else {
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                }
            }

            return ar;
        }

        _link(a, b) {
            this._halfedges[a] = b;
            if (b !== -1) this._halfedges[b] = a;
        }

        // add a new triangle given vertex indices and adjacent half-edge ids
        _addTriangle(i0, i1, i2, a, b, c) {
            const t = this.trianglesLen;

            this._triangles[t] = i0;
            this._triangles[t + 1] = i1;
            this._triangles[t + 2] = i2;

            this._link(t, a);
            this._link(t + 1, b);
            this._link(t + 2, c);

            this.trianglesLen += 3;

            return t;
        }
    }

    // monotonically increases with real angle, but doesn't need expensive trigonometry
    function pseudoAngle(dx, dy) {
        const p = dx / (Math.abs(dx) + Math.abs(dy));
        return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
    }

    function dist(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return dx * dx + dy * dy;
    }

    // return 2d orientation sign if we're confident in it through J. Shewchuk's error bound check
    function orientIfSure(px, py, rx, ry, qx, qy) {
        const l = (ry - py) * (qx - px);
        const r = (rx - px) * (qy - py);
        return Math.abs(l - r) >= 3.3306690738754716e-16 * Math.abs(l + r) ? l - r : 0;
    }

    // a more robust orientation test that's stable in a given triangle (to fix robustness issues)
    function orient(rx, ry, qx, qy, px, py) {
        const sign = orientIfSure(px, py, rx, ry, qx, qy) ||
        orientIfSure(rx, ry, qx, qy, px, py) ||
        orientIfSure(qx, qy, px, py, rx, ry);
        return sign < 0;
    }

    function inCircle(ax, ay, bx, by, cx, cy, px, py) {
        const dx = ax - px;
        const dy = ay - py;
        const ex = bx - px;
        const ey = by - py;
        const fx = cx - px;
        const fy = cy - py;

        const ap = dx * dx + dy * dy;
        const bp = ex * ex + ey * ey;
        const cp = fx * fx + fy * fy;

        return dx * (ey * cp - bp * fy) -
               dy * (ex * cp - bp * fx) +
               ap * (ex * fy - ey * fx) < 0;
    }

    function circumradius(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = (ey * bl - dy * cl) * d;
        const y = (dx * cl - ex * bl) * d;

        return x * x + y * y;
    }

    function circumcenter(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = ax + (ey * bl - dy * cl) * d;
        const y = ay + (dx * cl - ex * bl) * d;

        return {x, y};
    }

    function quicksort(ids, dists, left, right) {
        if (right - left <= 20) {
            for (let i = left + 1; i <= right; i++) {
                const temp = ids[i];
                const tempDist = dists[temp];
                let j = i - 1;
                while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
                ids[j + 1] = temp;
            }
        } else {
            const median = (left + right) >> 1;
            let i = left + 1;
            let j = right;
            swap(ids, median, i);
            if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
            if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
            if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

            const temp = ids[i];
            const tempDist = dists[temp];
            while (true) {
                do i++; while (dists[ids[i]] < tempDist);
                do j--; while (dists[ids[j]] > tempDist);
                if (j < i) break;
                swap(ids, i, j);
            }
            ids[left + 1] = ids[j];
            ids[j] = temp;

            if (right - i + 1 >= j - left) {
                quicksort(ids, dists, i, right);
                quicksort(ids, dists, left, j - 1);
            } else {
                quicksort(ids, dists, left, j - 1);
                quicksort(ids, dists, i, right);
            }
        }
    }

    function swap(arr, i, j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function defaultGetX(p) {
        return p[0];
    }
    function defaultGetY(p) {
        return p[1];
    }

    const epsilon$1 = 1e-6;

    class Path$1 {
      constructor() {
        this._x0 = this._y0 = // start of current subpath
        this._x1 = this._y1 = null; // end of current subpath
        this._ = "";
      }
      moveTo(x, y) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
      }
      closePath() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      }
      lineTo(x, y) {
        this._ += `L${this._x1 = +x},${this._y1 = +y}`;
      }
      arc(x, y, r) {
        x = +x, y = +y, r = +r;
        const x0 = x + r;
        const y0 = y;
        if (r < 0) throw new Error("negative radius");
        if (this._x1 === null) this._ += `M${x0},${y0}`;
        else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) this._ += "L" + x0 + "," + y0;
        if (!r) return;
        this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
      }
      rect(x, y, w, h) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`;
      }
      value() {
        return this._ || null;
      }
    }

    class Polygon {
      constructor() {
        this._ = [];
      }
      moveTo(x, y) {
        this._.push([x, y]);
      }
      closePath() {
        this._.push(this._[0].slice());
      }
      lineTo(x, y) {
        this._.push([x, y]);
      }
      value() {
        return this._.length ? this._ : null;
      }
    }

    class Voronoi {
      constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
        if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
        this.delaunay = delaunay;
        this._circumcenters = new Float64Array(delaunay.points.length * 2);
        this.vectors = new Float64Array(delaunay.points.length * 2);
        this.xmax = xmax, this.xmin = xmin;
        this.ymax = ymax, this.ymin = ymin;
        this._init();
      }
      update() {
        this.delaunay.update();
        this._init();
        return this;
      }
      _init() {
        const {delaunay: {points, hull, triangles}, vectors} = this;

        // Compute circumcenters.
        const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
        for (let i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
          const t1 = triangles[i] * 2;
          const t2 = triangles[i + 1] * 2;
          const t3 = triangles[i + 2] * 2;
          const x1 = points[t1];
          const y1 = points[t1 + 1];
          const x2 = points[t2];
          const y2 = points[t2 + 1];
          const x3 = points[t3];
          const y3 = points[t3 + 1];

          const dx = x2 - x1;
          const dy = y2 - y1;
          const ex = x3 - x1;
          const ey = y3 - y1;
          const bl = dx * dx + dy * dy;
          const cl = ex * ex + ey * ey;
          const ab = (dx * ey - dy * ex) * 2;

          if (!ab) {
            // degenerate case (collinear diagram)
            x = (x1 + x3) / 2 - 1e8 * ey;
            y = (y1 + y3) / 2 + 1e8 * ex;
          }
          else if (Math.abs(ab) < 1e-8) {
            // almost equal points (degenerate triangle)
            x = (x1 + x3) / 2;
            y = (y1 + y3) / 2;
          } else {
            const d = 1 / ab;
            x = x1 + (ey * bl - dy * cl) * d;
            y = y1 + (dx * cl - ex * bl) * d;
          }
          circumcenters[j] = x;
          circumcenters[j + 1] = y;
        }

        // Compute exterior cell rays.
        let h = hull[hull.length - 1];
        let p0, p1 = h * 4;
        let x0, x1 = points[2 * h];
        let y0, y1 = points[2 * h + 1];
        vectors.fill(0);
        for (let i = 0; i < hull.length; ++i) {
          h = hull[i];
          p0 = p1, x0 = x1, y0 = y1;
          p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
          vectors[p0 + 2] = vectors[p1] = y0 - y1;
          vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
        }
      }
      render(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = this;
        if (hull.length <= 1) return null;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = Math.floor(i / 3) * 2;
          const tj = Math.floor(j / 3) * 2;
          const xi = circumcenters[ti];
          const yi = circumcenters[ti + 1];
          const xj = circumcenters[tj];
          const yj = circumcenters[tj + 1];
          this._renderSegment(xi, yi, xj, yj, context);
        }
        let h0, h1 = hull[hull.length - 1];
        for (let i = 0; i < hull.length; ++i) {
          h0 = h1, h1 = hull[i];
          const t = Math.floor(inedges[h1] / 3) * 2;
          const x = circumcenters[t];
          const y = circumcenters[t + 1];
          const v = h0 * 4;
          const p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
          if (p) this._renderSegment(x, y, p[0], p[1], context);
        }
        return buffer && buffer.value();
      }
      renderBounds(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
        return buffer && buffer.value();
      }
      renderCell(i, context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const points = this._clip(i);
        if (points === null || !points.length) return;
        context.moveTo(points[0], points[1]);
        let n = points.length;
        while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
        for (let i = 2; i < n; i += 2) {
          if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
            context.lineTo(points[i], points[i + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      *cellPolygons() {
        const {delaunay: {points}} = this;
        for (let i = 0, n = points.length / 2; i < n; ++i) {
          const cell = this.cellPolygon(i);
          if (cell) cell.index = i, yield cell;
        }
      }
      cellPolygon(i) {
        const polygon = new Polygon;
        this.renderCell(i, polygon);
        return polygon.value();
      }
      _renderSegment(x0, y0, x1, y1, context) {
        let S;
        const c0 = this._regioncode(x0, y0);
        const c1 = this._regioncode(x1, y1);
        if (c0 === 0 && c1 === 0) {
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
        } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
          context.moveTo(S[0], S[1]);
          context.lineTo(S[2], S[3]);
        }
      }
      contains(i, x, y) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
        return this.delaunay._step(i, x, y) === i;
      }
      *neighbors(i) {
        const ci = this._clip(i);
        if (ci) for (const j of this.delaunay.neighbors(i)) {
          const cj = this._clip(j);
          // find the common edge
          if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
            for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
              if (ci[ai] == cj[aj]
              && ci[ai + 1] == cj[aj + 1]
              && ci[(ai + 2) % li] == cj[(aj + lj - 2) % lj]
              && ci[(ai + 3) % li] == cj[(aj + lj - 1) % lj]
              ) {
                yield j;
                break loop;
              }
            }
          }
        }
      }
      _cell(i) {
        const {circumcenters, delaunay: {inedges, halfedges, triangles}} = this;
        const e0 = inedges[i];
        if (e0 === -1) return null; // coincident point
        const points = [];
        let e = e0;
        do {
          const t = Math.floor(e / 3);
          points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
        } while (e !== e0 && e !== -1);
        return points;
      }
      _clip(i) {
        // degenerate case (1 valid point: return the box)
        if (i === 0 && this.delaunay.hull.length === 1) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        const points = this._cell(i);
        if (points === null) return null;
        const {vectors: V} = this;
        const v = i * 4;
        return V[v] || V[v + 1]
            ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
            : this._clipFinite(i, points);
      }
      _clipFinite(i, points) {
        const n = points.length;
        let P = null;
        let x0, y0, x1 = points[n - 2], y1 = points[n - 1];
        let c0, c1 = this._regioncode(x1, y1);
        let e0, e1;
        for (let j = 0; j < n; j += 2) {
          x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
          c0 = c1, c1 = this._regioncode(x1, y1);
          if (c0 === 0 && c1 === 0) {
            e0 = e1, e1 = 0;
            if (P) P.push(x1, y1);
            else P = [x1, y1];
          } else {
            let S, sx0, sy0, sx1, sy1;
            if (c0 === 0) {
              if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
              [sx0, sy0, sx1, sy1] = S;
            } else {
              if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
              [sx1, sy1, sx0, sy0] = S;
              e0 = e1, e1 = this._edgecode(sx0, sy0);
              if (e0 && e1) this._edge(i, e0, e1, P, P.length);
              if (P) P.push(sx0, sy0);
              else P = [sx0, sy0];
            }
            e0 = e1, e1 = this._edgecode(sx1, sy1);
            if (e0 && e1) this._edge(i, e0, e1, P, P.length);
            if (P) P.push(sx1, sy1);
            else P = [sx1, sy1];
          }
        }
        if (P) {
          e0 = e1, e1 = this._edgecode(P[0], P[1]);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        return P;
      }
      _clipSegment(x0, y0, x1, y1, c0, c1) {
        while (true) {
          if (c0 === 0 && c1 === 0) return [x0, y0, x1, y1];
          if (c0 & c1) return null;
          let x, y, c = c0 || c1;
          if (c & 0b1000) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;
          else if (c & 0b0100) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;
          else if (c & 0b0010) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;
          else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
          if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);
          else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
        }
      }
      _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
        let P = Array.from(points), p;
        if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
        if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);
        if (P = this._clipFinite(i, P)) {
          for (let j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
            c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
            if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
          }
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
        }
        return P;
      }
      _edge(i, e0, e1, P, j) {
        while (e0 !== e1) {
          let x, y;
          switch (e0) {
            case 0b0101: e0 = 0b0100; continue; // top-left
            case 0b0100: e0 = 0b0110, x = this.xmax, y = this.ymin; break; // top
            case 0b0110: e0 = 0b0010; continue; // top-right
            case 0b0010: e0 = 0b1010, x = this.xmax, y = this.ymax; break; // right
            case 0b1010: e0 = 0b1000; continue; // bottom-right
            case 0b1000: e0 = 0b1001, x = this.xmin, y = this.ymax; break; // bottom
            case 0b1001: e0 = 0b0001; continue; // bottom-left
            case 0b0001: e0 = 0b0101, x = this.xmin, y = this.ymin; break; // left
          }
          if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
            P.splice(j, 0, x, y), j += 2;
          }
        }
        if (P.length > 4) {
          for (let i = 0; i < P.length; i+= 2) {
            const j = (i + 2) % P.length, k = (i + 4) % P.length;
            if (P[i] === P[j] && P[j] === P[k]
            || P[i + 1] === P[j + 1] && P[j + 1] === P[k + 1])
              P.splice(j, 2), i -= 2;
          }
        }
        return j;
      }
      _project(x0, y0, vx, vy) {
        let t = Infinity, c, x, y;
        if (vy < 0) { // top
          if (y0 <= this.ymin) return null;
          if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
        } else if (vy > 0) { // bottom
          if (y0 >= this.ymax) return null;
          if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
        }
        if (vx > 0) { // right
          if (x0 >= this.xmax) return null;
          if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
        } else if (vx < 0) { // left
          if (x0 <= this.xmin) return null;
          if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
        }
        return [x, y];
      }
      _edgecode(x, y) {
        return (x === this.xmin ? 0b0001
            : x === this.xmax ? 0b0010 : 0b0000)
            | (y === this.ymin ? 0b0100
            : y === this.ymax ? 0b1000 : 0b0000);
      }
      _regioncode(x, y) {
        return (x < this.xmin ? 0b0001
            : x > this.xmax ? 0b0010 : 0b0000)
            | (y < this.ymin ? 0b0100
            : y > this.ymax ? 0b1000 : 0b0000);
      }
    }

    const tau$1 = 2 * Math.PI, pow$1 = Math.pow;

    function pointX(p) {
      return p[0];
    }

    function pointY(p) {
      return p[1];
    }

    // A triangulation is collinear if all its triangles have a non-null area
    function collinear(d) {
      const {triangles, coords} = d;
      for (let i = 0; i < triangles.length; i += 3) {
        const a = 2 * triangles[i],
              b = 2 * triangles[i + 1],
              c = 2 * triangles[i + 2],
              cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1])
                    - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
        if (cross > 1e-10) return false;
      }
      return true;
    }

    function jitter(x, y, r) {
      return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
    }

    class Delaunay {
      static from(points, fx = pointX, fy = pointY, that) {
        return new Delaunay("length" in points
            ? flatArray(points, fx, fy, that)
            : Float64Array.from(flatIterable(points, fx, fy, that)));
      }
      constructor(points) {
        this._delaunator = new Delaunator(points);
        this.inedges = new Int32Array(points.length / 2);
        this._hullIndex = new Int32Array(points.length / 2);
        this.points = this._delaunator.coords;
        this._init();
      }
      update() {
        this._delaunator.update();
        this._init();
        return this;
      }
      _init() {
        const d = this._delaunator, points = this.points;

        // check for collinear
        if (d.hull && d.hull.length > 2 && collinear(d)) {
          this.collinear = Int32Array.from({length: points.length/2}, (_,i) => i)
            .sort((i, j) => points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]); // for exact neighbors
          const e = this.collinear[0], f = this.collinear[this.collinear.length - 1],
            bounds = [ points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1] ],
            r = 1e-8 * Math.hypot(bounds[3] - bounds[1], bounds[2] - bounds[0]);
          for (let i = 0, n = points.length / 2; i < n; ++i) {
            const p = jitter(points[2 * i], points[2 * i + 1], r);
            points[2 * i] = p[0];
            points[2 * i + 1] = p[1];
          }
          this._delaunator = new Delaunator(points);
        } else {
          delete this.collinear;
        }

        const halfedges = this.halfedges = this._delaunator.halfedges;
        const hull = this.hull = this._delaunator.hull;
        const triangles = this.triangles = this._delaunator.triangles;
        const inedges = this.inedges.fill(-1);
        const hullIndex = this._hullIndex.fill(-1);

        // Compute an index from each point to an (arbitrary) incoming halfedge
        // Used to give the first neighbor of each point; for this reason,
        // on the hull we give priority to exterior halfedges
        for (let e = 0, n = halfedges.length; e < n; ++e) {
          const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
          if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
        }
        for (let i = 0, n = hull.length; i < n; ++i) {
          hullIndex[hull[i]] = i;
        }

        // degenerate case: 1 or 2 (distinct) points
        if (hull.length <= 2 && hull.length > 0) {
          this.triangles = new Int32Array(3).fill(-1);
          this.halfedges = new Int32Array(3).fill(-1);
          this.triangles[0] = hull[0];
          this.triangles[1] = hull[1];
          this.triangles[2] = hull[1];
          inedges[hull[0]] = 1;
          if (hull.length === 2) inedges[hull[1]] = 0;
        }
      }
      voronoi(bounds) {
        return new Voronoi(this, bounds);
      }
      *neighbors(i) {
        const {inedges, hull, _hullIndex, halfedges, triangles, collinear} = this;

        // degenerate case with several collinear points
        if (collinear) {
          const l = collinear.indexOf(i);
          if (l > 0) yield collinear[l - 1];
          if (l < collinear.length - 1) yield collinear[l + 1];
          return;
        }

        const e0 = inedges[i];
        if (e0 === -1) return; // coincident point
        let e = e0, p0 = -1;
        do {
          yield p0 = triangles[e];
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) return; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            const p = hull[(_hullIndex[i] + 1) % hull.length];
            if (p !== p0) yield p;
            return;
          }
        } while (e !== e0);
      }
      find(x, y, i = 0) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
        const i0 = i;
        let c;
        while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) i = c;
        return c;
      }
      _step(i, x, y) {
        const {inedges, hull, _hullIndex, halfedges, triangles, points} = this;
        if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
        let c = i;
        let dc = pow$1(x - points[i * 2], 2) + pow$1(y - points[i * 2 + 1], 2);
        const e0 = inedges[i];
        let e = e0;
        do {
          let t = triangles[e];
          const dt = pow$1(x - points[t * 2], 2) + pow$1(y - points[t * 2 + 1], 2);
          if (dt < dc) dc = dt, c = t;
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            e = hull[(_hullIndex[i] + 1) % hull.length];
            if (e !== t) {
              if (pow$1(x - points[e * 2], 2) + pow$1(y - points[e * 2 + 1], 2) < dc) return e;
            }
            break;
          }
        } while (e !== e0);
        return c;
      }
      render(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {points, halfedges, triangles} = this;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = triangles[i] * 2;
          const tj = triangles[j] * 2;
          context.moveTo(points[ti], points[ti + 1]);
          context.lineTo(points[tj], points[tj + 1]);
        }
        this.renderHull(context);
        return buffer && buffer.value();
      }
      renderPoints(context, r = 2) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {points} = this;
        for (let i = 0, n = points.length; i < n; i += 2) {
          const x = points[i], y = points[i + 1];
          context.moveTo(x + r, y);
          context.arc(x, y, r, 0, tau$1);
        }
        return buffer && buffer.value();
      }
      renderHull(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {hull, points} = this;
        const h = hull[0] * 2, n = hull.length;
        context.moveTo(points[h], points[h + 1]);
        for (let i = 1; i < n; ++i) {
          const h = 2 * hull[i];
          context.lineTo(points[h], points[h + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      hullPolygon() {
        const polygon = new Polygon;
        this.renderHull(polygon);
        return polygon.value();
      }
      renderTriangle(i, context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {points, triangles} = this;
        const t0 = triangles[i *= 3] * 2;
        const t1 = triangles[i + 1] * 2;
        const t2 = triangles[i + 2] * 2;
        context.moveTo(points[t0], points[t0 + 1]);
        context.lineTo(points[t1], points[t1 + 1]);
        context.lineTo(points[t2], points[t2 + 1]);
        context.closePath();
        return buffer && buffer.value();
      }
      *trianglePolygons() {
        const {triangles} = this;
        for (let i = 0, n = triangles.length / 3; i < n; ++i) {
          yield this.trianglePolygon(i);
        }
      }
      trianglePolygon(i) {
        const polygon = new Polygon;
        this.renderTriangle(i, polygon);
        return polygon.value();
      }
    }

    function flatArray(points, fx, fy, that) {
      const n = points.length;
      const array = new Float64Array(n * 2);
      for (let i = 0; i < n; ++i) {
        const p = points[i];
        array[i * 2] = fx.call(that, p, i, points);
        array[i * 2 + 1] = fy.call(that, p, i, points);
      }
      return array;
    }

    function* flatIterable(points, fx, fy, that) {
      let i = 0;
      for (const p of points) {
        yield fx.call(that, p, i, points);
        yield fy.call(that, p, i, points);
        ++i;
      }
    }

    /* src/components/charts/Multiline.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/components/charts/Multiline.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (56:0) {#if width}
    function create_if_block$4(ctx) {
    	let svg;
    	let title_1;
    	let t0;
    	let desc_1;
    	let t1;
    	let g;
    	let axis0;
    	let axis1;
    	let pointinteractive;
    	let svg_viewBox_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*_data*/ ctx[12];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	axis0 = new Axis({
    			props: {
    				width: /*width*/ ctx[6],
    				height: /*height*/ ctx[7],
    				margin: /*margin*/ ctx[0],
    				scale: /*y*/ ctx[9],
    				position: "left",
    				format: /*format*/ ctx[1].y
    			},
    			$$inline: true
    		});

    	axis1 = new Axis({
    			props: {
    				width: /*width*/ ctx[6],
    				height: /*height*/ ctx[7],
    				margin: /*margin*/ ctx[0],
    				scale: /*x*/ ctx[8],
    				position: "bottom",
    				format: /*format*/ ctx[1].x
    			},
    			$$inline: true
    		});

    	pointinteractive = new PointInteractive({
    			props: {
    				datum: /*datum*/ ctx[5],
    				format: /*format*/ ctx[1],
    				x: /*x*/ ctx[8],
    				y: /*y*/ ctx[9],
    				key: { x: "x", y: "y" },
    				width: /*width*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title_1 = svg_element("title");
    			t0 = text(/*title*/ ctx[2]);
    			desc_1 = svg_element("desc");
    			t1 = text(/*desc*/ ctx[3]);
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			create_component(axis0.$$.fragment);
    			create_component(axis1.$$.fragment);
    			create_component(pointinteractive.$$.fragment);
    			attr_dev(title_1, "id", "title");
    			add_location(title_1, file$4, 67, 1, 1829);
    			attr_dev(desc_1, "id", "desc");
    			add_location(desc_1, file$4, 68, 1, 1864);
    			add_location(g, file$4, 69, 1, 1895);
    			attr_dev(svg, "xmlns:svg", "https://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*width*/ ctx[6] + " " + /*height*/ ctx[7]);
    			attr_dev(svg, "width", /*width*/ ctx[6]);
    			attr_dev(svg, "height", /*height*/ ctx[7]);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "aria-labelledby", "title desc");
    			add_location(svg, file$4, 56, 0, 1564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title_1);
    			append_dev(title_1, t0);
    			append_dev(svg, desc_1);
    			append_dev(desc_1, t1);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			mount_component(axis0, svg, null);
    			mount_component(axis1, svg, null);
    			mount_component(pointinteractive, svg, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "touchmove", prevent_default(/*touchmove_handler*/ ctx[18]), false, true, false),
    					listen_dev(svg, "pointermove", prevent_default(/*mouseMove*/ ctx[13]), false, true, false),
    					listen_dev(svg, "mouseleave", /*leave*/ ctx[14], false, false, false),
    					listen_dev(svg, "touchend", /*leave*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 4) set_data_dev(t0, /*title*/ ctx[2]);
    			if (!current || dirty & /*desc*/ 8) set_data_dev(t1, /*desc*/ ctx[3]);

    			if (dirty & /*path, _data, hilite*/ 7168) {
    				each_value = /*_data*/ ctx[12];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const axis0_changes = {};
    			if (dirty & /*width*/ 64) axis0_changes.width = /*width*/ ctx[6];
    			if (dirty & /*height*/ 128) axis0_changes.height = /*height*/ ctx[7];
    			if (dirty & /*margin*/ 1) axis0_changes.margin = /*margin*/ ctx[0];
    			if (dirty & /*y*/ 512) axis0_changes.scale = /*y*/ ctx[9];
    			if (dirty & /*format*/ 2) axis0_changes.format = /*format*/ ctx[1].y;
    			axis0.$set(axis0_changes);
    			const axis1_changes = {};
    			if (dirty & /*width*/ 64) axis1_changes.width = /*width*/ ctx[6];
    			if (dirty & /*height*/ 128) axis1_changes.height = /*height*/ ctx[7];
    			if (dirty & /*margin*/ 1) axis1_changes.margin = /*margin*/ ctx[0];
    			if (dirty & /*x*/ 256) axis1_changes.scale = /*x*/ ctx[8];
    			if (dirty & /*format*/ 2) axis1_changes.format = /*format*/ ctx[1].x;
    			axis1.$set(axis1_changes);
    			const pointinteractive_changes = {};
    			if (dirty & /*datum*/ 32) pointinteractive_changes.datum = /*datum*/ ctx[5];
    			if (dirty & /*format*/ 2) pointinteractive_changes.format = /*format*/ ctx[1];
    			if (dirty & /*x*/ 256) pointinteractive_changes.x = /*x*/ ctx[8];
    			if (dirty & /*y*/ 512) pointinteractive_changes.y = /*y*/ ctx[9];
    			if (dirty & /*width*/ 64) pointinteractive_changes.width = /*width*/ ctx[6];
    			pointinteractive.$set(pointinteractive_changes);

    			if (!current || dirty & /*width, height*/ 192 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*width*/ ctx[6] + " " + /*height*/ ctx[7])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty & /*width*/ 64) {
    				attr_dev(svg, "width", /*width*/ ctx[6]);
    			}

    			if (!current || dirty & /*height*/ 128) {
    				attr_dev(svg, "height", /*height*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axis0.$$.fragment, local);
    			transition_in(axis1.$$.fragment, local);
    			transition_in(pointinteractive.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axis0.$$.fragment, local);
    			transition_out(axis1.$$.fragment, local);
    			transition_out(pointinteractive.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    			destroy_component(axis0);
    			destroy_component(axis1);
    			destroy_component(pointinteractive);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(56:0) {#if width}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#each _data as d}
    function create_each_block$1(ctx) {
    	let path_1;
    	let path_1_d_value;
    	let path_1_stroke_value;
    	let path_1_opacity_value;

    	const block = {
    		c: function create() {
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[10](/*d*/ ctx[21]));
    			attr_dev(path_1, "stroke", path_1_stroke_value = /*d*/ ctx[21][0].color);
    			attr_dev(path_1, "fill", "none");
    			attr_dev(path_1, "opacity", path_1_opacity_value = /*hilite*/ ctx[11](/*d*/ ctx[21][0].key));
    			attr_dev(path_1, "class", "svelte-129nebl");
    			add_location(path_1, file$4, 71, 2, 1928);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 1024 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[10](/*d*/ ctx[21]))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (dirty & /*hilite*/ 2048 && path_1_opacity_value !== (path_1_opacity_value = /*hilite*/ ctx[11](/*d*/ ctx[21][0].key))) {
    				attr_dev(path_1, "opacity", path_1_opacity_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(71:8) {#each _data as d}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let div_class_value;
    	let div_resize_listener;
    	let current;
    	let if_block = /*width*/ ctx[6] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "graphic " + /*layout*/ ctx[4]);
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[19].call(div));
    			add_location(div, file$4, 54, 0, 1469);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[19].bind(div));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*width*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*width*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*layout*/ 16 && div_class_value !== (div_class_value = "graphic " + /*layout*/ ctx[4])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Multiline", slots, []);
    	let { data } = $$props;
    	let { margin = { top: 20, right: 5, bottom: 20, left: 5 } } = $$props;
    	let { format } = $$props;
    	let { key } = $$props;
    	let { color } = $$props;
    	let { title } = $$props;
    	let { desc } = $$props;
    	let { layout } = $$props;
    	let datum, width, height;

    	const _data = key.y.map((key, i) => data.map(d => ({
    		x: d.time,
    		y: d[key],
    		key,
    		color: color[i]
    	})));

    	const mouseMove = m => {
    		const mX = m.offsetX ? m.offsetX : m.clientX;
    		const mY = m.offsetY ? m.offsetY : m.clientY;
    		const picked = delaunay.find(mX, mY);
    		$$invalidate(5, datum = _data.flat()[picked]);
    	};

    	const leave = m => {
    		$$invalidate(5, datum = undefined);
    	};

    	const writable_props = ["data", "margin", "format", "key", "color", "title", "desc", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Multiline> was created with unknown prop '${key}'`);
    	});

    	function touchmove_handler(event) {
    		bubble($$self, event);
    	}

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(6, width);
    		$$invalidate(7, height);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(15, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(0, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(1, format = $$props.format);
    		if ("key" in $$props) $$invalidate(16, key = $$props.key);
    		if ("color" in $$props) $$invalidate(17, color = $$props.color);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(3, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({
    		Axis,
    		PointInteractive,
    		line,
    		curveStep,
    		scaleTime,
    		scaleLinear: linear$1,
    		max,
    		extent,
    		Delaunay,
    		data,
    		margin,
    		format,
    		key,
    		color,
    		title,
    		desc,
    		layout,
    		datum,
    		width,
    		height,
    		_data,
    		mouseMove,
    		leave,
    		x,
    		y,
    		path,
    		delaunay,
    		hilite
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(15, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(0, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(1, format = $$props.format);
    		if ("key" in $$props) $$invalidate(16, key = $$props.key);
    		if ("color" in $$props) $$invalidate(17, color = $$props.color);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(3, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("datum" in $$props) $$invalidate(5, datum = $$props.datum);
    		if ("width" in $$props) $$invalidate(6, width = $$props.width);
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("x" in $$props) $$invalidate(8, x = $$props.x);
    		if ("y" in $$props) $$invalidate(9, y = $$props.y);
    		if ("path" in $$props) $$invalidate(10, path = $$props.path);
    		if ("delaunay" in $$props) delaunay = $$props.delaunay;
    		if ("hilite" in $$props) $$invalidate(11, hilite = $$props.hilite);
    	};

    	let x;
    	let y;
    	let path;
    	let delaunay;
    	let hilite;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*margin, width*/ 65) {
    			 $$invalidate(8, x = scaleTime().domain(extent(_data.flat(), d => d.x)).range([margin.left, width - margin.right]));
    		}

    		if ($$self.$$.dirty & /*height, margin*/ 129) {
    			 $$invalidate(9, y = linear$1().domain([0, max(_data.flat(), d => d.y)]).range([height - margin.bottom - margin.top, margin.top]));
    		}

    		if ($$self.$$.dirty & /*x, y*/ 768) {
    			 $$invalidate(10, path = line().x(d => x(d.x)).y(d => y(d.y)).curve(curveStep));
    		}

    		if ($$self.$$.dirty & /*x, y*/ 768) {
    			 delaunay = Delaunay.from(_data.flat(), d => x(d.x), d => y(d.y));
    		}

    		if ($$self.$$.dirty & /*datum*/ 32) {
    			 $$invalidate(11, hilite = key => {
    				if (datum !== undefined) return datum.key === key ? 1 : 0.3; else return 1;
    			});
    		}
    	};

    	return [
    		margin,
    		format,
    		title,
    		desc,
    		layout,
    		datum,
    		width,
    		height,
    		x,
    		y,
    		path,
    		hilite,
    		_data,
    		mouseMove,
    		leave,
    		data,
    		key,
    		color,
    		touchmove_handler,
    		div_elementresize_handler
    	];
    }

    class Multiline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			data: 15,
    			margin: 0,
    			format: 1,
    			key: 16,
    			color: 17,
    			title: 2,
    			desc: 3,
    			layout: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Multiline",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[15] === undefined && !("data" in props)) {
    			console.warn("<Multiline> was created without expected prop 'data'");
    		}

    		if (/*format*/ ctx[1] === undefined && !("format" in props)) {
    			console.warn("<Multiline> was created without expected prop 'format'");
    		}

    		if (/*key*/ ctx[16] === undefined && !("key" in props)) {
    			console.warn("<Multiline> was created without expected prop 'key'");
    		}

    		if (/*color*/ ctx[17] === undefined && !("color" in props)) {
    			console.warn("<Multiline> was created without expected prop 'color'");
    		}

    		if (/*title*/ ctx[2] === undefined && !("title" in props)) {
    			console.warn("<Multiline> was created without expected prop 'title'");
    		}

    		if (/*desc*/ ctx[3] === undefined && !("desc" in props)) {
    			console.warn("<Multiline> was created without expected prop 'desc'");
    		}

    		if (/*layout*/ ctx[4] === undefined && !("layout" in props)) {
    			console.warn("<Multiline> was created without expected prop 'layout'");
    		}
    	}

    	get data() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Multiline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Multiline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/common/Tooltip.svelte generated by Svelte v3.31.0 */

    const file$5 = "src/components/common/Tooltip.svelte";

    function create_fragment$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "tooltip svelte-q9ohwb");
    			set_style(div, "top", /*ty*/ ctx[4] + "px");
    			set_style(div, "left", /*tx*/ ctx[3] + "px");
    			set_style(div, "opacity", /*visible*/ ctx[1] ? 1 : 0);
    			set_style(div, "width", /*tooltipWidth*/ ctx[2] + "px");
    			add_location(div, file$5, 18, 0, 376);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*tip*/ ctx[0];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tip*/ 1) div.innerHTML = /*tip*/ ctx[0];
    			if (dirty & /*ty*/ 16) {
    				set_style(div, "top", /*ty*/ ctx[4] + "px");
    			}

    			if (dirty & /*tx*/ 8) {
    				set_style(div, "left", /*tx*/ ctx[3] + "px");
    			}

    			if (dirty & /*visible*/ 2) {
    				set_style(div, "opacity", /*visible*/ ctx[1] ? 1 : 0);
    			}

    			if (dirty & /*tooltipWidth*/ 4) {
    				set_style(div, "width", /*tooltipWidth*/ ctx[2] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tooltip", slots, []);
    	let { x } = $$props;
    	let { y } = $$props;
    	let { width } = $$props;
    	let { height } = $$props;
    	let { tip = "No data available" } = $$props;
    	let { visible = false } = $$props;
    	let { tooltipWidth = 160 } = $$props;
    	const writable_props = ["x", "y", "width", "height", "tip", "visible", "tooltipWidth"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tooltip> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(5, x = $$props.x);
    		if ("y" in $$props) $$invalidate(6, y = $$props.y);
    		if ("width" in $$props) $$invalidate(7, width = $$props.width);
    		if ("height" in $$props) $$invalidate(8, height = $$props.height);
    		if ("tip" in $$props) $$invalidate(0, tip = $$props.tip);
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("tooltipWidth" in $$props) $$invalidate(2, tooltipWidth = $$props.tooltipWidth);
    	};

    	$$self.$capture_state = () => ({
    		x,
    		y,
    		width,
    		height,
    		tip,
    		visible,
    		tooltipWidth,
    		tx,
    		ty
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(5, x = $$props.x);
    		if ("y" in $$props) $$invalidate(6, y = $$props.y);
    		if ("width" in $$props) $$invalidate(7, width = $$props.width);
    		if ("height" in $$props) $$invalidate(8, height = $$props.height);
    		if ("tip" in $$props) $$invalidate(0, tip = $$props.tip);
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("tooltipWidth" in $$props) $$invalidate(2, tooltipWidth = $$props.tooltipWidth);
    		if ("tx" in $$props) $$invalidate(3, tx = $$props.tx);
    		if ("ty" in $$props) $$invalidate(4, ty = $$props.ty);
    	};

    	let tx;
    	let ty;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x, width, tooltipWidth*/ 164) {
    			 $$invalidate(3, tx = x < width - tooltipWidth && x >= tooltipWidth / 2
    			? x - tooltipWidth / 2
    			: x < tooltipWidth / 2
    				? 0
    				: width - tooltipWidth - tooltipWidth / 2);
    		}

    		if ($$self.$$.dirty & /*y*/ 64) {
    			 $$invalidate(4, ty = y + 30);
    		}
    	};

    	return [tip, visible, tooltipWidth, tx, ty, x, y, width, height];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			x: 5,
    			y: 6,
    			width: 7,
    			height: 8,
    			tip: 0,
    			visible: 1,
    			tooltipWidth: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[5] === undefined && !("x" in props)) {
    			console.warn("<Tooltip> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[6] === undefined && !("y" in props)) {
    			console.warn("<Tooltip> was created without expected prop 'y'");
    		}

    		if (/*width*/ ctx[7] === undefined && !("width" in props)) {
    			console.warn("<Tooltip> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[8] === undefined && !("height" in props)) {
    			console.warn("<Tooltip> was created without expected prop 'height'");
    		}
    	}

    	get x() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipWidth() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipWidth(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/charts/Scatter.svelte generated by Svelte v3.31.0 */
    const file$6 = "src/components/charts/Scatter.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (54:0) {#if width}
    function create_if_block$5(ctx) {
    	let svg;
    	let title_1;
    	let t0;
    	let desc_1;
    	let t1;
    	let g;
    	let each0_anchor;
    	let axis0;
    	let axis1;
    	let svg_viewBox_value;
    	let t2;
    	let tooltip;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*data*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	axis0 = new Axis({
    			props: {
    				width: /*width*/ ctx[8],
    				height: /*height*/ ctx[9],
    				margin: /*margin*/ ctx[1],
    				scale: /*y*/ ctx[11],
    				position: "left",
    				format: /*format*/ ctx[2].y
    			},
    			$$inline: true
    		});

    	axis1 = new Axis({
    			props: {
    				width: /*width*/ ctx[8],
    				height: /*height*/ ctx[9],
    				margin: /*margin*/ ctx[1],
    				scale: /*x*/ ctx[10],
    				position: "bottom",
    				format: /*format*/ ctx[2].x
    			},
    			$$inline: true
    		});

    	const tooltip_spread_levels = [
    		/*tooltipOptions*/ ctx[13],
    		{ width: /*width*/ ctx[8] },
    		{ height: /*height*/ ctx[9] }
    	];

    	let tooltip_props = {};

    	for (let i = 0; i < tooltip_spread_levels.length; i += 1) {
    		tooltip_props = assign(tooltip_props, tooltip_spread_levels[i]);
    	}

    	tooltip = new Tooltip({ props: tooltip_props, $$inline: true });

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title_1 = svg_element("title");
    			t0 = text(/*title*/ ctx[5]);
    			desc_1 = svg_element("desc");
    			t1 = text(/*desc*/ ctx[6]);
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each0_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			create_component(axis0.$$.fragment);
    			create_component(axis1.$$.fragment);
    			t2 = space();
    			create_component(tooltip.$$.fragment);
    			attr_dev(title_1, "id", "title");
    			add_location(title_1, file$6, 65, 1, 1782);
    			attr_dev(desc_1, "id", "desc");
    			add_location(desc_1, file$6, 66, 1, 1817);
    			add_location(g, file$6, 67, 1, 1848);
    			attr_dev(svg, "xmlns:svg", "https://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*width*/ ctx[8] + " " + /*height*/ ctx[9]);
    			attr_dev(svg, "width", /*width*/ ctx[8]);
    			attr_dev(svg, "height", /*height*/ ctx[9]);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "aria-labelledby", "title desc");
    			add_location(svg, file$6, 54, 0, 1517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title_1);
    			append_dev(title_1, t0);
    			append_dev(svg, desc_1);
    			append_dev(desc_1, t1);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g, null);
    			}

    			append_dev(g, each0_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			mount_component(axis0, svg, null);
    			mount_component(axis1, svg, null);
    			insert_dev(target, t2, anchor);
    			mount_component(tooltip, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "touchmove", prevent_default(/*touchmove_handler*/ ctx[17]), false, true, false),
    					listen_dev(svg, "pointermove", prevent_default(/*mouseMove*/ ctx[15]), false, true, false),
    					listen_dev(svg, "mouseleave", /*leave*/ ctx[16], false, false, false),
    					listen_dev(svg, "touchend", /*leave*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 32) set_data_dev(t0, /*title*/ ctx[5]);
    			if (!current || dirty & /*desc*/ 64) set_data_dev(t1, /*desc*/ ctx[6]);

    			if (dirty & /*x, data, key, y, size, color*/ 19481) {
    				each_value_1 = /*data*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g, each0_anchor);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*x, data, key, y, size, datum*/ 23561) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const axis0_changes = {};
    			if (dirty & /*width*/ 256) axis0_changes.width = /*width*/ ctx[8];
    			if (dirty & /*height*/ 512) axis0_changes.height = /*height*/ ctx[9];
    			if (dirty & /*margin*/ 2) axis0_changes.margin = /*margin*/ ctx[1];
    			if (dirty & /*y*/ 2048) axis0_changes.scale = /*y*/ ctx[11];
    			if (dirty & /*format*/ 4) axis0_changes.format = /*format*/ ctx[2].y;
    			axis0.$set(axis0_changes);
    			const axis1_changes = {};
    			if (dirty & /*width*/ 256) axis1_changes.width = /*width*/ ctx[8];
    			if (dirty & /*height*/ 512) axis1_changes.height = /*height*/ ctx[9];
    			if (dirty & /*margin*/ 2) axis1_changes.margin = /*margin*/ ctx[1];
    			if (dirty & /*x*/ 1024) axis1_changes.scale = /*x*/ ctx[10];
    			if (dirty & /*format*/ 4) axis1_changes.format = /*format*/ ctx[2].x;
    			axis1.$set(axis1_changes);

    			if (!current || dirty & /*width, height*/ 768 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*width*/ ctx[8] + " " + /*height*/ ctx[9])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty & /*width*/ 256) {
    				attr_dev(svg, "width", /*width*/ ctx[8]);
    			}

    			if (!current || dirty & /*height*/ 512) {
    				attr_dev(svg, "height", /*height*/ ctx[9]);
    			}

    			const tooltip_changes = (dirty & /*tooltipOptions, width, height*/ 8960)
    			? get_spread_update(tooltip_spread_levels, [
    					dirty & /*tooltipOptions*/ 8192 && get_spread_object(/*tooltipOptions*/ ctx[13]),
    					dirty & /*width*/ 256 && { width: /*width*/ ctx[8] },
    					dirty & /*height*/ 512 && { height: /*height*/ ctx[9] }
    				])
    			: {};

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axis0.$$.fragment, local);
    			transition_in(axis1.$$.fragment, local);
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axis0.$$.fragment, local);
    			transition_out(axis1.$$.fragment, local);
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(axis0);
    			destroy_component(axis1);
    			if (detaching) detach_dev(t2);
    			destroy_component(tooltip, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(54:0) {#if width}",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#each data as d}
    function create_each_block_1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*x*/ ctx[10](/*d*/ ctx[21][/*key*/ ctx[3].x]));
    			attr_dev(circle, "cy", circle_cy_value = /*y*/ ctx[11](/*d*/ ctx[21][/*key*/ ctx[3].y]));
    			attr_dev(circle, "r", circle_r_value = /*size*/ ctx[14](/*d*/ ctx[21][/*key*/ ctx[3].size]));
    			attr_dev(circle, "fill-opacity", ".1");
    			attr_dev(circle, "fill", /*color*/ ctx[4]);
    			attr_dev(circle, "stroke", /*color*/ ctx[4]);
    			attr_dev(circle, "stroke-width", ".3");
    			add_location(circle, file$6, 69, 2, 1874);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*x, data, key*/ 1033 && circle_cx_value !== (circle_cx_value = /*x*/ ctx[10](/*d*/ ctx[21][/*key*/ ctx[3].x]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*y, data, key*/ 2057 && circle_cy_value !== (circle_cy_value = /*y*/ ctx[11](/*d*/ ctx[21][/*key*/ ctx[3].y]))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*size, data, key*/ 16393 && circle_r_value !== (circle_r_value = /*size*/ ctx[14](/*d*/ ctx[21][/*key*/ ctx[3].size]))) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*color*/ 16) {
    				attr_dev(circle, "fill", /*color*/ ctx[4]);
    			}

    			if (dirty & /*color*/ 16) {
    				attr_dev(circle, "stroke", /*color*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(69:2) {#each data as d}",
    		ctx
    	});

    	return block;
    }

    // (81:2) {#each data as d}
    function create_each_block$2(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*x*/ ctx[10](/*d*/ ctx[21][/*key*/ ctx[3].x]));
    			attr_dev(circle, "cy", circle_cy_value = /*y*/ ctx[11](/*d*/ ctx[21][/*key*/ ctx[3].y]));
    			attr_dev(circle, "r", circle_r_value = /*size*/ ctx[14](/*d*/ ctx[21][/*key*/ ctx[3].size]));
    			attr_dev(circle, "class", "hover svelte-138nqao");
    			toggle_class(circle, "selected", /*d*/ ctx[21] === /*datum*/ ctx[12]);
    			add_location(circle, file$6, 81, 2, 2058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*x, data, key*/ 1033 && circle_cx_value !== (circle_cx_value = /*x*/ ctx[10](/*d*/ ctx[21][/*key*/ ctx[3].x]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*y, data, key*/ 2057 && circle_cy_value !== (circle_cy_value = /*y*/ ctx[11](/*d*/ ctx[21][/*key*/ ctx[3].y]))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*size, data, key*/ 16393 && circle_r_value !== (circle_r_value = /*size*/ ctx[14](/*d*/ ctx[21][/*key*/ ctx[3].size]))) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*data, datum*/ 4097) {
    				toggle_class(circle, "selected", /*d*/ ctx[21] === /*datum*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(81:2) {#each data as d}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let div_class_value;
    	let div_resize_listener;
    	let current;
    	let if_block = /*width*/ ctx[8] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "graphic " + /*layout*/ ctx[7] + " svelte-138nqao");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[18].call(div));
    			add_location(div, file$6, 52, 0, 1422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[18].bind(div));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*width*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*width*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*layout*/ 128 && div_class_value !== (div_class_value = "graphic " + /*layout*/ ctx[7] + " svelte-138nqao")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Scatter", slots, []);
    	let { data } = $$props;
    	let { margin = { top: 20, right: 5, bottom: 20, left: 5 } } = $$props;
    	let { format } = $$props;
    	let { key } = $$props;
    	let { color } = $$props;
    	let { title } = $$props;
    	let { desc } = $$props;
    	let { layout } = $$props;
    	let datum, width, height, tooltipOptions, tip;
    	data.sort((a, b) => a[key.size] - b[key.size]);

    	const mouseMove = m => {
    		const mX = m.offsetX ? m.offsetX : m.clientX;
    		const mY = m.offsetY ? m.offsetY : m.clientY;
    		let visible = true;
    		const picked = delaunay.find(mX, mY);
    		$$invalidate(12, datum = data[picked]);
    		tip = datum !== undefined ? `` : ``;
    		$$invalidate(13, tooltipOptions = { x: mX, y: mY, tip, visible });
    	};

    	const leave = m => {
    		$$invalidate(13, tooltipOptions = {
    			x: -1000,
    			y: -1000,
    			tip: "",
    			visible: false
    		});
    	};

    	const writable_props = ["data", "margin", "format", "key", "color", "title", "desc", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scatter> was created with unknown prop '${key}'`);
    	});

    	function touchmove_handler(event) {
    		bubble($$self, event);
    	}

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(8, width);
    		$$invalidate(9, height);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({
    		Axis,
    		Tooltip,
    		scaleSqrt: sqrt,
    		scaleTime,
    		scaleLinear: linear$1,
    		extent,
    		Delaunay,
    		data,
    		margin,
    		format,
    		key,
    		color,
    		title,
    		desc,
    		layout,
    		datum,
    		width,
    		height,
    		tooltipOptions,
    		tip,
    		mouseMove,
    		leave,
    		x,
    		y,
    		size,
    		delaunay
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("margin" in $$props) $$invalidate(1, margin = $$props.margin);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    		if ("datum" in $$props) $$invalidate(12, datum = $$props.datum);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("height" in $$props) $$invalidate(9, height = $$props.height);
    		if ("tooltipOptions" in $$props) $$invalidate(13, tooltipOptions = $$props.tooltipOptions);
    		if ("tip" in $$props) tip = $$props.tip;
    		if ("x" in $$props) $$invalidate(10, x = $$props.x);
    		if ("y" in $$props) $$invalidate(11, y = $$props.y);
    		if ("size" in $$props) $$invalidate(14, size = $$props.size);
    		if ("delaunay" in $$props) delaunay = $$props.delaunay;
    	};

    	let x;
    	let y;
    	let size;
    	let delaunay;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, key, margin, width*/ 267) {
    			 $$invalidate(10, x = linear$1().domain(extent(data, d => d[key.x])).range([margin.left, width - margin.right]));
    		}

    		if ($$self.$$.dirty & /*data, key, height, margin*/ 523) {
    			 $$invalidate(11, y = linear$1().domain(extent(data, d => d[key.y])).range([height - margin.bottom - margin.top, margin.top]));
    		}

    		if ($$self.$$.dirty & /*data, key, width*/ 265) {
    			 $$invalidate(14, size = sqrt().domain(extent(data, d => d[key.size])).range([3, width > 640 ? 30 : width / 15]));
    		}

    		if ($$self.$$.dirty & /*data, x, key, y*/ 3081) {
    			 delaunay = Delaunay.from(data, d => x(d[key.x]), d => y(d[key.y]));
    		}
    	};

    	return [
    		data,
    		margin,
    		format,
    		key,
    		color,
    		title,
    		desc,
    		layout,
    		width,
    		height,
    		x,
    		y,
    		datum,
    		tooltipOptions,
    		size,
    		mouseMove,
    		leave,
    		touchmove_handler,
    		div_elementresize_handler
    	];
    }

    class Scatter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			data: 0,
    			margin: 1,
    			format: 2,
    			key: 3,
    			color: 4,
    			title: 5,
    			desc: 6,
    			layout: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scatter",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Scatter> was created without expected prop 'data'");
    		}

    		if (/*format*/ ctx[2] === undefined && !("format" in props)) {
    			console.warn("<Scatter> was created without expected prop 'format'");
    		}

    		if (/*key*/ ctx[3] === undefined && !("key" in props)) {
    			console.warn("<Scatter> was created without expected prop 'key'");
    		}

    		if (/*color*/ ctx[4] === undefined && !("color" in props)) {
    			console.warn("<Scatter> was created without expected prop 'color'");
    		}

    		if (/*title*/ ctx[5] === undefined && !("title" in props)) {
    			console.warn("<Scatter> was created without expected prop 'title'");
    		}

    		if (/*desc*/ ctx[6] === undefined && !("desc" in props)) {
    			console.warn("<Scatter> was created without expected prop 'desc'");
    		}

    		if (/*layout*/ ctx[7] === undefined && !("layout" in props)) {
    			console.warn("<Scatter> was created without expected prop 'layout'");
    		}
    	}

    	get data() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function loader (urls, test, callback) {
      let remaining = urls.length;

      function maybeCallback () {
        remaining = --remaining;
        if (remaining < 1) {
          callback();
        }
      }

      if (!test()) {
        urls.forEach(({ type, url, options = { async: true, defer: true }}) => {
          const isScript = type === 'script';
          const tag = document.createElement(isScript ? 'script': 'link');
          if (isScript) {
            tag.src = url;
            tag.async = options.async;
            tag.defer = options.defer;
          } else {
            tag.rel = 'stylesheet';
    		    tag.href = url;
          }
          tag.onload = maybeCallback;
          document.body.appendChild(tag);
        });
      } else {
        callback();
      }
    }

    const contextKey = {};

    function reusify (Constructor) {
      var head = new Constructor();
      var tail = head;

      function get () {
        var current = head;

        if (current.next) {
          head = current.next;
        } else {
          head = new Constructor();
          tail = head;
        }

        current.next = null;

        return current
      }

      function release (obj) {
        tail.next = obj;
        tail = obj;
      }

      return {
        get: get,
        release: release
      }
    }

    var reusify_1 = reusify;

    function fastqueue (context, worker, concurrency) {
      if (typeof context === 'function') {
        concurrency = worker;
        worker = context;
        context = null;
      }

      if (concurrency < 1) {
        throw new Error('fastqueue concurrency must be greater than 1')
      }

      var cache = reusify_1(Task);
      var queueHead = null;
      var queueTail = null;
      var _running = 0;
      var errorHandler = null;

      var self = {
        push: push,
        drain: noop$1,
        saturated: noop$1,
        pause: pause,
        paused: false,
        concurrency: concurrency,
        running: running,
        resume: resume,
        idle: idle,
        length: length,
        getQueue: getQueue,
        unshift: unshift,
        empty: noop$1,
        kill: kill,
        killAndDrain: killAndDrain,
        error: error
      };

      return self

      function running () {
        return _running
      }

      function pause () {
        self.paused = true;
      }

      function length () {
        var current = queueHead;
        var counter = 0;

        while (current) {
          current = current.next;
          counter++;
        }

        return counter
      }

      function getQueue () {
        var current = queueHead;
        var tasks = [];

        while (current) {
          tasks.push(current.value);
          current = current.next;
        }

        return tasks
      }

      function resume () {
        if (!self.paused) return
        self.paused = false;
        for (var i = 0; i < self.concurrency; i++) {
          _running++;
          release();
        }
      }

      function idle () {
        return _running === 0 && self.length() === 0
      }

      function push (value, done) {
        var current = cache.get();

        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop$1;
        current.errorHandler = errorHandler;

        if (_running === self.concurrency || self.paused) {
          if (queueTail) {
            queueTail.next = current;
            queueTail = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }

      function unshift (value, done) {
        var current = cache.get();

        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop$1;

        if (_running === self.concurrency || self.paused) {
          if (queueHead) {
            current.next = queueHead;
            queueHead = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }

      function release (holder) {
        if (holder) {
          cache.release(holder);
        }
        var next = queueHead;
        if (next) {
          if (!self.paused) {
            if (queueTail === queueHead) {
              queueTail = null;
            }
            queueHead = next.next;
            next.next = null;
            worker.call(context, next.value, next.worked);
            if (queueTail === null) {
              self.empty();
            }
          } else {
            _running--;
          }
        } else if (--_running === 0) {
          self.drain();
        }
      }

      function kill () {
        queueHead = null;
        queueTail = null;
        self.drain = noop$1;
      }

      function killAndDrain () {
        queueHead = null;
        queueTail = null;
        self.drain();
        self.drain = noop$1;
      }

      function error (handler) {
        errorHandler = handler;
      }
    }

    function noop$1 () {}

    function Task () {
      this.value = null;
      this.callback = noop$1;
      this.next = null;
      this.release = noop$1;
      this.context = null;
      this.errorHandler = null;

      var self = this;

      this.worked = function worked (err, result) {
        var callback = self.callback;
        var errorHandler = self.errorHandler;
        var val = self.value;
        self.value = null;
        self.callback = noop$1;
        if (self.errorHandler) {
          errorHandler(err, val);
        }
        callback.call(self.context, err, result);
        self.release(self);
      };
    }

    var queue = fastqueue;

    class EventQueue {
      constructor (worker) {
        this.queue = new queue(this, worker, 1);
        this.queue.pause();
      }

      send (command, params = []) {
        if (!command) { return }
        this.queue.push([ command, params ]);
      }

      start () {
        this.queue.resume();
      }

      stop () {
        this.queue.kill();
      }
    }

    /* node_modules/@beyonk/svelte-mapbox/src/Map.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;
    const file$7 = "node_modules/@beyonk/svelte-mapbox/src/Map.svelte";

    // (2:2) {#if map}
    function create_if_block$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(2:2) {#if map}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	let if_block = /*map*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-1kuj9kb");
    			add_location(div, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[19](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*map*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*map*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[19](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, ['default']);

    	setContext(contextKey, {
    		getMap: () => map,
    		getMapbox: () => mapbox
    	});

    	const dispatch = createEventDispatcher();
    	let container;
    	let mapbox;
    	const queue = new EventQueue(worker);
    	let { map = null } = $$props;
    	let { version = "v1.11.1" } = $$props;
    	let { center = [0, 0] } = $$props;
    	let { zoom = 9 } = $$props;
    	let { zoomRate = 1 } = $$props;
    	let { wheelZoomRate = 1 } = $$props;
    	let { options = {} } = $$props;
    	let { accessToken } = $$props;
    	let { customStylesheetUrl = false } = $$props;
    	let { style = "mapbox://styles/mapbox/streets-v11" } = $$props;

    	function fitBounds(bbox) {
    		queue.send("fitBounds", [bbox]);
    	}

    	function flyTo(destination) {
    		queue.send("flyTo", [destination]);
    	}

    	function resize() {
    		queue.send("resize");
    	}

    	function setCenter(coords) {
    		queue.send("setCenter", [coords]);
    	}

    	function getMap() {
    		return map;
    	}

    	function getMapbox() {
    		return mapbox;
    	}

    	function onAvailable() {
    		window.mapboxgl.accessToken = accessToken;
    		mapbox = window.mapboxgl;

    		const optionsWithDefaults = Object.assign(
    			{
    				container,
    				style,
    				center,
    				zoom,
    				zoomRate,
    				wheelZoomRate
    			},
    			options
    		);

    		const el = new mapbox.Map(optionsWithDefaults);

    		el.on("dragend", () => {
    			const { lng, lat } = el.getCenter();
    			$$invalidate(2, center = [lng, lat]);
    			dispatch("recentre", { center });
    		});

    		el.on("click", e => dispatch("click", { lng: e.lngLat.lng, lat: e.lngLat.lat }));

    		el.on("zoom", () => {
    			$$invalidate(3, zoom = el.getZoom());
    			dispatch("zoom", { zoom });
    		});

    		el.on("load", () => {
    			$$invalidate(0, map = el);
    			queue.start();
    			dispatch("ready");
    		});
    	}

    	function worker(cmd, cb) {
    		const [command, params] = cmd;
    		map[command].apply(map, params);
    		cb(null);
    	}

    	onMount(() => {
    		const resources = [
    			{
    				type: "script",
    				url: `//api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.js`
    			},
    			{
    				type: "style",
    				url: `//api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.css`
    			}
    		];

    		if (customStylesheetUrl) {
    			resources.push({ type: "style", url: customStylesheetUrl });
    		}

    		loader(resources, () => !!window.mapboxgl, onAvailable);

    		return () => {
    			queue.stop();
    			map.remove();
    		};
    	});

    	const writable_props = [
    		"map",
    		"version",
    		"center",
    		"zoom",
    		"zoomRate",
    		"wheelZoomRate",
    		"options",
    		"accessToken",
    		"customStylesheetUrl",
    		"style"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("map" in $$props) $$invalidate(0, map = $$props.map);
    		if ("version" in $$props) $$invalidate(4, version = $$props.version);
    		if ("center" in $$props) $$invalidate(2, center = $$props.center);
    		if ("zoom" in $$props) $$invalidate(3, zoom = $$props.zoom);
    		if ("zoomRate" in $$props) $$invalidate(5, zoomRate = $$props.zoomRate);
    		if ("wheelZoomRate" in $$props) $$invalidate(6, wheelZoomRate = $$props.wheelZoomRate);
    		if ("options" in $$props) $$invalidate(7, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(8, accessToken = $$props.accessToken);
    		if ("customStylesheetUrl" in $$props) $$invalidate(9, customStylesheetUrl = $$props.customStylesheetUrl);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		loader,
    		onMount,
    		createEventDispatcher,
    		setContext,
    		contextKey,
    		EventQueue,
    		dispatch,
    		container,
    		mapbox,
    		queue,
    		map,
    		version,
    		center,
    		zoom,
    		zoomRate,
    		wheelZoomRate,
    		options,
    		accessToken,
    		customStylesheetUrl,
    		style,
    		fitBounds,
    		flyTo,
    		resize,
    		setCenter,
    		getMap,
    		getMapbox,
    		onAvailable,
    		worker
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    		if ("mapbox" in $$props) mapbox = $$props.mapbox;
    		if ("map" in $$props) $$invalidate(0, map = $$props.map);
    		if ("version" in $$props) $$invalidate(4, version = $$props.version);
    		if ("center" in $$props) $$invalidate(2, center = $$props.center);
    		if ("zoom" in $$props) $$invalidate(3, zoom = $$props.zoom);
    		if ("zoomRate" in $$props) $$invalidate(5, zoomRate = $$props.zoomRate);
    		if ("wheelZoomRate" in $$props) $$invalidate(6, wheelZoomRate = $$props.wheelZoomRate);
    		if ("options" in $$props) $$invalidate(7, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(8, accessToken = $$props.accessToken);
    		if ("customStylesheetUrl" in $$props) $$invalidate(9, customStylesheetUrl = $$props.customStylesheetUrl);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		map,
    		container,
    		center,
    		zoom,
    		version,
    		zoomRate,
    		wheelZoomRate,
    		options,
    		accessToken,
    		customStylesheetUrl,
    		style,
    		fitBounds,
    		flyTo,
    		resize,
    		setCenter,
    		getMap,
    		getMapbox,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Map$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			map: 0,
    			version: 4,
    			center: 2,
    			zoom: 3,
    			zoomRate: 5,
    			wheelZoomRate: 6,
    			options: 7,
    			accessToken: 8,
    			customStylesheetUrl: 9,
    			style: 10,
    			fitBounds: 11,
    			flyTo: 12,
    			resize: 13,
    			setCenter: 14,
    			getMap: 15,
    			getMapbox: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accessToken*/ ctx[8] === undefined && !("accessToken" in props)) {
    			console.warn("<Map> was created without expected prop 'accessToken'");
    		}
    	}

    	get map() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set map(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get version() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoomRate() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoomRate(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wheelZoomRate() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wheelZoomRate(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accessToken() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accessToken(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customStylesheetUrl() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customStylesheetUrl(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fitBounds() {
    		return this.$$.ctx[11];
    	}

    	set fitBounds(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flyTo() {
    		return this.$$.ctx[12];
    	}

    	set flyTo(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resize() {
    		return this.$$.ctx[13];
    	}

    	set resize(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setCenter() {
    		return this.$$.ctx[14];
    	}

    	set setCenter(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMap() {
    		return this.$$.ctx[15];
    	}

    	set getMap(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMapbox() {
    		return this.$$.ctx[16];
    	}

    	set getMapbox(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/Marker.svelte generated by Svelte v3.31.0 */

    function create_fragment$8(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomColour() {
    	return Math.round(Math.random() * 255);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Marker", slots, []);
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();

    	function move(lng, lat) {
    		marker.setLngLat({ lng, lat });
    	}

    	let { lat } = $$props;
    	let { lng } = $$props;
    	let { label = "Marker" } = $$props;
    	let { popupClassName = "beyonk-mapbox-popup" } = $$props;
    	let { markerOffset = [0, 0] } = $$props;
    	let { popupOffset = 10 } = $$props;
    	let { color = randomColour() } = $$props;
    	let { popup = true } = $$props;
    	let marker;

    	onMount(() => {
    		$$invalidate(9, marker = new mapbox.Marker({ color, offset: markerOffset }));

    		if (popup) {
    			const popupEl = new mapbox.Popup({
    					offset: popupOffset,
    					className: popupClassName
    				}).setText(label);

    			marker.setPopup(popupEl);
    		}

    		marker.setLngLat({ lng, lat }).addTo(map);
    		return () => marker.remove();
    	});

    	function getMarker() {
    		return marker;
    	}

    	const writable_props = [
    		"lat",
    		"lng",
    		"label",
    		"popupClassName",
    		"markerOffset",
    		"popupOffset",
    		"color",
    		"popup"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Marker> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("lat" in $$props) $$invalidate(0, lat = $$props.lat);
    		if ("lng" in $$props) $$invalidate(1, lng = $$props.lng);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("popupClassName" in $$props) $$invalidate(3, popupClassName = $$props.popupClassName);
    		if ("markerOffset" in $$props) $$invalidate(4, markerOffset = $$props.markerOffset);
    		if ("popupOffset" in $$props) $$invalidate(5, popupOffset = $$props.popupOffset);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("popup" in $$props) $$invalidate(7, popup = $$props.popup);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getContext,
    		contextKey,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		randomColour,
    		move,
    		lat,
    		lng,
    		label,
    		popupClassName,
    		markerOffset,
    		popupOffset,
    		color,
    		popup,
    		marker,
    		getMarker
    	});

    	$$self.$inject_state = $$props => {
    		if ("lat" in $$props) $$invalidate(0, lat = $$props.lat);
    		if ("lng" in $$props) $$invalidate(1, lng = $$props.lng);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("popupClassName" in $$props) $$invalidate(3, popupClassName = $$props.popupClassName);
    		if ("markerOffset" in $$props) $$invalidate(4, markerOffset = $$props.markerOffset);
    		if ("popupOffset" in $$props) $$invalidate(5, popupOffset = $$props.popupOffset);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("popup" in $$props) $$invalidate(7, popup = $$props.popup);
    		if ("marker" in $$props) $$invalidate(9, marker = $$props.marker);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*marker, lng, lat*/ 515) {
    			 marker && move(lng, lat);
    		}
    	};

    	return [
    		lat,
    		lng,
    		label,
    		popupClassName,
    		markerOffset,
    		popupOffset,
    		color,
    		popup,
    		getMarker,
    		marker
    	];
    }

    class Marker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			lat: 0,
    			lng: 1,
    			label: 2,
    			popupClassName: 3,
    			markerOffset: 4,
    			popupOffset: 5,
    			color: 6,
    			popup: 7,
    			getMarker: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Marker",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*lat*/ ctx[0] === undefined && !("lat" in props)) {
    			console.warn("<Marker> was created without expected prop 'lat'");
    		}

    		if (/*lng*/ ctx[1] === undefined && !("lng" in props)) {
    			console.warn("<Marker> was created without expected prop 'lng'");
    		}
    	}

    	get lat() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lat(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lng() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lng(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popupClassName() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popupClassName(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markerOffset() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markerOffset(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popupOffset() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popupOffset(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popup() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popup(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMarker() {
    		return this.$$.ctx[8];
    	}

    	set getMarker(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/Geocoder.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1$1 } = globals;
    const file$8 = "node_modules/@beyonk/svelte-mapbox/src/Geocoder.svelte";

    function create_fragment$9(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", /*fieldId*/ ctx[1]);
    			attr_dev(div, "class", "svelte-1k1b3t4");
    			add_location(div, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[11](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[11](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Geocoder", slots, []);
    	const dispatch = createEventDispatcher();
    	const fieldId = "bsm-" + Math.random().toString(36).substring(6);
    	let { accessToken } = $$props;
    	let { options = {} } = $$props;
    	let { version = "v4.5.1" } = $$props;

    	let { types = [
    		"country",
    		"region",
    		"postcode",
    		"district",
    		"place",
    		"locality",
    		"neighborhood",
    		"address"
    	] } = $$props;

    	let { placeholder = "Search" } = $$props;
    	let { value = null } = $$props;
    	let { customStylesheetUrl = false } = $$props;
    	let { geocoder = null } = $$props;
    	let container;
    	let ready = false;
    	const onResult = p => dispatch("result", p);
    	const onResults = p => dispatch("results", p);
    	const onError = p => dispatch("error", p);
    	const onLoading = p => dispatch("loading", p);
    	const onClear = p => dispatch("clear", p);

    	onMount(() => {
    		const resources = [
    			{
    				type: "script",
    				url: `//api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/${version}/mapbox-gl-geocoder.min.js`
    			},
    			{
    				type: "style",
    				url: `//api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/${version}/mapbox-gl-geocoder.css`
    			}
    		];

    		if (customStylesheetUrl) {
    			resources.push({ type: "style", url: customStylesheetUrl });
    		}

    		loader(resources, () => !!window.MapboxGeocoder, onAvailable);

    		return () => {
    			geocoder.off("results", onResults).off("result", onResult).off("loading", onLoading).off("error", onError).off("clear", onClear);
    		};
    	});

    	function onAvailable() {
    		const optionsWithDefaults = Object.assign(
    			{
    				accessToken,
    				types: types.join(","),
    				placeholder
    			},
    			options
    		);

    		$$invalidate(2, geocoder = new window.MapboxGeocoder(optionsWithDefaults));
    		geocoder.addTo(`#${fieldId}`);
    		geocoder.on("results", onResults).on("result", onResult).on("loading", onLoading).on("error", onError).on("clear", onClear);
    		geocoder.setInput(value);
    		$$invalidate(10, ready = true);
    		dispatch("ready");
    	}

    	const writable_props = [
    		"accessToken",
    		"options",
    		"version",
    		"types",
    		"placeholder",
    		"value",
    		"customStylesheetUrl",
    		"geocoder"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Geocoder> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("accessToken" in $$props) $$invalidate(3, accessToken = $$props.accessToken);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("version" in $$props) $$invalidate(5, version = $$props.version);
    		if ("types" in $$props) $$invalidate(6, types = $$props.types);
    		if ("placeholder" in $$props) $$invalidate(7, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("customStylesheetUrl" in $$props) $$invalidate(9, customStylesheetUrl = $$props.customStylesheetUrl);
    		if ("geocoder" in $$props) $$invalidate(2, geocoder = $$props.geocoder);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		loader,
    		dispatch,
    		fieldId,
    		accessToken,
    		options,
    		version,
    		types,
    		placeholder,
    		value,
    		customStylesheetUrl,
    		geocoder,
    		container,
    		ready,
    		onResult,
    		onResults,
    		onError,
    		onLoading,
    		onClear,
    		onAvailable
    	});

    	$$self.$inject_state = $$props => {
    		if ("accessToken" in $$props) $$invalidate(3, accessToken = $$props.accessToken);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("version" in $$props) $$invalidate(5, version = $$props.version);
    		if ("types" in $$props) $$invalidate(6, types = $$props.types);
    		if ("placeholder" in $$props) $$invalidate(7, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("customStylesheetUrl" in $$props) $$invalidate(9, customStylesheetUrl = $$props.customStylesheetUrl);
    		if ("geocoder" in $$props) $$invalidate(2, geocoder = $$props.geocoder);
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("ready" in $$props) $$invalidate(10, ready = $$props.ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ready, value, geocoder*/ 1284) {
    			 ready && value && geocoder.setInput(value);
    		}
    	};

    	return [
    		container,
    		fieldId,
    		geocoder,
    		accessToken,
    		options,
    		version,
    		types,
    		placeholder,
    		value,
    		customStylesheetUrl,
    		ready,
    		div_binding
    	];
    }

    class Geocoder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			accessToken: 3,
    			options: 4,
    			version: 5,
    			types: 6,
    			placeholder: 7,
    			value: 8,
    			customStylesheetUrl: 9,
    			geocoder: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Geocoder",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accessToken*/ ctx[3] === undefined && !("accessToken" in props)) {
    			console.warn("<Geocoder> was created without expected prop 'accessToken'");
    		}
    	}

    	get accessToken() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accessToken(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get version() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get types() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set types(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customStylesheetUrl() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customStylesheetUrl(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get geocoder() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set geocoder(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createDispatchers (target, dispatch, events) {
      const dispatchers = events.map(name => {
        const dispatcher = data => dispatch(name, data);
        target.on(name, dispatcher);
        return { name, dispatcher }
      });

      return () => {
        dispatchers.forEach(({ name, dispatcher }) => target.off(name, dispatcher));
      }
    }

    /* node_modules/@beyonk/svelte-mapbox/src/controls/GeolocateControl.svelte generated by Svelte v3.31.0 */

    function create_fragment$a(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GeolocateControl", slots, []);
    	const dispatch = createEventDispatcher();
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();
    	let { position = "top-left" } = $$props;
    	let { options = {} } = $$props;

    	const events = [
    		"error",
    		"geolocate",
    		"outofmaxbounds",
    		"trackuserlocationend",
    		"trackuserlocationstart"
    	];

    	const geolocate = new mapbox.GeolocateControl(options);
    	map.addControl(geolocate, position);
    	const destroyDispatchers = createDispatchers(geolocate, dispatch, events);
    	onDestroy(destroyDispatchers);

    	function trigger() {
    		geolocate.trigger();
    	}

    	const writable_props = ["position", "options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GeolocateControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		createEventDispatcher,
    		contextKey,
    		createDispatchers,
    		dispatch,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		position,
    		options,
    		events,
    		geolocate,
    		destroyDispatchers,
    		trigger
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [position, options, trigger];
    }

    class GeolocateControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { position: 0, options: 1, trigger: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeolocateControl",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get position() {
    		throw new Error("<GeolocateControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<GeolocateControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<GeolocateControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<GeolocateControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trigger() {
    		return this.$$.ctx[2];
    	}

    	set trigger(value) {
    		throw new Error("<GeolocateControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/controls/NavigationControl.svelte generated by Svelte v3.31.0 */

    function create_fragment$b(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavigationControl", slots, []);
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();
    	let { position = "top-right" } = $$props;
    	let { options = {} } = $$props;
    	const nav = new mapbox.NavigationControl(options);
    	map.addControl(nav, position);
    	const writable_props = ["position", "options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavigationControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		contextKey,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		position,
    		options,
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [position, options];
    }

    class NavigationControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { position: 0, options: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationControl",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get position() {
    		throw new Error("<NavigationControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<NavigationControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<NavigationControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<NavigationControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/controls/ScaleControl.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1$2 } = globals;

    function create_fragment$c(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScaleControl", slots, []);
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();
    	let { position = "bottom-right" } = $$props;
    	let { options = {} } = $$props;
    	const optionsWithDefaults = Object.assign({ maxWidth: 80, unit: "metric" }, options);
    	const scale = new mapbox.ScaleControl(optionsWithDefaults);
    	map.addControl(scale, position);
    	const writable_props = ["position", "options"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScaleControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		contextKey,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		position,
    		options,
    		optionsWithDefaults,
    		scale
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [position, options];
    }

    class ScaleControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { position: 0, options: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScaleControl",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get position() {
    		throw new Error("<ScaleControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<ScaleControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<ScaleControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<ScaleControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const controls = {
      GeolocateControl,
      NavigationControl,
      ScaleControl,
      ScalingControl: ScaleControl
    };

    /* src/components/maps/Mapbox.svelte generated by Svelte v3.31.0 */
    const file$9 = "src/components/maps/Mapbox.svelte";

    // (14:4) <Map     {accessToken}     bind:this={map}     {options}     >
    function create_default_slot(ctx) {
    	let navigationcontrol;
    	let current;

    	navigationcontrol = new /*NavigationControl*/ ctx[4]({
    			props: { options: /*options*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navigationcontrol.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navigationcontrol, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navigationcontrol_changes = {};
    			if (dirty & /*options*/ 1) navigationcontrol_changes.options = /*options*/ ctx[0];
    			navigationcontrol.$set(navigationcontrol_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigationcontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigationcontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navigationcontrol, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:4) <Map     {accessToken}     bind:this={map}     {options}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let map_1;
    	let div_class_value;
    	let current;

    	let map_1_props = {
    		accessToken: /*accessToken*/ ctx[1],
    		options: /*options*/ ctx[0],
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	map_1 = new Map$2({ props: map_1_props, $$inline: true });
    	/*map_1_binding*/ ctx[5](map_1);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(map_1.$$.fragment);
    			attr_dev(div, "class", div_class_value = "graphic " + /*layout*/ ctx[2]);
    			add_location(div, file$9, 11, 0, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(map_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const map_1_changes = {};
    			if (dirty & /*accessToken*/ 2) map_1_changes.accessToken = /*accessToken*/ ctx[1];
    			if (dirty & /*options*/ 1) map_1_changes.options = /*options*/ ctx[0];

    			if (dirty & /*$$scope, options*/ 257) {
    				map_1_changes.$$scope = { dirty, ctx };
    			}

    			map_1.$set(map_1_changes);

    			if (!current || dirty & /*layout*/ 4 && div_class_value !== (div_class_value = "graphic " + /*layout*/ ctx[2])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*map_1_binding*/ ctx[5](null);
    			destroy_component(map_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mapbox", slots, []);
    	let { options } = $$props;
    	let { accessToken } = $$props;
    	let { layout } = $$props;
    	const { GeolocateControl, NavigationControl, ScaleControl } = controls;
    	let map;
    	options.showCompass = false;
    	const writable_props = ["options", "accessToken", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mapbox> was created with unknown prop '${key}'`);
    	});

    	function map_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			map = $$value;
    			$$invalidate(3, map);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(1, accessToken = $$props.accessToken);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({
    		Map: Map$2,
    		Geocoder,
    		Marker,
    		controls,
    		options,
    		accessToken,
    		layout,
    		GeolocateControl,
    		NavigationControl,
    		ScaleControl,
    		map
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(1, accessToken = $$props.accessToken);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    		if ("map" in $$props) $$invalidate(3, map = $$props.map);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [options, accessToken, layout, map, NavigationControl, map_1_binding];
    }

    class Mapbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { options: 0, accessToken: 1, layout: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mapbox",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[0] === undefined && !("options" in props)) {
    			console.warn("<Mapbox> was created without expected prop 'options'");
    		}

    		if (/*accessToken*/ ctx[1] === undefined && !("accessToken" in props)) {
    			console.warn("<Mapbox> was created without expected prop 'accessToken'");
    		}

    		if (/*layout*/ ctx[2] === undefined && !("layout" in props)) {
    			console.warn("<Mapbox> was created without expected prop 'layout'");
    		}
    	}

    	get options() {
    		throw new Error("<Mapbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Mapbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accessToken() {
    		throw new Error("<Mapbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accessToken(value) {
    		throw new Error("<Mapbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Mapbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Mapbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var numeral = createCommonjsModule(function (module) {
    /*! @preserve
     * numeral.js
     * version : 2.0.6
     * author : Adam Draper
     * license : MIT
     * http://adamwdraper.github.com/Numeral-js/
     */

    (function (global, factory) {
        if ( module.exports) {
            module.exports = factory();
        } else {
            global.numeral = factory();
        }
    }(commonjsGlobal, function () {
        /************************************
            Variables
        ************************************/

        var numeral,
            _,
            VERSION = '2.0.6',
            formats = {},
            locales = {},
            defaults = {
                currentLocale: 'en',
                zeroFormat: null,
                nullFormat: null,
                defaultFormat: '0,0',
                scalePercentBy100: true
            },
            options = {
                currentLocale: defaults.currentLocale,
                zeroFormat: defaults.zeroFormat,
                nullFormat: defaults.nullFormat,
                defaultFormat: defaults.defaultFormat,
                scalePercentBy100: defaults.scalePercentBy100
            };


        /************************************
            Constructors
        ************************************/

        // Numeral prototype object
        function Numeral(input, number) {
            this._input = input;

            this._value = number;
        }

        numeral = function(input) {
            var value,
                kind,
                unformatFunction,
                regexp;

            if (numeral.isNumeral(input)) {
                value = input.value();
            } else if (input === 0 || typeof input === 'undefined') {
                value = 0;
            } else if (input === null || _.isNaN(input)) {
                value = null;
            } else if (typeof input === 'string') {
                if (options.zeroFormat && input === options.zeroFormat) {
                    value = 0;
                } else if (options.nullFormat && input === options.nullFormat || !input.replace(/[^0-9]+/g, '').length) {
                    value = null;
                } else {
                    for (kind in formats) {
                        regexp = typeof formats[kind].regexps.unformat === 'function' ? formats[kind].regexps.unformat() : formats[kind].regexps.unformat;

                        if (regexp && input.match(regexp)) {
                            unformatFunction = formats[kind].unformat;

                            break;
                        }
                    }

                    unformatFunction = unformatFunction || numeral._.stringToNumber;

                    value = unformatFunction(input);
                }
            } else {
                value = Number(input)|| null;
            }

            return new Numeral(input, value);
        };

        // version number
        numeral.version = VERSION;

        // compare numeral object
        numeral.isNumeral = function(obj) {
            return obj instanceof Numeral;
        };

        // helper functions
        numeral._ = _ = {
            // formats numbers separators, decimals places, signs, abbreviations
            numberToFormat: function(value, format, roundingFunction) {
                var locale = locales[numeral.options.currentLocale],
                    negP = false,
                    optDec = false,
                    leadingCount = 0,
                    abbr = '',
                    trillion = 1000000000000,
                    billion = 1000000000,
                    million = 1000000,
                    thousand = 1000,
                    decimal = '',
                    neg = false,
                    abbrForce, // force abbreviation
                    abs,
                    int,
                    precision,
                    signed,
                    thousands,
                    output;

                // make sure we never format a null value
                value = value || 0;

                abs = Math.abs(value);

                // see if we should use parentheses for negative number or if we should prefix with a sign
                // if both are present we default to parentheses
                if (numeral._.includes(format, '(')) {
                    negP = true;
                    format = format.replace(/[\(|\)]/g, '');
                } else if (numeral._.includes(format, '+') || numeral._.includes(format, '-')) {
                    signed = numeral._.includes(format, '+') ? format.indexOf('+') : value < 0 ? format.indexOf('-') : -1;
                    format = format.replace(/[\+|\-]/g, '');
                }

                // see if abbreviation is wanted
                if (numeral._.includes(format, 'a')) {
                    abbrForce = format.match(/a(k|m|b|t)?/);

                    abbrForce = abbrForce ? abbrForce[1] : false;

                    // check for space before abbreviation
                    if (numeral._.includes(format, ' a')) {
                        abbr = ' ';
                    }

                    format = format.replace(new RegExp(abbr + 'a[kmbt]?'), '');

                    if (abs >= trillion && !abbrForce || abbrForce === 't') {
                        // trillion
                        abbr += locale.abbreviations.trillion;
                        value = value / trillion;
                    } else if (abs < trillion && abs >= billion && !abbrForce || abbrForce === 'b') {
                        // billion
                        abbr += locale.abbreviations.billion;
                        value = value / billion;
                    } else if (abs < billion && abs >= million && !abbrForce || abbrForce === 'm') {
                        // million
                        abbr += locale.abbreviations.million;
                        value = value / million;
                    } else if (abs < million && abs >= thousand && !abbrForce || abbrForce === 'k') {
                        // thousand
                        abbr += locale.abbreviations.thousand;
                        value = value / thousand;
                    }
                }

                // check for optional decimals
                if (numeral._.includes(format, '[.]')) {
                    optDec = true;
                    format = format.replace('[.]', '.');
                }

                // break number and format
                int = value.toString().split('.')[0];
                precision = format.split('.')[1];
                thousands = format.indexOf(',');
                leadingCount = (format.split('.')[0].split(',')[0].match(/0/g) || []).length;

                if (precision) {
                    if (numeral._.includes(precision, '[')) {
                        precision = precision.replace(']', '');
                        precision = precision.split('[');
                        decimal = numeral._.toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                    } else {
                        decimal = numeral._.toFixed(value, precision.length, roundingFunction);
                    }

                    int = decimal.split('.')[0];

                    if (numeral._.includes(decimal, '.')) {
                        decimal = locale.delimiters.decimal + decimal.split('.')[1];
                    } else {
                        decimal = '';
                    }

                    if (optDec && Number(decimal.slice(1)) === 0) {
                        decimal = '';
                    }
                } else {
                    int = numeral._.toFixed(value, 0, roundingFunction);
                }

                // check abbreviation again after rounding
                if (abbr && !abbrForce && Number(int) >= 1000 && abbr !== locale.abbreviations.trillion) {
                    int = String(Number(int) / 1000);

                    switch (abbr) {
                        case locale.abbreviations.thousand:
                            abbr = locale.abbreviations.million;
                            break;
                        case locale.abbreviations.million:
                            abbr = locale.abbreviations.billion;
                            break;
                        case locale.abbreviations.billion:
                            abbr = locale.abbreviations.trillion;
                            break;
                    }
                }


                // format number
                if (numeral._.includes(int, '-')) {
                    int = int.slice(1);
                    neg = true;
                }

                if (int.length < leadingCount) {
                    for (var i = leadingCount - int.length; i > 0; i--) {
                        int = '0' + int;
                    }
                }

                if (thousands > -1) {
                    int = int.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + locale.delimiters.thousands);
                }

                if (format.indexOf('.') === 0) {
                    int = '';
                }

                output = int + decimal + (abbr ? abbr : '');

                if (negP) {
                    output = (negP && neg ? '(' : '') + output + (negP && neg ? ')' : '');
                } else {
                    if (signed >= 0) {
                        output = signed === 0 ? (neg ? '-' : '+') + output : output + (neg ? '-' : '+');
                    } else if (neg) {
                        output = '-' + output;
                    }
                }

                return output;
            },
            // unformats numbers separators, decimals places, signs, abbreviations
            stringToNumber: function(string) {
                var locale = locales[options.currentLocale],
                    stringOriginal = string,
                    abbreviations = {
                        thousand: 3,
                        million: 6,
                        billion: 9,
                        trillion: 12
                    },
                    abbreviation,
                    value,
                    regexp;

                if (options.zeroFormat && string === options.zeroFormat) {
                    value = 0;
                } else if (options.nullFormat && string === options.nullFormat || !string.replace(/[^0-9]+/g, '').length) {
                    value = null;
                } else {
                    value = 1;

                    if (locale.delimiters.decimal !== '.') {
                        string = string.replace(/\./g, '').replace(locale.delimiters.decimal, '.');
                    }

                    for (abbreviation in abbreviations) {
                        regexp = new RegExp('[^a-zA-Z]' + locale.abbreviations[abbreviation] + '(?:\\)|(\\' + locale.currency.symbol + ')?(?:\\))?)?$');

                        if (stringOriginal.match(regexp)) {
                            value *= Math.pow(10, abbreviations[abbreviation]);
                            break;
                        }
                    }

                    // check for negative number
                    value *= (string.split('-').length + Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2 ? 1 : -1;

                    // remove non numbers
                    string = string.replace(/[^0-9\.]+/g, '');

                    value *= Number(string);
                }

                return value;
            },
            isNaN: function(value) {
                return typeof value === 'number' && isNaN(value);
            },
            includes: function(string, search) {
                return string.indexOf(search) !== -1;
            },
            insert: function(string, subString, start) {
                return string.slice(0, start) + subString + string.slice(start);
            },
            reduce: function(array, callback /*, initialValue*/) {
                if (this === null) {
                    throw new TypeError('Array.prototype.reduce called on null or undefined');
                }

                if (typeof callback !== 'function') {
                    throw new TypeError(callback + ' is not a function');
                }

                var t = Object(array),
                    len = t.length >>> 0,
                    k = 0,
                    value;

                if (arguments.length === 3) {
                    value = arguments[2];
                } else {
                    while (k < len && !(k in t)) {
                        k++;
                    }

                    if (k >= len) {
                        throw new TypeError('Reduce of empty array with no initial value');
                    }

                    value = t[k++];
                }
                for (; k < len; k++) {
                    if (k in t) {
                        value = callback(value, t[k], k, t);
                    }
                }
                return value;
            },
            /**
             * Computes the multiplier necessary to make x >= 1,
             * effectively eliminating miscalculations caused by
             * finite precision.
             */
            multiplier: function (x) {
                var parts = x.toString().split('.');

                return parts.length < 2 ? 1 : Math.pow(10, parts[1].length);
            },
            /**
             * Given a variable number of arguments, returns the maximum
             * multiplier that must be used to normalize an operation involving
             * all of them.
             */
            correctionFactor: function () {
                var args = Array.prototype.slice.call(arguments);

                return args.reduce(function(accum, next) {
                    var mn = _.multiplier(next);
                    return accum > mn ? accum : mn;
                }, 1);
            },
            /**
             * Implementation of toFixed() that treats floats more like decimals
             *
             * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
             * problems for accounting- and finance-related software.
             */
            toFixed: function(value, maxDecimals, roundingFunction, optionals) {
                var splitValue = value.toString().split('.'),
                    minDecimals = maxDecimals - (optionals || 0),
                    boundedPrecision,
                    optionalsRegExp,
                    power,
                    output;

                // Use the smallest precision value possible to avoid errors from floating point representation
                if (splitValue.length === 2) {
                  boundedPrecision = Math.min(Math.max(splitValue[1].length, minDecimals), maxDecimals);
                } else {
                  boundedPrecision = minDecimals;
                }

                power = Math.pow(10, boundedPrecision);

                // Multiply up by precision, round accurately, then divide and use native toFixed():
                output = (roundingFunction(value + 'e+' + boundedPrecision) / power).toFixed(boundedPrecision);

                if (optionals > maxDecimals - boundedPrecision) {
                    optionalsRegExp = new RegExp('\\.?0{1,' + (optionals - (maxDecimals - boundedPrecision)) + '}$');
                    output = output.replace(optionalsRegExp, '');
                }

                return output;
            }
        };

        // avaliable options
        numeral.options = options;

        // avaliable formats
        numeral.formats = formats;

        // avaliable formats
        numeral.locales = locales;

        // This function sets the current locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        numeral.locale = function(key) {
            if (key) {
                options.currentLocale = key.toLowerCase();
            }

            return options.currentLocale;
        };

        // This function provides access to the loaded locale data.  If
        // no arguments are passed in, it will simply return the current
        // global locale object.
        numeral.localeData = function(key) {
            if (!key) {
                return locales[options.currentLocale];
            }

            key = key.toLowerCase();

            if (!locales[key]) {
                throw new Error('Unknown locale : ' + key);
            }

            return locales[key];
        };

        numeral.reset = function() {
            for (var property in defaults) {
                options[property] = defaults[property];
            }
        };

        numeral.zeroFormat = function(format) {
            options.zeroFormat = typeof(format) === 'string' ? format : null;
        };

        numeral.nullFormat = function (format) {
            options.nullFormat = typeof(format) === 'string' ? format : null;
        };

        numeral.defaultFormat = function(format) {
            options.defaultFormat = typeof(format) === 'string' ? format : '0.0';
        };

        numeral.register = function(type, name, format) {
            name = name.toLowerCase();

            if (this[type + 's'][name]) {
                throw new TypeError(name + ' ' + type + ' already registered.');
            }

            this[type + 's'][name] = format;

            return format;
        };


        numeral.validate = function(val, culture) {
            var _decimalSep,
                _thousandSep,
                _currSymbol,
                _valArray,
                _abbrObj,
                _thousandRegEx,
                localeData,
                temp;

            //coerce val to string
            if (typeof val !== 'string') {
                val += '';

                if (console.warn) {
                    console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
                }
            }

            //trim whitespaces from either sides
            val = val.trim();

            //if val is just digits return true
            if (!!val.match(/^\d+$/)) {
                return true;
            }

            //if val is empty return false
            if (val === '') {
                return false;
            }

            //get the decimal and thousands separator from numeral.localeData
            try {
                //check if the culture is understood by numeral. if not, default it to current locale
                localeData = numeral.localeData(culture);
            } catch (e) {
                localeData = numeral.localeData(numeral.locale());
            }

            //setup the delimiters and currency symbol based on culture/locale
            _currSymbol = localeData.currency.symbol;
            _abbrObj = localeData.abbreviations;
            _decimalSep = localeData.delimiters.decimal;
            if (localeData.delimiters.thousands === '.') {
                _thousandSep = '\\.';
            } else {
                _thousandSep = localeData.delimiters.thousands;
            }

            // validating currency symbol
            temp = val.match(/^[^\d]+/);
            if (temp !== null) {
                val = val.substr(1);
                if (temp[0] !== _currSymbol) {
                    return false;
                }
            }

            //validating abbreviation symbol
            temp = val.match(/[^\d]+$/);
            if (temp !== null) {
                val = val.slice(0, -1);
                if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million && temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
                    return false;
                }
            }

            _thousandRegEx = new RegExp(_thousandSep + '{2}');

            if (!val.match(/[^\d.,]/g)) {
                _valArray = val.split(_decimalSep);
                if (_valArray.length > 2) {
                    return false;
                } else {
                    if (_valArray.length < 2) {
                        return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx));
                    } else {
                        if (_valArray[0].length === 1) {
                            return ( !! _valArray[0].match(/^\d+$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                        } else {
                            return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                        }
                    }
                }
            }

            return false;
        };


        /************************************
            Numeral Prototype
        ************************************/

        numeral.fn = Numeral.prototype = {
            clone: function() {
                return numeral(this);
            },
            format: function(inputString, roundingFunction) {
                var value = this._value,
                    format = inputString || options.defaultFormat,
                    kind,
                    output,
                    formatFunction;

                // make sure we have a roundingFunction
                roundingFunction = roundingFunction || Math.round;

                // format based on value
                if (value === 0 && options.zeroFormat !== null) {
                    output = options.zeroFormat;
                } else if (value === null && options.nullFormat !== null) {
                    output = options.nullFormat;
                } else {
                    for (kind in formats) {
                        if (format.match(formats[kind].regexps.format)) {
                            formatFunction = formats[kind].format;

                            break;
                        }
                    }

                    formatFunction = formatFunction || numeral._.numberToFormat;

                    output = formatFunction(value, format, roundingFunction);
                }

                return output;
            },
            value: function() {
                return this._value;
            },
            input: function() {
                return this._input;
            },
            set: function(value) {
                this._value = Number(value);

                return this;
            },
            add: function(value) {
                var corrFactor = _.correctionFactor.call(null, this._value, value);

                function cback(accum, curr, currI, O) {
                    return accum + Math.round(corrFactor * curr);
                }

                this._value = _.reduce([this._value, value], cback, 0) / corrFactor;

                return this;
            },
            subtract: function(value) {
                var corrFactor = _.correctionFactor.call(null, this._value, value);

                function cback(accum, curr, currI, O) {
                    return accum - Math.round(corrFactor * curr);
                }

                this._value = _.reduce([value], cback, Math.round(this._value * corrFactor)) / corrFactor;

                return this;
            },
            multiply: function(value) {
                function cback(accum, curr, currI, O) {
                    var corrFactor = _.correctionFactor(accum, curr);
                    return Math.round(accum * corrFactor) * Math.round(curr * corrFactor) / Math.round(corrFactor * corrFactor);
                }

                this._value = _.reduce([this._value, value], cback, 1);

                return this;
            },
            divide: function(value) {
                function cback(accum, curr, currI, O) {
                    var corrFactor = _.correctionFactor(accum, curr);
                    return Math.round(accum * corrFactor) / Math.round(curr * corrFactor);
                }

                this._value = _.reduce([this._value, value], cback);

                return this;
            },
            difference: function(value) {
                return Math.abs(numeral(this._value).subtract(value).value());
            }
        };

        /************************************
            Default Locale && Format
        ************************************/

        numeral.register('locale', 'en', {
            delimiters: {
                thousands: ',',
                decimal: '.'
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            ordinal: function(number) {
                var b = number % 10;
                return (~~(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
            },
            currency: {
                symbol: '$'
            }
        });

        

    (function() {
            numeral.register('format', 'bps', {
                regexps: {
                    format: /(BPS)/,
                    unformat: /(BPS)/
                },
                format: function(value, format, roundingFunction) {
                    var space = numeral._.includes(format, ' BPS') ? ' ' : '',
                        output;

                    value = value * 10000;

                    // check for space before BPS
                    format = format.replace(/\s?BPS/, '');

                    output = numeral._.numberToFormat(value, format, roundingFunction);

                    if (numeral._.includes(output, ')')) {
                        output = output.split('');

                        output.splice(-1, 0, space + 'BPS');

                        output = output.join('');
                    } else {
                        output = output + space + 'BPS';
                    }

                    return output;
                },
                unformat: function(string) {
                    return +(numeral._.stringToNumber(string) * 0.0001).toFixed(15);
                }
            });
    })();


    (function() {
            var decimal = {
                base: 1000,
                suffixes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            },
            binary = {
                base: 1024,
                suffixes: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
            };

        var allSuffixes =  decimal.suffixes.concat(binary.suffixes.filter(function (item) {
                return decimal.suffixes.indexOf(item) < 0;
            }));
            var unformatRegex = allSuffixes.join('|');
            // Allow support for BPS (http://www.investopedia.com/terms/b/basispoint.asp)
            unformatRegex = '(' + unformatRegex.replace('B', 'B(?!PS)') + ')';

        numeral.register('format', 'bytes', {
            regexps: {
                format: /([0\s]i?b)/,
                unformat: new RegExp(unformatRegex)
            },
            format: function(value, format, roundingFunction) {
                var output,
                    bytes = numeral._.includes(format, 'ib') ? binary : decimal,
                    suffix = numeral._.includes(format, ' b') || numeral._.includes(format, ' ib') ? ' ' : '',
                    power,
                    min,
                    max;

                // check for space before
                format = format.replace(/\s?i?b/, '');

                for (power = 0; power <= bytes.suffixes.length; power++) {
                    min = Math.pow(bytes.base, power);
                    max = Math.pow(bytes.base, power + 1);

                    if (value === null || value === 0 || value >= min && value < max) {
                        suffix += bytes.suffixes[power];

                        if (min > 0) {
                            value = value / min;
                        }

                        break;
                    }
                }

                output = numeral._.numberToFormat(value, format, roundingFunction);

                return output + suffix;
            },
            unformat: function(string) {
                var value = numeral._.stringToNumber(string),
                    power,
                    bytesMultiplier;

                if (value) {
                    for (power = decimal.suffixes.length - 1; power >= 0; power--) {
                        if (numeral._.includes(string, decimal.suffixes[power])) {
                            bytesMultiplier = Math.pow(decimal.base, power);

                            break;
                        }

                        if (numeral._.includes(string, binary.suffixes[power])) {
                            bytesMultiplier = Math.pow(binary.base, power);

                            break;
                        }
                    }

                    value *= (bytesMultiplier || 1);
                }

                return value;
            }
        });
    })();


    (function() {
            numeral.register('format', 'currency', {
            regexps: {
                format: /(\$)/
            },
            format: function(value, format, roundingFunction) {
                var locale = numeral.locales[numeral.options.currentLocale],
                    symbols = {
                        before: format.match(/^([\+|\-|\(|\s|\$]*)/)[0],
                        after: format.match(/([\+|\-|\)|\s|\$]*)$/)[0]
                    },
                    output,
                    symbol,
                    i;

                // strip format of spaces and $
                format = format.replace(/\s?\$\s?/, '');

                // format the number
                output = numeral._.numberToFormat(value, format, roundingFunction);

                // update the before and after based on value
                if (value >= 0) {
                    symbols.before = symbols.before.replace(/[\-\(]/, '');
                    symbols.after = symbols.after.replace(/[\-\)]/, '');
                } else if (value < 0 && (!numeral._.includes(symbols.before, '-') && !numeral._.includes(symbols.before, '('))) {
                    symbols.before = '-' + symbols.before;
                }

                // loop through each before symbol
                for (i = 0; i < symbols.before.length; i++) {
                    symbol = symbols.before[i];

                    switch (symbol) {
                        case '$':
                            output = numeral._.insert(output, locale.currency.symbol, i);
                            break;
                        case ' ':
                            output = numeral._.insert(output, ' ', i + locale.currency.symbol.length - 1);
                            break;
                    }
                }

                // loop through each after symbol
                for (i = symbols.after.length - 1; i >= 0; i--) {
                    symbol = symbols.after[i];

                    switch (symbol) {
                        case '$':
                            output = i === symbols.after.length - 1 ? output + locale.currency.symbol : numeral._.insert(output, locale.currency.symbol, -(symbols.after.length - (1 + i)));
                            break;
                        case ' ':
                            output = i === symbols.after.length - 1 ? output + ' ' : numeral._.insert(output, ' ', -(symbols.after.length - (1 + i) + locale.currency.symbol.length - 1));
                            break;
                    }
                }


                return output;
            }
        });
    })();


    (function() {
            numeral.register('format', 'exponential', {
            regexps: {
                format: /(e\+|e-)/,
                unformat: /(e\+|e-)/
            },
            format: function(value, format, roundingFunction) {
                var output,
                    exponential = typeof value === 'number' && !numeral._.isNaN(value) ? value.toExponential() : '0e+0',
                    parts = exponential.split('e');

                format = format.replace(/e[\+|\-]{1}0/, '');

                output = numeral._.numberToFormat(Number(parts[0]), format, roundingFunction);

                return output + 'e' + parts[1];
            },
            unformat: function(string) {
                var parts = numeral._.includes(string, 'e+') ? string.split('e+') : string.split('e-'),
                    value = Number(parts[0]),
                    power = Number(parts[1]);

                power = numeral._.includes(string, 'e-') ? power *= -1 : power;

                function cback(accum, curr, currI, O) {
                    var corrFactor = numeral._.correctionFactor(accum, curr),
                        num = (accum * corrFactor) * (curr * corrFactor) / (corrFactor * corrFactor);
                    return num;
                }

                return numeral._.reduce([value, Math.pow(10, power)], cback, 1);
            }
        });
    })();


    (function() {
            numeral.register('format', 'ordinal', {
            regexps: {
                format: /(o)/
            },
            format: function(value, format, roundingFunction) {
                var locale = numeral.locales[numeral.options.currentLocale],
                    output,
                    ordinal = numeral._.includes(format, ' o') ? ' ' : '';

                // check for space before
                format = format.replace(/\s?o/, '');

                ordinal += locale.ordinal(value);

                output = numeral._.numberToFormat(value, format, roundingFunction);

                return output + ordinal;
            }
        });
    })();


    (function() {
            numeral.register('format', 'percentage', {
            regexps: {
                format: /(%)/,
                unformat: /(%)/
            },
            format: function(value, format, roundingFunction) {
                var space = numeral._.includes(format, ' %') ? ' ' : '',
                    output;

                if (numeral.options.scalePercentBy100) {
                    value = value * 100;
                }

                // check for space before %
                format = format.replace(/\s?\%/, '');

                output = numeral._.numberToFormat(value, format, roundingFunction);

                if (numeral._.includes(output, ')')) {
                    output = output.split('');

                    output.splice(-1, 0, space + '%');

                    output = output.join('');
                } else {
                    output = output + space + '%';
                }

                return output;
            },
            unformat: function(string) {
                var number = numeral._.stringToNumber(string);
                if (numeral.options.scalePercentBy100) {
                    return number * 0.01;
                }
                return number;
            }
        });
    })();


    (function() {
            numeral.register('format', 'time', {
            regexps: {
                format: /(:)/,
                unformat: /(:)/
            },
            format: function(value, format, roundingFunction) {
                var hours = Math.floor(value / 60 / 60),
                    minutes = Math.floor((value - (hours * 60 * 60)) / 60),
                    seconds = Math.round(value - (hours * 60 * 60) - (minutes * 60));

                return hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
            },
            unformat: function(string) {
                var timeArray = string.split(':'),
                    seconds = 0;

                // turn hours and minutes into seconds and add them all up
                if (timeArray.length === 3) {
                    // hours
                    seconds = seconds + (Number(timeArray[0]) * 60 * 60);
                    // minutes
                    seconds = seconds + (Number(timeArray[1]) * 60);
                    // seconds
                    seconds = seconds + Number(timeArray[2]);
                } else if (timeArray.length === 2) {
                    // minutes
                    seconds = seconds + (Number(timeArray[0]) * 60);
                    // seconds
                    seconds = seconds + Number(timeArray[1]);
                }
                return Number(seconds);
            }
        });
    })();

    return numeral;
    }));
    });

    /* src/components/common/Legend.svelte generated by Svelte v3.31.0 */
    const file$a = "src/components/common/Legend.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (50:3) {#if i > 0}
    function create_if_block$7(ctx) {
    	let div;
    	let t0;
    	let p;
    	let t1_value = numeral(/*values*/ ctx[4][/*i*/ ctx[19]]).format(/*format*/ ctx[2]) + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "ticks svelte-1c3o8ly");
    			add_location(div, file$a, 50, 3, 1190);
    			attr_dev(p, "class", "value svelte-1c3o8ly");
    			set_style(p, "width", /*bandWidth*/ ctx[7][/*i*/ ctx[19]] + "px");
    			set_style(p, "margin-left", "-" + /*bandWidth*/ ctx[7][/*i*/ ctx[19]] / 2 + "px");
    			add_location(p, file$a, 51, 3, 1219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values, format*/ 20 && t1_value !== (t1_value = numeral(/*values*/ ctx[4][/*i*/ ctx[19]]).format(/*format*/ ctx[2]) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*bandWidth*/ 128) {
    				set_style(p, "width", /*bandWidth*/ ctx[7][/*i*/ ctx[19]] + "px");
    			}

    			if (dirty & /*bandWidth*/ 128) {
    				set_style(p, "margin-left", "-" + /*bandWidth*/ ctx[7][/*i*/ ctx[19]] / 2 + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(50:3) {#if i > 0}",
    		ctx
    	});

    	return block;
    }

    // (47:1) {#each colors as color, i }
    function create_each_block$3(ctx) {
    	let li;
    	let div;
    	let t0;
    	let t1;
    	let if_block = /*i*/ ctx[19] > 0 && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div, "class", "color svelte-1c3o8ly");
    			set_style(div, "background", /*color*/ ctx[17]);
    			add_location(div, file$a, 48, 3, 1117);
    			set_style(li, "width", /*bandWidth*/ ctx[7][/*i*/ ctx[19]] + "px");
    			attr_dev(li, "class", "svelte-1c3o8ly");
    			add_location(li, file$a, 47, 2, 1077);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(li, t0);
    			if (if_block) if_block.m(li, null);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colors*/ 8) {
    				set_style(div, "background", /*color*/ ctx[17]);
    			}

    			if (/*i*/ ctx[19] > 0) if_block.p(ctx, dirty);

    			if (dirty & /*bandWidth*/ 128) {
    				set_style(li, "width", /*bandWidth*/ ctx[7][/*i*/ ctx[19]] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(47:1) {#each colors as color, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let h5;
    	let t0;
    	let t1;
    	let ul;
    	let each_value = /*colors*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h5, "class", "svelte-1c3o8ly");
    			add_location(h5, file$a, 44, 1, 983);
    			attr_dev(ul, "class", "scale svelte-1c3o8ly");
    			set_style(ul, "width", /*width*/ ctx[1] + "px");
    			add_location(ul, file$a, 45, 1, 1001);
    			attr_dev(div, "class", "legend svelte-1c3o8ly");
    			set_style(div, "top", /*t*/ ctx[5] + "px");
    			set_style(div, "left", /*l*/ ctx[6] + "px");
    			add_location(div, file$a, 43, 0, 929);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			append_dev(h5, t0);
    			append_dev(div, t1);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*bandWidth, numeral, values, format, colors*/ 156) {
    				each_value = /*colors*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*width*/ 2) {
    				set_style(ul, "width", /*width*/ ctx[1] + "px");
    			}

    			if (dirty & /*t*/ 32) {
    				set_style(div, "top", /*t*/ ctx[5] + "px");
    			}

    			if (dirty & /*l*/ 64) {
    				set_style(div, "left", /*l*/ ctx[6] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Legend", slots, []);
    	let { scale } = $$props;
    	let { title } = $$props;
    	let { mapWidth } = $$props;
    	let { mapHeight } = $$props;
    	let { width = 320 } = $$props;
    	let { position = ["top", "center"] } = $$props;
    	let { format } = $$props;
    	const writable_props = ["scale", "title", "mapWidth", "mapHeight", "width", "position", "format"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Legend> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("scale" in $$props) $$invalidate(8, scale = $$props.scale);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("mapWidth" in $$props) $$invalidate(9, mapWidth = $$props.mapWidth);
    		if ("mapHeight" in $$props) $$invalidate(10, mapHeight = $$props.mapHeight);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("position" in $$props) $$invalidate(11, position = $$props.position);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    	};

    	$$self.$capture_state = () => ({
    		numeral,
    		scale,
    		title,
    		mapWidth,
    		mapHeight,
    		width,
    		position,
    		format,
    		t,
    		l,
    		colors,
    		extent,
    		max,
    		min,
    		d,
    		values,
    		bw,
    		bandWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("scale" in $$props) $$invalidate(8, scale = $$props.scale);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("mapWidth" in $$props) $$invalidate(9, mapWidth = $$props.mapWidth);
    		if ("mapHeight" in $$props) $$invalidate(10, mapHeight = $$props.mapHeight);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("position" in $$props) $$invalidate(11, position = $$props.position);
    		if ("format" in $$props) $$invalidate(2, format = $$props.format);
    		if ("t" in $$props) $$invalidate(5, t = $$props.t);
    		if ("l" in $$props) $$invalidate(6, l = $$props.l);
    		if ("colors" in $$props) $$invalidate(3, colors = $$props.colors);
    		if ("extent" in $$props) $$invalidate(12, extent = $$props.extent);
    		if ("max" in $$props) $$invalidate(13, max = $$props.max);
    		if ("min" in $$props) $$invalidate(14, min = $$props.min);
    		if ("d" in $$props) $$invalidate(15, d = $$props.d);
    		if ("values" in $$props) $$invalidate(4, values = $$props.values);
    		if ("bw" in $$props) $$invalidate(16, bw = $$props.bw);
    		if ("bandWidth" in $$props) $$invalidate(7, bandWidth = $$props.bandWidth);
    	};

    	let t;
    	let l;
    	let colors;
    	let extent;
    	let max;
    	let min;
    	let d;
    	let values;
    	let bw;
    	let bandWidth;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position, mapHeight*/ 3072) {
    			 $$invalidate(5, t = position[0] === "top"
    			? 0
    			: position[0] === "bottom" ? mapHeight - 48 : position[0]);
    		}

    		if ($$self.$$.dirty & /*position, mapWidth, width*/ 2562) {
    			 $$invalidate(6, l = position[1] === "left"
    			? 0
    			: position[1] === "center"
    				? mapWidth / 2 - width / 2
    				: position[1] === "right" ? mapWidth - width : position[1]);
    		}

    		if ($$self.$$.dirty & /*scale*/ 256) {
    			 $$invalidate(3, colors = scale.range());
    		}

    		if ($$self.$$.dirty & /*scale*/ 256) {
    			 $$invalidate(12, extent = scale.domain());
    		}

    		if ($$self.$$.dirty & /*extent*/ 4096) {
    			 $$invalidate(13, max = extent[0] > extent[1] ? extent[0] : extent[1]);
    		}

    		if ($$self.$$.dirty & /*extent*/ 4096) {
    			 $$invalidate(14, min = extent[0] < extent[1] ? extent[0] : extent[1]);
    		}

    		if ($$self.$$.dirty & /*max, min, colors*/ 24584) {
    			 $$invalidate(15, d = (max - min) / colors.length);
    		}

    		if ($$self.$$.dirty & /*colors, min, d*/ 49160) {
    			 $$invalidate(4, values = [...Array(colors.length)].map((_d, i) => min + d * i));
    		}

    		if ($$self.$$.dirty & /*width, max, min*/ 24578) {
    			 $$invalidate(16, bw = width / (max - min));
    		}

    		if ($$self.$$.dirty & /*values, bw, max*/ 73744) {
    			 $$invalidate(7, bandWidth = values.map((d, i) => {
    				return i < values.length - 1
    				? (values[i + 1] - d) * bw
    				: (max - d) * bw;
    			}));
    		}
    	};

    	return [
    		title,
    		width,
    		format,
    		colors,
    		values,
    		t,
    		l,
    		bandWidth,
    		scale,
    		mapWidth,
    		mapHeight,
    		position,
    		extent,
    		max,
    		min,
    		d,
    		bw
    	];
    }

    class Legend extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			scale: 8,
    			title: 0,
    			mapWidth: 9,
    			mapHeight: 10,
    			width: 1,
    			position: 11,
    			format: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Legend",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*scale*/ ctx[8] === undefined && !("scale" in props)) {
    			console.warn("<Legend> was created without expected prop 'scale'");
    		}

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Legend> was created without expected prop 'title'");
    		}

    		if (/*mapWidth*/ ctx[9] === undefined && !("mapWidth" in props)) {
    			console.warn("<Legend> was created without expected prop 'mapWidth'");
    		}

    		if (/*mapHeight*/ ctx[10] === undefined && !("mapHeight" in props)) {
    			console.warn("<Legend> was created without expected prop 'mapHeight'");
    		}

    		if (/*format*/ ctx[2] === undefined && !("format" in props)) {
    			console.warn("<Legend> was created without expected prop 'format'");
    		}
    	}

    	get scale() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mapWidth() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mapWidth(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mapHeight() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mapHeight(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function identity$1(x) {
      return x;
    }

    function transform(transform) {
      if (transform == null) return identity$1;
      var x0,
          y0,
          kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];
      return function(input, i) {
        if (!i) x0 = y0 = 0;
        var j = 2, n = input.length, output = new Array(n);
        output[0] = (x0 += input[0]) * kx + dx;
        output[1] = (y0 += input[1]) * ky + dy;
        while (j < n) output[j] = input[j], ++j;
        return output;
      };
    }

    function reverse(array, n) {
      var t, j = array.length, i = j - n;
      while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
    }

    function feature(topology, o) {
      if (typeof o === "string") o = topology.objects[o];
      return o.type === "GeometryCollection"
          ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
          : feature$1(topology, o);
    }

    function feature$1(topology, o) {
      var id = o.id,
          bbox = o.bbox,
          properties = o.properties == null ? {} : o.properties,
          geometry = object$1(topology, o);
      return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
          : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
          : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
    }

    function object$1(topology, o) {
      var transformPoint = transform(topology.transform),
          arcs = topology.arcs;

      function arc(i, points) {
        if (points.length) points.pop();
        for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
          points.push(transformPoint(a[k], k));
        }
        if (i < 0) reverse(points, n);
      }

      function point(p) {
        return transformPoint(p);
      }

      function line(arcs) {
        var points = [];
        for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
        if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
        return points;
      }

      function ring(arcs) {
        var points = line(arcs);
        while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
        return points;
      }

      function polygon(arcs) {
        return arcs.map(ring);
      }

      function geometry(o) {
        var type = o.type, coordinates;
        switch (type) {
          case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
          case "Point": coordinates = point(o.coordinates); break;
          case "MultiPoint": coordinates = o.coordinates.map(point); break;
          case "LineString": coordinates = line(o.arcs); break;
          case "MultiLineString": coordinates = o.arcs.map(line); break;
          case "Polygon": coordinates = polygon(o.arcs); break;
          case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
          default: return null;
        }
        return {type: type, coordinates: coordinates};
      }

      return geometry(o);
    }

    function stitch(topology, arcs) {
      var stitchedArcs = {},
          fragmentByStart = {},
          fragmentByEnd = {},
          fragments = [],
          emptyIndex = -1;

      // Stitch empty arcs first, since they may be subsumed by other arcs.
      arcs.forEach(function(i, j) {
        var arc = topology.arcs[i < 0 ? ~i : i], t;
        if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
          t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
        }
      });

      arcs.forEach(function(i) {
        var e = ends(i),
            start = e[0],
            end = e[1],
            f, g;

        if (f = fragmentByEnd[start]) {
          delete fragmentByEnd[f.end];
          f.push(i);
          f.end = end;
          if (g = fragmentByStart[end]) {
            delete fragmentByStart[g.start];
            var fg = g === f ? f : f.concat(g);
            fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
          } else {
            fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
          }
        } else if (f = fragmentByStart[end]) {
          delete fragmentByStart[f.start];
          f.unshift(i);
          f.start = start;
          if (g = fragmentByEnd[start]) {
            delete fragmentByEnd[g.end];
            var gf = g === f ? f : g.concat(f);
            fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
          } else {
            fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
          }
        } else {
          f = [i];
          fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
        }
      });

      function ends(i) {
        var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
        if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
        else p1 = arc[arc.length - 1];
        return i < 0 ? [p1, p0] : [p0, p1];
      }

      function flush(fragmentByEnd, fragmentByStart) {
        for (var k in fragmentByEnd) {
          var f = fragmentByEnd[k];
          delete fragmentByStart[f.start];
          delete f.start;
          delete f.end;
          f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
          fragments.push(f);
        }
      }

      flush(fragmentByEnd, fragmentByStart);
      flush(fragmentByStart, fragmentByEnd);
      arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

      return fragments;
    }

    function mesh(topology) {
      return object$1(topology, meshArcs.apply(this, arguments));
    }

    function meshArcs(topology, object, filter) {
      var arcs, i, n;
      if (arguments.length > 1) arcs = extractArcs(topology, object, filter);
      else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
      return {type: "MultiLineString", arcs: stitch(topology, arcs)};
    }

    function extractArcs(topology, object, filter) {
      var arcs = [],
          geomsByArc = [],
          geom;

      function extract0(i) {
        var j = i < 0 ? ~i : i;
        (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
      }

      function extract1(arcs) {
        arcs.forEach(extract0);
      }

      function extract2(arcs) {
        arcs.forEach(extract1);
      }

      function extract3(arcs) {
        arcs.forEach(extract2);
      }

      function geometry(o) {
        switch (geom = o, o.type) {
          case "GeometryCollection": o.geometries.forEach(geometry); break;
          case "LineString": extract1(o.arcs); break;
          case "MultiLineString": case "Polygon": extract2(o.arcs); break;
          case "MultiPolygon": extract3(o.arcs); break;
        }
      }

      geometry(object);

      geomsByArc.forEach(filter == null
          ? function(geoms) { arcs.push(geoms[0].i); }
          : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });

      return arcs;
    }

    var epsilon$2 = 1e-6;
    var epsilon2 = 1e-12;
    var pi$1 = Math.PI;
    var halfPi = pi$1 / 2;
    var quarterPi = pi$1 / 4;
    var tau$2 = pi$1 * 2;

    var degrees = 180 / pi$1;
    var radians = pi$1 / 180;

    var abs = Math.abs;
    var atan = Math.atan;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var sin = Math.sin;
    var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    var sqrt$1 = Math.sqrt;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi$1 : Math.acos(x);
    }

    function asin(x) {
      return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
    }

    function noop$2() {}

    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }

    var streamObjectType = {
      Feature: function(object, stream) {
        streamGeometry(object.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) streamGeometry(features[i].geometry, stream);
      }
    };

    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) streamGeometry(geometries[i], stream);
      }
    };

    function streamLine(coordinates, stream, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      stream.lineStart();
      while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }

    function streamPolygon(coordinates, stream) {
      var i = -1, n = coordinates.length;
      stream.polygonStart();
      while (++i < n) streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }

    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }

    function spherical(cartesian) {
      return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
    }

    function cartesian(spherical) {
      var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
      return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
    }

    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // TODO return a
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }

    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }

    // TODO return d
    function cartesianNormalizeInPlace(d) {
      var l = sqrt$1(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }

    function compose(a, b) {

      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }

      if (a.invert && b.invert) compose.invert = function(x, y) {
        return x = b.invert(x, y), x && a.invert(x[0], x[1]);
      };

      return compose;
    }

    function rotationIdentity(lambda, phi) {
      return [abs(lambda) > pi$1 ? lambda + Math.round(-lambda / tau$2) * tau$2 : lambda, phi];
    }

    rotationIdentity.invert = rotationIdentity;

    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau$2) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
        : rotationLambda(deltaLambda))
        : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
        : rotationIdentity);
    }

    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi$1 ? lambda - tau$2 : lambda < -pi$1 ? lambda + tau$2 : lambda, phi];
      };
    }

    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }

    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos(deltaPhi),
          sinDeltaPhi = sin(deltaPhi),
          cosDeltaGamma = cos(deltaGamma),
          sinDeltaGamma = sin(deltaGamma);

      function rotation(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [
          atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
          asin(k * cosDeltaGamma + y * sinDeltaGamma)
        ];
      }

      rotation.invert = function(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [
          atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
          asin(k * cosDeltaPhi - x * sinDeltaPhi)
        ];
      };

      return rotation;
    }

    // Generates a circle centered at [0°, 0°], with a given radius and precision.
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta) return;
      var cosRadius = cos(radius),
          sinRadius = sin(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau$2;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau$2;
      }
      for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
        stream.point(point[0], point[1]);
      }
    }

    // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau$2 - epsilon$2) % tau$2;
    }

    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y, m) {
          line.push([x, y, m]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop$2,
        rejoin: function() {
          if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }

    function pointEqual(a, b) {
      return abs(a[0] - b[0]) < epsilon$2 && abs(a[1] - b[1]) < epsilon$2;
    }

    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other; // another intersection
      this.e = entry; // is an entry?
      this.v = false; // visited
      this.n = this.p = null; // next & previous
    }

    // A generalized polygon clipping algorithm: given a polygon that has been cut
    // into its visible line segments, and rejoins the segments by interpolating
    // along the clip edge.
    function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;

      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0) return;
        var n, p0 = segment[0], p1 = segment[n], x;

        if (pointEqual(p0, p1)) {
          if (!p0[2] && !p1[2]) {
            stream.lineStart();
            for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
            stream.lineEnd();
            return;
          }
          // handle degenerate cases by moving the point
          p1[0] += 2 * epsilon$2;
        }

        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });

      if (!subject.length) return;

      clip.sort(compareIntersection);
      link(subject);
      link(clip);

      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }

      var start = subject[0],
          points,
          point;

      while (1) {
        // Find first unvisited intersection.
        var current = start,
            isSubject = true;
        while (current.v) if ((current = current.n) === start) return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }

    function link(array) {
      if (!(n = array.length)) return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }

    function longitude(point) {
      if (abs(point[0]) <= pi$1)
        return point[0];
      else
        return sign(point[0]) * ((abs(point[0]) + pi$1) % tau$2 - pi$1);
    }

    function polygonContains(polygon, point) {
      var lambda = longitude(point),
          phi = point[1],
          sinPhi = sin(phi),
          normal = [sin(lambda), -cos(lambda), 0],
          angle = 0,
          winding = 0;

      var sum = new Adder();

      if (sinPhi === 1) phi = halfPi + epsilon$2;
      else if (sinPhi === -1) phi = -halfPi - epsilon$2;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length)) continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = longitude(point0),
            phi0 = point0[1] / 2 + quarterPi,
            sinPhi0 = sin(phi0),
            cosPhi0 = cos(phi0);

        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = longitude(point1),
              phi1 = point1[1] / 2 + quarterPi,
              sinPhi1 = sin(phi1),
              cosPhi1 = cos(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi$1,
              k = sinPhi0 * sinPhi1;

          sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
          angle += antimeridian ? delta + sign * tau$2 : delta;

          // Are the longitudes either side of the point’s meridian (lambda),
          // and are the latitudes smaller than the parallel (phi)?
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }

      // First, determine whether the South pole is inside or outside:
      //
      // It is inside if:
      // * the polygon winds around it in a clockwise direction.
      // * the polygon does not (cumulatively) wind around it, but has a negative
      //   (counter-clockwise) area.
      //
      // Second, count the (signed) number of times a segment crosses a lambda
      // from the point to the South pole.  If it is zero, then the point is the
      // same side as the South pole.

      return (angle < -epsilon$2 || angle < epsilon$2 && sum < -epsilon2) ^ (winding & 1);
    }

    function clip(pointVisible, clipLine, interpolate, start) {
      return function(sink) {
        var line = clipLine(sink),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;

        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = merge(segments);
            var startInside = polygonContains(polygon, start);
            if (segments.length) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };

        function point(lambda, phi) {
          if (pointVisible(lambda, phi)) sink.point(lambda, phi);
        }

        function pointLine(lambda, phi) {
          line.point(lambda, phi);
        }

        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }

        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }

        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          ringSink.point(lambda, phi);
        }

        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }

        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();

          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i, n = ringSegments.length, m,
              segment,
              point;

          ring.pop();
          polygon.push(ring);
          ring = null;

          if (!n) return;

          // No intersections.
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }

          // Rejoin connected segments.
          // TODO reuse ringBuffer.rejoin()?
          if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

          segments.push(ringSegments.filter(validSegment));
        }

        return clip;
      };
    }

    function validSegment(segment) {
      return segment.length > 1;
    }

    // Intersections are sorted along the clip edge. For both antimeridian cutting
    // and circle clipping, the same comparison is used.
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon$2 : halfPi - a[1])
           - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon$2 : halfPi - b[1]);
    }

    var clipAntimeridian = clip(
      function() { return true; },
      clipAntimeridianLine,
      clipAntimeridianInterpolate,
      [-pi$1, -halfPi]
    );

    // Takes a line and cuts into visible segments. Return values: 0 - there were
    // intersections or the line was empty; 1 - no intersections; 2 - there were
    // intersections, and the first and last segments should be rejoined.
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean; // no intersections

      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi$1 : -pi$1,
              delta = abs(lambda1 - lambda0);
          if (abs(delta - pi$1) < epsilon$2) { // line crosses a pole
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi$1) { // line crosses antimeridian
            if (abs(lambda0 - sign0) < epsilon$2) lambda0 -= sign0 * epsilon$2; // handle degeneracies
            if (abs(lambda1 - sign1) < epsilon$2) lambda1 -= sign1 * epsilon$2;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean; // if intersections, rejoin first and last segments
        }
      };
    }

    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin(lambda0 - lambda1);
      return abs(sinLambda0Lambda1) > epsilon$2
          ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
              - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
              / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
          : (phi0 + phi1) / 2;
    }

    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi;
        stream.point(-pi$1, phi);
        stream.point(0, phi);
        stream.point(pi$1, phi);
        stream.point(pi$1, 0);
        stream.point(pi$1, -phi);
        stream.point(0, -phi);
        stream.point(-pi$1, -phi);
        stream.point(-pi$1, 0);
        stream.point(-pi$1, phi);
      } else if (abs(from[0] - to[0]) > epsilon$2) {
        var lambda = from[0] < to[0] ? pi$1 : -pi$1;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function clipCircle(radius) {
      var cr = cos(radius),
          delta = 6 * radians,
          smallRadius = cr > 0,
          notHemisphere = abs(cr) > epsilon$2; // TODO optimise for this common case

      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }

      function visible(lambda, phi) {
        return cos(lambda) * cos(phi) > cr;
      }

      // Takes a line and cuts into visible segments. Return values used for polygon
      // clipping: 0 - there were intersections or the line was empty; 1 - no
      // intersections 2 - there were intersections, and the first and last segments
      // should be rejoined.
      function clipLine(stream) {
        var point0, // previous point
            c0, // code for previous point
            v0, // visibility of previous point
            v00, // visibility of first point
            clean; // no intersections
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius
                  ? v ? 0 : code(lambda, phi)
                  : v ? code(lambda + (lambda < 0 ? pi$1 : -pi$1), phi) : 0;
            if (!point0 && (v00 = v0 = v)) stream.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
                point1[2] = 1;
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                // outside going in
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                // inside going out
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1], 2);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              // If the codes for two points are different, or are both zero,
              // and there this segment intersects with the small circle.
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1], 3);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0) stream.lineEnd();
            point0 = null;
          },
          // Rejoin first and last segments if there were intersections and the first
          // and last points were visible.
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }

      // Intersects the great circle between a and b with the clip circle.
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);

        // We have two planes, n1.p = d1 and n2.p = d2.
        // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
        var n1 = [1, 0, 0], // normal
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0], // cartesianDot(n1, n2),
            determinant = n2n2 - n1n2 * n1n2;

        // Two polar points.
        if (!determinant) return !two && a;

        var c1 =  cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);

        // Solve |p(t)|^2 = 1.
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);

        if (t2 < 0) return;

        var t = sqrt$1(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);

        if (!two) return q;

        // Two intersection points.
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;

        if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

        var delta = lambda1 - lambda0,
            polar = abs(delta - pi$1) < epsilon$2,
            meridian = polar || delta < epsilon$2;

        if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

        // Check that the first point is between a and b.
        if (meridian
            ? polar
              ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon$2 ? phi0 : phi1)
              : phi0 <= q[1] && q[1] <= phi1
            : delta > pi$1 ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }

      // Generates a 4-bit vector representing the location of a point relative to
      // the small circle's bounding box.
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi$1 - radius,
            code = 0;
        if (lambda < -r) code |= 1; // left
        else if (lambda > r) code |= 2; // right
        if (phi < -r) code |= 4; // below
        else if (phi > r) code |= 8; // above
        return code;
      }

      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi$1, radius - pi$1]);
    }

    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;

      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }

    var clipMax = 1e9, clipMin = -clipMax;

    // TODO Use d3-polygon’s polygonContains here for the ring check?
    // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

    function clipRectangle(x0, y0, x1, y1) {

      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }

      function interpolate(from, to, direction, stream) {
        var a = 0, a1 = 0;
        if (from == null
            || (a = corner(from, direction)) !== (a1 = corner(to, direction))
            || comparePoint(from, to) < 0 ^ direction > 0) {
          do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }

      function corner(p, direction) {
        return abs(p[0] - x0) < epsilon$2 ? direction > 0 ? 0 : 3
            : abs(p[0] - x1) < epsilon$2 ? direction > 0 ? 2 : 1
            : abs(p[1] - y0) < epsilon$2 ? direction > 0 ? 1 : 0
            : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
      }

      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }

      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb
            : ca === 0 ? b[1] - a[1]
            : ca === 1 ? a[0] - b[0]
            : ca === 2 ? a[1] - b[1]
            : b[0] - a[0];
      }

      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__, y__, v__, // first point
            x_, y_, v_, // previous point
            first,
            clean;

        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };

        function point(x, y) {
          if (visible(x, y)) activeStream.point(x, y);
        }

        function polygonInside() {
          var winding = 0;

          for (var i = 0, n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
              else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
            }
          }

          return winding;
        }

        // Buffer geometry within a polygon and then clip it en masse.
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }

        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }

        function lineStart() {
          clipStream.point = linePoint;
          if (polygon) polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }

        // TODO rather than special-case polygons, simply handle them separately.
        // Ideally, coincident intersection points should be jittered to avoid
        // clipping issues.
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_) bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_) activeStream.lineEnd();
        }

        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon) ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_) activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v) activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }

        return clipStream;
      };
    }

    var identity$2 = x => x;

    var areaSum = new Adder(),
        areaRingSum = new Adder(),
        x00,
        y00,
        x0,
        y0;

    var areaStream = {
      point: noop$2,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: function() {
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$2;
        areaSum.add(abs(areaRingSum));
        areaRingSum = new Adder();
      },
      result: function() {
        var area = areaSum / 2;
        areaSum = new Adder();
        return area;
      }
    };

    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }

    function areaPointFirst(x, y) {
      areaStream.point = areaPoint;
      x00 = x0 = x, y00 = y0 = y;
    }

    function areaPoint(x, y) {
      areaRingSum.add(y0 * x - x0 * y);
      x0 = x, y0 = y;
    }

    function areaRingEnd() {
      areaPoint(x00, y00);
    }

    var x0$1 = Infinity,
        y0$1 = x0$1,
        x1 = -x0$1,
        y1 = x1;

    var boundsStream = {
      point: boundsPoint,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: noop$2,
      polygonEnd: noop$2,
      result: function() {
        var bounds = [[x0$1, y0$1], [x1, y1]];
        x1 = y1 = -(y0$1 = x0$1 = Infinity);
        return bounds;
      }
    };

    function boundsPoint(x, y) {
      if (x < x0$1) x0$1 = x;
      if (x > x1) x1 = x;
      if (y < y0$1) y0$1 = y;
      if (y > y1) y1 = y;
    }

    // TODO Enforce positive area for exterior, negative area for interior?

    var X0 = 0,
        Y0 = 0,
        Z0 = 0,
        X1 = 0,
        Y1 = 0,
        Z1 = 0,
        X2 = 0,
        Y2 = 0,
        Z2 = 0,
        x00$1,
        y00$1,
        x0$2,
        y0$2;

    var centroidStream = {
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.point = centroidPoint;
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      },
      result: function() {
        var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
            : Z1 ? [X1 / Z1, Y1 / Z1]
            : Z0 ? [X0 / Z0, Y0 / Z0]
            : [NaN, NaN];
        X0 = Y0 = Z0 =
        X1 = Y1 = Z1 =
        X2 = Y2 = Z2 = 0;
        return centroid;
      }
    };

    function centroidPoint(x, y) {
      X0 += x;
      Y0 += y;
      ++Z0;
    }

    function centroidLineStart() {
      centroidStream.point = centroidPointFirstLine;
    }

    function centroidPointFirstLine(x, y) {
      centroidStream.point = centroidPointLine;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidPointLine(x, y) {
      var dx = x - x0$2, dy = y - y0$2, z = sqrt$1(dx * dx + dy * dy);
      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }

    function centroidRingStart() {
      centroidStream.point = centroidPointFirstRing;
    }

    function centroidRingEnd() {
      centroidPointRing(x00$1, y00$1);
    }

    function centroidPointFirstRing(x, y) {
      centroidStream.point = centroidPointRing;
      centroidPoint(x00$1 = x0$2 = x, y00$1 = y0$2 = y);
    }

    function centroidPointRing(x, y) {
      var dx = x - x0$2,
          dy = y - y0$2,
          z = sqrt$1(dx * dx + dy * dy);

      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;

      z = y0$2 * x - x0$2 * y;
      X2 += z * (x0$2 + x);
      Y2 += z * (y0$2 + y);
      Z2 += z * 3;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function PathContext(context) {
      this._context = context;
    }

    PathContext.prototype = {
      _radius: 4.5,
      pointRadius: function(_) {
        return this._radius = _, this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._context.closePath();
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._context.moveTo(x, y);
            this._point = 1;
            break;
          }
          case 1: {
            this._context.lineTo(x, y);
            break;
          }
          default: {
            this._context.moveTo(x + this._radius, y);
            this._context.arc(x, y, this._radius, 0, tau$2);
            break;
          }
        }
      },
      result: noop$2
    };

    var lengthSum = new Adder(),
        lengthRing,
        x00$2,
        y00$2,
        x0$3,
        y0$3;

    var lengthStream = {
      point: noop$2,
      lineStart: function() {
        lengthStream.point = lengthPointFirst;
      },
      lineEnd: function() {
        if (lengthRing) lengthPoint(x00$2, y00$2);
        lengthStream.point = noop$2;
      },
      polygonStart: function() {
        lengthRing = true;
      },
      polygonEnd: function() {
        lengthRing = null;
      },
      result: function() {
        var length = +lengthSum;
        lengthSum = new Adder();
        return length;
      }
    };

    function lengthPointFirst(x, y) {
      lengthStream.point = lengthPoint;
      x00$2 = x0$3 = x, y00$2 = y0$3 = y;
    }

    function lengthPoint(x, y) {
      x0$3 -= x, y0$3 -= y;
      lengthSum.add(sqrt$1(x0$3 * x0$3 + y0$3 * y0$3));
      x0$3 = x, y0$3 = y;
    }

    function PathString() {
      this._string = [];
    }

    PathString.prototype = {
      _radius: 4.5,
      _circle: circle(4.5),
      pointRadius: function(_) {
        if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
        return this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._string.push("Z");
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._string.push("M", x, ",", y);
            this._point = 1;
            break;
          }
          case 1: {
            this._string.push("L", x, ",", y);
            break;
          }
          default: {
            if (this._circle == null) this._circle = circle(this._radius);
            this._string.push("M", x, ",", y, this._circle);
            break;
          }
        }
      },
      result: function() {
        if (this._string.length) {
          var result = this._string.join("");
          this._string = [];
          return result;
        } else {
          return null;
        }
      }
    };

    function circle(radius) {
      return "m0," + radius
          + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
          + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
          + "z";
    }

    function geoPath(projection, context) {
      var pointRadius = 4.5,
          projectionStream,
          contextStream;

      function path(object) {
        if (object) {
          if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }

      path.area = function(object) {
        geoStream(object, projectionStream(areaStream));
        return areaStream.result();
      };

      path.measure = function(object) {
        geoStream(object, projectionStream(lengthStream));
        return lengthStream.result();
      };

      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream));
        return boundsStream.result();
      };

      path.centroid = function(object) {
        geoStream(object, projectionStream(centroidStream));
        return centroidStream.result();
      };

      path.projection = function(_) {
        return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$2) : (projection = _).stream, path) : projection;
      };

      path.context = function(_) {
        if (!arguments.length) return context;
        contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
        if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
        return path;
      };

      path.pointRadius = function(_) {
        if (!arguments.length) return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };

      return path.projection(projection).context(context);
    }

    function transformer(methods) {
      return function(stream) {
        var s = new TransformStream;
        for (var key in methods) s[key] = methods[key];
        s.stream = stream;
        return s;
      };
    }

    function TransformStream() {}

    TransformStream.prototype = {
      constructor: TransformStream,
      point: function(x, y) { this.stream.point(x, y); },
      sphere: function() { this.stream.sphere(); },
      lineStart: function() { this.stream.lineStart(); },
      lineEnd: function() { this.stream.lineEnd(); },
      polygonStart: function() { this.stream.polygonStart(); },
      polygonEnd: function() { this.stream.polygonEnd(); }
    };

    function fit(projection, fitBounds, object) {
      var clip = projection.clipExtent && projection.clipExtent();
      projection.scale(150).translate([0, 0]);
      if (clip != null) projection.clipExtent(null);
      geoStream(object, projection.stream(boundsStream));
      fitBounds(boundsStream.result());
      if (clip != null) projection.clipExtent(clip);
      return projection;
    }

    function fitExtent(projection, extent, object) {
      return fit(projection, function(b) {
        var w = extent[1][0] - extent[0][0],
            h = extent[1][1] - extent[0][1],
            k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
            x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitSize(projection, size, object) {
      return fitExtent(projection, [[0, 0], size], object);
    }

    function fitWidth(projection, width, object) {
      return fit(projection, function(b) {
        var w = +width,
            k = w / (b[1][0] - b[0][0]),
            x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitHeight(projection, height, object) {
      return fit(projection, function(b) {
        var h = +height,
            k = h / (b[1][1] - b[0][1]),
            x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    var maxDepth = 16, // maximum depth of subdivision
        cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }

    function resampleNone(project) {
      return transformer({
        point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }
      });
    }

    function resample$1(project, delta2) {

      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt$1(a * a + b * b + c * c),
              phi2 = asin(c /= m),
              lambda2 = abs(abs(c) - 1) < epsilon$2 || abs(lambda0 - lambda1) < epsilon$2 ? (lambda0 + lambda1) / 2 : atan2(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 // perpendicular projected distance
              || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
              || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00, x00, y00, a00, b00, c00, // first point
            lambda0, x0, y0, a0, b0, c0; // previous point

        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
          polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
        };

        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }

        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }

        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]), p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }

        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }

        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }

        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }

        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }

        return resampleStream;
      };
    }

    var transformRadians = transformer({
      point: function(x, y) {
        this.stream.point(x * radians, y * radians);
      }
    });

    function transformRotate(rotate) {
      return transformer({
        point: function(x, y) {
          var r = rotate(x, y);
          return this.stream.point(r[0], r[1]);
        }
      });
    }

    function scaleTranslate(k, dx, dy, sx, sy) {
      function transform(x, y) {
        x *= sx; y *= sy;
        return [dx + k * x, dy - k * y];
      }
      transform.invert = function(x, y) {
        return [(x - dx) / k * sx, (dy - y) / k * sy];
      };
      return transform;
    }

    function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
      if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
      var cosAlpha = cos(alpha),
          sinAlpha = sin(alpha),
          a = cosAlpha * k,
          b = sinAlpha * k,
          ai = cosAlpha / k,
          bi = sinAlpha / k,
          ci = (sinAlpha * dy - cosAlpha * dx) / k,
          fi = (sinAlpha * dx + cosAlpha * dy) / k;
      function transform(x, y) {
        x *= sx; y *= sy;
        return [a * x - b * y + dx, dy - b * x - a * y];
      }
      transform.invert = function(x, y) {
        return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
      };
      return transform;
    }

    function projection(project) {
      return projectionMutator(function() { return project; })();
    }

    function projectionMutator(projectAt) {
      var project,
          k = 150, // scale
          x = 480, y = 250, // translate
          lambda = 0, phi = 0, // center
          deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
          alpha = 0, // post-rotate angle
          sx = 1, // reflectX
          sy = 1, // reflectX
          theta = null, preclip = clipAntimeridian, // pre-clip angle
          x0 = null, y0, x1, y1, postclip = identity$2, // post-clip extent
          delta2 = 0.5, // precision
          projectResample,
          projectTransform,
          projectRotateTransform,
          cache,
          cacheStream;

      function projection(point) {
        return projectRotateTransform(point[0] * radians, point[1] * radians);
      }

      function invert(point) {
        point = projectRotateTransform.invert(point[0], point[1]);
        return point && [point[0] * degrees, point[1] * degrees];
      }

      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
      };

      projection.preclip = function(_) {
        return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
      };

      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };

      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
      };

      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$2) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };

      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };

      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
      };

      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
      };

      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
      };

      projection.reflectX = function(_) {
        return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
      };

      projection.reflectY = function(_) {
        return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
      };

      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt$1(delta2);
      };

      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };

      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };

      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };

      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      function recenter() {
        var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
            transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
        rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
        projectTransform = compose(project, transform);
        projectRotateTransform = compose(rotate, projectTransform);
        projectResample = resample(projectTransform, delta2);
        return reset();
      }

      function reset() {
        cache = cacheStream = null;
        return projection;
      }

      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }

    /* src/components/maps/Map.svelte generated by Svelte v3.31.0 */
    const file$b = "src/components/maps/Map.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (54:3) {#each land.features as feature}
    function create_each_block_1$1(ctx) {
    	let path_1;
    	let path_1_d_value;
    	let path_1_fill_value;

    	const block = {
    		c: function create() {
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[7](/*feature*/ ctx[21]));
    			attr_dev(path_1, "fill", path_1_fill_value = /*fill*/ ctx[8](/*feature*/ ctx[21].properties[/*join*/ ctx[1].map]));
    			attr_dev(path_1, "class", "country");
    			add_location(path_1, file$b, 54, 3, 1341);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 128 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[7](/*feature*/ ctx[21]))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (dirty & /*fill, join*/ 258 && path_1_fill_value !== (path_1_fill_value = /*fill*/ ctx[8](/*feature*/ ctx[21].properties[/*join*/ ctx[1].map]))) {
    				attr_dev(path_1, "fill", path_1_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(54:3) {#each land.features as feature}",
    		ctx
    	});

    	return block;
    }

    // (69:3) {#each land.features as feature}
    function create_each_block$4(ctx) {
    	let path_1;
    	let path_1_d_value;
    	let mounted;
    	let dispose;

    	function mousemove_handler(...args) {
    		return /*mousemove_handler*/ ctx[19](/*feature*/ ctx[21], ...args);
    	}

    	const block = {
    		c: function create() {
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[7](/*feature*/ ctx[21]));
    			attr_dev(path_1, "class", "selection svelte-q1j43y");
    			add_location(path_1, file$b, 69, 3, 1576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path_1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(path_1, "mousemove", mousemove_handler, false, false, false),
    					listen_dev(
    						path_1,
    						"mouseleave",
    						function () {
    							if (is_function(/*handleLeave*/ ctx[10])) /*handleLeave*/ ctx[10].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*path*/ 128 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[7](/*feature*/ ctx[21]))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(69:3) {#each land.features as feature}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let svg;
    	let g0;
    	let g1;
    	let path_1;
    	let path_1_d_value;
    	let g2;
    	let svg_viewBox_value;
    	let t0;
    	let tooltip;
    	let t1;
    	let legend_1;
    	let div_class_value;
    	let div_resize_listener;
    	let current;
    	let each_value_1 = /*land*/ ctx[11].features;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*land*/ ctx[11].features;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const tooltip_spread_levels = [
    		/*tooltipOptions*/ ctx[6],
    		{ width: /*width*/ ctx[4] },
    		{ height: /*height*/ ctx[5] }
    	];

    	let tooltip_props = {};

    	for (let i = 0; i < tooltip_spread_levels.length; i += 1) {
    		tooltip_props = assign(tooltip_props, tooltip_spread_levels[i]);
    	}

    	tooltip = new Tooltip({ props: tooltip_props, $$inline: true });

    	legend_1 = new Legend({
    			props: {
    				scale: /*scale*/ ctx[0],
    				title: /*legend*/ ctx[3].title,
    				mapWidth: /*width*/ ctx[4],
    				mapHeight: /*height*/ ctx[5],
    				format: /*legend*/ ctx[3].format
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			g1 = svg_element("g");
    			path_1 = svg_element("path");
    			g2 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			create_component(tooltip.$$.fragment);
    			t1 = space();
    			create_component(legend_1.$$.fragment);
    			add_location(g0, file$b, 52, 2, 1298);
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[7](/*border*/ ctx[12]));
    			attr_dev(path_1, "class", "border svelte-q1j43y");
    			add_location(path_1, file$b, 62, 3, 1470);
    			add_location(g1, file$b, 61, 2, 1463);
    			add_location(g2, file$b, 67, 2, 1533);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*width*/ ctx[4] + " " + /*height*/ ctx[5]);
    			attr_dev(svg, "width", /*width*/ ctx[4]);
    			attr_dev(svg, "height", /*height*/ ctx[5]);
    			add_location(svg, file$b, 51, 1, 1242);
    			attr_dev(div, "class", div_class_value = "graphic " + /*layout*/ ctx[2] + " svelte-q1j43y");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[20].call(div));
    			add_location(div, file$b, 50, 0, 1158);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			append_dev(svg, g1);
    			append_dev(g1, path_1);
    			append_dev(svg, g2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g2, null);
    			}

    			append_dev(div, t0);
    			mount_component(tooltip, div, null);
    			append_dev(div, t1);
    			mount_component(legend_1, div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[20].bind(div));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*path, land, fill, join*/ 2434) {
    				each_value_1 = /*land*/ ctx[11].features;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (!current || dirty & /*path*/ 128 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[7](/*border*/ ctx[12]))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (dirty & /*path, land, handleHover, join, handleLeave*/ 3714) {
    				each_value = /*land*/ ctx[11].features;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*width, height*/ 48 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*width*/ ctx[4] + " " + /*height*/ ctx[5])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty & /*width*/ 16) {
    				attr_dev(svg, "width", /*width*/ ctx[4]);
    			}

    			if (!current || dirty & /*height*/ 32) {
    				attr_dev(svg, "height", /*height*/ ctx[5]);
    			}

    			const tooltip_changes = (dirty & /*tooltipOptions, width, height*/ 112)
    			? get_spread_update(tooltip_spread_levels, [
    					dirty & /*tooltipOptions*/ 64 && get_spread_object(/*tooltipOptions*/ ctx[6]),
    					dirty & /*width*/ 16 && { width: /*width*/ ctx[4] },
    					dirty & /*height*/ 32 && { height: /*height*/ ctx[5] }
    				])
    			: {};

    			tooltip.$set(tooltip_changes);
    			const legend_1_changes = {};
    			if (dirty & /*scale*/ 1) legend_1_changes.scale = /*scale*/ ctx[0];
    			if (dirty & /*legend*/ 8) legend_1_changes.title = /*legend*/ ctx[3].title;
    			if (dirty & /*width*/ 16) legend_1_changes.mapWidth = /*width*/ ctx[4];
    			if (dirty & /*height*/ 32) legend_1_changes.mapHeight = /*height*/ ctx[5];
    			if (dirty & /*legend*/ 8) legend_1_changes.format = /*legend*/ ctx[3].format;
    			legend_1.$set(legend_1_changes);

    			if (!current || dirty & /*layout*/ 4 && div_class_value !== (div_class_value = "graphic " + /*layout*/ ctx[2] + " svelte-q1j43y")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			transition_in(legend_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			transition_out(legend_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(tooltip);
    			destroy_component(legend_1);
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, []);
    	let { data } = $$props;
    	let { map } = $$props;
    	let { scale } = $$props;
    	let { join } = $$props;
    	let { value } = $$props;
    	let { layout } = $$props;
    	let { legend } = $$props;
    	let { projection } = $$props;
    	let { geo } = $$props;
    	let tooltipOptions, width, height;
    	const land = feature(map, map.objects[geo]);
    	const border = mesh(map, map.objects[geo], (a, b) => a !== b);

    	const writable_props = [
    		"data",
    		"map",
    		"scale",
    		"join",
    		"value",
    		"layout",
    		"legend",
    		"projection",
    		"geo"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	const mousemove_handler = (feature, e) => handleHover(e, feature.properties[join.map]);

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(4, width);
    		$$invalidate(5, height);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(13, data = $$props.data);
    		if ("map" in $$props) $$invalidate(14, map = $$props.map);
    		if ("scale" in $$props) $$invalidate(0, scale = $$props.scale);
    		if ("join" in $$props) $$invalidate(1, join = $$props.join);
    		if ("value" in $$props) $$invalidate(15, value = $$props.value);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    		if ("legend" in $$props) $$invalidate(3, legend = $$props.legend);
    		if ("projection" in $$props) $$invalidate(16, projection = $$props.projection);
    		if ("geo" in $$props) $$invalidate(17, geo = $$props.geo);
    	};

    	$$self.$capture_state = () => ({
    		Tooltip,
    		Legend,
    		feature,
    		mesh,
    		geoPath,
    		data,
    		map,
    		scale,
    		join,
    		value,
    		layout,
    		legend,
    		projection,
    		geo,
    		tooltipOptions,
    		width,
    		height,
    		land,
    		border,
    		_projection,
    		path,
    		fill,
    		handleHover,
    		handleLeave
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(13, data = $$props.data);
    		if ("map" in $$props) $$invalidate(14, map = $$props.map);
    		if ("scale" in $$props) $$invalidate(0, scale = $$props.scale);
    		if ("join" in $$props) $$invalidate(1, join = $$props.join);
    		if ("value" in $$props) $$invalidate(15, value = $$props.value);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    		if ("legend" in $$props) $$invalidate(3, legend = $$props.legend);
    		if ("projection" in $$props) $$invalidate(16, projection = $$props.projection);
    		if ("geo" in $$props) $$invalidate(17, geo = $$props.geo);
    		if ("tooltipOptions" in $$props) $$invalidate(6, tooltipOptions = $$props.tooltipOptions);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("_projection" in $$props) $$invalidate(18, _projection = $$props._projection);
    		if ("path" in $$props) $$invalidate(7, path = $$props.path);
    		if ("fill" in $$props) $$invalidate(8, fill = $$props.fill);
    		if ("handleHover" in $$props) $$invalidate(9, handleHover = $$props.handleHover);
    		if ("handleLeave" in $$props) $$invalidate(10, handleLeave = $$props.handleLeave);
    	};

    	let _projection;
    	let path;
    	let fill;
    	let handleHover;
    	let handleLeave;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*projection, width, height*/ 65584) {
    			 $$invalidate(18, _projection = projection.fitSize([width, height], land));
    		}

    		if ($$self.$$.dirty & /*_projection*/ 262144) {
    			 $$invalidate(7, path = geoPath().projection(_projection));
    		}

    		if ($$self.$$.dirty & /*data, join, scale, value*/ 40963) {
    			 $$invalidate(8, fill = _id => {
    				const d = data.find(d => d[join.data] === _id);
    				return d !== undefined ? scale(d[value]) : "#E0E0E0";
    			});
    		}

    		if ($$self.$$.dirty & /*data, join*/ 8194) {
    			 $$invalidate(9, handleHover = (e, _id) => {
    				let x = e.offsetX;
    				let y = e.offsetY;
    				let visible = true;
    				const d = data.find(d => d[join.data] === _id);
    				const tip = d !== undefined ? "" : "";
    				$$invalidate(6, tooltipOptions = { x, y, tip, visible });
    			});
    		}
    	};

    	 $$invalidate(10, handleLeave = () => {
    		$$invalidate(6, tooltipOptions = {
    			x: -1000,
    			y: -1000,
    			tip: "",
    			visible: false
    		});
    	});

    	return [
    		scale,
    		join,
    		layout,
    		legend,
    		width,
    		height,
    		tooltipOptions,
    		path,
    		fill,
    		handleHover,
    		handleLeave,
    		land,
    		border,
    		data,
    		map,
    		value,
    		projection,
    		geo,
    		_projection,
    		mousemove_handler,
    		div_elementresize_handler
    	];
    }

    class Map$3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			data: 13,
    			map: 14,
    			scale: 0,
    			join: 1,
    			value: 15,
    			layout: 2,
    			legend: 3,
    			projection: 16,
    			geo: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[13] === undefined && !("data" in props)) {
    			console.warn("<Map> was created without expected prop 'data'");
    		}

    		if (/*map*/ ctx[14] === undefined && !("map" in props)) {
    			console.warn("<Map> was created without expected prop 'map'");
    		}

    		if (/*scale*/ ctx[0] === undefined && !("scale" in props)) {
    			console.warn("<Map> was created without expected prop 'scale'");
    		}

    		if (/*join*/ ctx[1] === undefined && !("join" in props)) {
    			console.warn("<Map> was created without expected prop 'join'");
    		}

    		if (/*value*/ ctx[15] === undefined && !("value" in props)) {
    			console.warn("<Map> was created without expected prop 'value'");
    		}

    		if (/*layout*/ ctx[2] === undefined && !("layout" in props)) {
    			console.warn("<Map> was created without expected prop 'layout'");
    		}

    		if (/*legend*/ ctx[3] === undefined && !("legend" in props)) {
    			console.warn("<Map> was created without expected prop 'legend'");
    		}

    		if (/*projection*/ ctx[16] === undefined && !("projection" in props)) {
    			console.warn("<Map> was created without expected prop 'projection'");
    		}

    		if (/*geo*/ ctx[17] === undefined && !("geo" in props)) {
    			console.warn("<Map> was created without expected prop 'geo'");
    		}
    	}

    	get data() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get map() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set map(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get join() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set join(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get legend() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set legend(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projection() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projection(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get geo() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set geo(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var type = "Topology";
    var arcs = [
    	[
    		[
    			29011,
    			7202
    		],
    		[
    			-1,
    			0
    		],
    		[
    			0,
    			2
    		],
    		[
    			1,
    			0
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			21042,
    			5665
    		],
    		[
    			-1,
    			0
    		],
    		[
    			0,
    			0
    		],
    		[
    			1,
    			1
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			6779,
    			10981
    		],
    		[
    			0,
    			-3
    		],
    		[
    			-3,
    			3
    		],
    		[
    			2,
    			3
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			21103,
    			5516
    		],
    		[
    			-4,
    			-2
    		],
    		[
    			-2,
    			7
    		],
    		[
    			2,
    			1
    		],
    		[
    			4,
    			-6
    		]
    	],
    	[
    		[
    			21764,
    			7320
    		],
    		[
    			-1,
    			2
    		],
    		[
    			0,
    			2
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			21330,
    			6402
    		],
    		[
    			-3,
    			-1
    		],
    		[
    			1,
    			3
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			22457,
    			6598
    		],
    		[
    			-1,
    			-1
    		],
    		[
    			-1,
    			2
    		],
    		[
    			1,
    			1
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20514,
    			14495
    		],
    		[
    			26,
    			34
    		]
    	],
    	[
    		[
    			20540,
    			14529
    		],
    		[
    			-8,
    			-12
    		]
    	],
    	[
    		[
    			20532,
    			14517
    		],
    		[
    			-6,
    			-9
    		]
    	],
    	[
    		[
    			20526,
    			14508
    		],
    		[
    			-12,
    			-13
    		]
    	],
    	[
    		[
    			20640,
    			14678
    		],
    		[
    			-7,
    			-150
    		]
    	],
    	[
    		[
    			20633,
    			14528
    		],
    		[
    			-34,
    			37
    		]
    	],
    	[
    		[
    			20599,
    			14565
    		],
    		[
    			3,
    			3
    		]
    	],
    	[
    		[
    			20602,
    			14568
    		],
    		[
    			5,
    			3
    		]
    	],
    	[
    		[
    			20607,
    			14571
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20607,
    			14570
    		],
    		[
    			3,
    			2
    		]
    	],
    	[
    		[
    			20610,
    			14572
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20610,
    			14573
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			20608,
    			14576
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20609,
    			14577
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20609,
    			14578
    		],
    		[
    			-1,
    			3
    		]
    	],
    	[
    		[
    			20608,
    			14581
    		],
    		[
    			-6,
    			1
    		]
    	],
    	[
    		[
    			20602,
    			14582
    		],
    		[
    			-3,
    			3
    		]
    	],
    	[
    		[
    			20599,
    			14585
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20598,
    			14585
    		],
    		[
    			-6,
    			4
    		]
    	],
    	[
    		[
    			20592,
    			14589
    		],
    		[
    			-8,
    			-4
    		]
    	],
    	[
    		[
    			20584,
    			14585
    		],
    		[
    			3,
    			4
    		]
    	],
    	[
    		[
    			20587,
    			14589
    		],
    		[
    			4,
    			3
    		]
    	],
    	[
    		[
    			20591,
    			14592
    		],
    		[
    			-1,
    			9
    		]
    	],
    	[
    		[
    			20590,
    			14601
    		],
    		[
    			-4,
    			6
    		]
    	],
    	[
    		[
    			20586,
    			14607
    		],
    		[
    			2,
    			63
    		],
    		[
    			20,
    			36
    		],
    		[
    			32,
    			-28
    		]
    	],
    	[
    		[
    			20590,
    			14601
    		],
    		[
    			1,
    			-9
    		]
    	],
    	[
    		[
    			20591,
    			14592
    		],
    		[
    			-4,
    			-3
    		]
    	],
    	[
    		[
    			20587,
    			14589
    		],
    		[
    			-3,
    			-4
    		]
    	],
    	[
    		[
    			20584,
    			14585
    		],
    		[
    			8,
    			4
    		]
    	],
    	[
    		[
    			20592,
    			14589
    		],
    		[
    			6,
    			-4
    		]
    	],
    	[
    		[
    			20599,
    			14585
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			20602,
    			14582
    		],
    		[
    			6,
    			-1
    		]
    	],
    	[
    		[
    			20608,
    			14581
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			20609,
    			14577
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			20608,
    			14576
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			20610,
    			14572
    		],
    		[
    			-3,
    			-2
    		]
    	],
    	[
    		[
    			20607,
    			14571
    		],
    		[
    			-5,
    			-3
    		]
    	],
    	[
    		[
    			20599,
    			14565
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			20599,
    			14571
    		],
    		[
    			8,
    			1
    		]
    	],
    	[
    		[
    			20607,
    			14572
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20608,
    			14570
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			20608,
    			14576
    		],
    		[
    			-17,
    			11
    		]
    	],
    	[
    		[
    			20591,
    			14587
    		],
    		[
    			-1,
    			14
    		]
    	],
    	[
    		[
    			15592,
    			14758
    		],
    		[
    			24,
    			-5
    		],
    		[
    			-2,
    			-34
    		],
    		[
    			-26,
    			17
    		],
    		[
    			4,
    			22
    		]
    	],
    	[
    		[
    			24795,
    			14844
    		],
    		[
    			-24,
    			51
    		],
    		[
    			27,
    			107
    		],
    		[
    			-67,
    			50
    		],
    		[
    			-34,
    			146
    		]
    	],
    	[
    		[
    			24697,
    			15198
    		],
    		[
    			75,
    			71
    		],
    		[
    			69,
    			10
    		],
    		[
    			27,
    			-53
    		],
    		[
    			61,
    			-37
    		],
    		[
    			-17,
    			-99
    		],
    		[
    			-40,
    			-50
    		],
    		[
    			-34,
    			-92
    		],
    		[
    			-47,
    			-8
    		],
    		[
    			14,
    			-56
    		],
    		[
    			-10,
    			-40
    		]
    	],
    	[
    		[
    			26557,
    			13978
    		],
    		[
    			-28,
    			-77
    		]
    	],
    	[
    		[
    			26529,
    			13901
    		],
    		[
    			-75,
    			82
    		],
    		[
    			-38,
    			11
    		],
    		[
    			-48,
    			-31
    		],
    		[
    			-9,
    			-29
    		],
    		[
    			-73,
    			-57
    		],
    		[
    			-23,
    			-3
    		],
    		[
    			-68,
    			-107
    		],
    		[
    			-44,
    			-10
    		],
    		[
    			-43,
    			12
    		],
    		[
    			-53,
    			-16
    		]
    	],
    	[
    		[
    			26055,
    			13753
    		],
    		[
    			-9,
    			103
    		],
    		[
    			-37,
    			6
    		],
    		[
    			1,
    			41
    		]
    	],
    	[
    		[
    			26010,
    			13903
    		],
    		[
    			35,
    			-5
    		],
    		[
    			67,
    			37
    		],
    		[
    			-1,
    			29
    		],
    		[
    			52,
    			41
    		],
    		[
    			11,
    			50
    		],
    		[
    			38,
    			5
    		],
    		[
    			51,
    			73
    		],
    		[
    			39,
    			30
    		],
    		[
    			43,
    			-37
    		],
    		[
    			36,
    			8
    		],
    		[
    			57,
    			52
    		],
    		[
    			49,
    			-112
    		],
    		[
    			-27,
    			-42
    		],
    		[
    			97,
    			-54
    		]
    	],
    	[
    		[
    			24841,
    			14456
    		],
    		[
    			-40,
    			-2
    		],
    		[
    			-12,
    			38
    		]
    	],
    	[
    		[
    			24789,
    			14492
    		],
    		[
    			18,
    			30
    		],
    		[
    			34,
    			-66
    		]
    	],
    	[
    		[
    			24824,
    			14701
    		],
    		[
    			-10,
    			111
    		]
    	],
    	[
    		[
    			24814,
    			14812
    		],
    		[
    			38,
    			-97
    		],
    		[
    			-28,
    			-14
    		]
    	],
    	[
    		[
    			20635,
    			10031
    		],
    		[
    			-108,
    			0
    		]
    	],
    	[
    		[
    			20527,
    			10031
    		],
    		[
    			12,
    			19
    		],
    		[
    			75,
    			46
    		],
    		[
    			21,
    			-65
    		]
    	],
    	[
    		[
    			24795,
    			14844
    		],
    		[
    			19,
    			-32
    		]
    	],
    	[
    		[
    			24824,
    			14701
    		],
    		[
    			-27,
    			-32
    		],
    		[
    			-27,
    			59
    		],
    		[
    			-28,
    			-28
    		]
    	],
    	[
    		[
    			24742,
    			14700
    		],
    		[
    			-36,
    			17
    		],
    		[
    			-24,
    			60
    		],
    		[
    			-30,
    			-26
    		],
    		[
    			-60,
    			54
    		],
    		[
    			-33,
    			4
    		],
    		[
    			-45,
    			-47
    		],
    		[
    			-18,
    			-66
    		],
    		[
    			-47,
    			-28
    		]
    	],
    	[
    		[
    			24449,
    			14668
    		],
    		[
    			-61,
    			26
    		],
    		[
    			-16,
    			43
    		],
    		[
    			-86,
    			60
    		],
    		[
    			-5,
    			133
    		],
    		[
    			-17,
    			80
    		],
    		[
    			65,
    			109
    		],
    		[
    			-34,
    			35
    		],
    		[
    			5,
    			49
    		],
    		[
    			-46,
    			14
    		],
    		[
    			-17,
    			37
    		],
    		[
    			-58,
    			14
    		],
    		[
    			5,
    			56
    		],
    		[
    			103,
    			110
    		]
    	],
    	[
    		[
    			24287,
    			15434
    		],
    		[
    			46,
    			-11
    		],
    		[
    			42,
    			32
    		]
    	],
    	[
    		[
    			24375,
    			15455
    		],
    		[
    			81,
    			-12
    		],
    		[
    			58,
    			-81
    		],
    		[
    			14,
    			-108
    		],
    		[
    			118,
    			-60
    		],
    		[
    			51,
    			4
    		]
    	],
    	[
    		[
    			31480,
    			16881
    		],
    		[
    			12,
    			-27
    		],
    		[
    			-155,
    			-87
    		],
    		[
    			45,
    			54
    		],
    		[
    			57,
    			15
    		],
    		[
    			41,
    			45
    		]
    	],
    	[
    		[
    			27884,
    			11898
    		],
    		[
    			-2,
    			0
    		],
    		[
    			1,
    			2
    		],
    		[
    			1,
    			0
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			28516,
    			11783
    		],
    		[
    			-1,
    			1
    		],
    		[
    			2,
    			1
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			29065,
    			13570
    		],
    		[
    			-1,
    			0
    		],
    		[
    			-1,
    			-1
    		],
    		[
    			0,
    			2
    		],
    		[
    			1,
    			1
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			28326,
    			11053
    		],
    		[
    			-1,
    			-1
    		],
    		[
    			0,
    			2
    		],
    		[
    			1,
    			0
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			17029,
    			17503
    		],
    		[
    			12,
    			-5
    		],
    		[
    			0,
    			-10
    		],
    		[
    			-19,
    			9
    		],
    		[
    			7,
    			6
    		]
    	],
    	[
    		[
    			322,
    			9391
    		],
    		[
    			-1,
    			1
    		],
    		[
    			0,
    			1
    		],
    		[
    			1,
    			0
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			1914,
    			9192
    		],
    		[
    			-2,
    			1
    		],
    		[
    			1,
    			3
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			1648,
    			10362
    		],
    		[
    			20,
    			-15
    		],
    		[
    			18,
    			-20
    		],
    		[
    			-6,
    			0
    		],
    		[
    			-11,
    			14
    		],
    		[
    			-9,
    			6
    		],
    		[
    			-12,
    			15
    		]
    	],
    	[
    		[
    			11142,
    			11885
    		],
    		[
    			0,
    			1
    		],
    		[
    			0,
    			-2
    		],
    		[
    			0,
    			0
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			10545,
    			11339
    		],
    		[
    			-7,
    			-1
    		],
    		[
    			-11,
    			19
    		],
    		[
    			6,
    			3
    		],
    		[
    			12,
    			-21
    		]
    	],
    	[
    		[
    			24406,
    			15489
    		],
    		[
    			-31,
    			-34
    		]
    	],
    	[
    		[
    			24287,
    			15434
    		],
    		[
    			-101,
    			-11
    		],
    		[
    			-89,
    			-59
    		],
    		[
    			-44,
    			-72
    		],
    		[
    			22,
    			-28
    		],
    		[
    			22,
    			-75
    		],
    		[
    			-14,
    			-78
    		],
    		[
    			-40,
    			-50
    		],
    		[
    			-1,
    			-102
    		],
    		[
    			-56,
    			-21
    		],
    		[
    			-48,
    			18
    		],
    		[
    			31,
    			-116
    		],
    		[
    			-43,
    			-43
    		],
    		[
    			-29,
    			0
    		],
    		[
    			-11,
    			-74
    		],
    		[
    			-21,
    			-33
    		],
    		[
    			9,
    			-89
    		],
    		[
    			-45,
    			-56
    		],
    		[
    			-27,
    			40
    		],
    		[
    			-95,
    			-59
    		],
    		[
    			-30,
    			-47
    		],
    		[
    			-22,
    			19
    		],
    		[
    			-62,
    			-62
    		],
    		[
    			-14,
    			-183
    		],
    		[
    			-113,
    			-53
    		],
    		[
    			-47,
    			9
    		],
    		[
    			-51,
    			-30
    		],
    		[
    			-45,
    			14
    		],
    		[
    			-106,
    			-17
    		],
    		[
    			-153,
    			79
    		]
    	],
    	[
    		[
    			23064,
    			14255
    		],
    		[
    			86,
    			159
    		],
    		[
    			-6,
    			95
    		],
    		[
    			-81,
    			18
    		],
    		[
    			2,
    			119
    		],
    		[
    			-28,
    			156
    		],
    		[
    			7,
    			68
    		],
    		[
    			-18,
    			92
    		],
    		[
    			26,
    			74
    		],
    		[
    			23,
    			16
    		],
    		[
    			28,
    			165
    		]
    	],
    	[
    		[
    			23103,
    			15217
    		],
    		[
    			30,
    			-29
    		],
    		[
    			45,
    			0
    		],
    		[
    			56,
    			-35
    		],
    		[
    			44,
    			34
    		],
    		[
    			4,
    			55
    		],
    		[
    			124,
    			82
    		],
    		[
    			34,
    			113
    		],
    		[
    			32,
    			54
    		],
    		[
    			38,
    			-1
    		],
    		[
    			16,
    			49
    		],
    		[
    			60,
    			-35
    		],
    		[
    			22,
    			6
    		]
    	],
    	[
    		[
    			23608,
    			15510
    		],
    		[
    			48,
    			3
    		],
    		[
    			20,
    			-32
    		],
    		[
    			50,
    			-1
    		]
    	],
    	[
    		[
    			23726,
    			15480
    		],
    		[
    			23,
    			-43
    		],
    		[
    			89,
    			68
    		],
    		[
    			29,
    			-39
    		],
    		[
    			27,
    			83
    		],
    		[
    			55,
    			-11
    		],
    		[
    			6,
    			65
    		],
    		[
    			48,
    			83
    		],
    		[
    			30,
    			14
    		],
    		[
    			37,
    			-40
    		],
    		[
    			-12,
    			-55
    		],
    		[
    			33,
    			-21
    		],
    		[
    			-16,
    			-124
    		],
    		[
    			39,
    			-63
    		],
    		[
    			140,
    			131
    		],
    		[
    			144,
    			-18
    		],
    		[
    			8,
    			-21
    		]
    	],
    	[
    		[
    			19533,
    			7435
    		],
    		[
    			9,
    			-87
    		],
    		[
    			-10,
    			-40
    		],
    		[
    			9,
    			-119
    		],
    		[
    			-18,
    			-81
    		],
    		[
    			15,
    			-26
    		],
    		[
    			-196,
    			0
    		],
    		[
    			0,
    			-535
    		],
    		[
    			16,
    			-54
    		],
    		[
    			93,
    			-159
    		],
    		[
    			28,
    			-28
    		]
    	],
    	[
    		[
    			19479,
    			6306
    		],
    		[
    			-192,
    			-65
    		],
    		[
    			-19,
    			15
    		],
    		[
    			-41,
    			-18
    		],
    		[
    			-45,
    			30
    		],
    		[
    			-54,
    			-8
    		],
    		[
    			-83,
    			16
    		],
    		[
    			-46,
    			71
    		],
    		[
    			-402,
    			0
    		],
    		[
    			-29,
    			2
    		],
    		[
    			-43,
    			61
    		],
    		[
    			-46,
    			5
    		],
    		[
    			-35,
    			-37
    		],
    		[
    			-52,
    			11
    		],
    		[
    			-31,
    			-19
    		]
    	],
    	[
    		[
    			18361,
    			6370
    		],
    		[
    			7,
    			93
    		],
    		[
    			-9,
    			136
    		],
    		[
    			27,
    			52
    		],
    		[
    			4,
    			57
    		],
    		[
    			22,
    			80
    		],
    		[
    			8,
    			116
    		],
    		[
    			14,
    			31
    		],
    		[
    			1,
    			73
    		],
    		[
    			33,
    			56
    		],
    		[
    			6,
    			41
    		],
    		[
    			39,
    			42
    		],
    		[
    			30,
    			62
    		],
    		[
    			13,
    			72
    		],
    		[
    			7,
    			134
    		],
    		[
    			-8,
    			57
    		],
    		[
    			-24,
    			47
    		],
    		[
    			-31,
    			113
    		],
    		[
    			-20,
    			104
    		],
    		[
    			40,
    			65
    		],
    		[
    			-2,
    			50
    		],
    		[
    			-52,
    			190
    		],
    		[
    			-3,
    			49
    		],
    		[
    			-52,
    			139
    		],
    		[
    			66,
    			40
    		]
    	],
    	[
    		[
    			18477,
    			8269
    		],
    		[
    			96,
    			12
    		],
    		[
    			60,
    			-12
    		],
    		[
    			46,
    			7
    		],
    		[
    			136,
    			3
    		],
    		[
    			22,
    			-54
    		],
    		[
    			-5,
    			-36
    		],
    		[
    			38,
    			-160
    		],
    		[
    			46,
    			-131
    		],
    		[
    			62,
    			20
    		],
    		[
    			113,
    			0
    		],
    		[
    			16,
    			92
    		],
    		[
    			0,
    			76
    		],
    		[
    			73,
    			0
    		],
    		[
    			24,
    			-48
    		],
    		[
    			118,
    			0
    		],
    		[
    			6,
    			-46
    		],
    		[
    			-10,
    			-64
    		],
    		[
    			19,
    			-83
    		],
    		[
    			-15,
    			-164
    		],
    		[
    			38,
    			-84
    		],
    		[
    			14,
    			-78
    		],
    		[
    			-15,
    			-78
    		],
    		[
    			32,
    			-32
    		],
    		[
    			66,
    			-10
    		],
    		[
    			21,
    			26
    		],
    		[
    			43,
    			-12
    		],
    		[
    			12,
    			22
    		]
    	],
    	[
    		[
    			18490,
    			8473
    		],
    		[
    			-26,
    			-16
    		],
    		[
    			-28,
    			-67
    		],
    		[
    			0,
    			-93
    		],
    		[
    			-32,
    			-4
    		]
    	],
    	[
    		[
    			18404,
    			8293
    		],
    		[
    			2,
    			53
    		],
    		[
    			-23,
    			74
    		]
    	],
    	[
    		[
    			18383,
    			8420
    		],
    		[
    			39,
    			66
    		],
    		[
    			42,
    			32
    		],
    		[
    			26,
    			-45
    		]
    	],
    	[
    		[
    			11206,
    			12315
    		],
    		[
    			-2,
    			-6
    		],
    		[
    			-11,
    			-9
    		],
    		[
    			7,
    			14
    		],
    		[
    			6,
    			1
    		]
    	],
    	[
    		[
    			19158,
    			16380
    		],
    		[
    			43,
    			-58
    		],
    		[
    			6,
    			-56
    		]
    	],
    	[
    		[
    			19207,
    			16266
    		],
    		[
    			-7,
    			-108
    		],
    		[
    			44,
    			-63
    		]
    	],
    	[
    		[
    			19244,
    			16095
    		],
    		[
    			-28,
    			-126
    		],
    		[
    			-64,
    			-68
    		]
    	],
    	[
    		[
    			19152,
    			15901
    		],
    		[
    			-15,
    			59
    		],
    		[
    			-40,
    			31
    		],
    		[
    			-13,
    			72
    		],
    		[
    			21,
    			100
    		],
    		[
    			7,
    			92
    		],
    		[
    			-22,
    			7
    		]
    	],
    	[
    		[
    			19090,
    			16262
    		],
    		[
    			-8,
    			55
    		],
    		[
    			32,
    			60
    		],
    		[
    			44,
    			3
    		]
    	],
    	[
    		[
    			17401,
    			16371
    		],
    		[
    			-26,
    			-9
    		],
    		[
    			-1,
    			26
    		]
    	],
    	[
    		[
    			17374,
    			16388
    		],
    		[
    			27,
    			-17
    		]
    	],
    	[
    		[
    			10624,
    			11310
    		],
    		[
    			19,
    			-16
    		],
    		[
    			4,
    			-22
    		],
    		[
    			-24,
    			23
    		],
    		[
    			1,
    			15
    		]
    	],
    	[
    		[
    			22623,
    			13546
    		],
    		[
    			10,
    			-108
    		]
    	],
    	[
    		[
    			22633,
    			13438
    		],
    		[
    			-58,
    			-75
    		],
    		[
    			24,
    			-78
    		],
    		[
    			-51,
    			-21
    		],
    		[
    			9,
    			-52
    		],
    		[
    			-33,
    			-87
    		],
    		[
    			-2,
    			-67
    		]
    	],
    	[
    		[
    			22522,
    			13058
    		],
    		[
    			-7,
    			-13
    		],
    		[
    			-245,
    			51
    		],
    		[
    			-95,
    			199
    		],
    		[
    			0,
    			20
    		]
    	],
    	[
    		[
    			22175,
    			13315
    		],
    		[
    			21,
    			-40
    		],
    		[
    			39,
    			-7
    		],
    		[
    			34,
    			27
    		],
    		[
    			83,
    			0
    		],
    		[
    			36,
    			-12
    		],
    		[
    			52,
    			29
    		],
    		[
    			30,
    			89
    		],
    		[
    			37,
    			41
    		],
    		[
    			46,
    			89
    		],
    		[
    			40,
    			45
    		],
    		[
    			12,
    			41
    		]
    	],
    	[
    		[
    			22605,
    			13617
    		],
    		[
    			18,
    			-71
    		]
    	],
    	[
    		[
    			10666,
    			69
    		],
    		[
    			0,
    			374
    		]
    	],
    	[
    		[
    			10666,
    			443
    		],
    		[
    			34,
    			-56
    		],
    		[
    			22,
    			-92
    		],
    		[
    			71,
    			-89
    		],
    		[
    			71,
    			-56
    		],
    		[
    			81,
    			-43
    		],
    		[
    			-5,
    			-37
    		],
    		[
    			-64,
    			-28
    		],
    		[
    			-36,
    			19
    		],
    		[
    			-138,
    			20
    		],
    		[
    			-36,
    			-12
    		]
    	],
    	[
    		[
    			11237,
    			5533
    		],
    		[
    			40,
    			-49
    		],
    		[
    			23,
    			-80
    		],
    		[
    			94,
    			-129
    		],
    		[
    			66,
    			-43
    		],
    		[
    			27,
    			8
    		],
    		[
    			65,
    			-80
    		],
    		[
    			65,
    			-59
    		],
    		[
    			78,
    			-42
    		],
    		[
    			29,
    			-60
    		],
    		[
    			-50,
    			-112
    		],
    		[
    			-16,
    			-105
    		],
    		[
    			-38,
    			-65
    		],
    		[
    			4,
    			-28
    		],
    		[
    			68,
    			4
    		],
    		[
    			110,
    			-38
    		],
    		[
    			63,
    			32
    		],
    		[
    			34,
    			-23
    		],
    		[
    			34,
    			80
    		],
    		[
    			64,
    			87
    		],
    		[
    			11,
    			143
    		]
    	],
    	[
    		[
    			12008,
    			4974
    		],
    		[
    			70,
    			-11
    		],
    		[
    			3,
    			-53
    		],
    		[
    			23,
    			-49
    		],
    		[
    			-13,
    			-40
    		],
    		[
    			4,
    			-69
    		],
    		[
    			-57,
    			-89
    		],
    		[
    			-60,
    			-32
    		],
    		[
    			-82,
    			-100
    		],
    		[
    			-12,
    			-40
    		],
    		[
    			-39,
    			-54
    		],
    		[
    			-13,
    			-47
    		],
    		[
    			-86,
    			-149
    		],
    		[
    			-28,
    			-34
    		]
    	],
    	[
    		[
    			11718,
    			4207
    		],
    		[
    			-26,
    			-56
    		],
    		[
    			8,
    			-70
    		],
    		[
    			-17,
    			-113
    		],
    		[
    			-20,
    			-45
    		],
    		[
    			6,
    			-193
    		]
    	],
    	[
    		[
    			11669,
    			3730
    		],
    		[
    			-27,
    			-9
    		],
    		[
    			-13,
    			-108
    		],
    		[
    			17,
    			-56
    		],
    		[
    			-15,
    			-64
    		],
    		[
    			33,
    			-51
    		],
    		[
    			69,
    			-52
    		],
    		[
    			32,
    			-56
    		],
    		[
    			-24,
    			-72
    		],
    		[
    			12,
    			-57
    		],
    		[
    			54,
    			-47
    		],
    		[
    			2,
    			-76
    		],
    		[
    			-42,
    			-100
    		],
    		[
    			-35,
    			-54
    		],
    		[
    			-7,
    			-49
    		],
    		[
    			-62,
    			-56
    		],
    		[
    			-152,
    			-65
    		],
    		[
    			-169,
    			-30
    		],
    		[
    			-79,
    			34
    		],
    		[
    			11,
    			-78
    		],
    		[
    			24,
    			-15
    		],
    		[
    			-10,
    			-81
    		],
    		[
    			-21,
    			-12
    		],
    		[
    			-15,
    			-70
    		],
    		[
    			30,
    			-44
    		],
    		[
    			-15,
    			-47
    		],
    		[
    			-73,
    			-46
    		],
    		[
    			-66,
    			-1
    		],
    		[
    			-110,
    			70
    		],
    		[
    			-23,
    			-40
    		],
    		[
    			16,
    			-92
    		],
    		[
    			-8,
    			-74
    		],
    		[
    			58,
    			-44
    		],
    		[
    			71,
    			26
    		],
    		[
    			13,
    			-44
    		],
    		[
    			-3,
    			-71
    		],
    		[
    			-49,
    			-17
    		],
    		[
    			-40,
    			63
    		],
    		[
    			-38,
    			-49
    		],
    		[
    			61,
    			-36
    		],
    		[
    			-54,
    			-34
    		],
    		[
    			-42,
    			-74
    		],
    		[
    			11,
    			-121
    		],
    		[
    			-41,
    			-50
    		],
    		[
    			0,
    			-64
    		],
    		[
    			-53,
    			11
    		],
    		[
    			-82,
    			-59
    		],
    		[
    			-54,
    			-122
    		],
    		[
    			19,
    			-82
    		],
    		[
    			65,
    			-80
    		],
    		[
    			74,
    			-7
    		],
    		[
    			22,
    			-73
    		],
    		[
    			-21,
    			-75
    		],
    		[
    			-51,
    			-76
    		],
    		[
    			-60,
    			-42
    		],
    		[
    			-49,
    			-75
    		],
    		[
    			-15,
    			-131
    		],
    		[
    			-104,
    			-74
    		],
    		[
    			-28,
    			-109
    		],
    		[
    			15,
    			-104
    		],
    		[
    			61,
    			-117
    		],
    		[
    			-6,
    			-15
    		]
    	],
    	[
    		[
    			10683,
    			487
    		],
    		[
    			-73,
    			41
    		],
    		[
    			-78,
    			25
    		],
    		[
    			-181,
    			-2
    		],
    		[
    			-50,
    			81
    		],
    		[
    			15,
    			50
    		],
    		[
    			-1,
    			96
    		],
    		[
    			-69,
    			-14
    		],
    		[
    			-56,
    			81
    		],
    		[
    			12,
    			87
    		],
    		[
    			-4,
    			94
    		],
    		[
    			27,
    			3
    		],
    		[
    			64,
    			62
    		],
    		[
    			-4,
    			54
    		],
    		[
    			28,
    			20
    		],
    		[
    			-20,
    			68
    		],
    		[
    			34,
    			89
    		],
    		[
    			28,
    			30
    		],
    		[
    			-7,
    			71
    		],
    		[
    			27,
    			21
    		],
    		[
    			-11,
    			76
    		],
    		[
    			16,
    			44
    		],
    		[
    			-13,
    			70
    		],
    		[
    			42,
    			41
    		],
    		[
    			-26,
    			54
    		],
    		[
    			30,
    			32
    		],
    		[
    			4,
    			61
    		],
    		[
    			-55,
    			3
    		],
    		[
    			9,
    			130
    		],
    		[
    			-23,
    			30
    		],
    		[
    			18,
    			47
    		],
    		[
    			-35,
    			43
    		],
    		[
    			-2,
    			101
    		],
    		[
    			38,
    			32
    		],
    		[
    			-15,
    			83
    		],
    		[
    			10,
    			258
    		],
    		[
    			7,
    			73
    		],
    		[
    			21,
    			5
    		],
    		[
    			7,
    			116
    		],
    		[
    			56,
    			61
    		],
    		[
    			-35,
    			147
    		],
    		[
    			8,
    			33
    		],
    		[
    			0,
    			137
    		],
    		[
    			76,
    			143
    		],
    		[
    			-11,
    			81
    		],
    		[
    			12,
    			93
    		],
    		[
    			48,
    			91
    		],
    		[
    			-8,
    			71
    		],
    		[
    			14,
    			63
    		],
    		[
    			-33,
    			64
    		],
    		[
    			-5,
    			93
    		],
    		[
    			-17,
    			39
    		],
    		[
    			11,
    			48
    		],
    		[
    			-33,
    			68
    		],
    		[
    			4,
    			67
    		],
    		[
    			40,
    			130
    		],
    		[
    			15,
    			2
    		],
    		[
    			5,
    			116
    		],
    		[
    			-12,
    			54
    		],
    		[
    			20,
    			34
    		],
    		[
    			15,
    			130
    		],
    		[
    			51,
    			81
    		],
    		[
    			10,
    			66
    		],
    		[
    			31,
    			69
    		],
    		[
    			36,
    			32
    		],
    		[
    			-27,
    			65
    		],
    		[
    			19,
    			53
    		],
    		[
    			-17,
    			90
    		],
    		[
    			-2,
    			73
    		],
    		[
    			23,
    			20
    		],
    		[
    			-21,
    			58
    		],
    		[
    			19,
    			47
    		],
    		[
    			98,
    			72
    		],
    		[
    			34,
    			175
    		],
    		[
    			-18,
    			32
    		]
    	],
    	[
    		[
    			10803,
    			5441
    		],
    		[
    			42,
    			95
    		],
    		[
    			43,
    			25
    		],
    		[
    			5,
    			49
    		],
    		[
    			41,
    			-47
    		],
    		[
    			79,
    			-2
    		],
    		[
    			35,
    			-20
    		],
    		[
    			37,
    			-58
    		],
    		[
    			29,
    			92
    		],
    		[
    			107,
    			0
    		],
    		[
    			16,
    			-42
    		]
    	],
    	[
    		[
    			21692,
    			15764
    		],
    		[
    			-39,
    			-5
    		]
    	],
    	[
    		[
    			21653,
    			15759
    		],
    		[
    			-13,
    			76
    		],
    		[
    			-28,
    			51
    		],
    		[
    			-24,
    			-16
    		],
    		[
    			-36,
    			46
    		],
    		[
    			-29,
    			-12
    		]
    	],
    	[
    		[
    			21523,
    			15904
    		],
    		[
    			-49,
    			56
    		],
    		[
    			-58,
    			11
    		],
    		[
    			-10,
    			63
    		],
    		[
    			19,
    			42
    		],
    		[
    			-27,
    			65
    		]
    	],
    	[
    		[
    			21398,
    			16141
    		],
    		[
    			128,
    			16
    		],
    		[
    			19,
    			13
    		]
    	],
    	[
    		[
    			21545,
    			16170
    		],
    		[
    			54,
    			-80
    		],
    		[
    			-20,
    			-26
    		],
    		[
    			59,
    			-76
    		],
    		[
    			-14,
    			-63
    		],
    		[
    			59,
    			-44
    		],
    		[
    			9,
    			-117
    		]
    	],
    	[
    		[
    			893,
    			6872
    		],
    		[
    			6,
    			-4
    		],
    		[
    			-10,
    			-9
    		],
    		[
    			-3,
    			-7
    		],
    		[
    			-5,
    			5
    		],
    		[
    			12,
    			15
    		]
    	],
    	[
    		[
    			23849,
    			1110
    		],
    		[
    			12,
    			-74
    		],
    		[
    			64,
    			-24
    		],
    		[
    			44,
    			35
    		],
    		[
    			12,
    			-55
    		],
    		[
    			-60,
    			-5
    		],
    		[
    			-101,
    			-32
    		],
    		[
    			2,
    			126
    		],
    		[
    			27,
    			29
    		]
    	],
    	[
    		[
    			11315,
    			12132
    		],
    		[
    			15,
    			-22
    		],
    		[
    			-15,
    			-7
    		],
    		[
    			0,
    			29
    		]
    	],
    	[
    		[
    			31093,
    			2453
    		],
    		[
    			74,
    			-34
    		],
    		[
    			87,
    			-53
    		],
    		[
    			95,
    			27
    		],
    		[
    			65,
    			40
    		],
    		[
    			24,
    			-37
    		],
    		[
    			-1,
    			-106
    		],
    		[
    			-23,
    			-82
    		],
    		[
    			-13,
    			-103
    		],
    		[
    			-55,
    			-30
    		],
    		[
    			-48,
    			-121
    		],
    		[
    			-61,
    			25
    		],
    		[
    			-70,
    			84
    		],
    		[
    			-29,
    			110
    		],
    		[
    			0,
    			62
    		],
    		[
    			-26,
    			46
    		],
    		[
    			-30,
    			125
    		],
    		[
    			11,
    			47
    		]
    	],
    	[
    		[
    			30414,
    			3304
    		],
    		[
    			10,
    			-48
    		],
    		[
    			-94,
    			-33
    		],
    		[
    			-16,
    			50
    		],
    		[
    			100,
    			31
    		]
    	],
    	[
    		[
    			29722,
    			7389
    		],
    		[
    			29,
    			-37
    		],
    		[
    			55,
    			33
    		],
    		[
    			17,
    			-67
    		],
    		[
    			-46,
    			-59
    		],
    		[
    			-47,
    			48
    		],
    		[
    			-8,
    			82
    		]
    	],
    	[
    		[
    			30884,
    			7467
    		],
    		[
    			24,
    			-64
    		],
    		[
    			6,
    			-129
    		],
    		[
    			32,
    			-24
    		],
    		[
    			9,
    			-69
    		],
    		[
    			21,
    			-76
    		],
    		[
    			5,
    			-158
    		],
    		[
    			18,
    			-87
    		],
    		[
    			33,
    			-21
    		],
    		[
    			42,
    			46
    		],
    		[
    			16,
    			-64
    		],
    		[
    			63,
    			-71
    		],
    		[
    			-10,
    			-74
    		],
    		[
    			21,
    			-103
    		],
    		[
    			-4,
    			-73
    		],
    		[
    			51,
    			-111
    		],
    		[
    			18,
    			-86
    		],
    		[
    			-11,
    			-102
    		],
    		[
    			29,
    			-45
    		],
    		[
    			-4,
    			-62
    		],
    		[
    			57,
    			-68
    		],
    		[
    			56,
    			-22
    		],
    		[
    			19,
    			-65
    		],
    		[
    			49,
    			-21
    		],
    		[
    			60,
    			-62
    		],
    		[
    			-14,
    			-44
    		],
    		[
    			19,
    			-48
    		],
    		[
    			29,
    			-23
    		],
    		[
    			26,
    			-106
    		],
    		[
    			13,
    			-99
    		],
    		[
    			27,
    			-30
    		],
    		[
    			20,
    			46
    		],
    		[
    			37,
    			-64
    		],
    		[
    			37,
    			-27
    		],
    		[
    			-8,
    			-76
    		],
    		[
    			14,
    			-84
    		],
    		[
    			60,
    			-69
    		],
    		[
    			40,
    			-31
    		],
    		[
    			22,
    			-69
    		],
    		[
    			29,
    			-29
    		],
    		[
    			18,
    			-71
    		],
    		[
    			24,
    			-8
    		],
    		[
    			1,
    			-72
    		],
    		[
    			21,
    			-38
    		],
    		[
    			-7,
    			-65
    		],
    		[
    			7,
    			-75
    		],
    		[
    			-10,
    			-66
    		],
    		[
    			26,
    			-65
    		],
    		[
    			24,
    			-104
    		],
    		[
    			5,
    			-110
    		],
    		[
    			-24,
    			-102
    		],
    		[
    			-15,
    			-118
    		],
    		[
    			-18,
    			-71
    		],
    		[
    			8,
    			-57
    		],
    		[
    			-15,
    			-93
    		],
    		[
    			-42,
    			-109
    		],
    		[
    			4,
    			-52
    		],
    		[
    			-95,
    			-103
    		],
    		[
    			-24,
    			-83
    		],
    		[
    			-3,
    			-69
    		],
    		[
    			-33,
    			-60
    		],
    		[
    			-22,
    			-133
    		],
    		[
    			-15,
    			-16
    		],
    		[
    			-37,
    			-112
    		],
    		[
    			-1,
    			-70
    		],
    		[
    			-23,
    			-99
    		],
    		[
    			6,
    			-103
    		],
    		[
    			-45,
    			-43
    		],
    		[
    			-117,
    			-8
    		],
    		[
    			-52,
    			-17
    		],
    		[
    			-76,
    			-114
    		],
    		[
    			-66,
    			-15
    		],
    		[
    			-79,
    			30
    		],
    		[
    			-47,
    			111
    		],
    		[
    			-55,
    			-50
    		],
    		[
    			-81,
    			-119
    		],
    		[
    			-110,
    			84
    		],
    		[
    			-63,
    			16
    		],
    		[
    			-28,
    			-18
    		],
    		[
    			-40,
    			51
    		],
    		[
    			-60,
    			27
    		],
    		[
    			-59,
    			118
    		],
    		[
    			5,
    			114
    		],
    		[
    			-43,
    			106
    		],
    		[
    			-42,
    			52
    		],
    		[
    			-38,
    			-13
    		],
    		[
    			-8,
    			50
    		],
    		[
    			10,
    			98
    		],
    		[
    			-27,
    			47
    		],
    		[
    			-33,
    			8
    		],
    		[
    			-27,
    			-123
    		],
    		[
    			-78,
    			-13
    		],
    		[
    			15,
    			50
    		],
    		[
    			46,
    			6
    		],
    		[
    			14,
    			172
    		],
    		[
    			33,
    			62
    		],
    		[
    			-15,
    			100
    		],
    		[
    			-32,
    			-36
    		],
    		[
    			-23,
    			-90
    		],
    		[
    			-82,
    			-68
    		],
    		[
    			-62,
    			-133
    		],
    		[
    			-28,
    			26
    		],
    		[
    			-16,
    			122
    		],
    		[
    			-24,
    			43
    		],
    		[
    			-28,
    			92
    		],
    		[
    			-38,
    			-2
    		],
    		[
    			-45,
    			114
    		],
    		[
    			-17,
    			67
    		],
    		[
    			-38,
    			-17
    		],
    		[
    			-48,
    			43
    		],
    		[
    			-48,
    			-13
    		],
    		[
    			-97,
    			90
    		],
    		[
    			-43,
    			-20
    		],
    		[
    			-52,
    			6
    		],
    		[
    			-124,
    			-20
    		],
    		[
    			-61,
    			-47
    		],
    		[
    			-106,
    			-51
    		],
    		[
    			-100,
    			7
    		],
    		[
    			-137,
    			-111
    		],
    		[
    			-59,
    			-39
    		],
    		[
    			-14,
    			-72
    		],
    		[
    			-43,
    			-63
    		],
    		[
    			-48,
    			14
    		],
    		[
    			-64,
    			-9
    		],
    		[
    			-32,
    			12
    		],
    		[
    			-111,
    			-3
    		],
    		[
    			-43,
    			-19
    		],
    		[
    			-37,
    			9
    		],
    		[
    			-37,
    			-28
    		],
    		[
    			-13,
    			-45
    		],
    		[
    			-55,
    			-17
    		],
    		[
    			-70,
    			-87
    		],
    		[
    			-63,
    			-17
    		],
    		[
    			-17,
    			18
    		],
    		[
    			-71,
    			-14
    		],
    		[
    			-59,
    			36
    		],
    		[
    			-38,
    			66
    		],
    		[
    			-47,
    			17
    		],
    		[
    			-14,
    			106
    		],
    		[
    			43,
    			16
    		],
    		[
    			24,
    			53
    		],
    		[
    			-7,
    			103
    		],
    		[
    			16,
    			83
    		],
    		[
    			-8,
    			88
    		],
    		[
    			-61,
    			194
    		],
    		[
    			-9,
    			72
    		],
    		[
    			3,
    			99
    		],
    		[
    			-39,
    			145
    		],
    		[
    			-41,
    			86
    		],
    		[
    			-14,
    			132
    		],
    		[
    			-46,
    			115
    		],
    		[
    			33,
    			49
    		],
    		[
    			34,
    			3
    		],
    		[
    			4,
    			78
    		],
    		[
    			-21,
    			33
    		],
    		[
    			-41,
    			150
    		],
    		[
    			-21,
    			45
    		],
    		[
    			7,
    			99
    		],
    		[
    			27,
    			61
    		],
    		[
    			7,
    			95
    		],
    		[
    			-15,
    			69
    		],
    		[
    			31,
    			113
    		],
    		[
    			15,
    			-109
    		],
    		[
    			21,
    			6
    		],
    		[
    			26,
    			108
    		],
    		[
    			63,
    			42
    		],
    		[
    			55,
    			79
    		],
    		[
    			63,
    			62
    		],
    		[
    			60,
    			24
    		],
    		[
    			18,
    			-22
    		],
    		[
    			41,
    			11
    		],
    		[
    			40,
    			56
    		],
    		[
    			61,
    			10
    		],
    		[
    			35,
    			54
    		],
    		[
    			36,
    			-20
    		],
    		[
    			60,
    			27
    		],
    		[
    			76,
    			50
    		],
    		[
    			50,
    			88
    		],
    		[
    			23,
    			89
    		],
    		[
    			56,
    			69
    		],
    		[
    			-19,
    			97
    		],
    		[
    			11,
    			75
    		],
    		[
    			67,
    			90
    		],
    		[
    			17,
    			-27
    		],
    		[
    			24,
    			-96
    		],
    		[
    			40,
    			67
    		],
    		[
    			-21,
    			65
    		],
    		[
    			22,
    			54
    		],
    		[
    			55,
    			-23
    		],
    		[
    			18,
    			58
    		],
    		[
    			-19,
    			46
    		],
    		[
    			10,
    			42
    		],
    		[
    			42,
    			19
    		],
    		[
    			34,
    			83
    		],
    		[
    			2,
    			51
    		],
    		[
    			35,
    			20
    		],
    		[
    			25,
    			-16
    		],
    		[
    			45,
    			87
    		],
    		[
    			31,
    			-16
    		],
    		[
    			23,
    			61
    		],
    		[
    			37,
    			-27
    		],
    		[
    			80,
    			-140
    		],
    		[
    			83,
    			-24
    		],
    		[
    			63,
    			6
    		],
    		[
    			-33,
    			73
    		],
    		[
    			34,
    			68
    		],
    		[
    			11,
    			83
    		],
    		[
    			42,
    			35
    		],
    		[
    			-13,
    			63
    		],
    		[
    			42,
    			46
    		],
    		[
    			45,
    			85
    		],
    		[
    			41,
    			-23
    		],
    		[
    			54,
    			-3
    		],
    		[
    			56,
    			37
    		],
    		[
    			10,
    			92
    		],
    		[
    			19,
    			32
    		],
    		[
    			22,
    			-63
    		],
    		[
    			99,
    			-54
    		],
    		[
    			48,
    			11
    		],
    		[
    			35,
    			-49
    		],
    		[
    			51,
    			29
    		],
    		[
    			27,
    			-14
    		],
    		[
    			34,
    			-49
    		],
    		[
    			29,
    			79
    		],
    		[
    			39,
    			-63
    		],
    		[
    			-20,
    			-18
    		],
    		[
    			-8,
    			-80
    		],
    		[
    			-68,
    			-52
    		],
    		[
    			-5,
    			-154
    		],
    		[
    			-46,
    			-106
    		],
    		[
    			7,
    			-26
    		],
    		[
    			74,
    			-74
    		],
    		[
    			4,
    			-26
    		],
    		[
    			140,
    			-117
    		],
    		[
    			36,
    			-64
    		],
    		[
    			85,
    			-40
    		],
    		[
    			22,
    			-72
    		],
    		[
    			84,
    			-67
    		],
    		[
    			67,
    			43
    		],
    		[
    			13,
    			75
    		],
    		[
    			30,
    			76
    		],
    		[
    			16,
    			83
    		],
    		[
    			4,
    			91
    		],
    		[
    			18,
    			88
    		],
    		[
    			-13,
    			86
    		],
    		[
    			7,
    			66
    		],
    		[
    			-13,
    			28
    		],
    		[
    			22,
    			108
    		],
    		[
    			-9,
    			121
    		],
    		[
    			48,
    			185
    		],
    		[
    			3,
    			78
    		],
    		[
    			39,
    			48
    		]
    	],
    	[
    		[
    			18858,
    			17394
    		],
    		[
    			-9,
    			-41
    		],
    		[
    			30,
    			-60
    		]
    	],
    	[
    		[
    			18879,
    			17293
    		],
    		[
    			-7,
    			-50
    		],
    		[
    			-36,
    			-30
    		],
    		[
    			-58,
    			-111
    		]
    	],
    	[
    		[
    			18778,
    			17102
    		],
    		[
    			-26,
    			-25
    		],
    		[
    			-76,
    			-11
    		],
    		[
    			-54,
    			-40
    		],
    		[
    			-73,
    			18
    		]
    	],
    	[
    		[
    			18549,
    			17044
    		],
    		[
    			-111,
    			23
    		],
    		[
    			-42,
    			58
    		],
    		[
    			-92,
    			-7
    		],
    		[
    			-14,
    			-33
    		],
    		[
    			-52,
    			16
    		]
    	],
    	[
    		[
    			18238,
    			17101
    		],
    		[
    			-35,
    			-3
    		],
    		[
    			-48,
    			36
    		]
    	],
    	[
    		[
    			18155,
    			17134
    		],
    		[
    			-6,
    			36
    		]
    	],
    	[
    		[
    			18149,
    			17170
    		],
    		[
    			0,
    			45
    		]
    	],
    	[
    		[
    			18149,
    			17215
    		],
    		[
    			40,
    			-1
    		],
    		[
    			26,
    			-43
    		],
    		[
    			36,
    			48
    		],
    		[
    			59,
    			-28
    		],
    		[
    			90,
    			50
    		],
    		[
    			90,
    			-11
    		],
    		[
    			-32,
    			83
    		],
    		[
    			62,
    			42
    		],
    		[
    			41,
    			66
    		]
    	],
    	[
    		[
    			18561,
    			17421
    		],
    		[
    			21,
    			-29
    		],
    		[
    			63,
    			1
    		],
    		[
    			29,
    			68
    		],
    		[
    			97,
    			-43
    		],
    		[
    			48,
    			8
    		],
    		[
    			39,
    			-32
    		]
    	],
    	[
    		[
    			21653,
    			15759
    		],
    		[
    			-57,
    			20
    		],
    		[
    			-36,
    			42
    		],
    		[
    			-34,
    			69
    		]
    	],
    	[
    		[
    			21526,
    			15890
    		],
    		[
    			-3,
    			14
    		]
    	],
    	[
    		[
    			22143,
    			16158
    		],
    		[
    			27,
    			-51
    		],
    		[
    			14,
    			-99
    		],
    		[
    			-3,
    			-155
    		],
    		[
    			-34,
    			-76
    		],
    		[
    			0,
    			-40
    		]
    	],
    	[
    		[
    			22147,
    			15737
    		],
    		[
    			-151,
    			-76
    		],
    		[
    			-84,
    			32
    		],
    		[
    			-55,
    			44
    		],
    		[
    			-26,
    			165
    		],
    		[
    			-58,
    			-39
    		],
    		[
    			-81,
    			-99
    		]
    	],
    	[
    		[
    			21545,
    			16170
    		],
    		[
    			29,
    			28
    		],
    		[
    			61,
    			-48
    		],
    		[
    			66,
    			-13
    		],
    		[
    			-2,
    			48
    		],
    		[
    			-35,
    			44
    		],
    		[
    			16,
    			42
    		]
    	],
    	[
    		[
    			21680,
    			16271
    		],
    		[
    			33,
    			-9
    		],
    		[
    			49,
    			-89
    		],
    		[
    			58,
    			-17
    		],
    		[
    			17,
    			46
    		],
    		[
    			34,
    			22
    		],
    		[
    			12,
    			44
    		],
    		[
    			117,
    			138
    		]
    	],
    	[
    		[
    			22000,
    			16406
    		],
    		[
    			143,
    			-248
    		]
    	],
    	[
    		[
    			20160,
    			8854
    		],
    		[
    			-13,
    			-75
    		],
    		[
    			39,
    			-31
    		],
    		[
    			0,
    			-37
    		],
    		[
    			-30,
    			-42
    		],
    		[
    			-44,
    			-127
    		],
    		[
    			-26,
    			-30
    		],
    		[
    			-33,
    			1
    		]
    	],
    	[
    		[
    			20053,
    			8513
    		],
    		[
    			-18,
    			88
    		],
    		[
    			2,
    			142
    		],
    		[
    			-21,
    			55
    		]
    	],
    	[
    		[
    			20016,
    			8798
    		],
    		[
    			32,
    			-16
    		],
    		[
    			52,
    			23
    		],
    		[
    			12,
    			58
    		],
    		[
    			48,
    			-9
    		]
    	],
    	[
    		[
    			17812,
    			17752
    		],
    		[
    			34,
    			-51
    		],
    		[
    			-23,
    			-53
    		]
    	],
    	[
    		[
    			17823,
    			17648
    		],
    		[
    			-37,
    			-48
    		],
    		[
    			7,
    			-50
    		]
    	],
    	[
    		[
    			17793,
    			17550
    		],
    		[
    			-156,
    			69
    		],
    		[
    			2,
    			51
    		],
    		[
    			-136,
    			78
    		],
    		[
    			-24,
    			61
    		]
    	],
    	[
    		[
    			17479,
    			17809
    		],
    		[
    			79,
    			47
    		]
    	],
    	[
    		[
    			17558,
    			17856
    		],
    		[
    			52,
    			-28
    		],
    		[
    			31,
    			24
    		]
    	],
    	[
    		[
    			17641,
    			17852
    		],
    		[
    			1,
    			4
    		]
    	],
    	[
    		[
    			17642,
    			17856
    		],
    		[
    			80,
    			3
    		],
    		[
    			71,
    			-44
    		],
    		[
    			19,
    			-63
    		]
    	],
    	[
    		[
    			17581,
    			11215
    		],
    		[
    			-13,
    			-41
    		],
    		[
    			21,
    			-54
    		],
    		[
    			15,
    			-88
    		],
    		[
    			-31,
    			-124
    		],
    		[
    			-19,
    			-11
    		],
    		[
    			-23,
    			-117
    		],
    		[
    			-29,
    			-5
    		],
    		[
    			-3,
    			-143
    		],
    		[
    			-7,
    			-53
    		],
    		[
    			11,
    			-143
    		],
    		[
    			-8,
    			-113
    		]
    	],
    	[
    		[
    			17495,
    			10323
    		],
    		[
    			-103,
    			-23
    		]
    	],
    	[
    		[
    			17392,
    			10300
    		],
    		[
    			1,
    			128
    		],
    		[
    			-1,
    			336
    		],
    		[
    			-21,
    			51
    		],
    		[
    			-6,
    			116
    		],
    		[
    			-55,
    			64
    		],
    		[
    			13,
    			103
    		]
    	],
    	[
    		[
    			17323,
    			11098
    		],
    		[
    			51,
    			79
    		],
    		[
    			55,
    			-7
    		],
    		[
    			37,
    			79
    		]
    	],
    	[
    		[
    			17466,
    			11249
    		],
    		[
    			-1,
    			60
    		],
    		[
    			40,
    			23
    		],
    		[
    			76,
    			-117
    		]
    	],
    	[
    		[
    			17257,
    			11766
    		],
    		[
    			-6,
    			-76
    		],
    		[
    			45,
    			-141
    		],
    		[
    			36,
    			-22
    		],
    		[
    			11,
    			-94
    		],
    		[
    			43,
    			-61
    		],
    		[
    			57,
    			9
    		],
    		[
    			-10,
    			-56
    		],
    		[
    			33,
    			-76
    		]
    	],
    	[
    		[
    			17323,
    			11098
    		],
    		[
    			-101,
    			24
    		]
    	],
    	[
    		[
    			17222,
    			11122
    		],
    		[
    			-41,
    			-24
    		],
    		[
    			-217,
    			0
    		],
    		[
    			-10,
    			-61
    		],
    		[
    			17,
    			-62
    		],
    		[
    			7,
    			-129
    		]
    	],
    	[
    		[
    			16978,
    			10846
    		],
    		[
    			-20,
    			6
    		],
    		[
    			-21,
    			52
    		],
    		[
    			-57,
    			17
    		],
    		[
    			-39,
    			-18
    		],
    		[
    			-26,
    			-39
    		],
    		[
    			-53,
    			47
    		],
    		[
    			-17,
    			63
    		],
    		[
    			-38,
    			30
    		]
    	],
    	[
    		[
    			16707,
    			11004
    		],
    		[
    			24,
    			134
    		],
    		[
    			-3,
    			65
    		],
    		[
    			14,
    			54
    		],
    		[
    			40,
    			8
    		],
    		[
    			21,
    			43
    		],
    		[
    			27,
    			115
    		],
    		[
    			-11,
    			30
    		],
    		[
    			25,
    			46
    		],
    		[
    			47,
    			-32
    		],
    		[
    			33,
    			14
    		],
    		[
    			-1,
    			72
    		],
    		[
    			29,
    			-14
    		],
    		[
    			12,
    			72
    		],
    		[
    			34,
    			39
    		],
    		[
    			36,
    			-24
    		],
    		[
    			12,
    			55
    		],
    		[
    			29,
    			4
    		],
    		[
    			56,
    			48
    		],
    		[
    			37,
    			49
    		],
    		[
    			89,
    			-16
    		]
    	],
    	[
    		[
    			26103,
    			12935
    		],
    		[
    			2,
    			-83
    		],
    		[
    			-41,
    			-25
    		],
    		[
    			0,
    			-30
    		]
    	],
    	[
    		[
    			26064,
    			12797
    		],
    		[
    			-14,
    			2
    		],
    		[
    			-16,
    			143
    		],
    		[
    			-28,
    			104
    		],
    		[
    			-24,
    			29
    		],
    		[
    			-54,
    			9
    		],
    		[
    			-20,
    			40
    		],
    		[
    			-2,
    			54
    		],
    		[
    			-26,
    			4
    		],
    		[
    			1,
    			-84
    		],
    		[
    			31,
    			-107
    		],
    		[
    			-35,
    			-82
    		],
    		[
    			-112,
    			20
    		]
    	],
    	[
    		[
    			25765,
    			12929
    		],
    		[
    			0,
    			44
    		],
    		[
    			-31,
    			214
    		],
    		[
    			-4,
    			140
    		],
    		[
    			-57,
    			35
    		],
    		[
    			-8,
    			28
    		],
    		[
    			39,
    			82
    		],
    		[
    			48,
    			12
    		],
    		[
    			-18,
    			46
    		],
    		[
    			-64,
    			67
    		],
    		[
    			42,
    			93
    		],
    		[
    			80,
    			-80
    		],
    		[
    			37,
    			25
    		],
    		[
    			12,
    			-38
    		],
    		[
    			-5,
    			-93
    		],
    		[
    			60,
    			-38
    		],
    		[
    			151,
    			7
    		],
    		[
    			30,
    			-19
    		],
    		[
    			-41,
    			-155
    		],
    		[
    			-47,
    			-6
    		],
    		[
    			-25,
    			-79
    		],
    		[
    			37,
    			-108
    		],
    		[
    			70,
    			108
    		],
    		[
    			23,
    			-154
    		],
    		[
    			9,
    			-125
    		]
    	],
    	[
    		[
    			19973,
    			16578
    		],
    		[
    			-13,
    			-60
    		],
    		[
    			-34,
    			-1
    		],
    		[
    			-19,
    			-112
    		],
    		[
    			-24,
    			-21
    		],
    		[
    			36,
    			-99
    		]
    	],
    	[
    		[
    			19919,
    			16285
    		],
    		[
    			-46,
    			-11
    		],
    		[
    			-26,
    			31
    		],
    		[
    			-62,
    			-23
    		],
    		[
    			-25,
    			-42
    		]
    	],
    	[
    		[
    			19760,
    			16240
    		],
    		[
    			-22,
    			-59
    		],
    		[
    			-77,
    			-21
    		],
    		[
    			-102,
    			57
    		],
    		[
    			-59,
    			-34
    		],
    		[
    			-67,
    			-5
    		]
    	],
    	[
    		[
    			19433,
    			16178
    		],
    		[
    			8,
    			62
    		],
    		[
    			-16,
    			50
    		],
    		[
    			-48,
    			49
    		]
    	],
    	[
    		[
    			19377,
    			16339
    		],
    		[
    			12,
    			74
    		],
    		[
    			47,
    			60
    		],
    		[
    			-43,
    			60
    		],
    		[
    			-17,
    			57
    		],
    		[
    			31,
    			68
    		]
    	],
    	[
    		[
    			19407,
    			16658
    		],
    		[
    			20,
    			-62
    		],
    		[
    			53,
    			3
    		],
    		[
    			71,
    			-29
    		],
    		[
    			35,
    			13
    		],
    		[
    			79,
    			-24
    		],
    		[
    			40,
    			16
    		],
    		[
    			33,
    			45
    		],
    		[
    			110,
    			24
    		],
    		[
    			12,
    			-18
    		],
    		[
    			113,
    			-48
    		]
    	],
    	[
    		[
    			22081,
    			13646
    		],
    		[
    			1,
    			-53
    		],
    		[
    			-14,
    			7
    		],
    		[
    			0,
    			47
    		],
    		[
    			13,
    			-1
    		]
    	],
    	[
    		[
    			9751,
    			13475
    		],
    		[
    			40,
    			-84
    		],
    		[
    			2,
    			-40
    		],
    		[
    			-29,
    			-24
    		],
    		[
    			-40,
    			49
    		],
    		[
    			26,
    			51
    		],
    		[
    			1,
    			48
    		]
    	],
    	[
    		[
    			19056,
    			16765
    		],
    		[
    			34,
    			3
    		],
    		[
    			-23,
    			-93
    		],
    		[
    			46,
    			-51
    		],
    		[
    			-36,
    			-82
    		]
    	],
    	[
    		[
    			19077,
    			16542
    		],
    		[
    			-26,
    			-5
    		],
    		[
    			-40,
    			-77
    		],
    		[
    			-8,
    			-79
    		]
    	],
    	[
    		[
    			19003,
    			16381
    		],
    		[
    			-78,
    			55
    		]
    	],
    	[
    		[
    			18925,
    			16436
    		],
    		[
    			-6,
    			8
    		]
    	],
    	[
    		[
    			18919,
    			16444
    		],
    		[
    			7,
    			21
    		],
    		[
    			-136,
    			190
    		],
    		[
    			-47,
    			126
    		],
    		[
    			48,
    			11
    		],
    		[
    			25,
    			33
    		],
    		[
    			144,
    			-11
    		],
    		[
    			58,
    			-14
    		],
    		[
    			38,
    			-35
    		]
    	],
    	[
    		[
    			20280,
    			17979
    		],
    		[
    			-77,
    			-6
    		],
    		[
    			-45,
    			-79
    		],
    		[
    			-115,
    			-34
    		],
    		[
    			-108,
    			42
    		],
    		[
    			-87,
    			-5
    		],
    		[
    			-9,
    			28
    		],
    		[
    			-105,
    			24
    		],
    		[
    			-156,
    			0
    		],
    		[
    			-39,
    			-58
    		],
    		[
    			-41,
    			-15
    		]
    	],
    	[
    		[
    			19498,
    			17876
    		],
    		[
    			2,
    			98
    		],
    		[
    			-45,
    			34
    		],
    		[
    			33,
    			53
    		],
    		[
    			37,
    			11
    		],
    		[
    			1,
    			83
    		],
    		[
    			-40,
    			135
    		]
    	],
    	[
    		[
    			19486,
    			18290
    		],
    		[
    			89,
    			-10
    		],
    		[
    			105,
    			65
    		],
    		[
    			32,
    			105
    		],
    		[
    			79,
    			40
    		],
    		[
    			-7,
    			86
    		]
    	],
    	[
    		[
    			19784,
    			18576
    		],
    		[
    			101,
    			43
    		],
    		[
    			46,
    			39
    		]
    	],
    	[
    		[
    			19931,
    			18658
    		],
    		[
    			56,
    			-33
    		],
    		[
    			140,
    			-17
    		],
    		[
    			71,
    			-42
    		],
    		[
    			8,
    			-92
    		],
    		[
    			-25,
    			-43
    		],
    		[
    			44,
    			-29
    		],
    		[
    			10,
    			-64
    		],
    		[
    			54,
    			-36
    		],
    		[
    			80,
    			-119
    		],
    		[
    			-55,
    			-42
    		],
    		[
    			-68,
    			22
    		],
    		[
    			16,
    			-149
    		],
    		[
    			18,
    			-35
    		]
    	],
    	[
    		[
    			8780,
    			12351
    		],
    		[
    			21,
    			-47
    		],
    		[
    			-19,
    			-100
    		],
    		[
    			7,
    			-107
    		],
    		[
    			-31,
    			-115
    		],
    		[
    			-39,
    			-65
    		]
    	],
    	[
    		[
    			8719,
    			11917
    		],
    		[
    			-27,
    			6
    		],
    		[
    			7,
    			188
    		],
    		[
    			0,
    			127
    		]
    	],
    	[
    		[
    			8699,
    			12238
    		],
    		[
    			43,
    			43
    		],
    		[
    			18,
    			66
    		],
    		[
    			20,
    			4
    		]
    	],
    	[
    		[
    			11039,
    			14672
    		],
    		[
    			1,
    			-3
    		],
    		[
    			-8,
    			-11
    		],
    		[
    			-2,
    			5
    		],
    		[
    			9,
    			9
    		]
    	],
    	[
    		[
    			11666,
    			5883
    		],
    		[
    			-7,
    			65
    		],
    		[
    			-79,
    			81
    		],
    		[
    			-88,
    			-1
    		],
    		[
    			-59,
    			-27
    		],
    		[
    			-108,
    			-31
    		],
    		[
    			-19,
    			-75
    		],
    		[
    			-33,
    			-79
    		],
    		[
    			1,
    			-83
    		],
    		[
    			-37,
    			-200
    		]
    	],
    	[
    		[
    			10803,
    			5441
    		],
    		[
    			-66,
    			-5
    		],
    		[
    			-9,
    			131
    		],
    		[
    			-21,
    			75
    		],
    		[
    			1,
    			51
    		],
    		[
    			-35,
    			123
    		],
    		[
    			-20,
    			33
    		],
    		[
    			32,
    			162
    		],
    		[
    			-47,
    			61
    		],
    		[
    			-19,
    			168
    		],
    		[
    			-19,
    			14
    		],
    		[
    			-17,
    			75
    		]
    	],
    	[
    		[
    			10583,
    			6329
    		],
    		[
    			-13,
    			41
    		],
    		[
    			59,
    			99
    		],
    		[
    			3,
    			79
    		],
    		[
    			-26,
    			7
    		],
    		[
    			-17,
    			88
    		],
    		[
    			22,
    			60
    		],
    		[
    			-18,
    			51
    		],
    		[
    			13,
    			59
    		],
    		[
    			24,
    			36
    		],
    		[
    			2,
    			257
    		],
    		[
    			27,
    			60
    		],
    		[
    			-23,
    			84
    		],
    		[
    			-62,
    			174
    		]
    	],
    	[
    		[
    			10574,
    			7424
    		],
    		[
    			123,
    			-6
    		],
    		[
    			22,
    			52
    		],
    		[
    			31,
    			-6
    		],
    		[
    			40,
    			67
    		],
    		[
    			27,
    			10
    		],
    		[
    			39,
    			60
    		],
    		[
    			107,
    			18
    		],
    		[
    			21,
    			-13
    		],
    		[
    			0,
    			-62
    		],
    		[
    			-14,
    			-41
    		],
    		[
    			14,
    			-84
    		],
    		[
    			0,
    			-88
    		],
    		[
    			28,
    			-82
    		],
    		[
    			46,
    			-41
    		],
    		[
    			12,
    			-35
    		],
    		[
    			70,
    			-3
    		],
    		[
    			84,
    			-91
    		],
    		[
    			64,
    			-41
    		],
    		[
    			28,
    			-47
    		],
    		[
    			82,
    			1
    		],
    		[
    			46,
    			-45
    		],
    		[
    			0,
    			-63
    		],
    		[
    			20,
    			-73
    		],
    		[
    			10,
    			-276
    		],
    		[
    			163,
    			-10
    		],
    		[
    			12,
    			-36
    		],
    		[
    			-12,
    			-67
    		],
    		[
    			20,
    			-69
    		],
    		[
    			44,
    			-28
    		],
    		[
    			23,
    			-123
    		],
    		[
    			-21,
    			-131
    		],
    		[
    			-33,
    			-117
    		],
    		[
    			26,
    			-40
    		],
    		[
    			-30,
    			-31
    		]
    	],
    	[
    		[
    			12480,
    			9317
    		],
    		[
    			-17,
    			-56
    		],
    		[
    			-48,
    			2
    		],
    		[
    			-5,
    			31
    		],
    		[
    			70,
    			23
    		]
    	],
    	[
    		[
    			11828,
    			9583
    		],
    		[
    			43,
    			-18
    		],
    		[
    			-2,
    			65
    		],
    		[
    			29,
    			29
    		],
    		[
    			75,
    			24
    		],
    		[
    			40,
    			-35
    		]
    	],
    	[
    		[
    			12013,
    			9648
    		],
    		[
    			20,
    			-29
    		],
    		[
    			52,
    			34
    		],
    		[
    			77,
    			-32
    		],
    		[
    			30,
    			34
    		],
    		[
    			33,
    			119
    		],
    		[
    			68,
    			185
    		]
    	],
    	[
    		[
    			12293,
    			9959
    		],
    		[
    			7,
    			34
    		],
    		[
    			45,
    			-88
    		],
    		[
    			6,
    			-126
    		],
    		[
    			32,
    			-164
    		],
    		[
    			20,
    			-53
    		],
    		[
    			51,
    			-28
    		],
    		[
    			3,
    			-79
    		],
    		[
    			-35,
    			-53
    		],
    		[
    			-66,
    			-156
    		],
    		[
    			60,
    			-3
    		],
    		[
    			64,
    			-26
    		],
    		[
    			46,
    			19
    		],
    		[
    			76,
    			-22
    		],
    		[
    			-8,
    			-81
    		],
    		[
    			-23,
    			-65
    		],
    		[
    			18,
    			-35
    		],
    		[
    			27,
    			83
    		],
    		[
    			52,
    			51
    		],
    		[
    			38,
    			-8
    		],
    		[
    			14,
    			-28
    		],
    		[
    			52,
    			-11
    		],
    		[
    			7,
    			-33
    		],
    		[
    			54,
    			-9
    		],
    		[
    			70,
    			-83
    		],
    		[
    			17,
    			15
    		],
    		[
    			51,
    			-61
    		],
    		[
    			17,
    			-82
    		],
    		[
    			-2,
    			-39
    		],
    		[
    			90,
    			10
    		],
    		[
    			20,
    			24
    		],
    		[
    			66,
    			-55
    		],
    		[
    			68,
    			-6
    		],
    		[
    			51,
    			-34
    		],
    		[
    			83,
    			19
    		],
    		[
    			52,
    			-12
    		],
    		[
    			64,
    			-59
    		],
    		[
    			81,
    			-105
    		],
    		[
    			75,
    			-126
    		],
    		[
    			42,
    			-54
    		],
    		[
    			44,
    			-25
    		],
    		[
    			67,
    			8
    		],
    		[
    			49,
    			-19
    		],
    		[
    			22,
    			-54
    		],
    		[
    			44,
    			-279
    		],
    		[
    			-3,
    			-143
    		],
    		[
    			-33,
    			-161
    		],
    		[
    			-118,
    			-258
    		],
    		[
    			-44,
    			-39
    		],
    		[
    			-40,
    			-96
    		],
    		[
    			-40,
    			-136
    		],
    		[
    			-59,
    			-136
    		],
    		[
    			-37,
    			49
    		],
    		[
    			-4,
    			-63
    		],
    		[
    			-18,
    			-35
    		],
    		[
    			-7,
    			-94
    		],
    		[
    			7,
    			-40
    		],
    		[
    			-13,
    			-99
    		],
    		[
    			10,
    			-156
    		],
    		[
    			10,
    			-51
    		],
    		[
    			-27,
    			-151
    		],
    		[
    			-8,
    			-93
    		],
    		[
    			8,
    			-63
    		],
    		[
    			-35,
    			-54
    		],
    		[
    			-21,
    			-80
    		],
    		[
    			3,
    			-135
    		],
    		[
    			-11,
    			-58
    		],
    		[
    			-22,
    			-25
    		],
    		[
    			-37,
    			-141
    		],
    		[
    			-31,
    			-36
    		],
    		[
    			-31,
    			-109
    		],
    		[
    			7,
    			-86
    		],
    		[
    			-69,
    			-51
    		],
    		[
    			-25,
    			-41
    		],
    		[
    			-10,
    			-65
    		],
    		[
    			-43,
    			4
    		],
    		[
    			-112,
    			-20
    		],
    		[
    			-15,
    			25
    		],
    		[
    			-67,
    			-69
    		],
    		[
    			-150,
    			-88
    		],
    		[
    			-69,
    			-63
    		],
    		[
    			-15,
    			-33
    		],
    		[
    			-63,
    			-69
    		],
    		[
    			-66,
    			-127
    		],
    		[
    			-25,
    			-79
    		],
    		[
    			11,
    			-29
    		],
    		[
    			-19,
    			-71
    		],
    		[
    			11,
    			-206
    		],
    		[
    			-24,
    			-120
    		],
    		[
    			-72,
    			-93
    		],
    		[
    			-41,
    			-99
    		],
    		[
    			-27,
    			-112
    		],
    		[
    			-47,
    			-119
    		],
    		[
    			8,
    			116
    		],
    		[
    			-45,
    			9
    		],
    		[
    			-46,
    			-149
    		],
    		[
    			-25,
    			-6
    		],
    		[
    			-30,
    			-75
    		],
    		[
    			7,
    			-73
    		],
    		[
    			-60,
    			-184
    		],
    		[
    			-57,
    			-77
    		]
    	],
    	[
    		[
    			12125,
    			3608
    		],
    		[
    			-15,
    			11
    		],
    		[
    			2,
    			90
    		],
    		[
    			40,
    			61
    		],
    		[
    			-52,
    			67
    		],
    		[
    			-10,
    			51
    		],
    		[
    			-69,
    			70
    		],
    		[
    			-4,
    			24
    		],
    		[
    			-71,
    			44
    		],
    		[
    			-34,
    			68
    		],
    		[
    			-42,
    			13
    		],
    		[
    			-77,
    			114
    		],
    		[
    			-53,
    			-35
    		],
    		[
    			-22,
    			21
    		]
    	],
    	[
    		[
    			12008,
    			4974
    		],
    		[
    			32,
    			204
    		],
    		[
    			-3,
    			48
    		],
    		[
    			-37,
    			45
    		],
    		[
    			-53,
    			-32
    		],
    		[
    			-20,
    			16
    		],
    		[
    			-18,
    			216
    		],
    		[
    			-23,
    			58
    		],
    		[
    			-132,
    			5
    		],
    		[
    			-70,
    			26
    		],
    		[
    			1,
    			90
    		],
    		[
    			14,
    			95
    		],
    		[
    			-33,
    			138
    		]
    	],
    	[
    		[
    			10574,
    			7424
    		],
    		[
    			-35,
    			5
    		],
    		[
    			-39,
    			-24
    		],
    		[
    			-27,
    			14
    		],
    		[
    			0,
    			190
    		],
    		[
    			5,
    			69
    		],
    		[
    			-69,
    			-94
    		],
    		[
    			-83,
    			-1
    		],
    		[
    			-12,
    			76
    		],
    		[
    			-42,
    			22
    		],
    		[
    			-41,
    			117
    		],
    		[
    			-36,
    			59
    		],
    		[
    			-15,
    			94
    		],
    		[
    			-28,
    			41
    		],
    		[
    			23,
    			111
    		],
    		[
    			55,
    			70
    		],
    		[
    			-2,
    			74
    		],
    		[
    			20,
    			57
    		],
    		[
    			14,
    			103
    		],
    		[
    			23,
    			7
    		],
    		[
    			66,
    			88
    		],
    		[
    			93,
    			23
    		],
    		[
    			17,
    			38
    		],
    		[
    			76,
    			-14
    		]
    	],
    	[
    		[
    			10537,
    			8549
    		],
    		[
    			20,
    			174
    		],
    		[
    			33,
    			348
    		],
    		[
    			-23,
    			104
    		],
    		[
    			-39,
    			53
    		],
    		[
    			1,
    			124
    		],
    		[
    			86,
    			36
    		],
    		[
    			-17,
    			51
    		],
    		[
    			-50,
    			-1
    		],
    		[
    			0,
    			106
    		],
    		[
    			161,
    			3
    		],
    		[
    			33,
    			8
    		],
    		[
    			36,
    			62
    		],
    		[
    			31,
    			-70
    		],
    		[
    			3,
    			-94
    		],
    		[
    			20,
    			10
    		]
    	],
    	[
    		[
    			10832,
    			9463
    		],
    		[
    			53,
    			-79
    		],
    		[
    			21,
    			-2
    		],
    		[
    			47,
    			45
    		],
    		[
    			17,
    			-52
    		],
    		[
    			30,
    			73
    		],
    		[
    			82,
    			56
    		],
    		[
    			20,
    			77
    		],
    		[
    			63,
    			36
    		],
    		[
    			3,
    			46
    		],
    		[
    			-54,
    			6
    		],
    		[
    			-28,
    			111
    		],
    		[
    			3,
    			80
    		],
    		[
    			-41,
    			61
    		],
    		[
    			7,
    			26
    		],
    		[
    			40,
    			-1
    		],
    		[
    			8,
    			-35
    		],
    		[
    			66,
    			10
    		],
    		[
    			39,
    			-59
    		],
    		[
    			21,
    			71
    		],
    		[
    			31,
    			24
    		],
    		[
    			25,
    			-16
    		],
    		[
    			85,
    			76
    		],
    		[
    			23,
    			-4
    		],
    		[
    			41,
    			69
    		],
    		[
    			-14,
    			45
    		]
    	],
    	[
    		[
    			11420,
    			10127
    		],
    		[
    			50,
    			12
    		],
    		[
    			23,
    			-33
    		],
    		[
    			-18,
    			-93
    		],
    		[
    			47,
    			-23
    		],
    		[
    			15,
    			-73
    		],
    		[
    			-32,
    			-57
    		],
    		[
    			-14,
    			-154
    		],
    		[
    			26,
    			-74
    		],
    		[
    			-3,
    			-55
    		],
    		[
    			57,
    			-94
    		],
    		[
    			62,
    			-14
    		],
    		[
    			18,
    			55
    		],
    		[
    			30,
    			-15
    		],
    		[
    			23,
    			36
    		],
    		[
    			62,
    			49
    		],
    		[
    			31,
    			-25
    		],
    		[
    			31,
    			14
    		]
    	],
    	[
    		[
    			11541,
    			11463
    		],
    		[
    			-13,
    			-18
    		],
    		[
    			-4,
    			40
    		],
    		[
    			17,
    			-22
    		]
    	],
    	[
    		[
    			28248,
    			10076
    		],
    		[
    			-22,
    			-27
    		],
    		[
    			7,
    			-77
    		],
    		[
    			-27,
    			-37
    		],
    		[
    			-30,
    			76
    		],
    		[
    			-18,
    			15
    		]
    	],
    	[
    		[
    			28158,
    			10026
    		],
    		[
    			36,
    			12
    		],
    		[
    			39,
    			51
    		],
    		[
    			15,
    			-13
    		]
    	],
    	[
    		[
    			26055,
    			13753
    		],
    		[
    			-37,
    			-11
    		],
    		[
    			-102,
    			-3
    		],
    		[
    			-23,
    			21
    		],
    		[
    			-56,
    			-31
    		],
    		[
    			-66,
    			16
    		],
    		[
    			-32,
    			49
    		],
    		[
    			11,
    			28
    		]
    	],
    	[
    		[
    			25750,
    			13822
    		],
    		[
    			30,
    			88
    		],
    		[
    			54,
    			75
    		],
    		[
    			55,
    			-30
    		],
    		[
    			41,
    			-5
    		],
    		[
    			22,
    			-30
    		],
    		[
    			30,
    			32
    		],
    		[
    			28,
    			-49
    		]
    	],
    	[
    		[
    			17563,
    			152
    		],
    		[
    			5,
    			-9
    		],
    		[
    			-8,
    			-1
    		],
    		[
    			3,
    			10
    		]
    	],
    	[
    		[
    			19655,
    			6280
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19655,
    			6279
    		],
    		[
    			-3,
    			-21
    		],
    		[
    			56,
    			-154
    		],
    		[
    			32,
    			-117
    		],
    		[
    			54,
    			-68
    		],
    		[
    			47,
    			-26
    		],
    		[
    			14,
    			-62
    		],
    		[
    			31,
    			-3
    		],
    		[
    			0,
    			-97
    		],
    		[
    			33,
    			-86
    		],
    		[
    			52,
    			-8
    		],
    		[
    			47,
    			-29
    		],
    		[
    			29,
    			-66
    		]
    	],
    	[
    		[
    			20047,
    			5542
    		],
    		[
    			-31,
    			-3
    		],
    		[
    			-12,
    			-41
    		],
    		[
    			-54,
    			-19
    		],
    		[
    			-40,
    			-81
    		],
    		[
    			-35,
    			-49
    		],
    		[
    			-54,
    			-50
    		],
    		[
    			-14,
    			-104
    		],
    		[
    			-42,
    			-61
    		],
    		[
    			-50,
    			-37
    		],
    		[
    			-30,
    			-130
    		],
    		[
    			-23,
    			-22
    		],
    		[
    			-63,
    			-10
    		],
    		[
    			-77,
    			41
    		],
    		[
    			-65,
    			52
    		],
    		[
    			-27,
    			-25
    		],
    		[
    			-19,
    			-101
    		],
    		[
    			-50,
    			-63
    		],
    		[
    			-47,
    			-76
    		],
    		[
    			-103,
    			10
    		],
    		[
    			-2,
    			53
    		],
    		[
    			24,
    			59
    		],
    		[
    			-16,
    			91
    		],
    		[
    			-30,
    			92
    		],
    		[
    			-36,
    			47
    		]
    	],
    	[
    		[
    			19151,
    			5115
    		],
    		[
    			0,
    			460
    		],
    		[
    			95,
    			0
    		],
    		[
    			0,
    			617
    		],
    		[
    			45,
    			2
    		],
    		[
    			156,
    			51
    		],
    		[
    			19,
    			0
    		],
    		[
    			32,
    			-82
    		],
    		[
    			29,
    			48
    		],
    		[
    			47,
    			42
    		],
    		[
    			15,
    			-20
    		],
    		[
    			32,
    			43
    		],
    		[
    			34,
    			4
    		]
    	],
    	[
    		[
    			19426,
    			11087
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19426,
    			11085
    		],
    		[
    			3,
    			-5
    		]
    	],
    	[
    		[
    			19429,
    			11080
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19430,
    			11078
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19430,
    			11075
    		],
    		[
    			5,
    			-15
    		]
    	],
    	[
    		[
    			19435,
    			11060
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19436,
    			11059
    		],
    		[
    			3,
    			-10
    		]
    	],
    	[
    		[
    			19439,
    			11049
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			19441,
    			11048
    		],
    		[
    			8,
    			-9
    		]
    	],
    	[
    		[
    			19449,
    			11039
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19451,
    			11036
    		],
    		[
    			3,
    			-7
    		]
    	],
    	[
    		[
    			19454,
    			11029
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			19456,
    			11024
    		],
    		[
    			8,
    			-10
    		]
    	],
    	[
    		[
    			19464,
    			11014
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19465,
    			11012
    		],
    		[
    			30,
    			-77
    		]
    	],
    	[
    		[
    			19495,
    			10935
    		],
    		[
    			7,
    			-21
    		]
    	],
    	[
    		[
    			19502,
    			10914
    		],
    		[
    			3,
    			-38
    		]
    	],
    	[
    		[
    			19505,
    			10876
    		],
    		[
    			-6,
    			-21
    		]
    	],
    	[
    		[
    			19499,
    			10855
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19499,
    			10854
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19499,
    			10852
    		],
    		[
    			0,
    			-13
    		]
    	],
    	[
    		[
    			19499,
    			10839
    		],
    		[
    			2,
    			-7
    		]
    	],
    	[
    		[
    			19501,
    			10832
    		],
    		[
    			-2,
    			-5
    		]
    	],
    	[
    		[
    			19499,
    			10827
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19499,
    			10823
    		],
    		[
    			1,
    			-8
    		]
    	],
    	[
    		[
    			19500,
    			10815
    		],
    		[
    			-1,
    			-9
    		]
    	],
    	[
    		[
    			19499,
    			10806
    		],
    		[
    			-4,
    			-6
    		]
    	],
    	[
    		[
    			19495,
    			10800
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19495,
    			10799
    		],
    		[
    			-6,
    			-5
    		]
    	],
    	[
    		[
    			19489,
    			10794
    		],
    		[
    			-7,
    			-16
    		]
    	],
    	[
    		[
    			19482,
    			10778
    		],
    		[
    			0,
    			-14
    		]
    	],
    	[
    		[
    			19482,
    			10764
    		],
    		[
    			8,
    			-3
    		]
    	],
    	[
    		[
    			19490,
    			10761
    		],
    		[
    			1,
    			3
    		]
    	],
    	[
    		[
    			19491,
    			10764
    		],
    		[
    			2,
    			6
    		]
    	],
    	[
    		[
    			19493,
    			10770
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19494,
    			10768
    		],
    		[
    			-8,
    			-41
    		]
    	],
    	[
    		[
    			19486,
    			10727
    		],
    		[
    			1,
    			-11
    		]
    	],
    	[
    		[
    			19487,
    			10716
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			19490,
    			10714
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			19491,
    			10715
    		],
    		[
    			7,
    			8
    		]
    	],
    	[
    		[
    			19498,
    			10723
    		],
    		[
    			5,
    			-5
    		]
    	],
    	[
    		[
    			19503,
    			10718
    		],
    		[
    			9,
    			-3
    		]
    	],
    	[
    		[
    			19512,
    			10715
    		],
    		[
    			9,
    			2
    		]
    	],
    	[
    		[
    			19521,
    			10717
    		],
    		[
    			7,
    			-1
    		]
    	],
    	[
    		[
    			19528,
    			10716
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19530,
    			10713
    		],
    		[
    			0,
    			-7
    		]
    	],
    	[
    		[
    			19530,
    			10706
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19532,
    			10703
    		],
    		[
    			3,
    			5
    		]
    	],
    	[
    		[
    			19535,
    			10708
    		],
    		[
    			6,
    			5
    		]
    	],
    	[
    		[
    			19541,
    			10713
    		],
    		[
    			4,
    			-1
    		]
    	],
    	[
    		[
    			19545,
    			10712
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			19548,
    			10712
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			19549,
    			10714
    		],
    		[
    			9,
    			-1
    		]
    	],
    	[
    		[
    			19558,
    			10713
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19558,
    			10709
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			19556,
    			10707
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			19556,
    			10701
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			19558,
    			10696
    		],
    		[
    			-2,
    			-5
    		]
    	],
    	[
    		[
    			19556,
    			10691
    		],
    		[
    			-5,
    			-13
    		]
    	],
    	[
    		[
    			19551,
    			10678
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			19550,
    			10678
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			19550,
    			10673
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19549,
    			10671
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19550,
    			10667
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			19548,
    			10665
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19548,
    			10663
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19548,
    			10659
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			19550,
    			10655
    		],
    		[
    			3,
    			-7
    		]
    	],
    	[
    		[
    			19553,
    			10648
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			19556,
    			10645
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			19561,
    			10642
    		],
    		[
    			5,
    			-2
    		]
    	],
    	[
    		[
    			19566,
    			10640
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			19570,
    			10640
    		],
    		[
    			10,
    			4
    		]
    	],
    	[
    		[
    			19580,
    			10644
    		],
    		[
    			1,
    			-8
    		]
    	],
    	[
    		[
    			19581,
    			10636
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			19584,
    			10633
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19586,
    			10631
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19587,
    			10630
    		],
    		[
    			7,
    			3
    		]
    	],
    	[
    		[
    			19594,
    			10633
    		],
    		[
    			5,
    			-2
    		]
    	],
    	[
    		[
    			19599,
    			10631
    		],
    		[
    			6,
    			-7
    		]
    	],
    	[
    		[
    			19605,
    			10624
    		],
    		[
    			2,
    			3
    		]
    	],
    	[
    		[
    			19607,
    			10627
    		],
    		[
    			6,
    			-2
    		]
    	],
    	[
    		[
    			19613,
    			10625
    		],
    		[
    			11,
    			-22
    		]
    	],
    	[
    		[
    			19624,
    			10603
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			19626,
    			10598
    		],
    		[
    			3,
    			-8
    		]
    	],
    	[
    		[
    			19629,
    			10590
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			19633,
    			10588
    		],
    		[
    			7,
    			-8
    		]
    	],
    	[
    		[
    			19640,
    			10580
    		],
    		[
    			8,
    			-3
    		]
    	],
    	[
    		[
    			19648,
    			10577
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19649,
    			10576
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19651,
    			10574
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19652,
    			10572
    		],
    		[
    			2,
    			-7
    		]
    	],
    	[
    		[
    			19654,
    			10565
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19656,
    			10562
    		],
    		[
    			2,
    			-19
    		]
    	],
    	[
    		[
    			19658,
    			10543
    		],
    		[
    			-1,
    			-4
    		]
    	],
    	[
    		[
    			19657,
    			10539
    		],
    		[
    			-6,
    			-4
    		]
    	],
    	[
    		[
    			19651,
    			10535
    		],
    		[
    			-3,
    			-5
    		]
    	],
    	[
    		[
    			19648,
    			10530
    		],
    		[
    			-1,
    			-12
    		]
    	],
    	[
    		[
    			19647,
    			10518
    		],
    		[
    			4,
    			-8
    		]
    	],
    	[
    		[
    			19651,
    			10510
    		],
    		[
    			5,
    			-2
    		]
    	],
    	[
    		[
    			19656,
    			10508
    		],
    		[
    			3,
    			-7
    		]
    	],
    	[
    		[
    			19659,
    			10501
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19661,
    			10498
    		],
    		[
    			1,
    			-6
    		]
    	],
    	[
    		[
    			19662,
    			10492
    		],
    		[
    			7,
    			-6
    		]
    	],
    	[
    		[
    			19669,
    			10486
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			19671,
    			10481
    		],
    		[
    			6,
    			-1
    		]
    	],
    	[
    		[
    			19677,
    			10480
    		],
    		[
    			8,
    			-11
    		]
    	],
    	[
    		[
    			19685,
    			10469
    		],
    		[
    			8,
    			-6
    		]
    	],
    	[
    		[
    			19693,
    			10463
    		],
    		[
    			15,
    			-8
    		]
    	],
    	[
    		[
    			19708,
    			10455
    		],
    		[
    			4,
    			-12
    		]
    	],
    	[
    		[
    			19712,
    			10443
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			19714,
    			10443
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			19716,
    			10443
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19716,
    			10440
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			19719,
    			10440
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19719,
    			10436
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19720,
    			10436
    		],
    		[
    			4,
    			-4
    		]
    	],
    	[
    		[
    			19724,
    			10432
    		],
    		[
    			5,
    			-7
    		]
    	],
    	[
    		[
    			19729,
    			10425
    		],
    		[
    			1,
    			-9
    		]
    	],
    	[
    		[
    			19730,
    			10416
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19731,
    			10412
    		],
    		[
    			3,
    			-13
    		]
    	],
    	[
    		[
    			19734,
    			10399
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19736,
    			10397
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			19737,
    			10399
    		],
    		[
    			5,
    			-1
    		]
    	],
    	[
    		[
    			19742,
    			10398
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19742,
    			10396
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19742,
    			10395
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			19743,
    			10392
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19745,
    			10389
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19745,
    			10387
    		],
    		[
    			5,
    			-2
    		]
    	],
    	[
    		[
    			19750,
    			10385
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19750,
    			10381
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19751,
    			10379
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			19754,
    			10380
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			19758,
    			10378
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			19760,
    			10378
    		],
    		[
    			5,
    			-7
    		]
    	],
    	[
    		[
    			19765,
    			10371
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19765,
    			10368
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19764,
    			10366
    		],
    		[
    			-1,
    			-6
    		]
    	],
    	[
    		[
    			19763,
    			10360
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			19759,
    			10359
    		],
    		[
    			-2,
    			-8
    		]
    	],
    	[
    		[
    			19757,
    			10351
    		],
    		[
    			-1,
    			-6
    		]
    	],
    	[
    		[
    			19756,
    			10345
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			19754,
    			10343
    		],
    		[
    			-1,
    			-13
    		]
    	],
    	[
    		[
    			19753,
    			10330
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			19755,
    			10325
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			19759,
    			10323
    		],
    		[
    			1,
    			-5
    		]
    	],
    	[
    		[
    			19760,
    			10318
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19761,
    			10317
    		],
    		[
    			6,
    			-4
    		]
    	],
    	[
    		[
    			19767,
    			10313
    		],
    		[
    			4,
    			-5
    		]
    	],
    	[
    		[
    			19771,
    			10308
    		],
    		[
    			-1,
    			-6
    		]
    	],
    	[
    		[
    			19770,
    			10302
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19771,
    			10298
    		],
    		[
    			5,
    			1
    		]
    	],
    	[
    		[
    			19776,
    			10299
    		],
    		[
    			-4,
    			-13
    		]
    	],
    	[
    		[
    			19772,
    			10286
    		],
    		[
    			-2,
    			-4
    		]
    	],
    	[
    		[
    			19770,
    			10282
    		],
    		[
    			-2,
    			-6
    		]
    	],
    	[
    		[
    			19768,
    			10276
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			19770,
    			10276
    		],
    		[
    			1,
    			3
    		]
    	],
    	[
    		[
    			19771,
    			10279
    		],
    		[
    			3,
    			2
    		]
    	],
    	[
    		[
    			19774,
    			10281
    		],
    		[
    			3,
    			-6
    		]
    	],
    	[
    		[
    			19777,
    			10275
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19777,
    			10274
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19778,
    			10272
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19778,
    			10268
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			19782,
    			10266
    		],
    		[
    			7,
    			-5
    		]
    	],
    	[
    		[
    			19789,
    			10261
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19789,
    			10260
    		],
    		[
    			7,
    			3
    		]
    	],
    	[
    		[
    			19796,
    			10263
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			19800,
    			10263
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			19803,
    			10262
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19804,
    			10260
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19806,
    			10258
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19806,
    			10254
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19806,
    			10253
    		],
    		[
    			3,
    			-9
    		]
    	],
    	[
    		[
    			19809,
    			10244
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			19812,
    			10243
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			19815,
    			10240
    		],
    		[
    			4,
    			-1
    		]
    	],
    	[
    		[
    			19819,
    			10239
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19820,
    			10238
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19822,
    			10236
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19823,
    			10232
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19823,
    			10231
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			19827,
    			10228
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19828,
    			10226
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			19828,
    			10227
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			19831,
    			10228
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19831,
    			10226
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			19833,
    			10225
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			19836,
    			10223
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19836,
    			10221
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			19835,
    			10221
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19835,
    			10219
    		],
    		[
    			7,
    			-10
    		]
    	],
    	[
    		[
    			19842,
    			10209
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19841,
    			10207
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19842,
    			10205
    		],
    		[
    			1,
    			-9
    		]
    	],
    	[
    		[
    			19843,
    			10196
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19844,
    			10196
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19844,
    			10192
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			19845,
    			10194
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			19846,
    			10195
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19848,
    			10193
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19848,
    			10192
    		],
    		[
    			-1,
    			-5
    		]
    	],
    	[
    		[
    			19847,
    			10187
    		],
    		[
    			-3,
    			-16
    		]
    	],
    	[
    		[
    			19844,
    			10171
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19843,
    			10169
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			19843,
    			10163
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19844,
    			10159
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19844,
    			10157
    		],
    		[
    			6,
    			-20
    		]
    	],
    	[
    		[
    			19850,
    			10137
    		],
    		[
    			2,
    			-9
    		]
    	],
    	[
    		[
    			19852,
    			10128
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			19855,
    			10126
    		],
    		[
    			5,
    			-12
    		]
    	],
    	[
    		[
    			19860,
    			10114
    		],
    		[
    			3,
    			-5
    		]
    	],
    	[
    		[
    			19863,
    			10109
    		],
    		[
    			1,
    			-8
    		]
    	],
    	[
    		[
    			19864,
    			10101
    		],
    		[
    			-1,
    			-3
    		]
    	],
    	[
    		[
    			19863,
    			10098
    		],
    		[
    			-33,
    			31
    		],
    		[
    			-55,
    			-27
    		],
    		[
    			-30,
    			32
    		],
    		[
    			-38,
    			-3
    		],
    		[
    			-22,
    			24
    		],
    		[
    			-26,
    			-55
    		],
    		[
    			-50,
    			-23
    		],
    		[
    			-23,
    			30
    		],
    		[
    			-91,
    			-53
    		],
    		[
    			-16,
    			-27
    		],
    		[
    			-50,
    			37
    		],
    		[
    			-36,
    			-103
    		],
    		[
    			-24,
    			-14
    		],
    		[
    			-53,
    			32
    		],
    		[
    			-49,
    			-3
    		],
    		[
    			-59,
    			20
    		],
    		[
    			-25,
    			59
    		],
    		[
    			-51,
    			57
    		],
    		[
    			-39,
    			2
    		],
    		[
    			-29,
    			-32
    		],
    		[
    			-43,
    			-137
    		],
    		[
    			-2,
    			-107
    		]
    	],
    	[
    		[
    			19019,
    			9838
    		],
    		[
    			-13,
    			31
    		],
    		[
    			-55,
    			-14
    		],
    		[
    			-42,
    			22
    		],
    		[
    			-84,
    			-38
    		],
    		[
    			-8,
    			-106
    		],
    		[
    			-31,
    			-104
    		]
    	],
    	[
    		[
    			18786,
    			9629
    		],
    		[
    			-11,
    			114
    		],
    		[
    			-26,
    			32
    		],
    		[
    			-67,
    			143
    		],
    		[
    			-1,
    			58
    		],
    		[
    			-36,
    			58
    		],
    		[
    			-10,
    			210
    		],
    		[
    			58,
    			225
    		],
    		[
    			27,
    			48
    		]
    	],
    	[
    		[
    			18720,
    			10517
    		],
    		[
    			29,
    			-14
    		],
    		[
    			55,
    			37
    		],
    		[
    			13,
    			30
    		],
    		[
    			31,
    			-52
    		],
    		[
    			77,
    			69
    		],
    		[
    			92,
    			17
    		],
    		[
    			44,
    			99
    		],
    		[
    			-19,
    			40
    		],
    		[
    			34,
    			26
    		],
    		[
    			43,
    			-2
    		],
    		[
    			65,
    			18
    		],
    		[
    			49,
    			60
    		],
    		[
    			39,
    			85
    		],
    		[
    			39,
    			41
    		],
    		[
    			11,
    			94
    		],
    		[
    			70,
    			35
    		],
    		[
    			34,
    			-13
    		]
    	],
    	[
    		[
    			9308,
    			16954
    		],
    		[
    			83,
    			-1
    		],
    		[
    			7,
    			-78
    		],
    		[
    			-65,
    			39
    		],
    		[
    			-25,
    			40
    		]
    	],
    	[
    		[
    			11441,
    			17126
    		],
    		[
    			19,
    			-26
    		],
    		[
    			-15,
    			-73
    		],
    		[
    			59,
    			-42
    		],
    		[
    			-1,
    			-35
    		],
    		[
    			-56,
    			-53
    		],
    		[
    			-85,
    			-13
    		],
    		[
    			-21,
    			82
    		],
    		[
    			63,
    			124
    		],
    		[
    			37,
    			36
    		]
    	],
    	[
    		[
    			11108,
    			17102
    		],
    		[
    			11,
    			-40
    		],
    		[
    			129,
    			-72
    		],
    		[
    			1,
    			-38
    		],
    		[
    			-107,
    			42
    		],
    		[
    			-41,
    			59
    		],
    		[
    			7,
    			49
    		]
    	],
    	[
    		[
    			10812,
    			16802
    		],
    		[
    			-38,
    			35
    		],
    		[
    			7,
    			45
    		],
    		[
    			-38,
    			21
    		],
    		[
    			2,
    			232
    		],
    		[
    			-36,
    			44
    		],
    		[
    			-70,
    			-25
    		],
    		[
    			-32,
    			47
    		],
    		[
    			-74,
    			-130
    		],
    		[
    			-29,
    			-82
    		],
    		[
    			6,
    			-43
    		],
    		[
    			-46,
    			-92
    		],
    		[
    			-55,
    			-15
    		],
    		[
    			-23,
    			-50
    		],
    		[
    			-300,
    			0
    		]
    	],
    	[
    		[
    			10086,
    			16789
    		],
    		[
    			87,
    			67
    		],
    		[
    			58,
    			107
    		],
    		[
    			46,
    			27
    		],
    		[
    			75,
    			75
    		],
    		[
    			23,
    			-2
    		],
    		[
    			111,
    			64
    		],
    		[
    			93,
    			153
    		],
    		[
    			54,
    			62
    		],
    		[
    			74,
    			56
    		],
    		[
    			137,
    			74
    		],
    		[
    			114,
    			28
    		],
    		[
    			102,
    			-33
    		],
    		[
    			26,
    			-93
    		],
    		[
    			-89,
    			-76
    		],
    		[
    			-72,
    			-20
    		],
    		[
    			39,
    			-42
    		],
    		[
    			29,
    			24
    		],
    		[
    			42,
    			-21
    		],
    		[
    			-21,
    			-68
    		],
    		[
    			6,
    			-69
    		],
    		[
    			32,
    			-100
    		],
    		[
    			75,
    			-23
    		],
    		[
    			2,
    			-43
    		],
    		[
    			48,
    			-26
    		],
    		[
    			113,
    			10
    		],
    		[
    			57,
    			-14
    		],
    		[
    			15,
    			-73
    		],
    		[
    			-155,
    			-90
    		],
    		[
    			-55,
    			-41
    		],
    		[
    			-68,
    			9
    		],
    		[
    			-1,
    			-30
    		],
    		[
    			-57,
    			-90
    		],
    		[
    			-84,
    			-54
    		],
    		[
    			-38,
    			41
    		],
    		[
    			0,
    			99
    		],
    		[
    			45,
    			73
    		],
    		[
    			85,
    			67
    		],
    		[
    			-56,
    			46
    		],
    		[
    			-53,
    			-41
    		],
    		[
    			-113,
    			-20
    		]
    	],
    	[
    		[
    			11093,
    			17616
    		],
    		[
    			108,
    			-32
    		],
    		[
    			107,
    			-67
    		],
    		[
    			-33,
    			-49
    		],
    		[
    			-126,
    			55
    		],
    		[
    			-56,
    			93
    		]
    	],
    	[
    		[
    			4974,
    			17772
    		],
    		[
    			82,
    			-44
    		],
    		[
    			154,
    			-41
    		],
    		[
    			70,
    			-111
    		],
    		[
    			6,
    			-40
    		],
    		[
    			82,
    			-39
    		],
    		[
    			51,
    			-91
    		],
    		[
    			-22,
    			-62
    		],
    		[
    			-108,
    			51
    		],
    		[
    			-77,
    			53
    		],
    		[
    			-8,
    			37
    		],
    		[
    			-75,
    			48
    		],
    		[
    			-33,
    			75
    		],
    		[
    			-36,
    			-6
    		],
    		[
    			-61,
    			60
    		],
    		[
    			-59,
    			92
    		],
    		[
    			34,
    			18
    		]
    	],
    	[
    		[
    			11884,
    			17897
    		],
    		[
    			38,
    			-39
    		],
    		[
    			-98,
    			-194
    		],
    		[
    			77,
    			-44
    		],
    		[
    			-21,
    			-36
    		],
    		[
    			20,
    			-47
    		],
    		[
    			50,
    			-36
    		],
    		[
    			113,
    			36
    		],
    		[
    			50,
    			-40
    		],
    		[
    			-42,
    			-55
    		],
    		[
    			28,
    			-121
    		],
    		[
    			-21,
    			-76
    		],
    		[
    			69,
    			-49
    		],
    		[
    			27,
    			-38
    		],
    		[
    			-10,
    			-69
    		],
    		[
    			-26,
    			-26
    		],
    		[
    			-33,
    			54
    		],
    		[
    			-57,
    			5
    		],
    		[
    			25,
    			104
    		],
    		[
    			-23,
    			40
    		],
    		[
    			-33,
    			-70
    		],
    		[
    			-35,
    			-7
    		],
    		[
    			-51,
    			-86
    		],
    		[
    			-43,
    			-1
    		],
    		[
    			83,
    			122
    		],
    		[
    			-44,
    			14
    		],
    		[
    			-16,
    			-41
    		],
    		[
    			-80,
    			28
    		],
    		[
    			-118,
    			1
    		],
    		[
    			-37,
    			15
    		],
    		[
    			-100,
    			-19
    		],
    		[
    			-30,
    			51
    		],
    		[
    			93,
    			94
    		],
    		[
    			-27,
    			18
    		],
    		[
    			49,
    			146
    		],
    		[
    			18,
    			20
    		],
    		[
    			63,
    			193
    		],
    		[
    			38,
    			32
    		],
    		[
    			17,
    			57
    		],
    		[
    			87,
    			64
    		]
    	],
    	[
    		[
    			9444,
    			18164
    		],
    		[
    			58,
    			-48
    		],
    		[
    			-3,
    			-37
    		],
    		[
    			-110,
    			42
    		],
    		[
    			55,
    			43
    		]
    	],
    	[
    		[
    			4885,
    			18176
    		],
    		[
    			38,
    			-31
    		],
    		[
    			2,
    			-69
    		],
    		[
    			-59,
    			41
    		],
    		[
    			19,
    			59
    		]
    	],
    	[
    		[
    			4497,
    			18326
    		],
    		[
    			100,
    			-26
    		],
    		[
    			2,
    			-127
    		],
    		[
    			-59,
    			-14
    		],
    		[
    			-51,
    			102
    		],
    		[
    			8,
    			65
    		]
    	],
    	[
    		[
    			9646,
    			18736
    		],
    		[
    			19,
    			-48
    		],
    		[
    			-38,
    			-79
    		],
    		[
    			-54,
    			5
    		],
    		[
    			73,
    			122
    		]
    	],
    	[
    		[
    			9627,
    			19697
    		],
    		[
    			18,
    			-23
    		],
    		[
    			-40,
    			-104
    		],
    		[
    			-51,
    			31
    		],
    		[
    			1,
    			58
    		],
    		[
    			72,
    			38
    		]
    	],
    	[
    		[
    			9359,
    			19801
    		],
    		[
    			28,
    			-48
    		],
    		[
    			-106,
    			-87
    		],
    		[
    			-84,
    			39
    		],
    		[
    			57,
    			85
    		],
    		[
    			105,
    			11
    		]
    	],
    	[
    		[
    			9051,
    			20290
    		],
    		[
    			39,
    			-76
    		],
    		[
    			51,
    			3
    		],
    		[
    			51,
    			-49
    		],
    		[
    			57,
    			-7
    		],
    		[
    			65,
    			-60
    		],
    		[
    			96,
    			-50
    		],
    		[
    			13,
    			-62
    		],
    		[
    			103,
    			-29
    		],
    		[
    			33,
    			-29
    		],
    		[
    			-81,
    			-56
    		],
    		[
    			-104,
    			41
    		],
    		[
    			-43,
    			46
    		],
    		[
    			-94,
    			24
    		],
    		[
    			-6,
    			-45
    		],
    		[
    			-84,
    			-77
    		],
    		[
    			-73,
    			-44
    		],
    		[
    			-37,
    			13
    		],
    		[
    			2,
    			81
    		],
    		[
    			-154,
    			7
    		],
    		[
    			99,
    			63
    		],
    		[
    			-21,
    			84
    		],
    		[
    			26,
    			57
    		],
    		[
    			13,
    			132
    		],
    		[
    			49,
    			33
    		]
    	],
    	[
    		[
    			9968,
    			20696
    		],
    		[
    			68,
    			-16
    		],
    		[
    			14,
    			-107
    		],
    		[
    			-84,
    			-61
    		],
    		[
    			-104,
    			1
    		],
    		[
    			-27,
    			80
    		],
    		[
    			64,
    			91
    		],
    		[
    			69,
    			12
    		]
    	],
    	[
    		[
    			7856,
    			20958
    		],
    		[
    			161,
    			-92
    		],
    		[
    			60,
    			-102
    		],
    		[
    			-61,
    			-45
    		],
    		[
    			-112,
    			13
    		],
    		[
    			-187,
    			58
    		],
    		[
    			65,
    			48
    		],
    		[
    			74,
    			120
    		]
    	],
    	[
    		[
    			9803,
    			19250
    		],
    		[
    			27,
    			50
    		],
    		[
    			-25,
    			83
    		],
    		[
    			-57,
    			61
    		],
    		[
    			34,
    			32
    		],
    		[
    			2,
    			68
    		],
    		[
    			-34,
    			141
    		],
    		[
    			63,
    			47
    		],
    		[
    			146,
    			-42
    		],
    		[
    			121,
    			-21
    		],
    		[
    			85,
    			43
    		],
    		[
    			119,
    			-59
    		],
    		[
    			111,
    			-157
    		],
    		[
    			108,
    			-12
    		],
    		[
    			63,
    			-38
    		],
    		[
    			-20,
    			-147
    		],
    		[
    			28,
    			-38
    		],
    		[
    			-10,
    			-49
    		],
    		[
    			22,
    			-95
    		],
    		[
    			80,
    			-1
    		],
    		[
    			65,
    			-83
    		],
    		[
    			33,
    			-31
    		],
    		[
    			92,
    			47
    		],
    		[
    			76,
    			76
    		],
    		[
    			42,
    			86
    		],
    		[
    			43,
    			134
    		],
    		[
    			30,
    			12
    		],
    		[
    			66,
    			-124
    		],
    		[
    			91,
    			-121
    		],
    		[
    			31,
    			-120
    		],
    		[
    			75,
    			-49
    		],
    		[
    			-18,
    			-48
    		],
    		[
    			11,
    			-57
    		],
    		[
    			57,
    			-25
    		],
    		[
    			-35,
    			-48
    		],
    		[
    			-9,
    			-67
    		],
    		[
    			42,
    			-70
    		],
    		[
    			60,
    			-23
    		],
    		[
    			49,
    			-99
    		],
    		[
    			46,
    			-20
    		],
    		[
    			74,
    			2
    		],
    		[
    			13,
    			-58
    		],
    		[
    			70,
    			11
    		],
    		[
    			73,
    			-62
    		],
    		[
    			-77,
    			-24
    		],
    		[
    			-66,
    			-53
    		],
    		[
    			-119,
    			-60
    		],
    		[
    			50,
    			-25
    		],
    		[
    			120,
    			87
    		],
    		[
    			16,
    			30
    		],
    		[
    			72,
    			-9
    		],
    		[
    			43,
    			-75
    		],
    		[
    			33,
    			2
    		],
    		[
    			59,
    			-41
    		],
    		[
    			21,
    			-45
    		],
    		[
    			-23,
    			-80
    		],
    		[
    			31,
    			-111
    		],
    		[
    			-108,
    			-102
    		],
    		[
    			-102,
    			-17
    		],
    		[
    			-103,
    			-62
    		],
    		[
    			-91,
    			-123
    		],
    		[
    			-67,
    			-12
    		],
    		[
    			-116,
    			-2
    		],
    		[
    			-110,
    			15
    		],
    		[
    			-26,
    			-9
    		],
    		[
    			-115,
    			16
    		],
    		[
    			-186,
    			-20
    		],
    		[
    			-51,
    			-33
    		],
    		[
    			-43,
    			-115
    		],
    		[
    			-73,
    			-8
    		],
    		[
    			-6,
    			-28
    		],
    		[
    			-85,
    			-57
    		],
    		[
    			-34,
    			-76
    		],
    		[
    			-77,
    			-137
    		],
    		[
    			-100,
    			-123
    		],
    		[
    			-58,
    			-11
    		],
    		[
    			-67,
    			-64
    		],
    		[
    			-57,
    			-38
    		],
    		[
    			-59,
    			-106
    		],
    		[
    			-80,
    			-68
    		],
    		[
    			-64,
    			-30
    		],
    		[
    			-61,
    			-79
    		],
    		[
    			-95,
    			-47
    		],
    		[
    			-20,
    			-44
    		],
    		[
    			-44,
    			32
    		],
    		[
    			-141,
    			-36
    		],
    		[
    			-37,
    			-31
    		],
    		[
    			-27,
    			-65
    		],
    		[
    			64,
    			-28
    		],
    		[
    			14,
    			-32
    		],
    		[
    			-122,
    			-18
    		],
    		[
    			5,
    			-32
    		],
    		[
    			-105,
    			13
    		],
    		[
    			-70,
    			-68
    		],
    		[
    			-91,
    			-47
    		],
    		[
    			-14,
    			54
    		],
    		[
    			50,
    			33
    		],
    		[
    			18,
    			87
    		],
    		[
    			63,
    			63
    		],
    		[
    			-4,
    			112
    		],
    		[
    			46,
    			91
    		],
    		[
    			0,
    			69
    		],
    		[
    			64,
    			-67
    		],
    		[
    			48,
    			-26
    		],
    		[
    			1,
    			104
    		],
    		[
    			-62,
    			138
    		],
    		[
    			-38,
    			1
    		],
    		[
    			-60,
    			32
    		],
    		[
    			-119,
    			10
    		],
    		[
    			-66,
    			17
    		],
    		[
    			-75,
    			37
    		],
    		[
    			-31,
    			85
    		],
    		[
    			20,
    			48
    		],
    		[
    			-41,
    			54
    		],
    		[
    			15,
    			58
    		],
    		[
    			-95,
    			3
    		],
    		[
    			-23,
    			32
    		],
    		[
    			-33,
    			101
    		],
    		[
    			-74,
    			-1
    		],
    		[
    			-71,
    			29
    		],
    		[
    			-50,
    			-15
    		],
    		[
    			-64,
    			-61
    		],
    		[
    			-41,
    			-81
    		]
    	],
    	[
    		[
    			8659,
    			17290
    		],
    		[
    			-49,
    			18
    		],
    		[
    			-65,
    			-2
    		],
    		[
    			-19,
    			24
    		],
    		[
    			-60,
    			-31
    		],
    		[
    			-48,
    			53
    		],
    		[
    			-110,
    			47
    		],
    		[
    			-23,
    			-16
    		],
    		[
    			-107,
    			29
    		],
    		[
    			-23,
    			100
    		],
    		[
    			-32,
    			-54
    		],
    		[
    			-186,
    			-1
    		],
    		[
    			-308,
    			0
    		],
    		[
    			-229,
    			0
    		],
    		[
    			-318,
    			1
    		],
    		[
    			-215,
    			0
    		],
    		[
    			-164,
    			0
    		],
    		[
    			-275,
    			0
    		],
    		[
    			-208,
    			0
    		],
    		[
    			-334,
    			1
    		],
    		[
    			-246,
    			-1
    		],
    		[
    			-159,
    			1
    		]
    	],
    	[
    		[
    			5481,
    			17459
    		],
    		[
    			-26,
    			0
    		],
    		[
    			-6,
    			0
    		],
    		[
    			2,
    			50
    		],
    		[
    			-84,
    			34
    		],
    		[
    			-73,
    			74
    		],
    		[
    			12,
    			50
    		],
    		[
    			-64,
    			37
    		],
    		[
    			-44,
    			-7
    		],
    		[
    			-55,
    			71
    		],
    		[
    			-71,
    			-5
    		],
    		[
    			-72,
    			63
    		],
    		[
    			24,
    			51
    		],
    		[
    			-35,
    			54
    		],
    		[
    			27,
    			49
    		],
    		[
    			-40,
    			35
    		],
    		[
    			-73,
    			206
    		],
    		[
    			-50,
    			-31
    		],
    		[
    			-72,
    			87
    		],
    		[
    			-37,
    			78
    		],
    		[
    			54,
    			136
    		],
    		[
    			-21,
    			65
    		],
    		[
    			10,
    			58
    		]
    	],
    	[
    		[
    			4787,
    			18614
    		],
    		[
    			-10,
    			37
    		],
    		[
    			-166,
    			87
    		]
    	],
    	[
    		[
    			4611,
    			18738
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			4611,
    			18741
    		],
    		[
    			-19,
    			64
    		],
    		[
    			-48,
    			75
    		],
    		[
    			-79,
    			156
    		],
    		[
    			-152,
    			144
    		],
    		[
    			-7,
    			47
    		],
    		[
    			-43,
    			39
    		],
    		[
    			-66,
    			-26
    		],
    		[
    			-39,
    			-79
    		],
    		[
    			-83,
    			-44
    		],
    		[
    			-15,
    			56
    		],
    		[
    			-199,
    			183
    		],
    		[
    			-29,
    			-25
    		],
    		[
    			-98,
    			22
    		],
    		[
    			0,
    			616
    		],
    		[
    			0,
    			168
    		],
    		[
    			1,
    			777
    		]
    	],
    	[
    		[
    			3735,
    			20914
    		],
    		[
    			108,
    			-5
    		],
    		[
    			122,
    			-64
    		],
    		[
    			149,
    			-48
    		],
    		[
    			99,
    			-15
    		],
    		[
    			0,
    			56
    		],
    		[
    			142,
    			53
    		],
    		[
    			125,
    			-22
    		],
    		[
    			23,
    			42
    		],
    		[
    			110,
    			24
    		],
    		[
    			95,
    			53
    		],
    		[
    			92,
    			0
    		],
    		[
    			27,
    			-46
    		],
    		[
    			74,
    			-11
    		],
    		[
    			76,
    			88
    		],
    		[
    			92,
    			-18
    		],
    		[
    			36,
    			-72
    		],
    		[
    			124,
    			-67
    		],
    		[
    			39,
    			113
    		],
    		[
    			112,
    			-112
    		],
    		[
    			60,
    			30
    		],
    		[
    			21,
    			51
    		],
    		[
    			120,
    			-4
    		],
    		[
    			170,
    			-77
    		],
    		[
    			119,
    			-18
    		],
    		[
    			82,
    			-40
    		],
    		[
    			136,
    			-22
    		],
    		[
    			78,
    			20
    		],
    		[
    			137,
    			-71
    		],
    		[
    			12,
    			-44
    		],
    		[
    			-105,
    			-25
    		],
    		[
    			14,
    			-58
    		],
    		[
    			125,
    			-18
    		],
    		[
    			120,
    			-2
    		],
    		[
    			154,
    			21
    		],
    		[
    			75,
    			34
    		],
    		[
    			39,
    			-50
    		],
    		[
    			55,
    			3
    		],
    		[
    			105,
    			-75
    		],
    		[
    			-6,
    			84
    		],
    		[
    			40,
    			47
    		],
    		[
    			86,
    			11
    		],
    		[
    			-25,
    			44
    		],
    		[
    			-166,
    			-26
    		],
    		[
    			34,
    			62
    		],
    		[
    			194,
    			48
    		],
    		[
    			86,
    			-26
    		],
    		[
    			22,
    			-70
    		],
    		[
    			62,
    			-39
    		],
    		[
    			101,
    			-1
    		],
    		[
    			40,
    			-30
    		],
    		[
    			145,
    			-36
    		],
    		[
    			114,
    			29
    		],
    		[
    			116,
    			-20
    		],
    		[
    			50,
    			31
    		],
    		[
    			22,
    			77
    		],
    		[
    			47,
    			28
    		],
    		[
    			185,
    			-73
    		],
    		[
    			-39,
    			-95
    		],
    		[
    			61,
    			-35
    		],
    		[
    			32,
    			122
    		],
    		[
    			58,
    			-4
    		],
    		[
    			114,
    			82
    		],
    		[
    			6,
    			52
    		],
    		[
    			-98,
    			-14
    		],
    		[
    			36,
    			97
    		],
    		[
    			-174,
    			80
    		],
    		[
    			-49,
    			72
    		],
    		[
    			36,
    			63
    		],
    		[
    			-37,
    			27
    		],
    		[
    			36,
    			103
    		],
    		[
    			163,
    			100
    		],
    		[
    			146,
    			-107
    		],
    		[
    			6,
    			-83
    		],
    		[
    			66,
    			-39
    		],
    		[
    			65,
    			-80
    		],
    		[
    			-98,
    			-63
    		],
    		[
    			73,
    			-46
    		],
    		[
    			98,
    			0
    		],
    		[
    			31,
    			-101
    		],
    		[
    			-15,
    			-74
    		],
    		[
    			48,
    			-33
    		],
    		[
    			69,
    			163
    		],
    		[
    			110,
    			-51
    		],
    		[
    			44,
    			-91
    		],
    		[
    			-59,
    			-68
    		],
    		[
    			89,
    			-102
    		],
    		[
    			79,
    			0
    		],
    		[
    			12,
    			54
    		],
    		[
    			61,
    			62
    		],
    		[
    			27,
    			115
    		],
    		[
    			82,
    			1
    		],
    		[
    			-55,
    			67
    		],
    		[
    			-21,
    			83
    		],
    		[
    			95,
    			36
    		],
    		[
    			309,
    			-112
    		],
    		[
    			-30,
    			-48
    		],
    		[
    			38,
    			-44
    		],
    		[
    			-117,
    			-28
    		],
    		[
    			34,
    			-95
    		],
    		[
    			84,
    			-73
    		],
    		[
    			-23,
    			-69
    		],
    		[
    			-108,
    			-83
    		],
    		[
    			-171,
    			-58
    		],
    		[
    			-85,
    			9
    		],
    		[
    			-61,
    			-19
    		],
    		[
    			-51,
    			-70
    		],
    		[
    			-88,
    			-71
    		],
    		[
    			-52,
    			1
    		],
    		[
    			-145,
    			90
    		],
    		[
    			34,
    			-90
    		],
    		[
    			173,
    			-10
    		],
    		[
    			29,
    			-17
    		],
    		[
    			-35,
    			-69
    		],
    		[
    			-121,
    			-124
    		],
    		[
    			-126,
    			7
    		],
    		[
    			-37,
    			-74
    		],
    		[
    			-73,
    			-22
    		],
    		[
    			34,
    			-75
    		],
    		[
    			-68,
    			-39
    		],
    		[
    			-69,
    			11
    		],
    		[
    			-42,
    			-94
    		],
    		[
    			-109,
    			-73
    		],
    		[
    			13,
    			-31
    		],
    		[
    			-111,
    			-206
    		],
    		[
    			-14,
    			-78
    		],
    		[
    			12,
    			-101
    		],
    		[
    			-17,
    			-58
    		],
    		[
    			45,
    			-54
    		],
    		[
    			121,
    			4
    		],
    		[
    			69,
    			-247
    		],
    		[
    			54,
    			-31
    		],
    		[
    			81,
    			31
    		],
    		[
    			103,
    			-43
    		],
    		[
    			107,
    			-27
    		],
    		[
    			82,
    			-63
    		],
    		[
    			46,
    			-75
    		],
    		[
    			178,
    			-77
    		],
    		[
    			81,
    			-54
    		],
    		[
    			85,
    			10
    		],
    		[
    			90,
    			-12
    		],
    		[
    			66,
    			-30
    		],
    		[
    			6,
    			-48
    		],
    		[
    			-21,
    			-93
    		],
    		[
    			29,
    			-63
    		],
    		[
    			1,
    			-93
    		],
    		[
    			-16,
    			-51
    		],
    		[
    			71,
    			-90
    		],
    		[
    			15,
    			-52
    		],
    		[
    			69,
    			-53
    		],
    		[
    			33,
    			-81
    		],
    		[
    			42,
    			-23
    		],
    		[
    			51,
    			82
    		],
    		[
    			49,
    			29
    		],
    		[
    			32,
    			103
    		],
    		[
    			-44,
    			90
    		],
    		[
    			-12,
    			87
    		],
    		[
    			2,
    			108
    		],
    		[
    			-37,
    			28
    		],
    		[
    			-10,
    			66
    		],
    		[
    			55,
    			18
    		],
    		[
    			112,
    			73
    		],
    		[
    			59,
    			58
    		],
    		[
    			63,
    			117
    		],
    		[
    			-9,
    			170
    		],
    		[
    			-20,
    			59
    		],
    		[
    			-64,
    			90
    		],
    		[
    			-99,
    			76
    		],
    		[
    			37,
    			89
    		],
    		[
    			31,
    			16
    		],
    		[
    			21,
    			68
    		]
    	],
    	[
    		[
    			6272,
    			21538
    		],
    		[
    			54,
    			-38
    		],
    		[
    			184,
    			-43
    		],
    		[
    			128,
    			-53
    		],
    		[
    			81,
    			58
    		],
    		[
    			108,
    			-51
    		],
    		[
    			6,
    			-47
    		],
    		[
    			85,
    			-30
    		],
    		[
    			-38,
    			152
    		],
    		[
    			19,
    			47
    		],
    		[
    			103,
    			-6
    		],
    		[
    			149,
    			-89
    		],
    		[
    			43,
    			-144
    		],
    		[
    			52,
    			-55
    		],
    		[
    			-26,
    			-74
    		],
    		[
    			106,
    			-94
    		],
    		[
    			79,
    			-12
    		],
    		[
    			109,
    			-62
    		],
    		[
    			58,
    			-77
    		],
    		[
    			-147,
    			20
    		],
    		[
    			52,
    			-65
    		],
    		[
    			13,
    			-67
    		],
    		[
    			-107,
    			-35
    		],
    		[
    			-214,
    			16
    		],
    		[
    			-66,
    			47
    		],
    		[
    			-106,
    			6
    		],
    		[
    			-56,
    			-40
    		],
    		[
    			-96,
    			-13
    		],
    		[
    			-116,
    			-45
    		],
    		[
    			-325,
    			-21
    		],
    		[
    			-53,
    			54
    		],
    		[
    			3,
    			64
    		],
    		[
    			-221,
    			15
    		],
    		[
    			-126,
    			82
    		],
    		[
    			-9,
    			42
    		],
    		[
    			277,
    			48
    		],
    		[
    			173,
    			-18
    		],
    		[
    			55,
    			46
    		],
    		[
    			-167,
    			36
    		],
    		[
    			-108,
    			-18
    		],
    		[
    			-245,
    			-1
    		],
    		[
    			-86,
    			64
    		],
    		[
    			86,
    			68
    		],
    		[
    			-39,
    			49
    		],
    		[
    			-110,
    			-2
    		],
    		[
    			54,
    			88
    		],
    		[
    			4,
    			54
    		],
    		[
    			110,
    			67
    		],
    		[
    			270,
    			77
    		]
    	],
    	[
    		[
    			7167,
    			21601
    		],
    		[
    			67,
    			-33
    		],
    		[
    			-49,
    			-89
    		],
    		[
    			-44,
    			-17
    		],
    		[
    			-95,
    			77
    		],
    		[
    			-21,
    			51
    		],
    		[
    			142,
    			11
    		]
    	],
    	[
    		[
    			9533,
    			21604
    		],
    		[
    			93,
    			-22
    		],
    		[
    			128,
    			6
    		],
    		[
    			88,
    			-26
    		],
    		[
    			93,
    			-72
    		],
    		[
    			-22,
    			-45
    		],
    		[
    			-337,
    			8
    		],
    		[
    			-73,
    			69
    		],
    		[
    			30,
    			82
    		]
    	],
    	[
    		[
    			8989,
    			21619
    		],
    		[
    			124,
    			-19
    		],
    		[
    			-123,
    			-81
    		],
    		[
    			-60,
    			-90
    		],
    		[
    			49,
    			-52
    		],
    		[
    			-16,
    			-66
    		],
    		[
    			60,
    			-9
    		],
    		[
    			76,
    			48
    		],
    		[
    			-69,
    			67
    		],
    		[
    			71,
    			119
    		],
    		[
    			201,
    			63
    		],
    		[
    			119,
    			-1
    		],
    		[
    			49,
    			-82
    		],
    		[
    			57,
    			-25
    		],
    		[
    			1,
    			-118
    		],
    		[
    			149,
    			-19
    		],
    		[
    			130,
    			81
    		],
    		[
    			232,
    			-45
    		],
    		[
    			13,
    			-61
    		],
    		[
    			188,
    			-140
    		],
    		[
    			46,
    			61
    		],
    		[
    			100,
    			-27
    		],
    		[
    			38,
    			-40
    		],
    		[
    			-90,
    			-29
    		],
    		[
    			-9,
    			-50
    		],
    		[
    			160,
    			24
    		],
    		[
    			206,
    			-58
    		],
    		[
    			91,
    			-85
    		],
    		[
    			-62,
    			-51
    		],
    		[
    			32,
    			-97
    		],
    		[
    			-37,
    			-83
    		],
    		[
    			153,
    			-90
    		],
    		[
    			149,
    			-38
    		],
    		[
    			84,
    			-53
    		],
    		[
    			19,
    			-63
    		],
    		[
    			71,
    			-48
    		],
    		[
    			117,
    			4
    		],
    		[
    			59,
    			-49
    		],
    		[
    			-140,
    			-183
    		],
    		[
    			-57,
    			12
    		],
    		[
    			-17,
    			-109
    		],
    		[
    			-108,
    			21
    		],
    		[
    			-210,
    			241
    		],
    		[
    			-29,
    			-89
    		],
    		[
    			-76,
    			-21
    		],
    		[
    			-3,
    			-36
    		],
    		[
    			154,
    			-133
    		],
    		[
    			67,
    			-12
    		],
    		[
    			-5,
    			-53
    		],
    		[
    			117,
    			-140
    		],
    		[
    			2,
    			-59
    		],
    		[
    			-45,
    			-117
    		],
    		[
    			-87,
    			64
    		],
    		[
    			-86,
    			15
    		],
    		[
    			-71,
    			65
    		],
    		[
    			-115,
    			46
    		],
    		[
    			50,
    			-89
    		],
    		[
    			73,
    			-43
    		],
    		[
    			117,
    			-106
    		],
    		[
    			23,
    			-78
    		],
    		[
    			-201,
    			58
    		],
    		[
    			-47,
    			5
    		],
    		[
    			-98,
    			68
    		],
    		[
    			-196,
    			79
    		],
    		[
    			33,
    			67
    		],
    		[
    			-118,
    			49
    		],
    		[
    			-40,
    			58
    		],
    		[
    			-74,
    			58
    		],
    		[
    			-67,
    			9
    		],
    		[
    			-31,
    			-32
    		],
    		[
    			-70,
    			26
    		],
    		[
    			-134,
    			-54
    		],
    		[
    			-98,
    			25
    		],
    		[
    			-26,
    			99
    		],
    		[
    			79,
    			41
    		],
    		[
    			-10,
    			45
    		],
    		[
    			135,
    			-35
    		],
    		[
    			141,
    			12
    		],
    		[
    			77,
    			75
    		],
    		[
    			-61,
    			74
    		],
    		[
    			93,
    			59
    		],
    		[
    			110,
    			113
    		],
    		[
    			-70,
    			160
    		],
    		[
    			-85,
    			24
    		],
    		[
    			-142,
    			102
    		],
    		[
    			-101,
    			-45
    		],
    		[
    			-23,
    			43
    		],
    		[
    			100,
    			50
    		],
    		[
    			-200,
    			99
    		],
    		[
    			4,
    			57
    		],
    		[
    			-70,
    			7
    		],
    		[
    			-47,
    			-53
    		],
    		[
    			-271,
    			31
    		],
    		[
    			-41,
    			-44
    		],
    		[
    			-87,
    			34
    		],
    		[
    			-72,
    			-9
    		],
    		[
    			-265,
    			47
    		],
    		[
    			-124,
    			0
    		],
    		[
    			-141,
    			93
    		],
    		[
    			12,
    			40
    		],
    		[
    			177,
    			-14
    		],
    		[
    			-46,
    			52
    		],
    		[
    			-187,
    			11
    		],
    		[
    			-24,
    			46
    		],
    		[
    			11,
    			135
    		],
    		[
    			88,
    			145
    		],
    		[
    			95,
    			61
    		],
    		[
    			180,
    			35
    		]
    	],
    	[
    		[
    			7682,
    			21631
    		],
    		[
    			54,
    			-33
    		],
    		[
    			193,
    			20
    		],
    		[
    			24,
    			-36
    		],
    		[
    			-123,
    			-95
    		],
    		[
    			91,
    			-17
    		],
    		[
    			96,
    			-93
    		],
    		[
    			-24,
    			-95
    		],
    		[
    			-193,
    			-90
    		],
    		[
    			-205,
    			150
    		],
    		[
    			-102,
    			16
    		],
    		[
    			-93,
    			72
    		],
    		[
    			70,
    			58
    		],
    		[
    			69,
    			-61
    		],
    		[
    			115,
    			32
    		],
    		[
    			-46,
    			64
    		],
    		[
    			-92,
    			35
    		],
    		[
    			53,
    			54
    		],
    		[
    			113,
    			19
    		]
    	],
    	[
    		[
    			8285,
    			21672
    		],
    		[
    			317,
    			-45
    		],
    		[
    			-140,
    			-153
    		],
    		[
    			-65,
    			-48
    		],
    		[
    			-154,
    			12
    		],
    		[
    			45,
    			-55
    		],
    		[
    			-61,
    			-76
    		],
    		[
    			-107,
    			1
    		],
    		[
    			7,
    			79
    		],
    		[
    			-65,
    			61
    		],
    		[
    			11,
    			134
    		],
    		[
    			36,
    			57
    		],
    		[
    			176,
    			33
    		]
    	],
    	[
    		[
    			5612,
    			21733
    		],
    		[
    			181,
    			-55
    		],
    		[
    			137,
    			12
    		],
    		[
    			90,
    			-20
    		],
    		[
    			177,
    			-114
    		],
    		[
    			-371,
    			-144
    		],
    		[
    			-92,
    			-64
    		],
    		[
    			-36,
    			-116
    		],
    		[
    			-118,
    			-15
    		],
    		[
    			-102,
    			-63
    		],
    		[
    			-61,
    			23
    		],
    		[
    			-81,
    			89
    		],
    		[
    			-140,
    			34
    		],
    		[
    			-4,
    			28
    		],
    		[
    			127,
    			138
    		],
    		[
    			-39,
    			26
    		],
    		[
    			100,
    			122
    		],
    		[
    			-61,
    			41
    		],
    		[
    			40,
    			56
    		],
    		[
    			253,
    			22
    		]
    	],
    	[
    		[
    			8167,
    			21914
    		],
    		[
    			118,
    			-60
    		],
    		[
    			3,
    			-90
    		],
    		[
    			-120,
    			-15
    		],
    		[
    			-111,
    			33
    		],
    		[
    			-57,
    			61
    		],
    		[
    			82,
    			60
    		],
    		[
    			85,
    			11
    		]
    	],
    	[
    		[
    			7806,
    			22092
    		],
    		[
    			78,
    			-33
    		],
    		[
    			25,
    			-132
    		],
    		[
    			-56,
    			-37
    		],
    		[
    			38,
    			-59
    		],
    		[
    			-83,
    			-21
    		],
    		[
    			-157,
    			-2
    		],
    		[
    			-41,
    			36
    		],
    		[
    			53,
    			79
    		],
    		[
    			-193,
    			-21
    		],
    		[
    			33,
    			72
    		],
    		[
    			-43,
    			55
    		],
    		[
    			177,
    			55
    		],
    		[
    			169,
    			8
    		]
    	],
    	[
    		[
    			6836,
    			22113
    		],
    		[
    			73,
    			-124
    		],
    		[
    			66,
    			-26
    		],
    		[
    			122,
    			16
    		],
    		[
    			49,
    			-64
    		],
    		[
    			-67,
    			-88
    		],
    		[
    			-108,
    			-32
    		],
    		[
    			-125,
    			18
    		],
    		[
    			-170,
    			-28
    		],
    		[
    			-131,
    			-59
    		],
    		[
    			-133,
    			-16
    		],
    		[
    			-130,
    			41
    		],
    		[
    			149,
    			56
    		],
    		[
    			-272,
    			-2
    		],
    		[
    			-154,
    			34
    		],
    		[
    			65,
    			159
    		],
    		[
    			98,
    			52
    		],
    		[
    			136,
    			7
    		],
    		[
    			237,
    			-92
    		],
    		[
    			36,
    			-62
    		],
    		[
    			199,
    			-6
    		],
    		[
    			-67,
    			64
    		],
    		[
    			42,
    			47
    		],
    		[
    			-84,
    			37
    		],
    		[
    			169,
    			68
    		]
    	],
    	[
    		[
    			8078,
    			22156
    		],
    		[
    			159,
    			-22
    		],
    		[
    			84,
    			-57
    		],
    		[
    			160,
    			16
    		],
    		[
    			80,
    			-20
    		],
    		[
    			63,
    			-101
    		],
    		[
    			175,
    			-76
    		],
    		[
    			187,
    			-1
    		],
    		[
    			365,
    			56
    		],
    		[
    			119,
    			-13
    		],
    		[
    			153,
    			-64
    		],
    		[
    			16,
    			-82
    		],
    		[
    			-86,
    			-52
    		],
    		[
    			-147,
    			-20
    		],
    		[
    			-162,
    			21
    		],
    		[
    			-76,
    			-13
    		],
    		[
    			-257,
    			-8
    		],
    		[
    			-289,
    			11
    		],
    		[
    			-199,
    			41
    		],
    		[
    			-45,
    			74
    		],
    		[
    			49,
    			65
    		],
    		[
    			-106,
    			127
    		],
    		[
    			-73,
    			-17
    		],
    		[
    			-202,
    			28
    		],
    		[
    			-87,
    			81
    		],
    		[
    			119,
    			26
    		]
    	],
    	[
    		[
    			6091,
    			22237
    		],
    		[
    			89,
    			-32
    		],
    		[
    			-83,
    			-40
    		],
    		[
    			43,
    			-72
    		],
    		[
    			-353,
    			-101
    		],
    		[
    			-177,
    			-25
    		],
    		[
    			-144,
    			41
    		],
    		[
    			132,
    			43
    		],
    		[
    			230,
    			148
    		],
    		[
    			263,
    			38
    		]
    	],
    	[
    		[
    			8100,
    			22276
    		],
    		[
    			209,
    			-9
    		],
    		[
    			-23,
    			-43
    		],
    		[
    			-232,
    			-1
    		],
    		[
    			46,
    			53
    		]
    	],
    	[
    		[
    			6707,
    			22331
    		],
    		[
    			28,
    			-25
    		],
    		[
    			-73,
    			-84
    		],
    		[
    			-150,
    			-22
    		],
    		[
    			-113,
    			32
    		],
    		[
    			-10,
    			57
    		],
    		[
    			84,
    			24
    		],
    		[
    			234,
    			18
    		]
    	],
    	[
    		[
    			6666,
    			22440
    		],
    		[
    			97,
    			-34
    		],
    		[
    			-95,
    			-47
    		],
    		[
    			-178,
    			45
    		],
    		[
    			176,
    			36
    		]
    	],
    	[
    		[
    			7957,
    			22429
    		],
    		[
    			197,
    			-58
    		],
    		[
    			-47,
    			-64
    		],
    		[
    			-146,
    			-30
    		],
    		[
    			-87,
    			40
    		],
    		[
    			-60,
    			124
    		],
    		[
    			143,
    			-12
    		]
    	],
    	[
    		[
    			7289,
    			22542
    		],
    		[
    			218,
    			-52
    		],
    		[
    			202,
    			-80
    		],
    		[
    			54,
    			-88
    		],
    		[
    			-127,
    			-41
    		],
    		[
    			-124,
    			71
    		],
    		[
    			-152,
    			22
    		],
    		[
    			-93,
    			103
    		],
    		[
    			22,
    			65
    		]
    	],
    	[
    		[
    			8285,
    			22876
    		],
    		[
    			129,
    			-24
    		],
    		[
    			146,
    			-110
    		],
    		[
    			281,
    			-27
    		],
    		[
    			105,
    			-125
    		],
    		[
    			163,
    			-65
    		],
    		[
    			-135,
    			-30
    		],
    		[
    			-216,
    			-112
    		],
    		[
    			-234,
    			-47
    		],
    		[
    			-188,
    			46
    		],
    		[
    			-131,
    			96
    		],
    		[
    			171,
    			52
    		],
    		[
    			-308,
    			18
    		],
    		[
    			18,
    			37
    		],
    		[
    			-118,
    			76
    		],
    		[
    			74,
    			82
    		],
    		[
    			132,
    			10
    		],
    		[
    			-55,
    			65
    		],
    		[
    			166,
    			58
    		]
    	],
    	[
    		[
    			10536,
    			23167
    		],
    		[
    			90,
    			-20
    		],
    		[
    			416,
    			-15
    		],
    		[
    			336,
    			-109
    		],
    		[
    			-164,
    			-54
    		],
    		[
    			-192,
    			-28
    		],
    		[
    			11,
    			-65
    		],
    		[
    			-130,
    			-27
    		],
    		[
    			-354,
    			-144
    		],
    		[
    			-122,
    			-94
    		],
    		[
    			-390,
    			-69
    		],
    		[
    			69,
    			-57
    		],
    		[
    			-109,
    			-152
    		],
    		[
    			-347,
    			-140
    		],
    		[
    			33,
    			-61
    		],
    		[
    			105,
    			-42
    		],
    		[
    			-68,
    			-37
    		],
    		[
    			-210,
    			-49
    		],
    		[
    			-63,
    			57
    		],
    		[
    			-292,
    			-30
    		],
    		[
    			-316,
    			4
    		],
    		[
    			-137,
    			13
    		],
    		[
    			-39,
    			72
    		],
    		[
    			178,
    			84
    		],
    		[
    			-45,
    			78
    		],
    		[
    			64,
    			50
    		],
    		[
    			55,
    			101
    		],
    		[
    			172,
    			33
    		],
    		[
    			59,
    			81
    		],
    		[
    			-175,
    			57
    		],
    		[
    			-21,
    			93
    		],
    		[
    			270,
    			-12
    		],
    		[
    			202,
    			63
    		],
    		[
    			-342,
    			-17
    		],
    		[
    			-226,
    			20
    		],
    		[
    			-166,
    			37
    		],
    		[
    			-211,
    			154
    		],
    		[
    			439,
    			76
    		],
    		[
    			163,
    			44
    		],
    		[
    			241,
    			-33
    		],
    		[
    			42,
    			65
    		],
    		[
    			263,
    			50
    		],
    		[
    			321,
    			14
    		],
    		[
    			238,
    			-19
    		],
    		[
    			352,
    			28
    		]
    	],
    	[
    		[
    			26508,
    			7226
    		],
    		[
    			-1,
    			-1
    		],
    		[
    			-1,
    			4
    		],
    		[
    			1,
    			1
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			18149,
    			17170
    		],
    		[
    			-5,
    			-14
    		],
    		[
    			11,
    			-22
    		]
    	],
    	[
    		[
    			18238,
    			17101
    		],
    		[
    			-32,
    			-72
    		],
    		[
    			-81,
    			-17
    		],
    		[
    			-33,
    			-81
    		],
    		[
    			-47,
    			69
    		],
    		[
    			-63,
    			-55
    		],
    		[
    			-73,
    			1
    		]
    	],
    	[
    		[
    			17909,
    			16946
    		],
    		[
    			-22,
    			83
    		],
    		[
    			-66,
    			26
    		],
    		[
    			71,
    			97
    		],
    		[
    			12,
    			56
    		],
    		[
    			57,
    			13
    		]
    	],
    	[
    		[
    			17961,
    			17221
    		],
    		[
    			60,
    			7
    		],
    		[
    			35,
    			31
    		],
    		[
    			93,
    			-44
    		]
    	],
    	[
    		[
    			10677,
    			65
    		],
    		[
    			30,
    			-59
    		],
    		[
    			-158,
    			0
    		],
    		[
    			-3,
    			36
    		],
    		[
    			131,
    			23
    		]
    	],
    	[
    		[
    			10715,
    			67
    		],
    		[
    			76,
    			-2
    		],
    		[
    			8,
    			-65
    		],
    		[
    			-90,
    			20
    		],
    		[
    			6,
    			47
    		]
    	],
    	[
    		[
    			10384,
    			228
    		],
    		[
    			55,
    			-26
    		],
    		[
    			-15,
    			-49
    		],
    		[
    			-50,
    			30
    		],
    		[
    			10,
    			45
    		]
    	],
    	[
    		[
    			10486,
    			292
    		],
    		[
    			14,
    			-74
    		],
    		[
    			-53,
    			19
    		],
    		[
    			39,
    			55
    		]
    	],
    	[
    		[
    			10240,
    			323
    		],
    		[
    			88,
    			-69
    		],
    		[
    			-38,
    			-51
    		],
    		[
    			-68,
    			27
    		],
    		[
    			-16,
    			63
    		],
    		[
    			34,
    			30
    		]
    	],
    	[
    		[
    			10327,
    			444
    		],
    		[
    			72,
    			-24
    		],
    		[
    			-131,
    			-101
    		],
    		[
    			-39,
    			23
    		],
    		[
    			98,
    			102
    		]
    	],
    	[
    		[
    			10389,
    			149
    		],
    		[
    			51,
    			-6
    		],
    		[
    			14,
    			52
    		],
    		[
    			59,
    			-42
    		],
    		[
    			6,
    			109
    		],
    		[
    			79,
    			44
    		],
    		[
    			-6,
    			22
    		],
    		[
    			-103,
    			-2
    		],
    		[
    			3,
    			58
    		],
    		[
    			50,
    			29
    		],
    		[
    			49,
    			63
    		],
    		[
    			25,
    			-40
    		],
    		[
    			50,
    			7
    		]
    	],
    	[
    		[
    			10666,
    			69
    		],
    		[
    			-161,
    			7
    		],
    		[
    			-132,
    			40
    		],
    		[
    			16,
    			33
    		]
    	],
    	[
    		[
    			10080,
    			981
    		],
    		[
    			-33,
    			101
    		],
    		[
    			32,
    			28
    		],
    		[
    			28,
    			-50
    		],
    		[
    			4,
    			-155
    		],
    		[
    			-43,
    			-22
    		],
    		[
    			12,
    			98
    		]
    	],
    	[
    		[
    			10246,
    			1830
    		],
    		[
    			29,
    			-26
    		],
    		[
    			-50,
    			-67
    		],
    		[
    			-21,
    			34
    		],
    		[
    			42,
    			59
    		]
    	],
    	[
    		[
    			10159,
    			2264
    		],
    		[
    			34,
    			-24
    		],
    		[
    			18,
    			-47
    		],
    		[
    			-41,
    			-68
    		],
    		[
    			30,
    			-84
    		],
    		[
    			-31,
    			-50
    		],
    		[
    			-58,
    			30
    		],
    		[
    			22,
    			57
    		],
    		[
    			-2,
    			76
    		],
    		[
    			28,
    			110
    		]
    	],
    	[
    		[
    			10683,
    			487
    		],
    		[
    			-74,
    			34
    		],
    		[
    			-33,
    			-45
    		],
    		[
    			-120,
    			-50
    		],
    		[
    			-17,
    			-103
    		],
    		[
    			2,
    			-68
    		],
    		[
    			-32,
    			-19
    		],
    		[
    			-77,
    			34
    		],
    		[
    			-29,
    			33
    		],
    		[
    			12,
    			43
    		],
    		[
    			84,
    			18
    		],
    		[
    			27,
    			40
    		],
    		[
    			-40,
    			54
    		],
    		[
    			-60,
    			10
    		],
    		[
    			-123,
    			-82
    		],
    		[
    			-23,
    			62
    		],
    		[
    			11,
    			108
    		],
    		[
    			-63,
    			179
    		],
    		[
    			-10,
    			91
    		],
    		[
    			-35,
    			29
    		],
    		[
    			41,
    			67
    		],
    		[
    			-16,
    			168
    		],
    		[
    			36,
    			67
    		],
    		[
    			-57,
    			63
    		],
    		[
    			72,
    			-2
    		],
    		[
    			-4,
    			34
    		],
    		[
    			-75,
    			22
    		],
    		[
    			56,
    			125
    		],
    		[
    			-80,
    			32
    		],
    		[
    			-32,
    			61
    		],
    		[
    			35,
    			25
    		],
    		[
    			-14,
    			60
    		],
    		[
    			96,
    			11
    		],
    		[
    			43,
    			-27
    		],
    		[
    			14,
    			86
    		],
    		[
    			20,
    			25
    		],
    		[
    			-7,
    			60
    		],
    		[
    			59,
    			37
    		],
    		[
    			7,
    			34
    		],
    		[
    			-58,
    			71
    		],
    		[
    			32,
    			80
    		],
    		[
    			-15,
    			32
    		],
    		[
    			25,
    			102
    		],
    		[
    			3,
    			145
    		],
    		[
    			17,
    			43
    		],
    		[
    			-40,
    			30
    		],
    		[
    			-41,
    			-44
    		],
    		[
    			-37,
    			55
    		],
    		[
    			-8,
    			82
    		],
    		[
    			22,
    			73
    		],
    		[
    			0,
    			90
    		],
    		[
    			27,
    			24
    		],
    		[
    			22,
    			82
    		],
    		[
    			-27,
    			119
    		],
    		[
    			3,
    			90
    		],
    		[
    			-22,
    			82
    		],
    		[
    			4,
    			72
    		],
    		[
    			35,
    			-5
    		],
    		[
    			17,
    			84
    		],
    		[
    			28,
    			76
    		],
    		[
    			16,
    			113
    		],
    		[
    			43,
    			87
    		],
    		[
    			21,
    			126
    		],
    		[
    			-4,
    			34
    		],
    		[
    			40,
    			98
    		],
    		[
    			-12,
    			55
    		],
    		[
    			30,
    			138
    		],
    		[
    			-13,
    			33
    		],
    		[
    			3,
    			72
    		],
    		[
    			-15,
    			102
    		],
    		[
    			-4,
    			91
    		],
    		[
    			40,
    			110
    		],
    		[
    			-4,
    			103
    		],
    		[
    			-18,
    			69
    		],
    		[
    			34,
    			95
    		],
    		[
    			2,
    			62
    		],
    		[
    			24,
    			88
    		],
    		[
    			-7,
    			48
    		],
    		[
    			33,
    			139
    		],
    		[
    			-10,
    			93
    		],
    		[
    			28,
    			90
    		],
    		[
    			-14,
    			89
    		],
    		[
    			8,
    			151
    		],
    		[
    			-11,
    			53
    		],
    		[
    			24,
    			76
    		],
    		[
    			21,
    			236
    		],
    		[
    			9,
    			33
    		],
    		[
    			-14,
    			151
    		],
    		[
    			7,
    			90
    		],
    		[
    			-23,
    			201
    		],
    		[
    			-1,
    			74
    		]
    	],
    	[
    		[
    			10497,
    			6186
    		],
    		[
    			42,
    			19
    		],
    		[
    			18,
    			50
    		],
    		[
    			-7,
    			40
    		],
    		[
    			33,
    			34
    		]
    	],
    	[
    		[
    			27836,
    			12625
    		],
    		[
    			22,
    			-18
    		],
    		[
    			4,
    			-62
    		],
    		[
    			-40,
    			-86
    		],
    		[
    			-13,
    			-75
    		],
    		[
    			-65,
    			-54
    		],
    		[
    			-17,
    			-27
    		],
    		[
    			-74,
    			48
    		],
    		[
    			-16,
    			57
    		],
    		[
    			5,
    			92
    		],
    		[
    			50,
    			51
    		],
    		[
    			6,
    			38
    		],
    		[
    			81,
    			11
    		],
    		[
    			57,
    			25
    		]
    	],
    	[
    		[
    			29744,
    			16356
    		],
    		[
    			-75,
    			91
    		],
    		[
    			-10,
    			-82
    		],
    		[
    			-48,
    			-15
    		],
    		[
    			-32,
    			-62
    		],
    		[
    			-62,
    			5
    		],
    		[
    			-14,
    			-110
    		],
    		[
    			-74,
    			14
    		],
    		[
    			-44,
    			55
    		],
    		[
    			-29,
    			-30
    		],
    		[
    			-30,
    			-77
    		],
    		[
    			-32,
    			-46
    		],
    		[
    			-115,
    			-85
    		],
    		[
    			-36,
    			-62
    		]
    	],
    	[
    		[
    			29143,
    			15952
    		],
    		[
    			-33,
    			-32
    		],
    		[
    			-68,
    			-5
    		],
    		[
    			-96,
    			-69
    		],
    		[
    			-24,
    			-47
    		],
    		[
    			-32,
    			49
    		],
    		[
    			-17,
    			80
    		],
    		[
    			23,
    			9
    		],
    		[
    			49,
    			97
    		],
    		[
    			-23,
    			41
    		],
    		[
    			-55,
    			27
    		],
    		[
    			-48,
    			-12
    		],
    		[
    			-48,
    			-102
    		],
    		[
    			-90,
    			-54
    		],
    		[
    			-50,
    			-115
    		],
    		[
    			-65,
    			-28
    		],
    		[
    			-47,
    			24
    		],
    		[
    			-28,
    			-95
    		],
    		[
    			52,
    			-80
    		],
    		[
    			42,
    			-8
    		],
    		[
    			29,
    			22
    		],
    		[
    			23,
    			-86
    		],
    		[
    			-8,
    			-68
    		],
    		[
    			69,
    			-26
    		],
    		[
    			56,
    			89
    		],
    		[
    			62,
    			22
    		],
    		[
    			62,
    			-63
    		],
    		[
    			51,
    			20
    		],
    		[
    			34,
    			-29
    		],
    		[
    			6,
    			-67
    		],
    		[
    			-50,
    			-1
    		],
    		[
    			-83,
    			-49
    		],
    		[
    			-186,
    			-272
    		],
    		[
    			-3,
    			-34
    		],
    		[
    			58,
    			-63
    		],
    		[
    			48,
    			-28
    		],
    		[
    			24,
    			-130
    		],
    		[
    			29,
    			-92
    		],
    		[
    			1,
    			-57
    		],
    		[
    			41,
    			-33
    		],
    		[
    			13,
    			-54
    		],
    		[
    			-39,
    			-61
    		],
    		[
    			69,
    			-81
    		],
    		[
    			16,
    			-49
    		],
    		[
    			-86,
    			-71
    		],
    		[
    			37,
    			-46
    		],
    		[
    			48,
    			-86
    		],
    		[
    			6,
    			-94
    		],
    		[
    			-35,
    			-14
    		],
    		[
    			5,
    			-131
    		],
    		[
    			-41,
    			9
    		],
    		[
    			-58,
    			-133
    		],
    		[
    			-7,
    			-61
    		],
    		[
    			-27,
    			-51
    		],
    		[
    			-52,
    			-19
    		],
    		[
    			8,
    			-67
    		],
    		[
    			-14,
    			-84
    		],
    		[
    			-48,
    			-83
    		],
    		[
    			-25,
    			-88
    		],
    		[
    			-27,
    			-53
    		],
    		[
    			-51,
    			6
    		],
    		[
    			8,
    			-58
    		],
    		[
    			-26,
    			-38
    		],
    		[
    			-92,
    			-66
    		],
    		[
    			-39,
    			-116
    		],
    		[
    			-23,
    			0
    		],
    		[
    			-76,
    			-41
    		],
    		[
    			-38,
    			16
    		],
    		[
    			-16,
    			-34
    		],
    		[
    			-64,
    			-6
    		]
    	],
    	[
    		[
    			28174,
    			13033
    		],
    		[
    			-19,
    			-9
    		]
    	],
    	[
    		[
    			28155,
    			13024
    		],
    		[
    			-41,
    			53
    		],
    		[
    			-6,
    			-102
    		]
    	],
    	[
    		[
    			28108,
    			12975
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			28107,
    			12974
    		],
    		[
    			-61,
    			-59
    		],
    		[
    			-59,
    			-26
    		],
    		[
    			-15,
    			17
    		],
    		[
    			-44,
    			-44
    		],
    		[
    			-100,
    			-29
    		],
    		[
    			-44,
    			-63
    		],
    		[
    			32,
    			-73
    		],
    		[
    			-35,
    			-51
    		],
    		[
    			-38,
    			71
    		],
    		[
    			4,
    			95
    		],
    		[
    			-23,
    			44
    		],
    		[
    			-37,
    			-16
    		],
    		[
    			-8,
    			38
    		],
    		[
    			-44,
    			15
    		],
    		[
    			-56,
    			-29
    		]
    	],
    	[
    		[
    			27579,
    			12864
    		],
    		[
    			-75,
    			26
    		],
    		[
    			-49,
    			51
    		],
    		[
    			-16,
    			76
    		],
    		[
    			25,
    			53
    		],
    		[
    			-120,
    			52
    		],
    		[
    			-24,
    			51
    		],
    		[
    			-48,
    			-46
    		],
    		[
    			4,
    			-29
    		],
    		[
    			-59,
    			-18
    		],
    		[
    			-27,
    			-56
    		],
    		[
    			-31,
    			49
    		],
    		[
    			-26,
    			1
    		],
    		[
    			-30,
    			-59
    		],
    		[
    			-56,
    			55
    		],
    		[
    			-31,
    			-63
    		]
    	],
    	[
    		[
    			27016,
    			13007
    		],
    		[
    			-39,
    			16
    		],
    		[
    			-13,
    			-61
    		],
    		[
    			21,
    			-91
    		],
    		[
    			-9,
    			-39
    		],
    		[
    			-42,
    			-31
    		],
    		[
    			-14,
    			66
    		]
    	],
    	[
    		[
    			26920,
    			12867
    		],
    		[
    			-25,
    			19
    		],
    		[
    			-29,
    			-38
    		],
    		[
    			-43,
    			10
    		],
    		[
    			-12,
    			77
    		],
    		[
    			-81,
    			32
    		],
    		[
    			22,
    			57
    		],
    		[
    			12,
    			97
    		],
    		[
    			-39,
    			1
    		],
    		[
    			-17,
    			30
    		],
    		[
    			-24,
    			108
    		],
    		[
    			4,
    			36
    		],
    		[
    			-95,
    			-3
    		],
    		[
    			-17,
    			61
    		],
    		[
    			17,
    			99
    		],
    		[
    			66,
    			91
    		],
    		[
    			35,
    			166
    		],
    		[
    			-8,
    			158
    		],
    		[
    			-45,
    			28
    		],
    		[
    			-7,
    			66
    		],
    		[
    			-41,
    			65
    		],
    		[
    			-36,
    			-49
    		]
    	],
    	[
    		[
    			25750,
    			13822
    		],
    		[
    			-14,
    			33
    		],
    		[
    			10,
    			71
    		],
    		[
    			-23,
    			37
    		],
    		[
    			-48,
    			-39
    		]
    	],
    	[
    		[
    			25675,
    			13924
    		],
    		[
    			-40,
    			-12
    		],
    		[
    			-58,
    			6
    		],
    		[
    			-53,
    			42
    		],
    		[
    			-10,
    			-31
    		],
    		[
    			-40,
    			-2
    		],
    		[
    			-18,
    			46
    		],
    		[
    			-58,
    			18
    		],
    		[
    			-80,
    			96
    		],
    		[
    			-28,
    			73
    		],
    		[
    			-50,
    			-19
    		],
    		[
    			-32,
    			66
    		],
    		[
    			-54,
    			32
    		],
    		[
    			-68,
    			94
    		],
    		[
    			-34,
    			21
    		],
    		[
    			-57,
    			-41
    		]
    	],
    	[
    		[
    			24995,
    			14313
    		],
    		[
    			-78,
    			63
    		]
    	],
    	[
    		[
    			24917,
    			14376
    		],
    		[
    			-26,
    			49
    		]
    	],
    	[
    		[
    			24891,
    			14425
    		],
    		[
    			-50,
    			31
    		]
    	],
    	[
    		[
    			24789,
    			14492
    		],
    		[
    			-15,
    			39
    		],
    		[
    			4,
    			72
    		]
    	],
    	[
    		[
    			24778,
    			14603
    		],
    		[
    			-29,
    			50
    		]
    	],
    	[
    		[
    			24749,
    			14653
    		],
    		[
    			-7,
    			47
    		]
    	],
    	[
    		[
    			24406,
    			15489
    		],
    		[
    			24,
    			34
    		],
    		[
    			-34,
    			125
    		],
    		[
    			8,
    			53
    		],
    		[
    			-46,
    			26
    		],
    		[
    			-55,
    			-4
    		],
    		[
    			-15,
    			140
    		]
    	],
    	[
    		[
    			24288,
    			15863
    		],
    		[
    			36,
    			103
    		],
    		[
    			30,
    			0
    		],
    		[
    			45,
    			62
    		],
    		[
    			145,
    			-14
    		],
    		[
    			19,
    			16
    		],
    		[
    			32,
    			93
    		],
    		[
    			77,
    			-4
    		],
    		[
    			50,
    			14
    		],
    		[
    			19,
    			54
    		],
    		[
    			85,
    			64
    		],
    		[
    			38,
    			1
    		],
    		[
    			55,
    			72
    		]
    	],
    	[
    		[
    			24919,
    			16324
    		],
    		[
    			-7,
    			69
    		],
    		[
    			23,
    			71
    		],
    		[
    			37,
    			20
    		],
    		[
    			-44,
    			218
    		],
    		[
    			6,
    			96
    		],
    		[
    			101,
    			36
    		],
    		[
    			75,
    			-6
    		],
    		[
    			76,
    			331
    		],
    		[
    			96,
    			-41
    		],
    		[
    			143,
    			16
    		],
    		[
    			17,
    			53
    		],
    		[
    			-16,
    			94
    		],
    		[
    			19,
    			72
    		],
    		[
    			81,
    			29
    		],
    		[
    			26,
    			95
    		],
    		[
    			44,
    			-2
    		]
    	],
    	[
    		[
    			25596,
    			17475
    		],
    		[
    			49,
    			14
    		]
    	],
    	[
    		[
    			25645,
    			17489
    		],
    		[
    			-6,
    			-51
    		],
    		[
    			21,
    			-51
    		],
    		[
    			59,
    			-40
    		],
    		[
    			45,
    			-60
    		],
    		[
    			30,
    			11
    		],
    		[
    			57,
    			-25
    		],
    		[
    			47,
    			-69
    		],
    		[
    			6,
    			-46
    		],
    		[
    			37,
    			-46
    		],
    		[
    			15,
    			-61
    		],
    		[
    			-17,
    			-46
    		],
    		[
    			13,
    			-47
    		],
    		[
    			-34,
    			-84
    		],
    		[
    			21,
    			-51
    		],
    		[
    			78,
    			-21
    		],
    		[
    			177,
    			-18
    		],
    		[
    			63,
    			-47
    		],
    		[
    			50,
    			-57
    		],
    		[
    			64,
    			-7
    		],
    		[
    			49,
    			-177
    		],
    		[
    			46,
    			-86
    		],
    		[
    			76,
    			10
    		],
    		[
    			96,
    			-24
    		],
    		[
    			125,
    			-14
    		],
    		[
    			78,
    			21
    		],
    		[
    			50,
    			-3
    		],
    		[
    			92,
    			-28
    		],
    		[
    			26,
    			-46
    		],
    		[
    			62,
    			-13
    		],
    		[
    			109,
    			-60
    		],
    		[
    			63,
    			14
    		],
    		[
    			0,
    			-36
    		],
    		[
    			45,
    			-13
    		],
    		[
    			68,
    			59
    		],
    		[
    			168,
    			86
    		],
    		[
    			135,
    			-10
    		],
    		[
    			64,
    			12
    		],
    		[
    			78,
    			45
    		],
    		[
    			73,
    			106
    		],
    		[
    			83,
    			62
    		],
    		[
    			-54,
    			102
    		],
    		[
    			32,
    			100
    		],
    		[
    			65,
    			24
    		],
    		[
    			43,
    			-42
    		],
    		[
    			72,
    			-16
    		],
    		[
    			41,
    			32
    		],
    		[
    			46,
    			74
    		],
    		[
    			110,
    			14
    		],
    		[
    			57,
    			52
    		],
    		[
    			31,
    			90
    		],
    		[
    			70,
    			9
    		],
    		[
    			93,
    			65
    		],
    		[
    			51,
    			4
    		],
    		[
    			45,
    			-25
    		],
    		[
    			58,
    			11
    		],
    		[
    			-19,
    			83
    		],
    		[
    			-90,
    			98
    		],
    		[
    			-20,
    			37
    		],
    		[
    			-74,
    			5
    		],
    		[
    			-41,
    			-62
    		],
    		[
    			-49,
    			42
    		],
    		[
    			-58,
    			-3
    		],
    		[
    			-29,
    			-33
    		],
    		[
    			-36,
    			40
    		],
    		[
    			21,
    			98
    		],
    		[
    			90,
    			224
    		]
    	],
    	[
    		[
    			28412,
    			17601
    		],
    		[
    			103,
    			-56
    		],
    		[
    			72,
    			68
    		],
    		[
    			51,
    			12
    		],
    		[
    			15,
    			75
    		],
    		[
    			50,
    			108
    		],
    		[
    			28,
    			91
    		],
    		[
    			57,
    			49
    		],
    		[
    			6,
    			105
    		],
    		[
    			-51,
    			43
    		],
    		[
    			67,
    			81
    		],
    		[
    			252,
    			44
    		],
    		[
    			118,
    			-69
    		],
    		[
    			81,
    			-10
    		],
    		[
    			72,
    			-117
    		],
    		[
    			11,
    			-74
    		],
    		[
    			36,
    			-69
    		],
    		[
    			8,
    			-79
    		],
    		[
    			42,
    			-79
    		],
    		[
    			19,
    			-133
    		],
    		[
    			25,
    			-34
    		],
    		[
    			71,
    			2
    		],
    		[
    			54,
    			-41
    		],
    		[
    			30,
    			14
    		],
    		[
    			47,
    			-67
    		],
    		[
    			68,
    			-39
    		],
    		[
    			-10,
    			-32
    		],
    		[
    			29,
    			-54
    		],
    		[
    			-17,
    			-33
    		],
    		[
    			34,
    			-67
    		],
    		[
    			149,
    			4
    		],
    		[
    			56,
    			70
    		],
    		[
    			100,
    			41
    		],
    		[
    			48,
    			4
    		],
    		[
    			-14,
    			-64
    		],
    		[
    			22,
    			-51
    		],
    		[
    			-60,
    			-77
    		],
    		[
    			-24,
    			-168
    		],
    		[
    			-69,
    			-127
    		],
    		[
    			-21,
    			-79
    		],
    		[
    			-92,
    			38
    		],
    		[
    			-87,
    			-90
    		],
    		[
    			20,
    			-112
    		],
    		[
    			-11,
    			-80
    		],
    		[
    			12,
    			-29
    		],
    		[
    			-26,
    			-88
    		],
    		[
    			-36,
    			-4
    		],
    		[
    			-3,
    			-72
    		]
    	],
    	[
    		[
    			16978,
    			10846
    		],
    		[
    			-8,
    			-59
    		],
    		[
    			17,
    			-51
    		],
    		[
    			10,
    			-105
    		],
    		[
    			-41,
    			-100
    		],
    		[
    			-3,
    			-62
    		],
    		[
    			-27,
    			-70
    		],
    		[
    			5,
    			-83
    		],
    		[
    			22,
    			-102
    		],
    		[
    			18,
    			-19
    		],
    		[
    			-1,
    			-82
    		],
    		[
    			-32,
    			-3
    		]
    	],
    	[
    		[
    			16938,
    			10110
    		],
    		[
    			-84,
    			25
    		],
    		[
    			-180,
    			-35
    		],
    		[
    			-100,
    			-62
    		],
    		[
    			-59,
    			-51
    		]
    	],
    	[
    		[
    			16515,
    			9987
    		],
    		[
    			-6,
    			91
    		],
    		[
    			20,
    			121
    		],
    		[
    			-60,
    			115
    		],
    		[
    			-54,
    			34
    		],
    		[
    			25,
    			56
    		],
    		[
    			3,
    			56
    		],
    		[
    			-19,
    			62
    		]
    	],
    	[
    		[
    			16424,
    			10522
    		],
    		[
    			25,
    			-4
    		],
    		[
    			19,
    			94
    		],
    		[
    			-5,
    			69
    		],
    		[
    			41,
    			-21
    		],
    		[
    			-27,
    			140
    		],
    		[
    			-22,
    			53
    		],
    		[
    			1,
    			77
    		],
    		[
    			15,
    			30
    		]
    	],
    	[
    		[
    			16471,
    			10960
    		],
    		[
    			25,
    			42
    		],
    		[
    			72,
    			-38
    		],
    		[
    			29,
    			28
    		],
    		[
    			0,
    			44
    		],
    		[
    			43,
    			17
    		],
    		[
    			19,
    			-89
    		],
    		[
    			24,
    			41
    		],
    		[
    			24,
    			-1
    		]
    	],
    	[
    		[
    			18786,
    			9629
    		],
    		[
    			-41,
    			-52
    		],
    		[
    			-68,
    			12
    		],
    		[
    			-43,
    			36
    		],
    		[
    			-125,
    			-4
    		]
    	],
    	[
    		[
    			18509,
    			9621
    		],
    		[
    			-153,
    			25
    		],
    		[
    			-35,
    			-25
    		]
    	],
    	[
    		[
    			18321,
    			9621
    		],
    		[
    			-124,
    			-2
    		],
    		[
    			-21,
    			31
    		]
    	],
    	[
    		[
    			18176,
    			9650
    		],
    		[
    			15,
    			124
    		],
    		[
    			-59,
    			136
    		],
    		[
    			-36,
    			33
    		],
    		[
    			-10,
    			54
    		],
    		[
    			-36,
    			15
    		],
    		[
    			2,
    			37
    		]
    	],
    	[
    		[
    			18052,
    			10049
    		],
    		[
    			28,
    			76
    		],
    		[
    			12,
    			122
    		],
    		[
    			50,
    			91
    		],
    		[
    			38,
    			53
    		],
    		[
    			86,
    			31
    		],
    		[
    			32,
    			-73
    		],
    		[
    			31,
    			1
    		],
    		[
    			76,
    			243
    		],
    		[
    			5,
    			78
    		],
    		[
    			49,
    			50
    		],
    		[
    			13,
    			102
    		],
    		[
    			30,
    			37
    		],
    		[
    			7,
    			88
    		],
    		[
    			19,
    			17
    		],
    		[
    			8,
    			82
    		],
    		[
    			39,
    			103
    		],
    		[
    			18,
    			-11
    		],
    		[
    			45,
    			56
    		],
    		[
    			3,
    			97
    		],
    		[
    			-43,
    			34
    		],
    		[
    			-14,
    			120
    		]
    	],
    	[
    		[
    			18584,
    			11446
    		],
    		[
    			36,
    			0
    		],
    		[
    			9,
    			-49
    		],
    		[
    			27,
    			-26
    		],
    		[
    			5,
    			-77
    		],
    		[
    			17,
    			-21
    		],
    		[
    			8,
    			-81
    		],
    		[
    			-12,
    			-47
    		],
    		[
    			4,
    			-79
    		],
    		[
    			23,
    			-83
    		],
    		[
    			28,
    			-59
    		],
    		[
    			-73,
    			-5
    		],
    		[
    			-57,
    			12
    		],
    		[
    			-21,
    			-59
    		],
    		[
    			70,
    			-138
    		],
    		[
    			44,
    			-35
    		],
    		[
    			29,
    			-137
    		],
    		[
    			-1,
    			-45
    		]
    	],
    	[
    		[
    			19863,
    			10098
    		],
    		[
    			4,
    			-4
    		]
    	],
    	[
    		[
    			19867,
    			10094
    		],
    		[
    			4,
    			-6
    		]
    	],
    	[
    		[
    			19871,
    			10088
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19871,
    			10085
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			19873,
    			10081
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			19875,
    			10077
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19876,
    			10076
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			19878,
    			10077
    		],
    		[
    			5,
    			0
    		]
    	],
    	[
    		[
    			19883,
    			10077
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19885,
    			10075
    		],
    		[
    			3,
    			-9
    		]
    	],
    	[
    		[
    			19888,
    			10066
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			19889,
    			10063
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19888,
    			10061
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			19891,
    			10058
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			19895,
    			10056
    		],
    		[
    			0,
    			-13
    		]
    	],
    	[
    		[
    			19895,
    			10043
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			19895,
    			10038
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19895,
    			10037
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19896,
    			10033
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19896,
    			10029
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19896,
    			10028
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			19901,
    			10025
    		],
    		[
    			7,
    			-6
    		]
    	],
    	[
    		[
    			19908,
    			10019
    		],
    		[
    			6,
    			0
    		]
    	],
    	[
    		[
    			19914,
    			10019
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			19918,
    			10019
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			19920,
    			10019
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19921,
    			10019
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19921,
    			10018
    		],
    		[
    			-1,
    			-3
    		]
    	],
    	[
    		[
    			19920,
    			10015
    		],
    		[
    			5,
    			-16
    		]
    	],
    	[
    		[
    			19925,
    			9999
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19926,
    			9999
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			19927,
    			10001
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			19929,
    			10000
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19930,
    			9999
    		],
    		[
    			-1,
    			-5
    		]
    	],
    	[
    		[
    			19929,
    			9994
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19930,
    			9992
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			19934,
    			9990
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			19935,
    			9987
    		],
    		[
    			6,
    			-3
    		]
    	],
    	[
    		[
    			19941,
    			9984
    		],
    		[
    			2,
    			2
    		]
    	],
    	[
    		[
    			19943,
    			9986
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			19945,
    			9986
    		],
    		[
    			5,
    			-1
    		]
    	],
    	[
    		[
    			19950,
    			9985
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			19952,
    			9981
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19952,
    			9977
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19952,
    			9975
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			19954,
    			9974
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19955,
    			9972
    		],
    		[
    			2,
    			2
    		]
    	],
    	[
    		[
    			19957,
    			9974
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			19960,
    			9975
    		],
    		[
    			4,
    			9
    		]
    	],
    	[
    		[
    			19964,
    			9984
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			19964,
    			9986
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			19965,
    			9987
    		],
    		[
    			5,
    			3
    		]
    	],
    	[
    		[
    			19970,
    			9990
    		],
    		[
    			6,
    			7
    		]
    	],
    	[
    		[
    			19976,
    			9997
    		],
    		[
    			7,
    			11
    		]
    	],
    	[
    		[
    			19983,
    			10008
    		],
    		[
    			0,
    			4
    		]
    	],
    	[
    		[
    			19983,
    			10012
    		],
    		[
    			2,
    			3
    		]
    	],
    	[
    		[
    			19985,
    			10015
    		],
    		[
    			7,
    			5
    		]
    	],
    	[
    		[
    			19992,
    			10020
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			19994,
    			10016
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19994,
    			10012
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19994,
    			10010
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19994,
    			10009
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19995,
    			10008
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			19998,
    			10006
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			19999,
    			10007
    		],
    		[
    			10,
    			-1
    		]
    	],
    	[
    		[
    			20009,
    			10006
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			20011,
    			10007
    		],
    		[
    			5,
    			1
    		]
    	],
    	[
    		[
    			20016,
    			10008
    		],
    		[
    			1,
    			-5
    		]
    	],
    	[
    		[
    			20017,
    			10003
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			20020,
    			10002
    		],
    		[
    			5,
    			-4
    		]
    	],
    	[
    		[
    			20025,
    			9998
    		],
    		[
    			4,
    			-9
    		]
    	],
    	[
    		[
    			20029,
    			9989
    		],
    		[
    			4,
    			-6
    		]
    	],
    	[
    		[
    			20033,
    			9983
    		],
    		[
    			3,
    			2
    		]
    	],
    	[
    		[
    			20036,
    			9985
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20036,
    			9986
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20036,
    			9987
    		],
    		[
    			2,
    			6
    		]
    	],
    	[
    		[
    			20038,
    			9993
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			20040,
    			9991
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			20043,
    			9991
    		],
    		[
    			2,
    			4
    		]
    	],
    	[
    		[
    			20045,
    			9995
    		],
    		[
    			1,
    			6
    		]
    	],
    	[
    		[
    			20046,
    			10001
    		],
    		[
    			4,
    			5
    		]
    	],
    	[
    		[
    			20050,
    			10006
    		],
    		[
    			5,
    			11
    		]
    	],
    	[
    		[
    			20055,
    			10017
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20055,
    			10020
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20055,
    			10021
    		],
    		[
    			2,
    			7
    		]
    	],
    	[
    		[
    			20057,
    			10028
    		],
    		[
    			2,
    			11
    		]
    	],
    	[
    		[
    			20059,
    			10039
    		],
    		[
    			10,
    			-3
    		]
    	],
    	[
    		[
    			20069,
    			10036
    		],
    		[
    			2,
    			2
    		]
    	],
    	[
    		[
    			20071,
    			10038
    		],
    		[
    			15,
    			-13
    		]
    	],
    	[
    		[
    			20086,
    			10025
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			20088,
    			10021
    		],
    		[
    			2,
    			-12
    		]
    	],
    	[
    		[
    			20090,
    			10009
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20090,
    			10008
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			20089,
    			10006
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			20089,
    			10004
    		],
    		[
    			-1,
    			-9
    		]
    	],
    	[
    		[
    			20088,
    			9995
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20089,
    			9993
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			20088,
    			9991
    		],
    		[
    			8,
    			-8
    		]
    	],
    	[
    		[
    			20096,
    			9983
    		],
    		[
    			7,
    			-3
    		]
    	],
    	[
    		[
    			20103,
    			9980
    		],
    		[
    			0,
    			-11
    		]
    	],
    	[
    		[
    			20103,
    			9969
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			20103,
    			9967
    		],
    		[
    			9,
    			-8
    		]
    	],
    	[
    		[
    			20112,
    			9959
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			20112,
    			9957
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			20113,
    			9953
    		],
    		[
    			3,
    			-7
    		]
    	],
    	[
    		[
    			20116,
    			9946
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			20120,
    			9946
    		],
    		[
    			4,
    			-10
    		]
    	],
    	[
    		[
    			20124,
    			9936
    		],
    		[
    			4,
    			-11
    		]
    	],
    	[
    		[
    			20128,
    			9925
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			20128,
    			9919
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20129,
    			9917
    		],
    		[
    			5,
    			3
    		]
    	],
    	[
    		[
    			20134,
    			9920
    		],
    		[
    			3,
    			-4
    		]
    	],
    	[
    		[
    			20137,
    			9916
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			20140,
    			9916
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			20142,
    			9913
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			20145,
    			9912
    		],
    		[
    			4,
    			-6
    		]
    	],
    	[
    		[
    			20149,
    			9906
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			20154,
    			9903
    		],
    		[
    			3,
    			2
    		]
    	],
    	[
    		[
    			20157,
    			9905
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			20160,
    			9905
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			20161,
    			9902
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			20161,
    			9897
    		],
    		[
    			2,
    			-30
    		]
    	],
    	[
    		[
    			20163,
    			9867
    		],
    		[
    			-2,
    			-7
    		]
    	],
    	[
    		[
    			20161,
    			9860
    		],
    		[
    			7,
    			2
    		]
    	],
    	[
    		[
    			20168,
    			9862
    		],
    		[
    			4,
    			4
    		]
    	],
    	[
    		[
    			20172,
    			9866
    		],
    		[
    			7,
    			-1
    		]
    	],
    	[
    		[
    			20179,
    			9865
    		],
    		[
    			4,
    			5
    		]
    	],
    	[
    		[
    			20183,
    			9870
    		],
    		[
    			7,
    			-15
    		]
    	],
    	[
    		[
    			20190,
    			9855
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			20191,
    			9852
    		],
    		[
    			-1,
    			-4
    		]
    	],
    	[
    		[
    			20190,
    			9848
    		],
    		[
    			0,
    			-7
    		]
    	],
    	[
    		[
    			20190,
    			9841
    		],
    		[
    			-9,
    			-70
    		],
    		[
    			11,
    			-30
    		],
    		[
    			-14,
    			-74
    		],
    		[
    			26,
    			-8
    		],
    		[
    			30,
    			-47
    		],
    		[
    			-27,
    			-62
    		],
    		[
    			-101,
    			-157
    		],
    		[
    			-3,
    			-61
    		],
    		[
    			-20,
    			-53
    		],
    		[
    			-14,
    			-254
    		]
    	],
    	[
    		[
    			20069,
    			9025
    		],
    		[
    			-22,
    			-20
    		],
    		[
    			-23,
    			-59
    		],
    		[
    			5,
    			-44
    		],
    		[
    			-30,
    			-47
    		],
    		[
    			17,
    			-57
    		]
    	],
    	[
    		[
    			20053,
    			8513
    		],
    		[
    			-6,
    			-92
    		],
    		[
    			26,
    			-127
    		],
    		[
    			-12,
    			-32
    		],
    		[
    			19,
    			-107
    		],
    		[
    			58,
    			-93
    		],
    		[
    			44,
    			-176
    		]
    	],
    	[
    		[
    			20182,
    			7886
    		],
    		[
    			-23,
    			-11
    		],
    		[
    			-146,
    			-34
    		],
    		[
    			-6,
    			-43
    		],
    		[
    			-43,
    			-102
    		],
    		[
    			17,
    			-82
    		],
    		[
    			-3,
    			-119
    		],
    		[
    			-24,
    			-158
    		],
    		[
    			5,
    			-60
    		],
    		[
    			31,
    			-27
    		],
    		[
    			28,
    			-66
    		],
    		[
    			72,
    			38
    		],
    		[
    			0,
    			-217
    		],
    		[
    			-16,
    			36
    		],
    		[
    			-45,
    			-33
    		],
    		[
    			-20,
    			12
    		],
    		[
    			-13,
    			57
    		],
    		[
    			-48,
    			101
    		],
    		[
    			-64,
    			23
    		],
    		[
    			-20,
    			62
    		],
    		[
    			-42,
    			12
    		],
    		[
    			-28,
    			-27
    		],
    		[
    			-96,
    			32
    		],
    		[
    			-36,
    			31
    		],
    		[
    			-4,
    			73
    		],
    		[
    			-91,
    			-29
    		],
    		[
    			3,
    			47
    		],
    		[
    			-37,
    			33
    		]
    	],
    	[
    		[
    			18477,
    			8269
    		],
    		[
    			-45,
    			-25
    		],
    		[
    			-28,
    			49
    		]
    	],
    	[
    		[
    			18490,
    			8473
    		],
    		[
    			29,
    			-30
    		],
    		[
    			27,
    			20
    		],
    		[
    			4,
    			49
    		],
    		[
    			64,
    			16
    		],
    		[
    			0,
    			-83
    		],
    		[
    			42,
    			5
    		],
    		[
    			35,
    			84
    		],
    		[
    			34,
    			47
    		],
    		[
    			31,
    			14
    		],
    		[
    			30,
    			99
    		],
    		[
    			3,
    			207
    		],
    		[
    			32,
    			49
    		],
    		[
    			27,
    			96
    		],
    		[
    			49,
    			47
    		],
    		[
    			34,
    			67
    		],
    		[
    			-3,
    			68
    		],
    		[
    			27,
    			95
    		],
    		[
    			-10,
    			105
    		],
    		[
    			21,
    			84
    		],
    		[
    			2,
    			126
    		],
    		[
    			53,
    			162
    		],
    		[
    			-2,
    			38
    		]
    	],
    	[
    		[
    			18383,
    			8420
    		],
    		[
    			-19,
    			74
    		],
    		[
    			-56,
    			97
    		]
    	],
    	[
    		[
    			18308,
    			8591
    		],
    		[
    			5,
    			44
    		],
    		[
    			26,
    			35
    		],
    		[
    			17,
    			-27
    		],
    		[
    			33,
    			53
    		],
    		[
    			2,
    			64
    		],
    		[
    			-43,
    			31
    		],
    		[
    			8,
    			69
    		],
    		[
    			73,
    			-8
    		],
    		[
    			5,
    			56
    		],
    		[
    			22,
    			36
    		],
    		[
    			28,
    			-77
    		],
    		[
    			45,
    			-16
    		],
    		[
    			23,
    			52
    		],
    		[
    			34,
    			-60
    		],
    		[
    			28,
    			101
    		],
    		[
    			8,
    			99
    		],
    		[
    			-8,
    			134
    		],
    		[
    			-48,
    			45
    		],
    		[
    			0,
    			69
    		],
    		[
    			21,
    			60
    		],
    		[
    			26,
    			13
    		],
    		[
    			11,
    			49
    		],
    		[
    			-30,
    			78
    		],
    		[
    			-36,
    			5
    		],
    		[
    			-24,
    			-25
    		],
    		[
    			-29,
    			7
    		],
    		[
    			-11,
    			44
    		],
    		[
    			15,
    			99
    		]
    	],
    	[
    		[
    			1935,
    			5711
    		],
    		[
    			5,
    			-2
    		],
    		[
    			0,
    			-11
    		],
    		[
    			-7,
    			3
    		],
    		[
    			2,
    			10
    		]
    	],
    	[
    		[
    			10406,
    			11240
    		],
    		[
    			-62,
    			-33
    		],
    		[
    			-26,
    			-83
    		],
    		[
    			-21,
    			-7
    		],
    		[
    			-40,
    			-109
    		],
    		[
    			-6,
    			-104
    		],
    		[
    			-36,
    			-100
    		],
    		[
    			29,
    			9
    		],
    		[
    			23,
    			-30
    		],
    		[
    			12,
    			-82
    		],
    		[
    			25,
    			-46
    		],
    		[
    			-9,
    			-145
    		],
    		[
    			27,
    			-17
    		],
    		[
    			16,
    			-60
    		],
    		[
    			84,
    			1
    		],
    		[
    			45,
    			11
    		],
    		[
    			33,
    			-26
    		],
    		[
    			25,
    			10
    		],
    		[
    			60,
    			-148
    		],
    		[
    			39,
    			16
    		],
    		[
    			36,
    			-13
    		],
    		[
    			80,
    			28
    		],
    		[
    			34,
    			-18
    		],
    		[
    			6,
    			-31
    		],
    		[
    			-42,
    			-121
    		],
    		[
    			-1,
    			-129
    		],
    		[
    			24,
    			-125
    		],
    		[
    			30,
    			-62
    		],
    		[
    			-53,
    			-88
    		],
    		[
    			23,
    			-10
    		],
    		[
    			43,
    			-78
    		],
    		[
    			28,
    			-187
    		]
    	],
    	[
    		[
    			10537,
    			8549
    		],
    		[
    			-22,
    			57
    		],
    		[
    			-50,
    			16
    		],
    		[
    			63,
    			168
    		],
    		[
    			-18,
    			39
    		],
    		[
    			-70,
    			59
    		],
    		[
    			-23,
    			-22
    		],
    		[
    			-48,
    			30
    		],
    		[
    			-61,
    			-55
    		],
    		[
    			-53,
    			-1
    		],
    		[
    			-23,
    			32
    		],
    		[
    			4,
    			63
    		],
    		[
    			-41,
    			35
    		],
    		[
    			-9,
    			73
    		],
    		[
    			-24,
    			6
    		],
    		[
    			-38,
    			46
    		],
    		[
    			-15,
    			76
    		],
    		[
    			-66,
    			80
    		],
    		[
    			-16,
    			-9
    		]
    	],
    	[
    		[
    			10027,
    			9242
    		],
    		[
    			-57,
    			42
    		],
    		[
    			-38,
    			47
    		],
    		[
    			-13,
    			-32
    		],
    		[
    			-42,
    			-1
    		],
    		[
    			-59,
    			25
    		],
    		[
    			-4,
    			40
    		],
    		[
    			-45,
    			31
    		],
    		[
    			-77,
    			99
    		]
    	],
    	[
    		[
    			9692,
    			9493
    		],
    		[
    			-25,
    			35
    		],
    		[
    			48,
    			49
    		],
    		[
    			-13,
    			45
    		],
    		[
    			11,
    			44
    		],
    		[
    			30,
    			38
    		],
    		[
    			33,
    			-3
    		],
    		[
    			73,
    			185
    		],
    		[
    			-36,
    			67
    		],
    		[
    			19,
    			71
    		],
    		[
    			-7,
    			146
    		],
    		[
    			12,
    			54
    		],
    		[
    			-12,
    			76
    		],
    		[
    			6,
    			53
    		],
    		[
    			-37,
    			58
    		],
    		[
    			-17,
    			56
    		]
    	],
    	[
    		[
    			9777,
    			10467
    		],
    		[
    			31,
    			46
    		],
    		[
    			34,
    			98
    		],
    		[
    			-15,
    			98
    		]
    	],
    	[
    		[
    			9827,
    			10709
    		],
    		[
    			13,
    			-34
    		],
    		[
    			41,
    			2
    		],
    		[
    			45,
    			74
    		],
    		[
    			24,
    			69
    		],
    		[
    			44,
    			18
    		],
    		[
    			-2,
    			52
    		],
    		[
    			24,
    			155
    		],
    		[
    			56,
    			68
    		],
    		[
    			44,
    			-18
    		],
    		[
    			19,
    			58
    		],
    		[
    			84,
    			-6
    		],
    		[
    			52,
    			68
    		],
    		[
    			48,
    			35
    		],
    		[
    			55,
    			93
    		],
    		[
    			40,
    			-23
    		],
    		[
    			12,
    			-40
    		],
    		[
    			-20,
    			-40
    		]
    	],
    	[
    		[
    			21386,
    			7356
    		],
    		[
    			3,
    			-42
    		],
    		[
    			12,
    			-48
    		],
    		[
    			-22,
    			9
    		],
    		[
    			0,
    			76
    		],
    		[
    			7,
    			5
    		]
    	],
    	[
    		[
    			14961,
    			11822
    		],
    		[
    			29,
    			-48
    		],
    		[
    			-7,
    			-24
    		],
    		[
    			-25,
    			33
    		],
    		[
    			3,
    			39
    		]
    	],
    	[
    		[
    			9222,
    			11088
    		],
    		[
    			25,
    			-90
    		],
    		[
    			62,
    			-125
    		],
    		[
    			21,
    			-14
    		]
    	],
    	[
    		[
    			9330,
    			10859
    		],
    		[
    			-36,
    			-16
    		],
    		[
    			2,
    			-122
    		],
    		[
    			8,
    			-40
    		],
    		[
    			-7,
    			-79
    		]
    	],
    	[
    		[
    			9297,
    			10602
    		],
    		[
    			-22,
    			53
    		],
    		[
    			-41,
    			15
    		],
    		[
    			-6,
    			101
    		],
    		[
    			-60,
    			71
    		],
    		[
    			-27,
    			8
    		],
    		[
    			-20,
    			75
    		],
    		[
    			-31,
    			-53
    		],
    		[
    			-54,
    			40
    		],
    		[
    			-22,
    			76
    		],
    		[
    			22,
    			49
    		],
    		[
    			-6,
    			74
    		]
    	],
    	[
    		[
    			9030,
    			11111
    		],
    		[
    			8,
    			24
    		],
    		[
    			67,
    			-46
    		],
    		[
    			22,
    			23
    		],
    		[
    			71,
    			-62
    		],
    		[
    			24,
    			38
    		]
    	],
    	[
    		[
    			9292,
    			12930
    		],
    		[
    			27,
    			-12
    		],
    		[
    			12,
    			-50
    		],
    		[
    			-31,
    			-22
    		],
    		[
    			-21,
    			58
    		],
    		[
    			13,
    			26
    		]
    	],
    	[
    		[
    			9382,
    			13139
    		],
    		[
    			70,
    			-9
    		],
    		[
    			15,
    			-19
    		],
    		[
    			48,
    			12
    		],
    		[
    			33,
    			-31
    		],
    		[
    			26,
    			5
    		],
    		[
    			36,
    			-35
    		],
    		[
    			27,
    			-53
    		],
    		[
    			56,
    			-5
    		],
    		[
    			68,
    			-51
    		],
    		[
    			30,
    			-47
    		],
    		[
    			43,
    			-11
    		],
    		[
    			36,
    			-49
    		],
    		[
    			87,
    			-59
    		],
    		[
    			29,
    			7
    		],
    		[
    			23,
    			-65
    		],
    		[
    			47,
    			-7
    		],
    		[
    			57,
    			-68
    		],
    		[
    			2,
    			-35
    		],
    		[
    			-59,
    			-26
    		],
    		[
    			-58,
    			-6
    		],
    		[
    			-64,
    			17
    		],
    		[
    			-104,
    			-23
    		],
    		[
    			-38,
    			4
    		],
    		[
    			63,
    			98
    		],
    		[
    			-24,
    			42
    		],
    		[
    			-68,
    			-2
    		],
    		[
    			-43,
    			59
    		],
    		[
    			-25,
    			98
    		],
    		[
    			-44,
    			-17
    		],
    		[
    			-79,
    			38
    		],
    		[
    			-47,
    			50
    		],
    		[
    			-34,
    			-4
    		],
    		[
    			-81,
    			27
    		],
    		[
    			-16,
    			80
    		],
    		[
    			-71,
    			0
    		],
    		[
    			-41,
    			-31
    		],
    		[
    			-40,
    			-54
    		],
    		[
    			-42,
    			0
    		],
    		[
    			-12,
    			-44
    		],
    		[
    			-43,
    			3
    		],
    		[
    			9,
    			66
    		],
    		[
    			37,
    			61
    		],
    		[
    			73,
    			51
    		],
    		[
    			62,
    			9
    		],
    		[
    			56,
    			24
    		]
    	],
    	[
    		[
    			27358,
    			7506
    		],
    		[
    			-3,
    			-7
    		],
    		[
    			-5,
    			7
    		],
    		[
    			7,
    			8
    		],
    		[
    			1,
    			-8
    		]
    	],
    	[
    		[
    			9444,
    			12502
    		],
    		[
    			24,
    			-15
    		],
    		[
    			-14,
    			-5
    		],
    		[
    			-13,
    			3
    		],
    		[
    			3,
    			17
    		]
    	],
    	[
    		[
    			20548,
    			15232
    		],
    		[
    			-60,
    			-64
    		],
    		[
    			-34,
    			-83
    		],
    		[
    			-57,
    			-28
    		],
    		[
    			-49,
    			9
    		],
    		[
    			-18,
    			31
    		],
    		[
    			67,
    			79
    		],
    		[
    			92,
    			14
    		],
    		[
    			59,
    			42
    		]
    	],
    	[
    		[
    			18655,
    			17772
    		],
    		[
    			33,
    			25
    		],
    		[
    			62,
    			-45
    		],
    		[
    			86,
    			-109
    		],
    		[
    			90,
    			29
    		],
    		[
    			33,
    			-43
    		],
    		[
    			56,
    			-18
    		],
    		[
    			25,
    			-65
    		]
    	],
    	[
    		[
    			19040,
    			17546
    		],
    		[
    			-64,
    			-40
    		],
    		[
    			-9,
    			-36
    		],
    		[
    			-109,
    			-76
    		]
    	],
    	[
    		[
    			18561,
    			17421
    		],
    		[
    			-113,
    			110
    		],
    		[
    			-43,
    			113
    		],
    		[
    			28,
    			47
    		],
    		[
    			42,
    			3
    		],
    		[
    			149,
    			104
    		],
    		[
    			31,
    			-26
    		]
    	],
    	[
    		[
    			18064,
    			18448
    		],
    		[
    			74,
    			-13
    		]
    	],
    	[
    		[
    			18138,
    			18435
    		],
    		[
    			51,
    			-9
    		],
    		[
    			7,
    			-38
    		],
    		[
    			110,
    			-90
    		],
    		[
    			92,
    			29
    		],
    		[
    			35,
    			48
    		],
    		[
    			89,
    			-58
    		],
    		[
    			80,
    			-72
    		]
    	],
    	[
    		[
    			18602,
    			18245
    		],
    		[
    			17,
    			-73
    		],
    		[
    			-23,
    			-74
    		],
    		[
    			41,
    			-41
    		],
    		[
    			11,
    			-85
    		],
    		[
    			-16,
    			-39
    		],
    		[
    			36,
    			-64
    		],
    		[
    			-13,
    			-97
    		]
    	],
    	[
    		[
    			17961,
    			17221
    		],
    		[
    			-5,
    			34
    		],
    		[
    			31,
    			144
    		],
    		[
    			34,
    			55
    		],
    		[
    			-74,
    			35
    		],
    		[
    			-67,
    			-2
    		],
    		[
    			-34,
    			48
    		]
    	],
    	[
    		[
    			17846,
    			17535
    		],
    		[
    			13,
    			45
    		],
    		[
    			-36,
    			68
    		]
    	],
    	[
    		[
    			17812,
    			17752
    		],
    		[
    			18,
    			129
    		],
    		[
    			-24,
    			38
    		],
    		[
    			79,
    			29
    		],
    		[
    			28,
    			72
    		],
    		[
    			13,
    			148
    		]
    	],
    	[
    		[
    			17926,
    			18168
    		],
    		[
    			-3,
    			67
    		],
    		[
    			125,
    			7
    		],
    		[
    			47,
    			76
    		],
    		[
    			-2,
    			66
    		],
    		[
    			-29,
    			64
    		]
    	],
    	[
    		[
    			21378,
    			11177
    		],
    		[
    			-28,
    			-79
    		]
    	],
    	[
    		[
    			21350,
    			11098
    		],
    		[
    			-31,
    			16
    		],
    		[
    			-62,
    			-28
    		],
    		[
    			-19,
    			13
    		],
    		[
    			-3,
    			82
    		],
    		[
    			61,
    			163
    		]
    	],
    	[
    		[
    			21296,
    			11344
    		],
    		[
    			28,
    			-17
    		],
    		[
    			41,
    			58
    		]
    	],
    	[
    		[
    			21365,
    			11385
    		],
    		[
    			22,
    			-55
    		],
    		[
    			1,
    			-68
    		],
    		[
    			-57,
    			-41
    		],
    		[
    			47,
    			-44
    		]
    	],
    	[
    		[
    			11353,
    			11873
    		],
    		[
    			17,
    			-25
    		],
    		[
    			-10,
    			-46
    		],
    		[
    			-11,
    			48
    		],
    		[
    			4,
    			23
    		]
    	],
    	[
    		[
    			18234,
    			18561
    		],
    		[
    			33,
    			-34
    		],
    		[
    			-24,
    			-60
    		],
    		[
    			-60,
    			36
    		],
    		[
    			-4,
    			52
    		],
    		[
    			55,
    			6
    		]
    	],
    	[
    		[
    			18421,
    			18646
    		],
    		[
    			22,
    			-56
    		],
    		[
    			-78,
    			-102
    		],
    		[
    			-51,
    			8
    		],
    		[
    			-15,
    			79
    		],
    		[
    			52,
    			45
    		],
    		[
    			70,
    			26
    		]
    	],
    	[
    		[
    			18064,
    			18448
    		],
    		[
    			-2,
    			86
    		],
    		[
    			-53,
    			23
    		],
    		[
    			8,
    			181
    		],
    		[
    			44,
    			80
    		],
    		[
    			88,
    			16
    		],
    		[
    			39,
    			61
    		],
    		[
    			46,
    			-1
    		],
    		[
    			13,
    			-59
    		],
    		[
    			-26,
    			-45
    		],
    		[
    			7,
    			-65
    		],
    		[
    			36,
    			-60
    		],
    		[
    			-110,
    			-131
    		],
    		[
    			14,
    			-73
    		],
    		[
    			-30,
    			-26
    		]
    	],
    	[
    		[
    			10365,
    			12275
    		],
    		[
    			6,
    			52
    		],
    		[
    			-20,
    			20
    		],
    		[
    			27,
    			124
    		],
    		[
    			-14,
    			84
    		]
    	],
    	[
    		[
    			10364,
    			12555
    		],
    		[
    			27,
    			34
    		],
    		[
    			44,
    			4
    		],
    		[
    			69,
    			-46
    		],
    		[
    			39,
    			-1
    		],
    		[
    			25,
    			-89
    		],
    		[
    			83,
    			-24
    		],
    		[
    			42,
    			-59
    		],
    		[
    			-15,
    			-47
    		],
    		[
    			-69,
    			19
    		],
    		[
    			-67,
    			1
    		],
    		[
    			-23,
    			-37
    		],
    		[
    			-42,
    			28
    		],
    		[
    			-46,
    			-16
    		],
    		[
    			-3,
    			-41
    		],
    		[
    			-31,
    			-77
    		],
    		[
    			-32,
    			71
    		]
    	],
    	[
    		[
    			18063,
    			15441
    		],
    		[
    			-19,
    			-55
    		],
    		[
    			-17,
    			-114
    		],
    		[
    			4,
    			-95
    		],
    		[
    			14,
    			-22
    		],
    		[
    			-29,
    			-118
    		],
    		[
    			-48,
    			-56
    		],
    		[
    			-12,
    			-67
    		],
    		[
    			27,
    			-98
    		],
    		[
    			49,
    			-65
    		],
    		[
    			4,
    			-54
    		],
    		[
    			69,
    			-69
    		],
    		[
    			45,
    			-308
    		]
    	],
    	[
    		[
    			18150,
    			14320
    		],
    		[
    			-15,
    			-14
    		],
    		[
    			37,
    			-123
    		],
    		[
    			12,
    			-112
    		],
    		[
    			-7,
    			-79
    		],
    		[
    			13,
    			-68
    		],
    		[
    			-18,
    			-102
    		],
    		[
    			13,
    			-105
    		],
    		[
    			-50,
    			-74
    		],
    		[
    			60,
    			-145
    		],
    		[
    			3,
    			-83
    		],
    		[
    			35,
    			-61
    		],
    		[
    			28,
    			15
    		],
    		[
    			69,
    			-61
    		],
    		[
    			17,
    			10
    		],
    		[
    			37,
    			-125
    		]
    	],
    	[
    		[
    			18384,
    			13193
    		],
    		[
    			-166,
    			-167
    		],
    		[
    			-148,
    			-152
    		],
    		[
    			-120,
    			-128
    		],
    		[
    			-158,
    			-235
    		],
    		[
    			-150,
    			-50
    		]
    	],
    	[
    		[
    			17642,
    			12461
    		],
    		[
    			-85,
    			-30
    		],
    		[
    			-22,
    			27
    		],
    		[
    			13,
    			53
    		],
    		[
    			-6,
    			67
    		],
    		[
    			-83,
    			57
    		],
    		[
    			-39,
    			6
    		],
    		[
    			-31,
    			62
    		],
    		[
    			-42,
    			25
    		],
    		[
    			-1,
    			65
    		],
    		[
    			-134,
    			156
    		],
    		[
    			-136,
    			155
    		],
    		[
    			-120,
    			134
    		],
    		[
    			-183,
    			203
    		]
    	],
    	[
    		[
    			16773,
    			13441
    		],
    		[
    			-184,
    			197
    		],
    		[
    			-183,
    			191
    		]
    	],
    	[
    		[
    			16406,
    			13829
    		],
    		[
    			0,
    			58
    		]
    	],
    	[
    		[
    			16406,
    			13887
    		],
    		[
    			0,
    			176
    		],
    		[
    			103,
    			111
    		],
    		[
    			42,
    			24
    		],
    		[
    			36,
    			-10
    		],
    		[
    			94,
    			26
    		],
    		[
    			22,
    			-20
    		],
    		[
    			27,
    			68
    		],
    		[
    			91,
    			105
    		],
    		[
    			66,
    			28
    		],
    		[
    			10,
    			53
    		],
    		[
    			-23,
    			40
    		],
    		[
    			11,
    			64
    		],
    		[
    			80,
    			28
    		],
    		[
    			-8,
    			53
    		],
    		[
    			85,
    			10
    		],
    		[
    			75,
    			-17
    		],
    		[
    			3,
    			53
    		],
    		[
    			-26,
    			115
    		],
    		[
    			-16,
    			172
    		],
    		[
    			-19,
    			87
    		],
    		[
    			9,
    			21
    		],
    		[
    			-44,
    			57
    		]
    	],
    	[
    		[
    			17024,
    			15131
    		],
    		[
    			43,
    			6
    		],
    		[
    			48,
    			45
    		],
    		[
    			8,
    			32
    		],
    		[
    			66,
    			48
    		],
    		[
    			36,
    			-14
    		],
    		[
    			43,
    			68
    		],
    		[
    			97,
    			60
    		],
    		[
    			121,
    			8
    		],
    		[
    			28,
    			34
    		],
    		[
    			56,
    			-6
    		],
    		[
    			64,
    			23
    		],
    		[
    			73,
    			-9
    		],
    		[
    			33,
    			-36
    		],
    		[
    			45,
    			33
    		],
    		[
    			80,
    			25
    		],
    		[
    			33,
    			-17
    		],
    		[
    			34,
    			31
    		],
    		[
    			46,
    			-18
    		],
    		[
    			85,
    			-3
    		]
    	],
    	[
    		[
    			8488,
    			9285
    		],
    		[
    			17,
    			-65
    		],
    		[
    			38,
    			-90
    		],
    		[
    			-41,
    			-47
    		],
    		[
    			-27,
    			33
    		],
    		[
    			38,
    			35
    		],
    		[
    			-29,
    			67
    		],
    		[
    			4,
    			67
    		]
    	],
    	[
    		[
    			10027,
    			9242
    		],
    		[
    			4,
    			-74
    		],
    		[
    			-28,
    			-167
    		],
    		[
    			-49,
    			-100
    		],
    		[
    			-56,
    			-77
    		],
    		[
    			-111,
    			-66
    		],
    		[
    			-52,
    			-78
    		],
    		[
    			-29,
    			-179
    		],
    		[
    			-34,
    			-76
    		],
    		[
    			-26,
    			1
    		],
    		[
    			-24,
    			76
    		],
    		[
    			-53,
    			35
    		],
    		[
    			-36,
    			-11
    		],
    		[
    			0,
    			62
    		],
    		[
    			27,
    			13
    		],
    		[
    			-6,
    			81
    		]
    	],
    	[
    		[
    			9554,
    			8682
    		],
    		[
    			15,
    			4
    		],
    		[
    			33,
    			140
    		],
    		[
    			-30,
    			16
    		],
    		[
    			-26,
    			-40
    		],
    		[
    			-57,
    			69
    		],
    		[
    			17,
    			64
    		],
    		[
    			-12,
    			54
    		],
    		[
    			11,
    			40
    		],
    		[
    			-17,
    			51
    		],
    		[
    			30,
    			22
    		],
    		[
    			10,
    			90
    		],
    		[
    			44,
    			91
    		],
    		[
    			-6,
    			98
    		],
    		[
    			34,
    			37
    		],
    		[
    			55,
    			20
    		],
    		[
    			37,
    			55
    		]
    	],
    	[
    		[
    			20514,
    			14495
    		],
    		[
    			3,
    			-12
    		]
    	],
    	[
    		[
    			20517,
    			14483
    		],
    		[
    			53,
    			-237
    		],
    		[
    			8,
    			-52
    		]
    	],
    	[
    		[
    			20578,
    			14194
    		],
    		[
    			-23,
    			-76
    		],
    		[
    			-25,
    			-125
    		],
    		[
    			3,
    			-51
    		],
    		[
    			-36,
    			-30
    		],
    		[
    			-79,
    			124
    		],
    		[
    			-5,
    			75
    		],
    		[
    			-34,
    			53
    		],
    		[
    			-21,
    			84
    		],
    		[
    			-26,
    			-37
    		],
    		[
    			24,
    			-42
    		],
    		[
    			3,
    			-61
    		],
    		[
    			49,
    			-115
    		],
    		[
    			34,
    			-52
    		],
    		[
    			1,
    			-54
    		],
    		[
    			33,
    			-67
    		],
    		[
    			9,
    			-98
    		],
    		[
    			109,
    			-323
    		],
    		[
    			6,
    			-38
    		],
    		[
    			36,
    			-68
    		],
    		[
    			-3,
    			-104
    		],
    		[
    			14,
    			-58
    		]
    	],
    	[
    		[
    			20647,
    			13131
    		],
    		[
    			-40,
    			-60
    		],
    		[
    			-25,
    			12
    		],
    		[
    			-25,
    			-94
    		]
    	],
    	[
    		[
    			20557,
    			12989
    		],
    		[
    			-50,
    			-15
    		]
    	],
    	[
    		[
    			20507,
    			12974
    		],
    		[
    			-7,
    			-34
    		]
    	],
    	[
    		[
    			20500,
    			12940
    		],
    		[
    			-87,
    			0
    		]
    	],
    	[
    		[
    			20413,
    			12940
    		],
    		[
    			-169,
    			0
    		],
    		[
    			7,
    			34
    		]
    	],
    	[
    		[
    			20251,
    			12974
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			20249,
    			12977
    		],
    		[
    			-6,
    			-8
    		]
    	],
    	[
    		[
    			20243,
    			12969
    		],
    		[
    			-2,
    			-4
    		]
    	],
    	[
    		[
    			20241,
    			12965
    		],
    		[
    			-4,
    			-10
    		]
    	],
    	[
    		[
    			20237,
    			12955
    		],
    		[
    			-3,
    			-15
    		],
    		[
    			-605,
    			0
    		]
    	],
    	[
    		[
    			19629,
    			12940
    		],
    		[
    			0,
    			1205
    		],
    		[
    			-29,
    			158
    		],
    		[
    			31,
    			106
    		],
    		[
    			-15,
    			105
    		],
    		[
    			27,
    			40
    		]
    	],
    	[
    		[
    			19643,
    			14554
    		],
    		[
    			35,
    			-22
    		],
    		[
    			30,
    			16
    		],
    		[
    			146,
    			-40
    		],
    		[
    			9,
    			-26
    		],
    		[
    			94,
    			-21
    		],
    		[
    			54,
    			-43
    		],
    		[
    			35,
    			7
    		],
    		[
    			68,
    			76
    		],
    		[
    			88,
    			19
    		],
    		[
    			13,
    			26
    		],
    		[
    			87,
    			-63
    		],
    		[
    			3,
    			-21
    		],
    		[
    			106,
    			-9
    		],
    		[
    			55,
    			14
    		],
    		[
    			48,
    			28
    		]
    	],
    	[
    		[
    			21296,
    			11344
    		],
    		[
    			-34,
    			56
    		],
    		[
    			-39,
    			98
    		],
    		[
    			-45,
    			57
    		],
    		[
    			-22,
    			59
    		],
    		[
    			-65,
    			55
    		],
    		[
    			-55,
    			31
    		],
    		[
    			-41,
    			-19
    		],
    		[
    			-22,
    			26
    		],
    		[
    			-55,
    			-37
    		],
    		[
    			-52,
    			80
    		],
    		[
    			-37,
    			-118
    		],
    		[
    			-21,
    			44
    		],
    		[
    			-21,
    			-30
    		],
    		[
    			-51,
    			-2
    		]
    	],
    	[
    		[
    			20736,
    			11644
    		],
    		[
    			-3,
    			12
    		]
    	],
    	[
    		[
    			20733,
    			11656
    		],
    		[
    			-1,
    			27
    		]
    	],
    	[
    		[
    			20732,
    			11683
    		],
    		[
    			-5,
    			85
    		]
    	],
    	[
    		[
    			20727,
    			11768
    		],
    		[
    			29,
    			138
    		]
    	],
    	[
    		[
    			20756,
    			11906
    		],
    		[
    			5,
    			22
    		]
    	],
    	[
    		[
    			20761,
    			11928
    		],
    		[
    			9,
    			48
    		]
    	],
    	[
    		[
    			20770,
    			11976
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20771,
    			11977
    		],
    		[
    			4,
    			6
    		]
    	],
    	[
    		[
    			20775,
    			11983
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			20773,
    			11986
    		],
    		[
    			-5,
    			40
    		]
    	],
    	[
    		[
    			20768,
    			12026
    		],
    		[
    			1,
    			16
    		]
    	],
    	[
    		[
    			20769,
    			12042
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20769,
    			12043
    		],
    		[
    			12,
    			26
    		]
    	],
    	[
    		[
    			20781,
    			12069
    		],
    		[
    			-2,
    			4
    		]
    	],
    	[
    		[
    			20779,
    			12073
    		],
    		[
    			1,
    			31
    		]
    	],
    	[
    		[
    			20780,
    			12104
    		],
    		[
    			5,
    			13
    		]
    	],
    	[
    		[
    			20785,
    			12117
    		],
    		[
    			14,
    			-2
    		]
    	],
    	[
    		[
    			20799,
    			12115
    		],
    		[
    			9,
    			3
    		]
    	],
    	[
    		[
    			20808,
    			12118
    		],
    		[
    			17,
    			16
    		]
    	],
    	[
    		[
    			20825,
    			12134
    		],
    		[
    			2,
    			2
    		]
    	],
    	[
    		[
    			20827,
    			12136
    		],
    		[
    			23,
    			31
    		]
    	],
    	[
    		[
    			20850,
    			12167
    		],
    		[
    			5,
    			19
    		]
    	],
    	[
    		[
    			20855,
    			12186
    		],
    		[
    			10,
    			-7
    		]
    	],
    	[
    		[
    			20865,
    			12179
    		],
    		[
    			4,
    			3
    		]
    	],
    	[
    		[
    			20869,
    			12182
    		],
    		[
    			7,
    			13
    		]
    	],
    	[
    		[
    			20876,
    			12195
    		],
    		[
    			8,
    			-9
    		]
    	],
    	[
    		[
    			20884,
    			12186
    		],
    		[
    			7,
    			14
    		]
    	],
    	[
    		[
    			20891,
    			12200
    		],
    		[
    			9,
    			0
    		]
    	],
    	[
    		[
    			20900,
    			12200
    		],
    		[
    			28,
    			71
    		],
    		[
    			35,
    			-106
    		],
    		[
    			18,
    			-99
    		],
    		[
    			11,
    			-118
    		],
    		[
    			22,
    			-93
    		],
    		[
    			39,
    			-7
    		],
    		[
    			28,
    			-84
    		],
    		[
    			36,
    			1
    		],
    		[
    			20,
    			-42
    		],
    		[
    			42,
    			-19
    		],
    		[
    			48,
    			-113
    		],
    		[
    			58,
    			-65
    		],
    		[
    			9,
    			-59
    		],
    		[
    			34,
    			-28
    		],
    		[
    			3,
    			-32
    		],
    		[
    			34,
    			-22
    		]
    	],
    	[
    		[
    			16406,
    			13829
    		],
    		[
    			-1,
    			-220
    		],
    		[
    			-116,
    			0
    		],
    		[
    			-203,
    			0
    		],
    		[
    			1,
    			-424
    		],
    		[
    			-55,
    			-29
    		],
    		[
    			-41,
    			-45
    		],
    		[
    			-8,
    			-83
    		],
    		[
    			7,
    			-201
    		],
    		[
    			-174,
    			3
    		],
    		[
    			-202,
    			-3
    		],
    		[
    			-11,
    			-93
    		]
    	],
    	[
    		[
    			15603,
    			12734
    		],
    		[
    			9,
    			178
    		],
    		[
    			14,
    			55
    		],
    		[
    			30,
    			26
    		],
    		[
    			29,
    			135
    		],
    		[
    			58,
    			155
    		],
    		[
    			66,
    			107
    		],
    		[
    			11,
    			124
    		],
    		[
    			57,
    			166
    		],
    		[
    			54,
    			44
    		],
    		[
    			43,
    			164
    		]
    	],
    	[
    		[
    			15974,
    			13888
    		],
    		[
    			156,
    			0
    		],
    		[
    			276,
    			-1
    		]
    	],
    	[
    		[
    			15691,
    			14038
    		],
    		[
    			-28,
    			-70
    		],
    		[
    			-26,
    			-25
    		],
    		[
    			-21,
    			58
    		],
    		[
    			75,
    			37
    		]
    	],
    	[
    		[
    			17542,
    			15944
    		],
    		[
    			24,
    			-38
    		],
    		[
    			-37,
    			-77
    		],
    		[
    			-69,
    			53
    		],
    		[
    			41,
    			46
    		],
    		[
    			41,
    			16
    		]
    	],
    	[
    		[
    			17064,
    			16514
    		],
    		[
    			46,
    			-47
    		],
    		[
    			98,
    			-38
    		],
    		[
    			26,
    			-26
    		],
    		[
    			140,
    			-15
    		]
    	],
    	[
    		[
    			17401,
    			16371
    		],
    		[
    			74,
    			-26
    		],
    		[
    			64,
    			16
    		]
    	],
    	[
    		[
    			17539,
    			16361
    		],
    		[
    			5,
    			-81
    		],
    		[
    			-30,
    			-42
    		],
    		[
    			-76,
    			-69
    		],
    		[
    			-108,
    			-43
    		],
    		[
    			-112,
    			-220
    		],
    		[
    			-12,
    			-61
    		],
    		[
    			17,
    			-64
    		],
    		[
    			35,
    			-39
    		],
    		[
    			-71,
    			-69
    		],
    		[
    			-40,
    			-130
    		],
    		[
    			-38,
    			1
    		],
    		[
    			-35,
    			-36
    		],
    		[
    			-42,
    			-102
    		],
    		[
    			-22,
    			18
    		],
    		[
    			-53,
    			-15
    		],
    		[
    			-146,
    			-7
    		],
    		[
    			-26,
    			-37
    		],
    		[
    			-45,
    			-13
    		],
    		[
    			-16,
    			-43
    		]
    	],
    	[
    		[
    			16724,
    			15309
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			16723,
    			15309
    		],
    		[
    			-25,
    			-24
    		],
    		[
    			-40,
    			28
    		],
    		[
    			-39,
    			121
    		],
    		[
    			-97,
    			85
    		]
    	],
    	[
    		[
    			16522,
    			15519
    		],
    		[
    			19,
    			96
    		],
    		[
    			0,
    			123
    		],
    		[
    			29,
    			51
    		],
    		[
    			-49,
    			107
    		],
    		[
    			43,
    			1
    		],
    		[
    			21,
    			111
    		],
    		[
    			-3,
    			118
    		],
    		[
    			62,
    			90
    		],
    		[
    			-35,
    			19
    		],
    		[
    			-4,
    			43
    		],
    		[
    			-78,
    			-21
    		],
    		[
    			-55,
    			8
    		],
    		[
    			-20,
    			46
    		],
    		[
    			-59,
    			-39
    		]
    	],
    	[
    		[
    			16393,
    			16272
    		],
    		[
    			-3,
    			80
    		],
    		[
    			-42,
    			110
    		],
    		[
    			41,
    			49
    		],
    		[
    			48,
    			2
    		],
    		[
    			27,
    			60
    		],
    		[
    			58,
    			3
    		],
    		[
    			24,
    			-27
    		],
    		[
    			109,
    			0
    		],
    		[
    			28,
    			10
    		],
    		[
    			111,
    			-38
    		],
    		[
    			101,
    			19
    		],
    		[
    			79,
    			-14
    		],
    		[
    			36,
    			-21
    		],
    		[
    			54,
    			9
    		]
    	],
    	[
    		[
    			19921,
    			19211
    		],
    		[
    			-60,
    			-115
    		],
    		[
    			13,
    			-159
    		],
    		[
    			-22,
    			-48
    		]
    	],
    	[
    		[
    			19852,
    			18889
    		],
    		[
    			-69,
    			-5
    		],
    		[
    			-99,
    			76
    		],
    		[
    			-116,
    			-15
    		]
    	],
    	[
    		[
    			19568,
    			18945
    		],
    		[
    			12,
    			63
    		],
    		[
    			-71,
    			16
    		],
    		[
    			-30,
    			110
    		],
    		[
    			8,
    			34
    		],
    		[
    			82,
    			44
    		],
    		[
    			102,
    			2
    		],
    		[
    			57,
    			23
    		],
    		[
    			90,
    			-32
    		],
    		[
    			103,
    			6
    		]
    	],
    	[
    		[
    			21350,
    			11098
    		],
    		[
    			-27,
    			-68
    		],
    		[
    			59,
    			-164
    		],
    		[
    			67,
    			-103
    		],
    		[
    			175,
    			-100
    		],
    		[
    			111,
    			-67
    		],
    		[
    			95,
    			0
    		],
    		[
    			-287,
    			-516
    		],
    		[
    			-93,
    			7
    		],
    		[
    			-55,
    			-27
    		],
    		[
    			-38,
    			-37
    		],
    		[
    			-22,
    			-52
    		],
    		[
    			-70,
    			-14
    		],
    		[
    			-16,
    			-33
    		]
    	],
    	[
    		[
    			21249,
    			9924
    		],
    		[
    			-75,
    			-3
    		],
    		[
    			-37,
    			50
    		],
    		[
    			-84,
    			-66
    		],
    		[
    			-30,
    			-78
    		],
    		[
    			-99,
    			38
    		],
    		[
    			-38,
    			-4
    		],
    		[
    			-123,
    			141
    		],
    		[
    			-76,
    			1
    		],
    		[
    			-9,
    			28
    		]
    	],
    	[
    		[
    			20678,
    			10031
    		],
    		[
    			-8,
    			17
    		]
    	],
    	[
    		[
    			20670,
    			10048
    		],
    		[
    			-5,
    			46
    		]
    	],
    	[
    		[
    			20665,
    			10094
    		],
    		[
    			0,
    			14
    		]
    	],
    	[
    		[
    			20665,
    			10108
    		],
    		[
    			0,
    			4
    		]
    	],
    	[
    		[
    			20665,
    			10112
    		],
    		[
    			4,
    			8
    		]
    	],
    	[
    		[
    			20669,
    			10120
    		],
    		[
    			0,
    			7
    		]
    	],
    	[
    		[
    			20669,
    			10127
    		],
    		[
    			-3,
    			6
    		]
    	],
    	[
    		[
    			20666,
    			10133
    		],
    		[
    			3,
    			9
    		]
    	],
    	[
    		[
    			20669,
    			10142
    		],
    		[
    			0,
    			5
    		]
    	],
    	[
    		[
    			20669,
    			10147
    		],
    		[
    			-8,
    			5
    		]
    	],
    	[
    		[
    			20661,
    			10152
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			20660,
    			10153
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			20659,
    			10154
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			20658,
    			10156
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20657,
    			10156
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20657,
    			10157
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20656,
    			10157
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			20656,
    			10159
    		],
    		[
    			-6,
    			0
    		]
    	],
    	[
    		[
    			20650,
    			10159
    		],
    		[
    			-4,
    			2
    		]
    	],
    	[
    		[
    			20646,
    			10161
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20645,
    			10161
    		],
    		[
    			-2,
    			2
    		]
    	],
    	[
    		[
    			20643,
    			10163
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			20641,
    			10162
    		],
    		[
    			-2,
    			2
    		]
    	],
    	[
    		[
    			20639,
    			10164
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20638,
    			10164
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20637,
    			10164
    		],
    		[
    			-5,
    			-3
    		]
    	],
    	[
    		[
    			20632,
    			10161
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			20630,
    			10159
    		],
    		[
    			-5,
    			-5
    		]
    	],
    	[
    		[
    			20625,
    			10154
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			20623,
    			10154
    		],
    		[
    			-2,
    			-3
    		]
    	],
    	[
    		[
    			20621,
    			10151
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			20619,
    			10149
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			20616,
    			10151
    		],
    		[
    			-1,
    			4
    		]
    	],
    	[
    		[
    			20615,
    			10155
    		],
    		[
    			0,
    			9
    		]
    	],
    	[
    		[
    			20615,
    			10164
    		],
    		[
    			2,
    			9
    		]
    	],
    	[
    		[
    			20617,
    			10173
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			20616,
    			10175
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20616,
    			10178
    		],
    		[
    			-7,
    			8
    		]
    	],
    	[
    		[
    			20609,
    			10186
    		],
    		[
    			-10,
    			13
    		]
    	],
    	[
    		[
    			20599,
    			10199
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20599,
    			10200
    		],
    		[
    			0,
    			10
    		]
    	],
    	[
    		[
    			20599,
    			10210
    		],
    		[
    			-12,
    			34
    		]
    	],
    	[
    		[
    			20587,
    			10244
    		],
    		[
    			-1,
    			8
    		]
    	],
    	[
    		[
    			20586,
    			10252
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			20586,
    			10254
    		],
    		[
    			0,
    			15
    		]
    	],
    	[
    		[
    			20586,
    			10269
    		],
    		[
    			1,
    			4
    		]
    	],
    	[
    		[
    			20587,
    			10273
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			20586,
    			10275
    		],
    		[
    			-2,
    			5
    		]
    	],
    	[
    		[
    			20584,
    			10280
    		],
    		[
    			0,
    			13
    		]
    	],
    	[
    		[
    			20584,
    			10293
    		],
    		[
    			-1,
    			6
    		]
    	],
    	[
    		[
    			20583,
    			10299
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			20583,
    			10301
    		],
    		[
    			-1,
    			6
    		]
    	],
    	[
    		[
    			20582,
    			10307
    		],
    		[
    			4,
    			7
    		]
    	],
    	[
    		[
    			20586,
    			10314
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20586,
    			10315
    		],
    		[
    			1,
    			5
    		]
    	],
    	[
    		[
    			20587,
    			10320
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			20586,
    			10322
    		],
    		[
    			2,
    			8
    		]
    	],
    	[
    		[
    			20588,
    			10330
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20588,
    			10333
    		],
    		[
    			1,
    			3
    		]
    	],
    	[
    		[
    			20589,
    			10336
    		],
    		[
    			-1,
    			3
    		]
    	],
    	[
    		[
    			20588,
    			10339
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			20586,
    			10342
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			20585,
    			10344
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			20584,
    			10346
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20583,
    			10346
    		],
    		[
    			-1,
    			3
    		]
    	],
    	[
    		[
    			20582,
    			10349
    		],
    		[
    			-1,
    			5
    		]
    	],
    	[
    		[
    			20581,
    			10354
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			20579,
    			10354
    		],
    		[
    			-3,
    			5
    		]
    	],
    	[
    		[
    			20576,
    			10359
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			20576,
    			10361
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20576,
    			10362
    		],
    		[
    			-4,
    			1
    		]
    	],
    	[
    		[
    			20572,
    			10363
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			20571,
    			10362
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			20569,
    			10362
    		],
    		[
    			-10,
    			9
    		]
    	],
    	[
    		[
    			20559,
    			10371
    		],
    		[
    			-6,
    			12
    		]
    	],
    	[
    		[
    			20553,
    			10383
    		],
    		[
    			-11,
    			11
    		]
    	],
    	[
    		[
    			20542,
    			10394
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20542,
    			10397
    		],
    		[
    			-4,
    			12
    		]
    	],
    	[
    		[
    			20538,
    			10409
    		],
    		[
    			-6,
    			9
    		]
    	],
    	[
    		[
    			20532,
    			10418
    		],
    		[
    			-17,
    			12
    		]
    	],
    	[
    		[
    			20515,
    			10430
    		],
    		[
    			-6,
    			12
    		]
    	],
    	[
    		[
    			20509,
    			10442
    		],
    		[
    			-23,
    			65
    		]
    	],
    	[
    		[
    			20486,
    			10507
    		],
    		[
    			-1,
    			7
    		]
    	],
    	[
    		[
    			20485,
    			10514
    		],
    		[
    			-19,
    			21
    		]
    	],
    	[
    		[
    			20466,
    			10535
    		],
    		[
    			-14,
    			11
    		]
    	],
    	[
    		[
    			20452,
    			10546
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20451,
    			10546
    		],
    		[
    			-4,
    			0
    		]
    	],
    	[
    		[
    			20447,
    			10546
    		],
    		[
    			-4,
    			5
    		]
    	],
    	[
    		[
    			20443,
    			10551
    		],
    		[
    			-2,
    			2
    		]
    	],
    	[
    		[
    			20441,
    			10553
    		],
    		[
    			-4,
    			2
    		]
    	],
    	[
    		[
    			20437,
    			10555
    		],
    		[
    			-11,
    			-8
    		]
    	],
    	[
    		[
    			20426,
    			10547
    		],
    		[
    			-1,
    			3
    		]
    	],
    	[
    		[
    			20425,
    			10550
    		],
    		[
    			-15,
    			12
    		]
    	],
    	[
    		[
    			20410,
    			10562
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20410,
    			10561
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			20407,
    			10560
    		],
    		[
    			-8,
    			33
    		]
    	],
    	[
    		[
    			20399,
    			10593
    		],
    		[
    			1,
    			6
    		]
    	],
    	[
    		[
    			20400,
    			10599
    		],
    		[
    			6,
    			9
    		]
    	],
    	[
    		[
    			20406,
    			10608
    		],
    		[
    			7,
    			15
    		]
    	],
    	[
    		[
    			20413,
    			10623
    		],
    		[
    			-2,
    			5
    		]
    	],
    	[
    		[
    			20411,
    			10628
    		],
    		[
    			2,
    			3
    		]
    	],
    	[
    		[
    			20413,
    			10631
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20414,
    			10632
    		],
    		[
    			-2,
    			14
    		]
    	],
    	[
    		[
    			20412,
    			10646
    		],
    		[
    			6,
    			21
    		]
    	],
    	[
    		[
    			20418,
    			10667
    		],
    		[
    			6,
    			5
    		]
    	],
    	[
    		[
    			20424,
    			10672
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			20426,
    			10671
    		],
    		[
    			5,
    			-2
    		]
    	],
    	[
    		[
    			20431,
    			10669
    		],
    		[
    			30,
    			-3
    		]
    	],
    	[
    		[
    			20461,
    			10666
    		],
    		[
    			4,
    			-9
    		]
    	],
    	[
    		[
    			20465,
    			10657
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			20468,
    			10658
    		],
    		[
    			5,
    			4
    		]
    	],
    	[
    		[
    			20473,
    			10662
    		],
    		[
    			3,
    			6
    		]
    	],
    	[
    		[
    			20476,
    			10668
    		],
    		[
    			28,
    			27
    		]
    	],
    	[
    		[
    			20504,
    			10695
    		],
    		[
    			-2,
    			143
    		]
    	],
    	[
    		[
    			20502,
    			10838
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			20502,
    			10844
    		],
    		[
    			0,
    			16
    		]
    	],
    	[
    		[
    			20502,
    			10860
    		],
    		[
    			10,
    			56
    		]
    	],
    	[
    		[
    			20512,
    			10916
    		],
    		[
    			0,
    			15
    		]
    	],
    	[
    		[
    			20512,
    			10931
    		],
    		[
    			8,
    			72
    		]
    	],
    	[
    		[
    			20520,
    			11003
    		],
    		[
    			1,
    			13
    		]
    	],
    	[
    		[
    			20521,
    			11016
    		],
    		[
    			9,
    			36
    		]
    	],
    	[
    		[
    			20530,
    			11052
    		],
    		[
    			3,
    			6
    		]
    	],
    	[
    		[
    			20533,
    			11058
    		],
    		[
    			30,
    			2
    		]
    	],
    	[
    		[
    			20563,
    			11060
    		],
    		[
    			12,
    			1
    		]
    	],
    	[
    		[
    			20575,
    			11061
    		],
    		[
    			7,
    			79
    		]
    	],
    	[
    		[
    			20582,
    			11140
    		],
    		[
    			8,
    			25
    		]
    	],
    	[
    		[
    			20590,
    			11165
    		],
    		[
    			2,
    			56
    		],
    		[
    			28,
    			55
    		]
    	],
    	[
    		[
    			20620,
    			11276
    		],
    		[
    			26,
    			83
    		]
    	],
    	[
    		[
    			20646,
    			11359
    		],
    		[
    			7,
    			12
    		]
    	],
    	[
    		[
    			20653,
    			11371
    		],
    		[
    			0,
    			5
    		]
    	],
    	[
    		[
    			20653,
    			11376
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			20655,
    			11377
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20656,
    			11378
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			20660,
    			11379
    		],
    		[
    			31,
    			8
    		]
    	],
    	[
    		[
    			20691,
    			11387
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			20693,
    			11384
    		],
    		[
    			22,
    			123
    		]
    	],
    	[
    		[
    			20715,
    			11507
    		],
    		[
    			3,
    			13
    		]
    	],
    	[
    		[
    			20718,
    			11520
    		],
    		[
    			10,
    			47
    		]
    	],
    	[
    		[
    			20728,
    			11567
    		],
    		[
    			8,
    			77
    		]
    	],
    	[
    		[
    			19320,
    			19384
    		],
    		[
    			-31,
    			15
    		],
    		[
    			14,
    			178
    		],
    		[
    			-29,
    			56
    		],
    		[
    			10,
    			46
    		],
    		[
    			-26,
    			88
    		],
    		[
    			108,
    			77
    		],
    		[
    			-5,
    			34
    		],
    		[
    			113,
    			85
    		],
    		[
    			132,
    			153
    		],
    		[
    			54,
    			19
    		],
    		[
    			0,
    			82
    		],
    		[
    			-112,
    			56
    		]
    	],
    	[
    		[
    			19548,
    			20273
    		],
    		[
    			-49,
    			104
    		],
    		[
    			36,
    			66
    		],
    		[
    			-42,
    			55
    		],
    		[
    			20,
    			45
    		],
    		[
    			-70,
    			147
    		],
    		[
    			-97,
    			29
    		],
    		[
    			-142,
    			97
    		]
    	],
    	[
    		[
    			19204,
    			20816
    		],
    		[
    			104,
    			35
    		],
    		[
    			84,
    			-88
    		],
    		[
    			61,
    			-19
    		],
    		[
    			69,
    			35
    		],
    		[
    			99,
    			-38
    		],
    		[
    			83,
    			68
    		],
    		[
    			21,
    			118
    		],
    		[
    			189,
    			62
    		],
    		[
    			130,
    			-102
    		],
    		[
    			-39,
    			-71
    		]
    	],
    	[
    		[
    			20005,
    			20816
    		],
    		[
    			-45,
    			-86
    		],
    		[
    			20,
    			-59
    		],
    		[
    			64,
    			-20
    		],
    		[
    			60,
    			-93
    		],
    		[
    			-87,
    			-91
    		],
    		[
    			83,
    			-142
    		],
    		[
    			20,
    			-65
    		],
    		[
    			-37,
    			-18
    		],
    		[
    			-11,
    			-96
    		],
    		[
    			40,
    			-44
    		],
    		[
    			1,
    			-65
    		],
    		[
    			46,
    			-60
    		],
    		[
    			-53,
    			-49
    		],
    		[
    			120,
    			-88
    		],
    		[
    			33,
    			-54
    		],
    		[
    			-33,
    			-67
    		],
    		[
    			-190,
    			-206
    		],
    		[
    			-138,
    			-121
    		]
    	],
    	[
    		[
    			19898,
    			19392
    		],
    		[
    			-169,
    			-22
    		],
    		[
    			-145,
    			-69
    		],
    		[
    			-143,
    			-3
    		],
    		[
    			-56,
    			70
    		],
    		[
    			-65,
    			16
    		]
    	],
    	[
    		[
    			34298,
    			6359
    		],
    		[
    			22,
    			-41
    		],
    		[
    			24,
    			-83
    		],
    		[
    			-74,
    			-36
    		],
    		[
    			-54,
    			26
    		],
    		[
    			-8,
    			27
    		],
    		[
    			35,
    			84
    		],
    		[
    			55,
    			23
    		]
    	],
    	[
    		[
    			34471,
    			6555
    		],
    		[
    			0,
    			-4
    		],
    		[
    			-40,
    			-63
    		],
    		[
    			-87,
    			-70
    		],
    		[
    			3,
    			47
    		],
    		[
    			26,
    			34
    		],
    		[
    			98,
    			56
    		]
    	],
    	[
    		[
    			11549,
    			664
    		],
    		[
    			-45,
    			-104
    		],
    		[
    			-40,
    			34
    		],
    		[
    			3,
    			44
    		],
    		[
    			82,
    			26
    		]
    	],
    	[
    		[
    			11599,
    			672
    		],
    		[
    			32,
    			-1
    		],
    		[
    			68,
    			-71
    		],
    		[
    			-78,
    			-54
    		],
    		[
    			-90,
    			-36
    		],
    		[
    			-1,
    			60
    		],
    		[
    			36,
    			30
    		],
    		[
    			33,
    			72
    		]
    	],
    	[
    		[
    			18137,
    			16458
    		],
    		[
    			11,
    			-156
    		],
    		[
    			-33,
    			-120
    		],
    		[
    			-58,
    			132
    		],
    		[
    			13,
    			69
    		],
    		[
    			28,
    			13
    		],
    		[
    			39,
    			62
    		]
    	],
    	[
    		[
    			17793,
    			17550
    		],
    		[
    			53,
    			-15
    		]
    	],
    	[
    		[
    			17909,
    			16946
    		],
    		[
    			-22,
    			-18
    		],
    		[
    			31,
    			-96
    		],
    		[
    			-37,
    			-57
    		],
    		[
    			27,
    			-115
    		],
    		[
    			39,
    			-19
    		],
    		[
    			9,
    			-54
    		]
    	],
    	[
    		[
    			17956,
    			16587
    		],
    		[
    			-7,
    			-5
    		]
    	],
    	[
    		[
    			17949,
    			16582
    		],
    		[
    			-1,
    			1
    		],
    		[
    			-4,
    			-4
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			17945,
    			16577
    		],
    		[
    			-24,
    			-12
    		],
    		[
    			-48,
    			-77
    		],
    		[
    			-72,
    			-18
    		],
    		[
    			-53,
    			20
    		],
    		[
    			-41,
    			38
    		],
    		[
    			-90,
    			19
    		],
    		[
    			-69,
    			-53
    		],
    		[
    			-23,
    			-49
    		],
    		[
    			14,
    			-84
    		]
    	],
    	[
    		[
    			17064,
    			16514
    		],
    		[
    			33,
    			50
    		],
    		[
    			12,
    			79
    		],
    		[
    			26,
    			315
    		],
    		[
    			-8,
    			41
    		],
    		[
    			-64,
    			39
    		],
    		[
    			-59,
    			129
    		],
    		[
    			-8,
    			39
    		],
    		[
    			-185,
    			80
    		],
    		[
    			12,
    			38
    		],
    		[
    			-45,
    			51
    		],
    		[
    			40,
    			30
    		],
    		[
    			122,
    			32
    		],
    		[
    			42,
    			-57
    		],
    		[
    			103,
    			37
    		],
    		[
    			-3,
    			78
    		],
    		[
    			-25,
    			73
    		],
    		[
    			47,
    			10
    		],
    		[
    			18,
    			-49
    		],
    		[
    			93,
    			-23
    		],
    		[
    			36,
    			68
    		],
    		[
    			123,
    			69
    		],
    		[
    			13,
    			127
    		],
    		[
    			92,
    			39
    		]
    	],
    	[
    		[
    			16552,
    			19685
    		],
    		[
    			36,
    			-42
    		],
    		[
    			0,
    			-18
    		],
    		[
    			-47,
    			41
    		],
    		[
    			11,
    			19
    		]
    	],
    	[
    		[
    			32382,
    			10426
    		],
    		[
    			13,
    			-8
    		],
    		[
    			0,
    			-19
    		],
    		[
    			-15,
    			-3
    		],
    		[
    			2,
    			30
    		]
    	],
    	[
    		[
    			18308,
    			8591
    		],
    		[
    			-52,
    			107
    		],
    		[
    			-75,
    			110
    		],
    		[
    			-56,
    			127
    		],
    		[
    			-8,
    			56
    		],
    		[
    			-40,
    			123
    		],
    		[
    			49,
    			80
    		],
    		[
    			4,
    			73
    		],
    		[
    			16,
    			38
    		],
    		[
    			-19,
    			52
    		],
    		[
    			29,
    			23
    		],
    		[
    			5,
    			55
    		]
    	],
    	[
    		[
    			18161,
    			9435
    		],
    		[
    			32,
    			-11
    		],
    		[
    			128,
    			1
    		],
    		[
    			0,
    			196
    		]
    	],
    	[
    		[
    			16635,
    			18311
    		],
    		[
    			-84,
    			22
    		],
    		[
    			-43,
    			-14
    		],
    		[
    			-25,
    			65
    		],
    		[
    			58,
    			90
    		]
    	],
    	[
    		[
    			16541,
    			18474
    		],
    		[
    			73,
    			31
    		],
    		[
    			87,
    			-97
    		],
    		[
    			-2,
    			-69
    		],
    		[
    			-64,
    			-28
    		]
    	],
    	[
    		[
    			16636,
    			19051
    		],
    		[
    			-10,
    			-83
    		],
    		[
    			-49,
    			-40
    		],
    		[
    			-17,
    			76
    		],
    		[
    			76,
    			47
    		]
    	],
    	[
    		[
    			16915,
    			19074
    		],
    		[
    			13,
    			-57
    		],
    		[
    			-75,
    			-58
    		],
    		[
    			1,
    			-45
    		],
    		[
    			67,
    			5
    		],
    		[
    			139,
    			-18
    		],
    		[
    			-35,
    			-119
    		],
    		[
    			-105,
    			-155
    		],
    		[
    			60,
    			13
    		],
    		[
    			51,
    			-25
    		],
    		[
    			47,
    			-54
    		],
    		[
    			14,
    			-81
    		],
    		[
    			32,
    			-76
    		],
    		[
    			56,
    			-28
    		],
    		[
    			66,
    			-135
    		],
    		[
    			41,
    			-116
    		],
    		[
    			83,
    			-15
    		],
    		[
    			34,
    			-67
    		],
    		[
    			-17,
    			-66
    		],
    		[
    			-77,
    			-96
    		],
    		[
    			57,
    			-64
    		],
    		[
    			-97,
    			-54
    		],
    		[
    			-164,
    			-5
    		],
    		[
    			-58,
    			-32
    		],
    		[
    			-91,
    			23
    		],
    		[
    			-51,
    			-22
    		],
    		[
    			-27,
    			-67
    		],
    		[
    			-45,
    			28
    		],
    		[
    			-54,
    			-6
    		],
    		[
    			-3,
    			45
    		],
    		[
    			55,
    			100
    		],
    		[
    			116,
    			3
    		],
    		[
    			-150,
    			88
    		],
    		[
    			-34,
    			-24
    		],
    		[
    			-34,
    			52
    		],
    		[
    			102,
    			59
    		],
    		[
    			15,
    			77
    		],
    		[
    			-29,
    			52
    		],
    		[
    			22,
    			34
    		],
    		[
    			104,
    			34
    		],
    		[
    			-12,
    			107
    		],
    		[
    			-76,
    			116
    		],
    		[
    			-117,
    			34
    		],
    		[
    			54,
    			89
    		],
    		[
    			-34,
    			59
    		],
    		[
    			-68,
    			8
    		],
    		[
    			24,
    			103
    		],
    		[
    			-48,
    			8
    		],
    		[
    			29,
    			105
    		],
    		[
    			-23,
    			46
    		],
    		[
    			6,
    			65
    		],
    		[
    			115,
    			111
    		],
    		[
    			121,
    			21
    		]
    	],
    	[
    		[
    			16994,
    			17544
    		],
    		[
    			-2,
    			-12
    		],
    		[
    			-7,
    			5
    		],
    		[
    			9,
    			7
    		]
    	],
    	[
    		[
    			21398,
    			16141
    		],
    		[
    			-66,
    			75
    		],
    		[
    			-26,
    			-18
    		],
    		[
    			-92,
    			10
    		]
    	],
    	[
    		[
    			21214,
    			16208
    		],
    		[
    			21,
    			47
    		],
    		[
    			-28,
    			146
    		],
    		[
    			-63,
    			67
    		],
    		[
    			-51,
    			18
    		],
    		[
    			-26,
    			32
    		]
    	],
    	[
    		[
    			21067,
    			16518
    		],
    		[
    			53,
    			23
    		],
    		[
    			97,
    			-47
    		],
    		[
    			126,
    			-11
    		],
    		[
    			64,
    			-51
    		],
    		[
    			37,
    			-52
    		],
    		[
    			68,
    			33
    		],
    		[
    			49,
    			-10
    		],
    		[
    			57,
    			-43
    		],
    		[
    			-16,
    			-36
    		],
    		[
    			78,
    			-53
    		]
    	],
    	[
    		[
    			17222,
    			11122
    		],
    		[
    			8,
    			-85
    		],
    		[
    			33,
    			-36
    		],
    		[
    			10,
    			-80
    		],
    		[
    			-7,
    			-36
    		],
    		[
    			23,
    			-54
    		],
    		[
    			-17,
    			-111
    		],
    		[
    			33,
    			-66
    		],
    		[
    			-13,
    			-43
    		],
    		[
    			-5,
    			-111
    		],
    		[
    			12,
    			-18
    		],
    		[
    			-12,
    			-74
    		],
    		[
    			20,
    			-72
    		],
    		[
    			43,
    			-56
    		]
    	],
    	[
    		[
    			17350,
    			10280
    		],
    		[
    			-22,
    			-49
    		],
    		[
    			-65,
    			-7
    		],
    		[
    			-105,
    			-94
    		],
    		[
    			-75,
    			-30
    		],
    		[
    			-46,
    			-49
    		],
    		[
    			-29,
    			33
    		],
    		[
    			-70,
    			26
    		]
    	],
    	[
    		[
    			16724,
    			15309
    		],
    		[
    			0,
    			-6
    		],
    		[
    			-1,
    			2
    		],
    		[
    			0,
    			4
    		]
    	],
    	[
    		[
    			16146,
    			11335
    		],
    		[
    			-11,
    			-34
    		],
    		[
    			23,
    			-37
    		],
    		[
    			23,
    			36
    		],
    		[
    			38,
    			-39
    		],
    		[
    			29,
    			41
    		],
    		[
    			59,
    			-32
    		],
    		[
    			51,
    			77
    		],
    		[
    			35,
    			-94
    		],
    		[
    			-5,
    			-49
    		],
    		[
    			44,
    			-42
    		],
    		[
    			15,
    			-161
    		],
    		[
    			24,
    			-41
    		]
    	],
    	[
    		[
    			16424,
    			10522
    		],
    		[
    			-52,
    			-52
    		],
    		[
    			-37,
    			29
    		],
    		[
    			6,
    			55
    		],
    		[
    			-18,
    			106
    		],
    		[
    			-23,
    			29
    		],
    		[
    			-49,
    			-11
    		]
    	],
    	[
    		[
    			16251,
    			10678
    		],
    		[
    			-26,
    			-30
    		],
    		[
    			-3,
    			123
    		],
    		[
    			-8,
    			45
    		],
    		[
    			-52,
    			115
    		],
    		[
    			-65,
    			0
    		],
    		[
    			-52,
    			-20
    		],
    		[
    			-35,
    			-97
    		],
    		[
    			-49,
    			-44
    		]
    	],
    	[
    		[
    			15961,
    			10770
    		],
    		[
    			6,
    			18
    		],
    		[
    			-36,
    			97
    		],
    		[
    			-72,
    			85
    		],
    		[
    			-28,
    			47
    		],
    		[
    			-25,
    			90
    		]
    	],
    	[
    		[
    			15806,
    			11107
    		],
    		[
    			25,
    			74
    		],
    		[
    			38,
    			29
    		],
    		[
    			53,
    			6
    		],
    		[
    			1,
    			163
    		]
    	],
    	[
    		[
    			15923,
    			11379
    		],
    		[
    			62,
    			-10
    		],
    		[
    			69,
    			-52
    		],
    		[
    			43,
    			20
    		],
    		[
    			49,
    			-2
    		]
    	],
    	[
    		[
    			11350,
    			12020
    		],
    		[
    			10,
    			-28
    		],
    		[
    			-18,
    			-7
    		],
    		[
    			8,
    			35
    		]
    	],
    	[
    		[
    			15632,
    			11441
    		],
    		[
    			-8,
    			47
    		],
    		[
    			25,
    			46
    		]
    	],
    	[
    		[
    			15649,
    			11534
    		],
    		[
    			105,
    			0
    		],
    		[
    			13,
    			30
    		],
    		[
    			46,
    			-1
    		],
    		[
    			50,
    			-55
    		],
    		[
    			41,
    			18
    		],
    		[
    			5,
    			-39
    		],
    		[
    			-49,
    			-14
    		],
    		[
    			-82,
    			50
    		],
    		[
    			-56,
    			-31
    		],
    		[
    			0,
    			-31
    		],
    		[
    			-83,
    			0
    		],
    		[
    			-7,
    			-20
    		]
    	],
    	[
    		[
    			15806,
    			11107
    		],
    		[
    			0,
    			-1
    		],
    		[
    			-3,
    			-11
    		],
    		[
    			-38,
    			28
    		],
    		[
    			-16,
    			106
    		],
    		[
    			-43,
    			-2
    		],
    		[
    			-71,
    			94
    		]
    	],
    	[
    		[
    			15635,
    			11321
    		],
    		[
    			48,
    			21
    		],
    		[
    			49,
    			-5
    		],
    		[
    			50,
    			43
    		],
    		[
    			141,
    			-1
    		]
    	],
    	[
    		[
    			18161,
    			9435
    		],
    		[
    			-25,
    			36
    		],
    		[
    			39,
    			110
    		],
    		[
    			1,
    			69
    		]
    	],
    	[
    		[
    			18072,
    			9887
    		],
    		[
    			19,
    			-21
    		],
    		[
    			-24,
    			-71
    		],
    		[
    			-23,
    			11
    		],
    		[
    			28,
    			81
    		]
    	],
    	[
    		[
    			19516,
    			15206
    		],
    		[
    			44,
    			-30
    		],
    		[
    			67,
    			11
    		],
    		[
    			66,
    			-13
    		],
    		[
    			26,
    			-52
    		],
    		[
    			-104,
    			-16
    		],
    		[
    			-44,
    			42
    		],
    		[
    			-74,
    			6
    		],
    		[
    			19,
    			52
    		]
    	],
    	[
    		[
    			19474,
    			15787
    		],
    		[
    			20,
    			-40
    		],
    		[
    			54,
    			-19
    		],
    		[
    			3,
    			-44
    		],
    		[
    			-53,
    			6
    		],
    		[
    			-41,
    			68
    		],
    		[
    			17,
    			29
    		]
    	],
    	[
    		[
    			19759,
    			15848
    		],
    		[
    			6,
    			-69
    		],
    		[
    			-52,
    			32
    		],
    		[
    			46,
    			37
    		]
    	],
    	[
    		[
    			19760,
    			16240
    		],
    		[
    			26,
    			-61
    		],
    		[
    			-31,
    			-29
    		],
    		[
    			-26,
    			-73
    		]
    	],
    	[
    		[
    			19729,
    			16077
    		],
    		[
    			-68,
    			34
    		],
    		[
    			-51,
    			-16
    		],
    		[
    			-38,
    			14
    		],
    		[
    			-31,
    			-35
    		],
    		[
    			-28,
    			-89
    		],
    		[
    			-83,
    			32
    		],
    		[
    			-35,
    			-38
    		],
    		[
    			37,
    			-98
    		],
    		[
    			-10,
    			-49
    		],
    		[
    			17,
    			-50
    		],
    		[
    			-29,
    			-24
    		],
    		[
    			93,
    			-83
    		],
    		[
    			27,
    			-10
    		],
    		[
    			10,
    			-101
    		],
    		[
    			-46,
    			60
    		],
    		[
    			-34,
    			-11
    		],
    		[
    			-7,
    			-59
    		],
    		[
    			-42,
    			-10
    		],
    		[
    			38,
    			-131
    		],
    		[
    			-73,
    			-14
    		],
    		[
    			-20,
    			55
    		],
    		[
    			-42,
    			-35
    		],
    		[
    			-1,
    			89
    		],
    		[
    			-55,
    			83
    		],
    		[
    			23,
    			54
    		],
    		[
    			-60,
    			106
    		],
    		[
    			3,
    			39
    		],
    		[
    			-46,
    			50
    		],
    		[
    			-26,
    			61
    		]
    	],
    	[
    		[
    			19244,
    			16095
    		],
    		[
    			57,
    			2
    		],
    		[
    			35,
    			40
    		],
    		[
    			78,
    			10
    		],
    		[
    			19,
    			31
    		]
    	],
    	[
    		[
    			11334,
    			11303
    		],
    		[
    			0,
    			-30
    		],
    		[
    			-12,
    			-8
    		],
    		[
    			4,
    			32
    		],
    		[
    			8,
    			6
    		]
    	],
    	[
    		[
    			12061,
    			21021
    		],
    		[
    			193,
    			-79
    		],
    		[
    			-20,
    			-59
    		],
    		[
    			-127,
    			-38
    		],
    		[
    			-35,
    			52
    		],
    		[
    			-102,
    			25
    		],
    		[
    			14,
    			84
    		],
    		[
    			77,
    			15
    		]
    	],
    	[
    		[
    			14775,
    			21148
    		],
    		[
    			39,
    			-64
    		],
    		[
    			-249,
    			-38
    		],
    		[
    			81,
    			77
    		],
    		[
    			129,
    			25
    		]
    	],
    	[
    		[
    			14919,
    			21456
    		],
    		[
    			99,
    			-8
    		],
    		[
    			118,
    			-59
    		],
    		[
    			-44,
    			-61
    		],
    		[
    			-194,
    			83
    		],
    		[
    			21,
    			45
    		]
    	],
    	[
    		[
    			14861,
    			21548
    		],
    		[
    			121,
    			-18
    		],
    		[
    			-89,
    			-50
    		],
    		[
    			-118,
    			23
    		],
    		[
    			86,
    			45
    		]
    	],
    	[
    		[
    			14130,
    			23252
    		],
    		[
    			589,
    			-37
    		],
    		[
    			166,
    			-82
    		],
    		[
    			308,
    			-53
    		],
    		[
    			-309,
    			-99
    		],
    		[
    			316,
    			13
    		],
    		[
    			-6,
    			-103
    		],
    		[
    			417,
    			21
    		],
    		[
    			271,
    			39
    		],
    		[
    			270,
    			-60
    		],
    		[
    			-398,
    			-141
    		],
    		[
    			-262,
    			-157
    		],
    		[
    			-133,
    			-46
    		],
    		[
    			23,
    			-50
    		],
    		[
    			-152,
    			-64
    		],
    		[
    			-69,
    			-125
    		],
    		[
    			230,
    			-41
    		],
    		[
    			-105,
    			-28
    		],
    		[
    			205,
    			-111
    		],
    		[
    			-263,
    			-7
    		],
    		[
    			-86,
    			-44
    		],
    		[
    			27,
    			-36
    		],
    		[
    			175,
    			-45
    		],
    		[
    			34,
    			-142
    		],
    		[
    			-89,
    			12
    		],
    		[
    			-28,
    			-100
    		],
    		[
    			157,
    			-42
    		],
    		[
    			-38,
    			-36
    		],
    		[
    			-166,
    			-30
    		],
    		[
    			80,
    			-36
    		],
    		[
    			-29,
    			-72
    		],
    		[
    			-179,
    			-31
    		],
    		[
    			-196,
    			76
    		],
    		[
    			-23,
    			-36
    		],
    		[
    			-130,
    			-50
    		],
    		[
    			77,
    			-21
    		],
    		[
    			70,
    			-110
    		],
    		[
    			197,
    			-85
    		],
    		[
    			-48,
    			-30
    		],
    		[
    			111,
    			-76
    		],
    		[
    			21,
    			-115
    		],
    		[
    			-141,
    			-27
    		],
    		[
    			-94,
    			44
    		],
    		[
    			-20,
    			66
    		],
    		[
    			-132,
    			10
    		],
    		[
    			-109,
    			-35
    		],
    		[
    			-83,
    			0
    		],
    		[
    			-55,
    			-96
    		],
    		[
    			141,
    			19
    		],
    		[
    			43,
    			-46
    		],
    		[
    			97,
    			35
    		],
    		[
    			133,
    			-43
    		],
    		[
    			112,
    			-12
    		],
    		[
    			-29,
    			-54
    		],
    		[
    			-63,
    			-6
    		],
    		[
    			-86,
    			-73
    		],
    		[
    			-177,
    			-106
    		],
    		[
    			-382,
    			-99
    		],
    		[
    			-149,
    			3
    		],
    		[
    			-139,
    			-115
    		],
    		[
    			1,
    			-21
    		],
    		[
    			-121,
    			-155
    		],
    		[
    			-82,
    			-10
    		],
    		[
    			-50,
    			-61
    		],
    		[
    			-107,
    			-27
    		],
    		[
    			-74,
    			34
    		],
    		[
    			-22,
    			-54
    		],
    		[
    			-178,
    			-11
    		],
    		[
    			20,
    			-47
    		],
    		[
    			-125,
    			-59
    		],
    		[
    			56,
    			-73
    		],
    		[
    			-16,
    			-55
    		],
    		[
    			20,
    			-73
    		],
    		[
    			-91,
    			-88
    		],
    		[
    			-13,
    			-48
    		],
    		[
    			-72,
    			-62
    		],
    		[
    			25,
    			-92
    		],
    		[
    			-29,
    			-97
    		],
    		[
    			-49,
    			-108
    		],
    		[
    			8,
    			-36
    		],
    		[
    			-43,
    			-80
    		],
    		[
    			-85,
    			16
    		],
    		[
    			-34,
    			-27
    		],
    		[
    			-58,
    			14
    		],
    		[
    			18,
    			59
    		],
    		[
    			-75,
    			19
    		],
    		[
    			-38,
    			72
    		],
    		[
    			-81,
    			-34
    		],
    		[
    			-118,
    			1
    		],
    		[
    			18,
    			39
    		],
    		[
    			-105,
    			76
    		],
    		[
    			-48,
    			127
    		],
    		[
    			-68,
    			40
    		],
    		[
    			11,
    			30
    		],
    		[
    			-81,
    			85
    		],
    		[
    			-66,
    			181
    		],
    		[
    			-38,
    			71
    		],
    		[
    			9,
    			47
    		],
    		[
    			-36,
    			77
    		],
    		[
    			-71,
    			40
    		],
    		[
    			-51,
    			113
    		],
    		[
    			38,
    			60
    		],
    		[
    			-60,
    			71
    		],
    		[
    			64,
    			150
    		],
    		[
    			81,
    			92
    		],
    		[
    			130,
    			5
    		],
    		[
    			-13,
    			35
    		],
    		[
    			55,
    			164
    		],
    		[
    			-29,
    			31
    		],
    		[
    			-136,
    			14
    		],
    		[
    			-82,
    			49
    		],
    		[
    			-81,
    			12
    		],
    		[
    			4,
    			70
    		],
    		[
    			127,
    			-16
    		],
    		[
    			109,
    			-53
    		],
    		[
    			65,
    			44
    		],
    		[
    			-134,
    			73
    		],
    		[
    			-29,
    			94
    		],
    		[
    			-105,
    			11
    		],
    		[
    			-22,
    			-50
    		],
    		[
    			-156,
    			3
    		],
    		[
    			-5,
    			97
    		],
    		[
    			62,
    			33
    		],
    		[
    			31,
    			98
    		],
    		[
    			-76,
    			53
    		],
    		[
    			23,
    			46
    		],
    		[
    			-144,
    			132
    		],
    		[
    			41,
    			55
    		],
    		[
    			-181,
    			95
    		],
    		[
    			-1,
    			69
    		],
    		[
    			-147,
    			75
    		],
    		[
    			-359,
    			70
    		],
    		[
    			-192,
    			-60
    		],
    		[
    			-61,
    			38
    		],
    		[
    			-223,
    			-29
    		],
    		[
    			-119,
    			50
    		],
    		[
    			107,
    			48
    		],
    		[
    			-203,
    			22
    		],
    		[
    			-72,
    			37
    		],
    		[
    			211,
    			74
    		],
    		[
    			-101,
    			21
    		],
    		[
    			-243,
    			87
    		],
    		[
    			30,
    			71
    		],
    		[
    			310,
    			48
    		],
    		[
    			196,
    			56
    		],
    		[
    			108,
    			-6
    		],
    		[
    			118,
    			71
    		],
    		[
    			-15,
    			73
    		],
    		[
    			-193,
    			12
    		],
    		[
    			-37,
    			50
    		],
    		[
    			419,
    			144
    		],
    		[
    			198,
    			-7
    		],
    		[
    			-29,
    			109
    		],
    		[
    			645,
    			92
    		],
    		[
    			250,
    			-74
    		],
    		[
    			242,
    			95
    		],
    		[
    			286,
    			-66
    		],
    		[
    			233,
    			54
    		],
    		[
    			-167,
    			51
    		],
    		[
    			19,
    			63
    		],
    		[
    			265,
    			30
    		],
    		[
    			200,
    			-51
    		],
    		[
    			194,
    			38
    		],
    		[
    			-30,
    			39
    		],
    		[
    			621,
    			30
    		]
    	],
    	[
    		[
    			8719,
    			11917
    		],
    		[
    			38,
    			-3
    		],
    		[
    			31,
    			-26
    		]
    	],
    	[
    		[
    			8788,
    			11888
    		],
    		[
    			-44,
    			-64
    		],
    		[
    			-45,
    			-44
    		],
    		[
    			2,
    			-62
    		],
    		[
    			-21,
    			-47
    		]
    	],
    	[
    		[
    			8680,
    			11671
    		],
    		[
    			-52,
    			-64
    		],
    		[
    			-23,
    			-50
    		]
    	],
    	[
    		[
    			8605,
    			11557
    		],
    		[
    			-52,
    			31
    		],
    		[
    			-60,
    			4
    		],
    		[
    			-47,
    			40
    		],
    		[
    			-43,
    			59
    		]
    	],
    	[
    		[
    			8403,
    			11691
    		],
    		[
    			17,
    			89
    		],
    		[
    			-14,
    			32
    		],
    		[
    			47,
    			137
    		],
    		[
    			122,
    			-2
    		],
    		[
    			3,
    			58
    		],
    		[
    			-97,
    			140
    		],
    		[
    			42,
    			1
    		],
    		[
    			1,
    			93
    		],
    		[
    			175,
    			-1
    		]
    	],
    	[
    		[
    			12013,
    			9648
    		],
    		[
    			34,
    			84
    		],
    		[
    			0,
    			61
    		],
    		[
    			20,
    			68
    		],
    		[
    			-35,
    			73
    		],
    		[
    			-13,
    			144
    		],
    		[
    			45,
    			120
    		]
    	],
    	[
    		[
    			12064,
    			10198
    		],
    		[
    			20,
    			22
    		],
    		[
    			30,
    			-32
    		],
    		[
    			53,
    			-17
    		],
    		[
    			40,
    			-68
    		],
    		[
    			71,
    			-82
    		],
    		[
    			15,
    			-62
    		]
    	],
    	[
    		[
    			31111,
    			11533
    		],
    		[
    			-11,
    			-29
    		],
    		[
    			-3,
    			-24
    		],
    		[
    			-12,
    			11
    		],
    		[
    			5,
    			20
    		],
    		[
    			21,
    			22
    		]
    	],
    	[
    		[
    			11765,
    			10234
    		],
    		[
    			-27,
    			-142
    		],
    		[
    			-25,
    			4
    		],
    		[
    			-36,
    			-144
    		],
    		[
    			36,
    			-127
    		],
    		[
    			35,
    			0
    		],
    		[
    			15,
    			-96
    		],
    		[
    			45,
    			-129
    		],
    		[
    			20,
    			-17
    		]
    	],
    	[
    		[
    			11420,
    			10127
    		],
    		[
    			-62,
    			123
    		],
    		[
    			26,
    			45
    		],
    		[
    			-5,
    			82
    		],
    		[
    			48,
    			25
    		],
    		[
    			37,
    			46
    		],
    		[
    			-42,
    			69
    		],
    		[
    			18,
    			50
    		],
    		[
    			50,
    			41
    		],
    		[
    			19,
    			39
    		],
    		[
    			-19,
    			43
    		]
    	],
    	[
    		[
    			11490,
    			10690
    		],
    		[
    			85,
    			-90
    		],
    		[
    			61,
    			-112
    		],
    		[
    			0,
    			-57
    		],
    		[
    			42,
    			-32
    		],
    		[
    			49,
    			-91
    		],
    		[
    			33,
    			-28
    		],
    		[
    			5,
    			-46
    		]
    	],
    	[
    		[
    			28174,
    			13033
    		],
    		[
    			15,
    			-22
    		],
    		[
    			-22,
    			-23
    		],
    		[
    			-12,
    			36
    		]
    	],
    	[
    		[
    			24261,
    			385
    		],
    		[
    			20,
    			-1
    		],
    		[
    			15,
    			-18
    		],
    		[
    			-14,
    			-11
    		],
    		[
    			-17,
    			10
    		],
    		[
    			-4,
    			20
    		]
    	],
    	[
    		[
    			9273,
    			11767
    		],
    		[
    			-24,
    			4
    		],
    		[
    			-34,
    			-36
    		],
    		[
    			-71,
    			-31
    		],
    		[
    			-38,
    			32
    		],
    		[
    			-48,
    			-114
    		],
    		[
    			-49,
    			-37
    		],
    		[
    			-23,
    			21
    		],
    		[
    			-19,
    			-46
    		],
    		[
    			-39,
    			3
    		],
    		[
    			5,
    			-80
    		],
    		[
    			-26,
    			-47
    		],
    		[
    			-32,
    			-6
    		]
    	],
    	[
    		[
    			8875,
    			11430
    		],
    		[
    			-28,
    			69
    		],
    		[
    			-21,
    			2
    		]
    	],
    	[
    		[
    			8826,
    			11501
    		],
    		[
    			11,
    			69
    		],
    		[
    			-50,
    			28
    		],
    		[
    			-19,
    			-18
    		],
    		[
    			-88,
    			91
    		]
    	],
    	[
    		[
    			8788,
    			11888
    		],
    		[
    			49,
    			33
    		],
    		[
    			76,
    			-28
    		],
    		[
    			115,
    			36
    		],
    		[
    			25,
    			-17
    		],
    		[
    			40,
    			22
    		],
    		[
    			70,
    			-30
    		],
    		[
    			46,
    			-65
    		],
    		[
    			38,
    			-26
    		],
    		[
    			26,
    			-46
    		]
    	],
    	[
    		[
    			19003,
    			16381
    		],
    		[
    			6,
    			-23
    		]
    	],
    	[
    		[
    			19009,
    			16358
    		],
    		[
    			-84,
    			78
    		]
    	],
    	[
    		[
    			18825,
    			17035
    		],
    		[
    			75,
    			-90
    		],
    		[
    			98,
    			-31
    		],
    		[
    			46,
    			29
    		]
    	],
    	[
    		[
    			19044,
    			16943
    		],
    		[
    			35,
    			-113
    		],
    		[
    			-23,
    			-65
    		]
    	],
    	[
    		[
    			18919,
    			16444
    		],
    		[
    			-68,
    			77
    		],
    		[
    			-87,
    			19
    		],
    		[
    			-77,
    			113
    		],
    		[
    			12,
    			29
    		],
    		[
    			-37,
    			56
    		],
    		[
    			-5,
    			67
    		],
    		[
    			-49,
    			43
    		],
    		[
    			-33,
    			-77
    		],
    		[
    			-36,
    			36
    		],
    		[
    			-2,
    			62
    		]
    	],
    	[
    		[
    			18537,
    			16869
    		],
    		[
    			85,
    			10
    		],
    		[
    			81,
    			-14
    		],
    		[
    			-4,
    			47
    		],
    		[
    			38,
    			18
    		],
    		[
    			-1,
    			60
    		],
    		[
    			89,
    			45
    		]
    	],
    	[
    		[
    			10365,
    			12275
    		],
    		[
    			-29,
    			35
    		],
    		[
    			-73,
    			-17
    		],
    		[
    			-49,
    			14
    		],
    		[
    			-48,
    			-15
    		],
    		[
    			-62,
    			50
    		],
    		[
    			33,
    			40
    		],
    		[
    			135,
    			-40
    		],
    		[
    			18,
    			58
    		],
    		[
    			-26,
    			43
    		],
    		[
    			12,
    			64
    		],
    		[
    			-35,
    			36
    		],
    		[
    			-10,
    			50
    		],
    		[
    			36,
    			4
    		],
    		[
    			45,
    			-32
    		],
    		[
    			52,
    			-10
    		]
    	],
    	[
    		[
    			19354,
    			17355
    		],
    		[
    			75,
    			-71
    		]
    	],
    	[
    		[
    			19429,
    			17284
    		],
    		[
    			-55,
    			-33
    		],
    		[
    			-96,
    			-190
    		],
    		[
    			-15,
    			-54
    		],
    		[
    			-87,
    			-31
    		]
    	],
    	[
    		[
    			19176,
    			16976
    		],
    		[
    			-67,
    			10
    		],
    		[
    			-65,
    			-43
    		]
    	],
    	[
    		[
    			18825,
    			17035
    		],
    		[
    			-47,
    			67
    		]
    	],
    	[
    		[
    			18879,
    			17293
    		],
    		[
    			53,
    			-43
    		],
    		[
    			92,
    			0
    		],
    		[
    			15,
    			48
    		],
    		[
    			105,
    			15
    		],
    		[
    			87,
    			76
    		],
    		[
    			123,
    			-34
    		]
    	],
    	[
    		[
    			28729,
    			7685
    		],
    		[
    			40,
    			-40
    		],
    		[
    			34,
    			-79
    		],
    		[
    			-34,
    			-35
    		],
    		[
    			-27,
    			12
    		],
    		[
    			-28,
    			53
    		],
    		[
    			-38,
    			31
    		],
    		[
    			-28,
    			-3
    		],
    		[
    			-19,
    			49
    		],
    		[
    			30,
    			18
    		],
    		[
    			70,
    			-6
    		]
    	],
    	[
    		[
    			29200,
    			7758
    		],
    		[
    			13,
    			-82
    		]
    	],
    	[
    		[
    			29213,
    			7676
    		],
    		[
    			-32,
    			-72
    		],
    		[
    			-39,
    			-49
    		],
    		[
    			-62,
    			-33
    		],
    		[
    			-16,
    			33
    		],
    		[
    			13,
    			90
    		],
    		[
    			36,
    			49
    		],
    		[
    			41,
    			28
    		],
    		[
    			46,
    			36
    		]
    	],
    	[
    		[
    			28379,
    			7883
    		],
    		[
    			33,
    			-24
    		],
    		[
    			-23,
    			-96
    		],
    		[
    			-30,
    			9
    		],
    		[
    			-12,
    			72
    		],
    		[
    			32,
    			39
    		]
    	],
    	[
    		[
    			29159,
    			7897
    		],
    		[
    			54,
    			-4
    		],
    		[
    			2,
    			-32
    		],
    		[
    			-65,
    			-19
    		],
    		[
    			9,
    			55
    		]
    	],
    	[
    		[
    			28530,
    			7900
    		],
    		[
    			26,
    			-38
    		],
    		[
    			21,
    			13
    		],
    		[
    			53,
    			-10
    		],
    		[
    			4,
    			-56
    		],
    		[
    			-53,
    			-38
    		],
    		[
    			-76,
    			-6
    		],
    		[
    			-61,
    			-32
    		],
    		[
    			-31,
    			19
    		],
    		[
    			4,
    			54
    		],
    		[
    			38,
    			51
    		],
    		[
    			43,
    			-13
    		],
    		[
    			18,
    			-48
    		],
    		[
    			27,
    			13
    		],
    		[
    			-34,
    			63
    		],
    		[
    			21,
    			28
    		]
    	],
    	[
    		[
    			29001,
    			7906
    		],
    		[
    			-5,
    			-88
    		],
    		[
    			-102,
    			-48
    		],
    		[
    			-36,
    			14
    		],
    		[
    			-37,
    			-27
    		],
    		[
    			-16,
    			23
    		],
    		[
    			-81,
    			0
    		],
    		[
    			-10,
    			61
    		],
    		[
    			37,
    			30
    		],
    		[
    			38,
    			0
    		],
    		[
    			61,
    			-36
    		],
    		[
    			111,
    			-18
    		],
    		[
    			40,
    			53
    		],
    		[
    			0,
    			36
    		]
    	],
    	[
    		[
    			28274,
    			7902
    		],
    		[
    			42,
    			-50
    		],
    		[
    			-52,
    			-58
    		],
    		[
    			-26,
    			47
    		],
    		[
    			-30,
    			10
    		],
    		[
    			-1,
    			47
    		],
    		[
    			67,
    			4
    		]
    	],
    	[
    		[
    			29361,
    			7991
    		],
    		[
    			-20,
    			-61
    		],
    		[
    			-59,
    			12
    		],
    		[
    			79,
    			49
    		]
    	],
    	[
    		[
    			30525,
    			8020
    		],
    		[
    			31,
    			-29
    		],
    		[
    			-27,
    			-95
    		],
    		[
    			-59,
    			-47
    		],
    		[
    			-56,
    			12
    		],
    		[
    			31,
    			97
    		],
    		[
    			28,
    			49
    		],
    		[
    			52,
    			13
    		]
    	],
    	[
    		[
    			29842,
    			8067
    		],
    		[
    			-3,
    			-88
    		],
    		[
    			-33,
    			-62
    		],
    		[
    			-16,
    			4
    		],
    		[
    			13,
    			87
    		],
    		[
    			39,
    			59
    		]
    	],
    	[
    		[
    			28150,
    			8106
    		],
    		[
    			-42,
    			-60
    		],
    		[
    			-42,
    			1
    		],
    		[
    			-24,
    			57
    		],
    		[
    			108,
    			2
    		]
    	],
    	[
    		[
    			30082,
    			8218
    		],
    		[
    			32,
    			-49
    		],
    		[
    			-31,
    			-69
    		],
    		[
    			-12,
    			25
    		],
    		[
    			11,
    			93
    		]
    	],
    	[
    		[
    			28016,
    			8098
    		],
    		[
    			23,
    			-62
    		],
    		[
    			-7,
    			-36
    		],
    		[
    			55,
    			-45
    		],
    		[
    			68,
    			28
    		],
    		[
    			40,
    			-34
    		],
    		[
    			-11,
    			-103
    		],
    		[
    			19,
    			-58
    		],
    		[
    			-140,
    			82
    		],
    		[
    			-38,
    			-26
    		],
    		[
    			-67,
    			26
    		],
    		[
    			-25,
    			-15
    		],
    		[
    			-99,
    			33
    		],
    		[
    			-77,
    			57
    		],
    		[
    			-47,
    			20
    		],
    		[
    			-76,
    			7
    		],
    		[
    			-25,
    			-23
    		],
    		[
    			-48,
    			15
    		],
    		[
    			-37,
    			36
    		],
    		[
    			-85,
    			16
    		],
    		[
    			-21,
    			70
    		],
    		[
    			-27,
    			28
    		],
    		[
    			-51,
    			-5
    		],
    		[
    			28,
    			70
    		],
    		[
    			6,
    			63
    		],
    		[
    			79,
    			6
    		],
    		[
    			12,
    			-15
    		],
    		[
    			48,
    			26
    		],
    		[
    			32,
    			-48
    		],
    		[
    			83,
    			-37
    		],
    		[
    			6,
    			-49
    		],
    		[
    			178,
    			-31
    		],
    		[
    			20,
    			76
    		],
    		[
    			34,
    			13
    		],
    		[
    			12,
    			-45
    		],
    		[
    			39,
    			9
    		],
    		[
    			55,
    			-44
    		],
    		[
    			44,
    			-5
    		]
    	],
    	[
    		[
    			28984,
    			8486
    		],
    		[
    			6,
    			-60
    		],
    		[
    			-20,
    			-78
    		],
    		[
    			-26,
    			8
    		],
    		[
    			3,
    			92
    		],
    		[
    			37,
    			38
    		]
    	],
    	[
    		[
    			29020,
    			8527
    		],
    		[
    			13,
    			-41
    		],
    		[
    			-19,
    			-33
    		],
    		[
    			-3,
    			-97
    		],
    		[
    			-15,
    			-51
    		],
    		[
    			-25,
    			33
    		],
    		[
    			23,
    			76
    		],
    		[
    			10,
    			98
    		],
    		[
    			16,
    			15
    		]
    	],
    	[
    		[
    			28369,
    			8718
    		],
    		[
    			0,
    			-115
    		],
    		[
    			-26,
    			37
    		],
    		[
    			26,
    			78
    		]
    	],
    	[
    		[
    			29366,
    			8746
    		],
    		[
    			55,
    			-53
    		],
    		[
    			-1,
    			-36
    		],
    		[
    			-48,
    			-42
    		],
    		[
    			-53,
    			37
    		],
    		[
    			-17,
    			75
    		],
    		[
    			64,
    			19
    		]
    	],
    	[
    		[
    			29639,
    			8792
    		],
    		[
    			46,
    			-37
    		],
    		[
    			37,
    			0
    		],
    		[
    			45,
    			-104
    		],
    		[
    			-11,
    			-35
    		],
    		[
    			-72,
    			58
    		],
    		[
    			-10,
    			25
    		],
    		[
    			-37,
    			-22
    		],
    		[
    			-61,
    			45
    		],
    		[
    			-35,
    			-43
    		],
    		[
    			-41,
    			55
    		],
    		[
    			8,
    			45
    		],
    		[
    			65,
    			-1
    		],
    		[
    			26,
    			-17
    		],
    		[
    			40,
    			31
    		]
    	],
    	[
    		[
    			27558,
    			8833
    		],
    		[
    			46,
    			-55
    		],
    		[
    			-13,
    			-50
    		],
    		[
    			-46,
    			-7
    		],
    		[
    			-10,
    			33
    		],
    		[
    			6,
    			67
    		],
    		[
    			17,
    			12
    		]
    	],
    	[
    		[
    			29715,
    			8977
    		],
    		[
    			-8,
    			-63
    		],
    		[
    			-48,
    			33
    		],
    		[
    			56,
    			30
    		]
    	],
    	[
    		[
    			30209,
    			8989
    		],
    		[
    			84,
    			-19
    		],
    		[
    			-9,
    			-29
    		],
    		[
    			-75,
    			48
    		]
    	],
    	[
    		[
    			27374,
    			9006
    		],
    		[
    			28,
    			-67
    		],
    		[
    			5,
    			-69
    		],
    		[
    			46,
    			-56
    		],
    		[
    			-28,
    			-54
    		],
    		[
    			-45,
    			26
    		],
    		[
    			-15,
    			107
    		],
    		[
    			-47,
    			5
    		],
    		[
    			16,
    			98
    		],
    		[
    			40,
    			10
    		]
    	],
    	[
    		[
    			29458,
    			9034
    		],
    		[
    			49,
    			-52
    		],
    		[
    			-64,
    			-15
    		],
    		[
    			15,
    			67
    		]
    	],
    	[
    		[
    			29029,
    			9064
    		],
    		[
    			37,
    			-29
    		],
    		[
    			-14,
    			-34
    		],
    		[
    			-47,
    			-12
    		],
    		[
    			-8,
    			53
    		],
    		[
    			32,
    			22
    		]
    	],
    	[
    		[
    			26705,
    			9102
    		],
    		[
    			37,
    			-140
    		],
    		[
    			-40,
    			13
    		],
    		[
    			-27,
    			80
    		],
    		[
    			30,
    			47
    		]
    	],
    	[
    		[
    			30203,
    			9147
    		],
    		[
    			39,
    			-6
    		],
    		[
    			34,
    			-62
    		],
    		[
    			-30,
    			-21
    		],
    		[
    			-43,
    			89
    		]
    	],
    	[
    		[
    			30737,
    			8821
    		],
    		[
    			0,
    			-622
    		],
    		[
    			-14,
    			-54
    		],
    		[
    			15,
    			-41
    		],
    		[
    			0,
    			-375
    		]
    	],
    	[
    		[
    			30738,
    			7729
    		],
    		[
    			-103,
    			167
    		],
    		[
    			-23,
    			11
    		],
    		[
    			-72,
    			-31
    		],
    		[
    			3,
    			122
    		],
    		[
    			-21,
    			68
    		],
    		[
    			3,
    			75
    		],
    		[
    			-37,
    			56
    		],
    		[
    			-33,
    			149
    		],
    		[
    			-71,
    			71
    		],
    		[
    			-47,
    			20
    		],
    		[
    			-84,
    			68
    		],
    		[
    			-71,
    			8
    		],
    		[
    			-66,
    			71
    		],
    		[
    			-53,
    			30
    		],
    		[
    			-36,
    			47
    		],
    		[
    			-32,
    			-85
    		],
    		[
    			-34,
    			-3
    		],
    		[
    			-8,
    			132
    		],
    		[
    			-38,
    			50
    		],
    		[
    			-33,
    			5
    		],
    		[
    			5,
    			48
    		],
    		[
    			56,
    			-21
    		],
    		[
    			50,
    			67
    		],
    		[
    			36,
    			-23
    		],
    		[
    			4,
    			53
    		],
    		[
    			-129,
    			-10
    		],
    		[
    			-25,
    			34
    		],
    		[
    			-16,
    			75
    		],
    		[
    			-47,
    			30
    		],
    		[
    			-21,
    			39
    		],
    		[
    			7,
    			67
    		],
    		[
    			62,
    			25
    		],
    		[
    			50,
    			56
    		],
    		[
    			73,
    			-32
    		],
    		[
    			24,
    			-34
    		],
    		[
    			53,
    			4
    		],
    		[
    			28,
    			-102
    		],
    		[
    			-15,
    			-65
    		],
    		[
    			6,
    			-98
    		],
    		[
    			28,
    			-47
    		],
    		[
    			39,
    			-112
    		],
    		[
    			46,
    			-22
    		],
    		[
    			54,
    			65
    		],
    		[
    			30,
    			62
    		],
    		[
    			17,
    			68
    		],
    		[
    			26,
    			-7
    		],
    		[
    			54,
    			31
    		],
    		[
    			-7,
    			48
    		],
    		[
    			60,
    			52
    		],
    		[
    			85,
    			-56
    		],
    		[
    			104,
    			-93
    		],
    		[
    			81,
    			-13
    		],
    		[
    			37,
    			-28
    		]
    	],
    	[
    		[
    			29448,
    			9204
    		],
    		[
    			25,
    			-63
    		],
    		[
    			-32,
    			-23
    		],
    		[
    			-17,
    			52
    		],
    		[
    			24,
    			34
    		]
    	],
    	[
    		[
    			29758,
    			9256
    		],
    		[
    			49,
    			-26
    		],
    		[
    			-5,
    			-38
    		],
    		[
    			-50,
    			-9
    		],
    		[
    			-30,
    			55
    		],
    		[
    			36,
    			18
    		]
    	],
    	[
    		[
    			27249,
    			9463
    		],
    		[
    			4,
    			-67
    		],
    		[
    			-38,
    			39
    		],
    		[
    			34,
    			28
    		]
    	],
    	[
    		[
    			26560,
    			9508
    		],
    		[
    			50,
    			-79
    		],
    		[
    			-1,
    			-66
    		],
    		[
    			-47,
    			53
    		],
    		[
    			-25,
    			70
    		],
    		[
    			23,
    			22
    		]
    	],
    	[
    		[
    			29205,
    			9551
    		],
    		[
    			23,
    			-40
    		],
    		[
    			-33,
    			-90
    		],
    		[
    			-25,
    			-31
    		],
    		[
    			-14,
    			-54
    		],
    		[
    			-77,
    			-30
    		],
    		[
    			-40,
    			4
    		],
    		[
    			-19,
    			33
    		],
    		[
    			-92,
    			-3
    		],
    		[
    			-30,
    			-13
    		],
    		[
    			-26,
    			21
    		],
    		[
    			-38,
    			-21
    		],
    		[
    			-41,
    			19
    		],
    		[
    			-32,
    			-11
    		],
    		[
    			-35,
    			-107
    		],
    		[
    			11,
    			-95
    		],
    		[
    			44,
    			-59
    		],
    		[
    			9,
    			-53
    		],
    		[
    			36,
    			-4
    		],
    		[
    			40,
    			91
    		],
    		[
    			47,
    			-14
    		],
    		[
    			23,
    			34
    		],
    		[
    			57,
    			0
    		],
    		[
    			45,
    			33
    		],
    		[
    			17,
    			-25
    		],
    		[
    			-9,
    			-52
    		],
    		[
    			-52,
    			16
    		],
    		[
    			-42,
    			-97
    		],
    		[
    			-53,
    			-35
    		],
    		[
    			-8,
    			-79
    		],
    		[
    			43,
    			-111
    		],
    		[
    			14,
    			-61
    		],
    		[
    			-11,
    			-65
    		],
    		[
    			22,
    			-22
    		],
    		[
    			44,
    			-108
    		],
    		[
    			-65,
    			-13
    		],
    		[
    			-19,
    			-70
    		],
    		[
    			-53,
    			36
    		],
    		[
    			13,
    			103
    		],
    		[
    			-25,
    			13
    		],
    		[
    			-44,
    			75
    		],
    		[
    			17,
    			62
    		],
    		[
    			3,
    			74
    		],
    		[
    			-27,
    			16
    		],
    		[
    			-59,
    			-58
    		],
    		[
    			17,
    			-39
    		],
    		[
    			3,
    			-252
    		],
    		[
    			-13,
    			-72
    		],
    		[
    			17,
    			-57
    		],
    		[
    			-64,
    			-38
    		],
    		[
    			-40,
    			49
    		],
    		[
    			16,
    			88
    		],
    		[
    			11,
    			152
    		],
    		[
    			-31,
    			92
    		],
    		[
    			-38,
    			-18
    		],
    		[
    			-13,
    			142
    		],
    		[
    			35,
    			37
    		],
    		[
    			18,
    			214
    		],
    		[
    			41,
    			85
    		],
    		[
    			15,
    			196
    		],
    		[
    			15,
    			42
    		],
    		[
    			51,
    			14
    		],
    		[
    			23,
    			83
    		],
    		[
    			30,
    			-3
    		],
    		[
    			48,
    			-42
    		],
    		[
    			25,
    			9
    		],
    		[
    			70,
    			-27
    		],
    		[
    			57,
    			1
    		],
    		[
    			60,
    			-20
    		],
    		[
    			40,
    			31
    		],
    		[
    			23,
    			58
    		],
    		[
    			28,
    			19
    		],
    		[
    			17,
    			47
    		]
    	],
    	[
    		[
    			26972,
    			9610
    		],
    		[
    			5,
    			-57
    		],
    		[
    			-27,
    			-7
    		],
    		[
    			-5,
    			48
    		],
    		[
    			27,
    			16
    		]
    	],
    	[
    		[
    			29490,
    			9623
    		],
    		[
    			-13,
    			-44
    		],
    		[
    			31,
    			-93
    		],
    		[
    			48,
    			39
    		],
    		[
    			3,
    			-88
    		],
    		[
    			-49,
    			-48
    		],
    		[
    			44,
    			-39
    		],
    		[
    			2,
    			-33
    		],
    		[
    			-68,
    			21
    		],
    		[
    			-37,
    			-10
    		],
    		[
    			-18,
    			107
    		],
    		[
    			16,
    			110
    		],
    		[
    			41,
    			78
    		]
    	],
    	[
    		[
    			28489,
    			9185
    		],
    		[
    			-11,
    			-77
    		],
    		[
    			-84,
    			-97
    		],
    		[
    			-7,
    			-94
    		],
    		[
    			13,
    			-28
    		],
    		[
    			-7,
    			-59
    		],
    		[
    			-40,
    			-114
    		],
    		[
    			-13,
    			-63
    		],
    		[
    			-123,
    			-95
    		],
    		[
    			-20,
    			115
    		],
    		[
    			-42,
    			23
    		],
    		[
    			-43,
    			-15
    		],
    		[
    			-56,
    			48
    		],
    		[
    			-45,
    			-47
    		],
    		[
    			-36,
    			16
    		],
    		[
    			-25,
    			-38
    		],
    		[
    			-7,
    			85
    		],
    		[
    			-49,
    			23
    		],
    		[
    			-37,
    			-29
    		],
    		[
    			-32,
    			38
    		],
    		[
    			-29,
    			-23
    		],
    		[
    			-16,
    			155
    		],
    		[
    			-19,
    			36
    		],
    		[
    			15,
    			78
    		],
    		[
    			-30,
    			67
    		],
    		[
    			-46,
    			21
    		],
    		[
    			-22,
    			107
    		],
    		[
    			14,
    			48
    		],
    		[
    			-28,
    			45
    		],
    		[
    			-7,
    			83
    		],
    		[
    			21,
    			120
    		],
    		[
    			25,
    			66
    		],
    		[
    			31,
    			25
    		]
    	],
    	[
    		[
    			27734,
    			9605
    		],
    		[
    			1,
    			-74
    		],
    		[
    			60,
    			-108
    		],
    		[
    			28,
    			-22
    		],
    		[
    			65,
    			37
    		],
    		[
    			55,
    			-15
    		],
    		[
    			31,
    			25
    		],
    		[
    			6,
    			52
    		],
    		[
    			26,
    			22
    		],
    		[
    			55,
    			-4
    		],
    		[
    			3,
    			-22
    		],
    		[
    			52,
    			-35
    		],
    		[
    			33,
    			39
    		],
    		[
    			55,
    			-3
    		],
    		[
    			24,
    			70
    		],
    		[
    			-4,
    			58
    		],
    		[
    			37,
    			47
    		],
    		[
    			2,
    			75
    		],
    		[
    			34,
    			22
    		],
    		[
    			15,
    			184
    		],
    		[
    			18,
    			22
    		],
    		[
    			130,
    			14
    		],
    		[
    			35,
    			-32
    		]
    	],
    	[
    		[
    			28495,
    			9957
    		],
    		[
    			24,
    			-79
    		],
    		[
    			-27,
    			-10
    		],
    		[
    			-17,
    			-70
    		],
    		[
    			68,
    			-159
    		],
    		[
    			-19,
    			-73
    		],
    		[
    			84,
    			-108
    		],
    		[
    			2,
    			-67
    		],
    		[
    			-67,
    			16
    		],
    		[
    			-33,
    			-23
    		],
    		[
    			-22,
    			-81
    		],
    		[
    			-9,
    			-88
    		],
    		[
    			10,
    			-30
    		]
    	],
    	[
    		[
    			26670,
    			9916
    		],
    		[
    			118,
    			-128
    		],
    		[
    			61,
    			-142
    		],
    		[
    			38,
    			-44
    		],
    		[
    			24,
    			39
    		],
    		[
    			27,
    			-49
    		],
    		[
    			7,
    			-49
    		],
    		[
    			34,
    			-7
    		],
    		[
    			39,
    			-54
    		],
    		[
    			9,
    			-63
    		],
    		[
    			22,
    			-35
    		],
    		[
    			38,
    			-4
    		],
    		[
    			24,
    			-58
    		],
    		[
    			27,
    			23
    		],
    		[
    			33,
    			-49
    		],
    		[
    			-18,
    			-50
    		],
    		[
    			3,
    			-55
    		],
    		[
    			-22,
    			-55
    		],
    		[
    			36,
    			-46
    		],
    		[
    			59,
    			-5
    		],
    		[
    			17,
    			-139
    		],
    		[
    			25,
    			-24
    		],
    		[
    			24,
    			-63
    		],
    		[
    			54,
    			-9
    		],
    		[
    			16,
    			-73
    		],
    		[
    			25,
    			-21
    		],
    		[
    			-22,
    			-120
    		],
    		[
    			13,
    			-25
    		],
    		[
    			-13,
    			-71
    		],
    		[
    			8,
    			-30
    		],
    		[
    			-8,
    			-196
    		],
    		[
    			-39,
    			3
    		],
    		[
    			-27,
    			-27
    		],
    		[
    			-58,
    			43
    		],
    		[
    			-39,
    			11
    		],
    		[
    			-38,
    			82
    		],
    		[
    			-29,
    			16
    		],
    		[
    			-104,
    			142
    		],
    		[
    			-11,
    			59
    		],
    		[
    			-58,
    			72
    		],
    		[
    			-29,
    			85
    		],
    		[
    			-40,
    			67
    		],
    		[
    			-3,
    			66
    		],
    		[
    			-45,
    			126
    		],
    		[
    			-6,
    			54
    		],
    		[
    			-50,
    			93
    		],
    		[
    			-14,
    			58
    		],
    		[
    			-42,
    			28
    		],
    		[
    			-51,
    			256
    		],
    		[
    			-21,
    			41
    		],
    		[
    			-76,
    			69
    		],
    		[
    			-6,
    			78
    		],
    		[
    			-17,
    			11
    		],
    		[
    			-56,
    			131
    		],
    		[
    			-31,
    			5
    		],
    		[
    			-94,
    			152
    		],
    		[
    			-28,
    			96
    		],
    		[
    			-4,
    			57
    		],
    		[
    			21,
    			16
    		],
    		[
    			43,
    			-25
    		],
    		[
    			49,
    			-49
    		],
    		[
    			56,
    			9
    		],
    		[
    			25,
    			-19
    		],
    		[
    			25,
    			17
    		],
    		[
    			39,
    			-62
    		],
    		[
    			6,
    			-36
    		],
    		[
    			31,
    			-41
    		],
    		[
    			-4,
    			-39
    		],
    		[
    			27,
    			-43
    		]
    	],
    	[
    		[
    			16818,
    			18348
    		],
    		[
    			-11,
    			-28
    		],
    		[
    			-24,
    			11
    		],
    		[
    			17,
    			25
    		],
    		[
    			18,
    			-8
    		]
    	],
    	[
    		[
    			24749,
    			14653
    		],
    		[
    			29,
    			-50
    		]
    	],
    	[
    		[
    			24891,
    			14425
    		],
    		[
    			26,
    			-49
    		]
    	],
    	[
    		[
    			24995,
    			14313
    		],
    		[
    			-64,
    			-80
    		],
    		[
    			-13,
    			-102
    		],
    		[
    			-17,
    			-34
    		],
    		[
    			47,
    			-38
    		],
    		[
    			130,
    			-140
    		],
    		[
    			16,
    			12
    		],
    		[
    			66,
    			-71
    		],
    		[
    			103,
    			-12
    		],
    		[
    			27,
    			15
    		],
    		[
    			48,
    			-30
    		],
    		[
    			3,
    			-49
    		],
    		[
    			65,
    			-51
    		],
    		[
    			97,
    			-20
    		],
    		[
    			38,
    			-33
    		],
    		[
    			59,
    			-11
    		],
    		[
    			52,
    			19
    		],
    		[
    			28,
    			46
    		],
    		[
    			-17,
    			67
    		],
    		[
    			12,
    			123
    		]
    	],
    	[
    		[
    			26529,
    			13901
    		],
    		[
    			-26,
    			-66
    		],
    		[
    			-72,
    			-27
    		],
    		[
    			-92,
    			-122
    		],
    		[
    			-3,
    			-116
    		],
    		[
    			-35,
    			-52
    		],
    		[
    			6,
    			-73
    		],
    		[
    			-40,
    			-119
    		],
    		[
    			-15,
    			-76
    		],
    		[
    			-39,
    			24
    		],
    		[
    			-35,
    			-12
    		],
    		[
    			4,
    			-40
    		],
    		[
    			-11,
    			-112
    		],
    		[
    			-18,
    			4
    		],
    		[
    			6,
    			-132
    		],
    		[
    			-25,
    			-42
    		],
    		[
    			-31,
    			-5
    		]
    	],
    	[
    		[
    			25765,
    			12929
    		],
    		[
    			-1,
    			-2
    		],
    		[
    			-4,
    			-3
    		],
    		[
    			-29,
    			16
    		],
    		[
    			-44,
    			-36
    		],
    		[
    			-30,
    			6
    		],
    		[
    			-28,
    			-29
    		],
    		[
    			-51,
    			-23
    		],
    		[
    			-29,
    			-57
    		],
    		[
    			21,
    			-81
    		],
    		[
    			-29,
    			-40
    		],
    		[
    			-32,
    			-80
    		],
    		[
    			-69,
    			-38
    		],
    		[
    			-78,
    			-89
    		],
    		[
    			-74,
    			-156
    		],
    		[
    			-50,
    			-45
    		],
    		[
    			-39,
    			-74
    		],
    		[
    			-64,
    			-60
    		],
    		[
    			-23,
    			-49
    		],
    		[
    			4,
    			-56
    		],
    		[
    			-54,
    			-45
    		],
    		[
    			-39,
    			0
    		],
    		[
    			-17,
    			-57
    		],
    		[
    			-52,
    			-17
    		],
    		[
    			-30,
    			-28
    		],
    		[
    			-24,
    			-103
    		],
    		[
    			14,
    			-87
    		],
    		[
    			-6,
    			-61
    		],
    		[
    			21,
    			-151
    		],
    		[
    			-19,
    			-144
    		],
    		[
    			-26,
    			-66
    		],
    		[
    			-11,
    			-85
    		],
    		[
    			9,
    			-61
    		],
    		[
    			2,
    			-149
    		],
    		[
    			-47,
    			5
    		],
    		[
    			-43,
    			-120
    		],
    		[
    			13,
    			-51
    		],
    		[
    			-64,
    			-33
    		],
    		[
    			-18,
    			-23
    		],
    		[
    			-15,
    			-99
    		],
    		[
    			-45,
    			-38
    		],
    		[
    			-27,
    			-3
    		],
    		[
    			-32,
    			44
    		],
    		[
    			-41,
    			86
    		],
    		[
    			-27,
    			160
    		],
    		[
    			-40,
    			203
    		],
    		[
    			-30,
    			106
    		],
    		[
    			-35,
    			61
    		],
    		[
    			-35,
    			138
    		],
    		[
    			-13,
    			125
    		],
    		[
    			-30,
    			146
    		],
    		[
    			-21,
    			45
    		],
    		[
    			-60,
    			194
    		],
    		[
    			-19,
    			101
    		],
    		[
    			-4,
    			101
    		],
    		[
    			-34,
    			205
    		],
    		[
    			-21,
    			231
    		],
    		[
    			5,
    			89
    		],
    		[
    			16,
    			78
    		],
    		[
    			-25,
    			82
    		],
    		[
    			9,
    			75
    		],
    		[
    			-23,
    			42
    		],
    		[
    			-38,
    			-123
    		],
    		[
    			-108,
    			-84
    		],
    		[
    			-42,
    			17
    		],
    		[
    			-31,
    			34
    		],
    		[
    			-121,
    			206
    		],
    		[
    			80,
    			27
    		],
    		[
    			37,
    			27
    		],
    		[
    			5,
    			69
    		],
    		[
    			-50,
    			-39
    		],
    		[
    			-51,
    			17
    		],
    		[
    			-61,
    			72
    		],
    		[
    			-33,
    			74
    		],
    		[
    			12,
    			35
    		]
    	],
    	[
    		[
    			23777,
    			13261
    		],
    		[
    			41,
    			7
    		],
    		[
    			2,
    			54
    		],
    		[
    			79,
    			0
    		],
    		[
    			13,
    			-18
    		],
    		[
    			81,
    			41
    		],
    		[
    			22,
    			-33
    		],
    		[
    			27,
    			78
    		],
    		[
    			-40,
    			118
    		],
    		[
    			-50,
    			79
    		],
    		[
    			2,
    			114
    		],
    		[
    			-62,
    			31
    		],
    		[
    			7,
    			74
    		],
    		[
    			41,
    			63
    		],
    		[
    			33,
    			76
    		],
    		[
    			39,
    			-49
    		],
    		[
    			87,
    			28
    		],
    		[
    			48,
    			80
    		],
    		[
    			22,
    			71
    		],
    		[
    			51,
    			42
    		],
    		[
    			32,
    			87
    		],
    		[
    			11,
    			64
    		],
    		[
    			55,
    			43
    		],
    		[
    			-9,
    			32
    		],
    		[
    			57,
    			97
    		],
    		[
    			17,
    			84
    		],
    		[
    			-7,
    			60
    		],
    		[
    			64,
    			44
    		],
    		[
    			9,
    			40
    		]
    	],
    	[
    		[
    			24173,
    			8015
    		],
    		[
    			-3,
    			-2
    		],
    		[
    			1,
    			12
    		],
    		[
    			-2,
    			8
    		],
    		[
    			-3,
    			2
    		],
    		[
    			0,
    			3
    		],
    		[
    			5,
    			-6
    		],
    		[
    			0,
    			-7
    		],
    		[
    			0,
    			-11
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			16520,
    			18471
    		],
    		[
    			21,
    			3
    		]
    	],
    	[
    		[
    			16635,
    			18311
    		],
    		[
    			26,
    			-189
    		],
    		[
    			-19,
    			-67
    		],
    		[
    			-38,
    			-65
    		],
    		[
    			-96,
    			-14
    		],
    		[
    			-45,
    			-47
    		],
    		[
    			-122,
    			-56
    		],
    		[
    			-70,
    			30
    		],
    		[
    			-36,
    			90
    		],
    		[
    			51,
    			6
    		],
    		[
    			62,
    			155
    		],
    		[
    			-85,
    			45
    		],
    		[
    			55,
    			61
    		],
    		[
    			-37,
    			48
    		],
    		[
    			15,
    			45
    		],
    		[
    			116,
    			-14
    		],
    		[
    			45,
    			62
    		],
    		[
    			-27,
    			37
    		],
    		[
    			11,
    			51
    		],
    		[
    			79,
    			-18
    		]
    	],
    	[
    		[
    			22147,
    			15737
    		],
    		[
    			65,
    			-132
    		],
    		[
    			65,
    			-25
    		],
    		[
    			84,
    			-76
    		],
    		[
    			69,
    			-1
    		],
    		[
    			52,
    			37
    		],
    		[
    			7,
    			39
    		],
    		[
    			57,
    			53
    		],
    		[
    			84,
    			-1
    		],
    		[
    			41,
    			31
    		],
    		[
    			58,
    			-47
    		],
    		[
    			70,
    			-31
    		],
    		[
    			15,
    			-22
    		],
    		[
    			54,
    			5
    		],
    		[
    			54,
    			-37
    		],
    		[
    			16,
    			-51
    		],
    		[
    			47,
    			-25
    		],
    		[
    			29,
    			-66
    		],
    		[
    			72,
    			2
    		],
    		[
    			17,
    			-173
    		]
    	],
    	[
    		[
    			23064,
    			14255
    		],
    		[
    			89,
    			-204
    		],
    		[
    			61,
    			-39
    		],
    		[
    			32,
    			-63
    		],
    		[
    			8,
    			-95
    		],
    		[
    			32,
    			-37
    		],
    		[
    			-2,
    			-100
    		],
    		[
    			-82,
    			-20
    		],
    		[
    			-42,
    			-47
    		],
    		[
    			-18,
    			-75
    		],
    		[
    			-7,
    			-101
    		]
    	],
    	[
    		[
    			23135,
    			13474
    		],
    		[
    			-46,
    			-2
    		],
    		[
    			-158,
    			48
    		],
    		[
    			-55,
    			8
    		],
    		[
    			-154,
    			48
    		],
    		[
    			-22,
    			102
    		],
    		[
    			-1,
    			48
    		],
    		[
    			-27,
    			74
    		],
    		[
    			-39,
    			9
    		],
    		[
    			-76,
    			-44
    		],
    		[
    			-70,
    			-69
    		],
    		[
    			-51,
    			32
    		],
    		[
    			-60,
    			5
    		],
    		[
    			-22,
    			40
    		],
    		[
    			-59,
    			37
    		],
    		[
    			-39,
    			74
    		],
    		[
    			-37,
    			33
    		],
    		[
    			-43,
    			2
    		],
    		[
    			-29,
    			38
    		],
    		[
    			-35,
    			165
    		],
    		[
    			-26,
    			16
    		],
    		[
    			-4,
    			57
    		],
    		[
    			-65,
    			118
    		],
    		[
    			-32,
    			-33
    		],
    		[
    			-70,
    			57
    		],
    		[
    			4,
    			-55
    		],
    		[
    			-41,
    			-7
    		]
    	],
    	[
    		[
    			21878,
    			14275
    		],
    		[
    			-7,
    			38
    		],
    		[
    			-37,
    			46
    		],
    		[
    			1,
    			87
    		],
    		[
    			-34,
    			0
    		],
    		[
    			0,
    			66
    		],
    		[
    			18,
    			65
    		],
    		[
    			-39,
    			89
    		],
    		[
    			-110,
    			110
    		],
    		[
    			-34,
    			100
    		],
    		[
    			-43,
    			64
    		],
    		[
    			3,
    			108
    		],
    		[
    			63,
    			103
    		],
    		[
    			-42,
    			99
    		],
    		[
    			-39,
    			51
    		],
    		[
    			-11,
    			54
    		],
    		[
    			-43,
    			119
    		]
    	],
    	[
    		[
    			21524,
    			15474
    		],
    		[
    			-18,
    			104
    		],
    		[
    			-34,
    			21
    		],
    		[
    			15,
    			42
    		],
    		[
    			-7,
    			82
    		],
    		[
    			-25,
    			130
    		],
    		[
    			71,
    			37
    		]
    	],
    	[
    		[
    			21878,
    			14275
    		],
    		[
    			-50,
    			4
    		]
    	],
    	[
    		[
    			21828,
    			14279
    		],
    		[
    			-24,
    			17
    		],
    		[
    			-52,
    			-15
    		],
    		[
    			-29,
    			-97
    		],
    		[
    			-30,
    			-56
    		]
    	],
    	[
    		[
    			21693,
    			14128
    		],
    		[
    			-12,
    			-7
    		],
    		[
    			-163,
    			23
    		],
    		[
    			-126,
    			162
    		],
    		[
    			-127,
    			158
    		],
    		[
    			-62,
    			44
    		],
    		[
    			-98,
    			97
    		],
    		[
    			-116,
    			34
    		]
    	],
    	[
    		[
    			20989,
    			14639
    		],
    		[
    			-39,
    			204
    		]
    	],
    	[
    		[
    			20950,
    			14843
    		],
    		[
    			212,
    			175
    		],
    		[
    			22,
    			60
    		],
    		[
    			2,
    			214
    		],
    		[
    			15,
    			78
    		],
    		[
    			40,
    			12
    		],
    		[
    			50,
    			85
    		]
    	],
    	[
    		[
    			21291,
    			15467
    		],
    		[
    			41,
    			46
    		],
    		[
    			70,
    			-23
    		],
    		[
    			72,
    			1
    		],
    		[
    			50,
    			-17
    		]
    	],
    	[
    		[
    			15686,
    			20393
    		],
    		[
    			41,
    			-42
    		],
    		[
    			79,
    			-13
    		],
    		[
    			7,
    			-79
    		],
    		[
    			119,
    			-37
    		],
    		[
    			11,
    			-74
    		],
    		[
    			-117,
    			-111
    		],
    		[
    			-120,
    			-46
    		],
    		[
    			-51,
    			-40
    		],
    		[
    			-123,
    			-36
    		],
    		[
    			-88,
    			-47
    		],
    		[
    			-140,
    			23
    		],
    		[
    			-173,
    			88
    		],
    		[
    			-54,
    			124
    		],
    		[
    			-65,
    			25
    		],
    		[
    			102,
    			63
    		],
    		[
    			-42,
    			35
    		],
    		[
    			-124,
    			-22
    		],
    		[
    			-19,
    			67
    		],
    		[
    			91,
    			105
    		],
    		[
    			55,
    			5
    		],
    		[
    			119,
    			-77
    		],
    		[
    			4,
    			-87
    		],
    		[
    			152,
    			62
    		],
    		[
    			69,
    			56
    		],
    		[
    			94,
    			-5
    		],
    		[
    			55,
    			-29
    		],
    		[
    			95,
    			48
    		],
    		[
    			23,
    			44
    		]
    	],
    	[
    		[
    			20647,
    			14821
    		],
    		[
    			4,
    			-92
    		]
    	],
    	[
    		[
    			20651,
    			14729
    		],
    		[
    			-11,
    			-51
    		]
    	],
    	[
    		[
    			20586,
    			14607
    		],
    		[
    			5,
    			-20
    		]
    	],
    	[
    		[
    			20591,
    			14587
    		],
    		[
    			17,
    			-11
    		]
    	],
    	[
    		[
    			20608,
    			14576
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			20608,
    			14570
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			20607,
    			14572
    		],
    		[
    			-8,
    			-1
    		]
    	],
    	[
    		[
    			20599,
    			14571
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			20633,
    			14528
    		],
    		[
    			-3,
    			-64
    		],
    		[
    			-28,
    			-112
    		],
    		[
    			-17,
    			-150
    		]
    	],
    	[
    		[
    			20585,
    			14202
    		],
    		[
    			-7,
    			-8
    		]
    	],
    	[
    		[
    			20517,
    			14483
    		],
    		[
    			9,
    			25
    		]
    	],
    	[
    		[
    			20526,
    			14508
    		],
    		[
    			6,
    			9
    		]
    	],
    	[
    		[
    			20532,
    			14517
    		],
    		[
    			8,
    			12
    		]
    	],
    	[
    		[
    			20540,
    			14529
    		],
    		[
    			26,
    			104
    		],
    		[
    			32,
    			163
    		]
    	],
    	[
    		[
    			20598,
    			14796
    		],
    		[
    			49,
    			25
    		]
    	],
    	[
    		[
    			18731,
    			15664
    		],
    		[
    			-39,
    			-90
    		],
    		[
    			-10,
    			-72
    		],
    		[
    			19,
    			-34
    		],
    		[
    			-21,
    			-76
    		],
    		[
    			-56,
    			23
    		],
    		[
    			-20,
    			43
    		],
    		[
    			-40,
    			9
    		],
    		[
    			-139,
    			118
    		],
    		[
    			86,
    			71
    		],
    		[
    			41,
    			-43
    		],
    		[
    			72,
    			12
    		],
    		[
    			40,
    			25
    		],
    		[
    			67,
    			14
    		]
    	],
    	[
    		[
    			18120,
    			16163
    		],
    		[
    			27,
    			-16
    		],
    		[
    			30,
    			-108
    		],
    		[
    			-26,
    			-228
    		],
    		[
    			-45,
    			11
    		],
    		[
    			-42,
    			-54
    		],
    		[
    			-27,
    			56
    		],
    		[
    			11,
    			176
    		],
    		[
    			-34,
    			76
    		],
    		[
    			63,
    			31
    		],
    		[
    			43,
    			56
    		]
    	],
    	[
    		[
    			18549,
    			17044
    		],
    		[
    			-32,
    			-37
    		],
    		[
    			32,
    			-118
    		]
    	],
    	[
    		[
    			18549,
    			16889
    		],
    		[
    			-56,
    			29
    		],
    		[
    			-79,
    			-94
    		],
    		[
    			16,
    			-60
    		],
    		[
    			-22,
    			-26
    		],
    		[
    			14,
    			-78
    		],
    		[
    			29,
    			-40
    		],
    		[
    			89,
    			-73
    		],
    		[
    			36,
    			-145
    		],
    		[
    			70,
    			-99
    		],
    		[
    			58,
    			-38
    		],
    		[
    			63,
    			13
    		],
    		[
    			19,
    			-28
    		],
    		[
    			-23,
    			-53
    		],
    		[
    			109,
    			-67
    		],
    		[
    			89,
    			-70
    		],
    		[
    			39,
    			-59
    		],
    		[
    			-4,
    			-79
    		],
    		[
    			-37,
    			29
    		],
    		[
    			-10,
    			44
    		],
    		[
    			-37,
    			6
    		],
    		[
    			-41,
    			39
    		],
    		[
    			-46,
    			-74
    		],
    		[
    			-10,
    			-46
    		],
    		[
    			63,
    			-69
    		],
    		[
    			3,
    			-64
    		],
    		[
    			-53,
    			-31
    		],
    		[
    			-4,
    			-64
    		],
    		[
    			-78,
    			-88
    		],
    		[
    			-13,
    			52
    		],
    		[
    			56,
    			113
    		],
    		[
    			-57,
    			195
    		],
    		[
    			-28,
    			-12
    		],
    		[
    			-39,
    			39
    		],
    		[
    			6,
    			30
    		],
    		[
    			-91,
    			75
    		],
    		[
    			-20,
    			50
    		],
    		[
    			-115,
    			48
    		],
    		[
    			-94,
    			141
    		],
    		[
    			-44,
    			36
    		],
    		[
    			-56,
    			77
    		],
    		[
    			-34,
    			149
    		],
    		[
    			-97,
    			83
    		],
    		[
    			-45,
    			14
    		],
    		[
    			-56,
    			-79
    		],
    		[
    			-63,
    			-28
    		]
    	],
    	[
    		[
    			18424,
    			16606
    		],
    		[
    			7,
    			0
    		],
    		[
    			-1,
    			14
    		],
    		[
    			-7,
    			-7
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			18428,
    			16270
    		],
    		[
    			0,
    			0
    		],
    		[
    			0,
    			1
    		],
    		[
    			0,
    			0
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			9784,
    			12358
    		],
    		[
    			89,
    			-24
    		],
    		[
    			52,
    			-39
    		],
    		[
    			1,
    			-49
    		],
    		[
    			-135,
    			0
    		],
    		[
    			-44,
    			101
    		],
    		[
    			37,
    			11
    		]
    	],
    	[
    		[
    			20989,
    			14639
    		],
    		[
    			-19,
    			-26
    		],
    		[
    			-192,
    			-83
    		],
    		[
    			96,
    			-168
    		],
    		[
    			-32,
    			-28
    		],
    		[
    			-16,
    			-55
    		],
    		[
    			-72,
    			-23
    		],
    		[
    			-24,
    			-61
    		],
    		[
    			-41,
    			-53
    		],
    		[
    			-106,
    			29
    		]
    	],
    	[
    		[
    			20583,
    			14171
    		],
    		[
    			2,
    			31
    		]
    	],
    	[
    		[
    			20651,
    			14729
    		],
    		[
    			25,
    			6
    		],
    		[
    			46,
    			-58
    		],
    		[
    			41,
    			-11
    		],
    		[
    			187,
    			177
    		]
    	],
    	[
    		[
    			29763,
    			14935
    		],
    		[
    			24,
    			-49
    		],
    		[
    			63,
    			-8
    		],
    		[
    			-5,
    			-53
    		],
    		[
    			30,
    			-76
    		],
    		[
    			-28,
    			-36
    		],
    		[
    			-36,
    			-203
    		],
    		[
    			-61,
    			-62
    		],
    		[
    			-46,
    			41
    		],
    		[
    			11,
    			63
    		],
    		[
    			-15,
    			25
    		],
    		[
    			42,
    			168
    		],
    		[
    			-68,
    			-23
    		],
    		[
    			-33,
    			95
    		],
    		[
    			29,
    			54
    		],
    		[
    			51,
    			8
    		],
    		[
    			10,
    			43
    		],
    		[
    			32,
    			13
    		]
    	],
    	[
    		[
    			30082,
    			15008
    		],
    		[
    			52,
    			-73
    		],
    		[
    			-31,
    			-49
    		],
    		[
    			-43,
    			-25
    		],
    		[
    			-33,
    			5
    		],
    		[
    			-79,
    			-128
    		],
    		[
    			-32,
    			68
    		],
    		[
    			-5,
    			53
    		],
    		[
    			38,
    			89
    		],
    		[
    			70,
    			-6
    		],
    		[
    			44,
    			69
    		],
    		[
    			19,
    			-3
    		]
    	],
    	[
    		[
    			30738,
    			16201
    		],
    		[
    			37,
    			-18
    		],
    		[
    			5,
    			-124
    		],
    		[
    			31,
    			-50
    		],
    		[
    			27,
    			-146
    		],
    		[
    			-13,
    			-60
    		],
    		[
    			-39,
    			-54
    		],
    		[
    			-1,
    			-56
    		],
    		[
    			-53,
    			-48
    		],
    		[
    			9,
    			-116
    		],
    		[
    			-7,
    			-83
    		],
    		[
    			-15,
    			-12
    		],
    		[
    			-24,
    			-106
    		],
    		[
    			30,
    			-91
    		],
    		[
    			-38,
    			-29
    		],
    		[
    			-8,
    			-61
    		],
    		[
    			-54,
    			-25
    		],
    		[
    			-19,
    			62
    		],
    		[
    			-122,
    			-83
    		],
    		[
    			-16,
    			-52
    		],
    		[
    			-67,
    			12
    		],
    		[
    			-17,
    			21
    		],
    		[
    			-43,
    			-52
    		],
    		[
    			-8,
    			-33
    		],
    		[
    			-46,
    			-20
    		],
    		[
    			-38,
    			-105
    		],
    		[
    			-14,
    			-11
    		],
    		[
    			-66,
    			67
    		],
    		[
    			3,
    			73
    		],
    		[
    			27,
    			26
    		],
    		[
    			-60,
    			50
    		],
    		[
    			-44,
    			-6
    		],
    		[
    			-35,
    			-48
    		],
    		[
    			-25,
    			12
    		],
    		[
    			-105,
    			-55
    		],
    		[
    			-33,
    			8
    		],
    		[
    			-19,
    			-57
    		],
    		[
    			-31,
    			26
    		],
    		[
    			-45,
    			-24
    		],
    		[
    			-36,
    			32
    		],
    		[
    			20,
    			53
    		],
    		[
    			33,
    			1
    		],
    		[
    			115,
    			143
    		],
    		[
    			21,
    			38
    		],
    		[
    			56,
    			-9
    		],
    		[
    			143,
    			32
    		],
    		[
    			31,
    			21
    		],
    		[
    			28,
    			-47
    		],
    		[
    			27,
    			7
    		],
    		[
    			14,
    			76
    		],
    		[
    			76,
    			143
    		],
    		[
    			34,
    			-9
    		],
    		[
    			111,
    			68
    		],
    		[
    			26,
    			29
    		],
    		[
    			27,
    			71
    		],
    		[
    			43,
    			38
    		],
    		[
    			47,
    			129
    		],
    		[
    			29,
    			159
    		],
    		[
    			-16,
    			44
    		],
    		[
    			10,
    			124
    		],
    		[
    			23,
    			7
    		],
    		[
    			32,
    			74
    		],
    		[
    			42,
    			44
    		]
    	],
    	[
    		[
    			30827,
    			16877
    		],
    		[
    			102,
    			-164
    		],
    		[
    			51,
    			-49
    		],
    		[
    			119,
    			-54
    		],
    		[
    			27,
    			-30
    		],
    		[
    			23,
    			-78
    		],
    		[
    			-22,
    			-42
    		],
    		[
    			-84,
    			-8
    		],
    		[
    			-60,
    			-62
    		],
    		[
    			-24,
    			-54
    		],
    		[
    			-34,
    			-30
    		],
    		[
    			-103,
    			78
    		],
    		[
    			-30,
    			7
    		],
    		[
    			-51,
    			-47
    		],
    		[
    			-55,
    			40
    		],
    		[
    			-18,
    			-53
    		],
    		[
    			41,
    			-21
    		],
    		[
    			-26,
    			-101
    		],
    		[
    			-43,
    			3
    		],
    		[
    			15,
    			60
    		],
    		[
    			-35,
    			58
    		],
    		[
    			4,
    			58
    		],
    		[
    			68,
    			68
    		],
    		[
    			60,
    			22
    		],
    		[
    			25,
    			31
    		],
    		[
    			-9,
    			67
    		],
    		[
    			32,
    			48
    		],
    		[
    			12,
    			108
    		],
    		[
    			-20,
    			86
    		],
    		[
    			35,
    			59
    		]
    	],
    	[
    		[
    			1002,
    			12057
    		],
    		[
    			0,
    			1
    		],
    		[
    			1,
    			0
    		],
    		[
    			0,
    			-1
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			24919,
    			16324
    		],
    		[
    			-28,
    			35
    		],
    		[
    			-42,
    			4
    		],
    		[
    			-33,
    			49
    		],
    		[
    			-65,
    			26
    		],
    		[
    			-41,
    			-11
    		],
    		[
    			-116,
    			25
    		],
    		[
    			-162,
    			-23
    		],
    		[
    			-81,
    			61
    		],
    		[
    			-71,
    			-30
    		],
    		[
    			-12,
    			-89
    		],
    		[
    			-151,
    			55
    		],
    		[
    			-55,
    			-8
    		],
    		[
    			-34,
    			-88
    		]
    	],
    	[
    		[
    			24028,
    			16330
    		],
    		[
    			-48,
    			-21
    		],
    		[
    			-27,
    			-48
    		],
    		[
    			-107,
    			-84
    		],
    		[
    			-42,
    			-71
    		],
    		[
    			-11,
    			-55
    		],
    		[
    			-39,
    			35
    		],
    		[
    			-13,
    			66
    		],
    		[
    			-128,
    			10
    		],
    		[
    			-7,
    			108
    		],
    		[
    			-50,
    			8
    		],
    		[
    			9,
    			170
    		],
    		[
    			-26,
    			-16
    		],
    		[
    			-17,
    			73
    		],
    		[
    			-62,
    			78
    		],
    		[
    			-45,
    			-28
    		],
    		[
    			-110,
    			12
    		],
    		[
    			-130,
    			-31
    		],
    		[
    			-86,
    			129
    		],
    		[
    			-243,
    			223
    		],
    		[
    			-249,
    			-99
    		],
    		[
    			1,
    			-616
    		]
    	],
    	[
    		[
    			22598,
    			16173
    		],
    		[
    			-46,
    			-11
    		],
    		[
    			-23,
    			27
    		],
    		[
    			-43,
    			102
    		],
    		[
    			-62,
    			53
    		],
    		[
    			-73,
    			-14
    		],
    		[
    			-45,
    			-26
    		],
    		[
    			-75,
    			-84
    		],
    		[
    			-88,
    			-62
    		]
    	],
    	[
    		[
    			22000,
    			16406
    		],
    		[
    			-69,
    			185
    		],
    		[
    			-7,
    			79
    		],
    		[
    			-27,
    			78
    		],
    		[
    			73,
    			130
    		],
    		[
    			57,
    			55
    		],
    		[
    			-79,
    			79
    		],
    		[
    			-70,
    			54
    		],
    		[
    			50,
    			19
    		],
    		[
    			-38,
    			108
    		],
    		[
    			-53,
    			58
    		],
    		[
    			-84,
    			0
    		],
    		[
    			-8,
    			75
    		],
    		[
    			-58,
    			39
    		],
    		[
    			28,
    			83
    		],
    		[
    			11,
    			151
    		],
    		[
    			31,
    			21
    		],
    		[
    			9,
    			62
    		],
    		[
    			48,
    			-1
    		],
    		[
    			38,
    			-70
    		],
    		[
    			50,
    			3
    		],
    		[
    			-9,
    			103
    		],
    		[
    			74,
    			53
    		],
    		[
    			31,
    			42
    		],
    		[
    			60,
    			38
    		],
    		[
    			14,
    			44
    		],
    		[
    			73,
    			15
    		],
    		[
    			106,
    			-6
    		],
    		[
    			16,
    			-32
    		],
    		[
    			98,
    			-5
    		],
    		[
    			87,
    			-108
    		],
    		[
    			56,
    			7
    		],
    		[
    			57,
    			-43
    		],
    		[
    			77,
    			82
    		],
    		[
    			124,
    			11
    		],
    		[
    			75,
    			-9
    		],
    		[
    			33,
    			-61
    		],
    		[
    			91,
    			-21
    		],
    		[
    			95,
    			13
    		],
    		[
    			59,
    			24
    		],
    		[
    			6,
    			102
    		],
    		[
    			-48,
    			8
    		],
    		[
    			-79,
    			74
    		],
    		[
    			85,
    			72
    		],
    		[
    			-23,
    			71
    		],
    		[
    			39,
    			45
    		],
    		[
    			-31,
    			98
    		],
    		[
    			53,
    			78
    		],
    		[
    			95,
    			-26
    		],
    		[
    			38,
    			31
    		],
    		[
    			203,
    			52
    		],
    		[
    			51,
    			38
    		],
    		[
    			49,
    			-5
    		],
    		[
    			147,
    			37
    		],
    		[
    			60,
    			57
    		],
    		[
    			42,
    			1
    		],
    		[
    			32,
    			41
    		],
    		[
    			68,
    			-15
    		],
    		[
    			53,
    			-35
    		],
    		[
    			58,
    			28
    		],
    		[
    			39,
    			-152
    		],
    		[
    			51,
    			-24
    		],
    		[
    			117,
    			-25
    		],
    		[
    			29,
    			-24
    		],
    		[
    			-4,
    			-64
    		],
    		[
    			63,
    			13
    		],
    		[
    			48,
    			-32
    		],
    		[
    			115,
    			108
    		],
    		[
    			125,
    			59
    		],
    		[
    			-31,
    			-82
    		],
    		[
    			127,
    			-115
    		],
    		[
    			113,
    			-209
    		],
    		[
    			84,
    			-191
    		],
    		[
    			48,
    			14
    		],
    		[
    			20,
    			56
    		],
    		[
    			46,
    			-20
    		],
    		[
    			41,
    			-73
    		],
    		[
    			94,
    			1
    		],
    		[
    			52,
    			44
    		],
    		[
    			69,
    			-25
    		],
    		[
    			61,
    			-104
    		],
    		[
    			50,
    			-33
    		],
    		[
    			21,
    			-71
    		],
    		[
    			152,
    			-14
    		],
    		[
    			49,
    			-75
    		]
    	],
    	[
    		[
    			21249,
    			9924
    		],
    		[
    			-56,
    			-138
    		],
    		[
    			-32,
    			-56
    		],
    		[
    			0,
    			-187
    		],
    		[
    			0,
    			-425
    		],
    		[
    			55,
    			-139
    		]
    	],
    	[
    		[
    			21216,
    			8979
    		],
    		[
    			-27,
    			-52
    		],
    		[
    			-36,
    			-17
    		],
    		[
    			-9,
    			-54
    		],
    		[
    			-37,
    			-25
    		],
    		[
    			-24,
    			-38
    		],
    		[
    			-7,
    			-88
    		],
    		[
    			-12,
    			-14
    		],
    		[
    			-19,
    			-92
    		],
    		[
    			-36,
    			-119
    		],
    		[
    			-19,
    			-4
    		]
    	],
    	[
    		[
    			20990,
    			8476
    		],
    		[
    			-137,
    			166
    		],
    		[
    			-19,
    			39
    		],
    		[
    			8,
    			64
    		],
    		[
    			-115,
    			117
    		],
    		[
    			-228,
    			224
    		],
    		[
    			-14,
    			4
    		]
    	],
    	[
    		[
    			20485,
    			9090
    		],
    		[
    			4,
    			144
    		],
    		[
    			-6,
    			42
    		],
    		[
    			63,
    			165
    		],
    		[
    			21,
    			20
    		],
    		[
    			20,
    			78
    		],
    		[
    			-8,
    			118
    		],
    		[
    			-14,
    			71
    		],
    		[
    			-17,
    			18
    		],
    		[
    			-18,
    			77
    		],
    		[
    			5,
    			49
    		],
    		[
    			-33,
    			38
    		],
    		[
    			-11,
    			53
    		]
    	],
    	[
    		[
    			20491,
    			9963
    		],
    		[
    			8,
    			14
    		]
    	],
    	[
    		[
    			20499,
    			9977
    		],
    		[
    			9,
    			16
    		]
    	],
    	[
    		[
    			20508,
    			9993
    		],
    		[
    			8,
    			15
    		]
    	],
    	[
    		[
    			20516,
    			10008
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20517,
    			10009
    		],
    		[
    			3,
    			8
    		]
    	],
    	[
    		[
    			20520,
    			10017
    		],
    		[
    			7,
    			14
    		]
    	],
    	[
    		[
    			20635,
    			10031
    		],
    		[
    			43,
    			0
    		]
    	],
    	[
    		[
    			24288,
    			15863
    		],
    		[
    			-28,
    			-12
    		],
    		[
    			-154,
    			-12
    		],
    		[
    			-19,
    			44
    		],
    		[
    			-75,
    			-31
    		],
    		[
    			-101,
    			32
    		],
    		[
    			-42,
    			33
    		],
    		[
    			27,
    			53
    		],
    		[
    			46,
    			22
    		],
    		[
    			50,
    			-36
    		],
    		[
    			39,
    			35
    		]
    	],
    	[
    		[
    			24031,
    			15991
    		],
    		[
    			30,
    			16
    		],
    		[
    			41,
    			-29
    		],
    		[
    			45,
    			58
    		],
    		[
    			44,
    			3
    		],
    		[
    			19,
    			59
    		],
    		[
    			-106,
    			98
    		],
    		[
    			-28,
    			-56
    		],
    		[
    			-54,
    			18
    		],
    		[
    			-65,
    			62
    		],
    		[
    			102,
    			101
    		],
    		[
    			-31,
    			9
    		]
    	],
    	[
    		[
    			27236,
    			11002
    		],
    		[
    			-19,
    			25
    		],
    		[
    			-72,
    			8
    		],
    		[
    			21,
    			38
    		],
    		[
    			-59,
    			11
    		],
    		[
    			3,
    			67
    		],
    		[
    			-21,
    			56
    		]
    	],
    	[
    		[
    			27089,
    			11207
    		],
    		[
    			-18,
    			88
    		],
    		[
    			7,
    			39
    		],
    		[
    			-27,
    			48
    		],
    		[
    			-15,
    			101
    		],
    		[
    			71,
    			167
    		],
    		[
    			42,
    			19
    		],
    		[
    			47,
    			-13
    		],
    		[
    			75,
    			17
    		],
    		[
    			38,
    			-15
    		]
    	],
    	[
    		[
    			27309,
    			11658
    		],
    		[
    			68,
    			-69
    		],
    		[
    			26,
    			22
    		],
    		[
    			-13,
    			48
    		],
    		[
    			55,
    			17
    		],
    		[
    			21,
    			-26
    		],
    		[
    			68,
    			65
    		]
    	],
    	[
    		[
    			27534,
    			11715
    		],
    		[
    			-21,
    			-93
    		],
    		[
    			29,
    			-128
    		],
    		[
    			-13,
    			-56
    		],
    		[
    			4,
    			-113
    		],
    		[
    			-26,
    			-5
    		],
    		[
    			-28,
    			-39
    		],
    		[
    			-83,
    			-58
    		],
    		[
    			-22,
    			-35
    		],
    		[
    			-10,
    			-84
    		],
    		[
    			-42,
    			-29
    		],
    		[
    			-45,
    			-57
    		],
    		[
    			-41,
    			-16
    		]
    	],
    	[
    		[
    			2132,
    			9599
    		],
    		[
    			11,
    			-14
    		],
    		[
    			-2,
    			-19
    		],
    		[
    			15,
    			-11
    		],
    		[
    			-5,
    			-11
    		],
    		[
    			-19,
    			14
    		],
    		[
    			3,
    			22
    		],
    		[
    			-3,
    			19
    		]
    	],
    	[
    		[
    			11221,
    			12173
    		],
    		[
    			8,
    			-9
    		],
    		[
    			-5,
    			-12
    		],
    		[
    			-8,
    			13
    		],
    		[
    			5,
    			8
    		]
    	],
    	[
    		[
    			29374,
    			14875
    		],
    		[
    			6,
    			-44
    		],
    		[
    			-53,
    			-19
    		],
    		[
    			3,
    			46
    		],
    		[
    			44,
    			17
    		]
    	],
    	[
    		[
    			29526,
    			15720
    		],
    		[
    			24,
    			-79
    		],
    		[
    			71,
    			-152
    		],
    		[
    			12,
    			-78
    		],
    		[
    			-9,
    			-96
    		],
    		[
    			20,
    			-30
    		],
    		[
    			-14,
    			-90
    		],
    		[
    			-21,
    			-50
    		],
    		[
    			-116,
    			-29
    		],
    		[
    			-65,
    			-89
    		],
    		[
    			-82,
    			-15
    		],
    		[
    			5,
    			70
    		],
    		[
    			-20,
    			68
    		],
    		[
    			35,
    			106
    		],
    		[
    			-33,
    			163
    		],
    		[
    			42,
    			27
    		],
    		[
    			-11,
    			144
    		]
    	],
    	[
    		[
    			29364,
    			15590
    		],
    		[
    			56,
    			83
    		],
    		[
    			80,
    			-3
    		],
    		[
    			26,
    			50
    		]
    	],
    	[
    		[
    			21873,
    			14033
    		],
    		[
    			-69,
    			-2
    		],
    		[
    			-23,
    			80
    		],
    		[
    			-88,
    			17
    		]
    	],
    	[
    		[
    			21828,
    			14279
    		],
    		[
    			1,
    			-73
    		],
    		[
    			44,
    			-173
    		]
    	],
    	[
    		[
    			27016,
    			13007
    		],
    		[
    			82,
    			-139
    		],
    		[
    			-13,
    			-46
    		],
    		[
    			25,
    			-69
    		],
    		[
    			66,
    			-17
    		],
    		[
    			28,
    			32
    		],
    		[
    			36,
    			-36
    		],
    		[
    			18,
    			-86
    		],
    		[
    			31,
    			-25
    		],
    		[
    			-15,
    			-50
    		],
    		[
    			-32,
    			-30
    		],
    		[
    			-26,
    			15
    		],
    		[
    			-17,
    			-47
    		],
    		[
    			12,
    			-38
    		],
    		[
    			56,
    			-68
    		],
    		[
    			33,
    			-15
    		],
    		[
    			7,
    			-65
    		],
    		[
    			86,
    			-159
    		],
    		[
    			45,
    			-61
    		],
    		[
    			0,
    			-52
    		],
    		[
    			61,
    			-91
    		],
    		[
    			35,
    			-164
    		],
    		[
    			0,
    			-81
    		]
    	],
    	[
    		[
    			27309,
    			11658
    		],
    		[
    			23,
    			16
    		],
    		[
    			18,
    			89
    		],
    		[
    			-15,
    			33
    		],
    		[
    			15,
    			82
    		],
    		[
    			-20,
    			59
    		],
    		[
    			-36,
    			15
    		],
    		[
    			-29,
    			72
    		],
    		[
    			5,
    			145
    		],
    		[
    			-30,
    			42
    		],
    		[
    			-48,
    			114
    		],
    		[
    			-65,
    			18
    		],
    		[
    			-33,
    			-72
    		],
    		[
    			-33,
    			-10
    		],
    		[
    			-49,
    			45
    		],
    		[
    			-67,
    			-80
    		],
    		[
    			-24,
    			-44
    		],
    		[
    			-16,
    			50
    		],
    		[
    			19,
    			49
    		],
    		[
    			-12,
    			63
    		],
    		[
    			19,
    			40
    		],
    		[
    			-6,
    			121
    		],
    		[
    			-29,
    			39
    		],
    		[
    			-40,
    			-13
    		],
    		[
    			9,
    			91
    		],
    		[
    			-20,
    			46
    		],
    		[
    			-26,
    			-4
    		]
    	],
    	[
    		[
    			26819,
    			12664
    		],
    		[
    			10,
    			52
    		],
    		[
    			29,
    			25
    		],
    		[
    			22,
    			83
    		],
    		[
    			40,
    			43
    		]
    	],
    	[
    		[
    			20598,
    			14796
    		],
    		[
    			53,
    			200
    		],
    		[
    			30,
    			60
    		]
    	],
    	[
    		[
    			20681,
    			15056
    		],
    		[
    			37,
    			-1
    		],
    		[
    			22,
    			-76
    		],
    		[
    			-52,
    			-101
    		],
    		[
    			-41,
    			-57
    		]
    	],
    	[
    		[
    			16515,
    			9987
    		],
    		[
    			-69,
    			36
    		],
    		[
    			-75,
    			67
    		],
    		[
    			-37,
    			49
    		],
    		[
    			-63,
    			110
    		],
    		[
    			-74,
    			87
    		],
    		[
    			-49,
    			44
    		],
    		[
    			-12,
    			36
    		]
    	],
    	[
    		[
    			16136,
    			10416
    		],
    		[
    			17,
    			47
    		],
    		[
    			67,
    			96
    		],
    		[
    			0,
    			44
    		],
    		[
    			24,
    			18
    		],
    		[
    			7,
    			57
    		]
    	],
    	[
    		[
    			19629,
    			12940
    		],
    		[
    			0,
    			-336
    		],
    		[
    			-95,
    			0
    		],
    		[
    			0,
    			-83
    		]
    	],
    	[
    		[
    			19534,
    			12521
    		],
    		[
    			-766,
    			659
    		],
    		[
    			-96,
    			-74
    		]
    	],
    	[
    		[
    			18672,
    			13106
    		],
    		[
    			-78,
    			-59
    		],
    		[
    			-76,
    			96
    		],
    		[
    			-134,
    			50
    		]
    	],
    	[
    		[
    			18150,
    			14320
    		],
    		[
    			32,
    			17
    		],
    		[
    			41,
    			94
    		],
    		[
    			-16,
    			97
    		],
    		[
    			47,
    			80
    		],
    		[
    			85,
    			73
    		],
    		[
    			4,
    			128
    		]
    	],
    	[
    		[
    			18343,
    			14809
    		],
    		[
    			94,
    			-62
    		],
    		[
    			66,
    			19
    		],
    		[
    			91,
    			-33
    		],
    		[
    			26,
    			-31
    		],
    		[
    			80,
    			-36
    		],
    		[
    			35,
    			-143
    		],
    		[
    			35,
    			-30
    		],
    		[
    			69,
    			-10
    		],
    		[
    			137,
    			-73
    		],
    		[
    			74,
    			-84
    		],
    		[
    			41,
    			5
    		],
    		[
    			38,
    			36
    		],
    		[
    			38,
    			108
    		],
    		[
    			-24,
    			110
    		],
    		[
    			17,
    			60
    		],
    		[
    			46,
    			61
    		],
    		[
    			101,
    			62
    		],
    		[
    			46,
    			1
    		],
    		[
    			95,
    			-49
    		],
    		[
    			15,
    			-72
    		],
    		[
    			79,
    			-31
    		],
    		[
    			88,
    			-11
    		],
    		[
    			13,
    			-52
    		]
    	],
    	[
    		[
    			11406,
    			11604
    		],
    		[
    			-6,
    			-53
    		],
    		[
    			-11,
    			35
    		],
    		[
    			17,
    			18
    		]
    	],
    	[
    		[
    			24916,
    			10903
    		],
    		[
    			56,
    			-88
    		],
    		[
    			53,
    			-134
    		],
    		[
    			22,
    			-110
    		],
    		[
    			20,
    			-42
    		],
    		[
    			9,
    			-96
    		],
    		[
    			-17,
    			-88
    		],
    		[
    			-37,
    			-50
    		],
    		[
    			-83,
    			-43
    		],
    		[
    			-34,
    			31
    		],
    		[
    			-25,
    			135
    		],
    		[
    			-8,
    			167
    		],
    		[
    			15,
    			168
    		],
    		[
    			15,
    			22
    		],
    		[
    			14,
    			128
    		]
    	],
    	[
    		[
    			19859,
    			4183
    		],
    		[
    			-35,
    			113
    		],
    		[
    			32,
    			28
    		],
    		[
    			39,
    			93
    		],
    		[
    			84,
    			58
    		],
    		[
    			65,
    			-86
    		],
    		[
    			13,
    			-44
    		],
    		[
    			-27,
    			-53
    		],
    		[
    			-1,
    			-42
    		],
    		[
    			-31,
    			-30
    		],
    		[
    			-41,
    			-7
    		],
    		[
    			-33,
    			-86
    		],
    		[
    			-30,
    			9
    		],
    		[
    			-35,
    			47
    		]
    	],
    	[
    		[
    			19486,
    			18290
    		],
    		[
    			-1,
    			31
    		],
    		[
    			-67,
    			36
    		]
    	],
    	[
    		[
    			19418,
    			18357
    		],
    		[
    			-17,
    			109
    		],
    		[
    			-52,
    			1
    		],
    		[
    			-76,
    			37
    		]
    	],
    	[
    		[
    			19273,
    			18504
    		],
    		[
    			-20,
    			137
    		]
    	],
    	[
    		[
    			19253,
    			18641
    		],
    		[
    			89,
    			59
    		],
    		[
    			170,
    			-9
    		],
    		[
    			37,
    			-18
    		],
    		[
    			68,
    			27
    		],
    		[
    			22,
    			-39
    		],
    		[
    			52,
    			-8
    		],
    		[
    			93,
    			-77
    		]
    	],
    	[
    		[
    			19852,
    			18889
    		],
    		[
    			49,
    			-38
    		],
    		[
    			-12,
    			-78
    		],
    		[
    			45,
    			-69
    		],
    		[
    			-3,
    			-46
    		]
    	],
    	[
    		[
    			19253,
    			18641
    		],
    		[
    			0,
    			129
    		],
    		[
    			33,
    			36
    		],
    		[
    			27,
    			86
    		],
    		[
    			86,
    			11
    		],
    		[
    			52,
    			-45
    		],
    		[
    			10,
    			-42
    		],
    		[
    			51,
    			-24
    		],
    		[
    			61,
    			48
    		],
    		[
    			-5,
    			105
    		]
    	],
    	[
    		[
    			28108,
    			12975
    		],
    		[
    			2,
    			-4
    		],
    		[
    			-3,
    			0
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			16720,
    			15269
    		],
    		[
    			4,
    			-7
    		],
    		[
    			10,
    			-53
    		],
    		[
    			50,
    			-57
    		],
    		[
    			34,
    			-11
    		],
    		[
    			42,
    			20
    		],
    		[
    			56,
    			-13
    		],
    		[
    			36,
    			24
    		],
    		[
    			3,
    			-9
    		],
    		[
    			3,
    			-22
    		],
    		[
    			66,
    			-10
    		]
    	],
    	[
    		[
    			15974,
    			13888
    		],
    		[
    			25,
    			48
    		],
    		[
    			82,
    			23
    		],
    		[
    			58,
    			42
    		],
    		[
    			40,
    			70
    		],
    		[
    			38,
    			32
    		],
    		[
    			40,
    			60
    		],
    		[
    			41,
    			93
    		],
    		[
    			18,
    			89
    		],
    		[
    			-20,
    			70
    		],
    		[
    			-2,
    			100
    		],
    		[
    			55,
    			132
    		],
    		[
    			-1,
    			59
    		],
    		[
    			93,
    			138
    		],
    		[
    			68,
    			40
    		],
    		[
    			60,
    			52
    		],
    		[
    			56,
    			133
    		],
    		[
    			46,
    			183
    		],
    		[
    			49,
    			17
    		]
    	],
    	[
    		[
    			17949,
    			16582
    		],
    		[
    			-4,
    			-5
    		]
    	],
    	[
    		[
    			19937,
    			16868
    		],
    		[
    			-9,
    			129
    		],
    		[
    			13,
    			63
    		],
    		[
    			-15,
    			62
    		],
    		[
    			-77,
    			114
    		],
    		[
    			-12,
    			55
    		],
    		[
    			-52,
    			42
    		]
    	],
    	[
    		[
    			19785,
    			17333
    		],
    		[
    			24,
    			29
    		],
    		[
    			85,
    			6
    		],
    		[
    			33,
    			-38
    		],
    		[
    			103,
    			-40
    		],
    		[
    			-5,
    			-74
    		],
    		[
    			81,
    			-132
    		],
    		[
    			-3,
    			-60
    		],
    		[
    			-75,
    			19
    		],
    		[
    			-18,
    			-85
    		],
    		[
    			-73,
    			-90
    		]
    	],
    	[
    		[
    			21951,
    			7257
    		],
    		[
    			19,
    			-67
    		],
    		[
    			47,
    			-116
    		],
    		[
    			19,
    			-119
    		],
    		[
    			5,
    			-138
    		],
    		[
    			29,
    			-115
    		],
    		[
    			-26,
    			-121
    		],
    		[
    			-19,
    			21
    		],
    		[
    			-11,
    			70
    		],
    		[
    			-28,
    			-19
    		],
    		[
    			23,
    			-111
    		],
    		[
    			-2,
    			-59
    		],
    		[
    			-39,
    			-122
    		],
    		[
    			9,
    			-66
    		],
    		[
    			-17,
    			-120
    		],
    		[
    			-32,
    			-132
    		],
    		[
    			-18,
    			-120
    		],
    		[
    			-21,
    			-79
    		],
    		[
    			-39,
    			-227
    		],
    		[
    			-28,
    			-122
    		],
    		[
    			-30,
    			-220
    		],
    		[
    			-43,
    			-188
    		],
    		[
    			-35,
    			-41
    		],
    		[
    			-45,
    			-6
    		],
    		[
    			-66,
    			-59
    		],
    		[
    			-41,
    			-10
    		],
    		[
    			-27,
    			36
    		],
    		[
    			-53,
    			23
    		],
    		[
    			-31,
    			43
    		],
    		[
    			-9,
    			62
    		],
    		[
    			-25,
    			50
    		],
    		[
    			-4,
    			96
    		],
    		[
    			13,
    			49
    		],
    		[
    			-38,
    			102
    		],
    		[
    			-13,
    			97
    		],
    		[
    			24,
    			154
    		],
    		[
    			31,
    			23
    		],
    		[
    			12,
    			70
    		],
    		[
    			53,
    			142
    		],
    		[
    			-3,
    			91
    		],
    		[
    			-21,
    			55
    		],
    		[
    			2,
    			38
    		],
    		[
    			-20,
    			73
    		],
    		[
    			-1,
    			110
    		],
    		[
    			-10,
    			43
    		],
    		[
    			41,
    			118
    		],
    		[
    			12,
    			103
    		],
    		[
    			34,
    			-8
    		],
    		[
    			35,
    			46
    		],
    		[
    			109,
    			53
    		],
    		[
    			93,
    			120
    		],
    		[
    			15,
    			-29
    		],
    		[
    			27,
    			79
    		],
    		[
    			-3,
    			46
    		],
    		[
    			22,
    			30
    		],
    		[
    			-5,
    			96
    		],
    		[
    			46,
    			5
    		],
    		[
    			36,
    			27
    		],
    		[
    			18,
    			96
    		],
    		[
    			-18,
    			73
    		],
    		[
    			37,
    			22
    		],
    		[
    			10,
    			52
    		]
    	],
    	[
    		[
    			24239,
    			10384
    		],
    		[
    			0,
    			2
    		],
    		[
    			1,
    			1
    		],
    		[
    			0,
    			3
    		],
    		[
    			1,
    			1
    		],
    		[
    			-1,
    			-4
    		],
    		[
    			-1,
    			-3
    		]
    	],
    	[
    		[
    			7933,
    			13600
    		],
    		[
    			-9,
    			-68
    		],
    		[
    			-47,
    			-29
    		],
    		[
    			3,
    			-119
    		],
    		[
    			-6,
    			-304
    		],
    		[
    			-8,
    			-62
    		],
    		[
    			14,
    			-84
    		],
    		[
    			36,
    			-66
    		],
    		[
    			-8,
    			-65
    		],
    		[
    			24,
    			-88
    		],
    		[
    			69,
    			-133
    		],
    		[
    			13,
    			-88
    		],
    		[
    			63,
    			-100
    		],
    		[
    			42,
    			-5
    		],
    		[
    			40,
    			-32
    		],
    		[
    			20,
    			-56
    		],
    		[
    			47,
    			6
    		],
    		[
    			68,
    			38
    		],
    		[
    			40,
    			-2
    		],
    		[
    			25,
    			28
    		],
    		[
    			66,
    			19
    		],
    		[
    			39,
    			-46
    		],
    		[
    			28,
    			20
    		],
    		[
    			20,
    			80
    		],
    		[
    			36,
    			57
    		],
    		[
    			21,
    			81
    		],
    		[
    			2,
    			101
    		],
    		[
    			15,
    			91
    		],
    		[
    			57,
    			45
    		],
    		[
    			85,
    			20
    		],
    		[
    			24,
    			23
    		],
    		[
    			58,
    			10
    		],
    		[
    			50,
    			-19
    		],
    		[
    			36,
    			20
    		],
    		[
    			27,
    			-31
    		],
    		[
    			7,
    			-47
    		],
    		[
    			-13,
    			-50
    		],
    		[
    			-52,
    			-102
    		],
    		[
    			0,
    			-57
    		],
    		[
    			-30,
    			-49
    		],
    		[
    			17,
    			-82
    		],
    		[
    			-20,
    			-115
    		],
    		[
    			-52,
    			11
    		]
    	],
    	[
    		[
    			8403,
    			11691
    		],
    		[
    			-114,
    			188
    		],
    		[
    			-42,
    			50
    		],
    		[
    			-86,
    			59
    		],
    		[
    			-7,
    			19
    		],
    		[
    			-58,
    			-78
    		],
    		[
    			-75,
    			-49
    		],
    		[
    			-59,
    			9
    		],
    		[
    			-31,
    			30
    		],
    		[
    			-60,
    			10
    		],
    		[
    			-40,
    			45
    		],
    		[
    			-32,
    			14
    		],
    		[
    			-22,
    			40
    		],
    		[
    			-87,
    			25
    		],
    		[
    			-26,
    			32
    		],
    		[
    			-101,
    			59
    		],
    		[
    			-41,
    			47
    		],
    		[
    			-38,
    			64
    		],
    		[
    			-33,
    			0
    		],
    		[
    			-124,
    			68
    		],
    		[
    			-47,
    			92
    		],
    		[
    			-93,
    			73
    		],
    		[
    			-46,
    			96
    		],
    		[
    			-24,
    			78
    		],
    		[
    			41,
    			52
    		],
    		[
    			-25,
    			23
    		],
    		[
    			28,
    			72
    		],
    		[
    			-43,
    			134
    		],
    		[
    			-18,
    			112
    		],
    		[
    			-53,
    			84
    		],
    		[
    			-47,
    			109
    		],
    		[
    			-107,
    			140
    		],
    		[
    			-10,
    			73
    		],
    		[
    			-120,
    			90
    		],
    		[
    			-4,
    			67
    		],
    		[
    			16,
    			43
    		],
    		[
    			-15,
    			59
    		],
    		[
    			-42,
    			18
    		],
    		[
    			-12,
    			56
    		],
    		[
    			-32,
    			8
    		],
    		[
    			-24,
    			36
    		],
    		[
    			-6,
    			73
    		],
    		[
    			-32,
    			11
    		],
    		[
    			-71,
    			97
    		],
    		[
    			-44,
    			92
    		],
    		[
    			-10,
    			54
    		],
    		[
    			-47,
    			100
    		],
    		[
    			-1,
    			45
    		],
    		[
    			-36,
    			104
    		],
    		[
    			9,
    			59
    		],
    		[
    			-49,
    			23
    		],
    		[
    			-33,
    			51
    		],
    		[
    			-27,
    			-18
    		],
    		[
    			-61,
    			55
    		],
    		[
    			-7,
    			-111
    		],
    		[
    			16,
    			-38
    		],
    		[
    			5,
    			-123
    		],
    		[
    			99,
    			-155
    		],
    		[
    			50,
    			-125
    		],
    		[
    			26,
    			-14
    		],
    		[
    			7,
    			-97
    		],
    		[
    			35,
    			-47
    		],
    		[
    			37,
    			-105
    		],
    		[
    			44,
    			-44
    		],
    		[
    			23,
    			-104
    		],
    		[
    			2,
    			-50
    		],
    		[
    			58,
    			-148
    		],
    		[
    			1,
    			-88
    		],
    		[
    			11,
    			-25
    		],
    		[
    			52,
    			-7
    		],
    		[
    			59,
    			-117
    		],
    		[
    			-4,
    			-44
    		],
    		[
    			-43,
    			-57
    		],
    		[
    			-20,
    			28
    		],
    		[
    			-21,
    			91
    		],
    		[
    			-69,
    			89
    		],
    		[
    			-40,
    			36
    		],
    		[
    			-22,
    			43
    		],
    		[
    			-47,
    			45
    		],
    		[
    			11,
    			132
    		],
    		[
    			-12,
    			58
    		],
    		[
    			-83,
    			102
    		],
    		[
    			-9,
    			30
    		],
    		[
    			-45,
    			-9
    		],
    		[
    			-21,
    			41
    		],
    		[
    			-62,
    			43
    		],
    		[
    			-35,
    			101
    		],
    		[
    			37,
    			-8
    		],
    		[
    			37,
    			62
    		],
    		[
    			3,
    			53
    		],
    		[
    			-87,
    			152
    		],
    		[
    			-71,
    			63
    		],
    		[
    			-9,
    			83
    		],
    		[
    			-24,
    			40
    		],
    		[
    			-1,
    			50
    		],
    		[
    			-60,
    			132
    		],
    		[
    			7,
    			45
    		],
    		[
    			-26,
    			32
    		],
    		[
    			-23,
    			84
    		]
    	],
    	[
    		[
    			6021,
    			14703
    		],
    		[
    			230,
    			30
    		],
    		[
    			-8,
    			-37
    		],
    		[
    			211,
    			-114
    		],
    		[
    			147,
    			-81
    		],
    		[
    			274,
    			0
    		],
    		[
    			0,
    			76
    		],
    		[
    			161,
    			-1
    		],
    		[
    			108,
    			-155
    		],
    		[
    			48,
    			-48
    		],
    		[
    			37,
    			-156
    		],
    		[
    			33,
    			-40
    		],
    		[
    			97,
    			-70
    		],
    		[
    			46,
    			128
    		],
    		[
    			51,
    			10
    		],
    		[
    			69,
    			-9
    		],
    		[
    			71,
    			-108
    		],
    		[
    			37,
    			-138
    		],
    		[
    			39,
    			-81
    		],
    		[
    			37,
    			-51
    		],
    		[
    			4,
    			-72
    		],
    		[
    			32,
    			-107
    		],
    		[
    			30,
    			-9
    		],
    		[
    			57,
    			-52
    		],
    		[
    			101,
    			-18
    		]
    	],
    	[
    		[
    			33632,
    			10438
    		],
    		[
    			-3,
    			1
    		],
    		[
    			-10,
    			7
    		],
    		[
    			-3,
    			2
    		],
    		[
    			-1,
    			1
    		],
    		[
    			11,
    			-7
    		],
    		[
    			6,
    			-4
    		]
    	],
    	[
    		[
    			250,
    			13978
    		],
    		[
    			1,
    			3
    		],
    		[
    			1,
    			-2
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			19207,
    			16266
    		],
    		[
    			49,
    			55
    		],
    		[
    			81,
    			24
    		],
    		[
    			40,
    			-6
    		]
    	],
    	[
    		[
    			17642,
    			12461
    		],
    		[
    			0,
    			-360
    		],
    		[
    			-16,
    			-13
    		],
    		[
    			0,
    			-99
    		],
    		[
    			-20,
    			-105
    		],
    		[
    			-33,
    			-59
    		],
    		[
    			-86,
    			4
    		],
    		[
    			-125,
    			-17
    		],
    		[
    			-33,
    			-48
    		],
    		[
    			-72,
    			2
    		]
    	],
    	[
    		[
    			16146,
    			11335
    		],
    		[
    			3,
    			87
    		],
    		[
    			-27,
    			77
    		],
    		[
    			-39,
    			39
    		],
    		[
    			8,
    			33
    		],
    		[
    			-7,
    			77
    		],
    		[
    			-20,
    			80
    		]
    	],
    	[
    		[
    			16064,
    			11728
    		],
    		[
    			41,
    			23
    		],
    		[
    			9,
    			105
    		],
    		[
    			27,
    			20
    		],
    		[
    			51,
    			-91
    		],
    		[
    			16,
    			54
    		],
    		[
    			90,
    			-9
    		],
    		[
    			44,
    			21
    		],
    		[
    			233,
    			0
    		],
    		[
    			133,
    			2
    		],
    		[
    			17,
    			138
    		],
    		[
    			-26,
    			28
    		],
    		[
    			-30,
    			471
    		],
    		[
    			-30,
    			455
    		],
    		[
    			-20,
    			294
    		],
    		[
    			-12,
    			203
    		],
    		[
    			166,
    			-1
    		]
    	],
    	[
    		[
    			18612,
    			15281
    		],
    		[
    			19,
    			-19
    		],
    		[
    			-4,
    			-11
    		],
    		[
    			-18,
    			12
    		],
    		[
    			3,
    			18
    		]
    	],
    	[
    		[
    			26302,
    			11985
    		],
    		[
    			-47,
    			-44
    		],
    		[
    			8,
    			78
    		],
    		[
    			28,
    			135
    		],
    		[
    			-16,
    			168
    		],
    		[
    			-25,
    			84
    		],
    		[
    			-46,
    			42
    		],
    		[
    			-18,
    			50
    		],
    		[
    			30,
    			84
    		],
    		[
    			-39,
    			32
    		],
    		[
    			-6,
    			46
    		],
    		[
    			-40,
    			-5
    		],
    		[
    			-49,
    			65
    		],
    		[
    			-18,
    			77
    		]
    	],
    	[
    		[
    			26819,
    			12664
    		],
    		[
    			-55,
    			-6
    		],
    		[
    			-42,
    			-37
    		],
    		[
    			-6,
    			-51
    		],
    		[
    			-109,
    			-36
    		],
    		[
    			-13,
    			-91
    		],
    		[
    			3,
    			-76
    		],
    		[
    			-12,
    			-49
    		],
    		[
    			11,
    			-94
    		],
    		[
    			56,
    			-113
    		],
    		[
    			12,
    			-54
    		],
    		[
    			43,
    			-80
    		],
    		[
    			-32,
    			-56
    		],
    		[
    			0,
    			-91
    		],
    		[
    			-38,
    			-45
    		],
    		[
    			12,
    			-62
    		],
    		[
    			27,
    			-67
    		],
    		[
    			36,
    			-42
    		],
    		[
    			19,
    			-58
    		],
    		[
    			6,
    			-166
    		],
    		[
    			17,
    			-47
    		],
    		[
    			22,
    			-122
    		],
    		[
    			-39,
    			-104
    		],
    		[
    			-43,
    			-72
    		],
    		[
    			-3,
    			-49
    		]
    	],
    	[
    		[
    			26691,
    			10996
    		],
    		[
    			-28,
    			49
    		],
    		[
    			23,
    			41
    		],
    		[
    			3,
    			180
    		],
    		[
    			-18,
    			60
    		],
    		[
    			15,
    			61
    		],
    		[
    			-32,
    			148
    		],
    		[
    			-28,
    			24
    		],
    		[
    			3,
    			63
    		],
    		[
    			-26,
    			103
    		],
    		[
    			-14,
    			194
    		],
    		[
    			-11,
    			18
    		],
    		[
    			5,
    			81
    		],
    		[
    			-23,
    			4
    		],
    		[
    			-30,
    			119
    		],
    		[
    			-42,
    			-112
    		],
    		[
    			-42,
    			-15
    		],
    		[
    			-69,
    			-121
    		],
    		[
    			-50,
    			-1
    		],
    		[
    			-38,
    			37
    		],
    		[
    			13,
    			56
    		]
    	],
    	[
    		[
    			19077,
    			16542
    		],
    		[
    			39,
    			-59
    		],
    		[
    			68,
    			-46
    		],
    		[
    			-26,
    			-57
    		]
    	],
    	[
    		[
    			19090,
    			16262
    		],
    		[
    			-81,
    			96
    		]
    	],
    	[
    		[
    			25645,
    			17489
    		],
    		[
    			38,
    			52
    		],
    		[
    			84,
    			1
    		],
    		[
    			56,
    			35
    		],
    		[
    			-5,
    			37
    		],
    		[
    			144,
    			84
    		],
    		[
    			72,
    			50
    		],
    		[
    			91,
    			11
    		],
    		[
    			26,
    			-38
    		],
    		[
    			107,
    			2
    		],
    		[
    			36,
    			-91
    		],
    		[
    			84,
    			-19
    		],
    		[
    			32,
    			19
    		],
    		[
    			155,
    			-42
    		],
    		[
    			65,
    			53
    		],
    		[
    			20,
    			73
    		],
    		[
    			-44,
    			69
    		],
    		[
    			8,
    			62
    		],
    		[
    			35,
    			66
    		],
    		[
    			37,
    			17
    		],
    		[
    			25,
    			55
    		],
    		[
    			99,
    			-66
    		],
    		[
    			50,
    			0
    		],
    		[
    			80,
    			-47
    		],
    		[
    			69,
    			-12
    		],
    		[
    			24,
    			-136
    		],
    		[
    			63,
    			-47
    		],
    		[
    			68,
    			-28
    		],
    		[
    			163,
    			57
    		],
    		[
    			147,
    			-39
    		],
    		[
    			20,
    			-36
    		],
    		[
    			54,
    			-13
    		],
    		[
    			25,
    			-48
    		],
    		[
    			57,
    			-55
    		],
    		[
    			74,
    			1
    		],
    		[
    			23,
    			-20
    		],
    		[
    			115,
    			-13
    		],
    		[
    			60,
    			38
    		],
    		[
    			52,
    			4
    		],
    		[
    			110,
    			35
    		],
    		[
    			14,
    			38
    		],
    		[
    			107,
    			75
    		],
    		[
    			63,
    			-17
    		],
    		[
    			35,
    			-46
    		],
    		[
    			80,
    			21
    		],
    		[
    			49,
    			-30
    		]
    	],
    	[
    		[
    			31199,
    			11812
    		],
    		[
    			-8,
    			-26
    		],
    		[
    			-5,
    			2
    		],
    		[
    			4,
    			17
    		],
    		[
    			9,
    			7
    		]
    	],
    	[
    		[
    			20385,
    			4762
    		],
    		[
    			-73,
    			4
    		]
    	],
    	[
    		[
    			20312,
    			4766
    		],
    		[
    			-4,
    			138
    		],
    		[
    			-10,
    			10
    		]
    	],
    	[
    		[
    			20298,
    			4914
    		],
    		[
    			6,
    			138
    		],
    		[
    			-6,
    			137
    		],
    		[
    			-11,
    			60
    		],
    		[
    			-29,
    			78
    		],
    		[
    			-1,
    			51
    		],
    		[
    			-23,
    			127
    		]
    	],
    	[
    		[
    			20234,
    			5505
    		],
    		[
    			104,
    			183
    		],
    		[
    			25,
    			128
    		],
    		[
    			33,
    			91
    		],
    		[
    			-22,
    			110
    		],
    		[
    			10,
    			44
    		],
    		[
    			-17,
    			40
    		],
    		[
    			30,
    			66
    		],
    		[
    			-7,
    			82
    		],
    		[
    			10,
    			105
    		],
    		[
    			-20,
    			70
    		],
    		[
    			13,
    			37
    		],
    		[
    			-66,
    			46
    		],
    		[
    			-24,
    			-2
    		],
    		[
    			-33,
    			41
    		],
    		[
    			-53,
    			37
    		],
    		[
    			-68,
    			-4
    		],
    		[
    			-1,
    			65
    		]
    	],
    	[
    		[
    			20148,
    			6644
    		],
    		[
    			-19,
    			103
    		],
    		[
    			140,
    			82
    		],
    		[
    			149,
    			85
    		]
    	],
    	[
    		[
    			20418,
    			6914
    		],
    		[
    			38,
    			-98
    		],
    		[
    			69,
    			34
    		],
    		[
    			19,
    			-43
    		],
    		[
    			4,
    			-108
    		],
    		[
    			-33,
    			-93
    		],
    		[
    			58,
    			-140
    		],
    		[
    			30,
    			-40
    		],
    		[
    			14,
    			119
    		],
    		[
    			48,
    			29
    		],
    		[
    			7,
    			227
    		],
    		[
    			-97,
    			200
    		],
    		[
    			-26,
    			0
    		],
    		[
    			-3,
    			72
    		],
    		[
    			-21,
    			141
    		],
    		[
    			27,
    			80
    		],
    		[
    			31,
    			26
    		]
    	],
    	[
    		[
    			20583,
    			7320
    		],
    		[
    			66,
    			4
    		],
    		[
    			16,
    			22
    		],
    		[
    			46,
    			-50
    		],
    		[
    			48,
    			24
    		],
    		[
    			59,
    			-18
    		],
    		[
    			35,
    			29
    		],
    		[
    			16,
    			42
    		],
    		[
    			52,
    			-27
    		],
    		[
    			37,
    			41
    		],
    		[
    			35,
    			0
    		],
    		[
    			77,
    			69
    		],
    		[
    			33,
    			42
    		]
    	],
    	[
    		[
    			21103,
    			7498
    		],
    		[
    			18,
    			-30
    		],
    		[
    			-1,
    			-59
    		],
    		[
    			-19,
    			-51
    		],
    		[
    			12,
    			-83
    		],
    		[
    			-1,
    			-115
    		],
    		[
    			13,
    			-45
    		],
    		[
    			-6,
    			-50
    		],
    		[
    			6,
    			-187
    		],
    		[
    			18,
    			-33
    		],
    		[
    			3,
    			-66
    		],
    		[
    			-21,
    			-56
    		],
    		[
    			-4,
    			-56
    		],
    		[
    			-38,
    			-72
    		],
    		[
    			-32,
    			-88
    		],
    		[
    			-64,
    			-70
    		],
    		[
    			-9,
    			-26
    		],
    		[
    			-57,
    			-19
    		],
    		[
    			-63,
    			-49
    		],
    		[
    			-66,
    			-68
    		],
    		[
    			-61,
    			-121
    		],
    		[
    			-22,
    			-57
    		],
    		[
    			-53,
    			-34
    		],
    		[
    			-58,
    			-104
    		],
    		[
    			-32,
    			-23
    		],
    		[
    			-12,
    			-93
    		],
    		[
    			33,
    			-54
    		],
    		[
    			13,
    			-117
    		],
    		[
    			13,
    			-36
    		],
    		[
    			6,
    			-97
    		],
    		[
    			20,
    			-18
    		],
    		[
    			-11,
    			-220
    		],
    		[
    			7,
    			-78
    		],
    		[
    			-37,
    			-83
    		],
    		[
    			-169,
    			-113
    		],
    		[
    			-49,
    			-50
    		],
    		[
    			-27,
    			-68
    		],
    		[
    			26,
    			-51
    		],
    		[
    			6,
    			-96
    		]
    	],
    	[
    		[
    			16064,
    			11728
    		],
    		[
    			-59,
    			74
    		],
    		[
    			-10,
    			50
    		],
    		[
    			-28,
    			25
    		],
    		[
    			-12,
    			68
    		],
    		[
    			-45,
    			8
    		],
    		[
    			-47,
    			90
    		],
    		[
    			-59,
    			-1
    		],
    		[
    			-73,
    			-28
    		],
    		[
    			-53,
    			9
    		],
    		[
    			-23,
    			-78
    		]
    	],
    	[
    		[
    			15655,
    			11945
    		],
    		[
    			7,
    			95
    		],
    		[
    			30,
    			130
    		],
    		[
    			9,
    			99
    		],
    		[
    			-3,
    			77
    		],
    		[
    			-20,
    			105
    		],
    		[
    			-23,
    			46
    		],
    		[
    			25,
    			71
    		],
    		[
    			4,
    			71
    		],
    		[
    			-17,
    			56
    		],
    		[
    			-64,
    			39
    		]
    	],
    	[
    		[
    			11282,
    			12048
    		],
    		[
    			-6,
    			12
    		],
    		[
    			4,
    			12
    		],
    		[
    			4,
    			-13
    		],
    		[
    			-2,
    			-11
    		]
    	],
    	[
    		[
    			11389,
    			11740
    		],
    		[
    			14,
    			-12
    		],
    		[
    			9,
    			-50
    		],
    		[
    			-23,
    			15
    		],
    		[
    			0,
    			47
    		]
    	],
    	[
    		[
    			22755,
    			5909
    		],
    		[
    			14,
    			-48
    		],
    		[
    			-12,
    			-32
    		],
    		[
    			-29,
    			32
    		],
    		[
    			27,
    			48
    		]
    	],
    	[
    		[
    			20418,
    			6914
    		],
    		[
    			-28,
    			12
    		],
    		[
    			-15,
    			48
    		],
    		[
    			12,
    			39
    		],
    		[
    			14,
    			134
    		],
    		[
    			29,
    			9
    		],
    		[
    			-10,
    			73
    		],
    		[
    			7,
    			54
    		],
    		[
    			-10,
    			61
    		],
    		[
    			17,
    			45
    		],
    		[
    			-7,
    			56
    		],
    		[
    			35,
    			41
    		],
    		[
    			-34,
    			83
    		],
    		[
    			4,
    			30
    		],
    		[
    			-41,
    			85
    		]
    	],
    	[
    		[
    			20391,
    			7684
    		],
    		[
    			47,
    			-35
    		],
    		[
    			57,
    			20
    		],
    		[
    			44,
    			-81
    		],
    		[
    			12,
    			-189
    		],
    		[
    			32,
    			-79
    		]
    	],
    	[
    		[
    			27011,
    			10302
    		],
    		[
    			97,
    			-140
    		],
    		[
    			30,
    			-94
    		],
    		[
    			8,
    			-89
    		],
    		[
    			-15,
    			-101
    		],
    		[
    			12,
    			-142
    		],
    		[
    			36,
    			-70
    		],
    		[
    			41,
    			-139
    		],
    		[
    			-13,
    			-45
    		],
    		[
    			-73,
    			30
    		],
    		[
    			-82,
    			94
    		],
    		[
    			-30,
    			22
    		],
    		[
    			-38,
    			60
    		],
    		[
    			-50,
    			56
    		],
    		[
    			2,
    			57
    		],
    		[
    			-47,
    			100
    		],
    		[
    			-23,
    			77
    		],
    		[
    			-2,
    			95
    		],
    		[
    			-19,
    			35
    		],
    		[
    			0,
    			145
    		],
    		[
    			-23,
    			79
    		]
    	],
    	[
    		[
    			26822,
    			10332
    		],
    		[
    			6,
    			46
    		],
    		[
    			64,
    			-78
    		],
    		[
    			25,
    			4
    		],
    		[
    			16,
    			-74
    		],
    		[
    			26,
    			18
    		],
    		[
    			38,
    			-8
    		],
    		[
    			14,
    			62
    		]
    	],
    	[
    		[
    			27734,
    			9605
    		],
    		[
    			29,
    			-62
    		],
    		[
    			39,
    			3
    		],
    		[
    			56,
    			-34
    		],
    		[
    			39,
    			138
    		],
    		[
    			8,
    			60
    		],
    		[
    			152,
    			79
    		],
    		[
    			40,
    			99
    		],
    		[
    			31,
    			45
    		],
    		[
    			30,
    			93
    		]
    	],
    	[
    		[
    			28248,
    			10076
    		],
    		[
    			3,
    			-14
    		],
    		[
    			11,
    			18
    		],
    		[
    			37,
    			28
    		],
    		[
    			-17,
    			36
    		],
    		[
    			18,
    			43
    		],
    		[
    			23,
    			-4
    		],
    		[
    			31,
    			99
    		],
    		[
    			51,
    			100
    		],
    		[
    			61,
    			-18
    		],
    		[
    			43,
    			-32
    		],
    		[
    			-10,
    			-63
    		],
    		[
    			34,
    			3
    		],
    		[
    			97,
    			-109
    		],
    		[
    			16,
    			-50
    		],
    		[
    			-42,
    			-28
    		],
    		[
    			-38,
    			13
    		],
    		[
    			-20,
    			-24
    		],
    		[
    			40,
    			-86
    		],
    		[
    			-91,
    			-31
    		]
    	],
    	[
    		[
    			21554,
    			7140
    		],
    		[
    			13,
    			-18
    		],
    		[
    			-9,
    			-26
    		],
    		[
    			-10,
    			28
    		],
    		[
    			6,
    			16
    		]
    	],
    	[
    		[
    			19479,
    			6306
    		],
    		[
    			78,
    			27
    		],
    		[
    			77,
    			-20
    		],
    		[
    			21,
    			-33
    		]
    	],
    	[
    		[
    			19151,
    			5115
    		],
    		[
    			0,
    			-616
    		],
    		[
    			-44,
    			-19
    		],
    		[
    			-42,
    			-71
    		],
    		[
    			-17,
    			19
    		],
    		[
    			-70,
    			-10
    		],
    		[
    			-26,
    			24
    		],
    		[
    			-47,
    			8
    		],
    		[
    			-9,
    			81
    		],
    		[
    			-42,
    			28
    		],
    		[
    			-16,
    			-71
    		],
    		[
    			-27,
    			-22
    		]
    	],
    	[
    		[
    			18811,
    			4466
    		],
    		[
    			-72,
    			106
    		],
    		[
    			-39,
    			111
    		],
    		[
    			-45,
    			265
    		],
    		[
    			5,
    			110
    		],
    		[
    			-38,
    			153
    		],
    		[
    			1,
    			149
    		],
    		[
    			-8,
    			46
    		],
    		[
    			12,
    			62
    		],
    		[
    			-13,
    			60
    		],
    		[
    			-42,
    			83
    		],
    		[
    			-10,
    			47
    		],
    		[
    			-45,
    			118
    		],
    		[
    			-18,
    			94
    		],
    		[
    			-70,
    			220
    		],
    		[
    			-42,
    			75
    		],
    		[
    			-28,
    			111
    		],
    		[
    			2,
    			94
    		]
    	],
    	[
    		[
    			32940,
    			5895
    		],
    		[
    			46,
    			-36
    		],
    		[
    			72,
    			-92
    		],
    		[
    			36,
    			-71
    		],
    		[
    			25,
    			-13
    		],
    		[
    			109,
    			-149
    		],
    		[
    			-21,
    			-22
    		],
    		[
    			-35,
    			14
    		],
    		[
    			-68,
    			92
    		],
    		[
    			-43,
    			28
    		],
    		[
    			-44,
    			79
    		],
    		[
    			-35,
    			43
    		],
    		[
    			-38,
    			92
    		],
    		[
    			-4,
    			35
    		]
    	],
    	[
    		[
    			18672,
    			13106
    		],
    		[
    			18,
    			-168
    		],
    		[
    			1,
    			-84
    		],
    		[
    			41,
    			-88
    		],
    		[
    			-4,
    			-31
    		],
    		[
    			39,
    			-72
    		],
    		[
    			-23,
    			-67
    		],
    		[
    			-15,
    			-204
    		],
    		[
    			-9,
    			-307
    		],
    		[
    			-107,
    			-194
    		],
    		[
    			-86,
    			-230
    		],
    		[
    			14,
    			-109
    		]
    	],
    	[
    		[
    			18541,
    			11552
    		],
    		[
    			-29,
    			1
    		],
    		[
    			-45,
    			-41
    		],
    		[
    			-39,
    			-66
    		],
    		[
    			-104,
    			49
    		],
    		[
    			-68,
    			-3
    		],
    		[
    			-63,
    			-31
    		],
    		[
    			-34,
    			-61
    		],
    		[
    			-66,
    			6
    		],
    		[
    			-108,
    			84
    		],
    		[
    			-38,
    			-38
    		],
    		[
    			-48,
    			-21
    		],
    		[
    			-49,
    			109
    		],
    		[
    			-85,
    			44
    		],
    		[
    			-24,
    			-27
    		],
    		[
    			-39,
    			7
    		],
    		[
    			-71,
    			-52
    		],
    		[
    			-3,
    			-79
    		],
    		[
    			-42,
    			-78
    		],
    		[
    			-5,
    			-140
    		]
    	],
    	[
    		[
    			33326,
    			4404
    		],
    		[
    			5,
    			-5
    		],
    		[
    			-3,
    			-5
    		],
    		[
    			-4,
    			2
    		],
    		[
    			2,
    			8
    		]
    	],
    	[
    		[
    			18541,
    			11552
    		],
    		[
    			43,
    			-106
    		]
    	],
    	[
    		[
    			18052,
    			10049
    		],
    		[
    			-24,
    			-32
    		],
    		[
    			-38,
    			-1
    		],
    		[
    			-71,
    			-25
    		],
    		[
    			-100,
    			-18
    		],
    		[
    			-40,
    			47
    		],
    		[
    			-21,
    			55
    		],
    		[
    			-13,
    			79
    		],
    		[
    			-34,
    			92
    		],
    		[
    			-42,
    			66
    		],
    		[
    			-72,
    			22
    		],
    		[
    			-102,
    			-11
    		]
    	],
    	[
    		[
    			9273,
    			11767
    		],
    		[
    			-15,
    			-38
    		],
    		[
    			11,
    			-72
    		],
    		[
    			-24,
    			-68
    		],
    		[
    			-12,
    			-110
    		],
    		[
    			7,
    			-149
    		],
    		[
    			-17,
    			-28
    		],
    		[
    			3,
    			-103
    		],
    		[
    			-22,
    			-38
    		],
    		[
    			18,
    			-73
    		]
    	],
    	[
    		[
    			9030,
    			11111
    		],
    		[
    			-79,
    			117
    		],
    		[
    			-24,
    			70
    		],
    		[
    			-69,
    			101
    		],
    		[
    			17,
    			31
    		]
    	],
    	[
    		[
    			973,
    			6055
    		],
    		[
    			-10,
    			9
    		],
    		[
    			6,
    			21
    		],
    		[
    			10,
    			-18
    		],
    		[
    			-6,
    			-12
    		]
    	],
    	[
    		[
    			17558,
    			17856
    		],
    		[
    			83,
    			-4
    		]
    	],
    	[
    		[
    			17642,
    			17856
    		],
    		[
    			-25,
    			79
    		],
    		[
    			43,
    			66
    		],
    		[
    			28,
    			119
    		],
    		[
    			67,
    			-17
    		],
    		[
    			2,
    			62
    		],
    		[
    			43,
    			28
    		],
    		[
    			74,
    			12
    		],
    		[
    			52,
    			-37
    		]
    	],
    	[
    		[
    			18743,
    			20800
    		],
    		[
    			82,
    			-28
    		],
    		[
    			-57,
    			-65
    		],
    		[
    			-98,
    			-15
    		],
    		[
    			73,
    			108
    		]
    	],
    	[
    		[
    			20188,
    			20937
    		],
    		[
    			-183,
    			-121
    		]
    	],
    	[
    		[
    			19204,
    			20816
    		],
    		[
    			-56,
    			-83
    		],
    		[
    			-177,
    			-4
    		],
    		[
    			-22,
    			-96
    		],
    		[
    			-58,
    			26
    		],
    		[
    			-52,
    			-34
    		],
    		[
    			-32,
    			-120
    		],
    		[
    			-99,
    			-120
    		],
    		[
    			11,
    			-34
    		],
    		[
    			-93,
    			-25
    		],
    		[
    			-1,
    			-139
    		],
    		[
    			-84,
    			-120
    		],
    		[
    			45,
    			-20
    		],
    		[
    			-14,
    			-76
    		],
    		[
    			-73,
    			14
    		],
    		[
    			-49,
    			-19
    		],
    		[
    			-67,
    			-119
    		],
    		[
    			23,
    			-45
    		],
    		[
    			-16,
    			-66
    		],
    		[
    			24,
    			-57
    		],
    		[
    			-17,
    			-91
    		],
    		[
    			71,
    			-61
    		],
    		[
    			-62,
    			-58
    		],
    		[
    			37,
    			-85
    		],
    		[
    			-15,
    			-75
    		],
    		[
    			-72,
    			-78
    		],
    		[
    			-1,
    			-108
    		],
    		[
    			-46,
    			24
    		]
    	],
    	[
    		[
    			18309,
    			19147
    		],
    		[
    			-65,
    			37
    		],
    		[
    			-29,
    			-47
    		],
    		[
    			-69,
    			-16
    		],
    		[
    			-76,
    			-94
    		],
    		[
    			-105,
    			-61
    		],
    		[
    			-60,
    			4
    		],
    		[
    			-92,
    			59
    		],
    		[
    			-52,
    			62
    		],
    		[
    			0,
    			87
    		],
    		[
    			-26,
    			39
    		],
    		[
    			61,
    			38
    		],
    		[
    			-8,
    			67
    		],
    		[
    			-46,
    			13
    		],
    		[
    			-29,
    			180
    		],
    		[
    			33,
    			139
    		],
    		[
    			118,
    			50
    		],
    		[
    			39,
    			81
    		],
    		[
    			53,
    			2
    		],
    		[
    			105,
    			44
    		],
    		[
    			5,
    			41
    		],
    		[
    			84,
    			26
    		],
    		[
    			63,
    			106
    		],
    		[
    			100,
    			103
    		],
    		[
    			92,
    			66
    		],
    		[
    			5,
    			61
    		],
    		[
    			42,
    			79
    		],
    		[
    			48,
    			38
    		],
    		[
    			-4,
    			64
    		],
    		[
    			83,
    			60
    		],
    		[
    			58,
    			76
    		],
    		[
    			26,
    			70
    		],
    		[
    			102,
    			15
    		],
    		[
    			59,
    			109
    		],
    		[
    			100,
    			43
    		],
    		[
    			51,
    			83
    		],
    		[
    			90,
    			58
    		],
    		[
    			111,
    			40
    		],
    		[
    			26,
    			-35
    		],
    		[
    			131,
    			31
    		],
    		[
    			3,
    			64
    		],
    		[
    			99,
    			-24
    		],
    		[
    			102,
    			54
    		],
    		[
    			47,
    			77
    		],
    		[
    			132,
    			-17
    		],
    		[
    			-83,
    			-60
    		],
    		[
    			38,
    			-23
    		],
    		[
    			124,
    			94
    		],
    		[
    			124,
    			24
    		],
    		[
    			276,
    			-105
    		],
    		[
    			-103,
    			-65
    		],
    		[
    			-6,
    			-38
    		],
    		[
    			102,
    			-9
    		]
    	],
    	[
    		[
    			33219,
    			9165
    		],
    		[
    			-3,
    			2
    		],
    		[
    			3,
    			6
    		],
    		[
    			2,
    			-4
    		],
    		[
    			-2,
    			-4
    		]
    	],
    	[
    		[
    			33311,
    			1443
    		],
    		[
    			31,
    			-57
    		],
    		[
    			-62,
    			-11
    		],
    		[
    			31,
    			68
    		]
    	],
    	[
    		[
    			33772,
    			2479
    		],
    		[
    			-4,
    			-26
    		],
    		[
    			64,
    			-92
    		],
    		[
    			36,
    			32
    		],
    		[
    			47,
    			-29
    		],
    		[
    			-16,
    			-49
    		],
    		[
    			23,
    			-45
    		],
    		[
    			-64,
    			-114
    		],
    		[
    			-27,
    			-77
    		],
    		[
    			-50,
    			-43
    		],
    		[
    			-6,
    			-113
    		],
    		[
    			-57,
    			-17
    		],
    		[
    			-85,
    			-74
    		],
    		[
    			-7,
    			-84
    		],
    		[
    			-33,
    			-101
    		],
    		[
    			-98,
    			-164
    		],
    		[
    			-43,
    			-31
    		],
    		[
    			-49,
    			-4
    		],
    		[
    			-147,
    			68
    		],
    		[
    			-60,
    			7
    		],
    		[
    			-25,
    			61
    		],
    		[
    			29,
    			19
    		],
    		[
    			7,
    			71
    		],
    		[
    			45,
    			74
    		],
    		[
    			46,
    			48
    		],
    		[
    			61,
    			97
    		],
    		[
    			40,
    			5
    		],
    		[
    			84,
    			71
    		],
    		[
    			56,
    			74
    		],
    		[
    			54,
    			41
    		],
    		[
    			30,
    			50
    		],
    		[
    			30,
    			136
    		],
    		[
    			57,
    			60
    		],
    		[
    			6,
    			85
    		],
    		[
    			56,
    			64
    		]
    	],
    	[
    		[
    			33802,
    			3496
    		],
    		[
    			15,
    			-72
    		],
    		[
    			69,
    			-26
    		],
    		[
    			36,
    			-37
    		],
    		[
    			26,
    			-62
    		],
    		[
    			-8,
    			-54
    		],
    		[
    			32,
    			-72
    		],
    		[
    			2,
    			-82
    		],
    		[
    			45,
    			-25
    		],
    		[
    			44,
    			48
    		],
    		[
    			20,
    			-117
    		],
    		[
    			27,
    			-44
    		],
    		[
    			91,
    			-54
    		],
    		[
    			96,
    			77
    		],
    		[
    			35,
    			-28
    		],
    		[
    			-20,
    			-52
    		],
    		[
    			-5,
    			-87
    		],
    		[
    			-29,
    			-25
    		],
    		[
    			-16,
    			-67
    		],
    		[
    			-73,
    			-19
    		],
    		[
    			-17,
    			-43
    		],
    		[
    			13,
    			-48
    		],
    		[
    			-38,
    			-128
    		],
    		[
    			-29,
    			-37
    		],
    		[
    			-24,
    			-69
    		],
    		[
    			-59,
    			-74
    		],
    		[
    			-80,
    			48
    		],
    		[
    			31,
    			48
    		],
    		[
    			25,
    			76
    		],
    		[
    			-4,
    			76
    		],
    		[
    			-131,
    			113
    		],
    		[
    			1,
    			37
    		],
    		[
    			73,
    			61
    		],
    		[
    			27,
    			173
    		],
    		[
    			-40,
    			163
    		],
    		[
    			-56,
    			128
    		],
    		[
    			-76,
    			146
    		],
    		[
    			12,
    			22
    		],
    		[
    			-43,
    			88
    		],
    		[
    			28,
    			18
    		]
    	],
    	[
    		[
    			22633,
    			13438
    		],
    		[
    			16,
    			-62
    		],
    		[
    			63,
    			-114
    		],
    		[
    			66,
    			-37
    		],
    		[
    			59,
    			-10
    		],
    		[
    			21,
    			-20
    		],
    		[
    			55,
    			-129
    		],
    		[
    			48,
    			-37
    		],
    		[
    			1,
    			-52
    		],
    		[
    			-48,
    			-137
    		],
    		[
    			-43,
    			-58
    		],
    		[
    			-39,
    			-119
    		],
    		[
    			-36,
    			34
    		],
    		[
    			-24,
    			-60
    		],
    		[
    			-11,
    			-113
    		],
    		[
    			10,
    			-91
    		],
    		[
    			-52,
    			-9
    		],
    		[
    			-58,
    			-53
    		],
    		[
    			-10,
    			-79
    		],
    		[
    			-20,
    			-35
    		],
    		[
    			-88,
    			-17
    		],
    		[
    			-19,
    			-48
    		],
    		[
    			-4,
    			-66
    		],
    		[
    			-27,
    			-29
    		],
    		[
    			-55,
    			11
    		],
    		[
    			-63,
    			-41
    		],
    		[
    			-54,
    			-22
    		]
    	],
    	[
    		[
    			22321,
    			12045
    		],
    		[
    			-106,
    			393
    		]
    	],
    	[
    		[
    			22215,
    			12438
    		],
    		[
    			144,
    			85
    		],
    		[
    			143,
    			82
    		],
    		[
    			64,
    			335
    		],
    		[
    			-44,
    			118
    		]
    	],
    	[
    		[
    			22605,
    			13617
    		],
    		[
    			34,
    			-19
    		],
    		[
    			-16,
    			-52
    		]
    	],
    	[
    		[
    			23777,
    			13261
    		],
    		[
    			-64,
    			-21
    		],
    		[
    			-33,
    			87
    		],
    		[
    			12,
    			64
    		],
    		[
    			-71,
    			33
    		],
    		[
    			5,
    			50
    		],
    		[
    			-22,
    			67
    		],
    		[
    			-83,
    			-41
    		],
    		[
    			-85,
    			-5
    		],
    		[
    			-11,
    			-18
    		],
    		[
    			-92,
    			29
    		],
    		[
    			-19,
    			-31
    		],
    		[
    			-95,
    			9
    		],
    		[
    			-37,
    			-26
    		],
    		[
    			-47,
    			16
    		]
    	],
    	[
    		[
    			9777,
    			10467
    		],
    		[
    			-51,
    			124
    		],
    		[
    			17,
    			28
    		],
    		[
    			-26,
    			83
    		],
    		[
    			-59,
    			62
    		],
    		[
    			-33,
    			1
    		],
    		[
    			-24,
    			-27
    		],
    		[
    			-22,
    			-64
    		],
    		[
    			-50,
    			-43
    		],
    		[
    			3,
    			-29
    		],
    		[
    			44,
    			-87
    		],
    		[
    			-43,
    			-46
    		],
    		[
    			-41,
    			-7
    		],
    		[
    			-4,
    			39
    		],
    		[
    			-58,
    			47
    		],
    		[
    			-19,
    			56
    		],
    		[
    			-64,
    			49
    		],
    		[
    			-45,
    			-10
    		],
    		[
    			-5,
    			-41
    		]
    	],
    	[
    		[
    			9330,
    			10859
    		],
    		[
    			20,
    			-31
    		],
    		[
    			9,
    			-63
    		],
    		[
    			47,
    			-5
    		],
    		[
    			25,
    			-31
    		],
    		[
    			65,
    			16
    		],
    		[
    			18,
    			28
    		],
    		[
    			52,
    			30
    		],
    		[
    			44,
    			64
    		],
    		[
    			69,
    			-32
    		],
    		[
    			34,
    			3
    		],
    		[
    			50,
    			-36
    		],
    		[
    			38,
    			-69
    		],
    		[
    			26,
    			-24
    		]
    	],
    	[
    		[
    			4951,
    			5186
    		],
    		[
    			0,
    			-14
    		],
    		[
    			-4,
    			2
    		],
    		[
    			-1,
    			8
    		],
    		[
    			5,
    			4
    		]
    	],
    	[
    		[
    			10497,
    			6186
    		],
    		[
    			-93,
    			118
    		],
    		[
    			-13,
    			59
    		],
    		[
    			-31,
    			18
    		],
    		[
    			-62,
    			80
    		],
    		[
    			-31,
    			13
    		],
    		[
    			-231,
    			211
    		],
    		[
    			-32,
    			77
    		],
    		[
    			-38,
    			41
    		],
    		[
    			-35,
    			88
    		],
    		[
    			9,
    			116
    		],
    		[
    			-91,
    			228
    		],
    		[
    			-15,
    			93
    		],
    		[
    			-32,
    			35
    		],
    		[
    			-4,
    			62
    		],
    		[
    			-37,
    			101
    		],
    		[
    			-43,
    			194
    		],
    		[
    			-14,
    			24
    		],
    		[
    			-32,
    			137
    		],
    		[
    			-45,
    			86
    		],
    		[
    			-21,
    			99
    		],
    		[
    			-29,
    			63
    		],
    		[
    			-106,
    			111
    		],
    		[
    			19,
    			95
    		],
    		[
    			-29,
    			49
    		],
    		[
    			11,
    			40
    		],
    		[
    			-24,
    			50
    		],
    		[
    			8,
    			71
    		],
    		[
    			71,
    			125
    		],
    		[
    			27,
    			12
    		]
    	],
    	[
    		[
    			29250,
    			10898
    		],
    		[
    			80,
    			-142
    		],
    		[
    			13,
    			-124
    		],
    		[
    			-6,
    			-64
    		],
    		[
    			21,
    			-53
    		],
    		[
    			-15,
    			-83
    		],
    		[
    			-36,
    			-27
    		],
    		[
    			-24,
    			85
    		],
    		[
    			-41,
    			-94
    		],
    		[
    			30,
    			-98
    		],
    		[
    			-4,
    			-49
    		],
    		[
    			-24,
    			-59
    		],
    		[
    			-23,
    			38
    		],
    		[
    			-82,
    			54
    		],
    		[
    			-27,
    			50
    		],
    		[
    			-7,
    			82
    		],
    		[
    			25,
    			83
    		],
    		[
    			-20,
    			40
    		],
    		[
    			-45,
    			35
    		],
    		[
    			-19,
    			-51
    		],
    		[
    			-74,
    			33
    		],
    		[
    			-20,
    			-45
    		],
    		[
    			-24,
    			-99
    		],
    		[
    			-18,
    			51
    		],
    		[
    			32,
    			133
    		],
    		[
    			54,
    			23
    		],
    		[
    			23,
    			66
    		],
    		[
    			61,
    			20
    		],
    		[
    			17,
    			-78
    		],
    		[
    			34,
    			8
    		],
    		[
    			21,
    			68
    		],
    		[
    			25,
    			-25
    		],
    		[
    			16,
    			89
    		],
    		[
    			27,
    			-26
    		],
    		[
    			35,
    			27
    		],
    		[
    			-13,
    			108
    		],
    		[
    			8,
    			24
    		]
    	],
    	[
    		[
    			29138,
    			10959
    		],
    		[
    			29,
    			-61
    		],
    		[
    			-32,
    			-33
    		],
    		[
    			-47,
    			31
    		],
    		[
    			50,
    			63
    		]
    	],
    	[
    		[
    			29034,
    			11098
    		],
    		[
    			33,
    			-37
    		],
    		[
    			-41,
    			-158
    		],
    		[
    			-1,
    			-48
    		],
    		[
    			18,
    			-38
    		],
    		[
    			-12,
    			-38
    		],
    		[
    			-55,
    			56
    		],
    		[
    			-19,
    			47
    		],
    		[
    			4,
    			45
    		],
    		[
    			39,
    			20
    		],
    		[
    			-5,
    			69
    		],
    		[
    			13,
    			57
    		],
    		[
    			26,
    			25
    		]
    	],
    	[
    		[
    			29115,
    			11146
    		],
    		[
    			-4,
    			-150
    		],
    		[
    			-36,
    			-50
    		],
    		[
    			-23,
    			-8
    		],
    		[
    			63,
    			208
    		]
    	],
    	[
    		[
    			28676,
    			11170
    		],
    		[
    			3,
    			-100
    		],
    		[
    			20,
    			-52
    		],
    		[
    			-41,
    			-40
    		],
    		[
    			-13,
    			-42
    		],
    		[
    			-37,
    			-15
    		],
    		[
    			-2,
    			-46
    		],
    		[
    			-36,
    			-75
    		],
    		[
    			-84,
    			-119
    		],
    		[
    			-13,
    			40
    		],
    		[
    			41,
    			72
    		],
    		[
    			19,
    			11
    		],
    		[
    			63,
    			126
    		],
    		[
    			65,
    			106
    		],
    		[
    			1,
    			68
    		],
    		[
    			14,
    			66
    		]
    	],
    	[
    		[
    			29217,
    			10959
    		],
    		[
    			-36,
    			1
    		],
    		[
    			5,
    			82
    		],
    		[
    			-12,
    			45
    		],
    		[
    			-27,
    			7
    		],
    		[
    			-1,
    			45
    		],
    		[
    			51,
    			28
    		],
    		[
    			9,
    			-111
    		],
    		[
    			17,
    			-28
    		],
    		[
    			-6,
    			-69
    		]
    	],
    	[
    		[
    			28916,
    			11252
    		],
    		[
    			62,
    			-66
    		],
    		[
    			47,
    			8
    		],
    		[
    			-3,
    			-69
    		],
    		[
    			-49,
    			-78
    		],
    		[
    			-47,
    			-19
    		],
    		[
    			-16,
    			31
    		],
    		[
    			12,
    			45
    		],
    		[
    			5,
    			104
    		],
    		[
    			-11,
    			44
    		]
    	],
    	[
    		[
    			29201,
    			11361
    		],
    		[
    			53,
    			-64
    		],
    		[
    			-4,
    			-108
    		],
    		[
    			15,
    			-30
    		],
    		[
    			-21,
    			-46
    		],
    		[
    			-42,
    			38
    		],
    		[
    			-6,
    			72
    		],
    		[
    			-49,
    			74
    		],
    		[
    			-13,
    			64
    		],
    		[
    			67,
    			0
    		]
    	],
    	[
    		[
    			28769,
    			11521
    		],
    		[
    			72,
    			-17
    		],
    		[
    			22,
    			-44
    		],
    		[
    			-4,
    			-146
    		],
    		[
    			-26,
    			-8
    		],
    		[
    			-34,
    			129
    		],
    		[
    			-27,
    			47
    		],
    		[
    			-3,
    			39
    		]
    	],
    	[
    		[
    			28807,
    			12379
    		],
    		[
    			28,
    			-3
    		],
    		[
    			47,
    			-45
    		],
    		[
    			35,
    			-14
    		],
    		[
    			17,
    			-33
    		],
    		[
    			7,
    			-120
    		],
    		[
    			25,
    			-55
    		],
    		[
    			-32,
    			-137
    		],
    		[
    			-59,
    			-54
    		],
    		[
    			6,
    			-40
    		],
    		[
    			-24,
    			-57
    		],
    		[
    			22,
    			-81
    		],
    		[
    			14,
    			-113
    		],
    		[
    			44,
    			-42
    		],
    		[
    			29,
    			73
    		],
    		[
    			34,
    			-13
    		],
    		[
    			18,
    			-84
    		],
    		[
    			54,
    			22
    		],
    		[
    			21,
    			-177
    		],
    		[
    			-49,
    			29
    		],
    		[
    			-13,
    			70
    		],
    		[
    			-34,
    			51
    		],
    		[
    			-37,
    			29
    		],
    		[
    			-33,
    			-22
    		],
    		[
    			-37,
    			33
    		],
    		[
    			-41,
    			-63
    		],
    		[
    			-52,
    			57
    		],
    		[
    			-15,
    			47
    		],
    		[
    			39,
    			52
    		],
    		[
    			-14,
    			38
    		],
    		[
    			-30,
    			8
    		],
    		[
    			-14,
    			-37
    		],
    		[
    			-29,
    			34
    		],
    		[
    			-18,
    			104
    		],
    		[
    			-11,
    			153
    		],
    		[
    			43,
    			-48
    		],
    		[
    			11,
    			43
    		],
    		[
    			-2,
    			85
    		],
    		[
    			11,
    			28
    		],
    		[
    			0,
    			129
    		],
    		[
    			12,
    			126
    		],
    		[
    			27,
    			27
    		]
    	],
    	[
    		[
    			30129,
    			10533
    		],
    		[
    			-1,
    			-22
    		],
    		[
    			-10,
    			-25
    		],
    		[
    			-6,
    			18
    		],
    		[
    			6,
    			26
    		],
    		[
    			11,
    			3
    		]
    	],
    	[
    		[
    			32059,
    			8338
    		],
    		[
    			21,
    			-7
    		],
    		[
    			16,
    			-56
    		],
    		[
    			69,
    			-108
    		],
    		[
    			3,
    			-41
    		],
    		[
    			-42,
    			-14
    		],
    		[
    			-33,
    			50
    		],
    		[
    			-41,
    			100
    		],
    		[
    			7,
    			76
    		]
    	],
    	[
    		[
    			31809,
    			8554
    		],
    		[
    			17,
    			-69
    		],
    		[
    			-25,
    			-116
    		],
    		[
    			-30,
    			-47
    		],
    		[
    			-57,
    			-58
    		],
    		[
    			-41,
    			-16
    		],
    		[
    			-31,
    			-37
    		],
    		[
    			-82,
    			-6
    		],
    		[
    			-25,
    			39
    		],
    		[
    			-26,
    			-14
    		],
    		[
    			-31,
    			46
    		],
    		[
    			-16,
    			55
    		],
    		[
    			151,
    			-3
    		],
    		[
    			25,
    			20
    		],
    		[
    			46,
    			-8
    		],
    		[
    			44,
    			95
    		],
    		[
    			31,
    			6
    		],
    		[
    			-18,
    			111
    		],
    		[
    			68,
    			2
    		]
    	],
    	[
    		[
    			30737,
    			8821
    		],
    		[
    			19,
    			-5
    		],
    		[
    			65,
    			-57
    		],
    		[
    			63,
    			-43
    		],
    		[
    			93,
    			-35
    		],
    		[
    			47,
    			-59
    		],
    		[
    			51,
    			-4
    		],
    		[
    			46,
    			-86
    		],
    		[
    			29,
    			-8
    		],
    		[
    			47,
    			-81
    		],
    		[
    			-7,
    			-93
    		],
    		[
    			68,
    			-30
    		],
    		[
    			53,
    			-56
    		],
    		[
    			55,
    			-20
    		],
    		[
    			27,
    			-62
    		],
    		[
    			-10,
    			-47
    		],
    		[
    			-76,
    			-7
    		],
    		[
    			18,
    			-106
    		],
    		[
    			31,
    			-35
    		],
    		[
    			22,
    			-56
    		],
    		[
    			41,
    			-23
    		],
    		[
    			12,
    			-90
    		],
    		[
    			26,
    			-67
    		],
    		[
    			23,
    			-19
    		],
    		[
    			47,
    			19
    		],
    		[
    			-7,
    			-61
    		],
    		[
    			72,
    			-117
    		],
    		[
    			56,
    			-28
    		],
    		[
    			13,
    			-41
    		],
    		[
    			-25,
    			-36
    		],
    		[
    			-34,
    			10
    		],
    		[
    			-31,
    			48
    		],
    		[
    			-96,
    			28
    		],
    		[
    			-35,
    			0
    		],
    		[
    			-68,
    			31
    		],
    		[
    			-32,
    			78
    		],
    		[
    			-63,
    			83
    		],
    		[
    			-38,
    			126
    		],
    		[
    			-45,
    			57
    		],
    		[
    			-33,
    			-2
    		],
    		[
    			-62,
    			44
    		],
    		[
    			-47,
    			8
    		],
    		[
    			-65,
    			-90
    		],
    		[
    			-62,
    			-28
    		],
    		[
    			41,
    			-67
    		],
    		[
    			3,
    			-37
    		],
    		[
    			-75,
    			-62
    		],
    		[
    			-41,
    			31
    		],
    		[
    			-56,
    			-11
    		],
    		[
    			-59,
    			14
    		]
    	],
    	[
    		[
    			31679,
    			8820
    		],
    		[
    			110,
    			-103
    		],
    		[
    			91,
    			-129
    		],
    		[
    			16,
    			-64
    		],
    		[
    			-21,
    			-69
    		],
    		[
    			-23,
    			56
    		],
    		[
    			3,
    			45
    		],
    		[
    			-32,
    			91
    		],
    		[
    			-42,
    			36
    		],
    		[
    			-102,
    			137
    		]
    	],
    	[
    		[
    			19116,
    			18373
    		],
    		[
    			2,
    			-1
    		],
    		[
    			12,
    			-4
    		]
    	],
    	[
    		[
    			19130,
    			18368
    		],
    		[
    			162,
    			-19
    		],
    		[
    			126,
    			8
    		]
    	],
    	[
    		[
    			19498,
    			17876
    		],
    		[
    			42,
    			-100
    		],
    		[
    			-2,
    			-76
    		],
    		[
    			-31,
    			-9
    		],
    		[
    			-101,
    			-145
    		],
    		[
    			-9,
    			-73
    		]
    	],
    	[
    		[
    			19397,
    			17473
    		],
    		[
    			-89,
    			60
    		],
    		[
    			-125,
    			-7
    		],
    		[
    			-47,
    			-36
    		],
    		[
    			-30,
    			64
    		],
    		[
    			-66,
    			-8
    		]
    	],
    	[
    		[
    			18602,
    			18245
    		],
    		[
    			51,
    			56
    		],
    		[
    			115,
    			37
    		],
    		[
    			44,
    			42
    		],
    		[
    			78,
    			39
    		],
    		[
    			99,
    			17
    		],
    		[
    			25,
    			-66
    		],
    		[
    			63,
    			-15
    		],
    		[
    			39,
    			18
    		]
    	],
    	[
    		[
    			10812,
    			12357
    		],
    		[
    			114,
    			-11
    		],
    		[
    			22,
    			-14
    		],
    		[
    			-25,
    			-66
    		],
    		[
    			-123,
    			-3
    		],
    		[
    			12,
    			94
    		]
    	],
    	[
    		[
    			29744,
    			16356
    		],
    		[
    			4,
    			-22
    		]
    	],
    	[
    		[
    			29748,
    			16334
    		],
    		[
    			-26,
    			8
    		],
    		[
    			-49,
    			-71
    		],
    		[
    			-23,
    			-60
    		],
    		[
    			14,
    			-30
    		],
    		[
    			-6,
    			-86
    		],
    		[
    			-49,
    			-26
    		],
    		[
    			-12,
    			-34
    		],
    		[
    			-45,
    			-32
    		],
    		[
    			-29,
    			-51
    		],
    		[
    			-35,
    			1
    		],
    		[
    			-40,
    			-39
    		],
    		[
    			-9,
    			-104
    		],
    		[
    			28,
    			-4
    		],
    		[
    			59,
    			-86
    		]
    	],
    	[
    		[
    			29364,
    			15590
    		],
    		[
    			-31,
    			7
    		],
    		[
    			-105,
    			-10
    		],
    		[
    			-34,
    			51
    		],
    		[
    			-3,
    			37
    		],
    		[
    			54,
    			162
    		],
    		[
    			-23,
    			47
    		],
    		[
    			-58,
    			21
    		],
    		[
    			-21,
    			47
    		]
    	],
    	[
    		[
    			16522,
    			15519
    		],
    		[
    			5,
    			-39
    		],
    		[
    			-37,
    			-27
    		],
    		[
    			-80,
    			18
    		],
    		[
    			-16,
    			68
    		],
    		[
    			2,
    			112
    		],
    		[
    			-12,
    			53
    		],
    		[
    			-57,
    			32
    		],
    		[
    			12,
    			107
    		],
    		[
    			26,
    			35
    		],
    		[
    			23,
    			99
    		],
    		[
    			20,
    			145
    		],
    		[
    			-15,
    			150
    		]
    	],
    	[
    		[
    			14769,
    			15600
    		],
    		[
    			8,
    			-10
    		],
    		[
    			50,
    			2
    		],
    		[
    			-22,
    			-23
    		],
    		[
    			-29,
    			3
    		],
    		[
    			-7,
    			28
    		]
    	],
    	[
    		[
    			2923,
    			6328
    		],
    		[
    			16,
    			-36
    		],
    		[
    			-26,
    			-4
    		],
    		[
    			10,
    			40
    		]
    	],
    	[
    		[
    			22148,
    			13359
    		],
    		[
    			-36,
    			7
    		],
    		[
    			-11,
    			32
    		]
    	],
    	[
    		[
    			22101,
    			13398
    		],
    		[
    			-5,
    			127
    		],
    		[
    			28,
    			90
    		],
    		[
    			18,
    			20
    		],
    		[
    			33,
    			-41
    		],
    		[
    			-10,
    			-68
    		],
    		[
    			15,
    			-82
    		],
    		[
    			-32,
    			-85
    		]
    	],
    	[
    		[
    			22545,
    			5767
    		],
    		[
    			37,
    			-46
    		],
    		[
    			-3,
    			-36
    		],
    		[
    			-45,
    			13
    		],
    		[
    			11,
    			69
    		]
    	],
    	[
    		[
    			19937,
    			16868
    		],
    		[
    			13,
    			-25
    		],
    		[
    			104,
    			20
    		],
    		[
    			23,
    			-38
    		]
    	],
    	[
    		[
    			20077,
    			16825
    		],
    		[
    			-11,
    			-64
    		],
    		[
    			-50,
    			-18
    		],
    		[
    			-39,
    			-69
    		],
    		[
    			-4,
    			-96
    		]
    	],
    	[
    		[
    			19407,
    			16658
    		],
    		[
    			-20,
    			38
    		],
    		[
    			-80,
    			36
    		],
    		[
    			-25,
    			35
    		],
    		[
    			10,
    			54
    		],
    		[
    			-51,
    			30
    		],
    		[
    			-14,
    			62
    		],
    		[
    			-51,
    			63
    		]
    	],
    	[
    		[
    			19429,
    			17284
    		],
    		[
    			21,
    			22
    		],
    		[
    			106,
    			-31
    		],
    		[
    			38,
    			7
    		],
    		[
    			27,
    			-37
    		],
    		[
    			40,
    			33
    		],
    		[
    			83,
    			13
    		],
    		[
    			41,
    			42
    		]
    	],
    	[
    		[
    			30906,
    			18351
    		],
    		[
    			11,
    			-74
    		],
    		[
    			36,
    			-121
    		],
    		[
    			5,
    			-95
    		],
    		[
    			-19,
    			-40
    		],
    		[
    			3,
    			-81
    		],
    		[
    			36,
    			-109
    		],
    		[
    			25,
    			-152
    		],
    		[
    			48,
    			-179
    		],
    		[
    			-92,
    			8
    		],
    		[
    			-34,
    			-32
    		],
    		[
    			-40,
    			-173
    		],
    		[
    			2,
    			-66
    		],
    		[
    			43,
    			-71
    		],
    		[
    			13,
    			-109
    		],
    		[
    			-67,
    			8
    		],
    		[
    			-25,
    			-102
    		],
    		[
    			-26,
    			1
    		],
    		[
    			-9,
    			72
    		],
    		[
    			21,
    			99
    		],
    		[
    			-8,
    			92
    		],
    		[
    			22,
    			55
    		],
    		[
    			-5,
    			64
    		],
    		[
    			-26,
    			58
    		],
    		[
    			21,
    			91
    		],
    		[
    			5,
    			192
    		],
    		[
    			-10,
    			31
    		],
    		[
    			20,
    			100
    		],
    		[
    			-46,
    			93
    		],
    		[
    			-14,
    			103
    		],
    		[
    			29,
    			123
    		],
    		[
    			-16,
    			52
    		],
    		[
    			67,
    			1
    		],
    		[
    			30,
    			161
    		]
    	],
    	[
    		[
    			19130,
    			18368
    		],
    		[
    			45,
    			31
    		],
    		[
    			19,
    			57
    		],
    		[
    			47,
    			53
    		],
    		[
    			4,
    			-1
    		],
    		[
    			28,
    			-4
    		]
    	],
    	[
    		[
    			31,
    			20789
    		],
    		[
    			19,
    			3
    		],
    		[
    			198,
    			-112
    		],
    		[
    			206,
    			-100
    		],
    		[
    			35,
    			-39
    		],
    		[
    			8,
    			-138
    		],
    		[
    			92,
    			-14
    		],
    		[
    			-23,
    			97
    		],
    		[
    			230,
    			-23
    		],
    		[
    			32,
    			-47
    		],
    		[
    			110,
    			-65
    		],
    		[
    			-29,
    			-105
    		],
    		[
    			-157,
    			-21
    		],
    		[
    			3,
    			-81
    		],
    		[
    			-71,
    			-64
    		],
    		[
    			56,
    			-40
    		],
    		[
    			-86,
    			-29
    		],
    		[
    			-256,
    			123
    		],
    		[
    			-6,
    			72
    		],
    		[
    			-92,
    			30
    		],
    		[
    			-133,
    			-25
    		],
    		[
    			-58,
    			77
    		],
    		[
    			-77,
    			-130
    		],
    		[
    			-32,
    			-17
    		],
    		[
    			0,
    			662
    		],
    		[
    			31,
    			-14
    		]
    	],
    	[
    		[
    			21997,
    			20869
    		],
    		[
    			55,
    			-42
    		],
    		[
    			-61,
    			-45
    		],
    		[
    			-103,
    			-23
    		],
    		[
    			-35,
    			24
    		],
    		[
    			43,
    			98
    		],
    		[
    			101,
    			-12
    		]
    	],
    	[
    		[
    			33358,
    			20976
    		],
    		[
    			100,
    			-26
    		],
    		[
    			-20,
    			-51
    		],
    		[
    			-132,
    			39
    		],
    		[
    			52,
    			38
    		]
    	],
    	[
    		[
    			22892,
    			21051
    		],
    		[
    			131,
    			-89
    		],
    		[
    			-157,
    			6
    		],
    		[
    			-34,
    			42
    		],
    		[
    			60,
    			41
    		]
    	],
    	[
    		[
    			34470,
    			21228
    		],
    		[
    			1,
    			1
    		],
    		[
    			0,
    			-93
    		],
    		[
    			-112,
    			-30
    		],
    		[
    			-21,
    			47
    		],
    		[
    			132,
    			75
    		]
    	],
    	[
    		[
    			87,
    			21239
    		],
    		[
    			73,
    			-10
    		],
    		[
    			83,
    			-52
    		],
    		[
    			-44,
    			-32
    		],
    		[
    			-150,
    			-23
    		],
    		[
    			-49,
    			14
    		],
    		[
    			0,
    			93
    		],
    		[
    			87,
    			10
    		]
    	],
    	[
    		[
    			22521,
    			21538
    		],
    		[
    			129,
    			-45
    		],
    		[
    			-117,
    			-137
    		],
    		[
    			24,
    			-97
    		],
    		[
    			60,
    			-87
    		],
    		[
    			132,
    			-79
    		],
    		[
    			-232,
    			-28
    		],
    		[
    			-143,
    			44
    		],
    		[
    			-8,
    			63
    		],
    		[
    			-54,
    			40
    		],
    		[
    			-134,
    			19
    		],
    		[
    			-5,
    			86
    		],
    		[
    			110,
    			40
    		],
    		[
    			43,
    			140
    		],
    		[
    			195,
    			41
    		]
    	],
    	[
    		[
    			30861,
    			21620
    		],
    		[
    			125,
    			-71
    		],
    		[
    			-32,
    			-43
    		],
    		[
    			-157,
    			19
    		],
    		[
    			-97,
    			36
    		],
    		[
    			27,
    			39
    		],
    		[
    			134,
    			20
    		]
    	],
    	[
    		[
    			28007,
    			21731
    		],
    		[
    			93,
    			-25
    		],
    		[
    			-61,
    			-50
    		],
    		[
    			-114,
    			28
    		],
    		[
    			82,
    			47
    		]
    	],
    	[
    		[
    			31314,
    			21864
    		],
    		[
    			58,
    			20
    		],
    		[
    			253,
    			-43
    		],
    		[
    			37,
    			-53
    		],
    		[
    			-137,
    			-23
    		],
    		[
    			-96,
    			8
    		],
    		[
    			-197,
    			73
    		],
    		[
    			82,
    			18
    		]
    	],
    	[
    		[
    			30554,
    			21999
    		],
    		[
    			103,
    			-54
    		],
    		[
    			157,
    			51
    		],
    		[
    			79,
    			-42
    		],
    		[
    			137,
    			-9
    		],
    		[
    			104,
    			-35
    		],
    		[
    			-39,
    			-75
    		],
    		[
    			-221,
    			-57
    		],
    		[
    			-78,
    			22
    		],
    		[
    			-243,
    			-50
    		],
    		[
    			-84,
    			20
    		],
    		[
    			-118,
    			82
    		],
    		[
    			47,
    			113
    		],
    		[
    			156,
    			34
    		]
    	],
    	[
    		[
    			23728,
    			22144
    		],
    		[
    			114,
    			-54
    		],
    		[
    			-85,
    			-71
    		],
    		[
    			-101,
    			-30
    		],
    		[
    			-483,
    			-105
    		],
    		[
    			-106,
    			-48
    		],
    		[
    			-32,
    			-51
    		],
    		[
    			-181,
    			-96
    		],
    		[
    			-75,
    			-84
    		],
    		[
    			-110,
    			-91
    		],
    		[
    			-129,
    			16
    		],
    		[
    			-142,
    			74
    		],
    		[
    			169,
    			92
    		],
    		[
    			68,
    			65
    		],
    		[
    			64,
    			112
    		],
    		[
    			174,
    			80
    		],
    		[
    			88,
    			12
    		],
    		[
    			121,
    			56
    		],
    		[
    			196,
    			-7
    		],
    		[
    			149,
    			24
    		],
    		[
    			169,
    			78
    		],
    		[
    			132,
    			28
    		]
    	],
    	[
    		[
    			21067,
    			16518
    		],
    		[
    			-117,
    			150
    		],
    		[
    			-54,
    			22
    		],
    		[
    			-36,
    			49
    		],
    		[
    			-45,
    			10
    		],
    		[
    			-16,
    			40
    		],
    		[
    			-56,
    			23
    		],
    		[
    			28,
    			48
    		],
    		[
    			62,
    			-3
    		],
    		[
    			2,
    			39
    		],
    		[
    			67,
    			104
    		],
    		[
    			-37,
    			62
    		],
    		[
    			135,
    			72
    		],
    		[
    			-43,
    			19
    		],
    		[
    			-61,
    			-10
    		]
    	],
    	[
    		[
    			20896,
    			17143
    		],
    		[
    			14,
    			83
    		],
    		[
    			45,
    			41
    		],
    		[
    			87,
    			-4
    		],
    		[
    			25,
    			73
    		],
    		[
    			-32,
    			54
    		],
    		[
    			50,
    			114
    		],
    		[
    			-57,
    			78
    		],
    		[
    			-63,
    			12
    		],
    		[
    			-32,
    			29
    		],
    		[
    			-54,
    			-10
    		],
    		[
    			-68,
    			84
    		],
    		[
    			-66,
    			-31
    		],
    		[
    			-54,
    			36
    		],
    		[
    			-45,
    			-13
    		],
    		[
    			-29,
    			116
    		],
    		[
    			-56,
    			18
    		],
    		[
    			-49,
    			38
    		],
    		[
    			4,
    			75
    		],
    		[
    			-43,
    			85
    		],
    		[
    			-61,
    			0
    		],
    		[
    			-80,
    			-40
    		],
    		[
    			-52,
    			-2
    		]
    	],
    	[
    		[
    			19921,
    			19211
    		],
    		[
    			90,
    			58
    		],
    		[
    			5,
    			61
    		],
    		[
    			-118,
    			62
    		]
    	],
    	[
    		[
    			20188,
    			20937
    		],
    		[
    			82,
    			-12
    		],
    		[
    			48,
    			35
    		],
    		[
    			88,
    			-33
    		],
    		[
    			-46,
    			-45
    		],
    		[
    			90,
    			-27
    		],
    		[
    			214,
    			-19
    		],
    		[
    			84,
    			-33
    		],
    		[
    			276,
    			-158
    		],
    		[
    			141,
    			-69
    		],
    		[
    			29,
    			-72
    		],
    		[
    			-14,
    			-63
    		],
    		[
    			-64,
    			-64
    		],
    		[
    			-136,
    			-58
    		],
    		[
    			-79,
    			-7
    		],
    		[
    			-111,
    			32
    		],
    		[
    			-153,
    			24
    		],
    		[
    			-66,
    			36
    		],
    		[
    			-135,
    			24
    		],
    		[
    			-38,
    			-26
    		],
    		[
    			159,
    			-112
    		],
    		[
    			9,
    			-197
    		],
    		[
    			34,
    			-65
    		],
    		[
    			54,
    			2
    		],
    		[
    			92,
    			-76
    		],
    		[
    			91,
    			-16
    		],
    		[
    			45,
    			31
    		],
    		[
    			-29,
    			74
    		],
    		[
    			-64,
    			-5
    		],
    		[
    			-54,
    			81
    		],
    		[
    			46,
    			45
    		],
    		[
    			97,
    			-52
    		],
    		[
    			237,
    			-55
    		],
    		[
    			-12,
    			67
    		],
    		[
    			-64,
    			69
    		],
    		[
    			16,
    			50
    		],
    		[
    			87,
    			60
    		],
    		[
    			67,
    			19
    		],
    		[
    			78,
    			67
    		],
    		[
    			83,
    			-16
    		],
    		[
    			75,
    			-53
    		],
    		[
    			50,
    			95
    		],
    		[
    			-8,
    			54
    		],
    		[
    			-61,
    			34
    		],
    		[
    			39,
    			94
    		],
    		[
    			5,
    			88
    		],
    		[
    			-65,
    			41
    		],
    		[
    			185,
    			-3
    		],
    		[
    			98,
    			-61
    		],
    		[
    			17,
    			-55
    		],
    		[
    			-129,
    			-20
    		],
    		[
    			-40,
    			-62
    		],
    		[
    			63,
    			-26
    		],
    		[
    			45,
    			-57
    		],
    		[
    			98,
    			5
    		],
    		[
    			65,
    			26
    		],
    		[
    			26,
    			105
    		],
    		[
    			43,
    			0
    		],
    		[
    			224,
    			122
    		],
    		[
    			47,
    			3
    		],
    		[
    			198,
    			83
    		],
    		[
    			62,
    			-9
    		],
    		[
    			-31,
    			-97
    		],
    		[
    			101,
    			-16
    		],
    		[
    			26,
    			46
    		],
    		[
    			89,
    			35
    		],
    		[
    			131,
    			-18
    		],
    		[
    			41,
    			40
    		],
    		[
    			100,
    			33
    		],
    		[
    			60,
    			-26
    		],
    		[
    			-23,
    			-71
    		],
    		[
    			75,
    			10
    		],
    		[
    			94,
    			81
    		],
    		[
    			-72,
    			104
    		],
    		[
    			64,
    			52
    		],
    		[
    			206,
    			-27
    		],
    		[
    			133,
    			-37
    		],
    		[
    			86,
    			-48
    		],
    		[
    			170,
    			-68
    		],
    		[
    			139,
    			-90
    		],
    		[
    			59,
    			96
    		],
    		[
    			-62,
    			24
    		],
    		[
    			-42,
    			85
    		],
    		[
    			-95,
    			36
    		],
    		[
    			-16,
    			45
    		],
    		[
    			47,
    			119
    		],
    		[
    			-40,
    			100
    		],
    		[
    			125,
    			63
    		],
    		[
    			64,
    			170
    		],
    		[
    			63,
    			32
    		],
    		[
    			188,
    			6
    		],
    		[
    			103,
    			-26
    		],
    		[
    			18,
    			-78
    		],
    		[
    			-46,
    			-93
    		],
    		[
    			-48,
    			-37
    		],
    		[
    			95,
    			-103
    		],
    		[
    			-6,
    			-81
    		],
    		[
    			-34,
    			-22
    		],
    		[
    			26,
    			-83
    		],
    		[
    			-19,
    			-112
    		],
    		[
    			95,
    			-86
    		],
    		[
    			-33,
    			-56
    		],
    		[
    			-1,
    			-86
    		],
    		[
    			-49,
    			-25
    		],
    		[
    			-78,
    			-111
    		],
    		[
    			-255,
    			-50
    		],
    		[
    			121,
    			-49
    		],
    		[
    			162,
    			-17
    		],
    		[
    			38,
    			60
    		],
    		[
    			127,
    			65
    		],
    		[
    			28,
    			74
    		],
    		[
    			58,
    			41
    		],
    		[
    			9,
    			60
    		],
    		[
    			-47,
    			59
    		],
    		[
    			29,
    			67
    		],
    		[
    			151,
    			38
    		],
    		[
    			105,
    			-82
    		],
    		[
    			35,
    			64
    		],
    		[
    			-147,
    			59
    		],
    		[
    			-213,
    			-24
    		],
    		[
    			-25,
    			88
    		],
    		[
    			65,
    			157
    		],
    		[
    			-67,
    			103
    		],
    		[
    			-60,
    			37
    		],
    		[
    			54,
    			68
    		],
    		[
    			138,
    			62
    		],
    		[
    			87,
    			-163
    		],
    		[
    			180,
    			-15
    		],
    		[
    			-139,
    			76
    		],
    		[
    			-26,
    			56
    		],
    		[
    			80,
    			26
    		],
    		[
    			59,
    			-36
    		],
    		[
    			71,
    			19
    		],
    		[
    			-35,
    			60
    		],
    		[
    			152,
    			6
    		],
    		[
    			109,
    			-41
    		],
    		[
    			101,
    			-70
    		],
    		[
    			149,
    			5
    		],
    		[
    			-21,
    			-51
    		],
    		[
    			-66,
    			-22
    		],
    		[
    			10,
    			-88
    		],
    		[
    			-22,
    			-78
    		],
    		[
    			153,
    			29
    		],
    		[
    			-60,
    			130
    		],
    		[
    			47,
    			65
    		],
    		[
    			-93,
    			42
    		],
    		[
    			-39,
    			62
    		],
    		[
    			-129,
    			28
    		],
    		[
    			-3,
    			85
    		],
    		[
    			-51,
    			61
    		],
    		[
    			26,
    			45
    		],
    		[
    			438,
    			24
    		],
    		[
    			179,
    			45
    		],
    		[
    			-106,
    			55
    		],
    		[
    			66,
    			70
    		],
    		[
    			204,
    			109
    		],
    		[
    			184,
    			45
    		],
    		[
    			219,
    			27
    		],
    		[
    			23,
    			44
    		],
    		[
    			212,
    			18
    		],
    		[
    			127,
    			-47
    		],
    		[
    			417,
    			111
    		],
    		[
    			-17,
    			49
    		],
    		[
    			116,
    			87
    		],
    		[
    			186,
    			62
    		],
    		[
    			120,
    			-30
    		],
    		[
    			49,
    			-76
    		],
    		[
    			134,
    			-15
    		],
    		[
    			-60,
    			-89
    		],
    		[
    			195,
    			39
    		],
    		[
    			291,
    			-3
    		],
    		[
    			152,
    			-73
    		],
    		[
    			58,
    			-72
    		],
    		[
    			-23,
    			-86
    		],
    		[
    			-179,
    			-109
    		],
    		[
    			-187,
    			-57
    		],
    		[
    			-157,
    			-109
    		],
    		[
    			-110,
    			-19
    		],
    		[
    			-18,
    			-72
    		],
    		[
    			86,
    			4
    		],
    		[
    			189,
    			47
    		],
    		[
    			-12,
    			44
    		],
    		[
    			89,
    			51
    		],
    		[
    			286,
    			-83
    		],
    		[
    			171,
    			34
    		],
    		[
    			315,
    			-23
    		],
    		[
    			-8,
    			-64
    		],
    		[
    			112,
    			-30
    		],
    		[
    			347,
    			-14
    		],
    		[
    			31,
    			33
    		],
    		[
    			-26,
    			73
    		],
    		[
    			106,
    			33
    		],
    		[
    			120,
    			-53
    		],
    		[
    			207,
    			6
    		],
    		[
    			161,
    			-89
    		],
    		[
    			-26,
    			-37
    		],
    		[
    			21,
    			-101
    		],
    		[
    			-98,
    			-26
    		],
    		[
    			93,
    			-111
    		],
    		[
    			77,
    			-60
    		],
    		[
    			128,
    			-10
    		],
    		[
    			70,
    			141
    		],
    		[
    			192,
    			-60
    		],
    		[
    			125,
    			44
    		],
    		[
    			219,
    			-44
    		],
    		[
    			87,
    			45
    		],
    		[
    			110,
    			-18
    		],
    		[
    			-28,
    			66
    		],
    		[
    			75,
    			92
    		],
    		[
    			119,
    			47
    		],
    		[
    			371,
    			-34
    		],
    		[
    			115,
    			-29
    		],
    		[
    			158,
    			-9
    		],
    		[
    			145,
    			-52
    		],
    		[
    			-4,
    			-56
    		],
    		[
    			165,
    			-64
    		],
    		[
    			87,
    			-79
    		],
    		[
    			126,
    			11
    		],
    		[
    			161,
    			30
    		],
    		[
    			129,
    			5
    		],
    		[
    			213,
    			-43
    		],
    		[
    			94,
    			-95
    		],
    		[
    			-40,
    			-66
    		],
    		[
    			184,
    			-80
    		],
    		[
    			57,
    			37
    		],
    		[
    			157,
    			11
    		],
    		[
    			100,
    			-21
    		],
    		[
    			198,
    			-14
    		],
    		[
    			75,
    			49
    		],
    		[
    			46,
    			-80
    		],
    		[
    			113,
    			-38
    		],
    		[
    			22,
    			-50
    		],
    		[
    			69,
    			8
    		],
    		[
    			67,
    			40
    		],
    		[
    			-46,
    			91
    		],
    		[
    			39,
    			83
    		],
    		[
    			177,
    			-31
    		],
    		[
    			218,
    			-11
    		],
    		[
    			97,
    			6
    		],
    		[
    			73,
    			-39
    		],
    		[
    			185,
    			-42
    		],
    		[
    			113,
    			-68
    		],
    		[
    			0,
    			-650
    		],
    		[
    			0,
    			-12
    		],
    		[
    			-45,
    			-38
    		],
    		[
    			-115,
    			-27
    		],
    		[
    			-158,
    			36
    		],
    		[
    			19,
    			-43
    		],
    		[
    			171,
    			-101
    		],
    		[
    			17,
    			-85
    		],
    		[
    			59,
    			-63
    		],
    		[
    			16,
    			-71
    		],
    		[
    			-43,
    			-63
    		],
    		[
    			-105,
    			36
    		],
    		[
    			-91,
    			1
    		],
    		[
    			-149,
    			-63
    		],
    		[
    			-92,
    			-55
    		],
    		[
    			-106,
    			-20
    		],
    		[
    			-105,
    			-117
    		],
    		[
    			-167,
    			-100
    		],
    		[
    			-22,
    			-74
    		],
    		[
    			-45,
    			17
    		],
    		[
    			-52,
    			75
    		],
    		[
    			-100,
    			14
    		],
    		[
    			-133,
    			-50
    		],
    		[
    			-68,
    			-81
    		],
    		[
    			-4,
    			109
    		],
    		[
    			-101,
    			-66
    		],
    		[
    			-125,
    			-12
    		],
    		[
    			-61,
    			-71
    		],
    		[
    			10,
    			-49
    		],
    		[
    			-32,
    			-58
    		],
    		[
    			-53,
    			-44
    		],
    		[
    			-43,
    			-111
    		],
    		[
    			49,
    			-40
    		],
    		[
    			75,
    			-7
    		],
    		[
    			-49,
    			-65
    		],
    		[
    			0,
    			-93
    		],
    		[
    			40,
    			-9
    		],
    		[
    			16,
    			-92
    		],
    		[
    			-30,
    			-27
    		],
    		[
    			-45,
    			35
    		],
    		[
    			-48,
    			-25
    		],
    		[
    			-32,
    			-87
    		],
    		[
    			4,
    			-63
    		],
    		[
    			34,
    			-57
    		],
    		[
    			-40,
    			-56
    		],
    		[
    			-99,
    			0
    		],
    		[
    			-69,
    			-70
    		],
    		[
    			-1,
    			-100
    		],
    		[
    			-34,
    			-41
    		],
    		[
    			-68,
    			-39
    		],
    		[
    			-45,
    			-1
    		],
    		[
    			13,
    			-107
    		],
    		[
    			-65,
    			-125
    		],
    		[
    			-63,
    			-68
    		],
    		[
    			-45,
    			-25
    		],
    		[
    			-21,
    			37
    		],
    		[
    			-4,
    			103
    		],
    		[
    			-32,
    			144
    		],
    		[
    			-25,
    			198
    		],
    		[
    			-34,
    			208
    		],
    		[
    			11,
    			134
    		],
    		[
    			31,
    			116
    		],
    		[
    			76,
    			79
    		],
    		[
    			86,
    			143
    		],
    		[
    			64,
    			12
    		],
    		[
    			70,
    			58
    		],
    		[
    			62,
    			94
    		],
    		[
    			213,
    			207
    		],
    		[
    			0,
    			31
    		],
    		[
    			138,
    			65
    		],
    		[
    			62,
    			92
    		],
    		[
    			12,
    			154
    		],
    		[
    			20,
    			69
    		],
    		[
    			-99,
    			-26
    		],
    		[
    			-32,
    			-125
    		],
    		[
    			-257,
    			-189
    		],
    		[
    			-40,
    			107
    		],
    		[
    			-1,
    			69
    		],
    		[
    			-55,
    			32
    		],
    		[
    			-180,
    			-21
    		],
    		[
    			-72,
    			-43
    		],
    		[
    			-2,
    			-50
    		],
    		[
    			-72,
    			-48
    		],
    		[
    			0,
    			-31
    		],
    		[
    			-107,
    			-77
    		],
    		[
    			-58,
    			-119
    		],
    		[
    			95,
    			-35
    		],
    		[
    			-109,
    			-53
    		],
    		[
    			-63,
    			33
    		],
    		[
    			-63,
    			-56
    		],
    		[
    			-131,
    			-8
    		],
    		[
    			27,
    			102
    		],
    		[
    			-188,
    			47
    		],
    		[
    			-88,
    			-45
    		],
    		[
    			-122,
    			-41
    		],
    		[
    			-99,
    			38
    		],
    		[
    			-140,
    			-16
    		],
    		[
    			-167,
    			-2
    		],
    		[
    			-74,
    			-26
    		],
    		[
    			-89,
    			-100
    		],
    		[
    			-54,
    			-31
    		],
    		[
    			-47,
    			-95
    		],
    		[
    			-126,
    			-98
    		],
    		[
    			-103,
    			-123
    		],
    		[
    			-26,
    			-50
    		],
    		[
    			-154,
    			-147
    		],
    		[
    			-99,
    			-84
    		],
    		[
    			54,
    			-50
    		],
    		[
    			101,
    			13
    		],
    		[
    			-9,
    			-141
    		],
    		[
    			102,
    			28
    		],
    		[
    			18,
    			-63
    		],
    		[
    			58,
    			38
    		],
    		[
    			18,
    			81
    		],
    		[
    			98,
    			-13
    		],
    		[
    			107,
    			-131
    		],
    		[
    			45,
    			-32
    		],
    		[
    			-24,
    			-142
    		],
    		[
    			29,
    			-73
    		],
    		[
    			-52,
    			-55
    		],
    		[
    			-42,
    			-153
    		],
    		[
    			10,
    			-192
    		],
    		[
    			-36,
    			-188
    		],
    		[
    			-84,
    			-105
    		],
    		[
    			-29,
    			-79
    		],
    		[
    			-37,
    			-47
    		],
    		[
    			-25,
    			-89
    		],
    		[
    			-62,
    			-122
    		],
    		[
    			-85,
    			-102
    		],
    		[
    			-63,
    			-116
    		],
    		[
    			-25,
    			-16
    		],
    		[
    			-39,
    			-98
    		],
    		[
    			-32,
    			-52
    		],
    		[
    			-117,
    			-107
    		],
    		[
    			-82,
    			-30
    		],
    		[
    			-125,
    			85
    		],
    		[
    			-47,
    			-70
    		],
    		[
    			-41,
    			-36
    		],
    		[
    			-16,
    			-47
    		]
    	],
    	[
    		[
    			27054,
    			22545
    		],
    		[
    			255,
    			-100
    		],
    		[
    			-33,
    			-80
    		],
    		[
    			-343,
    			-24
    		],
    		[
    			-162,
    			-35
    		],
    		[
    			175,
    			208
    		],
    		[
    			108,
    			31
    		]
    	],
    	[
    		[
    			26549,
    			22673
    		],
    		[
    			195,
    			-16
    		],
    		[
    			74,
    			-36
    		],
    		[
    			-2,
    			-150
    		],
    		[
    			-229,
    			-23
    		],
    		[
    			-67,
    			30
    		],
    		[
    			-178,
    			6
    		],
    		[
    			-138,
    			100
    		],
    		[
    			105,
    			70
    		],
    		[
    			240,
    			19
    		]
    	],
    	[
    		[
    			23186,
    			22785
    		],
    		[
    			-101,
    			-77
    		],
    		[
    			-168,
    			20
    		],
    		[
    			25,
    			49
    		],
    		[
    			244,
    			8
    		]
    	],
    	[
    		[
    			22109,
    			22802
    		],
    		[
    			87,
    			-36
    		],
    		[
    			-205,
    			-39
    		],
    		[
    			-192,
    			-67
    		],
    		[
    			-87,
    			40
    		],
    		[
    			233,
    			80
    		],
    		[
    			164,
    			22
    		]
    	],
    	[
    		[
    			23446,
    			22843
    		],
    		[
    			-43,
    			-78
    		],
    		[
    			-181,
    			12
    		],
    		[
    			224,
    			66
    		]
    	],
    	[
    		[
    			26428,
    			22850
    		],
    		[
    			193,
    			-91
    		],
    		[
    			-99,
    			-76
    		],
    		[
    			-325,
    			-34
    		],
    		[
    			-178,
    			53
    		],
    		[
    			195,
    			114
    		],
    		[
    			214,
    			34
    		]
    	],
    	[
    		[
    			20153,
    			9080
    		],
    		[
    			36,
    			-100
    		],
    		[
    			1,
    			-111
    		],
    		[
    			-30,
    			-15
    		]
    	],
    	[
    		[
    			20069,
    			9025
    		],
    		[
    			55,
    			8
    		],
    		[
    			29,
    			47
    		]
    	],
    	[
    		[
    			21873,
    			14033
    		],
    		[
    			37,
    			-140
    		],
    		[
    			42,
    			-29
    		],
    		[
    			7,
    			-58
    		],
    		[
    			64,
    			-60
    		],
    		[
    			23,
    			-80
    		],
    		[
    			-12,
    			-60
    		],
    		[
    			8,
    			-54
    		],
    		[
    			29,
    			-44
    		],
    		[
    			30,
    			-110
    		]
    	],
    	[
    		[
    			22148,
    			13359
    		],
    		[
    			27,
    			-44
    		]
    	],
    	[
    		[
    			22215,
    			12438
    		],
    		[
    			-117,
    			-36
    		],
    		[
    			-159,
    			-29
    		],
    		[
    			-90,
    			-75
    		],
    		[
    			-56,
    			-120
    		],
    		[
    			-12,
    			-56
    		],
    		[
    			-45,
    			-28
    		],
    		[
    			-24,
    			56
    		],
    		[
    			-37,
    			-8
    		],
    		[
    			-92,
    			17
    		],
    		[
    			-18,
    			16
    		],
    		[
    			-81,
    			0
    		],
    		[
    			-66,
    			-11
    		],
    		[
    			-19,
    			30
    		],
    		[
    			-32,
    			-62
    		],
    		[
    			-3,
    			-108
    		],
    		[
    			-34,
    			-21
    		]
    	],
    	[
    		[
    			21330,
    			12003
    		],
    		[
    			-3,
    			46
    		],
    		[
    			-38,
    			89
    		],
    		[
    			-1,
    			36
    		],
    		[
    			-66,
    			95
    		],
    		[
    			-21,
    			87
    		],
    		[
    			-16,
    			18
    		],
    		[
    			-9,
    			79
    		],
    		[
    			-40,
    			118
    		],
    		[
    			-65,
    			81
    		],
    		[
    			-38,
    			28
    		],
    		[
    			-53,
    			142
    		],
    		[
    			-13,
    			93
    		],
    		[
    			11,
    			117
    		],
    		[
    			-26,
    			74
    		],
    		[
    			-21,
    			92
    		],
    		[
    			-29,
    			65
    		],
    		[
    			-69,
    			52
    		],
    		[
    			-33,
    			100
    		],
    		[
    			2,
    			54
    		],
    		[
    			-30,
    			81
    		],
    		[
    			-27,
    			35
    		],
    		[
    			-35,
    			114
    		],
    		[
    			-46,
    			96
    		],
    		[
    			-36,
    			111
    		],
    		[
    			-36,
    			57
    		],
    		[
    			-43,
    			5
    		],
    		[
    			34,
    			203
    		]
    	],
    	[
    		[
    			15635,
    			11321
    		],
    		[
    			-3,
    			120
    		]
    	],
    	[
    		[
    			15649,
    			11534
    		],
    		[
    			-24,
    			92
    		],
    		[
    			-40,
    			90
    		],
    		[
    			67,
    			185
    		],
    		[
    			3,
    			44
    		]
    	],
    	[
    		[
    			27180,
    			9499
    		],
    		[
    			9,
    			-23
    		],
    		[
    			-14,
    			-8
    		],
    		[
    			-11,
    			28
    		],
    		[
    			16,
    			3
    		]
    	],
    	[
    		[
    			13624,
    			224
    		],
    		[
    			70,
    			-14
    		],
    		[
    			70,
    			-40
    		],
    		[
    			40,
    			-77
    		],
    		[
    			-39,
    			-7
    		],
    		[
    			-27,
    			50
    		],
    		[
    			-80,
    			37
    		],
    		[
    			-34,
    			51
    		]
    	],
    	[
    		[
    			16691,
    			6595
    		],
    		[
    			1,
    			-15
    		],
    		[
    			-7,
    			-4
    		],
    		[
    			-2,
    			12
    		],
    		[
    			8,
    			7
    		]
    	],
    	[
    		[
    			19436,
    			22351
    		],
    		[
    			127,
    			-93
    		],
    		[
    			-302,
    			-11
    		],
    		[
    			37,
    			53
    		],
    		[
    			138,
    			51
    		]
    	],
    	[
    		[
    			18795,
    			22658
    		],
    		[
    			228,
    			-84
    		],
    		[
    			118,
    			-91
    		],
    		[
    			143,
    			-28
    		],
    		[
    			-233,
    			-64
    		],
    		[
    			-56,
    			-72
    		],
    		[
    			-13,
    			-90
    		],
    		[
    			-182,
    			-150
    		],
    		[
    			-229,
    			154
    		],
    		[
    			-33,
    			88
    		],
    		[
    			-188,
    			113
    		],
    		[
    			-93,
    			136
    		],
    		[
    			52,
    			40
    		],
    		[
    			255,
    			-39
    		],
    		[
    			231,
    			87
    		]
    	],
    	[
    		[
    			19433,
    			22721
    		],
    		[
    			75,
    			-29
    		],
    		[
    			294,
    			-19
    		],
    		[
    			31,
    			-42
    		],
    		[
    			-119,
    			-64
    		],
    		[
    			-216,
    			-50
    		],
    		[
    			-83,
    			30
    		],
    		[
    			-174,
    			-9
    		],
    		[
    			-273,
    			93
    		],
    		[
    			166,
    			67
    		],
    		[
    			195,
    			-9
    		],
    		[
    			104,
    			32
    		]
    	],
    	[
    		[
    			32689,
    			7552
    		],
    		[
    			67,
    			-50
    		],
    		[
    			-22,
    			-51
    		],
    		[
    			-29,
    			36
    		],
    		[
    			-16,
    			65
    		]
    	],
    	[
    		[
    			32533,
    			7705
    		],
    		[
    			14,
    			-24
    		],
    		[
    			42,
    			2
    		],
    		[
    			45,
    			-62
    		],
    		[
    			-19,
    			-28
    		],
    		[
    			-27,
    			21
    		],
    		[
    			-47,
    			2
    		],
    		[
    			-25,
    			52
    		],
    		[
    			17,
    			37
    		]
    	],
    	[
    		[
    			32624,
    			7864
    		],
    		[
    			29,
    			-55
    		],
    		[
    			24,
    			-85
    		],
    		[
    			-38,
    			-2
    		],
    		[
    			-29,
    			130
    		],
    		[
    			14,
    			12
    		]
    	],
    	[
    		[
    			32405,
    			8001
    		],
    		[
    			29,
    			-15
    		],
    		[
    			32,
    			-50
    		],
    		[
    			31,
    			-15
    		],
    		[
    			-15,
    			-37
    		],
    		[
    			-36,
    			42
    		],
    		[
    			-41,
    			75
    		]
    	],
    	[
    		[
    			32218,
    			8153
    		],
    		[
    			60,
    			-59
    		],
    		[
    			-16,
    			-45
    		],
    		[
    			-44,
    			104
    		]
    	],
    	[
    		[
    			16136,
    			10416
    		],
    		[
    			-89,
    			75
    		],
    		[
    			-28,
    			56
    		],
    		[
    			-28,
    			89
    		],
    		[
    			-29,
    			43
    		],
    		[
    			-1,
    			91
    		]
    	],
    	[
    		[
    			8826,
    			11501
    		],
    		[
    			-11,
    			-42
    		],
    		[
    			-83,
    			14
    		],
    		[
    			-46,
    			40
    		],
    		[
    			-52,
    			11
    		],
    		[
    			-29,
    			33
    		]
    	],
    	[
    		[
    			21378,
    			11177
    		],
    		[
    			57,
    			-118
    		],
    		[
    			41,
    			-56
    		],
    		[
    			63,
    			-3
    		],
    		[
    			83,
    			76
    		],
    		[
    			61,
    			-31
    		],
    		[
    			93,
    			83
    		],
    		[
    			70,
    			-8
    		],
    		[
    			49,
    			32
    		],
    		[
    			28,
    			-14
    		],
    		[
    			57,
    			34
    		],
    		[
    			49,
    			11
    		],
    		[
    			36,
    			28
    		],
    		[
    			35,
    			51
    		],
    		[
    			46,
    			-28
    		],
    		[
    			-19,
    			-104
    		],
    		[
    			8,
    			-104
    		],
    		[
    			-26,
    			-43
    		],
    		[
    			-5,
    			-141
    		],
    		[
    			-39,
    			-96
    		],
    		[
    			-30,
    			-116
    		],
    		[
    			-87,
    			-246
    		],
    		[
    			-22,
    			-114
    		],
    		[
    			-100,
    			-270
    		],
    		[
    			-131,
    			-245
    		],
    		[
    			-45,
    			-77
    		],
    		[
    			-68,
    			-78
    		],
    		[
    			-75,
    			-75
    		],
    		[
    			-91,
    			-134
    		],
    		[
    			-150,
    			-276
    		],
    		[
    			-50,
    			-136
    		]
    	],
    	[
    		[
    			11835,
    			17139
    		],
    		[
    			13,
    			-4
    		],
    		[
    			-8,
    			-19
    		],
    		[
    			-5,
    			23
    		]
    	],
    	[
    		[
    			17875,
    			9327
    		],
    		[
    			7,
    			-28
    		],
    		[
    			-22,
    			-38
    		],
    		[
    			-2,
    			50
    		],
    		[
    			17,
    			16
    		]
    	],
    	[
    		[
    			11765,
    			10234
    		],
    		[
    			18,
    			28
    		],
    		[
    			95,
    			-36
    		],
    		[
    			9,
    			26
    		],
    		[
    			98,
    			9
    		],
    		[
    			78,
    			-29
    		],
    		[
    			1,
    			-34
    		]
    	],
    	[
    		[
    			19397,
    			17473
    		],
    		[
    			-43,
    			-118
    		]
    	],
    	[
    		[
    			18537,
    			16869
    		],
    		[
    			12,
    			20
    		]
    	],
    	[
    		[
    			19036,
    			18942
    		],
    		[
    			-7,
    			-102
    		],
    		[
    			-41,
    			-35
    		],
    		[
    			-18,
    			82
    		],
    		[
    			66,
    			55
    		]
    	],
    	[
    		[
    			19548,
    			20273
    		],
    		[
    			-97,
    			-16
    		],
    		[
    			-73,
    			25
    		],
    		[
    			-118,
    			-183
    		],
    		[
    			45,
    			-54
    		],
    		[
    			-61,
    			-50
    		],
    		[
    			-18,
    			-47
    		],
    		[
    			-169,
    			-114
    		],
    		[
    			-156,
    			-137
    		],
    		[
    			7,
    			-62
    		],
    		[
    			-30,
    			-63
    		],
    		[
    			15,
    			-162
    		],
    		[
    			61,
    			-9
    		],
    		[
    			97,
    			-115
    		],
    		[
    			-27,
    			-56
    		],
    		[
    			-47,
    			-32
    		],
    		[
    			25,
    			-40
    		],
    		[
    			-147,
    			-91
    		],
    		[
    			-18,
    			-32
    		],
    		[
    			8,
    			-83
    		],
    		[
    			-42,
    			-201
    		],
    		[
    			-33,
    			-84
    		],
    		[
    			-124,
    			-12
    		],
    		[
    			-37,
    			-32
    		],
    		[
    			-16,
    			-97
    		],
    		[
    			-116,
    			4
    		],
    		[
    			-19,
    			135
    		],
    		[
    			16,
    			63
    		],
    		[
    			-55,
    			56
    		],
    		[
    			-65,
    			157
    		],
    		[
    			21,
    			58
    		],
    		[
    			-62,
    			29
    		],
    		[
    			-4,
    			119
    		]
    	],
    	[
    		[
    			20312,
    			4766
    		],
    		[
    			-15,
    			-81
    		],
    		[
    			-78,
    			20
    		],
    		[
    			-33,
    			63
    		],
    		[
    			1,
    			63
    		],
    		[
    			31,
    			90
    		],
    		[
    			26,
    			32
    		],
    		[
    			54,
    			-39
    		]
    	],
    	[
    		[
    			22546,
    			8485
    		],
    		[
    			6,
    			-11
    		],
    		[
    			0,
    			-18
    		],
    		[
    			-7,
    			18
    		],
    		[
    			1,
    			11
    		]
    	],
    	[
    		[
    			20681,
    			15056
    		],
    		[
    			-10,
    			44
    		],
    		[
    			4,
    			86
    		],
    		[
    			-17,
    			24
    		],
    		[
    			17,
    			61
    		]
    	],
    	[
    		[
    			20675,
    			15271
    		],
    		[
    			25,
    			-16
    		],
    		[
    			53,
    			166
    		],
    		[
    			69,
    			-31
    		],
    		[
    			71,
    			45
    		],
    		[
    			51,
    			-34
    		],
    		[
    			48,
    			-7
    		],
    		[
    			58,
    			15
    		],
    		[
    			90,
    			61
    		],
    		[
    			151,
    			-3
    		]
    	],
    	[
    		[
    			10313,
    			12911
    		],
    		[
    			6,
    			-12
    		],
    		[
    			-4,
    			-1
    		],
    		[
    			-6,
    			10
    		],
    		[
    			4,
    			3
    		]
    	],
    	[
    		[
    			19534,
    			12521
    		],
    		[
    			0,
    			-634
    		],
    		[
    			-3,
    			0
    		]
    	],
    	[
    		[
    			19531,
    			11887
    		],
    		[
    			-23,
    			7
    		]
    	],
    	[
    		[
    			19508,
    			11894
    		],
    		[
    			-10,
    			2
    		]
    	],
    	[
    		[
    			19498,
    			11896
    		],
    		[
    			-4,
    			0
    		]
    	],
    	[
    		[
    			19494,
    			11896
    		],
    		[
    			-12,
    			-7
    		]
    	],
    	[
    		[
    			19482,
    			11889
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			19480,
    			11887
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			19477,
    			11886
    		],
    		[
    			-6,
    			-2
    		]
    	],
    	[
    		[
    			19471,
    			11884
    		],
    		[
    			-3,
    			0
    		]
    	],
    	[
    		[
    			19468,
    			11884
    		],
    		[
    			-4,
    			2
    		]
    	],
    	[
    		[
    			19464,
    			11886
    		],
    		[
    			-5,
    			0
    		]
    	],
    	[
    		[
    			19459,
    			11886
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			19458,
    			11888
    		],
    		[
    			-6,
    			0
    		]
    	],
    	[
    		[
    			19452,
    			11888
    		],
    		[
    			-5,
    			-2
    		]
    	],
    	[
    		[
    			19447,
    			11886
    		],
    		[
    			-5,
    			-9
    		]
    	],
    	[
    		[
    			19442,
    			11877
    		],
    		[
    			-2,
    			-6
    		]
    	],
    	[
    		[
    			19440,
    			11871
    		],
    		[
    			-6,
    			-6
    		]
    	],
    	[
    		[
    			19434,
    			11865
    		],
    		[
    			-3,
    			-5
    		]
    	],
    	[
    		[
    			19431,
    			11860
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19431,
    			11858
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19431,
    			11855
    		],
    		[
    			-1,
    			-5
    		]
    	],
    	[
    		[
    			19430,
    			11850
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19431,
    			11846
    		],
    		[
    			4,
    			-6
    		]
    	],
    	[
    		[
    			19435,
    			11840
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19437,
    			11837
    		],
    		[
    			0,
    			-7
    		]
    	],
    	[
    		[
    			19437,
    			11830
    		],
    		[
    			1,
    			-9
    		]
    	],
    	[
    		[
    			19438,
    			11821
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19438,
    			11818
    		],
    		[
    			-1,
    			-13
    		]
    	],
    	[
    		[
    			19437,
    			11805
    		],
    		[
    			-1,
    			-4
    		]
    	],
    	[
    		[
    			19436,
    			11801
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19436,
    			11800
    		],
    		[
    			-5,
    			-6
    		]
    	],
    	[
    		[
    			19431,
    			11794
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19431,
    			11792
    		],
    		[
    			1,
    			-5
    		]
    	],
    	[
    		[
    			19432,
    			11787
    		],
    		[
    			-1,
    			-3
    		]
    	],
    	[
    		[
    			19431,
    			11784
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			19428,
    			11783
    		],
    		[
    			-4,
    			-5
    		]
    	],
    	[
    		[
    			19424,
    			11778
    		],
    		[
    			-4,
    			-6
    		]
    	],
    	[
    		[
    			19420,
    			11772
    		],
    		[
    			-3,
    			-5
    		]
    	],
    	[
    		[
    			19417,
    			11767
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			19416,
    			11766
    		],
    		[
    			-2,
    			-6
    		]
    	],
    	[
    		[
    			19414,
    			11760
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19414,
    			11758
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			19414,
    			11753
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19415,
    			11753
    		],
    		[
    			-5,
    			-2
    		]
    	],
    	[
    		[
    			19410,
    			11751
    		],
    		[
    			-4,
    			-6
    		]
    	],
    	[
    		[
    			19406,
    			11745
    		],
    		[
    			4,
    			-25
    		]
    	],
    	[
    		[
    			19410,
    			11720
    		],
    		[
    			-13,
    			-11
    		]
    	],
    	[
    		[
    			19397,
    			11709
    		],
    		[
    			-8,
    			-2
    		]
    	],
    	[
    		[
    			19389,
    			11707
    		],
    		[
    			-7,
    			-6
    		]
    	],
    	[
    		[
    			19382,
    			11701
    		],
    		[
    			-3,
    			-15
    		]
    	],
    	[
    		[
    			19379,
    			11686
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			19380,
    			11687
    		],
    		[
    			6,
    			-31
    		]
    	],
    	[
    		[
    			19386,
    			11656
    		],
    		[
    			2,
    			-14
    		]
    	],
    	[
    		[
    			19388,
    			11642
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			19391,
    			11641
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19392,
    			11641
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			19395,
    			11639
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19395,
    			11637
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19395,
    			11635
    		],
    		[
    			-6,
    			-17
    		]
    	],
    	[
    		[
    			19389,
    			11618
    		],
    		[
    			-5,
    			-9
    		]
    	],
    	[
    		[
    			19384,
    			11609
    		],
    		[
    			-4,
    			0
    		]
    	],
    	[
    		[
    			19380,
    			11609
    		],
    		[
    			-7,
    			-7
    		]
    	],
    	[
    		[
    			19373,
    			11602
    		],
    		[
    			-9,
    			-9
    		]
    	],
    	[
    		[
    			19364,
    			11593
    		],
    		[
    			-15,
    			-30
    		]
    	],
    	[
    		[
    			19349,
    			11563
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19350,
    			11563
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			19352,
    			11559
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19353,
    			11558
    		],
    		[
    			0,
    			-10
    		]
    	],
    	[
    		[
    			19353,
    			11548
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19354,
    			11547
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19354,
    			11545
    		],
    		[
    			2,
    			-8
    		]
    	],
    	[
    		[
    			19356,
    			11537
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			19357,
    			11534
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19358,
    			11533
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19359,
    			11532
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19360,
    			11531
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19360,
    			11530
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19361,
    			11528
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19361,
    			11527
    		],
    		[
    			2,
    			-7
    		]
    	],
    	[
    		[
    			19363,
    			11520
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			19362,
    			11519
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			19363,
    			11517
    		],
    		[
    			2,
    			-11
    		]
    	],
    	[
    		[
    			19365,
    			11506
    		],
    		[
    			4,
    			-11
    		]
    	],
    	[
    		[
    			19369,
    			11495
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			19370,
    			11492
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			19369,
    			11492
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19369,
    			11491
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			19367,
    			11489
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19367,
    			11487
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19366,
    			11485
    		],
    		[
    			-2,
    			-3
    		]
    	],
    	[
    		[
    			19364,
    			11482
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			19363,
    			11481
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19362,
    			11479
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19361,
    			11477
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19361,
    			11476
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			19359,
    			11475
    		],
    		[
    			-1,
    			-7
    		]
    	],
    	[
    		[
    			19358,
    			11468
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			19356,
    			11467
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19356,
    			11464
    		],
    		[
    			-3,
    			-3
    		]
    	],
    	[
    		[
    			19353,
    			11461
    		],
    		[
    			-4,
    			-3
    		]
    	],
    	[
    		[
    			19349,
    			11458
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19349,
    			11457
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			19348,
    			11458
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			19347,
    			11457
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			19345,
    			11457
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			19344,
    			11457
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			19343,
    			11457
    		],
    		[
    			-2,
    			-7
    		]
    	],
    	[
    		[
    			19341,
    			11450
    		],
    		[
    			-1,
    			-4
    		]
    	],
    	[
    		[
    			19340,
    			11446
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			19339,
    			11446
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			19337,
    			11445
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19336,
    			11443
    		],
    		[
    			-4,
    			-12
    		]
    	],
    	[
    		[
    			19332,
    			11431
    		],
    		[
    			-1,
    			-7
    		]
    	],
    	[
    		[
    			19331,
    			11424
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19331,
    			11422
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19331,
    			11420
    		],
    		[
    			-3,
    			-14
    		]
    	],
    	[
    		[
    			19328,
    			11406
    		],
    		[
    			-2,
    			-9
    		]
    	],
    	[
    		[
    			19326,
    			11397
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19327,
    			11396
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19328,
    			11396
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			19328,
    			11391
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19328,
    			11390
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			19329,
    			11387
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			19331,
    			11384
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19332,
    			11380
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			19333,
    			11379
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			19335,
    			11377
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			19335,
    			11374
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19336,
    			11374
    		],
    		[
    			20,
    			5
    		]
    	],
    	[
    		[
    			19356,
    			11379
    		],
    		[
    			27,
    			-23
    		]
    	],
    	[
    		[
    			19383,
    			11356
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			19383,
    			11352
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			19382,
    			11351
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			19381,
    			11349
    		],
    		[
    			-1,
    			-3
    		]
    	],
    	[
    		[
    			19380,
    			11346
    		],
    		[
    			-3,
    			-5
    		]
    	],
    	[
    		[
    			19377,
    			11341
    		],
    		[
    			4,
    			-4
    		]
    	],
    	[
    		[
    			19381,
    			11337
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19381,
    			11335
    		],
    		[
    			3,
    			-5
    		]
    	],
    	[
    		[
    			19384,
    			11330
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			19384,
    			11329
    		],
    		[
    			0,
    			-7
    		]
    	],
    	[
    		[
    			19384,
    			11322
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19384,
    			11320
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			19385,
    			11316
    		],
    		[
    			-1,
    			-3
    		]
    	],
    	[
    		[
    			19384,
    			11313
    		],
    		[
    			3,
    			-7
    		]
    	],
    	[
    		[
    			19387,
    			11306
    		],
    		[
    			2,
    			-9
    		]
    	],
    	[
    		[
    			19389,
    			11297
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			19389,
    			11295
    		],
    		[
    			0,
    			-16
    		]
    	],
    	[
    		[
    			19389,
    			11279
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			19388,
    			11279
    		],
    		[
    			-1,
    			-5
    		]
    	],
    	[
    		[
    			19387,
    			11274
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			19388,
    			11271
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			19391,
    			11272
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			19392,
    			11274
    		],
    		[
    			6,
    			2
    		]
    	],
    	[
    		[
    			19398,
    			11276
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			19398,
    			11277
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			19399,
    			11277
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			19403,
    			11277
    		],
    		[
    			-3,
    			-20
    		]
    	],
    	[
    		[
    			19400,
    			11257
    		],
    		[
    			-3,
    			-30
    		]
    	],
    	[
    		[
    			19397,
    			11227
    		],
    		[
    			8,
    			-42
    		]
    	],
    	[
    		[
    			19405,
    			11185
    		],
    		[
    			10,
    			-8
    		]
    	],
    	[
    		[
    			19415,
    			11177
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			19417,
    			11172
    		],
    		[
    			4,
    			-4
    		]
    	],
    	[
    		[
    			19421,
    			11168
    		],
    		[
    			11,
    			1
    		]
    	],
    	[
    		[
    			19432,
    			11169
    		],
    		[
    			0,
    			-17
    		]
    	],
    	[
    		[
    			19432,
    			11152
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			19436,
    			11149
    		],
    		[
    			-5,
    			-34
    		]
    	],
    	[
    		[
    			19431,
    			11115
    		],
    		[
    			-5,
    			-28
    		]
    	],
    	[
    		[
    			17392,
    			10300
    		],
    		[
    			-42,
    			-20
    		]
    	],
    	[
    		[
    			27089,
    			11207
    		],
    		[
    			-15,
    			66
    		],
    		[
    			-47,
    			44
    		],
    		[
    			-49,
    			67
    		],
    		[
    			-28,
    			-13
    		],
    		[
    			-52,
    			32
    		],
    		[
    			3,
    			108
    		],
    		[
    			-35,
    			8
    		],
    		[
    			-49,
    			-16
    		],
    		[
    			-10,
    			-116
    		],
    		[
    			6,
    			-90
    		],
    		[
    			-15,
    			-31
    		],
    		[
    			-60,
    			-244
    		],
    		[
    			-7,
    			-145
    		],
    		[
    			20,
    			-81
    		],
    		[
    			30,
    			23
    		],
    		[
    			21,
    			-39
    		],
    		[
    			4,
    			-78
    		],
    		[
    			33,
    			-80
    		],
    		[
    			19,
    			-133
    		],
    		[
    			24,
    			-59
    		],
    		[
    			25,
    			-25
    		],
    		[
    			53,
    			-2
    		],
    		[
    			25,
    			-66
    		],
    		[
    			26,
    			-35
    		]
    	],
    	[
    		[
    			26822,
    			10332
    		],
    		[
    			-32,
    			69
    		],
    		[
    			-12,
    			58
    		],
    		[
    			-59,
    			88
    		],
    		[
    			-39,
    			113
    		],
    		[
    			-33,
    			-29
    		],
    		[
    			-8,
    			58
    		],
    		[
    			6,
    			77
    		],
    		[
    			46,
    			230
    		]
    	],
    	[
    		[
    			23726,
    			15480
    		],
    		[
    			4,
    			48
    		],
    		[
    			55,
    			122
    		],
    		[
    			-32,
    			58
    		],
    		[
    			13,
    			64
    		],
    		[
    			-47,
    			13
    		],
    		[
    			-24,
    			34
    		],
    		[
    			4,
    			62
    		],
    		[
    			28,
    			13
    		],
    		[
    			69,
    			-20
    		],
    		[
    			44,
    			104
    		],
    		[
    			27,
    			16
    		],
    		[
    			14,
    			89
    		],
    		[
    			25,
    			-25
    		],
    		[
    			53,
    			33
    		],
    		[
    			21,
    			36
    		],
    		[
    			34,
    			-54
    		],
    		[
    			-28,
    			-35
    		],
    		[
    			14,
    			-58
    		],
    		[
    			31,
    			11
    		]
    	],
    	[
    		[
    			781,
    			7716
    		],
    		[
    			-2,
    			0
    		],
    		[
    			0,
    			5
    		],
    		[
    			2,
    			1
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			22598,
    			16173
    		],
    		[
    			99,
    			-9
    		],
    		[
    			-3,
    			106
    		],
    		[
    			29,
    			40
    		],
    		[
    			51,
    			6
    		],
    		[
    			7,
    			47
    		],
    		[
    			39,
    			-1
    		],
    		[
    			36,
    			46
    		],
    		[
    			69,
    			-75
    		],
    		[
    			39,
    			5
    		],
    		[
    			32,
    			-117
    		],
    		[
    			-3,
    			-35
    		],
    		[
    			36,
    			-30
    		],
    		[
    			76,
    			-12
    		],
    		[
    			32,
    			20
    		],
    		[
    			32,
    			-41
    		],
    		[
    			14,
    			-71
    		],
    		[
    			23,
    			-26
    		],
    		[
    			13,
    			-82
    		],
    		[
    			100,
    			-95
    		],
    		[
    			62,
    			-71
    		],
    		[
    			81,
    			-58
    		],
    		[
    			44,
    			-49
    		],
    		[
    			35,
    			-8
    		],
    		[
    			79,
    			-52
    		],
    		[
    			-12,
    			-101
    		]
    	],
    	[
    		[
    			29200,
    			7758
    		],
    		[
    			16,
    			53
    		],
    		[
    			70,
    			28
    		],
    		[
    			67,
    			-1
    		],
    		[
    			39,
    			26
    		],
    		[
    			31,
    			-19
    		],
    		[
    			-77,
    			-85
    		],
    		[
    			-104,
    			-53
    		],
    		[
    			-29,
    			-31
    		]
    	],
    	[
    		[
    			450,
    			5722
    		],
    		[
    			16,
    			-11
    		],
    		[
    			-1,
    			-14
    		],
    		[
    			-15,
    			25
    		]
    	],
    	[
    		[
    			11395,
    			11071
    		],
    		[
    			0,
    			-115
    		],
    		[
    			-55,
    			-14
    		],
    		[
    			9,
    			89
    		],
    		[
    			46,
    			40
    		]
    	],
    	[
    		[
    			18063,
    			15441
    		],
    		[
    			53,
    			48
    		],
    		[
    			64,
    			17
    		],
    		[
    			66,
    			-94
    		],
    		[
    			46,
    			52
    		],
    		[
    			8,
    			-40
    		],
    		[
    			-28,
    			-63
    		],
    		[
    			-27,
    			-16
    		],
    		[
    			-5,
    			-54
    		],
    		[
    			54,
    			-70
    		],
    		[
    			6,
    			-62
    		],
    		[
    			-18,
    			-62
    		],
    		[
    			-35,
    			-60
    		],
    		[
    			-52,
    			-59
    		],
    		[
    			16,
    			-58
    		],
    		[
    			49,
    			-55
    		],
    		[
    			39,
    			12
    		],
    		[
    			9,
    			-61
    		],
    		[
    			35,
    			-7
    		]
    	],
    	[
    		[
    			20675,
    			15271
    		],
    		[
    			-12,
    			67
    		],
    		[
    			39,
    			46
    		],
    		[
    			-18,
    			55
    		],
    		[
    			-36,
    			-54
    		],
    		[
    			-28,
    			-10
    		],
    		[
    			-49,
    			42
    		],
    		[
    			-25,
    			-4
    		],
    		[
    			-96,
    			-108
    		],
    		[
    			-73,
    			-19
    		],
    		[
    			-49,
    			36
    		],
    		[
    			-19,
    			43
    		],
    		[
    			-76,
    			55
    		],
    		[
    			-53,
    			5
    		],
    		[
    			-46,
    			-91
    		],
    		[
    			-57,
    			-31
    		],
    		[
    			-54,
    			44
    		],
    		[
    			2,
    			27
    		],
    		[
    			-49,
    			46
    		],
    		[
    			-45,
    			-27
    		],
    		[
    			-64,
    			55
    		],
    		[
    			1,
    			55
    		],
    		[
    			-29,
    			7
    		],
    		[
    			8,
    			96
    		],
    		[
    			-48,
    			48
    		],
    		[
    			18,
    			37
    		],
    		[
    			-22,
    			48
    		],
    		[
    			30,
    			28
    		],
    		[
    			-34,
    			63
    		],
    		[
    			23,
    			52
    		],
    		[
    			-76,
    			-21
    		],
    		[
    			0,
    			65
    		],
    		[
    			60,
    			95
    		],
    		[
    			98,
    			-15
    		],
    		[
    			98,
    			14
    		],
    		[
    			-1,
    			26
    		],
    		[
    			54,
    			35
    		],
    		[
    			-33,
    			44
    		],
    		[
    			13,
    			32
    		],
    		[
    			153,
    			-22
    		],
    		[
    			46,
    			2
    		],
    		[
    			17,
    			37
    		],
    		[
    			107,
    			82
    		],
    		[
    			78,
    			35
    		],
    		[
    			94,
    			-13
    		],
    		[
    			48,
    			4
    		],
    		[
    			72,
    			-57
    		],
    		[
    			39,
    			18
    		],
    		[
    			40,
    			-82
    		],
    		[
    			22,
    			21
    		],
    		[
    			87,
    			-59
    		],
    		[
    			78,
    			-19
    		],
    		[
    			103,
    			33
    		],
    		[
    			67,
    			-33
    		],
    		[
    			89,
    			51
    		],
    		[
    			47,
    			53
    		]
    	],
    	[
    		[
    			19919,
    			16285
    		],
    		[
    			19,
    			-76
    		],
    		[
    			83,
    			-46
    		],
    		[
    			-26,
    			-49
    		],
    		[
    			-55,
    			20
    		],
    		[
    			-68,
    			-17
    		],
    		[
    			-21,
    			-46
    		],
    		[
    			-114,
    			-18
    		],
    		[
    			-8,
    			24
    		]
    	],
    	[
    		[
    			34343,
    			8010
    		],
    		[
    			3,
    			-3
    		],
    		[
    			-1,
    			-4
    		],
    		[
    			-2,
    			6
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			28877,
    			13491
    		],
    		[
    			33,
    			-55
    		],
    		[
    			-5,
    			-72
    		],
    		[
    			-21,
    			-60
    		],
    		[
    			-19,
    			-144
    		],
    		[
    			-54,
    			-164
    		],
    		[
    			0,
    			-50
    		],
    		[
    			-61,
    			100
    		],
    		[
    			-18,
    			72
    		],
    		[
    			12,
    			117
    		],
    		[
    			81,
    			212
    		],
    		[
    			52,
    			44
    		]
    	],
    	[
    		[
    			20990,
    			8476
    		],
    		[
    			-7,
    			-75
    		],
    		[
    			-34,
    			-158
    		],
    		[
    			26,
    			-69
    		],
    		[
    			48,
    			-92
    		],
    		[
    			-27,
    			-100
    		],
    		[
    			17,
    			-64
    		],
    		[
    			-17,
    			-54
    		],
    		[
    			35,
    			-143
    		],
    		[
    			-3,
    			-39
    		],
    		[
    			20,
    			-96
    		],
    		[
    			45,
    			-47
    		],
    		[
    			10,
    			-41
    		]
    	],
    	[
    		[
    			20391,
    			7684
    		],
    		[
    			-50,
    			47
    		],
    		[
    			-42,
    			7
    		],
    		[
    			-51,
    			73
    		],
    		[
    			-42,
    			8
    		],
    		[
    			-24,
    			67
    		]
    	],
    	[
    		[
    			20153,
    			9080
    		],
    		[
    			32,
    			10
    		],
    		[
    			95,
    			0
    		],
    		[
    			205,
    			0
    		]
    	],
    	[
    		[
    			20190,
    			9841
    		],
    		[
    			5,
    			14
    		]
    	],
    	[
    		[
    			20195,
    			9855
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			20196,
    			9857
    		],
    		[
    			2,
    			5
    		]
    	],
    	[
    		[
    			20198,
    			9862
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20198,
    			9865
    		],
    		[
    			1,
    			3
    		]
    	],
    	[
    		[
    			20199,
    			9868
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			20199,
    			9870
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20200,
    			9871
    		],
    		[
    			2,
    			5
    		]
    	],
    	[
    		[
    			20202,
    			9876
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20203,
    			9877
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20203,
    			9876
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			20207,
    			9876
    		],
    		[
    			3,
    			6
    		]
    	],
    	[
    		[
    			20210,
    			9882
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			20210,
    			9884
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20211,
    			9884
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20212,
    			9884
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20213,
    			9884
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20214,
    			9885
    		],
    		[
    			4,
    			4
    		]
    	],
    	[
    		[
    			20218,
    			9889
    		],
    		[
    			47,
    			-12
    		]
    	],
    	[
    		[
    			20265,
    			9877
    		],
    		[
    			5,
    			2
    		]
    	],
    	[
    		[
    			20270,
    			9879
    		],
    		[
    			3,
    			4
    		]
    	],
    	[
    		[
    			20273,
    			9883
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20273,
    			9882
    		],
    		[
    			7,
    			15
    		]
    	],
    	[
    		[
    			20280,
    			9897
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20280,
    			9898
    		],
    		[
    			7,
    			-9
    		]
    	],
    	[
    		[
    			20287,
    			9889
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20287,
    			9888
    		],
    		[
    			7,
    			-19
    		]
    	],
    	[
    		[
    			20294,
    			9869
    		],
    		[
    			1,
    			-11
    		]
    	],
    	[
    		[
    			20295,
    			9858
    		],
    		[
    			8,
    			0
    		]
    	],
    	[
    		[
    			20303,
    			9858
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			20305,
    			9859
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			20305,
    			9857
    		],
    		[
    			3,
    			-4
    		]
    	],
    	[
    		[
    			20308,
    			9853
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20308,
    			9852
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20308,
    			9849
    		],
    		[
    			11,
    			-3
    		]
    	],
    	[
    		[
    			20319,
    			9846
    		],
    		[
    			-1,
    			13
    		]
    	],
    	[
    		[
    			20318,
    			9859
    		],
    		[
    			51,
    			29
    		]
    	],
    	[
    		[
    			20369,
    			9888
    		],
    		[
    			29,
    			18
    		],
    		[
    			46,
    			-21
    		],
    		[
    			47,
    			78
    		]
    	],
    	[
    		[
    			20896,
    			17143
    		],
    		[
    			-61,
    			-3
    		],
    		[
    			-65,
    			-46
    		],
    		[
    			-93,
    			-27
    		],
    		[
    			-108,
    			-82
    		],
    		[
    			8,
    			-46
    		],
    		[
    			58,
    			-102
    		],
    		[
    			60,
    			29
    		],
    		[
    			38,
    			-7
    		],
    		[
    			-29,
    			-65
    		],
    		[
    			-75,
    			11
    		],
    		[
    			-31,
    			-48
    		],
    		[
    			-37,
    			2
    		],
    		[
    			-58,
    			-65
    		],
    		[
    			-37,
    			-7
    		],
    		[
    			-19,
    			41
    		],
    		[
    			7,
    			60
    		],
    		[
    			-62,
    			59
    		],
    		[
    			-45,
    			12
    		],
    		[
    			112,
    			91
    		],
    		[
    			-45,
    			36
    		],
    		[
    			-63,
    			-17
    		],
    		[
    			-51,
    			47
    		],
    		[
    			-2,
    			50
    		],
    		[
    			-118,
    			-19
    		],
    		[
    			-13,
    			-53
    		],
    		[
    			-69,
    			-92
    		],
    		[
    			-21,
    			-77
    		]
    	],
    	[
    		[
    			337,
    			9290
    		],
    		[
    			-1,
    			0
    		],
    		[
    			1,
    			2
    		],
    		[
    			0,
    			0
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			12125,
    			3608
    		],
    		[
    			-40,
    			-110
    		],
    		[
    			-38,
    			-44
    		],
    		[
    			-70,
    			-48
    		],
    		[
    			-83,
    			30
    		],
    		[
    			-35,
    			-23
    		],
    		[
    			-64,
    			37
    		],
    		[
    			-29,
    			40
    		],
    		[
    			-70,
    			-5
    		],
    		[
    			-54,
    			97
    		],
    		[
    			5,
    			126
    		],
    		[
    			22,
    			22
    		]
    	],
    	[
    		[
    			2318,
    			12647
    		],
    		[
    			51,
    			-41
    		],
    		[
    			43,
    			-81
    		],
    		[
    			-18,
    			-31
    		],
    		[
    			-49,
    			-34
    		],
    		[
    			-36,
    			34
    		],
    		[
    			-16,
    			68
    		],
    		[
    			25,
    			85
    		]
    	],
    	[
    		[
    			10318,
    			16147
    		],
    		[
    			-38,
    			-61
    		],
    		[
    			-113,
    			-36
    		],
    		[
    			31,
    			58
    		],
    		[
    			87,
    			11
    		],
    		[
    			33,
    			28
    		]
    	],
    	[
    		[
    			8820,
    			17202
    		],
    		[
    			-43,
    			-66
    		],
    		[
    			-27,
    			25
    		],
    		[
    			70,
    			41
    		]
    	],
    	[
    		[
    			9562,
    			16307
    		],
    		[
    			94,
    			73
    		],
    		[
    			29,
    			39
    		],
    		[
    			-19,
    			77
    		],
    		[
    			54,
    			21
    		],
    		[
    			91,
    			-23
    		],
    		[
    			73,
    			14
    		],
    		[
    			53,
    			37
    		],
    		[
    			-15,
    			94
    		],
    		[
    			29,
    			23
    		],
    		[
    			74,
    			101
    		],
    		[
    			61,
    			26
    		]
    	],
    	[
    		[
    			10812,
    			16802
    		],
    		[
    			13,
    			-41
    		],
    		[
    			-105,
    			-80
    		],
    		[
    			-46,
    			-21
    		],
    		[
    			-39,
    			38
    		],
    		[
    			-15,
    			-69
    		],
    		[
    			-72,
    			-51
    		],
    		[
    			-30,
    			10
    		],
    		[
    			-64,
    			-153
    		],
    		[
    			8,
    			-37
    		],
    		[
    			-30,
    			-60
    		],
    		[
    			32,
    			-16
    		],
    		[
    			22,
    			-109
    		],
    		[
    			-66,
    			25
    		],
    		[
    			-33,
    			-55
    		],
    		[
    			-119,
    			-18
    		],
    		[
    			-97,
    			-60
    		],
    		[
    			-27,
    			-52
    		],
    		[
    			7,
    			-32
    		],
    		[
    			-17,
    			-119
    		],
    		[
    			-72,
    			-89
    		],
    		[
    			-46,
    			-20
    		],
    		[
    			30,
    			-45
    		],
    		[
    			-1,
    			-73
    		],
    		[
    			-44,
    			-103
    		],
    		[
    			-32,
    			45
    		],
    		[
    			5,
    			36
    		],
    		[
    			-48,
    			46
    		],
    		[
    			19,
    			99
    		],
    		[
    			-29,
    			19
    		],
    		[
    			-7,
    			-114
    		],
    		[
    			26,
    			-104
    		],
    		[
    			-1,
    			-76
    		],
    		[
    			-20,
    			-32
    		],
    		[
    			45,
    			-54
    		],
    		[
    			-4,
    			-71
    		],
    		[
    			31,
    			-134
    		],
    		[
    			-39,
    			-58
    		],
    		[
    			-37,
    			-7
    		],
    		[
    			-2,
    			-98
    		],
    		[
    			-43,
    			-2
    		],
    		[
    			-56,
    			-50
    		],
    		[
    			-42,
    			-82
    		],
    		[
    			-75,
    			-25
    		],
    		[
    			-30,
    			-50
    		],
    		[
    			-9,
    			-50
    		],
    		[
    			-69,
    			-85
    		],
    		[
    			-41,
    			-31
    		],
    		[
    			-76,
    			-128
    		],
    		[
    			-26,
    			-101
    		],
    		[
    			-5,
    			-62
    		],
    		[
    			19,
    			-157
    		],
    		[
    			24,
    			-99
    		],
    		[
    			46,
    			-125
    		],
    		[
    			-6,
    			-52
    		],
    		[
    			53,
    			-227
    		],
    		[
    			-9,
    			-149
    		],
    		[
    			-28,
    			-115
    		],
    		[
    			-63,
    			-18
    		],
    		[
    			-25,
    			117
    		],
    		[
    			-37,
    			16
    		],
    		[
    			-13,
    			90
    		],
    		[
    			-46,
    			74
    		],
    		[
    			-19,
    			61
    		],
    		[
    			-9,
    			78
    		],
    		[
    			-21,
    			24
    		],
    		[
    			20,
    			113
    		],
    		[
    			1,
    			59
    		],
    		[
    			-38,
    			46
    		],
    		[
    			-59,
    			121
    		],
    		[
    			-34,
    			36
    		],
    		[
    			-84,
    			-63
    		],
    		[
    			-41,
    			-7
    		],
    		[
    			-28,
    			69
    		],
    		[
    			-61,
    			41
    		],
    		[
    			-79,
    			17
    		],
    		[
    			-66,
    			-26
    		],
    		[
    			-105,
    			23
    		],
    		[
    			-83,
    			-43
    		],
    		[
    			-47,
    			36
    		],
    		[
    			-19,
    			-51
    		],
    		[
    			53,
    			-14
    		],
    		[
    			43,
    			-39
    		],
    		[
    			-13,
    			-64
    		],
    		[
    			35,
    			-10
    		],
    		[
    			0,
    			-48
    		],
    		[
    			-69,
    			72
    		],
    		[
    			-22,
    			-27
    		],
    		[
    			-80,
    			4
    		],
    		[
    			-55,
    			32
    		],
    		[
    			-8,
    			36
    		],
    		[
    			-35,
    			10
    		],
    		[
    			-29,
    			-44
    		],
    		[
    			-77,
    			36
    		],
    		[
    			-83,
    			8
    		],
    		[
    			-88,
    			-71
    		],
    		[
    			-40,
    			-73
    		],
    		[
    			-82,
    			-55
    		],
    		[
    			-87,
    			-102
    		],
    		[
    			-19,
    			-50
    		],
    		[
    			-21,
    			-116
    		],
    		[
    			3,
    			-90
    		],
    		[
    			28,
    			-87
    		]
    	],
    	[
    		[
    			6021,
    			14703
    		],
    		[
    			-23,
    			105
    		],
    		[
    			-41,
    			63
    		],
    		[
    			-72,
    			83
    		],
    		[
    			-38,
    			2
    		],
    		[
    			-60,
    			61
    		],
    		[
    			-87,
    			7
    		],
    		[
    			-17,
    			21
    		],
    		[
    			0,
    			94
    		],
    		[
    			-119,
    			197
    		],
    		[
    			10,
    			80
    		],
    		[
    			-59,
    			67
    		],
    		[
    			-6,
    			50
    		],
    		[
    			30,
    			26
    		],
    		[
    			-69,
    			62
    		],
    		[
    			-24,
    			71
    		],
    		[
    			-57,
    			79
    		],
    		[
    			-13,
    			153
    		],
    		[
    			-48,
    			72
    		],
    		[
    			20,
    			108
    		],
    		[
    			8,
    			89
    		],
    		[
    			-14,
    			95
    		],
    		[
    			-21,
    			54
    		],
    		[
    			-12,
    			84
    		],
    		[
    			31,
    			122
    		],
    		[
    			26,
    			287
    		],
    		[
    			-2,
    			276
    		],
    		[
    			-16,
    			17
    		],
    		[
    			-27,
    			121
    		],
    		[
    			-29,
    			70
    		],
    		[
    			7,
    			38
    		],
    		[
    			58,
    			-36
    		],
    		[
    			162,
    			-30
    		],
    		[
    			-13,
    			127
    		],
    		[
    			-25,
    			41
    		]
    	],
    	[
    		[
    			8659,
    			17290
    		],
    		[
    			-90,
    			-49
    		],
    		[
    			-150,
    			-153
    		],
    		[
    			27,
    			-16
    		],
    		[
    			71,
    			32
    		],
    		[
    			62,
    			-54
    		],
    		[
    			63,
    			44
    		],
    		[
    			36,
    			4
    		],
    		[
    			67,
    			61
    		],
    		[
    			22,
    			-35
    		],
    		[
    			73,
    			-28
    		],
    		[
    			33,
    			-58
    		],
    		[
    			67,
    			-13
    		],
    		[
    			46,
    			42
    		],
    		[
    			66,
    			2
    		],
    		[
    			88,
    			-43
    		],
    		[
    			24,
    			11
    		],
    		[
    			26,
    			-88
    		],
    		[
    			-126,
    			22
    		],
    		[
    			-138,
    			-42
    		],
    		[
    			-39,
    			-33
    		],
    		[
    			-56,
    			-113
    		],
    		[
    			44,
    			-29
    		],
    		[
    			-37,
    			-186
    		],
    		[
    			-20,
    			-74
    		],
    		[
    			15,
    			-77
    		],
    		[
    			-7,
    			-80
    		],
    		[
    			39,
    			-109
    		],
    		[
    			48,
    			10
    		],
    		[
    			30,
    			31
    		],
    		[
    			33,
    			91
    		],
    		[
    			6,
    			73
    		],
    		[
    			-31,
    			131
    		],
    		[
    			1,
    			66
    		],
    		[
    			24,
    			51
    		],
    		[
    			18,
    			90
    		],
    		[
    			66,
    			8
    		],
    		[
    			1,
    			54
    		],
    		[
    			56,
    			86
    		],
    		[
    			124,
    			-73
    		],
    		[
    			22,
    			-107
    		],
    		[
    			-6,
    			-61
    		],
    		[
    			-50,
    			-59
    		],
    		[
    			18,
    			-65
    		],
    		[
    			38,
    			62
    		],
    		[
    			33,
    			17
    		],
    		[
    			29,
    			-49
    		],
    		[
    			19,
    			-128
    		],
    		[
    			-11,
    			-67
    		],
    		[
    			-38,
    			-43
    		],
    		[
    			-51,
    			-109
    		],
    		[
    			93,
    			-54
    		],
    		[
    			73,
    			20
    		],
    		[
    			32,
    			35
    		],
    		[
    			120,
    			69
    		]
    	],
    	[
    		[
    			1275,
    			18298
    		],
    		[
    			39,
    			-56
    		],
    		[
    			-52,
    			-42
    		],
    		[
    			-35,
    			4
    		],
    		[
    			10,
    			78
    		],
    		[
    			38,
    			16
    		]
    	],
    	[
    		[
    			1555,
    			18470
    		],
    		[
    			41,
    			-49
    		],
    		[
    			-145,
    			-56
    		],
    		[
    			41,
    			86
    		],
    		[
    			63,
    			19
    		]
    	],
    	[
    		[
    			4670,
    			18620
    		],
    		[
    			28,
    			-54
    		],
    		[
    			-26,
    			-72
    		],
    		[
    			-60,
    			44
    		],
    		[
    			23,
    			74
    		],
    		[
    			35,
    			8
    		]
    	],
    	[
    		[
    			4442,
    			18690
    		],
    		[
    			107,
    			-92
    		],
    		[
    			49,
    			-108
    		],
    		[
    			-52,
    			-8
    		],
    		[
    			-56,
    			57
    		],
    		[
    			-17,
    			105
    		],
    		[
    			-31,
    			46
    		]
    	],
    	[
    		[
    			4787,
    			18614
    		],
    		[
    			-16,
    			-23
    		],
    		[
    			17,
    			-82
    		],
    		[
    			-29,
    			-53
    		],
    		[
    			-61,
    			-25
    		],
    		[
    			3,
    			152
    		],
    		[
    			-29,
    			45
    		],
    		[
    			-54,
    			-19
    		],
    		[
    			-20,
    			77
    		],
    		[
    			13,
    			52
    		]
    	],
    	[
    		[
    			4417,
    			18813
    		],
    		[
    			85,
    			-26
    		],
    		[
    			-16,
    			-79
    		],
    		[
    			-48,
    			-3
    		],
    		[
    			-21,
    			108
    		]
    	],
    	[
    		[
    			4270,
    			18891
    		],
    		[
    			54,
    			-50
    		],
    		[
    			21,
    			-88
    		],
    		[
    			-31,
    			-59
    		],
    		[
    			-41,
    			74
    		],
    		[
    			-3,
    			123
    		]
    	],
    	[
    		[
    			2558,
    			18964
    		],
    		[
    			66,
    			-12
    		],
    		[
    			26,
    			-82
    		],
    		[
    			-100,
    			-42
    		],
    		[
    			-52,
    			-70
    		],
    		[
    			-59,
    			39
    		],
    		[
    			-10,
    			85
    		],
    		[
    			59,
    			23
    		],
    		[
    			70,
    			59
    		]
    	],
    	[
    		[
    			4236,
    			19012
    		],
    		[
    			79,
    			-42
    		],
    		[
    			-16,
    			-91
    		],
    		[
    			-87,
    			23
    		],
    		[
    			-37,
    			33
    		],
    		[
    			5,
    			62
    		],
    		[
    			56,
    			15
    		]
    	],
    	[
    		[
    			4321,
    			19018
    		],
    		[
    			52,
    			-54
    		],
    		[
    			42,
    			-80
    		],
    		[
    			-64,
    			-8
    		],
    		[
    			-30,
    			142
    		]
    	],
    	[
    		[
    			2618,
    			19045
    		],
    		[
    			64,
    			-44
    		],
    		[
    			-84,
    			-37
    		],
    		[
    			-35,
    			28
    		],
    		[
    			55,
    			53
    		]
    	],
    	[
    		[
    			1329,
    			19368
    		],
    		[
    			43,
    			-20
    		],
    		[
    			9,
    			-63
    		],
    		[
    			-60,
    			-23
    		],
    		[
    			-90,
    			38
    		],
    		[
    			98,
    			68
    		]
    	],
    	[
    		[
    			798,
    			19933
    		],
    		[
    			73,
    			-35
    		],
    		[
    			40,
    			20
    		],
    		[
    			88,
    			-55
    		],
    		[
    			-17,
    			-65
    		],
    		[
    			-72,
    			60
    		],
    		[
    			-130,
    			25
    		],
    		[
    			18,
    			50
    		]
    	],
    	[
    		[
    			4611,
    			18741
    		],
    		[
    			-57,
    			2
    		],
    		[
    			-87,
    			101
    		],
    		[
    			-46,
    			110
    		],
    		[
    			-65,
    			70
    		],
    		[
    			-128,
    			21
    		],
    		[
    			-68,
    			-36
    		],
    		[
    			-58,
    			27
    		],
    		[
    			-103,
    			103
    		],
    		[
    			-202,
    			109
    		],
    		[
    			-149,
    			53
    		],
    		[
    			-94,
    			15
    		],
    		[
    			-96,
    			-18
    		],
    		[
    			-144,
    			61
    		],
    		[
    			-114,
    			64
    		],
    		[
    			-76,
    			24
    		],
    		[
    			-96,
    			-24
    		],
    		[
    			39,
    			-40
    		],
    		[
    			-42,
    			-87
    		],
    		[
    			-126,
    			-13
    		],
    		[
    			-44,
    			-61
    		],
    		[
    			-75,
    			-51
    		],
    		[
    			-87,
    			91
    		],
    		[
    			44,
    			76
    		],
    		[
    			0,
    			82
    		],
    		[
    			101,
    			52
    		],
    		[
    			-24,
    			41
    		],
    		[
    			-88,
    			-47
    		],
    		[
    			-75,
    			-81
    		],
    		[
    			-25,
    			-73
    		],
    		[
    			-46,
    			-64
    		],
    		[
    			-49,
    			-11
    		],
    		[
    			-67,
    			-82
    		],
    		[
    			89,
    			-39
    		],
    		[
    			-53,
    			-50
    		],
    		[
    			-28,
    			-69
    		],
    		[
    			-135,
    			-68
    		],
    		[
    			-13,
    			-40
    		],
    		[
    			-69,
    			-34
    		],
    		[
    			8,
    			-33
    		],
    		[
    			-98,
    			-47
    		],
    		[
    			-43,
    			-54
    		],
    		[
    			-47,
    			-10
    		],
    		[
    			-13,
    			-77
    		],
    		[
    			-142,
    			-35
    		],
    		[
    			-56,
    			-57
    		],
    		[
    			-68,
    			-20
    		],
    		[
    			-42,
    			9
    		],
    		[
    			-70,
    			-63
    		],
    		[
    			-61,
    			-10
    		],
    		[
    			76,
    			120
    		],
    		[
    			87,
    			47
    		],
    		[
    			56,
    			-18
    		],
    		[
    			36,
    			66
    		],
    		[
    			138,
    			98
    		],
    		[
    			118,
    			133
    		],
    		[
    			21,
    			139
    		],
    		[
    			-123,
    			70
    		],
    		[
    			6,
    			-68
    		],
    		[
    			-33,
    			-10
    		],
    		[
    			-51,
    			81
    		],
    		[
    			-72,
    			25
    		],
    		[
    			-90,
    			-47
    		],
    		[
    			-68,
    			66
    		],
    		[
    			27,
    			56
    		],
    		[
    			-48,
    			90
    		],
    		[
    			-89,
    			-32
    		],
    		[
    			-71,
    			-8
    		],
    		[
    			-135,
    			130
    		],
    		[
    			31,
    			26
    		],
    		[
    			-14,
    			58
    		],
    		[
    			-45,
    			3
    		],
    		[
    			-16,
    			64
    		],
    		[
    			1,
    			101
    		],
    		[
    			127,
    			190
    		],
    		[
    			108,
    			-29
    		],
    		[
    			97,
    			75
    		],
    		[
    			109,
    			3
    		],
    		[
    			35,
    			42
    		],
    		[
    			-47,
    			107
    		],
    		[
    			36,
    			71
    		],
    		[
    			-74,
    			-6
    		],
    		[
    			-83,
    			-43
    		],
    		[
    			-63,
    			20
    		],
    		[
    			-174,
    			-36
    		],
    		[
    			-115,
    			24
    		],
    		[
    			-35,
    			91
    		],
    		[
    			-142,
    			75
    		],
    		[
    			144,
    			94
    		],
    		[
    			135,
    			57
    		],
    		[
    			129,
    			20
    		],
    		[
    			16,
    			-89
    		],
    		[
    			170,
    			-6
    		],
    		[
    			71,
    			50
    		],
    		[
    			-74,
    			66
    		],
    		[
    			24,
    			40
    		],
    		[
    			-198,
    			25
    		],
    		[
    			-36,
    			80
    		],
    		[
    			-127,
    			77
    		],
    		[
    			-89,
    			67
    		],
    		[
    			11,
    			73
    		],
    		[
    			197,
    			11
    		],
    		[
    			89,
    			62
    		],
    		[
    			21,
    			84
    		],
    		[
    			108,
    			86
    		],
    		[
    			57,
    			-6
    		],
    		[
    			155,
    			84
    		],
    		[
    			158,
    			6
    		],
    		[
    			133,
    			85
    		],
    		[
    			278,
    			-74
    		],
    		[
    			139,
    			-9
    		],
    		[
    			-24,
    			-51
    		],
    		[
    			126,
    			-21
    		],
    		[
    			195,
    			12
    		],
    		[
    			142,
    			-47
    		],
    		[
    			133,
    			-4
    		],
    		[
    			101,
    			-31
    		],
    		[
    			195,
    			20
    		],
    		[
    			175,
    			-81
    		],
    		[
    			37,
    			2
    		]
    	],
    	[
    		[
    			11378,
    			11497
    		],
    		[
    			2,
    			-40
    		],
    		[
    			-12,
    			9
    		],
    		[
    			10,
    			31
    		]
    	],
    	[
    		[
    			10406,
    			11240
    		],
    		[
    			-61,
    			-45
    		],
    		[
    			9,
    			-59
    		],
    		[
    			27,
    			-92
    		],
    		[
    			-52,
    			-145
    		],
    		[
    			57,
    			-129
    		],
    		[
    			45,
    			47
    		],
    		[
    			4,
    			68
    		],
    		[
    			-50,
    			139
    		],
    		[
    			13,
    			71
    		],
    		[
    			86,
    			44
    		],
    		[
    			47,
    			39
    		],
    		[
    			-26,
    			72
    		],
    		[
    			38,
    			37
    		],
    		[
    			27,
    			-111
    		],
    		[
    			33,
    			12
    		],
    		[
    			43,
    			-16
    		],
    		[
    			41,
    			-50
    		],
    		[
    			7,
    			-62
    		],
    		[
    			18,
    			-48
    		],
    		[
    			177,
    			27
    		],
    		[
    			48,
    			-73
    		],
    		[
    			66,
    			-28
    		],
    		[
    			36,
    			14
    		],
    		[
    			31,
    			43
    		],
    		[
    			57,
    			10
    		],
    		[
    			25,
    			31
    		],
    		[
    			81,
    			20
    		],
    		[
    			-4,
    			-50
    		],
    		[
    			30,
    			-81
    		],
    		[
    			21,
    			9
    		],
    		[
    			31,
    			-33
    		],
    		[
    			37,
    			0
    		],
    		[
    			67,
    			-85
    		],
    		[
    			-3,
    			-110
    		],
    		[
    			35,
    			-21
    		],
    		[
    			43,
    			5
    		]
    	],
    	[
    		[
    			11054,
    			12346
    		],
    		[
    			-1,
    			-4
    		],
    		[
    			-10,
    			-7
    		],
    		[
    			2,
    			11
    		],
    		[
    			9,
    			0
    		]
    	],
    	[
    		[
    			11034,
    			12232
    		],
    		[
    			4,
    			-11
    		],
    		[
    			-17,
    			-2
    		],
    		[
    			1,
    			11
    		],
    		[
    			12,
    			2
    		]
    	],
    	[
    		[
    			27579,
    			12864
    		],
    		[
    			-65,
    			-92
    		],
    		[
    			-54,
    			-11
    		],
    		[
    			-19,
    			-108
    		],
    		[
    			-60,
    			-62
    		],
    		[
    			-12,
    			-98
    		],
    		[
    			-20,
    			-58
    		],
    		[
    			26,
    			-81
    		],
    		[
    			51,
    			-67
    		],
    		[
    			22,
    			-107
    		],
    		[
    			44,
    			-63
    		],
    		[
    			11,
    			-36
    		],
    		[
    			78,
    			-107
    		],
    		[
    			75,
    			-143
    		],
    		[
    			45,
    			-250
    		],
    		[
    			-8,
    			-23
    		],
    		[
    			8,
    			-104
    		],
    		[
    			15,
    			-38
    		],
    		[
    			-25,
    			-44
    		],
    		[
    			8,
    			-126
    		],
    		[
    			-26,
    			-84
    		],
    		[
    			-46,
    			-38
    		],
    		[
    			-22,
    			-38
    		],
    		[
    			-99,
    			-91
    		],
    		[
    			-46,
    			11
    		],
    		[
    			1,
    			-56
    		],
    		[
    			-25,
    			-90
    		],
    		[
    			-45,
    			-47
    		],
    		[
    			-51,
    			-34
    		],
    		[
    			-40,
    			-77
    		],
    		[
    			-26,
    			-12
    		],
    		[
    			2,
    			194
    		],
    		[
    			21,
    			49
    		],
    		[
    			-61,
    			69
    		]
    	],
    	[
    		[
    			33252,
    			6597
    		],
    		[
    			45,
    			-75
    		],
    		[
    			-27,
    			-38
    		],
    		[
    			-18,
    			113
    		]
    	],
    	[
    		[
    			33189,
    			6805
    		],
    		[
    			19,
    			-85
    		],
    		[
    			33,
    			-3
    		],
    		[
    			2,
    			-56
    		],
    		[
    			-33,
    			-26
    		],
    		[
    			-20,
    			47
    		],
    		[
    			-9,
    			93
    		],
    		[
    			8,
    			30
    		]
    	],
    	[
    		[
    			33192,
    			12489
    		],
    		[
    			1,
    			-4
    		],
    		[
    			-2,
    			0
    		],
    		[
    			1,
    			4
    		]
    	],
    	[
    		[
    			179,
    			6864
    		],
    		[
    			-3,
    			-4
    		],
    		[
    			-3,
    			4
    		],
    		[
    			4,
    			7
    		],
    		[
    			2,
    			-7
    		]
    	],
    	[
    		[
    			733,
    			7009
    		],
    		[
    			17,
    			-38
    		],
    		[
    			-34,
    			-24
    		],
    		[
    			-27,
    			48
    		],
    		[
    			44,
    			14
    		]
    	],
    	[
    		[
    			20647,
    			13131
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			20648,
    			13127
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20648,
    			13124
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20649,
    			13122
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			20650,
    			13118
    		],
    		[
    			1,
    			-8
    		]
    	],
    	[
    		[
    			20651,
    			13110
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			20651,
    			13106
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			20651,
    			13101
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			20650,
    			13102
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20651,
    			13101
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20651,
    			13098
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20651,
    			13097
    		],
    		[
    			1,
    			3
    		]
    	],
    	[
    		[
    			20652,
    			13100
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20653,
    			13098
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			20655,
    			13092
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			20657,
    			13086
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			20659,
    			13086
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20659,
    			13089
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			20659,
    			13090
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			20658,
    			13091
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20657,
    			13091
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20656,
    			13091
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20656,
    			13094
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			20659,
    			13092
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20660,
    			13090
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20660,
    			13087
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20661,
    			13088
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			20662,
    			13081
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			20662,
    			13077
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20663,
    			13078
    		],
    		[
    			-1,
    			3
    		]
    	],
    	[
    		[
    			20662,
    			13081
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			20664,
    			13076
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			20663,
    			13075
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20664,
    			13075
    		],
    		[
    			13,
    			-15
    		]
    	],
    	[
    		[
    			20677,
    			13060
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20677,
    			13057
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			20680,
    			13056
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20680,
    			13055
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20680,
    			13054
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20681,
    			13054
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			20683,
    			13054
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			20685,
    			13053
    		],
    		[
    			7,
    			-3
    		]
    	],
    	[
    		[
    			20692,
    			13050
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			20695,
    			13050
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20696,
    			13050
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20697,
    			13050
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			20699,
    			13050
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20700,
    			13048
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20701,
    			13047
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			20705,
    			13044
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			20707,
    			13038
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20708,
    			13037
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			20709,
    			13034
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20710,
    			13032
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			20710,
    			13027
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			20711,
    			13024
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20712,
    			13022
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20713,
    			13020
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20714,
    			13019
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			20716,
    			13016
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			20719,
    			13013
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20720,
    			13013
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			20723,
    			13010
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20723,
    			13007
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20723,
    			13004
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20724,
    			13002
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20724,
    			13001
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20724,
    			13000
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			20726,
    			12998
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			20729,
    			12996
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20730,
    			12995
    		],
    		[
    			5,
    			-4
    		]
    	],
    	[
    		[
    			20735,
    			12991
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20736,
    			12989
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			20739,
    			12986
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20740,
    			12984
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20741,
    			12983
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			20744,
    			12980
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			20745,
    			12976
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20746,
    			12974
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20747,
    			12973
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			20749,
    			12972
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			20750,
    			12968
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			20754,
    			12966
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20755,
    			12967
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			20759,
    			12964
    		],
    		[
    			-1,
    			-2
    		]
    	],
    	[
    		[
    			20758,
    			12962
    		],
    		[
    			3,
    			-5
    		]
    	],
    	[
    		[
    			20761,
    			12957
    		],
    		[
    			5,
    			-5
    		]
    	],
    	[
    		[
    			20766,
    			12952
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20767,
    			12950
    		],
    		[
    			0,
    			-8
    		]
    	],
    	[
    		[
    			20767,
    			12942
    		],
    		[
    			-267,
    			-2
    		]
    	],
    	[
    		[
    			20500,
    			12940
    		],
    		[
    			-8,
    			-39
    		]
    	],
    	[
    		[
    			20492,
    			12901
    		],
    		[
    			-43,
    			-8
    		]
    	],
    	[
    		[
    			20449,
    			12893
    		],
    		[
    			-36,
    			47
    		]
    	],
    	[
    		[
    			10054,
    			12337
    		],
    		[
    			-1,
    			0
    		],
    		[
    			-1,
    			2
    		],
    		[
    			2,
    			1
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			1683,
    			10242
    		],
    		[
    			0,
    			-3
    		],
    		[
    			-1,
    			0
    		],
    		[
    			-1,
    			3
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			22364,
    			11384
    		],
    		[
    			55,
    			-60
    		],
    		[
    			-56,
    			-1
    		],
    		[
    			1,
    			61
    		]
    	],
    	[
    		[
    			22321,
    			12045
    		],
    		[
    			-63,
    			-39
    		],
    		[
    			-29,
    			-82
    		],
    		[
    			7,
    			-51
    		],
    		[
    			-96,
    			-74
    		],
    		[
    			-72,
    			-28
    		],
    		[
    			-27,
    			-26
    		],
    		[
    			-53,
    			-18
    		],
    		[
    			-50,
    			-38
    		],
    		[
    			-41,
    			-82
    		],
    		[
    			-68,
    			1
    		],
    		[
    			-56,
    			-67
    		],
    		[
    			-67,
    			-37
    		],
    		[
    			-99,
    			-15
    		],
    		[
    			-26,
    			-47
    		],
    		[
    			-52,
    			-55
    		],
    		[
    			-27,
    			14
    		],
    		[
    			-26,
    			-30
    		],
    		[
    			-35,
    			-5
    		],
    		[
    			-41,
    			36
    		],
    		[
    			-24,
    			74
    		],
    		[
    			5,
    			70
    		],
    		[
    			-29,
    			120
    		],
    		[
    			-4,
    			80
    		],
    		[
    			-25,
    			138
    		],
    		[
    			14,
    			64
    		],
    		[
    			-7,
    			55
    		]
    	],
    	[
    		[
    			20385,
    			4762
    		],
    		[
    			-32,
    			-215
    		],
    		[
    			-18,
    			-71
    		],
    		[
    			-55,
    			-63
    		],
    		[
    			-44,
    			-73
    		],
    		[
    			-68,
    			-189
    		],
    		[
    			-60,
    			-134
    		],
    		[
    			-57,
    			-64
    		],
    		[
    			-51,
    			-100
    		],
    		[
    			-48,
    			-70
    		],
    		[
    			-121,
    			-137
    		],
    		[
    			-52,
    			-38
    		],
    		[
    			-65,
    			5
    		],
    		[
    			-47,
    			-52
    		],
    		[
    			-27,
    			12
    		],
    		[
    			-30,
    			-40
    		],
    		[
    			-110,
    			37
    		],
    		[
    			-27,
    			-20
    		],
    		[
    			-76,
    			17
    		],
    		[
    			-30,
    			-9
    		],
    		[
    			-51,
    			-58
    		],
    		[
    			-81,
    			3
    		],
    		[
    			-77,
    			-61
    		],
    		[
    			-42,
    			-7
    		],
    		[
    			-35,
    			62
    		],
    		[
    			-40,
    			43
    		],
    		[
    			-52,
    			20
    		],
    		[
    			9,
    			68
    		],
    		[
    			-51,
    			106
    		],
    		[
    			2,
    			42
    		],
    		[
    			34,
    			13
    		],
    		[
    			9,
    			65
    		],
    		[
    			-12,
    			91
    		],
    		[
    			-48,
    			108
    		],
    		[
    			-42,
    			129
    		],
    		[
    			-45,
    			206
    		],
    		[
    			-34,
    			78
    		]
    	],
    	[
    		[
    			20047,
    			5542
    		],
    		[
    			38,
    			10
    		],
    		[
    			49,
    			-35
    		],
    		[
    			63,
    			8
    		],
    		[
    			37,
    			-20
    		]
    	],
    	[
    		[
    			20148,
    			6644
    		],
    		[
    			-57,
    			1
    		],
    		[
    			-57,
    			-26
    		],
    		[
    			-30,
    			-31
    		],
    		[
    			-11,
    			-93
    		],
    		[
    			-93,
    			-77
    		],
    		[
    			-27,
    			-77
    		],
    		[
    			-51,
    			-88
    		],
    		[
    			-31,
    			-22
    		],
    		[
    			-46,
    			32
    		],
    		[
    			-32,
    			-14
    		],
    		[
    			-19,
    			26
    		],
    		[
    			-39,
    			4
    		]
    	],
    	[
    		[
    			20011,
    			10007
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			20010,
    			10006
    		],
    		[
    			3,
    			3
    		]
    	],
    	[
    		[
    			20013,
    			10009
    		],
    		[
    			-2,
    			-2
    		]
    	],
    	[
    		[
    			20651,
    			13101
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			20651,
    			13101
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20651,
    			13097
    		],
    		[
    			1,
    			3
    		]
    	],
    	[
    		[
    			20652,
    			13100
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20653,
    			13098
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			20655,
    			13092
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			20657,
    			13086
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			20659,
    			13086
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			20659,
    			13090
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			20657,
    			13091
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			20656,
    			13094
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			20660,
    			13090
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20661,
    			13088
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			20662,
    			13081
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			20662,
    			13077
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			20663,
    			13078
    		],
    		[
    			-1,
    			3
    		]
    	],
    	[
    		[
    			20664,
    			13076
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			20664,
    			13075
    		],
    		[
    			13,
    			-15
    		]
    	],
    	[
    		[
    			20677,
    			13060
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20677,
    			13057
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			20680,
    			13055
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20681,
    			13054
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			20683,
    			13054
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			20685,
    			13053
    		],
    		[
    			7,
    			-3
    		]
    	],
    	[
    		[
    			20692,
    			13050
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			20696,
    			13050
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20699,
    			13050
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20701,
    			13047
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			20705,
    			13044
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			20708,
    			13037
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			20710,
    			13032
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			20711,
    			13024
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20712,
    			13022
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20714,
    			13019
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			20719,
    			13013
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			20720,
    			13013
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			20723,
    			13007
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			20724,
    			13002
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			20724,
    			13000
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			20726,
    			12998
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			20729,
    			12996
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			20730,
    			12995
    		],
    		[
    			5,
    			-4
    		]
    	],
    	[
    		[
    			20735,
    			12991
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20739,
    			12986
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			20740,
    			12984
    		],
    		[
    			1,
    			-1

