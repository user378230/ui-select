var KEY = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 36,
    END: 35,
    BACKSPACE: 8,
    DELETE: 46,
    COMMAND: 91,

    MAP: { 91 : "COMMAND", 8 : "BACKSPACE" , 9 : "TAB" , 13 : "ENTER" , 16 : "SHIFT" , 17 : "CTRL" , 18 : "ALT" , 19 : "PAUSEBREAK" , 20 : "CAPSLOCK" , 27 : "ESC" , 32 : "SPACE" , 33 : "PAGE_UP", 34 : "PAGE_DOWN" , 35 : "END" , 36 : "HOME" , 37 : "LEFT" , 38 : "UP" , 39 : "RIGHT" , 40 : "DOWN" , 43 : "+" , 44 : "PRINTSCREEN" , 45 : "INSERT" , 46 : "DELETE", 48 : "0" , 49 : "1" , 50 : "2" , 51 : "3" , 52 : "4" , 53 : "5" , 54 : "6" , 55 : "7" , 56 : "8" , 57 : "9" , 59 : ";", 61 : "=" , 65 : "A" , 66 : "B" , 67 : "C" , 68 : "D" , 69 : "E" , 70 : "F" , 71 : "G" , 72 : "H" , 73 : "I" , 74 : "J" , 75 : "K" , 76 : "L", 77 : "M" , 78 : "N" , 79 : "O" , 80 : "P" , 81 : "Q" , 82 : "R" , 83 : "S" , 84 : "T" , 85 : "U" , 86 : "V" , 87 : "W" , 88 : "X" , 89 : "Y" , 90 : "Z", 96 : "0" , 97 : "1" , 98 : "2" , 99 : "3" , 100 : "4" , 101 : "5" , 102 : "6" , 103 : "7" , 104 : "8" , 105 : "9", 106 : "*" , 107 : "+" , 109 : "-" , 110 : "." , 111 : "/", 112 : "F1" , 113 : "F2" , 114 : "F3" , 115 : "F4" , 116 : "F5" , 117 : "F6" , 118 : "F7" , 119 : "F8" , 120 : "F9" , 121 : "F10" , 122 : "F11" , 123 : "F12", 144 : "NUMLOCK" , 145 : "SCROLLLOCK" , 186 : ";" , 187 : "=" , 188 : "," , 189 : "-" , 190 : "." , 191 : "/" , 192 : "`" , 219 : "[" , 220 : "\\" , 221 : "]" , 222 : "'"
    },

    isControl: function (e) {
        var k = e.which;
        switch (k) {
        case KEY.COMMAND:
        case KEY.SHIFT:
        case KEY.CTRL:
        case KEY.ALT:
            return true;
        }

        if (e.metaKey || e.ctrlKey || e.altKey) return true;

        return false;
    },
    isFunctionKey: function (k) {
        k = k.which ? k.which : k;
        return k >= 112 && k <= 123;
    },
    isVerticalMovement: function (k){
      return ~[KEY.UP, KEY.DOWN].indexOf(k);
    },
    isHorizontalMovement: function (k){
      return ~[KEY.LEFT,KEY.RIGHT,KEY.BACKSPACE,KEY.DELETE].indexOf(k);
    },
    toSeparator: function (k) {
      var sep = {ENTER:"\n",TAB:"\t",SPACE:" "}[k];
      if (sep) return sep;
      // return undefined for special keys other than enter, tab or space.
      // no way to use them to cut strings.
      return KEY[k] ? undefined : k;
    }
  };

/**
 * Add querySelectorAll() to jqLite.
 *
 * jqLite find() is limited to lookups by tag name.
 * TODO This will change with future versions of AngularJS, to be removed when this happens
 *
 * See jqLite.find - why not use querySelectorAll? https://github.com/angular/angular.js/issues/3586
 * See feat(jqLite): use querySelectorAll instead of getElementsByTagName in jqLite.find https://github.com/angular/angular.js/pull/3598
 */
if (angular.element.prototype.querySelectorAll === undefined) {
  angular.element.prototype.querySelectorAll = function(selector) {
    return angular.element(this[0].querySelectorAll(selector));
  };
}

/**
 * Add closest() to jqLite.
 */
if (angular.element.prototype.closest === undefined) {
  angular.element.prototype.closest = function( selector) {
    var elem = this[0];
    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

    while (elem) {
      if (matchesSelector.bind(elem)(selector)) {
        return elem;
      } else {
        elem = elem.parentElement;
      }
    }
    return false;
  };
}

var latestId = 0;

var uis = angular.module('ui.select', [])

.constant('uiSelectConfig', {
  theme: 'bootstrap',
  searchEnabled: true,
  sortable: false,
  placeholder: '', // Empty by default, like HTML tag <select>
  refreshDelay: 1000, // In milliseconds
  closeOnSelect: true,
  skipFocusser: false,
  dropdownPosition: 'auto',
  removeSelected: true,
  resetSearchInput: false,
  generateId: function() {
    return latestId++;
  },
  appendToBody: false
})

// See Rename minErr and make it accessible from outside https://github.com/angular/angular.js/issues/6913
.service('uiSelectMinErr', function() {
  var minErr = angular.$$minErr('ui.select');
  return function() {
    var error = minErr.apply(this, arguments);
    var message = error.message.replace(new RegExp('\nhttp://errors.angularjs.org/.*'), '');
    return new Error(message);
  };
})

/**
 * Highlights text that matches $select.search.
 *
 * Taken from AngularUI Bootstrap Typeahead
 * See https://github.com/angular-ui/bootstrap/blob/0.10.0/src/typeahead/typeahead.js#L340
 */
.filter('highlight', function() {
  function escapeRegexp(queryToEscape) {
    return ('' + queryToEscape).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }

  return function(matchItem, query) {
    return query && matchItem ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<span class="ui-select-highlight">$&</span>') : matchItem;
  };
})

/**
 * A read-only equivalent of jQuery's offset function: http://api.jquery.com/offset/
 *
 * Taken from AngularUI Bootstrap Position:
 * See https://github.com/angular-ui/bootstrap/blob/master/src/position/position.js#L70
 */
.factory('uisOffset',
  ['$document', '$window',
  function ($document, $window) {

  return function(element) {
    var boundingClientRect = element[0].getBoundingClientRect();
    return {
      width: boundingClientRect.width || element.prop('offsetWidth'),
      height: boundingClientRect.height || element.prop('offsetHeight'),
      top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
      left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
    };
  };
}])
/**
 * Wrapper templateRequest service in order to support angular v1.2.X
 * as the $templateRequest service was added in v1.3.0+
 */
.factory('uisTemplateRequest', 
  ['$injector', 
    function($injector) {
      if($injector.has('$templateRequest')) {
        return $injector.get('$templateRequest');
      } else {
        return $injector.get('uisTemplateRequestV12');
      }
    }
])

 /**
  * Copy of $TemplateRequestProvider from angular@v1.5.8
  */
.provider('uisTemplateRequestV12Provider',
  [function uisTemplateRequestV12Provider() {

    var httpOptions;

    this.httpOptions = function(val) {
      if (val) {
        httpOptions = val;
        return this;
      }
      return httpOptions;
    };

    this.$get = ['$templateCache', '$http', '$q', '$sce', function($templateCache, $http, $q, $sce) {

      function handleRequestFn(tpl, ignoreRequestError) {
        handleRequestFn.totalPendingRequests++;

        if (!angular.isString(tpl) || angular.isUndefined($templateCache.get(tpl))) {
          tpl = $sce.getTrustedResourceUrl(tpl);
        }

        return $http.get(tpl, angular.extend({
            cache: $templateCache
          }, httpOptions))
          .finally(function() {
            handleRequestFn.totalPendingRequests--;
          })
          .then(function(response) {
            $templateCache.put(tpl, response.data);
            return response.data;
          }, handleError);

        function handleError(resp) {
          if (!ignoreRequestError) {
            throw new Error('tpload', 
            'Failed to load template: ' + tpl + ' (HTTP status: ' + resp.status + ' ' + resp.statusText + ')');
          }
          return $q.reject(resp);
        }
      }

      handleRequestFn.totalPendingRequests = 0;

      return handleRequestFn;
    }
  ];
}])
  .factory('uisAsyncCompilerFactory',
    ['uisTemplateRequest', '$templateCache', '$compile',
    function(uisTemplateRequest, $templateCache, $compile) {
      /**
       * templateUrl - The template to be loaded
       * preCompileFn - Executed as part of the compile function, before any DOM manipulation has taken place
       * templateConfigurationFn
       *  - Executed once the template has been loaded (either from the cache or async from the network)
       *  - function(templateElement, contents, tAttrs)
       *    - templateElement - The template in DOM form
       *    - contents - The original contents wrapped by the directive
       *    - tAttrs - tAttrs argument from the compileFn
       *    - The modified templateElement is appened to the DOM in place of the contents
       * 
       */
      function asyncCompilationFactory(templateUrl, preCompileFn, templateConfigurationFn, linkFn1, linkFn2) {

        var prePostLinkFn, postLinkFn;
        if(arguments.length === 4) {
          postLinkFn = linkFn1;
        } else {
          prePostLinkFn = linkFn1;
          postLinkFn = linkFn2;
        }

        return function asyncCompileFn(tElement, tAttrs) {

          var url = templateUrl;
          if(angular.isFunction(templateUrl)) {
            url = templateUrl(tElement, tAttrs);
          }

          if(preCompileFn) {
            preCompileFn(tElement, tAttrs);
          }
          
          var contents = angular.element('<div>').append(tElement.contents());
          tElement.empty();

          if(angular.isDefined($templateCache.get(url))) {

            // modify template and return normal link function
            var templateElement = angular.element($templateCache.get(url));
            
            templateConfigurationFn(templateElement, contents, tAttrs);
            
            tElement.append(templateElement);

            return postLinkFn;
          } else {
            // return link function that requests template and modifies result
            return function asyncPostLink(scope, element, attrs, $select) {

              prePostLinkFn.call(null, arguments)
              uisTemplateRequest(url).then(function(template) {
                var templateElement = angular.element(template);

                templateConfigurationFn(templateElement, element, tAttrs);
                
                $compile(templateElement)(scope);

                element.append(templateElement);

                postLinkFn(scope, element, attrs, $select);
              });
            };
          }
        } 
      }

      return asyncCompilationFactory;
    }]
  );


