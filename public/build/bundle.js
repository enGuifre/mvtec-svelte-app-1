
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
    	let br;
    	let t1;
    	let h2;
    	let b0;
    	let t3;
    	let p0;
    	let t5;
    	let h3;
    	let b1;
    	let t7;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let p1;
    	let t10;
    	let img2;
    	let img2_src_value;
    	let t11;
    	let iframe0;
    	let iframe0_src_value;
    	let t12;
    	let iframe1;
    	let iframe1_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			h2 = element("h2");
    			b0 = element("b");
    			b0.textContent = `${/*header*/ ctx[0]}`;
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget sapien vel purus molestie auctor eu sit amet risus. \r\nEtiam congue, enim sed eleifend dapibus, ipsum mi interdum libero, eu dictum felis nunc et nibh. Aenean tristique elit vel lobortis bibendum. \r\nNam quis metus a risus euismod vehicula. Duis bibendum volutpat ante, at semper nisi vehicula in. Nullam non diam id justo semper consectetur a non felis. \r\nPhasellus ac quam eu velit aliquam consequat nec vel orci.";
    			t5 = space();
    			h3 = element("h3");
    			b1 = element("b");
    			b1.textContent = "Only 12% of the times I checked my phone were manually recorded";
    			t7 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget sapien vel purus molestie auctor eu sit amet risus. \r\nEtiam congue, enim sed eleifend dapibus, ipsum mi interdum libero, eu dictum felis nunc et nibh. Aenean tristique elit vel lobortis bibendum. \r\nNam quis metus a risus euismod vehicula. Duis bibendum volutpat ante, at semper nisi vehicula in. Nullam non diam id justo semper consectetur a non felis. \r\nPhasellus ac quam eu velit aliquam consequat nec vel orci. \r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget sapien vel purus molestie auctor eu sit amet risus. \r\nEtiam congue, enim sed eleifend dapibus, ipsum mi interdum libero, eu dictum felis nunc et nibh. Aenean tristique elit vel lobortis bibendum. \r\nNam quis metus a risus euismod vehicula. Duis bibendum volutpat ante, at semper nisi vehicula in. Nullam non diam id justo semper consectetur a non felis. \r\nPhasellus ac quam eu velit aliquam consequat nec vel orci.\r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget sapien vel purus molestie auctor eu sit amet risus. \r\nEtiam congue, enim sed eleifend dapibus, ipsum mi interdum libero, eu dictum felis nunc et nibh. Aenean tristique elit vel lobortis bibendum. \r\nNam quis metus a risus euismod vehicula. Duis bibendum volutpat ante, at semper nisi vehicula in. Nullam non diam id justo semper consectetur a non felis. \r\nPhasellus ac quam eu velit aliquam consequat nec vel orci.\r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget sapien vel purus molestie auctor eu sit amet risus. \r\nEtiam congue, enim sed eleifend dapibus, ipsum mi interdum libero, eu dictum felis nunc et nibh. Aenean tristique elit vel lobortis bibendum. \r\nNam quis metus a risus euismod vehicula. Duis bibendum volutpat ante, at semper nisi vehicula in.";
    			t10 = space();
    			img2 = element("img");
    			t11 = space();
    			iframe0 = element("iframe");
    			t12 = space();
    			iframe1 = element("iframe");
    			if (img0.src !== (img0_src_value = "photo 1.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Image");
    			attr_dev(img0, "class", "svelte-t9g9iy");
    			add_location(img0, file, 62, 1, 1019);
    			add_location(br, file, 63, 1, 1059);
    			add_location(b0, file, 64, 5, 1070);
    			attr_dev(h2, "class", "svelte-t9g9iy");
    			add_location(h2, file, 64, 1, 1066);
    			set_style(div0, "position", "relative");
    			add_location(div0, file, 61, 0, 984);
    			attr_dev(p0, "class", "svelte-t9g9iy");
    			add_location(p0, file, 67, 0, 1102);
    			add_location(b1, file, 72, 4, 1598);
    			attr_dev(h3, "class", "svelte-t9g9iy");
    			add_location(h3, file, 72, 0, 1594);
    			if (img1.src !== (img1_src_value = "photo 2.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Image");
    			attr_dev(img1, "class", "smaller svelte-t9g9iy");
    			add_location(img1, file, 75, 1, 1709);
    			attr_dev(p1, "class", "svelte-t9g9iy");
    			add_location(p1, file, 76, 1, 1765);
    			attr_dev(div1, "class", "image-container svelte-t9g9iy");
    			add_location(div1, file, 74, 0, 1677);
    			if (img2.src !== (img2_src_value = "postits_4.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Image");
    			attr_dev(img2, "class", "svelte-t9g9iy");
    			add_location(img2, file, 93, 0, 3589);
    			if (iframe0.src !== (iframe0_src_value = "https://flo.uri.sh/visualisation/13237030/embed")) attr_dev(iframe0, "src", iframe0_src_value);
    			attr_dev(iframe0, "title", "Interactive or visual content");
    			attr_dev(iframe0, "class", "flourish-embed-iframe");
    			attr_dev(iframe0, "frameborder", "0");
    			attr_dev(iframe0, "scrolling", "no");
    			set_style(iframe0, "width", "100%");
    			set_style(iframe0, "height", "600px");
    			attr_dev(iframe0, "sandbox", "allow-same-origin allow-forms allow-scripts allow-downloads \r\nallow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation");
    			add_location(iframe0, file, 94, 0, 3630);
    			if (iframe1.src !== (iframe1_src_value = "https://flo.uri.sh/visualisation/13188024/embed")) attr_dev(iframe1, "src", iframe1_src_value);
    			attr_dev(iframe1, "title", "Interactive or visual content");
    			attr_dev(iframe1, "class", "flourish-embed-iframe");
    			attr_dev(iframe1, "frameborder", "0");
    			attr_dev(iframe1, "scrolling", "no");
    			set_style(iframe1, "width", "100%");
    			set_style(iframe1, "height", "600px");
    			attr_dev(iframe1, "sandbox", "allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox \r\nallow-top-navigation-by-user-activation");
    			add_location(iframe1, file, 99, 0, 3997);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, br);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    			append_dev(h2, b0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, b1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img1);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, img2, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, iframe0, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, iframe1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(img2);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(iframe0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(iframe1);
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
