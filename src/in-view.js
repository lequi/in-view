import {
    getElements,
    inViewport,
    throttle
} from './utils';

const initInView = () => {

    let registry = {},
        history  = [],
        tail;

    window.addEventListener('scroll', throttle(() => {
        clearTimeout(tail);
        tail = setTimeout(() => {
            checkAll();
        }, 120);
        checkAll();
    }, 100));

    function checkAll() {
        history.forEach(selector => {
            registry[selector].check();
        });
    };

    let inView = (selector) => {

        let elements = getElements(selector);

        if (registry.hasOwnProperty(selector)) {
            registry[selector].elements = elements;
        } else {
            registry[selector] = new inViewGroup(elements);
            history.push(selector);
        }

        return registry[selector];

    };

    inView.is = inViewport;

    return inView;

};

class inViewGroup {

    constructor(elements) {
        this.current  = [];
        this.elements = elements;
        this.handlers = { enter: [], exit: [] };
    }

    check() {
        this.elements.forEach(el => {
            let visible = inViewport(el);
            let index   = this.current.indexOf(el);
            if (visible && index < 0) {
                this.current.push(el);
                this.emit('enter', el);
                return;
            }
            if (!visible && index > -1) {
                this.current.splice(index, 1);
                this.emit('exit', el);
            }
        });
        return this;
    }

    on(event, handler) {
        this.handlers[event].push(handler);
        this.check();
        return this;
    }

    emit(event, element) {
        let length = this.handlers[event].length;
        while (--length > -1) {
            this.handlers[event][length](element);
        }
        return this;
    }

}

export function inViewport(element, offset = 0) {
    let bounds = element.getBoundingClientRect();
    return bounds.bottom > offset
        && bounds.right > offset
        && window.innerWidth - bounds.left > offset
        && window.innerHeight - bounds.top > offset;
}

export function throttle(fn, threshold, context) {
    let prev = 0;
    return () => {
        let now  = new Date().getTime();
        if (now - prev > threshold) {
            fn.call(context);
            prev = now;
        }
    };
}

export function getElements(selector) {
    return [].slice.call(document.querySelectorAll(selector));
}

export default initInView();
