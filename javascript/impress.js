/**
 * impress.js
 *
 * impress.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 * MIT Licensed.
 *
 * Copyright 2011 Bartek Szopka (@bartaz)
 */

(function (document, window) {

	// HELPER FUNCTIONS

	var pfx = (function () {

		var style = document.createElement('dummy').style,
			prefixes = 'Webkit Moz O ms Khtml'.split(' '),
			memory = {};

		return function (prop) {
			if (typeof memory[ prop ] === "undefined") {

				var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
					props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

				memory[ prop ] = null;
				for (var i in props) {
					if (props.hasOwnProperty(i)) {
						if (style[ props[i] ] !== undefined) {
							memory[ prop ] = props[i];
							break;
						}
					}
				}

			}

			return memory[ prop ];
		};

	})();

	var arrayify = function (a) {
		return [].slice.call(a);
	};

	Array.prototype.contains = function (searchValue) {
		for (var i = 0, len = this.length; i < len && this[i] !== searchValue; i++);
		return i < len;
	};

	var css = function (el, props) {
		for (var key in props) {
			if (props.hasOwnProperty(key)) {
				var pkey = pfx(key);
				if (pkey !== null) {
					el.style[pkey] = props[key];
				}
			}
		}
		return el;
	};

	var byId = function (id) {
		return document.getElementById(id);
	};

	var $ = function (selector, context) {
		context = context || document;
		return context.querySelector(selector);
	};

	var $$ = function (selector, context) {
		context = context || document;
		return arrayify(context.querySelectorAll(selector));
	};

	var translate = function (t) {
		return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
	};

	var rotate = function (r, revert) {
		var rX = " rotateX(" + r.x + "deg) ",
			rY = " rotateY(" + r.y + "deg) ",
			rZ = " rotateZ(" + r.z + "deg) ";

		return revert ? rZ + rY + rX : rX + rY + rZ;
	};

	var scale = function (s) {
		return " scaleX(" + s.x + ") scaleY(" + s.y + ") scaleZ(" + s.z + ") ";
	};

	// CHECK SUPPORT

	var ua = navigator.userAgent.toLowerCase();
	var impressSupported = ( pfx("perspective") !== null ) &&
		( ua.search(/(iphone)|(ipod)|(ipad)|(android)/) == -1 );

	// DOM ELEMENTS

	var impress = byId("impress");

	if (!impressSupported) {
		impress.className = "impress-not-supported";
		return;
	} else {
		impress.className = "";
	}

	var canvas = document.createElement("div");
	canvas.className = "canvas";

	arrayify(impress.childNodes).forEach(function (el) {
		canvas.appendChild(el);
	});
	impress.appendChild(canvas);

	var steps = $$(".step", impress);

	// SETUP
	// set initial values and defaults

	document.documentElement.style.height = "100%";

	css(document.body, {
		height:"100%",
		overflow:"hidden"
	});

	var props = {
		position:"absolute",
		transformOrigin:"top left",
		transition:"all 1s ease-in-out",
		transformStyle:"preserve-3d"
	};

	var standardProps = function (step) {
		return {
			position:"absolute",
			transform:"translate(-50%,-50%)" +
				translate(step.translate) +
				rotate(step.rotate, false) +
				scale(step.scale),
			transformStyle:"preserve-3d",
			transitionProperty:"all",
			transitionTimingFunction:"ease-out",
			transitionDuration:"500ms"

		}
	};

	css(impress, props);
	css(impress, {
		top:"50%",
		left:"50%",
		perspective:"1000px"
	});
	css(canvas, props);

	var current = {
		translate:{ x:0, y:0, z:0 },
		rotate:{ x:0, y:0, z:0 },
		scale:{ x:1, y:1, z:1 }
	};

	cssTranslation(steps);

	// making given step active

	var active = null;
	var hashTimeout = null;
	var hovered = null;

	var isOverview = function () {
		return (active !== null && active !== undefined && "overview" === active.id);
	};

	var select = function (el) {
		// selected element is not defined as step or is already active
		if (!el || !el.stepData || el == active) return false;

		// Sometimes it's possible to trigger focus on first link with some keyboard action.
		// Browser in such a case tries to scroll the page to make this element visible
		// (even that body overflow is set to hidden) and it breaks our careful positioning.
		//
		// So, as a lousy (and lazy) workaround we will make the page scroll back to the top
		// whenever slide is selected
		//
		// If you are reading this and know any better way to handle it, I'll be glad to hear about it!
		window.scrollTo(0, 0);

		var step = el.stepData;

		if (active) active.classList.remove("active");
		el.classList.add("active");

		impress.className = "step-" + el.id;

		// `#/step-id` is used instead of `#step-id` to prevent default browser
		// scrolling to element in hash
		//
		// and it has to be set after animation finishes, because in chrome it
		// causes transtion being laggy
		window.clearTimeout(hashTimeout);
		hashTimeout = window.setTimeout(function () {
			window.location.hash = "#/" + el.id;
		}, 1000);

		var target = {
			rotate:{
				x:-parseInt(step.rotate.x, 10),
				y:-parseInt(step.rotate.y, 10),
				z:-parseInt(step.rotate.z, 10)
			},
			scale:{
				x:1 / parseFloat(step.scale.x),
				y:1 / parseFloat(step.scale.y),
				z:1 / parseFloat(step.scale.z)
			}
		};

		if (el.id === 'overview') {
			target.translate = {
				x:-step.translate.x,
				y:-step.translate.y / 2,
				z:-step.translate.z
			}
		} else {
			target.translate = {
				x:-step.translate.x,
				y:-step.translate.y,
				z:-step.translate.z
			}
		}
		var zoomin = target.scale.x >= current.scale.x;

		if (el.id !== 'overview') {
			css(el, {
				position:"absolute",
				transform:"translate(-50%,-50%)" +
					translate(step.selectTranslate) +
					rotate(step.rotate, false) +
					scale(step.scale),
				transformStyle:"preserve-3d",
				transitionProperty:"all",
				transitionTimingFunction:"ease-out",
				transitionDuration:"500ms",
				width:'550px',
				height:'550px'
			});
			var img = $('img', el);
			img.src = img.src.replace('size=300', 'size=500');
		}
		css(impress, {
			// to keep the perspective look similar for different scales
			// we need to 'scale' the perspective, too
			perspective:step.scale.x * 1000 + "px",
			transform:scale(target.scale),
			transitionDelay:(zoomin ? "500ms" : "0ms")
		});

		css(canvas, {
			transform:rotate(target.rotate, true) + translate(target.translate),
			transitionDelay:(zoomin ? "0ms" : "500ms")
		});

		current = target;
		active = el;

		return el;
	};

	function deselect(el) {
		var step = el.stepData;
		if (el.id !== 'overview') {
			css(el, standardProps(step));
			css(el, {
				width:'350px',
				height:'350px'
			});
			var img = $('img', el);
			img.src = img.src.replace('size=500', 'size=300');
		}
	}

	// EVENTS

	function partiallyLoad(next) {
		if (next >= (globalImageCount - IMAGES_PER_ROW)) load(35 * globalLoadCount);
	}

	var keyCode = [9, 32, 33, 34, 37, 38, 39, 40];
	document.addEventListener("keydown", function (event) {
		if (keyCode.contains(event.keyCode)) {
			hovered = hovered || steps[0];
			var next;
			if (!isOverview()) {
				switch (event.keyCode) {
					case 33:  // pg up
					case 37:  // left
						deselect(active);
						next = steps.indexOf(active) - 1;
						partiallyLoad(next);
						next = next >= 1 ? steps[ next ] : steps[ steps.length - 1 ];
						select(next);
						break;
					case 38:  // up
						deselect(active);
						next = steps.indexOf(active) - IMAGES_PER_ROW;
						partiallyLoad(next);
						next = next >= 1 ? steps[ next ] : steps[ steps.length + next ];
						select(next);
						break;
					case 9:   // tab
					case 34:  // pg down
					case 39:  // right
						deselect(active);
						next = steps.indexOf(active) + 1;
						partiallyLoad(next);
						next = next < steps.length ? steps[ next ] : steps[ 1 ];
						select(next);
						break;
					case 40:  // down
						deselect(active);
						next = steps.indexOf(active) + IMAGES_PER_ROW;
						partiallyLoad(next);
						next = next < steps.length ? steps[ next ] : steps[ next - steps.length ];
						select(next);
						break;
					case 32: // space
						deselect(active);
						next = steps[ 0 ];
						hovered = active;
						select(next);
						hover(hovered);
						break;
				}
			} else {
				switch (event.keyCode) {
					case 33:  // pg up
					case 37:  // left
						next = steps.indexOf(hovered) - 1;
						partiallyLoad(next);
						next = next >= 1 ? steps[ next ] : steps[ steps.length - 1 ];
						if (null !== hovered) {
							unHover(hovered);
						}
						hovered = next;
						hover(hovered);
						break;
					case 38:  // up
						next = steps.indexOf(hovered) - IMAGES_PER_ROW;
						partiallyLoad(next);
						next = next >= 1 ? steps[ next ] : steps[ steps.length + next ];
						if (null !== hovered) {
							unHover(hovered);
						}
						hovered = next;
						hover(hovered);
						break;
					case 9:   // tab
					case 34:  // pg down
					case 39:  // right
						next = steps.indexOf(hovered) + 1;
						partiallyLoad(next);
						next = next < steps.length ? steps[ next ] : steps[ 1 ];
						if (null !== hovered) {
							unHover(hovered);
						}
						hovered = next;
						hover(hovered);
						break;
					case 40:  // down
						next = steps.indexOf(hovered) + IMAGES_PER_ROW;
						partiallyLoad(next);
						next = next < steps.length ? steps[ next ] : steps[ next - steps.length ];
						if (null !== hovered) {
							unHover(hovered);
						}
						hovered = next;
						hover(hovered);
						break;
					case 32: // space
						unHover(hovered);
						next = steps.indexOf(hovered);
						next = steps[ next ];
						select(next);
						break;
				}
			}
			event.preventDefault();
		}
	}, false);

	var hover = function (el) {
		var step = el.stepData;
		css(el, {
			position:"absolute",
			transform:"translate(-50%,-50%)" +
				translate(step.hoverTranslate) +
				rotate(step.rotate, false) +
				scale(step.hoverScale),
			transformStyle:"preserve-3d",
			transitionProperty:"all",
			transitionTimingFunction:"ease-out",
			transitionDuration:"500ms"
		});
		el.style["box-shadow"] = "32px 32px 40px #000";
	};

	var unHover = function (el) {
		var step = el.stepData;
		css(el, standardProps(step));
		el.style["box-shadow"] = "";
	};

	document.addEventListener("click", function (event) {
		// event delegation with "bubbling"
		// check if event target (or any of its parents is a link or a step)
		var target = event.target;
		while ((target.tagName != "A") &&
			(!target.stepData) &&
			(target != document.body)) {
			target = target.parentNode;
		}

		if (target.tagName == "A") {
			var href = target.getAttribute("href");

			// if it's a link to presentation step, target this step
			if (href && href[0] == '#') {
				target = byId(href.slice(1));
			}
		}

		if (select(target)) {
			event.preventDefault();
		}
	}, false);

	var getElementFromUrl = function () {
		// get id from url # by removing `#` or `#/` from the beginning,
		// so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
		return byId(window.location.hash.replace(/^#\/?/, ""));
	};

	window.addEventListener("hashchange", function () {
		select(getElementFromUrl());
	}, false);

	function cssTranslation(elem, partiallyLoad) {
		elem.forEach(function (el) {
			var data = el.dataset,
				step = {
					translate:{
						x:data.x || 0,
						y:data.y || 0,
						z:data.z || 0
					},
					hoverTranslate:{
						x:data.x || 0,
						y:data.y || 0,
						z:data.z + 200 || 200
					},
					selectTranslate:{
						x:data.x || 0,
						y:data.y || 0,
						z:data.z + 50 || 50
					},
					rotate:{
						x:data.rotateX || 0,
						y:data.rotateY || 0,
						z:data.rotateZ || data.rotate || 0
					},
					scale:{
						x:data.scaleX || data.scale || 1,
						y:data.scaleY || data.scale || 1,
						z:data.scaleZ || 1
					},
					hoverScale:{
						x:data.hoverX || data.hover || 1,
						y:data.hoverY || data.hover || 1,
						z:data.hoverZ || 1
					}
				};

			el.stepData = step;
			ELEM_ID++;
			if (!el.id) el.id = "step-" + ELEM_ID;

			css(el, {
				position:"absolute",
				transform:"translate(-50%,-50%)" +
					translate(step.translate) +
					rotate(step.rotate, false) +
					scale(step.scale),
				transformStyle:"preserve-3d"
			});
			if (partiallyLoad) canvas.appendChild(el);
		});
		if (partiallyLoad) steps = $$(".step", impress);
	}


	// START
	// by selecting step defined in url or first step of the presentation
	select(getElementFromUrl() || steps[0]);


	return updateImpress = function (elem) {
		elem = arrayify(elem.childNodes);
		cssTranslation(elem, true);
	};

})(document, window);

