uis.directive('uiSelectChoices',
  ['uiSelectConfig', 'uisRepeatParser', 'uiSelectMinErr', '$compile', '$window', '$templateCache', '$templateRequest',
  function(uiSelectConfig, RepeatParser, uiSelectMinErr, $compile, $window, $templateCache, $templateRequest) {

  return {
    restrict: 'EA',
    require: '^uiSelect',
    replace: true,
    compile: function(tElement, tAttrs) {

      if (!tAttrs.repeat) throw uiSelectMinErr('repeat', "Expected 'repeat' expression.");

      var groupByExp = tAttrs.groupBy;
      var groupFilterExp = tAttrs.groupFilter;
      var parserResult = RepeatParser.parse(tAttrs.repeat);

      var originalContent = angular.element('<div>').append(tElement.contents());
      // Avoid compiling contents as its actually the ng-repeat content      
      tElement.empty();

      var theme = tAttrs.theme;
      var templateUrl = theme + '/choices.tpl.html';
      
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

      function asyncPostLink(scope, element, attrs, $select) {
        uisTemplateRequest(templateUrl).then(function(template) {
          var templateElement = angular.element(template);

          configureTemplate(templateElement, originalContent);
          
          $compile(templateElement)(scope);

          element.append(templateElement);

          postLink(scope, element, attrs, $select);
        });
      }

      function configureTemplate(element, newContents) {   

        if (groupByExp) {
          var groups = element.querySelectorAll('.ui-select-choices-group');
          if (groups.length !== 1) throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-group but got '{0}'.", groups.length);
          groups.attr('ng-repeat', RepeatParser.getGroupNgRepeatExpression());
        }

        var choices = element.querySelectorAll('.ui-select-choices-row');
        if (choices.length !== 1) {
          throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row but got '{0}'.", choices.length);
        }

        choices.attr('ng-repeat', parserResult.repeatExpression(groupByExp));// .attr('ng-if', '$select.open'); //Prevent unnecessary watches when dropdown is closed
      
        var rowsInner = element.querySelectorAll('.ui-select-choices-row-inner');
        if (rowsInner.length !== 1) {
          throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row-inner but got '{0}'.", rowsInner.length);
        }
        rowsInner.append(newContents.contents());
        //rowsInner.attr('uis-transclude-append', ''); //Adding uisTranscludeAppend directive to row element after choices element has ngRepeat

        // If IE8 then need to target rowsInner to apply the ng-click attr as choices will not capture the event. 
        var clickTarget = $window.document.addEventListener ? choices : rowsInner;
        clickTarget.attr('ng-click', '$select.select(' + parserResult.itemName + ',$select.skipFocusser,$event)');
      }

      function postLink(scope, element, attrs, $select) {

        $select.parseRepeatAttr(attrs.repeat, groupByExp, groupFilterExp); //Result ready at $select.parserResult

        $select.disableChoiceExpression = attrs.uiDisableChoice;
        $select.onHighlightCallback = attrs.onHighlight;

        $select.dropdownPosition = attrs.position ? attrs.position.toLowerCase() : uiSelectConfig.dropdownPosition;        

        scope.$on('$destroy', function() {
          choices.remove();
        });

        scope.$watch('$select.search', function(newValue) {
          if(newValue && !$select.open && $select.multiple) $select.activate(false, true);
          $select.activeIndex = $select.tagging.isActivated ? -1 : 0;
          if (!attrs.minimumInputLength || $select.search.length >= attrs.minimumInputLength) {
            $select.refresh(attrs.refresh);
          } else {
            $select.items = [];
          }
        });
        
        // var transcluded = angular.element('<div>');// $select.transcluded();
        
        // var transcludedHeader = transcluded.querySelectorAll('.ui-select-header');
        // var transcludedFooter = transcluded.querySelectorAll('.ui-select-footer');
    
        // if((transcludedHeader && transcludedHeader.length)) {
        //   transcludedHeader.removeAttr('ng-transclude'); // Content has already been transcluded
        //   element.prepend(transcludedHeader);
        // }
        
        // if(transcludedFooter && transcludedFooter.length){
        //   transcludedFooter.removeAttr('ng-transclude');
        //   element.append(transcludedFooter);
        // }
        
        attrs.$observe('refreshDelay', function() {
          // $eval() is needed otherwise we get a string instead of a number
          var refreshDelay = scope.$eval(attrs.refreshDelay);
          $select.refreshDelay = refreshDelay !== undefined ? refreshDelay : uiSelectConfig.refreshDelay;
        });
      }
    }
  };
}]);
