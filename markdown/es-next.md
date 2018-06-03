Support for modern JavaScript Syntax and features can be added by selecting ES2015+ during `yo puppy`. This adds Browserify and Babel to your puppy project. __This means you'll need to import modules in a new way.__

### Import with NPM:
If possible, modules should be imported with npm, not bower.
1. Check if the module exists as a CommonJS module by searching [npm](https://www.npmjs.com/).
2. Install the module with `npm install --save <module-name>`
3. Where the module is needed use the `import` statement. For example, `import $ from 'jQuery';`

### Import with Bower:
If the dependency is unavailable in NPM, you may have to use bower.
1. `bower install --save <your-dependency>`
2. Add a `<script>` tag referencing the vendor script in `layouts/base.twig`:
```html
<!-- build:js /static/js/vendor.js -->
<script type="text/javascript" src="/bower_components/scrollmagic/scrollmagic/minified/ScrollMagic.min.js"></script>
<!-- endbuild -->
```
3. Where you need to call the dependency, you'll need to access it from the window namespace: ex. `window.ScrollMagic` Within a module you could assign the dependency to a constant: ex. `const Modernizr = window.Modernizr;`.

### Resources
[Babel](https://babeljs.io/)
[Resources for ES2015](https://github.com/ericdouglas/ES6-Learning)
[MDN Module Import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
[MDN Module Export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
