# sep

[![Generated with nod](https://img.shields.io/badge/generator-nod-2196F3.svg?style=flat-square)](https://github.com/diegohaz/nod)
[![NPM version](https://img.shields.io/npm/v/sep-react.svg?style=flat-square)](https://npmjs.org/package/sep-react)
[![Build Status](https://img.shields.io/travis/diegohaz/sep/master.svg?style=flat-square)](https://travis-ci.org/diegohaz/sep) [![Coverage Status](https://img.shields.io/codecov/c/github/diegohaz/sep/master.svg?style=flat-square)](https://codecov.io/gh/diegohaz/sep/branch/master)

Test React components using the Single Element Pattern (SEP)

## Render only one element

```jsx
// bad - 2 elements
const Element = props => (
  <div {...props}>
    <span />
  </div>
);

// good
const Element = props => (
  <div {...props} />
);

// good - if Element is good
const Element2 = props => (
  <Element {...props} />
);
```

## Render children

```jsx
// good
const Element = props => (
  <div {...props} />
);

// bad - not rendering children
const Element = ({ children, ...props }) => (
  <div {...props} />
);

// good
const Element = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
```

## Render HTML props

```jsx
// good
const Element = props => (
  <div {...props} />
);

// bad - not rendering id
const Element = ({ id, ...props }) => (
  <div {...props} />
);

// good
const Element = ({ id, ...props }) => (
  <div id={id} {...props} />
);
```

## Append `className`

```jsx
// good
const Element = props => (
  <div {...props} />
);

// bad - not rendering className
const Element = ({ className, ...props }) => (
  <div {...props} />
);

// bad - replacing instead of appending
const Element = props => (
  <div className="foo" {...props} />
);

// good
const Element = ({ className, ...props }) => (
  <div className={`foo ${className}`} {...props} />
);
```

## Append `style`

```jsx
// good
const Element = props => (
  <div {...props} />
);

// bad - not passing style
const Element = ({ style, ...props }) => (
  <div {...props} />
);

// bad - replacing instead of appending
const Element = props => (
  <div style={{ padding: 0 }} {...props} />
);

// good
const Element = ({ style, ...props }) => (
  <div style={{ padding: 0, ...style }} {...props} />
);
```

## Pass event handlers

```jsx
// good
const Element = props => (
  <div {...props} />
);

// bad - not passing onClick
const Element = ({ onClick, ...props }) => (
  <div {...props} />
);

// bad - replacing onClick prop
const Element = props => (
  <div {...props} onClick={myFunction} />
);

// good
const Element = ({ onClick, ...props }) => (
  <div onClick={onClick} {...props} />
);

// good - it's ok to replace
const Element = props => (
  <div onClick={myFunction} {...props} />
);

// good
const callAll = (...fns) => (...args) => 
  fns.forEach(fn => fn && fn(...args));

const Element = ({ onClick, ...props }) => (
  <div onClick={callAll(myFunction, onClick)} {...props} />
);
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
