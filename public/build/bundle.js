
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    /* src\App.svelte generated by Svelte v3.31.0 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let br0;
    	let t1;
    	let h2;
    	let b;
    	let t3;
    	let p;
    	let t5;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let br1;
    	let t7;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let iframe0;
    	let iframe0_src_value;
    	let div1;
    	let a0;
    	let t9;
    	let iframe1;
    	let iframe1_src_value;
    	let div2;
    	let a1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			h2 = element("h2");
    			b = element("b");
    			b.textContent = `${/*header*/ ctx[0]}`;
    			t3 = space();
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. \r\n\tSed eget sapien vel purus molestie auctor eu sit amet risus. \r\n\tEtiam congue, enim sed eleifend dapibus, ipsum mi interdum libero, \r\n\teu dictum felis nunc et nibh. Aenean tristique elit vel lobortis bibendum. \r\n\tNam quis metus a risus euismod vehicula. Duis bibendum volutpat ante, at semper nisi vehicula in. \r\n\tNullam non diam id justo semper consectetur a non felis. \r\n\tPhasellus ac quam eu velit aliquam consequat nec vel orci.";
    			t5 = space();
    			img1 = element("img");
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			img2 = element("img");
    			t8 = space();
    			iframe0 = element("iframe");
    			div1 = element("div");
    			a0 = element("a");
    			t9 = space();
    			iframe1 = element("iframe");
    			div2 = element("div");
    			a1 = element("a");
    			if (img0.src !== (img0_src_value = "photo 1.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Image");
    			attr_dev(img0, "class", "svelte-dw18ew");
    			add_location(img0, file, 36, 3, 561);
    			add_location(br0, file, 37, 3, 602);
    			add_location(b, file, 38, 7, 615);
    			attr_dev(h2, "class", "svelte-dw18ew");
    			add_location(h2, file, 38, 3, 611);
    			set_style(div0, "position", "relative");
    			add_location(div0, file, 35, 1, 524);
    			attr_dev(p, "class", "svelte-dw18ew");
    			add_location(p, file, 41, 0, 648);
    			if (img1.src !== (img1_src_value = "photo 2.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Image");
    			attr_dev(img1, "class", "smaller svelte-dw18ew");
    			add_location(img1, file, 49, 1, 1153);
    			add_location(br1, file, 51, 1, 1210);
    			if (img2.src !== (img2_src_value = "postits_4.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Image");
    			attr_dev(img2, "class", "svelte-dw18ew");
    			add_location(img2, file, 53, 0, 1219);
    			if (iframe0.src !== (iframe0_src_value = "https://flo.uri.sh/visualisation/13237030/embed")) attr_dev(iframe0, "src", iframe0_src_value);
    			attr_dev(iframe0, "title", "Interactive or visual content");
    			attr_dev(iframe0, "class", "flourish-embed-iframe");
    			attr_dev(iframe0, "frameborder", "0");
    			attr_dev(iframe0, "scrolling", "no");
    			set_style(iframe0, "width", "100%");
    			set_style(iframe0, "height", "600px");
    			attr_dev(iframe0, "sandbox", "allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation");
    			add_location(iframe0, file, 54, 0, 1259);
    			attr_dev(a0, "class", "flourish-credit");
    			attr_dev(a0, "href", "https://public.flourish.studio/visualisation/13237030/?utm_source=embed&utm_campaign=visualisation/13237030");
    			attr_dev(a0, "target", "_top");
    			set_style(a0, "text-decoration", "none", 1);
    			add_location(a0, file, 54, 435, 1694);
    			set_style(div1, "width", "100%!");
    			set_style(div1, "margin-top", "4px", 1);
    			set_style(div1, "text-align", "right", 1);
    			add_location(div1, file, 54, 357, 1616);
    			if (iframe1.src !== (iframe1_src_value = "https://flo.uri.sh/visualisation/13188024/embed")) attr_dev(iframe1, "src", iframe1_src_value);
    			attr_dev(iframe1, "title", "Interactive or visual content");
    			attr_dev(iframe1, "class", "flourish-embed-iframe");
    			attr_dev(iframe1, "frameborder", "0");
    			attr_dev(iframe1, "scrolling", "no");
    			set_style(iframe1, "width", "100%");
    			set_style(iframe1, "height", "600px");
    			attr_dev(iframe1, "sandbox", "allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation");
    			add_location(iframe1, file, 55, 1, 1902);
    			attr_dev(a1, "class", "flourish-credit");
    			attr_dev(a1, "href", "https://public.flourish.studio/visualisation/13188024/?utm_source=embed&utm_campaign=visualisation/13188024");
    			attr_dev(a1, "target", "_top");
    			set_style(a1, "text-decoration", "none", 1);
    			add_location(a1, file, 55, 436, 2337);
    			set_style(div2, "width", "100%!");
    			set_style(div2, "margin-top", "4px", 1);
    			set_style(div2, "text-align", "right", 1);
    			add_location(div2, file, 55, 358, 2259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    			append_dev(h2, b);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, img1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, img2, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, iframe0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a0);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, iframe1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(img1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(img2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(iframe0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(iframe1);
    			if (detaching) detach_dev(div2);
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
    	validate_slots("App", slots, []);
    	let header = "Enough phone for today!";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ header });

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [header];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // const url = 'URL to your JSON data';

    // fetch(url)
    //   .then((res) => res.json())
    //   .then((json) => {
    // 	const data = json;

    //     const app = new App({
    //       target: document.body,
    //       props: {
    // 		data: data
    // 		/*You can also pass each object in 'data' as an individual prop.
    // 		For example:
    // 			meta: data.meta,
    // 			menu: data.menu,
    // 			content: data.content
    			
    // 			OR

    // 			data:{...data}
    // 		*/
    //       }
    // 	});
    // });

    const app = new App({target: document.body});

    return app;

}());
//# sourceMappingURL=bundle.js.map
