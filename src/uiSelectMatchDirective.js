uis.directive('uiSelectMatch', 
['uiSelectConfig', '$templateCache', 'uisTemplateRequest', 
  function(uiSelectConfig, $templateCache, uisTemplateRequest) {

  return {
    restrict: 'EA',
    require: '^uiSelect',
    replace: true,
    compile: function(tElement, tAttrs) {
      
      // Get theme attribute from parent (ui-select)
      var parent = tElement.parent().parent();
      var theme = tAttrs.theme;
      var multi = angular.isDefined(getAttribute(parent, 'multiple'));
      
      // Empty everything and save for use later
      var originalContent = angular.element('<div>').append(tElement.contents());
      tElement.empty();

      var templateUrl = theme + (multi ? '/match-multiple.tpl.html' : '/match.tpl.html');

      if(angular.isDefined($templateCache.get(templateUrl))) {
        // modify template and return normal link function
        var templateElement = angular.element($templateCache.get(templateUrl));
        
        configureTemplate(templateElement, originalContent);
        
        tElement.append(templateElement);

        return postLink;
      } else {
        // return link function that requests template and modifies result
        return asyncPostLink;
      }
    
      function configureTemplate(template, contents) {
        template.querySelectorAll('.ui-select-match-item').append(contents);
      }

      function asyncPostLink(scope, element, attrs, $select) {
        uisTemplateRequest(templateUrl).then(function(template) {
          var templateElement = angular.element(template);

          configureTemplate(templateElement, originalContent);
          
          $compile(templateElement)(scope);

          element.append(templateElement);

          postLink(scope, element, attrs, $select);
        });
      }

      function postLink(scope, element, attrs, $select) {
        $select.lockChoiceExpression = attrs.uiLockChoice;
        attrs.$observe('placeholder', function(placeholder) {
          $select.placeholder = placeholder !== undefined ? placeholder : uiSelectConfig.placeholder;
        });

        function setAllowClear(allow) {
          $select.allowClear = (angular.isDefined(allow)) ? (allow === '') ? true : (allow.toLowerCase() === 'true') : false;
        }

        attrs.$observe('allowClear', setAllowClear);
        setAllowClear(attrs.allowClear);

        if($select.multiple){
          $select.sizeSearchInput();
        }
      }
    }
  };

  function getAttribute(elem, attribute) {
    if (elem[0].hasAttribute(attribute))
      return elem.attr(attribute);

    if (elem[0].hasAttribute('data-' + attribute))
      return elem.attr('data-' + attribute);

    if (elem[0].hasAttribute('x-' + attribute))
      return elem.attr('x-' + attribute);
  }
}]);
